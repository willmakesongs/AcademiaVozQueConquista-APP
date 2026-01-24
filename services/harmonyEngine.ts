// ============================================================================
// COMPREHENSIVE CHORD DATABASE
// Based on all-guitar-chords.com reference data
// ============================================================================

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type Instrument = 'guitar' | 'bass' | 'ukulele';

export interface ChordShape {
    frets: (number | 'x')[]; // Array of 6 elements for guitar (high E to low E)
    fingers: (number | null)[]; // Finger numbers (1-4) or null for open/muted
    baseFret: number; // Starting fret for the shape (1 = open position)
    barres: number[]; // Frets that have barres
}

export interface ChordData {
    root: NoteName;
    quality: string;
    shapes: ChordShape[];
}

// ============================================================================
// GUITAR CHORD DATABASE
// Strings: [E(1), B(2), G(3), D(4), A(5), E(6)] - High to Low
// ============================================================================

export const GUITAR_CHORDS: Record<string, Record<string, ChordShape[]>> = {
    // MAJOR CHORDS
    'C': {
        'Maior': [
            { frets: [0, 1, 0, 2, 3, 'x'], fingers: [null, 1, null, 2, 3, null], baseFret: 1, barres: [] },
            { frets: [3, 5, 5, 5, 3, 'x'], fingers: [1, 3, 4, 2, 1, null], baseFret: 3, barres: [3] },
            { frets: [8, 5, 5, 5, 'x', 'x'], fingers: [4, 1, 2, 3, null, null], baseFret: 5, barres: [] },
            { frets: [8, 8, 9, 10, 10, 8], fingers: [1, 1, 2, 3, 4, 1], baseFret: 8, barres: [8] },
        ],
        '7': [
            { frets: [0, 1, 3, 2, 3, 'x'], fingers: [null, 1, 3, 2, 4, null], baseFret: 1, barres: [] },
            { frets: [3, 5, 3, 5, 3, 'x'], fingers: [1, 3, 1, 4, 1, null], baseFret: 3, barres: [3] },
        ],
        'Menor': [
            { frets: [3, 1, 0, 1, 3, 'x'], fingers: [4, 1, null, 2, 3, null], baseFret: 1, barres: [] },
            { frets: [3, 4, 5, 5, 3, 'x'], fingers: [1, 2, 3, 4, 1, null], baseFret: 3, barres: [3] },
            { frets: [8, 8, 8, 10, 10, 8], fingers: [1, 1, 1, 3, 4, 1], baseFret: 8, barres: [8] },
        ],
    },
    'D': {
        'Maior': [
            { frets: [2, 3, 2, 0, 'x', 'x'], fingers: [1, 3, 2, null, null, null], baseFret: 1, barres: [] },
            { frets: [5, 7, 7, 7, 5, 'x'], fingers: [1, 3, 4, 2, 1, null], baseFret: 5, barres: [5] },
            { frets: [10, 10, 11, 12, 12, 10], fingers: [1, 1, 2, 3, 4, 1], baseFret: 10, barres: [10] },
        ],
        '7': [
            { frets: [2, 1, 2, 0, 'x', 'x'], fingers: [2, 1, 3, null, null, null], baseFret: 1, barres: [] },
        ],
        'Menor': [
            { frets: [1, 3, 2, 0, 'x', 'x'], fingers: [1, 3, 2, null, null, null], baseFret: 1, barres: [] },
            { frets: [5, 6, 7, 7, 5, 'x'], fingers: [1, 2, 3, 4, 1, null], baseFret: 5, barres: [5] },
        ],
    },
    'E': {
        'Maior': [
            { frets: [0, 0, 1, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1, barres: [] },
            { frets: [7, 9, 9, 9, 7, 7], fingers: [1, 3, 4, 2, 1, 1], baseFret: 7, barres: [7] },
            { frets: [12, 12, 13, 14, 14, 12], fingers: [1, 1, 2, 3, 4, 1], baseFret: 12, barres: [12] },
        ],
        '7': [
            { frets: [0, 3, 1, 0, 2, 0], fingers: [null, 3, 1, null, 2, null], baseFret: 1, barres: [] },
        ],
        'Menor': [
            { frets: [0, 0, 0, 2, 2, 0], fingers: [null, null, null, 1, 2, null], baseFret: 1, barres: [] },
            { frets: [7, 8, 9, 9, 7, 7], fingers: [1, 2, 3, 4, 1, 1], baseFret: 7, barres: [7] },
        ],
    },
    'F': {
        'Maior': [
            { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], baseFret: 1, barres: [1] },
            { frets: [1, 1, 2, 3, 'x', 'x'], fingers: [1, 2, 3, 4, null, null], baseFret: 1, barres: [] },
            { frets: [5, 6, 5, 3, 'x', 'x'], fingers: [3, 4, 2, 1, null, null], baseFret: 3, barres: [] },
            { frets: [5, 5, 6, 7, 8, 'x'], fingers: [1, 1, 2, 3, 4, null], baseFret: 5, barres: [5] },
            { frets: [8, 10, 10, 10, 8, 8], fingers: [1, 3, 4, 2, 1, 1], baseFret: 8, barres: [8] },
        ],
        '7': [
            { frets: [1, 1, 2, 1, 3, 1], fingers: [1, 1, 2, 1, 3, 1], baseFret: 1, barres: [1] },
        ],
        'Menor': [
            { frets: [1, 1, 1, 3, 3, 1], fingers: [1, 1, 1, 3, 4, 1], baseFret: 1, barres: [1] },
        ],
    },
    'G': {
        'Maior': [
            { frets: [3, 0, 0, 0, 2, 3], fingers: [3, null, null, null, 2, 4], baseFret: 1, barres: [] },
            { frets: [3, 3, 4, 5, 5, 3], fingers: [1, 1, 2, 3, 4, 1], baseFret: 3, barres: [3] },
            { frets: [10, 12, 12, 12, 10, 10], fingers: [1, 3, 4, 2, 1, 1], baseFret: 10, barres: [10] },
        ],
        '7': [
            { frets: [1, 0, 0, 0, 2, 3], fingers: [1, null, null, null, 2, 3], baseFret: 1, barres: [] },
        ],
        'Menor': [
            { frets: [3, 3, 3, 5, 5, 3], fingers: [1, 1, 1, 3, 4, 1], baseFret: 3, barres: [3] },
        ],
    },
    'A': {
        'Maior': [
            { frets: [0, 2, 2, 2, 0, 'x'], fingers: [null, 1, 2, 3, null, null], baseFret: 1, barres: [] },
            { frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], baseFret: 5, barres: [5] },
            { frets: [12, 14, 14, 14, 12, 'x'], fingers: [1, 3, 4, 2, 1, null], baseFret: 12, barres: [12] },
        ],
        '7': [
            { frets: [0, 2, 0, 2, 0, 'x'], fingers: [null, 2, null, 3, null, null], baseFret: 1, barres: [] },
        ],
        'Menor': [
            { frets: [0, 1, 2, 2, 0, 'x'], fingers: [null, 1, 2, 3, null, null], baseFret: 1, barres: [] },
            { frets: [5, 8, 7, 6, 5, 5], fingers: [1, 4, 3, 2, 1, 1], baseFret: 5, barres: [5] },
        ],
    },
    'B': {
        'Maior': [
            { frets: [2, 4, 4, 4, 2, 'x'], fingers: [1, 3, 4, 2, 1, null], baseFret: 2, barres: [2] },
            { frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], baseFret: 7, barres: [7] },
        ],
        '7': [
            { frets: [2, 1, 2, 0, 2, 'x'], fingers: [2, 1, 3, null, 4, null], baseFret: 1, barres: [] },
        ],
        'Menor': [
            { frets: [2, 3, 4, 4, 2, 'x'], fingers: [1, 2, 3, 4, 1, null], baseFret: 2, barres: [2] },
            { frets: [7, 10, 9, 8, 7, 7], fingers: [1, 4, 3, 2, 1, 1], baseFret: 7, barres: [7] },
        ],
    },
};

