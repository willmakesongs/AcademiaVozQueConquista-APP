
export const VOCAL_RANGES_DATA = [
    { name: 'Baixo', min: 28, max: 52, type: 'Masculina', desc: 'E1 - E3' },
    { name: 'Barítono', min: 33, max: 57, type: 'Masculina', desc: 'A1 - A3' },
    { name: 'Tenor', min: 36, max: 60, type: 'Masculina', desc: 'C2 - C4' },
    { name: 'Contralto', min: 41, max: 65, type: 'Feminina', desc: 'F2 - F4' },
    { name: 'Mezzo-soprano', min: 45, max: 69, type: 'Feminina', desc: 'A2 - A4' },
    { name: 'Soprano', min: 48, max: 72, type: 'Feminina', desc: 'C3 - C5' }
];

export const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function autoCorrelate(buf: Float32Array, sampleRate: number) {
    let SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        const val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.03) return -1; // Noise gate

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE - i; j++) {
            c[i] = c[i] + buf[j] * buf[j + i];
        }
        if (SIZE - i > 0) {
            c[i] = c[i] / (SIZE - i);
        }
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;

    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

export function getNoteFromFrequency(frequency: number) {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
}

export function getNoteStringFromMidi(midi: number) {
    const note = NOTE_STRINGS[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${note}${octave}`;
}
