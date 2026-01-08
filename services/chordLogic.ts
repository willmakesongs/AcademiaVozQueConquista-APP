import { SelectedNote } from '../types';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Guitar standard tuning (E2, A2, D3, G3, B3, E4)
// index 5 = E2, index 0 = E4
const OPEN_STRING_NOTES = [
    'E4', // 0: High E
    'B3', // 1
    'G3', // 2
    'D3', // 3
    'A2', // 4
    'E2'  // 5: Low E
];

export const getNoteAt = (stringIndex: number, fret: number): string => {
    const openNote = OPEN_STRING_NOTES[stringIndex];
    if (!openNote) return '';

    const noteName = openNote.replace(/[0-9]/g, '');
    const octave = parseInt(openNote.replace(/[^0-9]/g, ''));

    const startIndex = NOTES.indexOf(noteName);
    const totalSemitones = startIndex + fret;

    const targetNoteIndex = totalSemitones % 12;
    const octaveIncrease = Math.floor(totalSemitones / 12);

    return `${NOTES[targetNoteIndex]}${octave + octaveIncrease}`;
};

export const formatMusicText = (note: string): string => {
    if (!note) return '';
    // Remove octave for display if needed, or just beautify
    return note.replace(/[0-9]/g, '').replace('#', '♯');
};

export const getIntervalAt = (note: string, rootNote: string): string => {
    if (!note || !rootNote) return '';

    const cleanNote = note.replace(/[0-9]/g, '');
    const cleanRoot = rootNote.replace(/[0-9]/g, '');

    const noteIdx = NOTES.indexOf(cleanNote);
    const rootIdx = NOTES.indexOf(cleanRoot);

    if (noteIdx === -1 || rootIdx === -1) return '';

    const semitones = (noteIdx - rootIdx + 12) % 12;

    const intervals: Record<number, string> = {
        0: 'T',
        1: 'b2',
        2: '2',
        3: 'b3',
        4: '3',
        5: '4',
        6: 'b5',
        7: '5',
        8: 'b6',
        9: '6',
        10: 'b7',
        11: '7'
    };

    return intervals[semitones] || '';
};

export const calculateFinger = (stringIndex: number, fret: number, selectedNotes: SelectedNote[]): string => {
    const note = selectedNotes.find(n => n.stringIndex === stringIndex && n.fret === fret);
    if (note && note.finger !== undefined) {
        return note.finger.toString();
    }
    return '';
};
