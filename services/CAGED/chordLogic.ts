
import { NoteName, NOTES, ChordResult, SelectedNote, GUITAR_STRINGS } from '../../types';

declare global {
  interface Window {
    Tonal: any;
  }
}

/**
 * Garante que a representação de bemol seja sempre 'b' minúsculo
 */
export const formatMusicText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/Maj/g, 'maj')
    .replace(/ma/g, 'maj') 
    .replace(/M(?![a-z])/g, 'maj') 
    .replace(/min/g, 'm');
};

export const getNoteAt = (stringIndex: number, fret: number): string => {
  // Usa a definição centralizada em types.ts:
  // 0=E, 1=B, 2=G, 3=D, 4=A, 5=E
  const startNote = GUITAR_STRINGS[stringIndex];
  const startIndex = NOTES.indexOf(startNote);
  const note = NOTES[(startIndex + fret) % 12];
  return formatMusicText(note);
};

/**
 * Retorna a nota e sua oitava física (ex: E2, A2, C4)
 * A guitarra tem afinação padrão: E2, A2, D3, G3, B3, E4
 */
export const getScientificPitch = (stringIndex: number, fret: number): { note: string, octave: number } => {
  // Índices de oitava das cordas soltas (High E -> Low E)
  // Index 0 (High E) = E4
  // Index 1 (B)      = B3
  // Index 2 (G)      = G3
  // Index 3 (D)      = D3
  // Index 4 (A)      = A2
  // Index 5 (Low E)  = E2
  const openOctaves = [4, 3, 3, 3, 2, 2]; 
  
  const startNote = GUITAR_STRINGS[stringIndex];
  const startOctave = openOctaves[stringIndex];
  const startIndex = NOTES.indexOf(startNote);
  
  const totalSemitones = startIndex + fret;
  const octaveShift = Math.floor(totalSemitones / 12);
  
  const noteName = NOTES[totalSemitones % 12];
  
  return {
    note: formatMusicText(noteName),
    octave: startOctave + octaveShift
  };
};

/**
 * Calcula o intervalo seguindo a TABELA PEDAGÓGICA (T, m, 7M, etc)
 * Baseado na distância cromática (semitons)
 */
export const getIntervalAt = (note: string, root: string): string => {
  try {
    if (!window.Tonal) return '?';
    
    // Obter semitons de distância (0-11)
    const semitones = (window.Tonal.Note.chroma(note) - window.Tonal.Note.chroma(root) + 12) % 12;

    // Mapeamento baseado na coluna "Cifra" da tabela enviada
    const map: Record<number, string> = {
      0: 'T',
      1: 'b2',
      2: '2',
      3: 'm',
      4: '3',
      5: '4',
      6: 'b5', 
      7: '5',
      8: 'b6',
      9: '6',
      10: '7',
      11: '7M'
    };

    return map[semitones] || 'T';
  } catch (e) {
    console.error("Erro no cálculo de intervalo:", e);
    return '?';
  }
};

/**
 * Algoritmo Ergonômico de Atribuição de Dedos (1-4)
 * Considera pestanas e a anatomia da mão humana no braço da guitarra.
 */
