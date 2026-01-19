import React, { useState, useEffect, useRef } from 'react';
import { Screen, Vocalize } from '../types';
import { VOCALIZES, DISABLE_ALL_PLAYERS, MINIMALIST_LOGO_URL } from '../constants';
import { usePlayback } from '../contexts/PlaybackContext';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  vocalize: Vocalize | null;
  onBack: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const PlayerScreen: React.FC<Props> = ({ vocalize, onBack, onNext, onPrev }) => {
  const { user } = useAuth();
  const isAdmin = user?.email && ['lorenapimenteloficial@gmail.com', 'willmakesongs@gmail.com'].includes(user.email.toLowerCase());

  const {
    play, stop: stopPlayback, pause, resume: resumePlayback,
    isPlaying, isLoading: isPlaybackLoading, currentTime,
    duration, seek, setPitch: setPlaybackPitch, preload, activeUrl
  } = usePlayback();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | undefined>(vocalize?.audioUrl);
  const [activeSource, setActiveSource] = useState<'female' | 'male' | 'example'>('female');
  const { pitch: globalPitch } = usePlayback();
  const [pitch, setPitch] = useState(globalPitch);

  const [barHeights, setBarHeights] = useState<number[]>([70, 35, 25, 85, 45, 25]); // Will be synced by effect
  const [isPlayingState, setIsPlayingState] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);
  const minSwipeDistance = 50;

  // Breathing Exercise State
  const [selectedBreathingTime, setSelectedBreathingTime] = useState(10);
  const breathingIntervals = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
  const LOG_TAG = 'PlayerScreen:';
  const [preparationTime, setPreparationTime] = useState(0);
  const [localBreathingTime, setLocalBreathingTime] = useState(0);

  // Refs
  const animationIntervalRef = useRef<number | null>(null);
  const autoPlayRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentTimeRef = useRef(currentTime);

  // Sync refs
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const lastTickRef = useRef<number>(-1);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);

  const logoConfig = [
    { color: '#0081FF', baseHeight: 70 },
    { color: '#0081FF', baseHeight: 35 },
    { color: '#6F4CE7', baseHeight: 25 },
    { color: '#9333EA', baseHeight: 85 },
    { color: '#FF00BC', baseHeight: 45 },
    { color: '#FF00BC', baseHeight: 25 },
  ];

  const scaleConfig = [
    { color: '#0081FF', baseHeight: 20, label: 'Dó' },
    { color: '#0055D4', baseHeight: 30, label: 'Re' },
    { color: '#002B7F', baseHeight: 40, label: 'Mi' },
    { color: '#4B369D', baseHeight: 50, label: 'Fa' },
    { color: '#6F4CE7', baseHeight: 60, label: 'Sol' },
    { color: '#9333EA', baseHeight: 70, label: 'La' },
    { color: '#C026D3', baseHeight: 85, label: 'Si' },
    { color: '#FF00BC', baseHeight: 100, label: 'Dó' },
  ];

  const scaleDescConfig = [
    { color: '#FF00BC', baseHeight: 100, label: 'Dó' },
    { color: '#C026D3', baseHeight: 85, label: 'Si' },
    { color: '#9333EA', baseHeight: 70, label: 'La' },
    { color: '#6F4CE7', baseHeight: 60, label: 'Sol' },
    { color: '#4B369D', baseHeight: 50, label: 'Fa' },
    { color: '#002B7F', baseHeight: 40, label: 'Mi' },
    { color: '#0055D4', baseHeight: 30, label: 'Re' },
    { color: '#0081FF', baseHeight: 20, label: 'Dó' },
  ];

  const activeConfig = (vocalize?.id === 'vqc-major-asc' || vocalize?.id === 'vqc-minor-asc') ? scaleConfig : (vocalize?.id === 'vqc-major-desc' || vocalize?.id === 'vqc-minor-desc' ? scaleDescConfig : logoConfig);
  const activeConfigRef = useRef(activeConfig);

  // Sync ref with activeConfig
  useEffect(() => {
    activeConfigRef.current = activeConfig;
    setBarHeights(activeConfig.map(b => b.baseHeight));
  }, [activeConfig]);


  // Cálculo da taxa de reprodução baseada nos semitons
  const playbackRate = Math.pow(2, pitch / 12);

  // Limpeza ao desmontar - REMOVIDO para permitir background playback
  useEffect(() => {
    // Não paramos mais o áudio no unmount
    return () => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  }, []);

  // Preload Bell Audio
  useEffect(() => {
    if (vocalize?.isBreathing && !bellAudioRef.current) {
      bellAudioRef.current = new Audio('https://AcademiaVQC-App.s3.us-east-005.backblazeb2.com/VOCALIZES+VQC+PRO/Bell+Boxe.mp3');
      bellAudioRef.current.preload = 'auto';
    }
  }, [vocalize?.isBreathing]);

  // Consolidamos a inicialização e o preload para evitar loops de efeitos
  useEffect(() => {
    if (!vocalize) return;

    // Se o áudio ATIVO no contexto já é um dos áudios deste vocalize,
    // apenas sincronizamos o estado local sem parar o som.
    const isRelatedAudio = activeUrl && (
      activeUrl === vocalize.audioUrl ||
      activeUrl === vocalize.audioUrlMale ||
      activeUrl === vocalize.exampleUrl
    );

    if (isRelatedAudio) {
      if (activeAudioUrl !== activeUrl) {
        setActiveAudioUrl(activeUrl);
      }
      // Sincroniza o activeSource com base no URL atual de forma inequívoca
      if (activeUrl === vocalize.exampleUrl) {
        setActiveSource('example');
      } else if (vocalize.audioUrlMale && activeUrl === vocalize.audioUrlMale) {
        setActiveSource('male');
      } else {
        // Se não for male nem example, e estamos tocando este vocalize,
        // só pode ser female (padrao)
        setActiveSource('female');
      }
    } else if (!isPlaying) {
      setActiveAudioUrl(vocalize.audioUrl);
      setActiveSource('female');
      setPitch(0);
    }
    // Se isPlaying é true MAS activeUrl não bate com este vocalize, 
    // NÃO paramos imediatamente. Isso evita que re-renderizações ou pequenos atrasos
    // na sincronia do App.tsx causem um stop acidental. 
    // O App.tsx se encarregará de atualizar o 'vocalize' prop via auto-sync.

    // Preload de vizinhos
    const curIdx = VOCALIZES.findIndex(v => v.id === vocalize.id);
    const toPreload = [];
    if (curIdx > 0) toPreload.push(VOCALIZES[curIdx - 1].audioUrl);
    if (curIdx < VOCALIZES.length - 1) toPreload.push(VOCALIZES[curIdx + 1].audioUrl);
    preload(toPreload.filter(Boolean) as string[]);
  }, [vocalize, activeUrl, isPlaying]); // Adicionamos dependências para reagir a mudanças globais

  // Autoplay Effect
  useEffect(() => {
    if (!isPlaybackLoading && autoPlayRef.current) {
      startPlayback();
      autoPlayRef.current = false;
    }
  }, [isPlaybackLoading]);

  // Atualiza o Pitch em tempo real
  useEffect(() => {
    setPlaybackPitch(pitch);
  }, [pitch, setPlaybackPitch]);
  // Stop visualizer when nothing is playing
  useEffect(() => {
    if (!isPlaying && !isPlayingState) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setBarHeights(activeConfigRef.current.map(b => b.baseHeight));
    } else if ((isPlaying || isPlayingState) && !animationIntervalRef.current) {
      startVisualizer();
    }
  }, [isPlaying, isPlayingState]);

  // Breathing Timer Logic
  useEffect(() => {
    let interval: number | null = null;
    if (vocalize?.isBreathing && isPlayingState) {
      interval = window.setInterval(() => {
        // Handle Preparation Phase
        if (preparationTime > 0) {
          setPreparationTime(prev => {
            const newValue = Math.max(0, prev - 0.1);

            // Preparation ticks
            const currentSec = Math.ceil(newValue);
            if (currentSec !== lastTickRef.current && currentSec > 0) {
              lastTickRef.current = currentSec;
              playClick();
            }

            if (newValue === 0) lastTickRef.current = -1; // Reset for main cycle
            return newValue;
          });
          return;
        }

        // Handle Main Cycle
        setLocalBreathingTime(prev => {
          const cycleTotal = 5 + selectedBreathingTime;
          const newValue = (prev + 0.1) % cycleTotal;

          // Tick/Bell Logic
          const currentSec = Math.floor(newValue);
          if (currentSec !== lastTickRef.current) {
            lastTickRef.current = currentSec;
            if (currentSec === Math.floor(cycleTotal) - 1) {
              playBell();
            } else {
              playClick();
            }
          }

          return newValue;
        });
      }, 100);
    } else {
      setLocalBreathingTime(0);
      setPreparationTime(0);
      lastTickRef.current = -1;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [vocalize?.isBreathing, isPlayingState, selectedBreathingTime, preparationTime]);

  const playClick = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const envelope = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      envelope.gain.setValueAtTime(0.1, ctx.currentTime);
      envelope.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(envelope);
      envelope.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) { console.error('Audio synthesis failed', e); }
  };

  const playBell = () => {
    try {
      if (!bellAudioRef.current) {
        bellAudioRef.current = new Audio('https://AcademiaVQC-App.s3.us-east-005.backblazeb2.com/VOCALIZES+VQC+PRO/Bell+Boxe.mp3');
        bellAudioRef.current.preload = 'auto';
      }
      bellAudioRef.current.currentTime = 0;
      bellAudioRef.current.play().catch(e => console.error('Bell play failed', e));
    } catch (e) {
      console.error('Bell logic failed', e);
    }
  };

  const playCowbell = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // TR-808 style cowbell frequencies
      const f1 = 540;
      const f2 = 800;

      [f1, f2].forEach(freq => {
        const osc = ctx.createOscillator();
        const envelope = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, ctx.currentTime);
        filter.Q.setValueAtTime(10, ctx.currentTime);

        envelope.gain.setValueAtTime(0.1, ctx.currentTime);
        envelope.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(filter);
        filter.connect(envelope);
        envelope.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      });
    } catch (e) { console.error('Cowbell synthesis failed', e); }
  };

  // Sincroniza visualizador se já estiver tocando ao abrir a tela
  useEffect(() => {
    if (isPlaying) {
      startVisualizer();
    }
  }, [isPlaying]);

  const stopAudio = () => {
    stopPlayback();
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    setBarHeights(activeConfigRef.current.map(b => b.baseHeight));
  };

  const resetPlayback = () => {
    stopAudio();
  };

  const startVisualizer = () => {
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

    const config = activeConfigRef.current;
    if (vocalize?.id === 'vqc-major-asc' || vocalize?.id === 'vqc-minor-asc' || vocalize?.id === 'vqc-major-desc' || vocalize?.id === 'vqc-minor-desc') {
      setBarHeights(activeConfigRef.current.map(c => c.baseHeight));
      return;
    }
    animationIntervalRef.current = window.setInterval(() => {
      setBarHeights(prev => {
        const config = activeConfigRef.current;
        const isScaleExercise = vocalize?.id === 'vqc-major-asc';

        // Ensure prev has correct length, if not, reset reset to base
        if (prev.length !== config.length) return config.map(c => c.baseHeight);

        // Sequenced Animation for Scale
        if (isScaleExercise && isPlaying) {
          const beatDuration = 60 / 100; // 0.6s per beat @ 100 BPM
          const totalBeats = 8; // 8 notes
          const sequenceDuration = totalBeats * beatDuration; // 4.8s
          const cycleDuration = sequenceDuration + (2.4); // 4.8s + 2.4s rest = 7.2s

          // Use refs to get latest values inside interval
          const time = currentTimeRef.current || 0;

          // Calculate active note index (0-7) based on modulo time
          // We add a small offset (0.1s) to allow for attack time/latentcy perception
          const moduloTime = time % (cycleDuration + 2.4); // Adding 2.4s (4 beats) padding/rest for modulation loops
          // If in padding time, maybe flash all or dim all?

          let activeIndex = -1;
          if (moduloTime < sequenceDuration) {
            activeIndex = Math.floor(moduloTime / beatDuration);
          }

          return prev.map((h, i) => {
            const base = config[i].baseHeight;
            // Logic: Active note is MAX. Previous notes are MID. Future notes are MIN.
            if (i === activeIndex) {
              // Active: Pulse between 1.0 and 1.2 of max height, bright color handled by rendering
              return 100 + Math.random() * 20;
            } else if (i < activeIndex) {
              // Past: Stay visible but static-ish (Trail)
              return 60;
            } else {
              // Future: Low
              return 20;
            }
          });
        }

        return prev.map((h, i) => {
          const base = config[i].baseHeight;
          const randomScale = 0.5 + Math.random() * 1.5;
          return Math.max(15, Math.min(140, base * randomScale));
        });
      });
    }, 80);
  };

  const startPlayback = () => {
    if (activeAudioUrl) {
      play(activeAudioUrl, { pitch });
    }
    setIsPlayingState(true);
    startVisualizer();
  };

  // Sync with context if not breathing
  useEffect(() => {
    if (!vocalize?.isBreathing) {
      setIsPlayingState(isPlaying);
    }
  }, [isPlaying, vocalize?.isBreathing]);

  const togglePlay = () => {
    // Resume AudioContext immediately on user interaction (Fix for iOS/Mobile)
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(e => console.error('AudioContext resume failed', e));
    }

    if (isPlayingState) {
      if (activeSource !== 'example') pause();
      setIsPlayingState(false);
      setPreparationTime(0);

      // Auto-increment breathing time when finishing an exercise
      if (vocalize?.isBreathing) {
        setSelectedBreathingTime(prev => Math.min(prev + 2, 30));
      }
    } else {
      if (vocalize?.isBreathing) {
        // Stop example if playing
        if (activeSource === 'example' && isPlaying) pause();

        setPreparationTime(2.0); // Start preparation
        setIsPlayingState(true);
        // Play main audio if available (usually silent for breathing)
        if (vocalize.audioUrl) play(vocalize.audioUrl, { pitch });
      } else {
        startPlayback();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (Number.isFinite(time)) {
      seek(time);
    }
  };

  const changePitch = (semitones: number) => {
    const newPitch = Math.max(-12, Math.min(12, pitch + semitones));
    setPitch(newPitch);
  };

  const handleTrain = async (type: 'female' | 'male' | 'example') => {
    if (!vocalize) return;

    // Stop breathing cycle if starting audio train
    if (isPlayingState && vocalize.isBreathing) { // Only stop breathing cycle if it's active
      setIsPlayingState(false);
      setPreparationTime(0);
    }

    let targetUrl;
    if (type === 'male') targetUrl = vocalize.audioUrlMale;
    else if (type === 'example') targetUrl = vocalize.exampleUrl;
    else targetUrl = vocalize.audioUrl;

    if (!targetUrl) return;

    if (isPlaying && activeUrl === targetUrl) {
      pause();
      // Stop visualizer when audio stops
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setBarHeights(activeConfigRef.current.map(b => b.baseHeight));
    } else {
      setActiveAudioUrl(targetUrl);
      setActiveSource(type);
      play(targetUrl, { pitch });
      startVisualizer(); // Start visualizer when new audio plays
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} `;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const finalTouch = touchEnd || {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchStart.x - finalTouch.x;
    const deltaY = touchStart.y - finalTouch.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && onNext) {
        onNext();
      } else if (deltaX < 0 && onPrev) {
        onPrev();
      }
    }
  };

  const currentTitle = vocalize?.title || "Selecione um exercício";
  const currentCategory = vocalize?.category || "Biblioteca";

  return (
    <div
      className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden pb-24 touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-[#6F4CE7] blur-[150px] pointer-events-none transition-opacity duration-1000 ${isPlayingState ? 'opacity-30' : 'opacity-10'}`}></div>

      <style>{`
input[type = 'range']:: -webkit - slider - thumb {
  -webkit - appearance: none;
  appearance: none;
  width: 0;
  height: 0;
  background: transparent;
  border: none;
}
input[type = 'range']:: -moz - range - thumb {
  width: 0;
  height: 0;
  background: transparent;
  border: none;
}
/* Mobile Specific */
input[type = 'range']:: -webkit - slider - runnable - track {
  cursor: pointer;
}
`}</style>

      {/* Header */}
      <div className="flex items-center justify-between p-6 z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">
          <span className="material-symbols-rounded">keyboard_arrow_down</span>
        </button>
        <div className="flex flex-col items-center">

        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">
          <span className="material-symbols-rounded">more_horiz</span>
        </button>
      </div>

      {/* Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 overflow-y-auto hide-scrollbar">

        {/* INFO ABOVE CIRCLE FOR BREATHING */}
        <div className={`w-full text-center mb-6 ${vocalize?.isBreathing ? 'mt-8' : ''}`}>
          <h2 className="text-2xl font-black text-white mb-2 leading-tight tracking-tighter">
            {vocalize?.title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0081FF]"></span>
              {vocalize?.category}
            </span>
            <span>•</span>
            <span>{vocalize?.difficulty}</span>
          </div>
        </div>



        <div className={`${vocalize?.isBreathing ? 'h-72 items-center' : 'h-52 items-end'} flex justify-center ${['vqc-major-asc', 'vqc-minor-asc', 'vqc-major-desc', 'vqc-minor-desc'].includes(vocalize?.id || '') ? 'gap-3' : 'gap-2'} shrink-0 relative z-10 my-8 transition-all duration-500`}>
          {vocalize?.isBreathing ? (
            <button
              onClick={togglePlay}
              disabled={isPlaybackLoading || (DISABLE_ALL_PLAYERS && !isAdmin)}
              className="relative flex items-center justify-center w-60 h-60 mb-8 hover:scale-[1.02] active:scale-95 transition-transform group"
            >
              {/* Outer Glow */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-300"
                style={{
                  backgroundColor: preparationTime > 0 ? '#6F4CE7' : (localBreathingTime < 5 ? '#0081FF' : '#FF00BC'),
                  transform: preparationTime > 0 ? 'scale(1)' : `scale(${localBreathingTime < 5 ? 0.8 + (localBreathingTime / 5) * 0.4 : 1.2 - ((localBreathingTime - 5) / selectedBreathingTime) * 0.4})`
                }}
              ></div>

              {/* Main Circle */}
              <div
                className="relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-[100ms] border-4 border-white/10"
                style={{
                  background: preparationTime > 0
                    ? 'radial-gradient(circle, #1A202C 0%, #2D3748 100%)'
                    : (localBreathingTime < 5
                      ? 'radial-gradient(circle, #0081FF 0%, #6F4CE7 100%)'
                      : 'radial-gradient(circle, #FF00BC 0%, #610047 100%)'),
                  transform: preparationTime > 0 ? 'scale(1)' : `scale(${localBreathingTime < 5 ? 0.8 + (localBreathingTime / 5) * 0.4 : 1.2 - ((localBreathingTime - 5) / selectedBreathingTime) * 0.4})`,
                  boxShadow: `0 0 60px ${preparationTime > 0 ? '#6F4CE740' : (localBreathingTime < 5 ? '#0081FF60' : '#FF00BC60')}`
                }}
              >
                {!isPlayingState && !isPlaybackLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-rounded text-white text-5xl">play_arrow</span>
                  </div>
                )}

                {preparationTime > 0 ? (
                  <>
                    <span className="text-white/60 font-black text-[10px] uppercase tracking-widest mb-1">
                      Prepáre-se
                    </span>
                    <span className="text-white font-mono text-5xl font-black">
                      {Math.ceil(preparationTime)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-white font-black text-base uppercase tracking-tighter mt-4">
                      {localBreathingTime < 5 ? 'Inspire' : 'Expire'}
                    </span>
                    <span className="text-white/80 font-mono text-3xl mt-2 font-black">
                      {Math.ceil(localBreathingTime < 5 ? 5 - localBreathingTime : selectedBreathingTime - (localBreathingTime - 5))}s
                    </span>
                  </>
                )}
              </div>

              {/* Progress Ring */}
              <svg className="absolute inset-0 w-60 h-60 -rotate-90">
                <circle
                  cx="120"
                  cy="120"
                  r="110"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeDasharray="691"
                  strokeDashoffset={
                    preparationTime > 0
                      ? 691 - (691 * (preparationTime / 2))
                      : 691 - (691 * (localBreathingTime / (5 + selectedBreathingTime)))
                  }
                  className="opacity-10"
                />
              </svg>
            </button>
          ) : (
            activeConfig.map((bar, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                {/* Note Label */}
                {(bar as any).label && (
                  <span className={`text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${isPlayingState ? 'text-white translate-y-0 opacity-100' : 'text-transparent translate-y-4 opacity-0'}`} style={{ textShadow: `0 0 10px ${bar.color}` }}>
                    {(bar as any).label}
                  </span>
                )}
                {/* Bar */}
                <div
                  className={`rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-[80ms] ease-linear ${['vqc-major-asc', 'vqc-minor-asc', 'vqc-major-desc', 'vqc-minor-desc'].includes(vocalize?.id || '') ? 'w-5' : 'w-3'}`}
                  style={{
                    backgroundColor: bar.color,
                    height: `${barHeights[index] * 0.6}px`,
                    boxShadow: isPlayingState ? `0 0 15px ${bar.color}60` : 'none',
                    opacity: isPlayingState ? 1 : 0.6
                  }}
                ></div>
              </div>
            ))
          )}
        </div>


        {/* TIMER CONTROL FOR BREATHING */}
        {vocalize?.isBreathing && (
          <div className="w-full max-w-xs mb-8 p-3 rounded-2xl bg-[#1A202C]/80 border border-white/5 shrink-0">
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-3 text-center">Tempo de Expiração (Segundos)</p>
            <div className="flex flex-wrap justify-center gap-2">
              {breathingIntervals.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedBreathingTime(time)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all active:scale-90 ${selectedBreathingTime === time
                    ? 'bg-brand-gradient text-white shadow-lg'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="w-full text-center mb-6">
          {DISABLE_ALL_PLAYERS && !isAdmin && (
            <div className="bg-[#FF00BC]/10 border border-[#FF00BC]/30 text-[#FF00BC] text-sm font-bold py-3 px-6 rounded-2xl mb-6 inline-flex items-center gap-2 animate-pulse">
              <span className="material-symbols-rounded text-lg">info</span>
              Ativo para assinantes
            </div>
          )}

          {/* Debug - Remover após confirmar fix */}
          <div className="hidden" id="active-source-debug">{activeSource}</div>

          {errorMsg && (
            <div className="bg-[#FF00BC]/10 border border-[#FF00BC]/20 text-red-200 text-xs p-3 rounded-lg mb-4 inline-block">
              <span className="material-symbols-rounded text-sm align-bottom mr-1">warning</span>
              {errorMsg}
            </div>
          )}
        </div>

        {/* AUDIO SOURCE BUTTONS */}
        <div className="flex justify-center gap-4 mb-8 shrink-0">
          {vocalize?.isBreathing ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => handleTrain('example')}
                className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-700 border-[3px] overflow-hidden shadow-2xl ${activeSource === 'example' && isPlaying
                  ? 'bg-[#1A202C] border-[#6F4CE7] shadow-[#6F4CE7]/40 scale-105'
                  : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:border-white/20'
                  }`}
              >
                {/* Internal Logo / Visualizer */}
                <div className="flex items-end justify-center gap-[4.5px] h-10 relative z-10 translate-y-0.5">
                  {activeConfig.map((bar, index) => (
                    <div
                      key={index}
                      className="w-1.5 rounded-full transition-all duration-300"
                      style={{
                        height: activeSource === 'example' && isPlaying
                          ? `${(barHeights[index] / 140) * 50}px`
                          : `${(bar.baseHeight / 100) * 35}px`,
                        backgroundColor: bar.color, // Full brand colors even when static
                        boxShadow: activeSource === 'example' && isPlaying ? `0 0 12px ${bar.color}60` : `0 0 8px ${bar.color}30`,
                        opacity: 1 // Full opacity for "lit" look
                      }}
                    />
                  ))}
                </div>

                {/* Subtle Inner Glow when playing */}
                {activeSource === 'example' && isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6F4CE7]/10 to-transparent animate-pulse" />
                )}
              </button>

              <div className="flex flex-col items-center">
                <span className={`text-[12px] uppercase font-black tracking-[0.25em] transition-colors duration-300 ${activeSource === 'example' && isPlaying ? 'text-white' : 'text-gray-500'}`}>Exemplo</span>
                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.1em] mt-1">Guia Técnico</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => handleTrain('example')}
                  className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-700 border-[3px] overflow-hidden shadow-xl ${activeSource === 'example' && isPlaying
                    ? 'bg-[#1A202C] border-[#6F4CE7] shadow-[#6F4CE7]/40 scale-105'
                    : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:border-white/20'
                    }`}
                >
                  <div className="flex items-end justify-center gap-[3.5px] h-8 relative z-10 translate-y-0.5">
                    {activeConfig.map((bar, index) => (
                      <div
                        key={index}
                        className="w-1.5 rounded-full transition-all duration-300"
                        style={{
                          height: activeSource === 'example' && isPlaying
                            ? `${(barHeights[index] / 140) * 40}px`
                            : `${(bar.baseHeight / 100) * 28}px`,
                          backgroundColor: bar.color,
                          boxShadow: activeSource === 'example' && isPlaying ? `0 0 10px ${bar.color}50` : `0 0 6px ${bar.color}20`,
                          opacity: 1
                        }}
                      />
                    ))}
                  </div>
                </button>
                <div className="flex flex-col items-center">
                  <span className={`text-[11px] uppercase font-black tracking-[0.2em] ${activeSource === 'example' && isPlaying ? 'text-white' : 'text-gray-500'}`}>Exemplo</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 w-full max-w-[320px]">
                {/* Single Vocalize Button vs Gendered Buttons */}
                {!vocalize.audioUrlMale ? (
                  <div className="flex justify-center flex-1">
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => handleTrain('female')}
                        className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-700 border-[3px] overflow-hidden shadow-xl ${activeSource === 'female' && isPlaying
                          ? 'bg-[#1A202C] border-[#0081FF] shadow-[#0081FF]/40 scale-105'
                          : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:border-white/20'
                          }`}
                      >
                        <div className="flex items-end justify-center gap-[3.5px] h-8 relative z-10 translate-y-0.5">
                          {activeConfig.map((bar, index) => (
                            <div
                              key={index}
                              className="w-1.5 rounded-full transition-all duration-300"
                              style={{
                                height: activeSource === 'female' && isPlaying
                                  ? `${(barHeights[index] / 140) * 40}px`
                                  : `${(bar.baseHeight / 100) * 28}px`,
                                backgroundColor: bar.color,
                                boxShadow: activeSource === 'female' && isPlaying ? `0 0 10px ${bar.color}50` : `0 0 6px ${bar.color}20`,
                                opacity: 1
                              }}
                            />
                          ))}
                        </div>
                      </button>
                      <span className={`text-[11px] uppercase font-black tracking-[0.2em] ${activeSource === 'female' && isPlaying ? 'text-white' : 'text-gray-500'}`}>Iniciar Exercício</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => handleTrain('female')}
                        className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all border-4 ${activeSource === 'female' && isPlaying
                          ? 'bg-[#FF00BC]/20 border-[#FF00BC] shadow-[0_0_20px_rgba(255,0,188,0.3)]'
                          : 'bg-white/5 border-white/5 grayscale opacity-50 hover:opacity-100'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeSource === 'female' && isPlaying ? 'bg-[#FF00BC] text-white' : 'bg-white/10 text-gray-400'}`}>
                          <span className="material-symbols-rounded text-2xl">woman</span>
                        </div>
                      </button>
                      <span className={`text-[11px] uppercase font-black tracking-widest ${activeSource === 'female' && isPlaying ? 'text-white' : 'text-gray-500'}`}>Vocalize F.</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => handleTrain('male')}
                        className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all border-4 ${activeSource === 'male' && isPlaying
                          ? 'bg-[#0081FF]/20 border-[#0081FF] shadow-[0_0_20px_rgba(0,129,255,0.3)]'
                          : 'bg-white/5 border-white/5 grayscale opacity-50 hover:opacity-100'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeSource === 'male' && isPlaying ? 'bg-[#0081FF] text-white' : 'bg-white/10 text-gray-400'}`}>
                          <span className="material-symbols-rounded text-2xl">man</span>
                        </div>
                      </button>
                      <span className={`text-[11px] uppercase font-black tracking-widest ${activeSource === 'male' && isPlaying ? 'text-white' : 'text-gray-500'}`}>Vocalize M.</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* PITCH CONTROL */}
        {!vocalize?.isBreathing && (
          <div className="w-full max-w-xs mb-8 p-3 rounded-2xl bg-[#1A202C]/80 border border-white/5 flex items-center justify-between shrink-0">
            <button
              onClick={() => changePitch(-1)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors active:scale-95"
            >
              <span className="material-symbols-rounded">remove</span>
            </button>

            <div className="text-center">
              <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-0.5">
                Tom {pitch !== 0 && '(HQ Resampling)'}
              </p>
              <p className={`text-lg font-bold font-mono transition-colors ${pitch !== 0 ? 'text-[#FF00BC]' : 'text-white'}`}>
                {pitch > 0 ? `+${pitch}` : pitch} st
              </p>
            </div>

            <button
              onClick={() => changePitch(1)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors active:scale-95"
            >
              <span className="material-symbols-rounded">add</span>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full mb-8 shrink-0 relative">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF00BC]"
          />
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[10px] text-gray-500 font-mono">{formatTime(currentTime)}</span>
            <span className="text-[10px] text-gray-500 font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 w-full max-w-sm mb-10 shrink-0">
          <button
            onClick={onPrev}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <span className="material-symbols-rounded text-3xl">skip_previous</span>
          </button>

          {!vocalize?.isBreathing && (
            <>
              <button
                onClick={() => { seek(Math.max(0, currentTime - 5)); }}
                disabled={isPlaybackLoading}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-rounded text-3xl">replay_5</span>
              </button>

              <button
                onClick={togglePlay}
                disabled={isPlaybackLoading || (DISABLE_ALL_PLAYERS && !isAdmin)}
                className={`w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center shadow-[0_10px_30px_rgba(238,19,202,0.4)] hover:scale-105 transition-transform active:scale-95 ${isPlaybackLoading || (DISABLE_ALL_PLAYERS && !isAdmin) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {isPlaybackLoading ? (
                  <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-rounded text-4xl text-white fill-current">
                    {isPlayingState ? 'pause' : 'play_arrow'}
                  </span>
                )}
              </button>

              <button
                onClick={() => { seek(Math.min(duration, currentTime + 5)); }}
                disabled={isPlaybackLoading}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-rounded text-3xl">forward_5</span>
              </button>
            </>
          )}

          <button
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <span className="material-symbols-rounded text-3xl">skip_next</span>
          </button>
        </div>
      </div>
    </div>
  );
};
