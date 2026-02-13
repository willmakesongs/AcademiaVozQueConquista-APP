import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Volume2, ChevronUp, ChevronDown, Check } from 'lucide-react';
import * as Tone from 'tone';

interface Props {
    onBack: () => void;
}

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const GUITAR_STRINGS = [
    { note: 'E', octave: 2, freq: 82.41, name: '6E', toneNote: 'E2' },
    { note: 'A', octave: 2, freq: 110.00, name: '5A', toneNote: 'A2' },
    { note: 'D', octave: 3, freq: 146.83, name: '4D', toneNote: 'D3' },
    { note: 'G', octave: 3, freq: 196.00, name: '3G', toneNote: 'G3' },
    { note: 'B', octave: 3, freq: 246.94, name: '2B', toneNote: 'B3' },
    { note: 'E', octave: 4, freq: 329.63, name: '1E', toneNote: 'E4' },
];

const TUNED_THRESHOLD = 2;
const SMOOTHING_SAMPLES = 5;

export const GuitarTuner: React.FC<Props> = ({ onBack }) => {
    const [pitchNote, setPitchNote] = useState('-');
    const [cents, setCents] = useState(0);
    const [frequency, setFrequency] = useState(0);
    const [closestString, setClosestString] = useState<string | null>(null);
    const [playingString, setPlayingString] = useState<string | null>(null);
    const [micReady, setMicReady] = useState(false);
    const [showOk, setShowOk] = useState(false);
    const [tuneState, setTuneState] = useState<'flat' | 'sharp' | 'tuned' | 'idle'>('idle');

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const synthRef = useRef<Tone.PluckSynth | null>(null);
    const bellRef = useRef<Tone.Synth | null>(null);
    const bellPlayedRef = useRef(false);
    const centsHistoryRef = useRef<number[]>([]);
    const okTimeoutRef = useRef<number | null>(null);

    const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
        let SIZE = buf.length;
        let rms = 0;
        for (let i = 0; i < SIZE; i++) {
            const val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return -1;

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
    };

    const playBell = useCallback(async () => {
        try {
            await Tone.start();
            if (Tone.context.state !== 'running') await Tone.context.resume();

            if (!bellRef.current) {
                bellRef.current = new Tone.Synth({
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.005, decay: 0.4, sustain: 0, release: 0.3 },
                    volume: -8,
                }).toDestination();
            }
            bellRef.current.triggerAttackRelease('C6', '8n');
        } catch (err) {
            console.error("Bell error:", err);
        }
    }, []);

    const playStringSound = async (str: typeof GUITAR_STRINGS[0]) => {
        try {
            await Tone.start();
            if (Tone.context.state !== 'running') await Tone.context.resume();

            if (!synthRef.current) {
                synthRef.current = new Tone.PluckSynth({
                    attackNoise: 4,
                    dampening: 3500,
                    resonance: 0.97,
                }).toDestination();
            }

            setPlayingString(str.name);
            synthRef.current.triggerAttack(str.toneNote);
            setTimeout(() => setPlayingString(null), 2000);
        } catch (err) {
            console.error("Error playing string:", err);
        }
    };

    const startMic = async () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioCtx;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;
            setMicReady(true);
            updatePitch();
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopMic = () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (sourceRef.current) {
            sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
            sourceRef.current.disconnect();
        }
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        setMicReady(false);
    };

    const getSmoothedCents = (newCent: number): number => {
        centsHistoryRef.current.push(newCent);
        if (centsHistoryRef.current.length > SMOOTHING_SAMPLES) {
            centsHistoryRef.current.shift();
        }
        const sum = centsHistoryRef.current.reduce((a, b) => a + b, 0);
        return sum / centsHistoryRef.current.length;
    };

    const updatePitch = () => {
        if (!analyserRef.current) return;
        const buf = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, audioContextRef.current?.sampleRate || 44100);

        if (freq !== -1 && freq > 50 && freq < 1000) {
            setFrequency(freq);
            const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
            const midi = Math.round(noteNum) + 69;
            const note = NOTE_STRINGS[midi % 12];
            setPitchNote(note);

            const idealFreq = 440 * Math.pow(2, (midi - 69) / 12);
            const rawCents = 1200 * Math.log2(freq / idealFreq);
            const smoothedCents = getSmoothedCents(rawCents);
            setCents(smoothedCents);

            // Determine tuning state
            if (Math.abs(smoothedCents) <= TUNED_THRESHOLD) {
                setTuneState('tuned');
            } else if (smoothedCents < -TUNED_THRESHOLD) {
                setTuneState('flat');
                bellPlayedRef.current = false;
            } else {
                setTuneState('sharp');
                bellPlayedRef.current = false;
            }

            let minDiff = Infinity;
            let closestStr = null;
            GUITAR_STRINGS.forEach(str => {
                if (str.note === note) {
                    const diff = Math.abs(freq - str.freq);
                    if (diff < minDiff) { minDiff = diff; closestStr = str.name; }
                }
            });
            if (!closestStr && minDiff === Infinity) {
                GUITAR_STRINGS.forEach(str => {
                    const diff = Math.abs(freq - str.freq);
                    if (diff < str.freq * 0.1 && diff < minDiff) { minDiff = diff; closestStr = str.name; }
                });
            }
            setClosestString(closestStr);
        }
        rafIdRef.current = requestAnimationFrame(updatePitch);
    };

    // Bell + OK when tuned
    useEffect(() => {
        if (tuneState === 'tuned' && !bellPlayedRef.current) {
            bellPlayedRef.current = true;
            setShowOk(true);
            if (okTimeoutRef.current) clearTimeout(okTimeoutRef.current);
            okTimeoutRef.current = window.setTimeout(() => setShowOk(false), 1500);
        }
    }, [tuneState, playBell]);

    // Auto mic
    useEffect(() => {
        startMic();
        return () => {
            stopMic();
            if (synthRef.current) synthRef.current.dispose();
            if (bellRef.current) bellRef.current.dispose();
            if (okTimeoutRef.current) clearTimeout(okTimeoutRef.current);
        };
    }, []);

    const getSegmentColor = (index: number) => {
        const segmentValue = index * 5;
        const isActive = Math.abs(cents - segmentValue) < 3;
        if (!isActive) return 'bg-[#1A202C]';
        if (index === 0) return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]';
        if (index < 0) return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]';
        return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    };

    const isTuned = tuneState === 'tuned';

    return (
        <div className="flex flex-col h-full bg-[#101622] text-white overflow-y-auto pb-36">
            {/* Header */}
            <div className="pt-8 px-6 pb-4 bg-[#101622]/95 z-20 border-b border-white/5 flex items-center justify-between sticky top-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Afinador Profissional</h1>
                </div>
                <div className="flex items-center gap-2">
                    {micReady && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
                    <div className="bg-black/30 px-3 py-1 rounded-full border border-white/10">
                        <span className="text-xs font-mono text-gray-400">440Hz</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center p-6 gap-6">

                {/* Background Glow */}
                <div className={`fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] transition-colors duration-500 pointer-events-none ${isTuned && frequency > 0 ? 'bg-green-500/20' : 'bg-[#6F4CE7]/10'}`}></div>

                {/* Tuner Display */}
                <div className="w-full max-w-sm bg-gradient-to-b from-[#0D0D14] to-[#050508] rounded-[32px] border-2 border-[#6F4CE7]/30 p-5 relative shadow-2xl shadow-[#6F4CE7]/10 flex flex-col items-center">

                    {/* Brand */}
                    <div className="flex flex-col items-center gap-0.5 mb-3">
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-[#6F4CE7] to-[#0081FF] bg-clip-text text-transparent">Guitar Tuner</span>
                        <span className="text-lg font-black tracking-widest bg-gradient-to-r from-[#0081FF] to-[#6F4CE7] bg-clip-text text-transparent">VQC</span>
                    </div>

                    {/* Meter */}
                    <div className="flex items-end justify-center gap-0.5 h-24 w-full px-2 mb-3">
                        {Array.from({ length: 14 }).map((_, i) => {
                            const idx = -14 + i;
                            return (
                                <div key={idx} className={`w-1.5 rounded-t-sm transition-all duration-100 ${getSegmentColor(idx)}`}
                                    style={{ height: `${20 + (i * 5)}%` }} />
                            );
                        })}
                        <div className="w-4 h-full relative flex items-end justify-center">
                            <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] absolute top-0 ${isTuned && frequency > 0 ? 'border-t-green-500' : 'border-t-[#333]'}`}></div>
                            <div className={`w-2 rounded-t-sm h-full transition-all duration-100 ${getSegmentColor(0)}`}></div>
                        </div>
                        {Array.from({ length: 14 }).map((_, i) => {
                            const idx = 1 + i;
                            return (
                                <div key={idx} className={`w-1.5 rounded-t-sm transition-all duration-100 ${getSegmentColor(idx)}`}
                                    style={{ height: `${90 - (i * 5)}%` }} />
                            );
                        })}
                    </div>

                    {/* Note Display */}
                    <div className="flex items-center justify-center gap-3 my-2">
                        <div className={`text-8xl font-black font-mono tracking-tighter transition-colors duration-200 ${isTuned && frequency > 0 ? 'text-green-500 scale-110' : 'text-white'}`}>
                            {pitchNote}
                        </div>

                        {/* OK Check Badge (right side) */}
                        {showOk && (
                            <div className="animate-in zoom-in-50 duration-300">
                                <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg shadow-green-500/50">
                                    <Check size={22} strokeWidth={4} className="text-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback Message */}
                    <div className="h-8 flex items-center justify-center gap-2 mt-1">
                        {frequency > 0 && pitchNote !== '-' && (
                            <>
                                {tuneState === 'flat' && (
                                    <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                                        <ChevronUp size={18} className="text-yellow-400 animate-bounce" />
                                        <span className="text-yellow-400 text-sm font-bold uppercase tracking-wider">Aperte a corda</span>
                                    </div>
                                )}
                                {tuneState === 'sharp' && (
                                    <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                                        <ChevronDown size={18} className="text-red-400 animate-bounce" />
                                        <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Solte a corda</span>
                                    </div>
                                )}
                                {tuneState === 'tuned' && !showOk && (
                                    <span className="text-green-400 text-sm font-bold uppercase tracking-wider animate-in fade-in duration-200">Afinado ✓</span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Cents */}
                    <div className="flex justify-between w-full text-xs font-mono text-gray-500 mt-1 px-4">
                        <span>-50</span>
                        <span className={isTuned ? 'text-green-500' : ''}>{cents.toFixed(0)}</span>
                        <span>+50</span>
                    </div>
                </div>

                {/* String Buttons */}
                <div className="w-full max-w-sm">
                    <p className="text-[10px] text-gray-500 text-center mb-3 uppercase tracking-wider font-bold">
                        Toque para ouvir a corda de referência
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                        {GUITAR_STRINGS.map((str) => {
                            const isActive = closestString === str.name;
                            const isPlaying = playingString === str.name;
                            return (
                                <button
                                    key={str.name}
                                    onClick={() => playStringSound(str)}
                                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all duration-200 active:scale-90 min-h-[72px] ${isPlaying
                                        ? 'bg-gradient-to-b from-[#0081FF]/40 to-[#6F4CE7]/30 text-[#0081FF] border-2 border-[#0081FF]/60 shadow-lg shadow-[#0081FF]/30'
                                        : isActive
                                            ? (isTuned ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' : 'bg-white/10 text-white border-2 border-white/20')
                                            : 'bg-[#1A202C] text-gray-400 border-2 border-white/5 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <span className="text-base font-black">{str.name}</span>
                                    <Volume2 size={14} className={isPlaying ? 'text-[#0081FF] animate-pulse' : 'opacity-30'} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
