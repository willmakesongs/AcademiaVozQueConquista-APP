
import React, { useState } from 'react';
import { ChordResult, NoteName } from '../types';
import { getCagedPosition } from '../services/cagedLogic';
import { getFrequency } from '../services/chordLogic';
import { playChord, initAudio } from '../services/audio';
import { Target, ChevronRight, Music, Volume2, Play } from 'lucide-react';

interface ChordDisplayProps {
  chords: ChordResult[];
}

const ChordDisplay: React.FC<ChordDisplayProps> = ({ chords }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const playAllCaged = async (chord: ChordResult) => {
    await initAudio();
    setPlayingId(chord.fullName);
    
    const shapes = ['C', 'A', 'G', 'E', 'D'];
    
    // Tocar as formas em sequência
    for (const shape of shapes) {
      const positions = getCagedPosition(chord.root as NoteName, chord.suffix, shape);
      const frequencies = positions.map(n => getFrequency(n.stringIndex, n.fret));
      
      playChord(frequencies);
      // Pequeno intervalo entre as formas para clareza
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    setPlayingId(null);
  };

  if (chords.length === 0) {
    return (
      <div className="mt-4 p-12 bg-[#0e1017] rounded-[2.5rem] border-2 border-dashed border-white/5 text-center shadow-inner">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-900 rounded-full text-slate-700">
            <Target size={40} />
          </div>
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Monte seu acorde no braço</p>
        <p className="text-slate-600 text-xs mt-2 font-bold uppercase tracking-tight">O sistema identificará tônica, inversões e intervalos automaticamente.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            ACORDES <span className="text-blue-500">DETECTADOS</span>
          </h2>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Baseado em análise intervalar profunda</span>
        </div>
        <div className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-2xl border border-blue-500/20 flex items-center gap-2">
            <Music size={14} />
            <span className="font-black text-xs">{chords.length} Sugestões</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chords.map((chord, idx) => {
          const isPrimary = idx === 0;
          const isPlaying = playingId === chord.fullName;

          return (
            <div 
              key={`${chord.fullName}-${idx}`} 
              className={`relative overflow-hidden group p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${
                isPrimary 
                  ? 'bg-blue-600 border-blue-400 shadow-[0_20px_50px_rgba(37,99,235,0.3)] scale-[1.02] z-10' 
                  : 'bg-[#0e1017] border-white/5 hover:border-blue-500/30'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none transition-transform group-hover:scale-110 ${isPrimary ? 'text-white' : 'text-blue-500'}`}>
                 <Music size={128} />
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                   <span className={`text-5xl font-black tracking-tighter ${isPrimary ? 'text-white' : 'text-blue-500'}`}>
                    {chord.fullName}
                  </span>
                  {chord.fullName.includes('/') && (
                     <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isPrimary ? 'text-blue-200' : 'text-slate-500'}`}>
                        Acorde Invertido / Slash Chord
                     </span>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className={`text-[9px] font-black uppercase tracking-widest ${isPrimary ? 'text-blue-200' : 'text-slate-500'}`}>Precisão</div>
                  <div className={`text-xl font-black ${isPrimary ? 'text-white' : 'text-green-500'}`}>
                    {chord.score}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-3 ${isPrimary ? 'text-blue-100' : 'text-slate-500'}`}>
                    Notas na Composição:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {chord.notes.map((note, nIdx) => (
                      <div 
                        key={nIdx} 
                        className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm border ${
                          isPrimary 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-black/40 border-white/5 text-slate-300'
                        }`}
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => playAllCaged(chord)}
                    disabled={isPlaying}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      isPlaying 
                      ? 'bg-white/20 text-white cursor-wait' 
                      : (isPrimary ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl' : 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20')
                    }`}
                  >
                    <Volume2 size={14} className={isPlaying ? 'animate-bounce' : ''}/>
                    {isPlaying ? 'TOCANDO...' : 'OUVIR NO CAGED'}
                  </button>

                  <button className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isPrimary 
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}>
                    Análise <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChordDisplay;
