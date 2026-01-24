
import React, { useState, useMemo } from 'react';
import { WheelPicker } from './WheelPicker';
import { NoteName, NOTES } from '../../types';

type ViewMode = 'Full' | 'Vertical' | 'Diagonal';
type ScaleCategory = 'Common' | 'Rare' | 'Exotic';

const SCALE_INTERVALS: Record<string, number[]> = {
    // Common
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
    'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
    'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
    'Pentatonic Major': [0, 2, 4, 7, 9],
    'Pentatonic Minor': [0, 3, 5, 7, 10],
    'Pentatonic Blues': [0, 3, 5, 6, 7, 10],
    'Pentatonic Neutral': [0, 2, 5, 7, 10],
    // Modes
    'Ionian': [0, 2, 4, 5, 7, 9, 11],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'Aeolian': [0, 2, 3, 5, 7, 8, 10],
    'Locrian': [0, 1, 3, 5, 6, 8, 10],
    // Rare
    'Diatonic': [0, 2, 4, 5, 7, 9, 11],
    'Diminished': [0, 2, 3, 5, 6, 8, 9, 11],
    'Diminished Half': [0, 1, 3, 4, 6, 7, 9, 10],
    'Diminished Whole': [0, 2, 3, 5, 6, 8, 9, 11],
    'Diminished Whole Tone': [0, 2, 4, 6, 8, 10],
    'Dominant 7th': [0, 2, 4, 5, 7, 9, 10],
    'Lydian Augmented': [0, 2, 4, 6, 8, 9, 11],
    'Lydian Minor': [0, 2, 4, 6, 7, 8, 10],
    'Lydian Diminished': [0, 2, 3, 6, 7, 9, 11]
};

const GUITAR_STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']; // High to Low

export const Scales: React.FC = () => {
    const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
    const [selectedType, setSelectedType] = useState('Major');
    const [viewMode, setViewMode] = useState<ViewMode>('Full');
    const [category, setCategory] = useState<ScaleCategory>('Common');
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const roots: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    const scalesByCategory: Record<ScaleCategory, string[]> = {
        'Common': ['Major', 'Harmonic Minor', 'Melodic Minor', 'Natural Minor', 'Pentatonic Major', 'Pentatonic Minor', 'Pentatonic Blues', 'Pentatonic Neutral'],
        'Rare': ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian', 'Diatonic', 'Diminished', 'Diminished Half', 'Diminished Whole', 'Diminished Whole Tone', 'Dominant 7th'],
        'Exotic': ['Lydian Augmented', 'Lydian Minor', 'Lydian Diminished']
    };

    // Generate scale notes with intervals
    const scaleNotesWithIntervals = useMemo(() => {
        const intervals = SCALE_INTERVALS[selectedType] || SCALE_INTERVALS['Major'];
        const rootIndex = NOTES.indexOf(selectedRoot);
        return intervals.map(interval => ({
            note: NOTES[(rootIndex + interval) % 12],
            interval: interval,
            degree: intervals.indexOf(interval) + 1
        }));
    }, [selectedRoot, selectedType]);

    // Generate all fretboard positions
    const allPositions = useMemo(() => {
        const pos: Array<{ string: number; fret: number; note: NoteName; degree: number; isRoot: boolean }> = [];

        GUITAR_STRINGS.forEach((openString, stringIndex) => {
            const stringRootIndex = NOTES.indexOf(openString);

            for (let fret = 0; fret <= 21; fret++) {
                const noteAtFret = NOTES[(stringRootIndex + fret) % 12];
                const scaleNote = scaleNotesWithIntervals.find(sn => sn.note === noteAtFret);

                if (scaleNote) {
                    pos.push({
                        string: stringIndex,
                        fret,
                        note: noteAtFret,
                        degree: scaleNote.degree,
                        isRoot: noteAtFret === selectedRoot
                    });
                }
            }
        });

        return pos;
    }, [scaleNotesWithIntervals, selectedRoot]);

    return (
        <div className="flex flex-col items-center p-6 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-4">
                <button className="text-gray-500 text-sm">⚙️ Settings</button>
                <div className="flex flex-col items-center">
                    <button
                        onClick={() => setIsPickerOpen(true)}
                        className="text-2xl font-bold text-white flex items-center gap-2"
                    >
                        {selectedRoot} {selectedType} 🔊
                    </button>
                    <span className="text-xs text-gray-400">
                        {scaleNotesWithIntervals.map(sn => sn.degree).join(', ')}
                    </span>
                </div>
                <button className="text-gray-500 text-sm">🎵 Tunings</button>
            </div>

            {/* Fretboard */}
            <div className="w-full overflow-x-auto mb-6">
                <div className="min-w-[900px] relative">
                    {/* Fret Numbers */}
                    <div className="flex mb-2">
                        {Array.from({ length: 22 }, (_, i) => (
                            <div key={i} className="flex-1 text-center text-[10px] text-gray-500 font-mono min-w-[40px]">
                                {i === 0 ? 'O' : i}
                            </div>
                        ))}
                    </div>

                    {/* Strings */}
                    <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4">
                        {GUITAR_STRINGS.map((stringName, stringIndex) => (
                            <div key={stringIndex} className="relative h-12 flex items-center mb-1">
                                {/* String Label */}
                                <div className="absolute -left-8 text-xs text-gray-400 font-bold">{stringName}</div>

                                {/* String Line */}
                                <div className="absolute inset-x-0 h-px bg-gray-600" />

                                {/* Frets */}
                                {Array.from({ length: 22 }, (_, fret) => (
                                    <div key={fret} className="flex-1 min-w-[40px] relative">
                                        {/* Fret Line */}
                                        {fret > 0 && (
                                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-700" />
                                        )}

                                        {/* Note Dot */}
                                        {allPositions
                                            .filter(p => p.string === stringIndex && p.fret === fret)
                                            .map((pos, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black z-10 ${pos.isRoot
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-yellow-400 text-black'
                                                        }`}
                                                >
                                                    {pos.degree}
                                                </div>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* View Mode Buttons */}
            <div className="flex gap-2 mb-6">
                {(['Full', 'Vertical', 'Diagonal'] as ViewMode[]).map(mode => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === mode
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {/* Scale Categories */}
            <div className="flex gap-2 mb-4 w-full">
                {(['Common', 'Rare', 'Exotic'] as ScaleCategory[]).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${category === cat
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Scale Grid */}
            <div className="grid grid-cols-3 gap-2 w-full">
                {scalesByCategory[category].map(scale => (
                    <button
                        key={scale}
                        onClick={() => setSelectedType(scale)}
                        className={`p-3 rounded-lg text-xs font-bold transition-all ${selectedType === scale
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                    >
                        {scale}
                    </button>
                ))}
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
                                width="w-1/3"
                            />
                            <WheelPicker
                                items={scalesByCategory[category]}
                                value={selectedType}
                                onChange={setSelectedType}
                                width="w-2/3"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
