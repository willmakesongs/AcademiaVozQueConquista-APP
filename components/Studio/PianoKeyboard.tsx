import React from 'react';
import { NoteName } from '../../types';
import { getPianoChord, isBlackKey, getKeyNoteName } from '../../services/piano/pianoChords';

interface PianoKeyboardProps {
    root: NoteName;
    chordType: string;
    inversion?: number; // 0 = Root, 1 = 1st, 2 = 2nd
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ root, chordType, inversion = 0 }) => {
    const chordNotes = getPianoChord(root, chordType, inversion);
    const totalKeys = 36; // 3 octaves
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to center of chord
    React.useEffect(() => {
        if (scrollContainerRef.current && chordNotes.length > 0) {
            const keyIndices = chordNotes.map(n => n.keyIndex);
            if (keyIndices.length === 0) return;

            // Calculate range center instead of average for better framing of wide chords
            const minKey = Math.min(...keyIndices);
            const maxKey = Math.max(...keyIndices);
            const centerKeyIndex = (minKey + maxKey) / 2;

            // Map key index to pixel position
            // Total white keys calculation
            // We need to count exactly how many white keys are before the centerKeyIndex
            const getWhiteKeyPosition = (absIndex: number) => {
                let whiteCount = 0;
                for (let i = 0; i < Math.floor(absIndex); i++) {
                    if (!isBlackKey(i)) whiteCount++;
                }

                // Interpolate for fractional index
                const isCurrentBlack = isBlackKey(Math.floor(absIndex));
                const fractional = absIndex % 1;

                // If we are on a black key, where is it spatially?
                // Black keys are centered on boundary. 
                // Index 1 (C#) is between 0 (C) and 1 (D).
                // White equivalent position is roughly 0.5 + fractional?
                // Let's use a robust approximation:
                // If isBlack, we are at whiteCount - 0.5.
                // If !isBlack, we are at whiteCount + fractional.

                if (isCurrentBlack) {
                    return whiteCount - 0.5 + fractional;
                } else {
                    return whiteCount + fractional;
                }
            };

            const centerWhiteIndex = getWhiteKeyPosition(centerKeyIndex);

            const containerWidth = scrollContainerRef.current.clientWidth;
            const contentWidth = scrollContainerRef.current.scrollWidth;

            // Count total white keys in the totalKeys range
            let totalWhiteKeys = 0;
            for (let i = 0; i < totalKeys; i++) {
                if (!isBlackKey(i)) totalWhiteKeys++;
            }

            const whiteKeyWidth = contentWidth / totalWhiteKeys;

            // Center in pixels
            const targetPixel = (centerWhiteIndex * whiteKeyWidth) + (whiteKeyWidth / 2);
            const scrollPos = targetPixel - (containerWidth / 2);

            scrollContainerRef.current.scrollTo({
                left: scrollPos,
                behavior: 'smooth'
            });
        }
    }, [root, chordType, inversion]);

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
        <div className="w-full max-w-5xl mx-auto p-4">
            {/* Piano Keyboard */}
            {/* Piano Keyboard */}
            <div
                ref={scrollContainerRef}
                className="relative bg-gray-900 rounded-lg p-6 overflow-x-scroll no-scrollbar touch-pan-x"
                style={{
                    overscrollBehaviorX: 'contain',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div className="flex relative" style={{ minWidth: '1050px' }}>
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
                    <div className="absolute top-0 left-0 w-full h-24 pointer-events-none z-10">
                        {keys.filter(k => isBlackKey(k)).map((keyIndex) => {
                            const noteName = getKeyNoteName(keyIndex);
                            const highlighted = isHighlighted(keyIndex);
                            const highlightColor = getHighlightColor(keyIndex);

                            // Calculate precise position and width
                            const whiteKeyCount = keys.filter(k => !isBlackKey(k)).length;
                            const whiteKeyWidthPercent = 100 / whiteKeyCount;
                            const blackKeyWidthPercent = whiteKeyWidthPercent * 0.65; // ~65% of white key width

                            // Determine previous white keys count for position
                            const whiteKeysBefore = keys.slice(0, keyIndex).filter(k => !isBlackKey(k)).length;

                            // Center on the boundary: (whiteKeysBefore * whiteWidth) - (blackWidth / 2)
                            const leftPercent = (whiteKeysBefore * whiteKeyWidthPercent) - (blackKeyWidthPercent / 2);

                            return (
                                <div
                                    key={`black-${keyIndex}`}
                                    className="absolute pointer-events-auto"
                                    style={{
                                        left: `${leftPercent}%`,
                                        width: `${blackKeyWidthPercent}%`
                                    }}
                                >
                                    <div className={`
                                        h-24 rounded-b-lg border-2 border-t-0
                                        flex flex-col items-center justify-end pb-2
                                        transition-all duration-200 shadow-lg
                                        ${highlighted
                                            ? highlightColor + ' border-white'
                                            : 'bg-black border-gray-800' // Real piano keys are black
                                        }
                                    `}>
                                        <span className={`text-[8px] font-bold ${highlighted ? 'text-white' : 'text-gray-500'}`}>
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
