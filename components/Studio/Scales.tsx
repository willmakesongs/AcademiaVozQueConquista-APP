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
    const [viewMode, setViewMode] = useState<ViewMode>('Vertical');
    const [selectedPosition, setSelectedPosition] = useState(0); // Starting position (fret)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Settings
    const [handedness, setHandedness] = useState<'Right' | 'Left'>('Right');
    const [fretboardOrientation, setFretboardOrientation] = useState<'Horizontal' | 'Vertical'>('Horizontal');
    const [accidentals, setAccidentals] = useState<'Sharp' | 'Flat'>('Sharp');
    const [autoSound, setAutoSound] = useState<'Off' | 'On'>('Off');

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

    // Generate FULL fretboard positions (all scale notes across entire visible range)
    const fullPositions = useMemo(() => {
        const pos: Array<{ string: number; fret: number; note: NoteName; degree: number; isRoot: boolean }> = [];
        const startFret = selectedPosition;
        const fretRange = 12; // Show 12 frets in Full mode

        GUITAR_STRINGS.forEach((openString, stringIndex) => {
            const stringRootIndex = NOTES.indexOf(openString);

            // Find ALL scale notes on this string within the range
            for (let fret = startFret; fret < startFret + fretRange; fret++) {
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
    }, [scaleNotesWithIntervals, selectedRoot, selectedPosition]);

    // Generate box pattern positions (2-3 notes per string within 4-5 fret span) for Vertical mode
    const boxPositions = useMemo(() => {
        const pos: Array<{ string: number; fret: number; note: NoteName; degree: number; isRoot: boolean }> = [];
        const startFret = selectedPosition;
        const fretRange = selectedPosition === 0 ? 4 : 5; // Smaller range for open position

        GUITAR_STRINGS.forEach((openString, stringIndex) => {
            const stringRootIndex = NOTES.indexOf(openString);
            const notesOnString: typeof pos = [];

            // Find all scale notes on this string within the range
            for (let fret = startFret; fret < startFret + fretRange; fret++) {
                const noteAtFret = NOTES[(stringRootIndex + fret) % 12];
                const scaleNote = scaleNotesWithIntervals.find(sn => sn.note === noteAtFret);

                if (scaleNote) {
                    notesOnString.push({
                        string: stringIndex,
                        fret,
                        note: noteAtFret,
                        degree: scaleNote.degree,
                        isRoot: noteAtFret === selectedRoot
                    });
                }
            }

            // Take first 2-3 notes per string
            pos.push(...notesOnString.slice(0, 3));
        });

        return pos;
    }, [scaleNotesWithIntervals, selectedRoot, selectedPosition]);

    // Choose which positions to display based on view mode
    const displayPositions = viewMode === 'Full' ? fullPositions : boxPositions;
    const displayFrets = viewMode === 'Full' ? 12 : (selectedPosition === 0 ? 4 : 5);

    return (
        <div className="flex flex-col items-center p-4 pb-32 bg-[#101622]">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-4">
                <button
                    onClick={() => setSelectedPosition(Math.max(0, selectedPosition - 1))}
                    disabled={selectedPosition === 0}
                    className="text-white text-sm px-3 py-1 bg-gray-800 rounded disabled:opacity-30"
                >
                    {'<<'}
                </button>
                <div className="flex flex-col items-center">
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                        {selectedRoot} {selectedType}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ⚙️
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setSelectedPosition(Math.min(20, selectedPosition + 1))}
                    disabled={selectedPosition >= 20}
                    className="text-white text-sm px-3 py-1 bg-gray-800 rounded disabled:opacity-30"
                >
                    {'>>'}
                </button>
            </div>

            {/* Fretboard Container */}
            <div className="w-full flex items-center gap-2 mb-4 mt-8 transition-all duration-300">
                {/* Open Strings (Fret 0) - Outside the fretboard */}
                {selectedPosition === 0 && (
                    <div className={`flex flex-col gap-0 ${handedness === 'Left' ? 'order-2' : ''}`}>
                        {GUITAR_STRINGS.map((stringName, stringIndex) => {
                            const openNote = displayPositions.find(p => p.string === stringIndex && p.fret === 0);
                            return (
                                <div key={stringIndex} className="h-12 flex items-center justify-center w-10">
                                    {openNote && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${openNote.isRoot ? 'bg-[#0081FF] text-white' : 'bg-[#FF00BC] text-white'
                                            }`}>
                                            {openNote.note}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Nut (Thick line separator) */}
                {selectedPosition === 0 && (
                    <div className={`w-1 h-[288px] bg-gray-300 rounded ${handedness === 'Left' ? 'order-1' : ''}`} />
                )}

                {/* Fretboard */}
                <div className={`flex-1 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-2 ${handedness === 'Left' && fretboardOrientation === 'Horizontal' ? 'scale-x-[-1]' : ''
                    }`}>
                    {GUITAR_STRINGS.map((stringName, stringIndex) => (
                        <div key={stringIndex} className="relative h-12 flex items-center">
                            {/* String Label */}
                            <div className="absolute -left-6 text-xs text-gray-300 font-bold w-4">{stringName}</div>

                            {/* String Line - Variable thickness */}
                            <div className={`absolute inset-x-0 bg-gray-600 ${stringIndex === 0 ? 'h-[1px]' :   // E (high)
                                stringIndex === 1 ? 'h-[1.5px]' : // B
                                    stringIndex === 2 ? 'h-[2px]' :   // G
                                        stringIndex === 3 ? 'h-[2.5px]' : // D
                                            stringIndex === 4 ? 'h-[3px]' :   // A
                                                'h-[3.5px]'                       // E (low)
                                }`} />

                            {/* Frets */}
                            <div className="flex w-full">
                                {Array.from({ length: displayFrets }, (_, idx) => {
                                    const fret = selectedPosition === 0 ? idx + 1 : selectedPosition + idx;
                                    return (
                                        <div key={idx} className="flex-1 relative h-12">
                                            {/* Fret Line */}
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-700" />

                                            {/* Fret Number Button (centered in fret space) */}
                                            {stringIndex === 0 && (
                                                <button
                                                    onClick={() => setSelectedPosition(fret)}
                                                    className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded text-sm font-bold transition-all ${selectedPosition === fret
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {fret}
                                                </button>
                                            )}

                                            {/* Note Dot */}
                                            {displayPositions
                                                .filter(p => p.string === stringIndex && p.fret === fret)
                                                .map((pos, dotIdx) => (
                                                    <div
                                                        key={dotIdx}
                                                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black z-10 ${pos.isRoot
                                                            ? 'bg-[#0081FF] text-white'
                                                            : 'bg-[#FF00BC] text-white'
                                                            }`}
                                                    >
                                                        {pos.note}
                                                    </div>
                                                ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
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

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setIsSettingsOpen(false)} />

                    <div className="relative w-full max-w-md bg-gray-700 rounded-2xl p-6 pointer-events-auto animate-in fade-in duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 bg-gray-600 -mx-6 -mt-6 px-6 py-4 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-white">Configurações</h2>
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="text-white text-2xl hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Handedness */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-3 text-center">Mão Dominante</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setHandedness('Right')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${handedness === 'Right'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-500 text-gray-300'
                                        }`}
                                >
                                    Destro
                                </button>
                                <button
                                    onClick={() => setHandedness('Left')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${handedness === 'Left'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-500 text-gray-300'
                                        }`}
                                >
                                    Canhoto
                                </button>
                            </div>
                        </div>

                        {/* Fretboard Orientation */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-3 text-center">Braço</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFretboardOrientation('Horizontal')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${fretboardOrientation === 'Horizontal'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-500 text-gray-300'
                                        }`}
                                >
                                    Horizontal
                                </button>
                                <button
                                    onClick={() => setFretboardOrientation('Vertical')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${fretboardOrientation === 'Vertical'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-500 text-gray-300'
                                        }`}
                                >
                                    Vertical
                                </button>
                            </div>
                        </div>

                        {/* Accidentals */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-3 text-center">Acidentes</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAccidentals('Sharp')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${accidentals === 'Sharp'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-500 text-gray-300'
                                        }`}
                                >
                                    Sustenido (#)
                                </button>
                                <button
                                    onClick={() => setAccidentals('Flat')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${accidentals === 'Flat'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-500 text-gray-300'
                                        }`}
                                >
                                    Bemol (b)
                                </button>
                            </div>
                        </div>

                        {/* Chord Auto Sound */}
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white mb-3 text-center">Som Automático</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAutoSound('Off')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${autoSound === 'Off'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-500 text-gray-300'
                                        }`}
                                >
                                    Desligado
                                </button>
                                <button
                                    onClick={() => setAutoSound('On')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${autoSound === 'On'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-500 text-gray-300'
                                        }`}
                                >
                                    Ligado
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
