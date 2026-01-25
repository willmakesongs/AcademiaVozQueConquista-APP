
import { NoteName, NOTES, SelectedNote } from '../types';

/**
 * DICIONÁRIO ALMIR CHEDIAK - PADRÃO CAGED (ABSOLUTO)
 * 
 * Estrutura do Array: [Corda 1 (E), Corda 2 (B), Corda 3 (G), Corda 4 (D), Corda 5 (A), Corda 6 (E)]
 * Valores: Casa relativa à "Pestana Zero" do tom original do shape.
 * -1 = Abafado (Muted)
 */

const CHORD_DEFINITIONS: Record<string, Record<string, number[]>> = {
  // --- TRÍADES ---
  'major': {
    'C': [0, 1, 0, 2, 3, -1],    // C  (x 3 2 0 1 0)
    'A': [0, 2, 2, 2, 0, -1],    // A  (x 0 2 2 2 0)
    'G': [3, 0, 0, 0, 2, 3],     // G  (3 2 0 0 0 3)
    'E': [0, 0, 1, 2, 2, 0],     // E  (0 2 2 1 0 0)
    'D': [2, 3, 2, 0, -1, -1]    // D  (x x 0 2 3 2)
  },
  'minor': {
    'C': [-1, 1, 0, 1, 3, -1],   // Cm (x 3 1 0 1 x)
    'A': [0, 1, 2, 2, 0, -1],    // Am (x 0 2 2 1 0)
    'G': [3, 3, 3, 5, 5, 3],     // Gm (Pestana G Shape)
    'E': [0, 0, 0, 2, 2, 0],     // Em (0 2 2 0 0 0)
    'D': [1, 3, 2, 0, -1, -1]    // Dm (x x 0 2 3 1)
  },
  'aug': {
    'C': [-1, 1, 1, 2, 3, -1],   // Caug (x 3 2 1 1 x)
    'A': [1, 2, 2, 3, 0, -1],    // Aaug (x 0 3 2 2 1)
    'G': [3, 0, 0, 1, 2, 3],     // Gaug (3 2 1 0 0 3)
    'E': [0, 1, 1, 2, 3, 0],     // Eaug (0 3 2 1 1 0)
    'D': [2, 3, 3, 0, -1, -1]    // Daug (x x 0 3 3 2)
  },
  '5': { // Power Chords
    'A': [-1, -1, -1, 2, 0, -1], // A5 (x 0 2 x x x)
    'E': [-1, -1, -1, 2, 2, 0],  // E5 (0 2 2 x x x)
    'D': [-1, -1, 2, 0, -1, -1]  // D5 (x x 0 2 x x)
  },

  // --- SUSPENSOS E ADD ---
  'sus4': {
    'C': [-1, 1, 0, 3, 3, -1],   // Csus4 (x 3 3 0 1 x)
    'A': [0, 3, 2, 2, 0, -1],    // Asus4 (x 0 2 2 3 0)
    'G': [3, 1, 0, 0, 3, 3],     // Gsus4 (3 3 0 0 1 3)
    'E': [0, 0, 2, 2, 2, 0],     // Esus4 (0 2 2 2 0 0)
    'D': [3, 3, 2, 0, -1, -1]    // Dsus4 (x x 0 2 3 3)
  },
  'sus2': {
    'C': [-1, 3, 0, 0, 3, -1],   // Csus2 (x 3 0 0 3 x)
    'A': [0, 0, 2, 2, 0, -1],    // Asus2 (x 0 2 2 0 0) - Clássico
    'G': [3, 3, 2, 0, 0, 3],     // Gsus2 (3 0 0 2 3 3)
    'E': [2, 0, 4, 4, 2, 0],     // Esus2 (Power Sus2)
    'D': [0, 3, 2, 0, -1, -1]    // Dsus2 (x x 0 2 3 0)
  },
  'add9': {
    'C': [0, 3, 0, 2, 3, -1],    // Cadd9 (x 3 2 0 3 0)
    'A': [0, 2, 4, 2, 0, -1],    // Aadd9 (x 0 2 4 2 0)
    'G': [3, 0, 2, 0, 2, 3],     // Gadd9 (3 2 0 2 0 3)
    'E': [0, 0, 1, 4, 2, 0],     // Eadd9 (0 2 4 1 0 0)
    'D': [0, 3, 2, 4, -1, -1]    // Dadd9 (x x 4 2 3 0) - Invertido ou complexo, shape alternativo: x x 0 2 5 2
  },

  // --- SEXTAS ---
  '6': {
    'C': [0, 1, 2, 2, 3, -1],    // C6 (x 3 2 2 1 0)
    'A': [2, 2, 2, 2, 0, -1],    // A6 (x 0 2 2 2 2)
    'G': [0, 0, 0, 0, 2, 3],     // G6 (3 2 0 0 0 0)
    'E': [0, 2, 1, 2, 2, 0],     // E6 (0 2 2 1 2 0)
    'D': [2, 0, 2, 0, -1, -1]    // D6 (x x 0 2 0 2)
  },
  'm6': {
    'C': [-1, 1, 2, 1, 3, -1],   // Cm6 (x 3 1 2 1 x)
    'A': [2, 1, 2, 2, 0, -1],    // Am6 (x 0 2 2 1 2)
    'G': [-1, 3, 3, 2, -1, 3],   // Gm6 (3 x 2 3 3 x)
    'E': [0, 2, 0, 2, 2, 0],     // Em6 (0 2 2 0 2 0)
    'D': [1, 0, 2, 0, -1, -1]    // Dm6 (x x 0 2 0 1)
  },

  // --- SÉTIMAS ---
  '7': {
    'C': [-1, 1, 3, 2, 3, -1],   // C7 (x 3 2 3 1 x)
    'A': [0, 2, 0, 2, 0, -1],    // A7 (x 0 2 0 2 0)
    'G': [1, 0, 0, 0, 2, 3],     // G7 (3 2 0 0 0 1)
    'E': [0, 3, 1, 0, 2, 0],     // E7 (0 2 0 1 3 0)
    'D': [2, 1, 2, 0, -1, -1]    // D7 (x x 0 2 1 2)
  },
  'maj7': {
    'C': [0, 0, 0, 2, 3, -1],    // Cmaj7 (x 3 2 0 0 0)
    'A': [0, 2, 1, 2, 0, -1],    // Amaj7 (x 0 2 1 2 0)
    'G': [2, 0, 0, 0, 2, 3],     // Gmaj7 (3 2 0 0 0 2)
    'E': [0, 0, 1, 1, 2, 0],     // Emaj7 (0 2 1 1 0 0)
    'D': [2, 2, 2, 0, -1, -1]    // Dmaj7 (x x 0 2 2 2)
  },
  'm7': {
    'C': [-1, 1, 3, 1, 3, -1],   // Cm7 (x 3 1 3 1 x)
    'A': [0, 1, 0, 2, 0, -1],    // Am7 (x 0 2 0 1 0)
    'G': [1, 3, 3, 3, 5, 3],     // Gm7 (3 5 3 3 3 3)
    'E': [0, 3, 0, 0, 2, 0],     // Em7 (0 2 0 0 3 0)
    'D': [1, 1, 2, 0, -1, -1]    // Dm7 (x x 0 2 1 1)
  },
  'm7b5': {
    'C': [-1, 4, 3, 4, 3, -1],   // Cm7b5 (x 3 4 3 4 x)
    'A': [3, 1, 0, 1, 0, -1],    // Am7b5 (x 0 1 0 1 3)
    'G': [-1, 2, 3, 3, -1, 3],   // Gm7b5 (3 x 3 3 2 x)
    'E': [0, 3, 3, 2, -1, 0],    // Em7b5 (0 x 2 3 3 0)
    'D': [1, 1, 1, 0, -1, -1]    // Dm7b5 (x x 0 1 1 1)
  },
  'dim7': {
    'C': [-1, 4, 2, 4, 3, -1],   // Cdim7 (x 3 4 2 4 x)
    'A': [2, 1, 2, 1, 0, -1],    // Adim7 (x 0 1 2 1 2)
    'G': [0, 2, 0, 2, 1, 3],     // Gdim7 (3 1 2 0 2 0)
    'E': [-1, 2, 0, 2, 1, 0],    // Edim7 (0 1 2 0 2 x)
    'D': [1, 0, 1, 0, -1, -1]    // Ddim7 (x x 0 1 0 1)
  },

  // --- NONAS E TENSÕES ---
  '9': {
    'C': [-1, 3, 3, 2, 3, -1],   // C9 (x 3 2 3 3 x)
    'A': [3, 2, 4, 2, 0, -1],    // A9 (x 0 2 4 2 3)
    'G': [1, 0, 2, 3, 2, 3],     // G9 (3 2 3 2 0 1) - Shape complexo
    'E': [2, 0, 1, 0, 2, 0],     // E9 (0 2 0 1 0 2)
    'D': [0, 1, 2, 0, -1, -1]    // D9 (x x 0 2 1 0)
  },
  'maj9': {
    'C': [-1, 3, 4, 2, 3, -1],   // Cmaj9 (x 3 2 4 3 x)
    'A': [4, 2, 1, 2, 0, -1],    // Amaj9 (x 0 2 1 2 4)
    'G': [2, 0, 2, 0, -1, 3],    // Gmaj9 (3 x 0 2 0 2)
    'E': [-1, 0, 1, 1, 2, 0],    // Emaj9 (0 2 1 1 0 x)
    'D': [0, 2, 2, 0, -1, -1]    // Dmaj9 (x x 0 2 2 0)
  },
  'm9': {
    'C': [-1, 3, 3, 1, 3, -1],   // Cm9 (x 3 1 3 3 x)
    'A': [0, 1, 4, 2, 0, -1],    // Am9 (x 0 2 4 1 0)
    'G': [3, 3, 3, 3, 5, 3],     // Gm9 (Similar a m7 com nota aguda)
    'E': [2, 3, 0, 2, 2, 0],     // Em9 (0 2 2 0 3 2)
    'D': [0, 1, 2, 0, -1, -1]    // Dm9 (x x 0 2 1 0) - (F no baixo = Fmaj7, contexto importa)
  },
  '7b9': {
    'C': [3, 2, 3, 2, 3, -1],    // C7b9 (x 3 2 3 2 3) 
    'A': [3, 2, 3, 2, 0, -1],    // A7b9 (x 0 2 3 2 3) 
    'G': [1, 0, 1, 0, 2, 3],     // G7b9 (3 2 0 1 0 1) 
    'E': [1, 0, 1, 0, 2, 0],     // E7b9 (0 2 0 1 0 1) 
    'D': [2, 4, 5, 0, -1, -1]    // D7b9 (x x 0 5 4 2)
  }
};

