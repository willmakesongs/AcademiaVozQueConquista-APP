
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

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
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeUrl, setActiveUrl] = useState<string | null>(null);

    const buffersRef = useRef<Tone.ToneAudioBuffers>(new Tone.ToneAudioBuffers());
    const playerRef = useRef<Tone.Player | null>(null);
    const progressIntervalRef = useRef<number | null>(null);
    const currentPitchRef = useRef(0);
    const silentAudioRef = useRef<HTMLAudioElement | null>(null);

    // iOS Audio Unlock Trick (v3): More aggressive bypass
    const unlockIOSAudio = useCallback(() => {
        if (!silentAudioRef.current) {
            const audio = new Audio();
            // 1-second silent MP3
            audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAZGFzaABUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAAGNvbXBhdGlibGVfYnJhbmRzAGlzbzZtcDQxAFRTU0UAAAAPAAADTGF2ZjU3LjcxLjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZyAAAADBAAAADwAAAhYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//uQZAAAK8f9AFAAAAByEAD+AAAAE0InQAAEAACvSCAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAK8f9AFAAAAByEAD+AAAAE0InQAAEAACvSCAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAK8f9AFAAAAByEAD+AAAAE0InQAAEAACvSCAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
            audio.setAttribute('playsinline', 'true');
            audio.loop = true;
            audio.volume = 0.1; // Essential for some iOS versions to "count" as media

            // Append to DOM to make it a "real" media session
            audio.style.display = 'none';
            document.body.appendChild(audio);

            silentAudioRef.current = audio;
        }

        const playPromise = silentAudioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Ignore initial failures
            });
        }
    }, []);

    // Resume context on first user interaction
    useEffect(() => {
        const resume = async () => {
            unlockIOSAudio();
            await Tone.start();
            console.log('Tone.js started via user interaction');
        };
        window.addEventListener('click', resume, { once: true });
        window.addEventListener('touchstart', resume, { once: true });
        return () => {
            window.removeEventListener('click', resume);
            window.removeEventListener('touchstart', resume);
        };
    }, []);

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
                // Try cache first
                try {
                    if ('caches' in window) {
                        const cache = await caches.open('vocalizes-offline-v1');
                        const cachedResponse = await cache.match(url);
                        if (cachedResponse) {
                            const blob = await cachedResponse.blob();
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
        unlockIOSAudio();
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
        setIsLoading(true);

        try {
            unlockIOSAudio();
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
            activeUrl
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
