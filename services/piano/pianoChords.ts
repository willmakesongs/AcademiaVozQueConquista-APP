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
 * Get piano chord notes for a given root and chord type with specific inversion
 * @param inversion 0 = Root Position, 1 = 1st Inversion, 2 = 2nd Inversion, etc.
 */
export function getPianoChord(root: NoteName, chordType: string, inversion: number = 0): PianoNote[] {
    const intervals = PIANO_CHORD_INTERVALS[chordType] || PIANO_CHORD_INTERVALS.major;
    const rootIndex = NOTES.indexOf(root);
    const chordNotes: PianoNote[] = [];

    // Base processing: Rotate intervals for inversion
    // Logic: Take notes strictly from the chord definition and arrange them.
    // Example C Major (0, 4, 7):
    // Inv 0: 0, 4, 7 (C, E, G)
    // Inv 1: 4, 7, 12 (E, G, C)
    // Inv 2: 7, 12, 16 (G, C, E)

    // 1. Create extended intervals array for rotation
    // We clone intervals and for each inversion step, we take the first element,
    // add 12 (octave up), and push to the back.
    let currentIntervals = [...intervals];

    for (let i = 0; i < inversion; i++) {
        const firstNote = currentIntervals.shift();
        if (firstNote !== undefined) {
            currentIntervals.push(firstNote + 12);
        }
    }

    // 2. Map to absolute keys (Center the chord)
    // We expanded to 3 octaves (0-35). Ideally chords sit in the middle octave (12-24).
    const baseRootOffset = rootIndex;

    // Calculate raw positions for the current inversion
    const rawPositions = currentIntervals.map(interval => baseRootOffset + interval);

    // Determine bounds
    const maxPos = Math.max(...rawPositions);

    // Determines the best octave shift to center the chord
    // Center of 36 keys is 17.5.
    const idealCenter = 17.5;
    let noteShift = 0;

    // Option 1: No Shift
    const centerNoShift = (Math.min(...rawPositions) + Math.max(...rawPositions)) / 2;
    const distNoShift = Math.abs(centerNoShift - idealCenter);

    // Option 2: Shift +12
    const centerPlus12 = centerNoShift + 12;
    const distPlus12 = Math.abs(centerPlus12 - idealCenter);

    // Option 3: Shift -12
    const centerMinus12 = centerNoShift - 12;
    const distMinus12 = Math.abs(centerMinus12 - idealCenter);

    // Check validity (must be within 0-35)
    const minRaw = Math.min(...rawPositions);
    const maxRaw = Math.max(...rawPositions);

    const validNoShift = minRaw >= 0 && maxRaw < 36;
    const validPlus12 = (minRaw + 12) >= 0 && (maxRaw + 12) < 36;
    const validMinus12 = (minRaw - 12) >= 0 && (maxRaw - 12) < 36;

    let candidates = [];
    if (validNoShift) candidates.push({ shift: 0, dist: distNoShift });
    if (validPlus12) candidates.push({ shift: 12, dist: distPlus12 });
    if (validMinus12) candidates.push({ shift: -12, dist: distMinus12 });

    if (candidates.length > 0) {
        // Sort
        candidates.sort((a, b) => {
            // If dists are close (e.g. 6.0 vs 6.0), prefer higher octave (better readability)
            if (Math.abs(a.dist - b.dist) < 1.0) {
                return b.shift - a.shift;
            }
            return a.dist - b.dist;
        });
        noteShift = candidates[0].shift;
    } else {
        // Fallback
        if (maxRaw >= 36) noteShift = -12;
        if (minRaw < 0) noteShift = 12;
    }

    currentIntervals.forEach(interval => {
        const keyIndex = baseRootOffset + interval + noteShift;

        if (keyIndex >= 0 && keyIndex < 36) {
            const noteIndex = keyIndex % 12;
            const octave = 3 + Math.floor(keyIndex / 12);
            const note = NOTES[noteIndex];

            chordNotes.push({
                note,
                octave,
                isRoot: note === root,
                keyIndex
            });
        }
    });

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
