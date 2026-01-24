
import React, { useEffect, useRef, useState } from 'react';

interface PitchVisualizerProps {
    isActive: boolean;
}

export const PitchVisualizer: React.FC<PitchVisualizerProps> = ({ isActive }) => {
    const [pitch, setPitch] = useState<number | null>(null);
    const [noteName, setNoteName] = useState<string>('');
    const [cents, setCents] = useState<number>(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);

    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const getNoteFromFrequency = (frequency: number) => {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        const roundedNote = Math.round(noteNum) + 69;
        const centsOffset = Math.floor((noteNum - Math.round(noteNum)) * 100);
        return {
            name: NOTES[roundedNote % 12],
            cents: centsOffset,
        };
    };

    // Simple AutoCorrelation for Pitch Detection
    const autoCorrelate = (buffer: Float32Array, sampleRate: number) => {
        let size = buffer.length;
        let rms = 0;
        for (let i = 0; i < size; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / size);
        if (rms < 0.01) return -1; // Too quiet

        let r1 = 0, r2 = size - 1, thres = 0.2;
        for (let i = 0; i < size / 2; i++) {
            if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
        }
        for (let i = 1; i < size / 2; i++) {
            if (Math.abs(buffer[size - i]) < thres) { r2 = size - i; break; }
        }

        buffer = buffer.slice(r1, r2);
        size = buffer.length;

        let c = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size - i; j++) {
                c[i] = c[i] + buffer[j] * buffer[j + i];
            }
        }

        let d = 0; while (c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < size; i++) {
            if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
        }

        let T0 = maxpos;
        return sampleRate / T0;
    };

    const updatePitch = () => {
        if (!analyserRef.current) return;
        const buffer = new Float32Array(2048);
        analyserRef.current.getFloatTimeDomainData(buffer);
        const frequency = autoCorrelate(buffer, audioContextRef.current!.sampleRate);

        if (frequency !== -1) {
            const note = getNoteFromFrequency(frequency);
            setPitch(frequency);
            setNoteName(note.name);
            setCents(note.cents);
        } else {
            setPitch(null);
        }

        animationRef.current = requestAnimationFrame(updatePitch);
    };

    useEffect(() => {
        if (isActive) {
            const startAudio = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = stream;

                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    audioContextRef.current = audioCtx;

                    const source = audioCtx.createMediaStreamSource(stream);
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 2048;
                    source.connect(analyser);
                    analyserRef.current = analyser;

                    updatePitch();
                } catch (err) {
                    console.error('Microphone access denied', err);
                }
            };
            startAudio();
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
            setPitch(null);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="w-full max-w-xs mx-auto bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 mt-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pitch ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Afinador Vocal</span>
                </div>
                {pitch && <span className="text-[10px] font-mono text-gray-500">{Math.round(pitch)} Hz</span>}
            </div>

            <div className="flex flex-col items-center">
                <div className="text-4xl font-black text-white mb-2 h-10 flex items-center">
                    {noteName || '--'}
                </div>

                {/* Tuner Bar */}
                <div className="w-full h-8 relative flex items-center justify-center">
                    {/* Center Mark */}
                    <div className="absolute h-full w-0.5 bg-green-500/50 z-0"></div>

                    {/* Scale */}
                    <div className="w-full h-1 bg-white/10 rounded-full flex justify-between px-1">
                        <div className="w-0.5 h-2 bg-white/20 -translate-y-0.5"></div>
                        <div className="w-0.5 h-2 bg-white/20 -translate-y-0.5"></div>
                        <div className="w-0.5 h-2 bg-white/20 -translate-y-0.5"></div>
                        <div className="w-0.5 h-2 bg-white/20 -translate-y-0.5"></div>
                        <div className="w-0.5 h-2 bg-white/20 -translate-y-0.5"></div>
                    </div>

                    {/* Indicator */}
                    {pitch && (
                        <div
                            className={`absolute w-4 h-4 rounded-full border-2 border-[#101622] shadow-lg transition-all duration-100 ${Math.abs(cents) < 10 ? 'bg-green-500 scale-125' : 'bg-[#FF00BC]'}`}
                            style={{ left: `${50 + (cents * 0.45)}%` }} // Map -50..50 to 5%..95%
                        ></div>
                    )}
                </div>

                <p className={`text-[9px] font-bold mt-2 uppercase tracking-tighter ${Math.abs(cents) < 10 ? 'text-green-500' : 'text-gray-500'}`}>
                    {pitch ? (Math.abs(cents) < 10 ? 'Afinado' : (cents < 0 ? 'Baixo (Flat)' : 'Alto (Sharp)')) : 'Aguardando voz...'}
                </p>
            </div>
        </div>
    );
};
