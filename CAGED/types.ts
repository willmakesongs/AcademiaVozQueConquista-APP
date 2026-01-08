
export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type FretboardMode = 'notes' | 'fingers' | 'intervals';

export interface ChordResult {
  root: string;
  suffix: string;
  fullName: string;
  notes: NoteName[];
  score: number;
}

export interface SelectedNote {
  stringIndex: number; // 0 (High E) to 5 (Low E)
  fret: number; // 0 to 12+
}

export interface CustomChordOverride {
  id: string; // "C-major-A" format
  notes: SelectedNote[];
}

// DEFINIÇÃO PADRÃO: Corda 1 (Índice 0) até Corda 6 (Índice 5)
// 0: E (Mizinho/High), 1: B (Si), 2: G (Sol), 3: D (Ré), 4: A (Lá), 5: E (Mizão/Low)
export const GUITAR_STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']; 
export const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CHORD_TYPES = [
  'Maior', 'Menor', '7', 'maj7', 'm7', 
  'sus4', 'sus2', 'add9', 
  'dim', 'dim7', 'aug', 
  '6', 'm6', 
  '9', 'maj9', 'm9', 
  'm7b5', '5', '7b9'
];
