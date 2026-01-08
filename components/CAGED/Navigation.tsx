
import React, { useState } from 'react';
import { Menu, X, Music, ChevronDown, Book, Clock, Play, Pause, Activity } from 'lucide-react';

interface NavigationProps {
  onViewChange: (view: 'library' | 'metronome') => void;
  currentView: string;
  metronomeState: { isPlaying: boolean; bpm: number };
  onToggleMetronome: () => void;
  onBack?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onViewChange, currentView, metronomeState, onToggleMetronome, onBack }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      name: 'CAGED',
      items: [
        { name: 'Dicionário CAGED', id: 'library', icon: <Book size={14} /> },
      ]
    },
    {
      name: 'Estudo',
      items: [
        { name: 'Metrônomo Studio', id: 'metronome', icon: <Clock size={14} /> }
      ]
    },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId as any);
    setIsOpen(false);
  };

  return (
    <nav className="bg-black/80 backdrop-blur-xl text-white sticky top-0 z-[100] border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-3 lg:gap-6">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white transition-all flex items-center gap-1 group active:scale-95"
                title="Voltar ao Perfil"
              >
                <ChevronDown size={18} className="rotate-90 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline font-semibold text-xs uppercase tracking-tight">Voltar</span>
              </button>
            )}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity" onClick={() => handleNavClick('library')}>
              <div className="bg-[#007AFF] p-1.5 rounded-lg shadow-sm">
                <Music size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:inline">Will Make <span className="text-[#007AFF]">Chords</span></span>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-1 ml-4 lg:ml-6">
                {navItems.map((item) => (
                  <div key={item.name} className="relative group">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1">
                      {item.name} <ChevronDown size={14} className="opacity-30 group-hover:rotate-180 transition-transform" />
                    </button>
                    <div className="absolute left-0 mt-2 w-56 rounded-2xl shadow-2xl py-2 bg-[#1C1C1E] border border-white/10 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-[110]">
                      {item.items.map((sub) => (
                        <button
                          key={sub.name}
                          onClick={() => handleNavClick(sub.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors ${currentView === sub.id ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <span className={`${currentView === sub.id ? 'text-[#007AFF]' : 'text-gray-600'}`}>{sub.icon}</span>
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mini Metronome Player */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${metronomeState.isPlaying ? 'bg-[#007AFF]/10 border-[#007AFF]/20' : 'bg-white/5 border-white/5'}`}>
              <div className="flex flex-col items-start px-1">
                <span className="text-[8px] font-bold uppercase text-gray-500 tracking-wider">BPM</span>
                <span className={`text-[10px] font-bold leading-none ${metronomeState.isPlaying ? 'text-[#007AFF]' : 'text-gray-400'}`}>{metronomeState.bpm}</span>
              </div>
              <button
                onClick={onToggleMetronome}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ${metronomeState.isPlaying ? 'bg-[#007AFF] text-white shadow-sm' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              >
                {metronomeState.isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
              </button>
              {metronomeState.isPlaying && (
                <Activity size={12} className="text-[#007AFF] animate-pulse mx-1" />
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 focus:outline-none transition-all"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#1C1C1E] border-t border-white/5 animate-in slide-in-from-top duration-300 max-h-[85vh] overflow-y-auto pb-6">
          {/* Mobile Metronome Control */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metronomeState.isPlaying ? 'bg-[#007AFF] text-white' : 'bg-white/5 text-gray-500'}`}>
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Metrônomo</div>
                  <div className="text-sm font-bold text-white">{metronomeState.bpm} BPM</div>
                </div>
              </div>
              <button
                onClick={onToggleMetronome}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${metronomeState.isPlaying ? 'bg-red-500/10 text-red-500' : 'bg-[#007AFF] text-white'}`}
              >
                {metronomeState.isPlaying ? 'Pausar' : 'Ativar'}
              </button>
            </div>
          </div>

          <div className="px-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.name} className="py-2">
                <div className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.name}</div>
                {item.items.map((sub) => (
                  <button
                    key={sub.name}
                    onClick={() => handleNavClick(sub.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${currentView === sub.id ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'text-gray-300 hover:bg-white/5'
                      }`}
                  >
                    <span className={currentView === sub.id ? 'text-[#007AFF]' : 'text-gray-500'}>{sub.icon}</span>
                    {sub.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
