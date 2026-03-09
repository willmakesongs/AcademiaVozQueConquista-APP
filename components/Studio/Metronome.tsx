
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
    const [soundMode, setSoundMode] = useState<'CLICKS' | 'BEEPS' | 'LOOP' | 'COWBEL' | 'HAT'>('CLICKS');

    const SOUND_OPTIONS = [
        { id: 'CLICKS', label: 'CLICKS' },
        { id: 'BEEPS', label: 'BEEPS' },
        { id: 'LOOP', label: 'LOOP DRUM' },
        { id: 'COWBEL', label: 'COWBEL' },
        { id: 'HAT', label: 'HAT' },
    ];

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

        // 3. Beeps: Sine Wave
        const beepSynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
        });

        // 4. Drum Kit (Synthesized - Refined for "EzDRUMMER" feel)
        const kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).toDestination();

        const snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
        }).toDestination();

        const hihat = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.05 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 8000,
            octaves: 1.5
        }).toDestination();

        // 5. Cowbell (Classic 808 Style)
        const cowbell = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
            harmonicity: 1.5,
            modulationIndex: 10,
            resonance: 2000,
            octaves: 0.5
        }).toDestination();

        synthsRef.current = {
            accent: accentSynth.connect(gainsRef.current.accent),
            quarter: subSynth('triangle').connect(gainsRef.current.quarter),
            eighth: subSynth('sine').connect(gainsRef.current.eighth),
            triplet: subSynth('sine').connect(gainsRef.current.triplet),
            sixteenth: subSynth('sine').connect(gainsRef.current.sixteenth),
            beep: beepSynth,
            kick,
            snare,
            hihat,
            cowbell
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
            Tone.Transport.scheduleRepeat((time) => {
                const step = stepRef.current;
                const isMeasureDownbeat = step % 16 === 0;
                const isQuarterBeat = step % 4 === 0;
                const isEighthNote = step % 2 === 0;

                // Visuals (Always On)
                if (isQuarterBeat) {
                    const currentBeat = (step / 4) % 4;
                    triggerVisual(currentBeat, time);
                }

                // Audio Logic based on Mode
                const mode = (Tone.Transport as any)._metronomeMode || 'CLICKS';

                if (mode === 'CLICKS') {
                    if (isMeasureDownbeat) synths.accent.triggerAttackRelease('C6', '32n', time);
                    else if (isQuarterBeat) synths.quarter.triggerAttackRelease('C5', '32n', time);
                    if (isEighthNote) synths.eighth.triggerAttackRelease('G4', '32n', time);
                    synths.sixteenth.triggerAttackRelease('A3', '32n', time);
                }
                else if (mode === 'BEEPS') {
                    if (isMeasureDownbeat) synths.beep.triggerAttackRelease('C6', '16n', time);
                    else if (isQuarterBeat) synths.beep.triggerAttackRelease('C5', '16n', time);
                }
                else if (mode === 'LOOP') {
                    // Rock Loop: Kick on 1, Snare on 3, Hats on 8th notes
                    if (isMeasureDownbeat) synths.kick.triggerAttackRelease('C1', '8n', time, 1);
                    if (step % 16 === 8) synths.snare.triggerAttackRelease('16n', time, 1);
                    if (isEighthNote) synths.hihat.triggerAttackRelease('32n', time, step % 4 === 0 ? 0.6 : 0.3);
                }
                else if (mode === 'COWBEL') {
                    if (isQuarterBeat) synths.cowbell.triggerAttackRelease('C6', '32n', time, isMeasureDownbeat ? 1 : 0.7);
                }
                else if (mode === 'HAT') {
                    if (isQuarterBeat) synths.hihat.triggerAttackRelease('32n', time, isMeasureDownbeat ? 1 : 0.7);
                }

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
            Tone.Transport.cancel();
            setIsPlaying(false);
            setVisualBeat(false);
            setMeasureBeat(0);
            stepRef.current = 0;
            if (startTime) setStartTime(null);
        }
    };

    // Keep soundMode synced with Transport
    useEffect(() => {
        (Tone.Transport as any)._metronomeMode = soundMode;
    }, [soundMode]);

    const cycleSoundMode = () => {
        const currentIndex = SOUND_OPTIONS.findIndex(opt => opt.id === soundMode);
        const nextIndex = (currentIndex + 1) % SOUND_OPTIONS.length;
        setSoundMode(SOUND_OPTIONS[nextIndex].id as any);
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
                <label className="sr-only">Ajuste de {label}</label>
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
        <div className="w-full min-h-full bg-[#101622] flex flex-col font-sans relative">
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
                <div className={`absolute inset-0 bg-[#0081FF]/20 pointer-events-none z-10 ${visualBeat ? 'opacity-100 transition-none' : 'opacity-0 transition-opacity duration-300'}`} />

                {/* Big Beat Number */}
                {/* Big Beat Number */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span
                        className={`text-[100px] font-black tracking-tighter transition-all duration-75 select-none ${isPlaying
                            ? 'opacity-100 scale-100 text-white'
                            : 'opacity-20 scale-95 text-[#0081FF]/30'
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
                            className="absolute top-0 bottom-0 w-1.5 bg-[#0081FF] shadow-[0_0_20px_#0081FF]"
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
                        <h1 className="text-[#0081FF] font-black tracking-[0.3em] text-sm uppercase glow-text">
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
                                className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#0081FF]/50 hover:bg-[#0081FF]/10 transition-all active:scale-90 shadow-lg shadow-black/20"
                            >
                                <span className="material-symbols-rounded text-2xl">remove</span>
                            </button>

                            <div className="flex flex-col items-center">
                                <span className="text-7xl font-light text-white tracking-tighter tabular-nums leading-none drop-shadow-[0_0_15px_rgba(111,76,231,0.3)]">
                                    {bpm}
                                </span>
                                <span className="text-[#0081FF] text-[10px] font-bold uppercase tracking-widest mt-2">
                                    {currentMarking}
                                </span>
                            </div>

                            <button
                                onClick={() => adjustBpm(1)}
                                className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#0081FF]/50 hover:bg-[#0081FF]/10 transition-all active:scale-90 shadow-lg shadow-black/20"
                            >
                                <span className="material-symbols-rounded text-2xl">add</span>
                            </button>
                        </div>

                        {/* Slider (Fine Tune) */}
                        <label htmlFor="tempo-slider" className="sr-only">Ajuste de BPM Fino</label>
                        <input
                            id="tempo-slider"
                            type="range"
                            min="30"
                            max="300"
                            value={bpm}
                            onChange={(e) => setBpm(parseInt(e.target.value))}
                            aria-label="Ajuste de BPM"
                            className="w-full h-1 bg-[#1A1F2E] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#0081FF] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_#0081FF] hover:bg-[#252A3B] transition-colors"
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
                                        ? 'text-[#0081FF] font-black scale-110'
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
                            className="bg-[#1A1F2E] hover:bg-[#252A3B] rounded-xl text-gray-400 hover:text-white font-bold tracking-widest uppercase text-[10px] border border-white/5 transition-all active:scale-95 shadow-lg shadow-black/20"
                        >
                            Tap
                        </button>
                        <button
                            onClick={handleToggle}
                            className={`rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${isPlaying
                                ? 'bg-[#E11D48] text-white shadow-[#E11D48]/30 border border-[#E11D48]'
                                : 'bg-gradient-to-r from-[#0081FF] to-[#00C1D4] text-white hover:opacity-90 shadow-[#0081FF]/30 border border-[#0081FF]/20'
                                }`}
                        >
                            {isPlaying ? (
                                <><span className="material-symbols-rounded text-lg">stop</span> Stop</>
                            ) : (
                                <><span className="material-symbols-rounded text-lg">play_arrow</span> Play</>
                            )}
                        </button>
                        <button
                            onClick={cycleSoundMode}
                            className="bg-[#1A1F2E] hover:bg-[#252A3B] rounded-xl text-[#0081FF] font-black tracking-tighter uppercase text-[9px] border border-[#0081FF]/20 transition-all active:scale-95 shadow-lg shadow-black/20 flex flex-col items-center justify-center leading-none px-1"
                        >
                            <span className="text-[8px] text-gray-500 font-bold mb-0.5 opacity-50">SOM:</span>
                            {SOUND_OPTIONS.find(opt => opt.id === soundMode)?.label}
                        </button>
                    </div>

                    {/* --- STUDY TIMER SECTION --- */}
                    <div className="w-full bg-[#1A1F2E] rounded-2xl p-4 border border-white/5 mt-2">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                                    <span className="material-symbols-rounded text-xl">speed</span>
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
                                        ? 'bg-[#0081FF] text-white border-[#0081FF] shadow-lg shadow-[#0081FF]/20'
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
                                            ? 'bg-[#0081FF] text-white border-[#0081FF] shadow-lg shadow-[#0081FF]/20'
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
                            <label htmlFor="record-bpm" className="sr-only">Meu Recorde</label>
                            <input
                                id="record-bpm"
                                type="number"
                                value={myBpm}
                                onChange={(e) => setMyBpm(e.target.value)}
                                placeholder="000"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-center font-mono text-xl font-bold text-white placeholder-white/10 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#0081FF]/5 transition-all"
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
                                <div className="w-10 h-10 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                                    <span className="material-symbols-rounded">menu_book</span>
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg leading-tight">Diretrizes Fundamentais</h2>
                                    <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">O que separa o músico amador do profissional!</span>
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

                            <div className="bg-[#0081FF]/10 rounded-2xl p-6 border border-[#0081FF]/20 shadow-lg shadow-[#0081FF]/5">
                                <h3 className="text-[#0081FF] font-black text-lg mb-2 flex items-center gap-2">
                                    <span>🎯</span> O METRÔNOMO NÃO É PRESSA — É CONTROLE
                                </h3>
                                <p className="text-white text-sm font-medium leading-relaxed">
                                    O objetivo do metrônomo não é tocar rápido. É tocar certo, estável e consciente.
                                    <span className="block mt-2 text-[#00C1D4]">Velocidade vem sozinha quando o cérebro aprende o movimento com precisão.</span>
                                </p>
                            </div>

                            <section className="space-y-4">
                                <h4 className="text-white font-bold text-base flex items-center gap-2">
                                    <span>📏</span> REGRA DE OURO
                                </h4>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                                    <p>Sempre comece mais lento do que você acha que precisa.</p>
                                    <ul className="grid grid-cols-1 gap-2 text-xs">
                                        <li className="flex items-center gap-2 text-green-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                            Se parece fácil → está no tempo certo.
                                        </li>
                                        <li className="flex items-center gap-2 text-red-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                            Se parece difícil → está rápido demais.
                                        </li>
                                    </ul>
                                    <p className="text-[10px] text-gray-500 italic mt-2">A evolução acontece no conforto controlado, não no desespero.</p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-white font-bold text-base flex items-center gap-2">
                                    <span>⏱️</span> COMO USAR CORRETAMENTE
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <span className="text-[#0081FF] font-bold block mb-1">1. Escolha um tempo confortável</span>
                                        <p>Algo entre 50 e 70 BPM para começar. Se errar → abaixe o BPM. <span className="text-[#0081FF] font-bold">Sem ego.</span></p>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <span className="text-[#0081FF] font-bold block mb-1">2. Toque sem correr atrás do clique</span>
                                        <p>O clique não é algo pra “perseguir”. Ele é o chão firme onde você pisa. Você deve encaixar as notas dentro do pulso, não depois.</p>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <span className="text-[#0081FF] font-bold block mb-1">3. Só aumente quando estiver 100% limpo</span>
                                        <ul className="flex flex-wrap gap-3 mt-2">
                                            <li className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-md text-green-400">✔ SEM TROPEÇAR</li>
                                            <li className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-md text-green-400">✔ SEM ACELERAR</li>
                                            <li className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-md text-green-400">✔ SEM TENSÃO</li>
                                        </ul>
                                        <p className="mt-3">Aí sim aumente 2 a 5 BPM no máximo. Mais que isso é sabotagem.</p>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <section className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                        <span>🧠</span> EXPECTATIVA
                                    </h4>
                                    <p className="text-gray-400">Não vai soar incrível em 10 minutos. Sólido em semanas. Excelente em meses. Profissional em anos.</p>
                                </section>
                                <section className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                        <span>🧘</span> EFICIÊNCIA
                                    </h4>
                                    <p className="text-gray-400">Estudar devagar: fixa coordenação, melhora precisão, elimina erros de raiz.</p>
                                </section>
                            </div>

                            <section className="bg-[#1A1F2E] p-5 rounded-2xl border border-[#0081FF]/20">
                                <h4 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                                    <span>📈</span> USO INTELIGENTE
                                </h4>
                                <ul className="space-y-2 text-xs">
                                    <li className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                                        <span className="text-gray-400">Tempo Ideal</span>
                                        <span className="text-white font-bold">10 a 20 min</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                                        <span className="text-gray-400">Foco</span>
                                        <span className="text-white font-bold">Total</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                                        <span className="text-gray-400">Aumento</span>
                                        <span className="text-white font-bold">Gradual</span>
                                    </li>
                                </ul>
                                <p className="text-[10px] text-center text-[#0081FF] font-bold mt-4 uppercase tracking-widest">Pouco tempo bem feito &gt; horas bagunçadas</p>
                            </section>

                            <section className="bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
                                <h4 className="text-red-400 font-bold text-base mb-3 flex items-center gap-2">
                                    <span>🚫</span> ERROS CLÁSSICOS (EVITE)
                                </h4>
                                <ul className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-tight" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                                    <li className="bg-red-500/10 p-2 rounded-lg border border-red-500/10 text-red-300">❌ SÓ PRA AQUECER</li>
                                    <li className="bg-red-500/10 p-2 rounded-lg border border-red-500/10 text-red-300">❌ SUBIR POR ANSIEDADE</li>
                                    <li className="bg-red-500/10 p-2 rounded-lg border border-red-500/10 text-red-300">❌ IGNORAR ERROS</li>
                                    <li className="bg-red-500/10 p-2 rounded-lg border border-red-500/10 text-red-300">❌ COMPETIR</li>
                                </ul>
                            </section>

                            <section className="bg-green-500/5 p-5 rounded-2xl border border-green-500/10">
                                <h4 className="text-green-400 font-bold text-base mb-3 flex items-center gap-2">
                                    <span>✅</span> A VERDADE REAL
                                </h4>
                                <p className="text-xs mb-3 text-green-200/70">O metrônomo melhora groove, afinação rítmica, segurança e acelera o aprendizado.</p>
                                <div className="text-[#0081FF] font-bold italic text-center p-4 bg-[#0081FF]/5 rounded-xl border border-[#0081FF]/10">
                                    “Quem domina o tempo domina a música. O metrônomo não limita — ele liberta sua evolução.”
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            )}
        </div>


    );
};