// Add sharp/flat chords by transposing
function transposeChord(shape: ChordShape, semitones: number): ChordShape {
    return {
        ...shape,
        baseFret: shape.baseFret + semitones,
        frets: shape.frets.map(f => f === 'x' ? 'x' : typeof f === 'number' ? f + semitones : f) as (number | 'x')[],
        barres: shape.barres.map(b => b + semitones)
    };
}

// Generate all chromatic chords
const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getChordShapes(root: NoteName, quality: string): ChordShape[] {
    // Map quality names
    const qualityMap: Record<string, string> = {
        'Maior': 'Maior',
        'Menor': 'Menor',
        'tríade': 'Maior',
        '7': '7',
        'Dom': '7',
        '9': '7', // Simplified to 7 for now
        'add9': 'Maior',
        '11': '7',
        '13': '7',
        'Dim': 'Menor',
        'Sus7': '7',
        'Sus4': 'Maior',
    };

    const mappedQuality = qualityMap[quality] || 'Maior';

    // Find the base chord (C, D, E, F, G, A, or B)
    const baseNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    let baseNote: string = 'C';
    let semitoneOffset = 0;

    const rootIndex = NOTES.indexOf(root);

    // Find closest base note
    for (let i = 0; i < baseNotes.length; i++) {
        const baseIndex = NOTES.indexOf(baseNotes[i] as NoteName);
        const offset = (rootIndex - baseIndex + 12) % 12;
        if (offset < 2 || baseNotes[i] === root) {
            baseNote = baseNotes[i];
            semitoneOffset = offset;
            break;
        }
    }

    const baseShapes = GUITAR_CHORDS[baseNote]?.[mappedQuality] || GUITAR_CHORDS['C']['Maior'];

    // Transpose if needed
    if (semitoneOffset === 0) {
        return baseShapes;
    }

    return baseShapes.map(shape => transposeChord(shape, semitoneOffset));
}

