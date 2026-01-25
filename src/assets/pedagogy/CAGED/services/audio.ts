
let audioCtx: AudioContext | null = null;
const sampleCache: Record<string, AudioBuffer> = {};
const drumBufferCache: Record<string, AudioBuffer> = {}; // Cache específico para bateria
let globalMetronomeVolume = 0.8;

const SAMPLE_BASE_URL = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/master/FluidR3_GM/acoustic_guitar_steel-mp3';
const OPEN_STRINGS_SAMPLES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

// Samples acústicos de alta qualidade (Tone.js Acoustic Kit)
const DRUM_SAMPLES_URLS = {
  kick: 'https://tonejs.github.io/audio/drum-samples/acoustic-kit/kick.mp3',
  snare: 'https://tonejs.github.io/audio/drum-samples/acoustic-kit/snare.mp3',
  hihat: 'https://tonejs.github.io/audio/drum-samples/acoustic-kit/hihat.mp3'
};

/**
 * Define o volume global do metrônomo (0.0 a 1.0)
 */
export const setMetronomeVolume = (volume: number) => {
  globalMetronomeVolume = Math.max(0, Math.min(1, volume));
};

/**
 * Função crítica para iPhone/iOS:
 * Desbloqueia o contexto de áudio tocando um silêncio absoluto.
 */
export const initAudio = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  // Truque para iOS: Tocar um buffer vazio no primeiro clique para ganhar permissão de áudio
  if (audioCtx.state === 'running') {
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
  }
  
  return audioCtx;
};

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// --- PRELOADER DE BATERIA ---

