
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface Props {
    onBack: () => void;
}

const NOTE_FREQUENCIES: Record<string, number> = {
    'Pt-BR': 440, // Base reference
};

// Gerar frequências baseadas em A4 = 440Hz
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

// Mapeamento visual das teclas
const KEY_CONFIG = [
    { note: 'C', type: 'white' },
    { note: 'C#', type: 'black', offset: 1.4 }, // Percent relative to previous white key width approx
    { note: 'D', type: 'white' },
    { note: 'D#', type: 'black', offset: 1.6 },
    { note: 'E', type: 'white' },
    { note: 'F', type: 'white' },
    { note: 'F#', type: 'black', offset: 1.3 },
    { note: 'G', type: 'white' },
    { note: 'G#', type: 'black', offset: 1.5 },
    { note: 'A', type: 'white' },
    { note: 'A#', type: 'black', offset: 1.7 },
    { note: 'B', type: 'white' },
];

export const PianoScreen: React.FC<Props> = ({ onBack }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeNote, setActiveNote] = useState<{ note: string, freq: number } | null>(null);
    const samplerRef = useRef<Tone.Sampler | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initialize Audio
    useEffect(() => {
        const sampler = new Tone.Sampler({
            urls: {
                "A0": "A0.mp3",
                "C1": "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                "A1": "A1.mp3",
                "C2": "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                "A2": "A2.mp3",
                "C3": "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                "A3": "A3.mp3",
                "C4": "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                "A4": "A4.mp3",
                "C5": "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                "A5": "A5.mp3",
                "C6": "C6.mp3",
                "D#6": "Ds6.mp3",
                "F#6": "Fs6.mp3",
                "A6": "A6.mp3",
                "C7": "C7.mp3",
                "D#7": "Ds7.mp3",
                "F#7": "Fs7.mp3",
                "A7": "A7.mp3",
                "C8": "C8.mp3"
            },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => {
                setIsLoaded(true);
                // Center scroll to C4
                if (scrollContainerRef.current) {
                    // Approx C4 position calculation
                    // C4 is start of 3rd octave shown (2, 3, 4) if array is [2,3,4,5,6]
                    // Better: find element by ID later or just center roughly
                    const scrollWidth = scrollContainerRef.current.scrollWidth;
                    scrollContainerRef.current.scrollLeft = scrollWidth * 0.4;
                }
            }
        }).toDestination();

        samplerRef.current = sampler;

        return () => {
            sampler.dispose();
        };
    }, []);

    const playNote = async (note: string) => {
        if (!samplerRef.current || !isLoaded) return;

        // Ensure AudioContext is running
        await Tone.start();
        if (Tone.context.state !== 'running') await Tone.context.resume();

        samplerRef.current.triggerAttack(note);
        setActiveNote({ note, freq: parseFloat(getFrequency(note).toFixed(2)) });
    };

    const stopNote = (note: string) => {
        if (samplerRef.current && isLoaded) {
            samplerRef.current.triggerRelease(note);
        }
        // Only clear if it's the current note (handle multi-touch edge cases)
        setActiveNote(prev => prev?.note === note ? null : prev);
    };

    // Generate Key List (Flat array for rendering)
    const renderKeys = () => {
        const keys: JSX.Element[] = [];

        OCTAVES.forEach(octave => {
            // We render White keys as the main flow, and Black keys as absolute children of the container wrapper
            // Wait, standard HTML approach:
            // Render a container for the octave?
            // Let's render note by note.

            // Actually, easiest CSS approach:
            // Flex container.
            // White keys are relative.
            // Black keys are absolute, positioned between white keys.
            // But to make it scrollable, we need a single long flex container of white keys, 
            // and black keys interleaved?
            // No, interleave structure:
            // <div class="relative"> <WhiteKey C /> <BlackKey C# /> <WhiteKey D /> ... </div>
            // But BlackKey C# needs to sit ON TOP of the border between C and D.
            // So:
            // <div class="flex">
            //   <div class="relative"> <WhiteKey C /> <BlackKey C# absolute check_right /> </div>
            //   <div class="relative"> <WhiteKey D /> <BlackKey D# absolute check_right /> </div>
            //   <div class="relative"> <WhiteKey E /> </div>
            //   ...
            // </div>

            NOTES.forEach(noteName => {
                if (noteName.includes('#')) return; // handled by previous white key

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
                                {/* <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-[8px]">{sharpNote}</span> */}
                            </button>
                        )}
                    </div>
                );
            });
        });

        return keys;
    };

    return (
        <div className="min-h-screen bg-[#101622] flex flex-col animate-in fade-in duration-300">

            {/* Header */}
            <div className="pt-8 px-6 pb-4 bg-[#101622] border-b border-white/5 flex items-center justify-between z-30">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-white">Piano Virtual</h1>
                </div>
                {!isLoaded && (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#FF00BC]">
                        <span className="w-2 h-2 rounded-full bg-[#FF00BC] animate-ping"></span>
                        CARREGANDO SONS...
                    </div>
                )}
            </div>

            {/* Info Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#151A23] to-[#101622]">

                <div className={`
             transition-all duration-200 transform
             ${activeNote ? 'scale-100 opacity-100' : 'scale-95 opacity-50 grayscale'}
        `}>
                    {/* Note Name Big */}
                    <div className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 leading-none drop-shadow-lg font-sans tracking-tighter">
                        {activeNote ? activeNote.note.replace(/[0-9]/g, '') : '-'}
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-2">
                        {/* Octave Badge */}
                        <div className="px-4 py-1 rounded-full bg-white/10 border border-white/10 text-white font-bold text-xl backdrop-blur-md">
                            {activeNote ? activeNote.note.slice(-1) : '-'} <span className="text-xs text-gray-500 uppercase ml-1">Oitava</span>
                        </div>

                        {/* Frequency Badge */}
                        <div className="px-4 py-1 rounded-full bg-[#0081FF]/20 border border-[#0081FF]/30 text-[#0081FF] font-bold text-xl backdrop-blur-md font-mono">
                            {activeNote ? `${activeNote.freq} Hz` : '- Hz'}
                        </div>
                    </div>

                    {activeNote && (
                        <p className="text-gray-400 text-xs mt-6 animate-pulse">Toque para ouvir a nota</p>
                    )}
                </div>

                {/* Placeholder text if no note */}
                {!activeNote && (
                    <p className="text-gray-500 text-sm mt-8 animate-pulse">
                        Toque em qualquer tecla...
                    </p>
                )}

            </div>

            {/* Keyboard Area */}
            <div
                ref={scrollContainerRef}
                className="h-[320px] bg-[#0d121c] border-t-4 border-[#FF00BC] relative overflow-x-auto hide-scrollbar touch-pan-x shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]"
            >
                <div className="flex px-[50vw] h-full pt-10 pb-10 min-w-min">
                    {renderKeys()}
                </div>

                {/* Shadow Gradients for scroll hint */}
                <div className="fixed left-0 bottom-0 w-12 h-[320px] bg-gradient-to-r from-[#101622] to-transparent pointer-events-none z-30"></div>
                <div className="fixed right-0 bottom-0 w-12 h-[320px] bg-gradient-to-l from-[#101622] to-transparent pointer-events-none z-30"></div>

                {/* Center Marker */}
                {/* <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-500/20 pointer-events-none z-0"></div> */}
            </div>

        </div>
    );
};
