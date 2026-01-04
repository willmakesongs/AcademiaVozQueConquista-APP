
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { VOCALIZES, MODULES } from '../constants';

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
    activeUrl: string | null;
    isOfflineMode: boolean;
    setOfflineMode: (enabled: boolean) => void;
    downloadProgress: number;
    downloadAll: () => Promise<void>;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeUrl, setActiveUrl] = useState<string | null>(null);
    const [isOfflineMode, setOfflineMode] = useState(() => localStorage.getItem('offline_mode') === 'true');
    const [downloadProgress, setDownloadProgress] = useState(0);

    const buffersRef = useRef<Tone.ToneAudioBuffers>(new Tone.ToneAudioBuffers());
    const playerRef = useRef<Tone.Player | null>(null);
    const progressIntervalRef = useRef<number | null>(null);
    const currentPitchRef = useRef(0);
    const silentAudioRef = useRef<HTMLAudioElement | null>(null);

    // Save offline mode preference
    useEffect(() => {
        localStorage.setItem('offline_mode', isOfflineMode.toString());
    }, [isOfflineMode]);

    // iOS Audio Unlock Trick (v5): Force Media Session to bypass physical silent switch
    const unlockIOSAudio = useCallback(async () => {
        try {
            // 1. Start Tone.js context
            if (Tone.context.state !== 'running') {
                await Tone.start();
                console.log('Tone.js context started');
            }

            // 2. Play silent audio to force media session (ignores physical silent switch)
            if (!silentAudioRef.current) {
                const audio = new Audio();
                audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAZGFzaABUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAAGNvbXBhdGlibGVfYnJhbmRzAGlzbzZtcDQxAFRTU0UAAAAPAAADTGF2ZjU3LjcxLjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZyAAAADBAAAADwAAAhYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//uQZAAAK8f9AFAAAAByEAD+AAAAE0InQAAEAACvSCAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAK8f9AFAAAAByEAD+AAAAE0InQAAEAACvSCAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAK8f9AFAAAAByEAD+AAAAE0InQAAEAACvSCAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
                audio.setAttribute('playsinline', 'true');
                audio.loop = true;
                audio.volume = 0.01; // Minimum volume to count as media but audible only to dogs
                audio.muted = false; // MUST be unmuted to bypass silent switch
                document.body.appendChild(audio);
                silentAudioRef.current = audio;
            }

            const playPromise = silentAudioRef.current.play();
            if (playPromise !== undefined) {
                await playPromise.catch(e => console.warn('Silent play failed:', e));
            }
        } catch (e) {
            console.error('iOS Unlock Error:', e);
        }
    }, []);

    // Monitor context state and resume if suspended/interrupted
    useEffect(() => {
        const handleStateChange = () => {
            console.log('Tone.js context state:', Tone.context.state);
            if (Tone.context.state === 'suspended' || Tone.context.state === 'interrupted') {
                // If it was interrupted (phone call, etc) or suspended (locked screen),
                // we'll try to resume on the next interaction
                console.warn('Audio context suspended/interrupted');
            }
        };

        Tone.context.on('statechange', handleStateChange);

        const resume = async () => {
            await unlockIOSAudio();
            console.log('Context resumed via user interaction');
        };

        window.addEventListener('click', resume, { once: true });
        window.addEventListener('touchstart', resume, { once: true });
        window.addEventListener('keydown', resume, { once: true });

        return () => {
            Tone.context.off('statechange', handleStateChange);
            window.removeEventListener('click', resume);
            window.removeEventListener('touchstart', resume);
            window.removeEventListener('keydown', resume);
        };
    }, [unlockIOSAudio]);

    const isLoaded = useCallback((url: string) => {
        return buffersRef.current.has(url);
    }, []);

    const preload = useCallback(async (urls: string[]) => {
        const newUrls = urls.filter(url => url && !buffersRef.current.has(url));
        if (newUrls.length === 0) return;

        setIsLoading(true);
        try {
            await Promise.all(newUrls.map(async (url) => {
                let loadUrl = url;
                try {
                    if ('caches' in window) {
                        const cache = await caches.open('vocalizes-offline-v1');
                        const cachedResponse = await cache.match(url);
                        if (cachedResponse) {
                            const blob = await cachedResponse.blob();
                            loadUrl = URL.createObjectURL(blob);
                        } else if (isOfflineMode) {
                            // If offline mode is on but not in cache, fetch and cache it
                            const response = await fetch(url);
                            await cache.put(url, response.clone());
                            const blob = await response.blob();
                            loadUrl = URL.createObjectURL(blob);
                        }
                    }
                } catch (e) { }

                return new Promise<void>((resolve) => {
                    const buffer = new Tone.ToneAudioBuffer(loadUrl, () => {
                        buffersRef.current.add(url, buffer);
                        resolve();
                    }, (err) => {
                        console.warn(`Failed to preload ${url}:`, err);
                        resolve();
                    });
                });
            }));
        } finally {
            setIsLoading(false);
        }
    }, [isOfflineMode]);

    const downloadAll = useCallback(async () => {
        setIsLoading(true);
        setDownloadProgress(0);
        try {
            const urls: string[] = [];
            // Collect all unique URLs from vocalizes
            VOCALIZES.forEach(v => {
                if (v.audioUrl) urls.push(v.audioUrl);
                if (v.audioUrlMale) urls.push(v.audioUrlMale);
                if (v.exampleUrl) urls.push(v.exampleUrl);
            });

            // Collect URLs from module topics content
            MODULES.forEach(m => {
                m.topics.forEach(t => {
                    const matches = t.content.matchAll(/data-src="([^"]+)"/g);
                    for (const match of matches) {
                        urls.push(match[1]);
                    }
                });
            });

            const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
            const total = uniqueUrls.length;
            let count = 0;

            if ('caches' in window) {
                const cache = await caches.open('vocalizes-offline-v1');
                for (const url of uniqueUrls) {
                    try {
                        const match = await cache.match(url);
                        if (!match) {
                            await cache.add(url);
                        }
                    } catch (e) {
                        console.warn(`Failed to cache ${url}:`, e);
                    }
                    count++;
                    setDownloadProgress(Math.round((count / total) * 100));
                }
            }
        } finally {
            setIsLoading(false);
            setDownloadProgress(100);
            setTimeout(() => setDownloadProgress(0), 3000);
        }
    }, []);

    const stop = useCallback(() => {
        if (Tone.Transport.state === 'started') {
            Tone.Transport.stop();
        }
        if (playerRef.current) {
            playerRef.current.stop();
        }
        setIsPlaying(false);
        setCurrentTime(0);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const pause = useCallback(() => {
        Tone.Transport.pause();
        setIsPlaying(false);
    }, []);

    const resume = useCallback(async () => {
        await unlockIOSAudio();
        await Tone.start();
        Tone.Transport.start();
        setIsPlaying(true);
    }, [unlockIOSAudio]);

    const startProgressLoop = useCallback(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = window.setInterval(() => {
            setCurrentTime(Tone.Transport.seconds);
            if (duration > 0 && Tone.Transport.seconds >= duration) {
                stop();
            }
        }, 100);
    }, [duration, stop]);

    const play = useCallback(async (url: string, options?: { pitch?: number, onEnded?: () => void }) => {
        if (!url) return;

        // If same URL and paused, just resume
        if (activeUrl === url && !isPlaying && playerRef.current) {
            await resume();
            return;
        }

        stop();
        setActiveUrl(url);

        const hasBuffer = buffersRef.current.has(url);
        if (!hasBuffer) {
            setIsLoading(true);
        }

        try {
            // CRITICAL: Call these FIRST in the user event handler
            // Do not put these inside if/else if they might be skipped
            await unlockIOSAudio();
            await Tone.start();

            let buffer;
            if (buffersRef.current.has(url)) {
                buffer = buffersRef.current.get(url);
            } else {
                let loadUrl = url;
                try {
                    if ('caches' in window) {
                        const cache = await caches.open('vocalizes-offline-v1');
                        const cachedResponse = await cache.match(url);
                        if (cachedResponse) {
                            const blob = await cachedResponse.blob();
                            loadUrl = URL.createObjectURL(blob);
                            console.log('Using cached audio for:', url);
                        }
                    }
                } catch (e) { }

                buffer = await new Promise<Tone.ToneAudioBuffer>((resolve, reject) => {
                    const b = new Tone.ToneAudioBuffer(loadUrl, () => resolve(b), reject);
                });
                buffersRef.current.add(url, buffer);
            }

            if (!playerRef.current) {
                playerRef.current = new Tone.Player().toDestination();
            }

            playerRef.current.buffer = buffer;
            playerRef.current.sync().start(0);

            const bDuration = buffer.duration;
            setDuration(bDuration);

            if (options?.pitch !== undefined) {
                currentPitchRef.current = options.pitch;
                playerRef.current.playbackRate = Math.pow(2, options.pitch / 12);
            }

            Tone.Transport.start();
            setIsPlaying(true);
            startProgressLoop();

            playerRef.current.onstop = () => {
                if (options?.onEnded) options.onEnded();
            };

        } catch (e) {
            console.error("Playback error:", e);
        } finally {
            setIsLoading(false);
        }
    }, [activeUrl, isPlaying, resume, stop, startProgressLoop]);

    const seek = useCallback((time: number) => {
        Tone.Transport.seconds = time;
        setCurrentTime(time);
    }, []);

    const setPitch = useCallback((pitch: number) => {
        currentPitchRef.current = pitch;
        if (playerRef.current) {
            playerRef.current.playbackRate = Math.pow(2, pitch / 12);
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
    if (context === undefined) {
        throw new Error('usePlayback must be used within a PlaybackProvider');
    }
    return context;
};
