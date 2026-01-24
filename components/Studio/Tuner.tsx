
import React, { useState, useEffect, useRef } from 'react';

// Pitch detection algorithm (same as in ProfileScreen)
function autoCorrelate(buf: Float32Array, sampleRate: number) {
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
        if (SIZE - i > 0) c[i] = c[i] / (SIZE - i);
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

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const Tuner: React.FC = () => {
    const [isMicOn, setIsMicOn] = useState(false);
    const [noteName, setNoteName] = useState('-');
    const [cents, setCents] = useState(0);
    const [frequency, setFrequency] = useState(0);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        return () => stopMic();
    }, []);

    const startMic = async () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioCtxRef.current = audioCtx;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;
            setIsMicOn(true);
            updatePitch();
        } catch (err) {
            console.error("Mic error:", err);
            alert("Microphone access denied.");
        }
    };

    const stopMic = () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (audioCtxRef.current) audioCtxRef.current.close();
        setIsMicOn(false);
        setNoteName('-');
        setCents(0);
        setFrequency(0);
    };

    const updatePitch = () => {
        if (!analyserRef.current || !audioCtxRef.current) return;
        const buf = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, audioCtxRef.current.sampleRate);

        if (freq !== -1) {
            const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
            const midi = Math.round(noteNum) + 69;
            const note = NOTES[midi % 12];
            const idealFreq = 440 * Math.pow(2, (midi - 69) / 12);
            const diffCents = 1200 * Math.log2(freq / idealFreq);

            setNoteName(note);
            setCents(diffCents);
            setFrequency(freq);
        }
        rafIdRef.current = requestAnimationFrame(updatePitch);
    };

    const isInTune = Math.abs(cents) <= 3;

    return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-12">
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Detecção de Tom</h2>
                <div className={`text-8xl font-black transition-colors duration-300 ${isMicOn ? (isInTune ? 'text-[#0081FF]' : 'text-red-500') : 'text-gray-700'}`}>
                    {noteName}
                </div>
                <div className="text-gray-400 text-sm mt-2 font-mono">{frequency.toFixed(1)} Hz</div>
            </div>

            {/* Needle / Meter */}
            <div className="w-full max-w-xs h-2 bg-gray-800 rounded-full relative overflow-hidden mb-12">
                <div
                    className={`absolute top-0 bottom-0 w-1 transition-all duration-100 ${isInTune ? 'bg-[#0081FF]' : 'bg-red-500'}`}
                    style={{
                        left: `${50 + (cents)}%`,
                        boxShadow: `0 0 10px ${isInTune ? '#0081FF' : '#ef4444'}`
                    }}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/20" />
            </div>

            <button
                onClick={isMicOn ? stopMic : startMic}
                className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${isMicOn ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#0081FF] text-white shadow-lg shadow-blue-900/40'}`}
            >
                {isMicOn ? 'Parar Afinador' : 'Iniciar Afinador'}
            </button>

            <p className="mt-8 text-xs text-gray-500 leading-relaxed max-w-[240px]">
                {isMicOn ? (isInTune ? 'Perfeito! Você está afinado.' : 'Ajuste o tom até o indicador ficar azul.') : 'Clique no botão e cante ou toque uma nota.'}
            </p>
        </div>
    );
};
