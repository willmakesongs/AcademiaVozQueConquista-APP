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

  // Limpeza ao desmontar - REMOVIDO para permitir background playback
  useEffect(() => {
    // Não paramos mais o áudio no unmount
    return () => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  }, []);

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

  // Sincroniza visualizador se já estiver tocando ao abrir a tela
  useEffect(() => {
    if (isPlaying) {
      startVisualizer();
    }
  }, [isPlaying]);

  const stopAudio = () => {
    stopPlayback();
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    setBarHeights(logoConfig.map(b => b.baseHeight));
  };

  const resetPlayback = () => {
    stopAudio();
  };

  const startVisualizer = () => {
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    animationIntervalRef.current = window.setInterval(() => {
      setBarHeights(prev => prev.map((h, i) => {
        const base = logoConfig[i].baseHeight;
        const randomScale = 0.5 + Math.random() * 1.5;
        return Math.max(15, Math.min(140, base * randomScale));
      }));
    }, 80);
  };

  const startPlayback = () => {
    if (!activeAudioUrl || (DISABLE_ALL_PLAYERS && !isAdmin)) return;
    play(activeAudioUrl, { pitch });
    startVisualizer();
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
      setActiveSource(type); // Sincroniza a fonte visual
      // Even if we set activeAudioUrl and wait for useEffect, 
      // some iOS versions lose the gesture if there's any state-driven delay.
      // Better to call play() directly if possible.
      play(targetUrl, { pitch });
    } else {
      setActiveSource(type); // Garante destaque mesmo se o URL for igual (bug de audios identicos)
      togglePlay();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} `;
  };

  const currentTitle = vocalize?.title || "Selecione um exercício";
  const currentCategory = vocalize?.category || "Biblioteca";

  return (
    <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden pb-24">
      <div className={`absolute top - [-20 %] left - 1 / 2 - translate - x - 1 / 2 w - [120 %] h - [60 %] bg - [#6F4CE7] blur - [150px] pointer - events - none transition - opacity duration - 1000 ${isPlaying ? 'opacity-30' : 'opacity-10'} `}></div>

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
          <span className="text-[10px] uppercase tracking-widest text-gray-400">Tocando agora</span>
          <span className="text-sm font-bold truncate max-w-[200px]">{currentTitle}</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">
          <span className="material-symbols-rounded">more_horiz</span>
        </button>
      </div>

      {/* Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 overflow-y-auto hide-scrollbar">

        <div className="h-24 flex items-end justify-center gap-2 shrink-0 relative z-10 my-8">
          {logoConfig.map((bar, index) => (
            <div
              key={index}
              className="w-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-[80ms] ease-linear"
              style={{
                backgroundColor: bar.color,
                height: `${barHeights[index] * 0.6}px`,
                boxShadow: isPlaying ? `0 0 15px ${bar.color}60` : 'none',
                opacity: isPlaying ? 1 : 0.6
              }}
            ></div>
          ))}
        </div>

        <div className="w-full text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{currentTitle}</h1>
          <p className="text-gray-400 mb-6">{currentCategory} • {vocalize?.difficulty || 'Geral'}</p>

          {DISABLE_ALL_PLAYERS && !isAdmin && (
            <div className="bg-[#FF00BC]/10 border border-[#FF00BC]/30 text-[#FF00BC] text-sm font-bold py-3 px-6 rounded-2xl mb-6 inline-flex items-center gap-2 animate-pulse">
              <span className="material-symbols-rounded text-lg">info</span>
              Ativo para assinantes
            </div>
          )}

          {/* Debug - Remover após confirmar fix */}
          <div className="hidden" id="active-source-debug">{activeSource}</div>

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
            <p className={`text - lg font - bold font - mono transition - colors ${pitch !== 0 ? 'text-[#FF00BC]' : 'text-white'} `}>
              {pitch > 0 ? `+ ${pitch} ` : pitch} st
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
            disabled={isPlaybackLoading || (DISABLE_ALL_PLAYERS && !isAdmin)}
            className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer disabled:opacity-50"
            style={{
              background: `linear - gradient(to right, #FF00BC 0 %, #6F4CE7 ${(currentTime / (duration || 0.1)) * 100}%, #2D3748 ${(currentTime / (duration || 0.1)) * 100}%, #2D3748 100 %)`
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
            disabled={isPlaybackLoading || (DISABLE_ALL_PLAYERS && !isAdmin)}
            className={`w - 20 h - 20 rounded - full bg - brand - gradient flex items - center justify - center shadow - [0_10px_30px_rgba(238, 19, 202, 0.4)] hover: scale - 105 transition - transform active: scale - 95 ${isPlaybackLoading || (DISABLE_ALL_PLAYERS && !isAdmin) ? 'opacity-50 cursor-not-allowed grayscale' : ''} `}
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
            className={`rounded - xl p - 3 flex flex - col items - center justify - center border cursor - pointer transition - all group ${activeSource === 'example'
              ? 'bg-[#1A202C] border-[#6F4CE7] shadow-[0_0_15px_rgba(111,76,231,0.2)]'
              : 'bg-[#1A202C] border-white/5 hover:border-[#6F4CE7]/50 hover:bg-[#6F4CE7]/10'
              } ${!vocalize?.exampleUrl ? 'opacity-50 cursor-not-allowed grayscale' : ''} `}
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
            className={`rounded - xl p - 3 flex flex - col items - center justify - center border cursor - pointer transition - all group ${activeSource === 'female'
              ? 'bg-[#1A202C] border-[#FF00BC] shadow-[0_0_15px_rgba(255,0,188,0.2)]'
              : 'bg-[#1A202C] border-white/5 hover:border-[#FF00BC]/50 hover:bg-[#FF00BC]/10'
              } `}
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
            className={`rounded - xl p - 3 flex flex - col items - center justify - center border cursor - pointer transition - all group ${activeSource === 'male'
              ? 'bg-[#1A202C] border-[#0081FF] shadow-[0_0_15px_rgba(0,129,255,0.2)]'
              : 'bg-[#1A202C] border-white/5 hover:border-[#0081FF]/50 hover:bg-[#0081FF]/10'
              } ${!vocalize?.audioUrlMale ? 'opacity-50 cursor-not-allowed grayscale' : ''} `}
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