async function loadDrumSample(name: string, url: string): Promise<AudioBuffer> {
  if (drumBufferCache[name]) return drumBufferCache[name];
  const ctx = getCtx();
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    drumBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Erro ao carregar sample de bateria ${name}:`, error);
    throw error;
  }
}

export const preloadDrumSamples = () => {
  Object.entries(DRUM_SAMPLES_URLS).forEach(([name, url]) => {
    loadDrumSample(name, url).catch(() => {});
  });
};

// Helper para tocar um buffer simples
const playSampleBuffer = (ctx: AudioContext, buffer: AudioBuffer, time: number, volume: number) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume, time);
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start(time);
};

// --- NOVOS SONS DE METRÔNOMO ---

/**
 * tickIndex: 0 a 7 (representando as 8 colcheias de um compasso 4/4)
 * 0 = Beat 1
 * 1 = Beat 1 (e)
 * 2 = Beat 2
 * 3 = Beat 2 (e)
 * ...
 */
export const playMetronomeSound = (type: string, isAccent: boolean, tickIndex: number = 0, isFill: boolean = false) => {
  const ctx = getCtx();
  
  // Redundância agressiva para iOS
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const master = ctx.createGain();
  
  // Usa o volume global definido pelo usuário
  master.gain.setValueAtTime(globalMetronomeVolume, now);
  gain.connect(master);
  master.connect(ctx.destination);

  switch (type) {
    case 'loop': {
      // Padrão 4/4 Acústico com HiHat em colcheias (0-7)
      
      const kick = drumBufferCache['kick'];
      const snare = drumBufferCache['snare'];
      const hihat = drumBufferCache['hihat'];
      
      const isDownBeat = tickIndex % 2 === 0; // 0, 2, 4, 6 (Cabeça do tempo)

      // Hi-Hat em todos os tempos (0 a 7) - Colcheias
      // Dinâmica: Mais forte na cabeça (isDownBeat), mais fraco no 'e'
      // Na virada (isFill), silenciamos o HiHat nos tempos 3 e 4 (ticks 4,5,6,7) para limpar o som da caixa
      const shouldPlayHiHat = !isFill || tickIndex < 4;
      
      if (hihat && shouldPlayHiHat) {
        const hhVol = isDownBeat ? 0.5 : 0.3;
        playSampleBuffer(ctx, hihat, now, globalMetronomeVolume * hhVol);
      }

      if (isFill) {
        // --- COMPASSO DE VIRADA (Fill Bar) ---
        // Mantemos o groove na primeira metade (Tempo 1 e 2)
        // Tick 0: Beat 1
        if (tickIndex === 0 && kick) playSampleBuffer(ctx, kick, now, globalMetronomeVolume);
        
        // Tick 2: Beat 2
        if (tickIndex === 2 && snare) playSampleBuffer(ctx, snare, now, globalMetronomeVolume);
        
        // Virada: 4 Caixas Simples (Tempos 3 e 4) -> Ticks 4, 5, 6, 7
        // Adicionamos um leve "Crescendo" (aumento de volume) para dar pegada
        
        // Tick 4 (Beat 3)
        if (tickIndex === 4 && snare) playSampleBuffer(ctx, snare, now, globalMetronomeVolume * 0.85); 
        // Tick 5 (Beat 3 e)
        if (tickIndex === 5 && snare) playSampleBuffer(ctx, snare, now, globalMetronomeVolume * 0.90); 
        // Tick 6 (Beat 4)
        if (tickIndex === 6 && snare) playSampleBuffer(ctx, snare, now, globalMetronomeVolume * 1.0);  
        // Tick 7 (Beat 4 e) - Acento final antes do 1
        if (tickIndex === 7 && snare) playSampleBuffer(ctx, snare, now, globalMetronomeVolume * 1.15); 

      } else {
        // --- COMPASSO NORMAL ---
        
        // Kick no Tempo 1 (0) e 3 (4)
        if ((tickIndex === 0 || tickIndex === 4) && kick) {
          playSampleBuffer(ctx, kick, now, globalMetronomeVolume * (tickIndex === 0 ? 1.0 : 0.9));
        }

        // Snare no Tempo 2 (2) e 4 (6)
        if ((tickIndex === 2 || tickIndex === 6) && snare) {
          playSampleBuffer(ctx, snare, now, globalMetronomeVolume);
        }
      }
      break;
    }
    case 'taiko': {
      // Fallback
      if (tickIndex % 2 !== 0) return; // Apenas semínimas
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 140 : 90, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.15);
      gain.gain.setValueAtTime(isAccent ? 1.2 : 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    case 'hihat': {
      if (tickIndex % 2 !== 0) return; // Apenas semínimas
      if (drumBufferCache['hihat']) {
         playSampleBuffer(ctx, drumBufferCache['hihat'], now, globalMetronomeVolume * (isAccent ? 0.8 : 0.5));
      } else {
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(isAccent ? 7000 : 10000, now);
        gain.gain.setValueAtTime(isAccent ? 0.4 : 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        noise.start(now);
      }
      break;
    }
    case 'kick': {
       if (tickIndex % 2 !== 0) return; // Apenas semínimas
       if (drumBufferCache['kick']) {
         playSampleBuffer(ctx, drumBufferCache['kick'], now, globalMetronomeVolume * (isAccent ? 1.0 : 0.8));
      } else {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(isAccent ? 180 : 130, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        gain.gain.setValueAtTime(isAccent ? 1.5 : 1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.15);
      }
      break;
    }
    case 'cowbell': {
      if (tickIndex % 2 !== 0) return; // Apenas semínimas
      [540, 800].forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(isAccent ? f * 1.1 : f, now);
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(f, now);
        osc.connect(bandpass);
        bandpass.connect(gain);
        osc.start(now);
        osc.stop(now + 0.2);
      });
      gain.gain.setValueAtTime(isAccent ? 0.7 : 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      break;
    }
    default: // BEEP
      if (tickIndex % 2 !== 0) return; // Apenas semínimas
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      // Frequências penetrantes e ganho alto
      osc.frequency.setValueAtTime(isAccent ? 1600 : 1100, now);
      gain.gain.setValueAtTime(isAccent ? 1.0 : 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
  }
};

// --- LOGICA EXISTENTE DE GUITARRA ---

async function loadSample(note: string): Promise<AudioBuffer> {
  if (sampleCache[note]) return sampleCache[note];
  const ctx = getCtx();
  try {
    const response = await fetch(`${SAMPLE_BASE_URL}/${note}.mp3`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    sampleCache[note] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Erro ao carregar amostra ${note}:`, error);
    throw error;
  }
}

export const preloadGuitarSamples = () => {
  OPEN_STRINGS_SAMPLES.forEach(note => loadSample(note).catch(() => {}));
};

export const playNote = async (freq: number, duration = 2.0) => {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const baseFreqs: Record<string, number> = {
    'E2': 82.41, 'A2': 110.00, 'D3': 146.83, 
    'G3': 196.00, 'B3': 246.94, 'E4': 329.63
  };
  let bestMatch = 'E2';
  let minDiff = Infinity;
  for (const note of OPEN_STRINGS_SAMPLES) {
    const diff = Math.abs(Math.log2(freq / baseFreqs[note]));
    if (diff < minDiff) {
      minDiff = diff;
      bestMatch = note;
    }
  }
  try {
    const buffer = await loadSample(bestMatch);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    source.playbackRate.value = freq / baseFreqs[bestMatch];
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
  } catch (e) {
    playPhysicalModelNote(freq, duration);
  }
};

function playPhysicalModelNote(freq: number, duration: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate / freq;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const damping = 0.995;
  for (let i = Math.floor(bufferSize); i < data.length; i++) {
    data[i] = (data[i - Math.floor(bufferSize)] + data[i - Math.floor(bufferSize) - 1]) / 2 * damping;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
}

export const playChord = (frequencies: number[]) => {
  const sortedFreqs = [...frequencies].sort((a, b) => a - b);
  sortedFreqs.forEach((f, i) => {
    const delay = i * 35; 
    setTimeout(() => playNote(f, 3.0), delay);
  });
};
