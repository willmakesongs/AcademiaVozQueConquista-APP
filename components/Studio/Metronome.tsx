
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { MINIMALIST_LOGO_URL } from '../../constants';

interface MetronomeProps {
    exerciseName?: string;
    onSaveLog?: () => void;
}

const SUBDIVISIONS = [
    { label: 'Quarter', value: 1, icon: 'q', interval: '4n' },
    { label: 'Eighth', value: 2, icon: 'e', interval: '8n' },
    { label: 'Triplet', value: 3, icon: 't', interval: '8t' },
    { label: 'Sixteenth', value: 4, icon: 's', interval: '16n' },
];

const TEMPO_MARKINGS = [
    { label: 'Grave', min: 20, max: 40 },
    { label: 'Largo', min: 40, max: 60 },
    { label: 'Adagio', min: 60, max: 66 },
    { label: 'Andante', min: 66, max: 76 },
    { label: 'Moderato', min: 76, max: 108 },
    { label: 'Allegro', min: 108, max: 168 },
    { label: 'Presto', min: 168, max: 200 },
    { label: 'Prestissimo', min: 200, max: 300 },
];

export const Metronome: React.FC<MetronomeProps> = ({ exerciseName = 'Treino Profissional', onSaveLog }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(110);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [visualBeat, setVisualBeat] = useState(false); // For visual flash
    const [currentMarking, setCurrentMarking] = useState('Moderato');

    // Volumes state (0 to 1 for Gain)
    const [volumes, setVolumes] = useState({
        accent: 1,
        quarter: 1, // Default ON
        eighth: 0,
        triplet: 0,
        sixteenth: 0
    });

    const [measureBeat, setMeasureBeat] = useState(0);

    // --- STUDY TIMER STATE ---
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [targetDuration, setTargetDuration] = useState<number | null>(null); // null = "Livre" (Count up)
    const [showInstructions, setShowInstructions] = useState(false);

    // --- AUTO-SAVE BPM ---
    useEffect(() => {
        const savedBpm = localStorage.getItem('vqc_metronome_bpm');
        if (savedBpm) {
            const parsed = parseInt(savedBpm, 10);
            if (!isNaN(parsed) && parsed >= 30 && parsed <= 300) {
                setBpm(parsed);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('vqc_metronome_bpm', bpm.toString());
    }, [bpm]);

    // --- USER PROGRESS (SIMPLE FIELD) ---
    const [myBpm, setMyBpm] = useState('');

    // Load Progress
    useEffect(() => {
        const saved = localStorage.getItem('vqc_my_bpm_progress');
        if (saved) setMyBpm(saved);
    }, []);

    // Save Progress (Auto-save on change)
    useEffect(() => {
        localStorage.setItem('vqc_my_bpm_progress', myBpm);
    }, [myBpm]);

    // Removed handleSaveProgress


    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying) {
            interval = setInterval(() => {
                setTimerSeconds(prev => {
                    // Countdown Mode
                    if (targetDuration !== null) {
                        if (prev <= 1) { // Reached 0 (using <= 1 to catch the last second tick)
                            handleToggle(); // Stop Metronome
                            return targetDuration * 60; // Reset to full time
                        }
                        return prev - 1;
                    }
                    // Stopwatch Mode (Livre)
                    else {
                        return prev + 1;
                    }
                });
            }, 1000);
        } else {
            // Reset timer when stopped? 
            // UX Decision: 
            // If "Livre": Reset to 0. 
            // If "Target": Reset to Target.
            setTimerSeconds(targetDuration ? targetDuration * 60 : 0);
        }

        return () => clearInterval(interval);
    }, [isPlaying, targetDuration]);

    // When target changes, reset timer display immediately
    useEffect(() => {
        setTimerSeconds(targetDuration ? targetDuration * 60 : 0);
    }, [targetDuration]);



    // Tone.js Refs
    const synthsRef = useRef<any>({});
    const gainsRef = useRef<any>({});
    const tapTimesRef = useRef<number[]>([]);


    useEffect(() => {
        // Create Gains
        gainsRef.current = {
            accent: new Tone.Gain(0).toDestination(),
            quarter: new Tone.Gain(0).toDestination(),
            eighth: new Tone.Gain(0).toDestination(),
            triplet: new Tone.Gain(0).toDestination(),
            sixteenth: new Tone.Gain(0).toDestination()
        };

        // Create Independent Synths for each track
        // Using "Digital Click" sounds (Oscillators) instead of Membrane (Kick)

        // 1. Accent: Sharp Square Wave (Woodblock-ish/Digital)
        const accentSynth = new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
        });

        // 2. Subdivisions: Softer Triangle/Sine
        const subSynth = (type: 'triangle' | 'sine' = 'triangle') => new Tone.Synth({
            oscillator: { type },
            envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 }
        });

        synthsRef.current = {
            accent: accentSynth.connect(gainsRef.current.accent),
            quarter: subSynth('triangle').connect(gainsRef.current.quarter), // Distinct
            eighth: subSynth('sine').connect(gainsRef.current.eighth),      // Softer
            triplet: subSynth('sine').connect(gainsRef.current.triplet),
            sixteenth: subSynth('sine').connect(gainsRef.current.sixteenth)
        };

        // Initialize Volumes
        updateGains(volumes);

        return () => {
            Object.values(synthsRef.current).forEach((s: any) => s.dispose());
            Object.values(gainsRef.current).forEach((g: any) => g.dispose());
            Tone.Transport.stop();
            Tone.Transport.cancel();
        };
    }, []);

    const updateGains = (newVolumes: any) => {
        // Smooth transition
        if (gainsRef.current.accent) {
            gainsRef.current.accent.gain.rampTo(newVolumes.accent, 0.1);
            gainsRef.current.quarter.gain.rampTo(newVolumes.quarter, 0.1);
            gainsRef.current.eighth.gain.rampTo(newVolumes.eighth, 0.1);
            // Boost triplets slightly as they tend to feel quieter
            gainsRef.current.triplet.gain.rampTo(newVolumes.triplet, 0.1);
            gainsRef.current.sixteenth.gain.rampTo(newVolumes.sixteenth, 0.1);
        }
    };

    // Update gains when state changes
    useEffect(() => {
        updateGains(volumes);
    }, [volumes]);

    // Sync BPM which is connected to Transport
    useEffect(() => {
        Tone.Transport.bpm.value = bpm;
        const marking = TEMPO_MARKINGS.find(m => bpm >= m.min && bpm < m.max);
        if (marking) setCurrentMarking(marking.label);
    }, [bpm]);

    const triggerVisual = useCallback((beat: number, time: number) => {
        Tone.Draw.schedule(() => {
            setMeasureBeat(beat);
            if (beat === 0) {
                setVisualBeat(true);
                setTimeout(() => setVisualBeat(false), 80);
            }
        }, time);
    }, []);

    // Step Reference for stable counting
    const stepRef = useRef(0);

    const handleToggle = async () => {
        if (!isPlaying) {
            await Tone.start();
            setStartTime(Date.now());

            // Reset state
            stepRef.current = 0;
            setMeasureBeat(0);

            const synths = synthsRef.current;

            // --- MASTER CLOCK (16th Note Grid) ---
            // Handles: Visuals, Accent, Quarter, Eighth, Sixteenth
            Tone.Transport.scheduleRepeat((time) => {
                const step = stepRef.current;

                // Calculate positions in 4/4
                // A Measure has 16 sixteenths (0-15)
                // A Quarter Note is every 4 steps (0, 4, 8, 12)

                const isMeasureDownbeat = step % 16 === 0;
                const isQuarterBeat = step % 4 === 0;
                const isEighthNote = step % 2 === 0;
                // isSixteenth is always true for every step

                // 1. Visuals & Accent (Beat 1)
                if (isMeasureDownbeat) {
                    synths.accent.triggerAttackRelease('C6', '32n', time);
                    triggerVisual(0, time);
                }
                else if (isQuarterBeat) {
                    // Visual Update for counts 2, 3, 4
                    const currentBeat = (step / 4) % 4; // 0, 1, 2, 3
                    triggerVisual(currentBeat, time);
                }

                // 2. Audio Triggers (Mixer Layers)

                // Quarter Note Layer (Every 4 steps)
                if (isQuarterBeat) {
                    synths.quarter.triggerAttackRelease('C5', '32n', time);
                }

                // Eighth Note Layer (Every 2 steps)
                if (isEighthNote) { // Play on off-beats too? Yes, mixer controls volume
                    synths.eighth.triggerAttackRelease('G4', '32n', time);
                }

                // Sixteenth Note Layer (Every step)
                synths.sixteenth.triggerAttackRelease('A3', '32n', time);

                // Increment Step
                stepRef.current++;
            }, "16n");


            // --- SECONDARY CLOCK (Triplets) ---
            // Runs independently because 8t cannot map to 16n grid
            Tone.Transport.scheduleRepeat((time) => {
                synths.triplet.triggerAttackRelease('E4', '32n', time);
            }, "8t");


            Tone.Transport.start();
            setIsPlaying(true);
        } else {
            Tone.Transport.stop();
            Tone.Transport.cancel(); // Clear all events
            setIsPlaying(false);
            setVisualBeat(false);
            setMeasureBeat(0);
            stepRef.current = 0;
            if (startTime) setStartTime(null);
        }
    };

    const handleTap = () => {
        const now = Date.now();
        const times = tapTimesRef.current;

        // Reset if pause is too long (> 2 seconds)
        if (times.length > 0 && now - times[times.length - 1] > 2000) {
            tapTimesRef.current = [now];
            return;
        }

        tapTimesRef.current = [...times, now].slice(-4); // Keep last 4 taps

        if (tapTimesRef.current.length >= 2) {
            const intervals = [];
            for (let i = 1; i < tapTimesRef.current.length; i++) {
                intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
            const newBpm = Math.round(60000 / avgInterval);
            if (newBpm >= 30 && newBpm <= 300) setBpm(newBpm);
        }
    };

    const adjustBpm = (amount: number) => {
        setBpm(prev => Math.max(30, Math.min(300, prev + amount)));
    };

    // Helper for Mixer Sliders - Adapted for 0-1 range
    const MixerSlider = ({ label, value, icon, onChange }: any) => (
        <div className="flex flex-col items-center gap-2 h-40">
            <span className="text-gray-400 text-lg h-6">{icon}</span>
            <div className="relative flex-1 w-2 bg-[#1A1A1A] rounded-full overflow-hidden group hover:bg-[#252525] transition-colors">
                <div
                    className="absolute bottom-0 w-full bg-[#0081FF] transition-all duration-75 group-hover:bg-[#3399FF]"
                    style={{ height: `${value * 100}%` }}
                />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
            <span className="text-[10px] text-gray-500 font-mono w-6 text-center">
                {(value * 10).toFixed(0)}
            </span>
        </div>
    );

    // Scroll Ref for Tempo Picker
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

    // Auto-scroll to active marking
    useEffect(() => {
        if (scrollRef.current && currentMarking) {
            const item = itemsRef.current.get(currentMarking);
            if (item) {
                const container = scrollRef.current;
                const scrollLeft = item.offsetLeft - (container.offsetWidth / 2) + (item.offsetWidth / 2);
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [currentMarking]);

    return (
        <div className="w-full h-full bg-[#101622] flex flex-col font-sans relative overflow-y-auto">
            <style>{`
                input[type=range].vertical-slider {
                    writing-mode: bt-lr; /* IE/Edge */
                    -webkit-appearance: slider-vertical; /* Webkit */
                    appearance: slider-vertical;
                    width: 100%;
                    height: 100%;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* --- VISUALIZER SECTION (35%) --- */}
            <div className="relative w-full h-[35vh] shrink-0 transition-all duration-500 bg-[#0D121C] overflow-hidden border-b border-white/5">
                {/* Flash Effect */}
                {/* Flash Effect */}
                <div className={`absolute inset-0 bg-[#6F4CE7]/20 pointer-events-none z-10 ${visualBeat ? 'opacity-100 transition-none' : 'opacity-0 transition-opacity duration-300'}`} />

                {/* Big Beat Number */}
                {/* Big Beat Number */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span
                        className={`text-[100px] font-black tracking-tighter transition-all duration-75 select-none ${isPlaying
                            ? 'opacity-100 scale-100 text-white'
                            : 'opacity-20 scale-95 text-[#6F4CE7]/30'
                            }`}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {isPlaying ? measureBeat + 1 : '1'}
                    </span>
                </div>

                {/* Pendulum Bar */}
                <div className="absolute top-0 bottom-0 left-0 right-0 z-30 opacity-80 mix-blend-screen pointer-events-none">
                    {isPlaying && (
                        <div
                            className="absolute top-0 bottom-0 w-1.5 bg-[#6F4CE7] shadow-[0_0_20px_#6F4CE7]"
                            style={{ animation: `pendulumScan ${60 / bpm}s linear infinite alternate` }}
                        />
                    )}
                    <style>{`
                        @keyframes pendulumScan {
                            from { left: 0; }
                            to { left: 100%; transform: translateX(-100%); }
                        }
                    `}</style>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex flex-col justify-start py-6 px-6 pb-48 bg-[#101622]">
                <div className="w-full max-w-md mx-auto flex flex-col gap-6">

                    {/* HEADER */}
                    <div className="w-full flex items-center justify-center border-b border-white/5 pb-4 gap-3">
                        <h1 className="text-[#6F4CE7] font-black tracking-[0.3em] text-sm uppercase glow-text">
                            METRÔNOMO
                        </h1>
                        <img src={MINIMALIST_LOGO_URL} alt="VQC Logo" className="h-5 w-auto object-contain opacity-90" />
                    </div>

                    {/* MIXER REMOVED - Simple Interface */}

                    {/* TEMPO CONTROLS */}
                    <div className="flex flex-col items-center gap-6 w-full fade-in slide-in-from-bottom-4 duration-500 mt-8">

                        {/* BPM Display & Controls */}
                        <div className="flex items-center justify-between w-full px-4">
                            <button
                                onClick={() => adjustBpm(-1)}
                                className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#6F4CE7]/50 hover:bg-[#6F4CE7]/10 transition-all active:scale-95 text-2xl"
                            >
                                <span className="material-symbols-rounded">-</span>
                            </button>

                            <div className="flex flex-col items-center">
                                <span className="text-7xl font-light text-white tracking-tighter tabular-nums leading-none drop-shadow-[0_0_15px_rgba(111,76,231,0.3)]">
                                    {bpm}
                                </span>
                                <span className="text-[#6F4CE7] text-[10px] font-bold uppercase tracking-widest mt-2">
                                    {currentMarking}
                                </span>
                            </div>

                            <button
                                onClick={() => adjustBpm(1)}
                                className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#6F4CE7]/50 hover:bg-[#6F4CE7]/10 transition-all active:scale-95 text-2xl"
                            >
                                <span className="material-symbols-rounded">+</span>
                            </button>
                        </div>

                        {/* Slider (Fine Tune) */}
                        <input
                            type="range"
                            min="30"
                            max="300"
                            value={bpm}
                            onChange={(e) => setBpm(parseInt(e.target.value))}
                            className="w-full h-1 bg-[#1A1F2E] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#6F4CE7] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_#6F4CE7] hover:bg-[#252A3B] transition-colors"
                        />
                        <div
                            ref={scrollRef}
                            className="flex gap-8 overflow-x-auto hide-scrollbar px-[50%] snap-x w-full justify-start items-center"
                        >
                            {TEMPO_MARKINGS.map(m => (
                                <button
                                    key={m.label}
                                    ref={(el) => {
                                        if (el) itemsRef.current.set(m.label, el);
                                        else itemsRef.current.delete(m.label);
                                    }}
                                    onClick={() => setBpm((m.min + m.max) / 2)}
                                    className={`whitespace-nowrap text-xs tracking-[0.2em] uppercase transition-all duration-300 snap-center shrink-0 ${currentMarking === m.label
                                        ? 'text-[#6F4CE7] font-black scale-110'
                                        : 'text-zinc-500 hover:text-zinc-300 font-medium'
                                        }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transport Buttons */}
                    <div className="grid grid-cols-3 gap-4 w-full h-14">
                        <button
                            onClick={handleTap}
                            className="col-span-1 bg-[#1A1F2E] hover:bg-[#252A3B] rounded-xl text-gray-400 hover:text-white font-bold tracking-widest uppercase text-xs border border-white/5 transition-all active:scale-95 shadow-lg shadow-black/20"
                        >
                            Tap
                        </button>
                        <button
                            onClick={handleToggle}
                            className={`col-span-2 rounded-full font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${isPlaying
                                ? 'bg-[#E11D48] text-white shadow-[#E11D48]/30 border border-[#E11D48]'
                                : 'bg-gradient-to-r from-[#6F4CE7] to-[#8B5CF6] text-white hover:opacity-90 shadow-[#6F4CE7]/30 border border-[#6F4CE7]/20'
                                }`}
                        >
                            {isPlaying ? (
                                <><span className="material-symbols-rounded">stop</span> Stop</>
                            ) : (
                                <><span className="material-symbols-rounded">play_arrow</span> Play</>
                            )}
                        </button>
                    </div>

                    {/* --- STUDY TIMER SECTION --- */}
                    <div className="w-full bg-[#1A1F2E] rounded-2xl p-4 border border-white/5 mt-2">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                                    <span className="material-symbols-rounded text-lg">timer</span>
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    Tempo de Estudo
                                </span>
                            </div>
                            <span className="font-mono text-2xl font-bold text-white tracking-widest tabular-nums text-shadow-glow">
                                {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
                                {(timerSeconds % 60).toString().padStart(2, '0')}
                            </span>
                        </div>

                        {/* Duration Selector */}
                        <div className="w-full overflow-x-auto hide-scrollbar">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTargetDuration(null)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${targetDuration === null
                                        ? 'bg-[#6F4CE7] text-white border-[#6F4CE7] shadow-lg shadow-[#6F4CE7]/20'
                                        : 'bg-black/20 text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-300'
                                        }`}
                                >
                                    Livre
                                </button>
                                {[1, 3, 5, 10, 15].map(min => (
                                    <button
                                        key={min}
                                        onClick={() => setTargetDuration(min)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${targetDuration === min
                                            ? 'bg-[#6F4CE7] text-white border-[#6F4CE7] shadow-lg shadow-[#6F4CE7]/20'
                                            : 'bg-black/20 text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-300'
                                            }`}
                                    >
                                        {min} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>




                    {/* --- MY PROGRESS FIELD --- */}
                    <div className="w-full bg-[#1A1F2E] rounded-3xl p-5 border border-white/5 mt-2 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Meu Recorde
                            </span>
                            <span className="text-[10px] text-gray-600 font-medium">
                                BPM Conquistado
                            </span>
                        </div>
                        <div className="relative w-32">
                            <input
                                type="number"
                                value={myBpm}
                                onChange={(e) => setMyBpm(e.target.value)}
                                placeholder="000"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-center font-mono text-xl font-bold text-white placeholder-white/10 focus:outline-none focus:border-[#6F4CE7]/50 focus:bg-[#6F4CE7]/5 transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold pointer-events-none">
                                BPM
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowInstructions(true)}
                        className="w-full py-4 mt-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group"
                    >
                        <span className="material-symbols-rounded text-lg group-hover:scale-110 transition-transform">info</span>
                        Instruções Importantes
                    </button>
                </div>
            </div>

            {/* INSTRUCTIONS MODAL */}
            {showInstructions && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1A1F2E] w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#151925]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                                    <span className="material-symbols-rounded">menu_book</span>
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg leading-tight">Diretrizes Fundamentais</h2>
                                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">O Árbitro da Verdade Musical</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                            >
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 pb-32 text-gray-300 space-y-8 leading-relaxed text-sm scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                            <div className="bg-[#6F4CE7]/5 rounded-xl p-4 border border-[#6F4CE7]/10">
                                <p className="text-[#6F4CE7] font-medium italic text-center">
                                    "O metrônomo não é apenas uma ferramenta de marcação de tempo; é o seu árbitro da verdade musical. Ele remove a subjetividade e expõe onde sua técnica vacila sob pressão."
                                </p>
                            </div>

                            <section>
                                <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                                    <span className="text-[#6F4CE7]">01.</span> O Princípio da Velocidade de Cruzeiro
                                </h3>
                                <p className="mb-4">Muitos estudantes cometem o erro de praticar no limite da sua capacidade. A verdadeira disciplina começa quando você reduz o tempo para onde a execução é perfeita.</p>
                                <ul className="space-y-3">
                                    <li className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <span className="text-white font-bold block mb-1">A Regra dos 5</span>
                                        Só aumente a velocidade após executar o trecho 5 vezes seguidas sem erro. Se errar na quinta, volte para a primeira.
                                    </li>
                                    <li className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <span className="text-white font-bold block mb-1">Incrementos de 2 a 4 BPM</span>
                                        Não salte grandes velocidades. O progresso sólido é construído em camadas invisíveis de milissegundos.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                                    <span className="text-[#6F4CE7]">02.</span> Subdivisão: O Microscópio do Tempo
                                </h3>
                                <p className="mb-4">Ouvir apenas a batida da semínima pode mascarar imprecisões entre os tempos.</p>
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <span className="text-white font-bold block mb-1">Ative as subdivisões</span>
                                    Isso força você a preencher o espaço rítmico com exatidão, eliminando o hábito de "correr" ou "atrasar" as notas de menor valor.
                                </div>
                            </section>

                            <section>
                                <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                                    <span className="text-[#6F4CE7]">03.</span> O Metrônomo Silencioso (Teste de Autonomia)
                                </h3>
                                <p className="mb-4">Não se torne dependente da máquina; use-a para internalizar o pulso.</p>
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <span className="text-white font-bold block mb-1">Pratique o "Gap Click"</span>
                                    Silencie o metrônomo mentalmente ou fisicamente por alguns compassos. Se, quando o som voltar, você estiver fora do tempo, sua percepção interna ainda precisa de trabalho.
                                </div>
                            </section>

                            <section>
                                <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                                    <span className="text-[#6F4CE7]">04.</span> Estabilidade Mental e Postural
                                </h3>
                                <ul className="space-y-3">
                                    <li className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <span className="text-white font-bold block mb-1">Respire com o pulso</span>
                                        Sincronize sua respiração com a batida. Isso evita a tensão muscular que surge quando o andamento aumenta.
                                    </li>
                                    <li className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <span className="text-white font-bold block mb-1">Foco no "Click" Desaparecido</span>
                                        Quando você está perfeitamente alinhado, o som do metrônomo parece "desaparecer" sob a sua nota. Busque esse estado.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-white font-bold text-base mb-4">Tabela de Progresso Diário</h3>
                                <div className="w-full bg-black/40 rounded-xl overflow-hidden border border-white/10">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 text-[#6F4CE7] uppercase text-[10px] tracking-widest font-bold">
                                                <th className="p-3">Fase</th>
                                                <th className="p-3">Objetivo</th>
                                                <th className="p-3">Atitude</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs font-medium divide-y divide-white/5 text-gray-300">
                                            <tr>
                                                <td className="p-3 text-white">Lento</td>
                                                <td className="p-3">Clareza e Postura</td>
                                                <td className="p-3">Analítica e Crítica</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 text-white">Médio</td>
                                                <td className="p-3">Consistência e Ritmo</td>
                                                <td className="p-3">Vigilante</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 text-white">Meta</td>
                                                <td className="p-3">Fluidez e Performance</td>
                                                <td className="p-3">Relaxada e Precisa</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 text-red-200 text-xs">
                                <strong className="text-red-400 font-bold block mb-1 uppercase tracking-wider">Nota de Realidade</strong>
                                Se você sente que o metrônomo está "errado" ou "oscilando", é o sinal definitivo de que sua percepção rítmica precisa de correção imediata. O metrônomo é matematicamente exato; sua percepção é humana e falível. Aceite o erro para corrigi-lo.
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>


    );
};
