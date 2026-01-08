
import React, { useRef } from 'react';
import { Play, Pause, Plus, Minus, Zap, MousePointer2, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { initAudio } from '../services/audio';

interface MetronomeProps {
  bpm: number;
  setBpm: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  onTogglePlay: () => void;
  tick: number;
  soundType: string;
  setSoundType: React.Dispatch<React.SetStateAction<string>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
}

const Metronome: React.FC<MetronomeProps> = ({
  bpm,
  setBpm,
  isPlaying,
  onTogglePlay,
  tick,
  soundType,
  setSoundType,
  volume,
  setVolume,
  isMuted,
  setIsMuted
}) => {
  const prevVolumeRef = useRef(80);
  const tapTimes = useRef<number[]>([]);

  const handleTap = async () => {
    await initAudio(); 
    const now = performance.now();
    tapTimes.current.push(now);
    if (tapTimes.current.length > 4) tapTimes.current.shift();
    
    if (tapTimes.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i] - tapTimes.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      setBpm(Math.min(Math.max(newBpm, 40), 240));
    }
  };

  const adjustBpm = (amount: number) => {
    setBpm(prev => Math.min(Math.max(prev + amount, 40), 240));
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolumeRef.current);
      setIsMuted(false);
    } else {
      prevVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
    else setIsMuted(true);
  };

  const sounds = [
    { id: 'beep', name: 'Bip Digital' },
    { id: 'kick', name: 'Kick' },
    { id: 'hihat', name: 'Hi-Hat' },
    { id: 'cowbell', name: 'Cowbell' },
    { id: 'loop', name: 'Loop Drums' }
  ];

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={20} />;
    if (volume < 50) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  // Mapear o tick (0-7) para visualização de beats (0-3)
  const currentBeatVisual = Math.floor(tick / 2);

  return (
    <div className="w-full max-w-2xl bg-[#0e1017] p-8 md:p-16 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col items-center gap-10 relative overflow-hidden animate-in fade-in duration-500">
      
      <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-300 ${isPlaying ? 'bg-blue-500' : 'bg-transparent'}`} style={{ transform: `scaleX(${isPlaying ? 1 : 0})` }}></div>
      
      <div className="flex flex-col items-center text-center">
         <div className="flex items-center gap-2 text-blue-500/40 mb-2">
            <Zap size={16}/>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Estude sempre com metrônomo</span>
         </div>
         
         <div className="flex flex-col items-center">
            <div className="text-[120px] md:text-[180px] font-black text-white tracking-tighter leading-none select-none">
              {bpm}
            </div>
            <span className="text-2xl font-black text-blue-500 uppercase tracking-[0.5em] mt-[-10px] md:mt-[-20px] mb-4">BPM</span>
         </div>
      </div>

      {/* Beat Visualizer */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-75 ${
              isPlaying && currentBeatVisual === i 
              ? (i === 0 ? 'bg-blue-500 scale-150 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'bg-blue-400 scale-125 shadow-[0_0_10px_rgba(96,165,250,0.5)]') 
              : 'bg-white/10'
            }`}
          ></div>
        ))}
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-4 bg-black/20 px-6 py-4 rounded-3xl border border-white/5 w-full max-w-xs">
        <button 
          onClick={toggleMute}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          {getVolumeIcon()}
        </button>
        <input 
          type="range" min="0" max="100" value={volume} 
          onChange={handleVolumeChange}
          className="flex-grow h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600 transition-all hover:accent-blue-400"
        />
        <span className="text-[10px] font-black text-slate-500 w-8 text-right">{volume}%</span>
      </div>

      {/* Som Selector */}
      <div className="flex flex-wrap justify-center gap-2 bg-black/30 p-2 rounded-2xl border border-white/5">
        {sounds.map(s => (
          <button
            key={s.id}
            onClick={() => { initAudio(); setSoundType(s.id); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              soundType === s.id 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="w-full space-y-8">
        <div className="flex items-center gap-6 justify-center">
          <button 
            onClick={() => { initAudio(); adjustBpm(-1); }}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <Minus size={20}/>
          </button>

          <input 
            type="range" min="40" max="240" value={bpm} 
            onChange={(e) => { initAudio(); setBpm(parseInt(e.target.value)); }}
            className="w-full max-w-xs h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600 transition-all hover:accent-blue-400"
          />

          <button 
            onClick={() => { initAudio(); adjustBpm(1); }}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <Plus size={20}/>
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <button 
            onClick={onTogglePlay}
            className={`group relative flex items-center gap-4 px-12 py-6 rounded-3xl font-black text-xl tracking-tighter transition-all active:scale-95 ${
              isPlaying 
              ? 'bg-red-500 text-white shadow-[0_20px_50px_rgba(239,68,68,0.2)]' 
              : 'bg-blue-600 text-white hover:bg-blue-50 shadow-[0_20px_50px_rgba(37,99,235,0.2)]'
            }`}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            {isPlaying ? 'PARAR' : 'INICIAR'}
          </button>

          <button 
            onClick={handleTap}
            className="group flex items-center gap-3 px-12 py-6 rounded-3xl bg-white/5 border border-white/10 font-black text-xl tracking-tighter text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <MousePointer2 size={24}/>
            TAP TEMPO
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          Timing Engine v3.0 (Eighth Note Precision)
        </p>
      </div>
    </div>
  );
};

export default Metronome;
