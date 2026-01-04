
import React, { useState, useEffect, useRef } from 'react';
import { Screen, Vocalize } from '../types';
import { VOCALIZES } from '../constants';
import { usePlayback } from '../contexts/PlaybackContext';

interface Props {
  vocalize: Vocalize | null;
  onBack: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const PlayerScreen: React.FC<Props> = ({ vocalize, onBack, onNext, onPrev }) => {
  const {
    play, stop: stopPlayback, pause, resume: resumePlayback,
    isPlaying, isLoading: isPlaybackLoading, currentTime,
    duration, seek, setPitch: setPlaybackPitch, preload
  } = usePlayback();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | undefined>(vocalize?.audioUrl);
  const [pitch, setPitch] = useState(0);

  // Estados para animação das barras
  const [barHeights, setBarHeights] = useState<number[]>([70, 35, 25, 85, 45, 25]);

  // Refs
  const animationIntervalRef = useRef<number | null>(null);
  const autoPlayRef = useRef(false);

  const logoConfig = [
    { color: '#0081FF', baseHeight: 70 },
    { color: '#0081FF', baseHeight: 35 },
    { color: '#6F4CE7', baseHeight: 25 },
    { color: '#9333EA', baseHeight: 85 },
    { color: '#EE13CA', baseHeight: 45 },
    { color: '#FF00BC', baseHeight: 25 },
  ];

  // Cálculo da taxa de reprodução baseada nos semitons
  const playbackRate = Math.pow(2, pitch / 12);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Inicialização e Carregamento do Áudio
  useEffect(() => {
    if (vocalize) {
      // Se o vocalize mudou mas a URL é a mesma, não recarrega (exceto troca H/L)
      if (activeAudioUrl === vocalize.audioUrl) {
        // Já carregado, apenas reseta
        // resetPlayback(); // This function doesn't exist anymore, stopPlayback() is used
        stopPlayback();
      } else {
        setActiveAudioUrl(vocalize.audioUrl);
        setPitch(0); // Reseta pitch ao mudar de exercício
      }
    }
  }, [vocalize]);

  useEffect(() => {
    if (activeAudioUrl) {
      loadAudio(activeAudioUrl);

      // Preload next and previous
      if (vocalize) {
        const curIdx = VOCALIZES.findIndex(v => v.id === vocalize.id);
        const toPreload = [];
        if (curIdx > 0) toPreload.push(VOCALIZES[curIdx - 1].audioUrl);
        if (curIdx < VOCALIZES.length - 1) toPreload.push(VOCALIZES[curIdx + 1].audioUrl);
        preload(toPreload.filter(Boolean) as string[]);
      }
    }
  }, [activeAudioUrl]);

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

  const loadAudio = async (url: string) => {
    stopAudio();
    if (autoPlayRef.current) {
      play(url, { pitch });
      autoPlayRef.current = false;
    } else {
      // Just warm up/preload if not autoplaying? 
      // In the context of PlayerScreen, we probably want to play if it's the active vocalize
      // Actually, PlayerScreen usually starts paused unless handled by handleTrain
    }
  };

  const stopAudio = () => {
    stopPlayback();
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    setBarHeights(logoConfig.map(b => b.baseHeight));
  };

  const resetPlayback = () => {
    stopAudio();
  };

  const startPlayback = () => {
    if (!activeAudioUrl) return;
    play(activeAudioUrl, { pitch });

    // Visualizer Loop
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    animationIntervalRef.current = window.setInterval(() => {
      setBarHeights(prev => prev.map((h, i) => {
        const base = logoConfig[i].baseHeight;
        const randomScale = 0.5 + Math.random() * 1.5;
        return Math.max(15, Math.min(140, base * randomScale));
      }));
    }, 80);
  };

  const togglePlay = async () => {
    if (isPlaybackLoading) return;

    if (isPlaying) {
      pause();
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      setBarHeights(logoConfig.map(b => b.baseHeight));
    } else {
      // Direct call within click handler
      startPlayback();
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

    let targetUrl;
    if (type === 'male') targetUrl = vocalize.audioUrlMale;
    else if (type === 'example') targetUrl = vocalize.exampleUrl;
    else targetUrl = vocalize.audioUrl;

    if (!targetUrl) return;

    if (targetUrl !== activeAudioUrl) {
      autoPlayRef.current = true;
      setActiveAudioUrl(targetUrl);
      // Even if we set activeAudioUrl and wait for useEffect, 
      // some iOS versions lose the gesture if there's any state-driven delay.
      // Better to call play() directly if possible.
      play(targetUrl, { pitch });
    } else {
      togglePlay();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const currentTitle = vocalize?.title || "Selecione um exercício";
  const currentCategory = vocalize?.category || "Biblioteca";

  return (
    <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden pb-24">
      <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-[#6F4CE7] blur-[150px] pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-30' : 'opacity-10'}`}></div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
          background: transparent;
          border: none;
        }
        input[type='range']::-moz-range-thumb {
          width: 0;
          height: 0;
          background: transparent;
          border: none;
        }
        /* Mobile Specific */
        input[type='range']::-webkit-slider-runnable-track {
          cursor: pointer;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between p-6 z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">
          <span className="material-symbols-rounded">keyboard_arrow_down</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-gray-400">Tocando agora</span>
          <span className="text-sm font-bold truncate max-w-[200px]">{currentTitle}</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">
          <span className="material-symbols-rounded">more_horiz</span>
        </button>
      </div>

      {/* Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 overflow-y-auto hide-scrollbar">

        <div className="h-48 flex items-center justify-center gap-4 mb-4 shrink-0">
          {logoConfig.map((bar, index) => (
            <div
              key={index}
              className="w-5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-[80ms] ease-linear"
              style={{
                backgroundColor: bar.color,
                height: `${barHeights[index] * 1.2}px`,
                boxShadow: isPlaying ? `0 0 20px ${bar.color}40` : 'none'
              }}
            ></div>
          ))}
        </div>

        <div className="w-full text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{currentTitle}</h1>
          <p className="text-gray-400 mb-6">{currentCategory} • {vocalize?.difficulty || 'Geral'}</p>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-lg mb-4 inline-block">
              <span className="material-symbols-rounded text-sm align-bottom mr-1">warning</span>
              {errorMsg}
            </div>
          )}
        </div>

        {/* PITCH CONTROL (High Quality Resampling) */}
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

        {/* Progress Bar */}
        <div className="w-full mb-8 shrink-0 relative">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isPlaybackLoading}
            className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, #FF00BC 0%, #6F4CE7 ${(currentTime / (duration || 0.1)) * 100}%, #2D3748 ${(currentTime / (duration || 0.1)) * 100}%, #2D3748 100%)`
            }}
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2 px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 w-full max-w-sm mb-10 shrink-0">
          {/* Previous */}
          <button
            onClick={onPrev}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <span className="material-symbols-rounded text-3xl">skip_previous</span>
          </button>

          <button
            onClick={() => { seek(Math.max(0, currentTime - 5)); }}
            disabled={isPlaybackLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <span className="material-symbols-rounded text-3xl">replay_5</span>
          </button>

          <button
            onClick={togglePlay}
            disabled={isPlaybackLoading}
            className={`w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center shadow-[0_10px_30px_rgba(238,19,202,0.4)] hover:scale-105 transition-transform active:scale-95 ${isPlaybackLoading ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            {isPlaybackLoading ? (
              <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-rounded text-4xl text-white fill-current">
                {isPlaying ? 'pause' : 'play_arrow'}
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

          {/* Next */}
          <button
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <span className="material-symbols-rounded text-3xl">skip_next</span>
          </button>
        </div>

        {/* Train Buttons (Replacing Tools) */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6 shrink-0">
          {/* EXAMPLE BUTTON */}
          <button
            onClick={() => handleTrain('example')}
            disabled={!vocalize?.exampleUrl}
            className={`rounded-xl p-3 flex flex-col items-center justify-center border cursor-pointer transition-all group ${activeAudioUrl === vocalize?.exampleUrl
              ? 'bg-[#1A202C] border-[#6F4CE7] shadow-[0_0_15px_rgba(111,76,231,0.2)]'
              : 'bg-[#1A202C] border-white/5 hover:border-[#6F4CE7]/50 hover:bg-[#6F4CE7]/10'
              } ${!vocalize?.exampleUrl ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-rounded text-[#6F4CE7] text-xl">play_circle</span>
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider mb-0.5">Exemplo</span>
            <span className="text-[9px] text-gray-400">Guia</span>
          </button>

          {/* FEMALE BUTTON */}
          <button
            onClick={() => handleTrain('female')}
            className={`rounded-xl p-3 flex flex-col items-center justify-center border cursor-pointer transition-all group ${activeAudioUrl === vocalize?.audioUrl
              ? 'bg-[#1A202C] border-[#FF00BC] shadow-[0_0_15px_rgba(255,0,188,0.2)]'
              : 'bg-[#1A202C] border-white/5 hover:border-[#FF00BC]/50 hover:bg-[#FF00BC]/10'
              }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#FF00BC]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-rounded text-[#FF00BC] text-xl">woman</span>
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider mb-0.5">Vocalize F.</span>
            <span className="text-[9px] text-gray-400">Agudo (H)</span>
          </button>

          {/* MALE BUTTON */}
          <button
            onClick={() => handleTrain('male')}
            disabled={!vocalize?.audioUrlMale}
            className={`rounded-xl p-3 flex flex-col items-center justify-center border cursor-pointer transition-all group ${activeAudioUrl === vocalize?.audioUrlMale
              ? 'bg-[#1A202C] border-[#0081FF] shadow-[0_0_15px_rgba(0,129,255,0.2)]'
              : 'bg-[#1A202C] border-white/5 hover:border-[#0081FF]/50 hover:bg-[#0081FF]/10'
              } ${!vocalize?.audioUrlMale ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#0081FF]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-rounded text-[#0081FF] text-xl">man</span>
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider mb-0.5">Vocalize M.</span>
            <span className="text-[9px] text-gray-400">Grave (L)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
