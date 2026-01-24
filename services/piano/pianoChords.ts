import { NoteName } from '../../types';

// Piano chord intervals (semitones from root)
export const PIANO_CHORD_INTERVALS: Record<string, number[]> = {
    // Triads
    major: [0, 4, 7],           // C Major: C, E, G
    minor: [0, 3, 7],           // C Minor: C, Eb, G
    dim: [0, 3, 6],             // C Dim: C, Eb, Gb
    aug: [0, 4, 8],             // C Aug: C, E, G#
    sus4: [0, 5, 7],            // C Sus4: C, F, G
    sus2: [0, 2, 7],            // C Sus2: C, D, G

    // Seventh chords
    '7': [0, 4, 7, 10],         // C7: C, E, G, Bb
    maj7: [0, 4, 7, 11],        // Cmaj7: C, E, G, B
    m7: [0, 3, 7, 10],          // Cm7: C, Eb, G, Bb
    dim7: [0, 3, 6, 9],         // Cdim7: C, Eb, Gb, A

    // Extended chords
    '9': [0, 4, 7, 10, 14],     // C9: C, E, G, Bb, D
    add9: [0, 4, 7, 14],        // Cadd9: C, E, G, D
    '11': [0, 4, 7, 10, 14, 17], // C11: C, E, G, Bb, D, F
    '13': [0, 4, 7, 10, 14, 21], // C13: C, E, G, Bb, D, A
};

const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface PianoNote {
    note: NoteName;
    octave: number;
    isRoot: boolean;
    keyIndex: number; // Position on keyboard (0-based)
}

/**
 * Get piano chord notes for a given root and chord type
 */
export function getPianoChord(root: NoteName, chordType: string): PianoNote[] {
    const intervals = PIANO_CHORD_INTERVALS[chordType] || PIANO_CHORD_INTERVALS.major;
    const rootIndex = NOTES.indexOf(root);
    const chordNotes: PianoNote[] = [];

    // Generate notes across 2 octaves (24 keys starting from C3)
    const startOctave = 3;
    const totalKeys = 24;

    for (let keyIndex = 0; keyIndex < totalKeys; keyIndex++) {
        const noteIndex = (keyIndex) % 12;
        const octave = startOctave + Math.floor(keyIndex / 12);
        const note = NOTES[noteIndex];

        // Check if this note is in the chord
        const relativeIndex = (noteIndex - rootIndex + 12) % 12;
        const isInChord = intervals.includes(relativeIndex);

        if (isInChord) {
            chordNotes.push({
                note,
                octave,
                isRoot: note === root,
                keyIndex
            });
        }
    }

    return chordNotes;
}

/**
 * Check if a key is a black key (sharp/flat)
 */
export function isBlackKey(keyIndex: number): boolean {
    const noteIndex = keyIndex % 12;
    // Black keys are at positions 1, 3, 6, 8, 10 (C#, D#, F#, G#, A#)
    return [1, 3, 6, 8, 10].includes(noteIndex);
}

/**
 * Get note name for a key index
 */
export function getKeyNoteName(keyIndex: number): NoteName {
    return NOTES[keyIndex % 12];
}
