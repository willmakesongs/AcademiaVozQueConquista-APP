
import React, { useState, useMemo } from 'react';
import { NoteName, NOTES } from '../../types';

type ViewMode = 'Full' | 'Vertical';

const SCALE_INTERVALS: Record<string, number[]> = {
    // Row 1
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
    'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
    'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
    // Row 2
    'Pentatonic Major': [0, 2, 4, 7, 9],
    'Pentatonic Minor': [0, 3, 5, 7, 10],
    'Pentatonic Blues': [0, 3, 5, 6, 7, 10],
    'Pentatonic Neutral': [0, 2, 5, 7, 10],
    // Row 3
    'Ionian': [0, 2, 4, 5, 7, 9, 11],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    // Row 4
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'Aeolian': [0, 2, 3, 5, 7, 8, 10],
    'Locrian': [0, 1, 3, 5, 6, 8, 10],
    'Diatonic': [0, 2, 4, 5, 7, 9, 11],
    // Row 5
    'Diminished': [0, 2, 3, 5, 6, 8, 9, 11],
    'Diminished, Half': [0, 1, 3, 4, 6, 7, 9, 10],
    'Diminished, Whole': [0, 2, 3, 5, 6, 8, 9, 11],
    'Diminished Whole Tone': [0, 2, 4, 6, 8, 10],
    // Row 6
    'Dominant 7th': [0, 2, 4, 5, 7, 9, 10],
    'Lydian Augmented': [0, 2, 4, 6, 8, 9, 11],
    'Lydian Minor': [0, 2, 4, 6, 7, 8, 10],
    'Lydian Diminished': [0, 2, 3, 6, 7, 9, 11]
};

const GUITAR_STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']; // High to Low

const SCALE_ROWS = [
    ['Major', 'Harmonic Minor', 'Melodic Minor', 'Natural Minor'],
    ['Pentatonic Major', 'Pentatonic Minor', 'Pentatonic Blues', 'Pentatonic Neutral'],
    ['Ionian', 'Dorian', 'Phrygian', 'Lydian'],
    ['Mixolydian', 'Aeolian', 'Locrian', 'Diatonic'],
    ['Diminished', 'Diminished, Half', 'Diminished, Whole', 'Diminished Whole Tone'],
    ['Dominant 7th', 'Lydian Augmented', 'Lydian Minor', 'Lydian Diminished']
];

export const Scales: React.FC = () => {
    const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
    const [selectedType, setSelectedType] = useState('Major');
    const [viewMode, setViewMode] = useState<ViewMode>('Full');

    const roots: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

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

    // Generate fretboard positions (0-7 frets visible)
    const allPositions = useMemo(() => {
        const pos: Array<{ string: number; fret: number; note: NoteName; degree: number; isRoot: boolean }> = [];

        GUITAR_STRINGS.forEach((openString, stringIndex) => {
            const stringRootIndex = NOTES.indexOf(openString);

            for (let fret = 0; fret <= 7; fret++) {
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
        <div className="flex flex-col items-center p-4 pb-32 bg-[#101622]">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-4">
                <button className="text-gray-500 text-sm px-3 py-1 bg-gray-800 rounded">{'<<'}</button>
                <div className="flex flex-col items-center">
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                        {selectedRoot} {selectedType} 🔊
                    </div>
                </div>
                <button className="text-gray-500 text-sm px-3 py-1 bg-gray-800 rounded">{'>>'}</button>
            </div>

            {/* Fret Numbers */}
            <div className="flex w-full mb-2 px-8">
                {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex-1 text-center text-xs text-gray-400 font-mono">
                        {i}
                    </div>
                ))}
            </div>

            {/* Fretboard */}
            <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-2 mb-4">
                {GUITAR_STRINGS.map((stringName, stringIndex) => (
                    <div key={stringIndex} className="relative h-12 flex items-center">
                        {/* String Label */}
                        <div className="absolute -left-6 text-xs text-gray-300 font-bold w-4">{stringName}</div>

                        {/* String Line */}
                        <div className="absolute inset-x-0 h-0.5 bg-gray-600" />

                        {/* Frets */}
                        <div className="flex w-full">
                            {Array.from({ length: 8 }, (_, fret) => (
                                <div key={fret} className="flex-1 relative h-12">
                                    {/* Fret Line */}
                                    {fret > 0 && (
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-700" />
                                    )}

                                    {/* Note Dot */}
                                    {allPositions
                                        .filter(p => p.string === stringIndex && p.fret === fret)
                                        .map((pos, idx) => (
                                            <div
                                                key={idx}
                                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black z-10 ${pos.isRoot
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-yellow-400 text-black'
                                                    }`}
                                            >
                                                {pos.note}
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* View Mode Buttons */}
            <div className="flex gap-2 mb-4 w-full">
                {(['Full', 'Vertical'] as ViewMode[]).map(mode => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === mode
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {/* Root Note Selector */}
            <div className="grid grid-cols-6 gap-1 w-full mb-4">
                {roots.slice(0, 6).map(root => (
                    <button
                        key={root}
                        onClick={() => setSelectedRoot(root)}
                        className={`py-3 rounded text-sm font-bold transition-all ${selectedRoot === root
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                    >
                        {root}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-6 gap-1 w-full mb-4">
                {roots.slice(6).map(root => (
                    <button
                        key={root}
                        onClick={() => setSelectedRoot(root)}
                        className={`py-3 rounded text-sm font-bold transition-all ${selectedRoot === root
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                    >
                        {root}
                    </button>
                ))}
            </div>

            {/* Scale Grid */}
            {SCALE_ROWS.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-4 gap-1 w-full mb-2">
                    {row.map(scale => (
                        <button
                            key={scale}
                            onClick={() => setSelectedType(scale)}
                            className={`py-3 rounded text-[10px] font-bold transition-all ${selectedType === scale
                                    ? rowIdx === 0 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                                    : 'bg-gray-700 text-gray-400'
                                }`}
                        >
                            {scale}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};
