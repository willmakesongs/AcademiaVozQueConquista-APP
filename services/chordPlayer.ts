import * as Tone from 'tone';
import { NoteName } from '../types';

// Instrument configurations
export type Instrument = 'guitar' | 'piano' | 'bass' | 'ukulele';

const SOUNDFONT_BASE_URL = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/master/FluidR3_GM';

const INSTRUMENT_URLS: Record<Instrument, string> = {
    piano: `${SOUNDFONT_BASE_URL}/acoustic_grand_piano-mp3.js`, // Tone.Sampler handles .json/js slightly differently, usually expects folder path if using specific samples.
    // But Gleitz provides mp3 files directly if we construct URLs manually. 
    // We will use direct note URL construction.
    guitar: `${SOUNDFONT_BASE_URL}/acoustic_guitar_steel-mp3`,
    bass: `${SOUNDFONT_BASE_URL}/acoustic_bass-mp3`,
    ukulele: `${SOUNDFONT_BASE_URL}/acoustic_guitar_nylon-mp3`, // Closest approximation
};

// Open string notes for calculation (S6 -> S1 for Guitar, etc)
// Tone.js notation: "E2", "A2", etc.
const OPEN_STRINGS: Record<Instrument, string[]> = {
    // Guitar: E2, A2, D3, G3, B3, E4 (Standard)
    guitar: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],

    // Bass: E1, A1, D2, G2 (Standard 4) - we will handle 5 string logic dynamically if needed, 
    // but here let's stick to standard 4 map, or receive string count.
    // For general purpose, let's define 4. 
    bass: ['E1', 'A1', 'D2', 'G2'],

    // Ukulele: G4, C4, E4, A4 (Standard GCEA)
    ukulele: ['G4', 'C4', 'E4', 'A4'],

    // Piano doesn't use open strings
    piano: []
};

// Cache samplers
const samplers: Partial<Record<Instrument, Tone.Sampler>> = {};
let isToneInitialized = false;

/*
 * Initialize Tone.js and Samplers
 */
export const initAudio = async () => {
    if (!isToneInitialized) {
        await Tone.start();
        isToneInitialized = true;
    }
};

const getSampler = (instrument: Instrument): Tone.Sampler => {
    if (samplers[instrument]) return samplers[instrument]!;

    // Construct a Sampler
    // We load a few key samples to minimize bandwidth, Tone automatically pitch shifts.
    const baseUrl = INSTRUMENT_URLS[instrument];

    // Map of notes to load. C3, C4, C5 usually covers most ground.
    const samplesToLoad: Partial<Record<string, string>> = {};

    // Define octaves to load based on instrument range
    let octaves = [2, 3, 4, 5];
    if (instrument === 'bass') octaves = [1, 2, 3];

    octaves.forEach(oct => {
        ['C', 'E', 'G', 'A'].forEach(note => {
            const noteName = `${note}${oct}`;
            // Gleitz format: acoustic_guitar_steel-mp3/A2.mp3
            // The baseUrl above includes the folder, e.g. .../acoustic_guitar_steel-mp3
            samplesToLoad[noteName] = `${noteName}.mp3`;
        });
    });

    const sampler = new Tone.Sampler({
        urls: samplesToLoad,
        baseUrl: baseUrl + '/',
        onload: () => {
            console.log(`${instrument} samples loaded`);
        }
    }).toDestination();

    samplers[instrument] = sampler;
    return sampler;
};

/**
 * Play a specific set of notes (e.g. ["C4", "E4", "G4"])
 */
export const playNotes = async (notes: string[], instrument: Instrument = 'piano', duration: string = '2n') => {
    await initAudio();
    const sampler = getSampler(instrument);

    const now = Tone.now();
    // Stagger slightly for realism (strumming effect for string instruments)
    const stagger = instrument === 'piano' ? 0 : 0.05;

    notes.forEach((note, i) => {
        sampler.triggerAttackRelease(note, duration, now + (i * stagger));
    });
};

/**
 * Convert fret position to Note Name (e.g. 0 on E2 -> E2, 1 on E2 -> F2)
 */
export const getNoteFromFret = (stringNote: string, fret: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Parse "E2"
    const match = stringNote.match(/([A-G]#?)(\d+)/);
    if (!match) return stringNote;

    const [, note, octStr] = match;
    let octave = parseInt(octStr);
    let noteIndex = noteNames.indexOf(note);

    // Add fret
    let totalIndex = noteIndex + fret;

    // Adjust octave
    octave += Math.floor(totalIndex / 12);
    noteIndex = totalIndex % 12;

    return `${noteNames[noteIndex]}${octave}`;
};

/**
 * Play Caged Chord (from string/fret data)
 */
export const playCagedChord = async (
    positions: { stringIndex: number, fret: number }[], // stringIndex 0 = Low E (usually)
    instrument: Instrument
) => {
    const instrumentOpenStrings = OPEN_STRINGS[instrument];
    if (!instrumentOpenStrings) return; // Piano logic is handled separately

    const notesToPlay: string[] = [];

    positions.forEach(pos => {
        if (pos.fret >= 0 && pos.stringIndex < instrumentOpenStrings.length) {
            // Important: Array wiring.
            // In CagedLogic, stringIndex 0 is typically the 1st string (High E) or 6th string (Low E)?
            // Looking at cagedLogic.ts: [Corda 1 (E), Corda 2 (B)...]
            // Standard convention: String 1 is Highest Pitch.
            // My OPEN_STRINGS array for Guitar is ['E2', 'A2'...] (Low to High).
            // If cagedLogic returns sIdx 0 as High E, I need to map correctly.

            // Re-reading cagedLogic.ts:
            // "Estrutura do Array: [Corda 1 (E), Corda 2 (B), Corda 3 (G), Corda 4 (D), Corda 5 (A), Corda 6 (E)]"
            // This order is High E to Low E.

            // My OPEN_STRINGS:
            // guitar: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] (Low to High - standard ascending pitch)

            // So: 
            // Caged String 0 (High E) -> Open String [5] (E4)
            // Caged String 1 (B)      -> Open String [4] (B3)
            // ...
            // Caged String 5 (Low E)  -> Open String [0] (E2)

            // General Mapping: 
            // indexInOpenStrings = (TotalStrings - 1) - pos.stringIndex

            const totalStrings = instrumentOpenStrings.length;
            const openStringIdx = (totalStrings - 1) - pos.stringIndex;

            if (openStringIdx >= 0 && openStringIdx < totalStrings) {
                const baseNote = instrumentOpenStrings[openStringIdx];
                const finalNote = getNoteFromFret(baseNote, pos.fret);
                notesToPlay.push(finalNote);
            }
        }
    });

    // Sort notes by pitch for cleaner playback? Or just play.
    // Strumming usually goes Low to High or High to Low.
    // Let's sort low to high for consistent 'downstroke' sound simulation logic if we used index.
    // But playNotes iterates.
    // Let's sort by octave/note value roughly if we truly care, but simple push is likely fine.
    // If we want a "downstroke" (Low to High), we should sort.

    // Simple sort logic:
    // Extract octave, then note index.
    // (Optimization: just play, Tone handles polyphony).

    // Actually, physically strumming is usually Low String to High String.
    // Our notesToPlay are currently based on positions order. Caged positions usually come in array order 0..5 (High to Low).
    // So if we iterate positions 0..5, we get High E, then B...
    // Playing High to Low is an "Upstroke". 
    // Let's reverse for "Downstroke" feel appropriately.
    notesToPlay.reverse();

    await playNotes(notesToPlay, instrument);
};