export const calculateFinger = (sIdx: number, fret: number, allNotes: SelectedNote[]): number | null => {
  if (fret === 0) return null; // Corda solta não usa dedo

  // Filtra apenas notas pressionadas e ordena por casa (asc) e depois por corda (desc - grave para aguda)
  const pressed = allNotes
    .filter(n => n.fret > 0)
    .sort((a, b) => a.fret - b.fret || b.stringIndex - a.stringIndex);

  if (pressed.length === 0) return null;

  const minFret = pressed[0].fret;
  const maxFret = pressed[pressed.length - 1].fret;
  
  // Identifica se há uma pestana (2 ou mais notas na mesma casa inicial)
  const isBarreAtStart = pressed.filter(n => n.fret === minFret).length >= 2;
  
  const fingerMap: Record<string, number> = {};
  let availableFingers = [1, 2, 3, 4];

  if (isBarreAtStart) {
    // Atribui Dedo 1 para todas as notas na casa da pestana
    pressed.filter(n => n.fret === minFret).forEach(n => {
      fingerMap[`${n.stringIndex}-${n.fret}`] = 1;
    });
    availableFingers = [2, 3, 4];
  }

  // Distribui os dedos restantes para as outras notas
  pressed.forEach(n => {
    const key = `${n.stringIndex}-${n.fret}`;
    if (fingerMap[key]) return; // Já atribuído pela pestana

    // Se a distância entre a casa atual e a mínima for grande, tenta usar dedos mais altos
    const finger = availableFingers.shift() || 4;
    fingerMap[key] = finger;
  });

  return fingerMap[`${sIdx}-${fret}`] || null;
};

export const getFrequency = (stringIndex: number, fret: number): number => {
  // Frequências base (Hz) das cordas soltas (High E -> Low E)
  // Index 0: E4 (329.63)
  // Index 1: B3 (246.94)
  // Index 2: G3 (196.00)
  // Index 3: D3 (146.83)
  // Index 4: A2 (110.00)
  // Index 5: E2 (82.41)
  const baseFreqs = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41];
  return baseFreqs[stringIndex] * Math.pow(2, fret / 12);
};

const CANONICAL_SUFFIXES = ['', 'm', '7', 'm7', 'maj7', 'm7b5', 'dim', 'aug', 'sus4', 'sus2', 'add9'];

export const identifyChord = (selected: SelectedNote[]): ChordResult[] => {
  if (selected.length < 2) return [];

  const sortedByString = [...selected].sort((a, b) => b.stringIndex - a.stringIndex);
  const rawBass = getNoteAt(sortedByString[0].stringIndex, sortedByString[0].fret);
  const bassNote = formatMusicText(rawBass);

  const allNotes = selected.map(s => getNoteAt(s.stringIndex, s.fret));
  const uniqueNotes = Array.from(new Set(allNotes));

  const detected: string[] = window.Tonal.Chord.detect(uniqueNotes);
  
  if (detected.length === 0) return [];

  const processedResults = detected.map(chordName => {
    const chord = window.Tonal.Chord.get(chordName);
    const root = formatMusicText(chord.tonic || chordName.charAt(0));
    
    let suffix = chord.aliases[0] || '';
    if (suffix === 'M') suffix = '';
    if (suffix === 'ma7') suffix = 'maj7';
    
    let score = 50; 
    const isDirect = root === bassNote;
    if (isDirect) score += 40;

    const suffixIndex = CANONICAL_SUFFIXES.indexOf(suffix);
    if (suffixIndex !== -1) {
      score += (CANONICAL_SUFFIXES.length - suffixIndex) * 10;
    }

    if (chordName.length > 8) score -= 30;

    let sanitizedBaseName = `${root}${suffix}`;
    sanitizedBaseName = formatMusicText(sanitizedBaseName);
    
    let displayName = sanitizedBaseName;
    if (!isDirect && bassNote) {
        displayName = `${sanitizedBaseName}/${bassNote}`;
    }

    return {
      root,
      suffix,
      fullName: displayName,
      notes: uniqueNotes as NoteName[],
      score: Math.min(score, 100)
    };
  });

  const uniqueDisplayNames = new Map();
  processedResults
    .sort((a, b) => b.score - a.score)
    .forEach(item => {
      if (item.fullName.match(/[A-G][b#]?\d$/) && !item.fullName.includes('7') && !item.fullName.includes('9')) {
        return; 
      }
      if (!uniqueDisplayNames.has(item.fullName)) {
        uniqueDisplayNames.set(item.fullName, item);
      }
    });

  return Array.from(uniqueDisplayNames.values()).slice(0, 4);
};
