
import React, { useState, useEffect, useRef } from 'react';

// Precison Metronome Engine
export const Metronome: React.FC = () => {
    const [bpm, setBpm] = useState(110);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeSignature, setTimeSignature] = useState('4/4');
    const [subdivision, setSubdivision] = useState('quarter');

    const audioCtxRef = useRef<AudioContext | null>(null);
    const nextNoteTimeRef = useRef(0);
    const timerIDRef = useRef<number | null>(null);
    const currentBeatRef = useRef(0);

    const lookahead = 25.0; // How frequently to call scheduling function (ms)
    const scheduleAheadTime = 0.1; // How far ahead to schedule audio (s)

    const playClick = (time: number, isAccent: boolean) => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const envelope = audioCtxRef.current.createGain();

        osc.frequency.value = isAccent ? 1000 : 800;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.connect(envelope);
        envelope.connect(audioCtxRef.current.destination);

        osc.start(time);
        osc.stop(time + 0.05);
    };

    const scheduler = () => {
        if (!audioCtxRef.current) return;
        while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
            const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
            const isAccent = currentBeatRef.current === 0;

            playClick(nextNoteTimeRef.current, isAccent);

            // Advance time
            const secondsPerBeat = 60.0 / bpm;

            // Handle subdivisions
            let step = secondsPerBeat;
            if (subdivision === 'eighth') step /= 2;
            if (subdivision === 'triplet') step /= 3;

            nextNoteTimeRef.current += step;

            // Advance beat
            currentBeatRef.current++;
            if (currentBeatRef.current >= beatsPerMeasure * (subdivision === 'quarter' ? 1 : subdivision === 'eighth' ? 2 : 3)) {
                currentBeatRef.current = 0;
            }
        }
        timerIDRef.current = window.setTimeout(scheduler, lookahead);
    };

    const startMetronome = async () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }

        currentBeatRef.current = 0;
        nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
        setIsPlaying(true);
        scheduler();
    };

    const stopMetronome = () => {
        if (timerIDRef.current) clearTimeout(timerIDRef.current);
        setIsPlaying(false);
    };

    const handleTap = () => {
        // Tap tempo logic could go here, but spec says "No Feature Creep" 
        // Wait, D'Tools HAS Tap. Reference images show "Tap" button.
        // I'll add mininal tap logic.
    };

    const taps = useRef<number[]>([]);
    const tapTempo = () => {
        const now = performance.now();
        taps.current.push(now);
        if (taps.current.length > 4) taps.current.shift();
        if (taps.current.length >= 2) {
            const intervals = [];
            for (let i = 1; i < taps.current.length; i++) {
                intervals.push(taps.current[i] - taps.current[i - 1]);
            }
            const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const newBpm = Math.round(60000 / avg);
            setBpm(Math.min(Math.max(newBpm, 30), 250));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[70vh]">
            {/* Top Visual (Minimalist blue line from image) */}
            <div className="w-1 h-32 bg-[#0081FF] mb-12 shadow-[0_0_15px_rgba(0,129,255,0.5)]" />

            {/* BPM Display */}
            <div className="flex items-center gap-12 mb-12">
                <button
                    onClick={() => setBpm(b => Math.max(30, b - 1))}
                    className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
                >
                    <span className="material-symbols-rounded text-4xl">remove</span>
                </button>

                <div className="text-[120px] font-black leading-none tracking-tighter tabular-nums">
                    {bpm}
                </div>

                <button
                    onClick={() => setBpm(b => Math.min(250, b + 1))}
                    className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
                >
                    <span className="material-symbols-rounded text-4xl">add</span>
                </button>
            </div>

            {/* Settings Row (Time Sig / Subdiv) */}
            <div className="flex gap-4 mb-12">
                {['2/4', '3/4', '4/4', '6/8'].map(sig => (
                    <button
                        key={sig}
                        onClick={() => setTimeSignature(sig)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border ${timeSignature === sig ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500'}`}
                    >
                        {sig}
                    </button>
                ))}
            </div>

            <div className="flex gap-4 mb-12">
                {['quarter', 'eighth', 'triplet'].map(sub => (
                    <button
                        key={sub}
                        onClick={() => setSubdivision(sub)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border ${subdivision === sub ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500'}`}
                    >
                        {sub === 'quarter' ? '1/4' : sub === 'eighth' ? '1/8' : 'Tercina'}
                    </button>
                ))}
            </div>

            {/* Main Buttons */}
            <div className="flex gap-4 w-full max-w-sm">
                <button
                    onClick={tapTempo}
                    className="flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest active:bg-white/10 transition-colors"
                >
                    Tap
                </button>
                <button
                    onClick={isPlaying ? stopMetronome : startMetronome}
                    className={`flex-1 py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${isPlaying ? 'bg-red-500 text-white shadow-red-900/40' : 'bg-[#0081FF] text-white shadow-blue-900/40'}`}
                >
                    {isPlaying ? 'Parar' : 'Iniciar'}
                </button>
            </div>
        </div>
    );
};