export function generateChord(root: NoteName, quality: string, instrument: Instrument = 'guitar') {
    const shapes = getChordShapes(root, quality);

    return {
        root,
        type: quality,
        name: `${root} ${quality}`,
        shapes: shapes.map(shape => ({
            stringPositions: shape.frets.map((fret, i) => ({
                string: i,
                fret: fret === 'x' ? -1 : fret,
                finger: shape.fingers[i],
                note: root // Simplified
            })),
            openStrings: shape.frets.map((f, i) => f === 0 ? i : -1).filter(i => i >= 0),
            mutedStrings: shape.frets.map((f, i) => f === 'x' ? i : -1).filter(i => i >= 0),
            startFret: shape.baseFret,
            span: Math.max(...shape.frets.filter(f => typeof f === 'number').map(f => f as number)) - Math.min(...shape.frets.filter(f => typeof f === 'number' && f > 0).map(f => f as number))
        }))
    };
}

// Scale generation (keeping simple for now)
export function generateScale(root: NoteName, scaleType: string, instrument: Instrument = 'guitar') {
    const SCALE_INTERVALS: Record<string, number[]> = {
        'Major': [0, 2, 4, 5, 7, 9, 11],
        'Minor Natural': [0, 2, 3, 5, 7, 8, 10],
        'Major Pentatonic': [0, 2, 4, 7, 9],
        'Minor Pentatonic': [0, 3, 5, 7, 10],
        'Blues': [0, 3, 5, 6, 7, 10],
    };

    const intervals = SCALE_INTERVALS[scaleType] || SCALE_INTERVALS['Major Pentatonic'];
    const rootIndex = NOTES.indexOf(root);
    const notes = intervals.map(interval => NOTES[(rootIndex + interval) % 12]);

    const GUITAR_STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E'];
    const positions: any[] = [];

    GUITAR_STRINGS.forEach((openString, stringIndex) => {
        const stringIndex2 = NOTES.indexOf(openString);
        for (let fret = 0; fret <= 12; fret++) {
            const noteAtFret = NOTES[(stringIndex2 + fret) % 12];
            if (notes.includes(noteAtFret)) {
                positions.push({
                    string: stringIndex,
                    fret,
                    note: noteAtFret
                });
            }
        }
    });

    return {
        root,
        type: scaleType,
        name: `${root} ${scaleType}`,
        notes,
        positions
    };
}

export { NoteName, Instrument };
export const INSTRUMENT_STRINGS = {
    guitar: ['E', 'B', 'G', 'D', 'A', 'E'] as NoteName[],
    bass: ['G', 'D', 'A', 'E'] as NoteName[],
    ukulele: ['A', 'E', 'C', 'G'] as NoteName[]
};
