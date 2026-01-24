
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

    // Generate fretboard positions (limit to first 12 frets, one note per string)
    const positions = useMemo(() => {
        const pos: Array<{ string: number; fret: number; note: NoteName; isRoot: boolean }> = [];

        GUITAR_STRINGS.forEach((openString, stringIndex) => {
            const stringRootIndex = NOTES.indexOf(openString);

            // Find the first occurrence of each scale note on this string
            for (let fret = 0; fret <= 12; fret++) {
                const noteAtFret = NOTES[(stringRootIndex + fret) % 12];
                if (scaleNotes.includes(noteAtFret)) {
                    const isRoot = noteAtFret === selectedRoot;
                    pos.push({ string: stringIndex, fret, note: noteAtFret, isRoot });
                    break; // Only first occurrence per string
                }
            }
        });

        return pos;
    }, [scaleNotes, selectedRoot]);

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
            <div className="flex gap-2 mb-8">
                {scaleNotes.map((note, idx) => (
                    <div
                        key={idx}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${note === selectedRoot ? 'bg-orange-500 text-white' : 'bg-[#0081FF] text-white'}`}
                    >
                        {note}
                    </div>
                ))}
            </div>

            {/* Fretboard Diagram */}
            <div className="relative pt-10 pb-20 w-full max-w-[280px]">
                {/* Fret Number Labels */}
                <div className="absolute left-[-30px] top-10 flex flex-col gap-[39.5px] text-[10px] text-gray-600 font-mono">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(f => <span key={f}>{f}</span>)}
                </div>

                {/* Fretboard Grid */}
                <div className="flex justify-between border-t-4 border-gray-400">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-px h-[500px] bg-gray-600 relative">
                            {/* Horizontal Frets */}
                            {Array.from({ length: 13 }).map((_, f) => (
                                <div key={f} className="absolute left-[-40px] right-[-40px] h-px bg-white/10" style={{ top: `${f * 40}px` }} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Scale Notes on Fretboard */}
                {positions.map((pos, idx) => (
                    <div
                        key={idx}
                        className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black z-10 transition-all ${pos.fret === 0
                                ? 'top-[-40px] bg-[#0081FF] border-[#101622] text-white'
                                : pos.isRoot
                                    ? 'bg-orange-500 border-[#101622] text-white'
                                    : 'bg-white border-[#101622] text-[#101622]'
                            }`}
                        style={{
                            left: `${(pos.string) * 20}%`,
                            top: pos.fret === 0 ? '-40px' : `${(pos.fret * 40) - 20}px`,
                            marginLeft: pos.string === 0 ? '0' : pos.string === 5 ? '-32px' : '-16px'
                        }}
                    >
                        {pos.isRoot ? 'R' : pos.note}
                    </div>
                ))}

                {/* Fret Markers (3rd, 5th, 7th, 9th, 12th) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-[100px] w-3 h-3 rounded-full bg-white/10" />
                <div className="absolute left-1/2 -translate-x-1/2 top-[180px] w-3 h-3 rounded-full bg-white/10" />
                <div className="absolute left-1/2 -translate-x-1/2 top-[260px] w-3 h-3 rounded-full bg-white/10" />
                <div className="absolute left-1/2 -translate-x-1/2 top-[340px] w-3 h-3 rounded-full bg-white/10" />
                <div className="absolute left-1/2 -translate-x-1/2 top-[460px] w-3 h-3 rounded-full bg-white/10" />
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
