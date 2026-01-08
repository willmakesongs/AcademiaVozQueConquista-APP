
import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import ChordLibrary from './components/ChordLibrary';
import Metronome from './components/Metronome';
import { FretboardMode } from './types';
import { preloadGuitarSamples, initAudio, setMetronomeVolume, playMetronomeSound, preloadDrumSamples } from './services/audio';
import { Sparkles, BookOpen, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'library' | 'metronome'>('library');
  
  // Persistência do Modo do Braço
  const [displayMode, setDisplayMode] = useState<FretboardMode>(() => {
    const saved = localStorage.getItem('fretboard_mode');
    return (saved as FretboardMode) || 'notes';
  });

  // --- METRONOME STATE (LIFTED) ---
  const [bpm, setBpm] = useState(120);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [tick, setTick] = useState(0); // 0 a 7
  const [soundType, setSoundType] = useState('loop');
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const measureRef = useRef(0);

  useEffect(() => {
    preloadGuitarSamples();
    preloadDrumSamples();
  }, []);

  useEffect(() => {
    localStorage.setItem('fretboard_mode', displayMode);
  }, [displayMode]);

  // --- METRONOME ENGINE ---
  useEffect(() => {
    const volValue = isMuted ? 0 : volume / 100;
    setMetronomeVolume(volValue);
  }, [volume, isMuted]);

  useEffect(() => {
    if (isMetronomePlaying) {
      // 30 / bpm = colcheia
      const interval = (30 / bpm) * 1000;
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Reiniciar ciclo visual/lógico ao dar play (opcional, mas bom para sincronia)
      
      timerRef.current = window.setInterval(() => {
        setTick(prev => {
          const nextTick = (prev + 1) % 8; 
          
          if (nextTick === 0) {
            measureRef.current = (measureRef.current + 1) % 4;
          }

          const isDownBeat = nextTick % 2 === 0;
          const isAccent = nextTick === 0;
          const isFillBar = measureRef.current === 3;

          // Tocar som
          if (soundType === 'loop' || isDownBeat) {
             playMetronomeSound(soundType, isAccent, nextTick, isFillBar);
          }

          return nextTick;
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isMetronomePlaying, bpm, soundType]);

  const toggleMetronome = async () => {
    await initAudio();
    if (!isMetronomePlaying) {
      setTick(0);
      measureRef.current = 0;
      // Toca a primeira nota imediatamente para latência zero
      playMetronomeSound(soundType, true, 0, false);
    }
    setIsMetronomePlaying(!isMetronomePlaying);
  };

  const renderHeader = () => {
    let title = "";
    let highlight = "";
    let icon = null;
    let description = "";

    switch(currentView) {
      case 'library':
        title = "DICIONÁRIO";
        highlight = "CAGED";
        icon = <BookOpen size={12} className="text-blue-500"/>;
        description = "Biblioteca Universal de Acordes";
        break;
      case 'metronome':
        title = "ESTUDE COM";
        highlight = "METRÔNOMO";
        icon = <Clock size={12} className="text-blue-500"/>;
        description = "Precisão Digital Studio";
        break;
    }

    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">
             <Sparkles size={14} /> Criado por: @WilsonClaudiano
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-2 leading-none uppercase">
            {title} <span className="text-blue-500">{highlight}</span>
          </h1>
          <p className="text-slate-500 font-bold flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
            {icon} {description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-200">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        metronomeState={{ isPlaying: isMetronomePlaying, bpm }}
        onToggleMetronome={toggleMetronome}
      />

      <main className="flex-grow p-4 lg:p-10 max-w-[1600px] mx-auto w-full">
        {renderHeader()}

        {currentView === 'library' && (
          <ChordLibrary 
            displayMode={displayMode} 
            onModeChange={setDisplayMode} 
          />
        )}
        
        {currentView === 'metronome' && (
          <div className="flex justify-center items-center py-10 md:py-20 animate-in zoom-in duration-500">
             <Metronome 
               bpm={bpm}
               setBpm={setBpm}
               isPlaying={isMetronomePlaying}
               onTogglePlay={toggleMetronome}
               tick={tick}
               soundType={soundType}
               setSoundType={setSoundType}
               volume={volume}
               setVolume={setVolume}
               isMuted={isMuted}
               setIsMuted={setIsMuted}
             />
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-white/5 bg-black/40 py-20 px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                <Sparkles size={32}/>
             </div>
             <div>
               <span className="font-black tracking-tighter text-3xl text-white block">Will Make <span className="text-blue-500">Chords</span></span>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">Harmonic Engine v3.0</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
