import React from 'react';
import { NoteName } from '../../types';
import { getPianoChord, isBlackKey, getKeyNoteName } from '../../services/piano/pianoChords';

interface PianoKeyboardProps {
    root: NoteName;
    chordType: string;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ root, chordType }) => {
    const chordNotes = getPianoChord(root, chordType);
    const totalKeys = 24; // 2 octaves

    // Create array of all keys
    const keys = Array.from({ length: totalKeys }, (_, i) => i);

    // Check if a key should be highlighted
    const isHighlighted = (keyIndex: number) => {
        return chordNotes.some(note => note.keyIndex === keyIndex);
    };

    // Get highlight color for a key
    const getHighlightColor = (keyIndex: number) => {
        const note = chordNotes.find(n => n.keyIndex === keyIndex);
        if (!note) return '';
        return note.isRoot ? 'bg-[#0081FF]' : 'bg-[#FF00BC]';
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {/* Piano Keyboard */}
            <div className="relative bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <div className="flex relative" style={{ minWidth: '800px' }}>
                    {/* White Keys */}
                    {keys.filter(k => !isBlackKey(k)).map((keyIndex) => {
                        const noteName = getKeyNoteName(keyIndex);
                        const highlighted = isHighlighted(keyIndex);
                        const highlightColor = getHighlightColor(keyIndex);

                        return (
                            <div
                                key={`white-${keyIndex}`}
                                className="relative flex-1"
                            >
                                <div className={`
                                    h-40 border-2 border-gray-700 rounded-b-lg
                                    flex flex-col items-center justify-end pb-4
                                    transition-all duration-200
                                    ${highlighted ? highlightColor + ' border-white' : 'bg-white'}
                                `}>
                                    <span className={`text-xs font-bold ${highlighted ? 'text-white' : 'text-gray-800'}`}>
                                        {noteName}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Black Keys */}
                    <div className="absolute top-0 left-0 w-full h-24 pointer-events-none">
                        {keys.filter(k => isBlackKey(k)).map((keyIndex) => {
                            const noteName = getKeyNoteName(keyIndex);
                            const highlighted = isHighlighted(keyIndex);
                            const highlightColor = getHighlightColor(keyIndex);

                            // Calculate position based on white key positions
                            const whiteKeysBefore = keys.slice(0, keyIndex).filter(k => !isBlackKey(k)).length;
                            const leftPercent = ((whiteKeysBefore - 0.3) / keys.filter(k => !isBlackKey(k)).length) * 100;

                            return (
                                <div
                                    key={`black-${keyIndex}`}
                                    className="absolute pointer-events-auto"
                                    style={{
                                        left: `${leftPercent}%`,
                                        width: '6%'
                                    }}
                                >
                                    <div className={`
                                        h-24 rounded-b-lg border-2
                                        flex flex-col items-center justify-end pb-2
                                        transition-all duration-200
                                        ${highlighted
                                            ? highlightColor + ' border-white'
                                            : 'bg-gray-900 border-gray-800'
                                        }
                                    `}>
                                        <span className={`text-[10px] font-bold ${highlighted ? 'text-white' : 'text-gray-400'}`}>
                                            {noteName}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Chord Info */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                    Notas: {chordNotes.map(n => n.note).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                </p>
            </div>
        </div>
    );
};
