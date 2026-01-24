
import React, { useState, useMemo } from 'react';
import { WheelPicker } from './WheelPicker';
import { NoteName, NOTES } from '../../types';

type ScaleTab = 'Básico' | 'Modos' | 'Avançado' | 'Arpejo';

const SCALE_INTERVALS: Record<string, number[]> = {
    'Major Pentatonic': [0, 2, 4, 7, 9],
    'Minor Pentatonic': [0, 3, 5, 7, 10],
    'Blues': [0, 3, 5, 6, 7, 10],
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Minor Natural': [0, 2, 3, 5, 7, 8, 10],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10]
};

const GUITAR_STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']; // High to Low

// Scale patterns (position 1 - open position)
const SCALE_PATTERNS: Record<string, number[][]> = {
    'Major Pentatonic': [
        [0, 3], // E string
        [0, 2], // B string  
        [0, 2], // G string
        [0, 2], // D string
        [0, 3], // A string
        [0, 3]  // E string
    ],
    'Minor Pentatonic': [
        [0, 3], // E string
        [0, 3], // B string
        [0, 2], // G string
        [0, 2], // D string
        [0, 3], // A string
        [0, 3]  // E string
    ]
};

export const Scales: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ScaleTab>('Básico');
    const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
    const [selectedType, setSelectedType] = useState('Major Pentatonic');
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const roots: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const types = ["Major Pentatonic", "Minor Pentatonic", "Blues", "Major", "Minor Natural", "Dorian", "Phrygian", "Lydian", "Mixolydian"];

    // Generate scale notes
    const scaleNotes = useMemo(() => {
        const intervals = SCALE_INTERVALS[selectedType] || SCALE_INTERVALS['Major Pentatonic'];
        const rootIndex = NOTES.indexOf(selectedRoot);
        return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
    }, [selectedRoot, selectedType]);

    // Generate scale pattern positions
    const positions = useMemo(() => {
        const pattern = SCALE_PATTERNS[selectedType] || SCALE_PATTERNS['Major Pentatonic'];
        const rootIndex = NOTES.indexOf(selectedRoot);
        const pos: Array<{ string: number; fret: number; note: NoteName; isRoot: boolean; finger: number }> = [];

        GUITAR_STRINGS.forEach((openString, stringIndex) => {
            const stringRootIndex = NOTES.indexOf(openString);
            const frets = pattern[stringIndex] || [0, 2];

            frets.forEach((fret, idx) => {
                const noteAtFret = NOTES[(stringRootIndex + fret) % 12];
                if (scaleNotes.includes(noteAtFret)) {
                    const isRoot = noteAtFret === selectedRoot;
                    // Finger numbering: 0=open, 1=index, 2=middle, 3=ring, 4=pinky
                    let finger = 0;
                    if (fret > 0) {
                        finger = idx === 0 ? (fret === 2 ? 2 : 1) : 3;
                    }
                    pos.push({ string: stringIndex, fret, note: noteAtFret, isRoot, finger });
                }
            });
        });

        return pos;
    }, [scaleNotes, selectedRoot, selectedType]);

    return (
        <div className="flex flex-col items-center p-6">
            {/* Top Tabs */}
            <div className="flex w-full bg-white/5 rounded-xl p-1 mb-8">
                {(['Básico', 'Modos', 'Avançado', 'Arpejo'] as ScaleTab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <button
                onClick={() => setIsPickerOpen(true)}
                className="text-[#0081FF] text-4xl font-light mb-8 font-sans active:scale-95 transition-all text-center"
            >
                {selectedRoot} {selectedType}
            </button>

            {/* Scale Notes Display */}
            <div className="flex gap-2 mb-8 flex-wrap justify-center">
                {scaleNotes.map((note, idx) => (
                    <div
                        key={idx}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${note === selectedRoot ? 'bg-black text-white' : 'bg-[#0081FF] text-white'}`}
                    >
                        {note}
                    </div>
                ))}
            </div>

            {/* Fretboard Diagram */}
            <div className="relative pt-10 pb-20 w-full max-w-[320px]">
                {/* String Labels (Top) - Open indicators */}
                <div className="flex justify-between mb-4 px-2">
                    {GUITAR_STRINGS.map((_, stringIndex) => {
                        const openNote = positions.find(p => p.string === stringIndex && p.fret === 0);
                        return (
                            <div key={stringIndex} className="w-10 text-center">
                                {openNote && (
                                    <div className="w-8 h-8 mx-auto rounded-full bg-[#0081FF] border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                                        0
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Fret Number Labels */}
                <div className="absolute left-[-30px] top-10 flex flex-col gap-[46px] text-[10px] text-gray-600 font-mono">
                    {[1, 2, 3, 4, 5, 6, 7].map(f => <span key={f}>{f}</span>)}
                </div>

                {/* Fretboard Grid */}
                <div className="flex justify-between border-t-4 border-gray-400 relative">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-px h-[350px] bg-gray-600 relative">
                            {/* Horizontal Frets */}
                            {Array.from({ length: 8 }).map((_, f) => (
                                <div key={f} className="absolute left-[-40px] right-[-40px] h-px bg-white/10" style={{ top: `${f * 50}px` }} />
                            ))}
                        </div>
                    ))}

                    {/* Scale Notes on Fretboard */}
                    {positions.filter(p => p.fret > 0 && p.fret <= 7).map((pos, idx) => (
                        <div
                            key={idx}
                            className={`absolute w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-black z-10 transition-all ${pos.isRoot
                                    ? 'bg-black border-white text-white'
                                    : 'bg-[#0081FF] border-white text-white'
                                }`}
                            style={{
                                left: `${(pos.string) * 20}%`,
                                top: `${(pos.fret * 50) - 25}px`,
                                marginLeft: pos.string === 0 ? '0' : pos.string === 5 ? '-36px' : '-18px'
                            }}
                        >
                            {pos.finger}
                        </div>
                    ))}

                    {/* Fret Markers (3rd, 5th, 7th) */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-[125px] w-3 h-3 rounded-full bg-white/10" />
                    <div className="absolute left-1/2 -translate-x-1/2 top-[225px] w-3 h-3 rounded-full bg-white/10" />
                    <div className="absolute left-1/2 -translate-x-1/2 top-[325px] w-3 h-3 rounded-full bg-white/10" />
                </div>
            </div>

            {/* Rolling Picker Panel */}
            {isPickerOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsPickerOpen(false)} />

                    <div className="relative w-full max-w-md bg-[#1A202C] rounded-t-[32px] border-t border-white/10 p-6 pb-12 pointer-events-auto animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setIsPickerOpen(false)}
                                className="text-[#0081FF] font-bold uppercase tracking-widest text-sm py-2 px-4"
                            >
                                Pronto
                            </button>
                        </div>

                        <div className="flex justify-between items-center bg-black/20 rounded-2xl p-4">
                            <WheelPicker
                                items={roots}
                                value={selectedRoot}
                                onChange={setSelectedRoot}
                                width="w-1/2"
                            />
                            <WheelPicker
                                items={types}
                                value={selectedType}
                                onChange={setSelectedType}
                                width="w-1/2"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
