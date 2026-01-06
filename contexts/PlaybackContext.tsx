
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { VOCALIZES, MODULES, DISABLE_ALL_PLAYERS } from '../constants';
import { useAuth } from './AuthContext';

interface PlaybackContextType {
    preload: (urls: string[]) => Promise<void>;
    play: (url: string, options?: { pitch?: number, onEnded?: () => void }) => Promise<void>;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    isPlaying: boolean;
    isLoaded: (url: string) => boolean;
    isLoading: boolean;
    currentTime: number;
    duration: number;
    seek: (time: number) => void;
    setPitch: (pitch: number) => void;
    pitch: number;
    activeUrl: string | null;
    isOfflineMode: boolean;
    setOfflineMode: (enabled: boolean) => void;
    downloadProgress: number;
    downloadAll: () => Promise<void>;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeUrl, setActiveUrl] = useState<string | null>(null);
    const [isOfflineMode, setIsOfflineMode] = useState(() => localStorage.getItem('offline_mode') === 'true');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [pitch, setPitchState] = useState(0);

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const onEndedRef = useRef<(() => void) | null>(null);
    const cachedUrlsRef = useRef<Set<string>>(new Set());

    // Initialize Audio Element
    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'auto'; // Try to load metadata/data automatically
        (audio as any).playsInline = true; // Important for iOS

        // Event Listeners
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration || 0);
        const handleEnded = () => {
            setIsPlaying(false);
            if (onEndedRef.current) onEndedRef.current();
        };
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleError = (e: Event) => {
            console.error("Audio Error:", audio.error, e);
            setIsLoading(false);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audioRef.current = null;
        };
    }, []);

    // Persist Offline Mode
    useEffect(() => {
        localStorage.setItem('offline_mode', isOfflineMode.toString());
    }, [isOfflineMode]);

    const isAudioBlocked = useCallback(() => {
        if (!DISABLE_ALL_PLAYERS) return false;
        if (!user || !user.email) return true;
        const adminEmails = ['lorenapimenteloficial@gmail.com', 'willmakesongs@gmail.com'];
        return !adminEmails.includes(user.email.toLowerCase());
    }, [user]);

    const setOfflineMode = useCallback((enabled: boolean) => {
        setIsOfflineMode(enabled);
    }, []);

    const isLoaded = useCallback((url: string) => {
        return cachedUrlsRef.current.has(url);
    }, []);

    const preload = useCallback(async (urls: string[]) => {
        if (!('caches' in window)) return;

        try {
            const cache = await caches.open('vocalizes-offline-v1');
            const uniqueUrls = urls.filter(Boolean);

            await Promise.all(uniqueUrls.map(async (url) => {
                try {
                    const match = await cache.match(url);
                    if (!match) {
                        await cache.add(url);
                    }
                    cachedUrlsRef.current.add(url);
                } catch (e) {
                    console.warn(`Failed to preload ${url}`, e);
                }
            }));
        } catch (e) {
            console.warn("Preload error:", e);
        }
    }, []);

    const getAudioSrc = async (url: string): Promise<string> => {
        // 1. Check Cache
        if ('caches' in window) {
            try {
                const cache = await caches.open('vocalizes-offline-v1');
                const cachedResponse = await cache.match(url);
                if (cachedResponse) {
                    const blob = await cachedResponse.blob();
                    return URL.createObjectURL(blob);
                }
            } catch (e) {
                console.warn("Cache lookup error:", e);
            }
        }

        // 2. Return URL directly (Stream)
        return url;
    };

    const play = useCallback(async (url: string, options?: { pitch?: number, onEnded?: () => void }) => {
        if (isAudioBlocked()) return;

        const audio = audioRef.current;
        if (!audio) return;

        // Save callback
        onEndedRef.current = options?.onEnded || null;

        // Logic
        try {
            // Check if same URL
            const isSameUrl = activeUrl === url;

            if (isSameUrl) {
                if (audio.paused) {
                    await audio.play();
                    setIsPlaying(true);
                } else {
                    audio.currentTime = 0;
                    if (options?.pitch !== undefined) setPitch(options.pitch);
                }
            } else {
                // New URL
                setIsLoading(true); // Optimistic UI
                setActiveUrl(url);

                const src = await getAudioSrc(url);

                // If we created a NEW ObjectURL, we rely on the browser to clean it up eventually or we'd need to track it.
                // For simplicity/performance in this app, we're letting it be (or strict management would remove it on next load).
                // Actually, HTML5 audio handles URLs well.

                audio.src = src;

                // Pitch
                const p = options?.pitch ?? 0;
                setPitchState(p);
                // HTML5 Audio playbackRate (preservesPitch = false to mimick generic pitch shift if desired,
                // but usually users want time-stretching.
                // The PREVIOUS implementation used Tone.js playbackRate which changes BOTH pitch and speed (Speed up = chipmunk).
                // To replicate that:
                audio.playbackRate = Math.pow(2, p / 12);
                // "preservesPitch" is true by default on some browsers, false on others.
                // If we want "Chipmunk effect" (Classic sampler behavior), we must set preservesPitch = false.
                if (audio.preservesPitch !== undefined) {
                    audio.preservesPitch = false;
                } else if ('mozPreservesPitch' in audio) {
                    (audio as any).mozPreservesPitch = false;
                } else if ('webkitPreservesPitch' in audio) {
                    (audio as any).webkitPreservesPitch = false;
                }

                await audio.play();
                setIsPlaying(true);

                // Media Session
                if ('mediaSession' in navigator) {
                    const vocalize = VOCALIZES.find(v => v.audioUrl === url || v.audioUrlMale === url || v.exampleUrl === url);
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: vocalize?.title || 'Exercício Vocal',
                        artist: 'Academia Voz Que Conquista',
                        album: vocalize?.category || 'Treinamento',
                        artwork: [
                            { src: 'https://vocalizes.com.br/wp-content/uploads/2023/12/logo-academia-vocal.png', sizes: '512x512', type: 'image/png' }
                        ]
                    });

                    navigator.mediaSession.setActionHandler('play', () => audio.play());
                    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
                    navigator.mediaSession.setActionHandler('seekbackward', () => { audio.currentTime = Math.max(0, audio.currentTime - 5); });
                    navigator.mediaSession.setActionHandler('seekforward', () => { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); });
                }
            }

        } catch (e) {
            console.error("Play failed:", e);
            setIsPlaying(false);
            setIsLoading(false);
        }
    }, [activeUrl, isAudioBlocked]);

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTime(0);
    }, []);

    const pause = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
        }
        setIsPlaying(false);
    }, []);

    const resume = useCallback(() => {
        const audio = audioRef.current;
        if (audio && audio.src) {
            audio.play().catch(console.error);
            setIsPlaying(true);
        }
    }, []);

    const seek = useCallback((time: number) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const setPitch = useCallback((p: number) => {
        setPitchState(p);
        const audio = audioRef.current;
        if (audio) {
            audio.playbackRate = Math.pow(2, p / 12);
        }
    }, []);

    const downloadAll = useCallback(async () => {
        setIsLoading(true);
        setDownloadProgress(0);
        try {
            const urls: string[] = [];
            VOCALIZES.forEach(v => {
                if (v.audioUrl) urls.push(v.audioUrl);
                if (v.audioUrlMale) urls.push(v.audioUrlMale);
                if (v.exampleUrl) urls.push(v.exampleUrl);
            });
            MODULES.forEach(m => {
                m.topics.forEach(t => {
                    const matches = t.content.matchAll(/data-src="([^"]+)"/g);
                    for (const match of matches) {
                        urls.push(match[1]);
                    }
                });
            });

            const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
            if ('caches' in window) {
                const cache = await caches.open('vocalizes-offline-v1');
                let count = 0;
                for (const url of uniqueUrls) {
                    try {
                        const match = await cache.match(url);
                        if (!match) await cache.add(url);
                        cachedUrlsRef.current.add(url);
                    } catch (e) { }
                    count++;
                    setDownloadProgress(Math.round((count / uniqueUrls.length) * 100));
                }
            }
        } finally {
            setIsLoading(false);
            setDownloadProgress(100);
            setTimeout(() => setDownloadProgress(0), 3000);
        }
    }, []);

    return (
        <PlaybackContext.Provider value={{
            preload,
            play,
            stop,
            pause,
            resume,
            isPlaying,
            isLoaded,
            isLoading,
            currentTime,
            duration,
            seek,
            setPitch,
            pitch,
            activeUrl,
            isOfflineMode,
            setOfflineMode,
            downloadProgress,
            downloadAll
        }}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => {
    const context = useContext(PlaybackContext);
    if (!context) throw new Error("usePlayback must be used within PlaybackProvider");
    return context;
};
