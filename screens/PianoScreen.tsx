import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface Props {
    onBack: () => void;
    embedded?: boolean;
    onPlayNote?: (note: string, freq: number) => void;
    onStopNote?: () => void;
}

const NOTE_FREQUENCIES: Record<string, number> = {
    'Pt-BR': 440, // Base reference
};

// --- AUDIO HELPERS ---

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function autoCorrelate(buf: Float32Array, sampleRate: number) {
    let SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        const val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // Lowered noise gate from 0.03 to 0.01

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE - i; j++) {
            c[i] = c[i] + buf[j] * buf[j + i];
        }
        if (SIZE - i > 0) {
            c[i] = c[i] / (SIZE - i);
        }
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;

    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

const getFrequency = (note: string): number => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = parseInt(note.slice(-1));
    const noteName = note.slice(0, -1);
    const semitonesFromA4 = (octave - 4) * 12 + notes.indexOf(noteName) - notes.indexOf("A");
    return 440 * Math.pow(2, semitonesFromA4 / 12);
};

// Range C2 to C7
const OCTAVES = [2, 3, 4, 5, 6];
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const PianoScreen: React.FC<Props> = ({ onBack, embedded, onPlayNote, onStopNote }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeNote, setActiveNote] = useState<{ note: string, freq: number } | null>(null);

    // Voice Mode State - Always Active
    const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [sungFreq, setSungFreq] = useState(0);
    const [feedbackStatus, setFeedbackStatus] = useState<'neutral' | 'silence' | 'success' | 'low' | 'high'>('silence');
    const [stabilityCounter, setStabilityCounter] = useState(0);

    const samplerRef = useRef<Tone.Sampler | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Audio Analysis Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // Initialize Audio & Mic
    useEffect(() => {
        const sampler = new Tone.Sampler({
            urls: {
                "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", "A1": "A1.mp3",
                "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", "A2": "A2.mp3",
                "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", "A3": "A3.mp3",
                "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3",
                "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", "A5": "A5.mp3",
                "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3", "A6": "A6.mp3",
                "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", "A7": "A7.mp3", "C8": "C8.mp3"
            },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => {
                setIsLoaded(true);
                if (scrollContainerRef.current) {
                    const scrollWidth = scrollContainerRef.current.scrollWidth;
                    scrollContainerRef.current.scrollLeft = scrollWidth * 0.4;
                }
            }
        }).toDestination();

        samplerRef.current = sampler;

        // Auto-start Mic
        startMic();

        return () => {
            sampler.dispose();
            stopMic();
        };
    }, []);

    // --- MIC LOGIC ---
    const startMic = async () => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
                const audioCtx = new AudioContextClass();
                audioContextRef.current = audioCtx;

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = audioCtx.createMediaStreamSource(stream);
                sourceRef.current = source;

                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 4096;
                analyser.smoothingTimeConstant = 0.8; // Smooth out jitter
                source.connect(analyser);
                analyserRef.current = analyser;

                setMicPermission('granted');
                updatePitch();
            } else {
                console.error("GetUserMedia not supported");
                setMicPermission('denied');
            }
        } catch (err) {
            console.error("Mic Error:", err);
            setMicPermission('denied');
        }
    };

    const stopMic = () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (sourceRef.current) {
            sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
            sourceRef.current.disconnect();
        }
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };

    const updatePitch = () => {
        if (!analyserRef.current || !audioContextRef.current) return;

        // Ensure AudioContext is running (sometimes it suspends automatically)
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        const buf = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, audioContextRef.current.sampleRate);

        // Only process if freq is valid and in reasonable singing range (50Hz - 1400Hz)
        if (freq !== -1 && freq > 50 && freq < 1400) {
            setSungFreq(freq);

            // Compare with active note if exists
            if (activeNote) {
                const idealFreq = activeNote.freq;
                // Calculate cents difference: 1200 * log2(f1 / f2)
                const cents = 1200 * Math.log2(freq / idealFreq);

                // Pedagogical Logic with increased tolerance
                // Goal: "Limit possible" -> +/- 45 cents (almost a quarter tone allowed, very generous)
                const tolerance = 45;

                if (Math.abs(cents) <= tolerance) {
                    setStabilityCounter(prev => prev + 1);
                    // Faster positive feedback: 5 frames (~100ms)
                    if (stabilityCounter > 5) {
                        setFeedbackStatus('success');
                    }
                } else if (cents < -tolerance) {
                    setStabilityCounter(0);
                    setFeedbackStatus('low');
                } else if (cents > tolerance) {
                    setStabilityCounter(0);
                    setFeedbackStatus('high');
                }
            } else {
                // No active note selected
                setFeedbackStatus('silence');
                setStabilityCounter(0);
            }
        } else {
            // No sound detected
            setFeedbackStatus('silence');
            setStabilityCounter(0);
            setSungFreq(0);
        }

        rafIdRef.current = requestAnimationFrame(updatePitch);
    };

    const playNote = async (note: string) => {
        if (!samplerRef.current || !isLoaded) return;

        await Tone.start();
        if (Tone.context.state !== 'running') await Tone.context.resume();

        // Also try to resume Mic AudioContext if needed
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        samplerRef.current.triggerAttack(note);
        const newFreq = parseFloat(getFrequency(note).toFixed(2));
        setActiveNote({ note, freq: newFreq });

        // Callback for embedded mode
        if (onPlayNote) {
            onPlayNote(note, newFreq);
        }

        // Reset comparisons when new note is played
        setStabilityCounter(0);
        setFeedbackStatus('silence');
    };

    const stopNote = (note: string) => {
        if (samplerRef.current && isLoaded) {
            samplerRef.current.triggerRelease(note);
        }

        // Keeps active note for reference while singing
        // But if user wants to stop via callback:
        if (onStopNote) {
            onStopNote();
        }
    };

    // Generate Key List (Flat array for rendering)
    const renderKeys = () => {
        const keys: React.ReactNode[] = [];

        OCTAVES.forEach(octave => {
            NOTES.forEach(noteName => {
                if (noteName.includes('#')) return;

                const fullNote = `${noteName}${octave}`;
                const hasSharp = ['C', 'D', 'F', 'G', 'A'].includes(noteName);
                const sharpNote = `${noteName}#${octave}`;

                keys.push(
                    <div key={fullNote} className="relative flex-shrink-0 select-none">
                        {/* White Key */}
                        <button
                            onMouseDown={() => playNote(fullNote)}
                            onMouseUp={() => stopNote(fullNote)}
                            onMouseLeave={() => stopNote(fullNote)}
                            onTouchStart={(e) => { e.preventDefault(); playNote(fullNote); }}
                            onTouchEnd={(e) => { e.preventDefault(); stopNote(fullNote); }}
                            className={`
                                w-14 h-48 sm:w-16 sm:h-56
                                bg-white border-l border-b border-r border-[#E2E8F0]
                                rounded-b-lg
                                active:bg-gray-200 active:scale-[0.99] active:shadow-inner
                                transition-all duration-75
                                flex items-end justify-center pb-4
                                z-10 relative
                                shadow-[0_4px_0_0_rgba(180,180,180,1)]
                                active:translate-y-[2px] active:shadow-none
                                ${activeNote?.note === fullNote ? '!bg-blue-50 !shadow-none !translate-y-[2px]' : ''}
                            `}
                        >
                            <span className="text-gray-400 font-bold text-xs">{fullNote}</span>
                        </button>

                        {/* Black Key (if exists) */}
                        {hasSharp && (
                            <button
                                onMouseDown={(e) => { e.stopPropagation(); playNote(sharpNote); }}
                                onMouseUp={(e) => { e.stopPropagation(); stopNote(sharpNote); }}
                                onMouseLeave={(e) => { e.stopPropagation(); stopNote(sharpNote); }}
                                onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); playNote(sharpNote); }}
                                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); stopNote(sharpNote); }}
                                className={`
                                    absolute -right-4 top-0
                                    w-8 h-32 sm:w-10 sm:h-36
                                    bg-[#151A23] border border-gray-900
                                    rounded-b-lg
                                    z-20
                                    shadow-[0_4px_0_4px_rgba(0,0,0,0.3)]
                                    active:shadow-none active:translate-y-[2px]
                                    active:bg-gray-900
                                    ${activeNote?.note === sharpNote ? '!bg-[#FF00BC] !shadow-none !translate-y-[2px]' : 'bg-gradient-to-b from-black to-gray-900'}
                                `}
                            >
                            </button>
                        )}
                    </div>
                );
            });
        });

        return keys;
    };

    return (
        <div className={`flex flex-col ${embedded ? 'w-full bg-[#101622] pt-4 pb-0' : 'min-h-screen bg-[#101622] animate-in fade-in duration-300'}`}>
            {/* Header - HIDDEN IF EMBEDDED */}
            {!embedded && (
                <div className="pt-8 px-6 pb-4 flex items-center gap-4 z-10 bg-gradient-to-b from-[#101622] to-transparent">
                    <button
                        onClick={() => {
                            stopMic();
                            // Safely stop audio context if needed
                            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                                audioContextRef.current.close();
                            }
                            onBack();
                        }}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/5"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="font-bold text-white text-lg leading-tight">Piano Virtual</h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${micPermission === 'granted' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                {micPermission === 'granted' ? 'Ouvindo Voz' : 'Sem Acesso ao Mic'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Display Area - HIDDEN IF EMBEDDED */}
            {!embedded && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#151A23] to-[#101622] relative overflow-hidden">

                    {/* Background Feedback Color */}
                    <div className={`absolute inset-0 transition-opacity duration-500
                        ${feedbackStatus === 'success' ? 'bg-green-500/10' : ''}
                        ${feedbackStatus === 'low' ? 'bg-yellow-500/5' : ''}
                        ${feedbackStatus === 'high' ? 'bg-yellow-500/5' : ''}
                    `}></div>

                    <div className={`transition-all duration-200 transform z-10 
                        ${activeNote ? 'scale-100 opacity-100' : 'scale-95 opacity-50 grayscale'}
                    `}>
                        {/* Note Name Big */}
                        <div className={`text-[100px] sm:text-[120px] font-black leading-none drop-shadow-lg font-sans tracking-tighter transition-colors duration-300
                            ${feedbackStatus === 'success' ? 'text-green-400' : 'text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400'}
                        `}>
                            {activeNote ? activeNote.note.replace(/[0-9]/g, '') : '-'}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                            <div className="px-4 py-1 rounded-full bg-white/10 border border-white/10 text-white font-bold text-xl backdrop-blur-md">
                                {activeNote ? activeNote.note.slice(-1) : '-'} <span className="text-xs text-gray-500 uppercase ml-1">Oitava</span>
                            </div>

                            <div className="px-4 py-1 rounded-full bg-[#0081FF]/20 border border-[#0081FF]/30 text-[#0081FF] font-bold text-xl backdrop-blur-md font-mono">
                                {activeNote ? `${activeNote.freq} Hz` : '- Hz'}
                            </div>
                        </div>

                        {/* PEDAGOGICAL FEEDBACK AREA */}
                        <div className="h-24 mt-8 flex flex-col items-center justify-center">
                            {activeNote ? (
                                <>
                                    {feedbackStatus === 'silence' && (
                                        <div className="text-gray-500 flex flex-col items-center animate-pulse">
                                            <span className="material-symbols-rounded text-2xl mb-1 opacity-50">graphic_eq</span>
                                            <p className="text-xs">Toque e cante a nota...</p>
                                        </div>
                                    )}

                                    {feedbackStatus === 'success' && (
                                        <div className="animate-in fade-in slide-in-from-bottom duration-300">
                                            <p className="text-green-400 font-bold text-lg mb-1 flex items-center gap-2">
                                                <span className="material-symbols-rounded">check_circle</span>
                                                Boa! Afinada.
                                            </p>
                                            <p className="text-green-500/60 text-xs">Mantenha essa estabilidade!</p>
                                        </div>
                                    )}

                                    {(feedbackStatus === 'low' || feedbackStatus === 'high') && (
                                        <div className="animate-in fade-in slide-in-from-bottom duration-300">
                                            <p className="text-yellow-400 font-bold text-sm mb-1 flex items-center gap-2">
                                                <span className="material-symbols-rounded">{feedbackStatus === 'low' ? 'arrow_upward' : 'arrow_downward'}</span>
                                                {feedbackStatus === 'low' ? 'Um pouco abaixo' : 'Passou um pouco'}
                                            </p>
                                            <p className="text-gray-400 text-xs">{feedbackStatus === 'low' ? 'Suba levemente a nota.' : 'Relaxe e desça suavemente.'}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-gray-600 flex flex-col items-center">
                                    <p className="text-xs">Selecione uma tecla para começar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Area - Always Visible */}
            <div
                ref={scrollContainerRef}
                className={`
                    ${embedded ? 'h-[280px] bg-[#0d121c] border-t-0 relative overflow-x-auto hide-scrollbar touch-pan-x' : 'h-[280px] sm:h-[320px] bg-[#0d121c] border-t-4 border-[#FF00BC] relative overflow-x-auto hide-scrollbar touch-pan-x shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]'}
                `}
            >
                <div className="flex px-[50vw] h-full pt-10 pb-10 min-w-min">
                    {renderKeys()}
                </div>
                <div className="fixed left-0 bottom-0 w-12 hover:w-0 transition-all pointer-events-none z-30"></div>
            </div>

        </div>
    );
};
