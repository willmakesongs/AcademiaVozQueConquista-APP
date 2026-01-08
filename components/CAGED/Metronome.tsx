
import React, { useRef } from 'react';
import { Play, Pause, Plus, Minus, Zap, MousePointer2, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { initAudio } from '../../services/CAGED/audio';

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
    <div className="w-full max-w-xl bg-[#1C1C1E] p-10 md:p-14 rounded-[2.5rem] border border-white/5 shadow-sm flex flex-col items-center gap-10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">

      <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-300 ${isPlaying ? 'bg-[#007AFF]' : 'bg-transparent'}`} style={{ transform: `scaleX(${isPlaying ? 1 : 0})` }}></div>

      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#007AFF]/10 mb-4">
          <Zap size={18} className="text-[#007AFF]" />
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[100px] md:text-[140px] font-bold text-white tracking-tighter leading-none select-none flex items-baseline">
            {bpm}
            <span className="text-xl font-bold text-gray-600 ml-2 uppercase tracking-widest">BPM</span>
          </div>
        </div>
      </div>

      {/* Beat Visualizer */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-150 ${isPlaying && currentBeatVisual === i
                ? (i === 0 ? 'bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-[#007AFF] scale-110 shadow-[0_0_8px_rgba(0,122,255,0.5)]')
                : 'bg-white/5'
              }`}
          ></div>
        ))}
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-4 bg-white/[0.03] px-5 py-3.5 rounded-2xl border border-white/5 w-full max-w-xs transition-colors hover:bg-white/[0.05]">
        <button
          onClick={toggleMute}
          className="text-gray-500 hover:text-white transition-colors p-1"
        >
          {getVolumeIcon()}
        </button>
        <input
          type="range" min="0" max="100" value={volume}
          onChange={handleVolumeChange}
          className="flex-grow h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#007AFF] transition-all"
        />
        <span className="text-[10px] font-bold text-gray-500 w-8 text-right tabular-nums">{volume}%</span>
      </div>

      {/* Som Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {sounds.map(s => (
          <button
            key={s.id}
            onClick={() => { initAudio(); setSoundType(s.id); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${soundType === s.id
                ? 'bg-[#007AFF] border-[#007AFF] text-white shadow-sm'
                : 'text-gray-500 border-transparent hover:bg-white/5 hover:text-white'
              }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="w-full space-y-8 mt-2">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <button
            onClick={onTogglePlay}
            className={`flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-bold text-lg tracking-tight transition-all active:scale-95 w-full md:w-auto ${isPlaying
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20'
              }`}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {isPlaying ? 'Parar' : 'Iniciar'}
          </button>

          <button
            onClick={handleTap}
            className="flex items-center justify-center gap-3 px-12 py-5 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg tracking-tight text-white hover:bg-white/10 transition-all active:scale-95 w-full md:w-auto"
          >
            <MousePointer2 size={20} />
            Tap
          </button>
        </div>

        <div className="flex items-center gap-6 justify-center">
          <button
            onClick={() => { initAudio(); adjustBpm(-1); }}
            className="w-11 h-11 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <Minus size={18} />
          </button>

          <input
            type="range" min="40" max="240" value={bpm}
            onChange={(e) => { initAudio(); setBpm(parseInt(e.target.value)); }}
            className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#007AFF] transition-all"
          />

          <button
            onClick={() => { initAudio(); adjustBpm(1); }}
            className="w-11 h-11 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="text-center opacity-30">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          Timing Engine v3.0 • Eighth Note Precision
        </p>
      </div>
    </div>
  );
};

export default Metronome;