// Mapeamento da Nota da Tônica ORIGINAL de cada Shape (Casa 0)
const SHAPE_ORIGIN_ROOT: Record<string, NoteName> = { 
  'C': 'C',
  'A': 'A',
  'G': 'G',
  'E': 'E',
  'D': 'D'
};

// Corda onde se encontra a tônica principal de cada shape
const SHAPE_ROOT_STRING: Record<string, number> = { 
  'C': 4, // A string
  'A': 4, // A string
  'G': 5, // E string
  'E': 5, // E string
  'D': 3  // D string
};

const STORAGE_KEY = 'learned_harmony_v3';

export const getChordTemplateId = (type: string, shape: string) => {
  return `${type.replace(/[^a-zA-Z0-9]/g, '')}-${shape}`.toLowerCase();
};

export const saveChordOverride = (type: string, shape: string, notes: SelectedNote[], rootNote: NoteName) => {
  const rootStrIdx = SHAPE_ROOT_STRING[shape];
  const rootNoteOnFretboard = notes.find(n => n.stringIndex === rootStrIdx);
  const referenceFret = rootNoteOnFretboard ? rootNoteOnFretboard.fret : notes[0]?.fret || 0;

  const relativePattern: (number | null)[] = Array(6).fill(null);
  notes.forEach(n => {
    relativePattern[n.stringIndex] = n.fret - referenceFret;
  });

  const templates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  templates[getChordTemplateId(type, shape)] = relativePattern;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const getChordTemplate = (type: string, shape: string): number[] | null => {
  const templates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return templates[getChordTemplateId(type, shape)] || null;
};

export const resetChordOverride = (type: string, shape: string) => {
  const templates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  delete templates[getChordTemplateId(type, shape)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

/**
 * MOTOR DE CÁLCULO DE POSIÇÃO (CAGED SYSTEM - ABSOLUTE)
 */
export const getCagedPosition = (
  root: NoteName, 
  type: string, 
  shape: string
): SelectedNote[] => {
  // Normalização do tipo para bater com as chaves do dicionário
  let normalizedType = type;
  
  if (type === 'minor' || type === 'm') normalizedType = 'minor';
  else if (type === 'major' || type === '') normalizedType = 'major';
  // Sétimas e Tríades Especiais
  else if (type === '7') normalizedType = '7';
  else if (type === 'm7') normalizedType = 'm7';
  else if (type === 'maj7' || type === '7M') normalizedType = 'maj7';
  else if (type === 'm7b5') normalizedType = 'm7b5';
  else if (type === 'dim7' || type === 'dim') normalizedType = 'dim7';
  else if (type === 'aug' || type === '+') normalizedType = 'aug';
  // Sus / Add
  else if (type === 'sus4') normalizedType = 'sus4';
  else if (type === 'sus2') normalizedType = 'sus2';
  else if (type === 'add9') normalizedType = 'add9';
  else if (type === '5') normalizedType = '5';
  // Sextas
  else if (type === '6') normalizedType = '6';
  else if (type === 'm6') normalizedType = 'm6';
  // Nonas e Tensões
  else if (type === '9') normalizedType = '9';
  else if (type === 'maj9') normalizedType = 'maj9';
  else if (type === 'm9') normalizedType = 'm9';
  else if (type === '7b9') normalizedType = '7b9';

  // 1. Tenta pegar do banco de dados do usuário (Correção manual)
  const learnedPattern = getChordTemplate(normalizedType, shape);
  
  // Cálculo da distância de transposição
  const stringBaseNotes: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']; // Cordas soltas
  const targetRootIdx = NOTES.indexOf(root);
  
  // Tônica original do shape (Ex: Se shape 'E', tônica original é E)
  const originRootNote = SHAPE_ORIGIN_ROOT[shape]; 
  const originRootIdx = NOTES.indexOf(originRootNote);

  // Quantas casas precisamos subir para transformar a Tônica Original na Tônica Alvo?
  let fretShift = targetRootIdx - originRootIdx;
  if (fretShift < 0) fretShift += 12;

  // Se o usuário já corrigiu, usa o padrão dele (Lógica de Offset salvo)
  if (learnedPattern) {
    const positions: SelectedNote[] = [];
    const rootStr = SHAPE_ROOT_STRING[shape];
    const openStringNote = stringBaseNotes[rootStr]; 
    const openStringIdx = NOTES.indexOf(openStringNote);
    
    let absoluteRootFret = targetRootIdx - openStringIdx;
    if (absoluteRootFret < 0) absoluteRootFret += 12;

    learnedPattern.forEach((offset, sIdx) => {
      if (offset !== null && offset !== undefined) {
        let finalFret = absoluteRootFret + offset;
        while (finalFret < 0) finalFret += 12;
        if (finalFret > 15) finalFret -= 12; 
        positions.push({ stringIndex: sIdx, fret: finalFret });
      }
    });
    return positions;
  }

  // 2. Fallback: Dicionário Almir Chediak (Absoluto)
  const shapeDefinitions = CHORD_DEFINITIONS[normalizedType];

  if (!shapeDefinitions) {
      // Se não houver definição para este tipo, retorna vazio (evita erro)
      return [];
  }

  const baseShape = shapeDefinitions[shape];

  // Se o shape não existir para este tipo específico (ex: não existe C shape para alguns acordes raros)
  if (!baseShape) {
      return [];
  }

  const positions: SelectedNote[] = [];
  
  baseShape.forEach((baseFret, sIdx) => {
    if (baseFret !== -1) {
      // A matemática aqui é: CasaOriginal + Deslocamento
      let finalFret = baseFret + fretShift;
      
      // Ajuste para não sair do braço (Opcional, mas Caged funciona bem na oitava inicial)
      if (finalFret > 15 && fretShift > 0) {
        // Nada a fazer, é agudo mesmo
      }

      positions.push({ stringIndex: sIdx, fret: finalFret });
    }
  });
  
  return positions;
};
