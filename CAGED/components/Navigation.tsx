
import React, { useState } from 'react';
import { Menu, X, Music, ChevronDown, Book, Clock, Play, Pause, Activity } from 'lucide-react';

interface NavigationProps {
  onViewChange: (view: 'library' | 'metronome') => void;
  currentView: string;
  metronomeState: { isPlaying: boolean; bpm: number };
  onToggleMetronome: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onViewChange, currentView, metronomeState, onToggleMetronome }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { 
      name: 'CAGED', 
      items: [
        { name: 'Dicionário CAGED', id: 'library', icon: <Book size={14}/> },
      ] 
    },
    { 
      name: 'Estudo', 
      items: [
        { name: 'Metrônomo Studio', id: 'metronome', icon: <Clock size={14}/> }
      ] 
    },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId as any);
    setIsOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-white shadow-xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('library')}>
              <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-500/20">
                <Music size={22} className="text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter hidden sm:inline">Will Make <span className="text-blue-500">Chords</span></span>
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-2">
                {navItems.map((item) => (
                  <div key={item.name} className="relative group">
                    <button className="px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 text-slate-300 hover:text-white">
                      {item.name} <ChevronDown size={14} className="opacity-50" />
                    </button>
                    <div className="absolute left-0 mt-1 w-64 rounded-xl shadow-2xl py-2 bg-[#12141c] border border-white/10 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      {item.items.map((sub) => (
                        <button 
                          key={sub.name} 
                          onClick={() => handleNavClick(sub.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors border-b border-white/5 last:border-0 ${
                            currentView === sub.id ? 'bg-blue-600/10 text-blue-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className={`${currentView === sub.id ? 'text-blue-500' : 'text-slate-600'}`}>{sub.icon}</span>
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Mini Metronome Player */}
             <div className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all duration-300 ${metronomeState.isPlaying ? 'bg-blue-900/30 border-blue-500/30' : 'bg-white/5 border-white/5'}`}>
                <div className="flex flex-col items-start px-2">
                  <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">BPM</span>
                  <span className={`text-xs font-black ${metronomeState.isPlaying ? 'text-blue-400' : 'text-slate-300'}`}>{metronomeState.bpm}</span>
                </div>
                <button 
                  onClick={onToggleMetronome}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${metronomeState.isPlaying ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                >
                   {metronomeState.isPlaying ? <Pause size={12} fill="currentColor"/> : <Play size={12} fill="currentColor" className="ml-0.5"/>}
                </button>
                {metronomeState.isPlaying && (
                  <Activity size={14} className="text-blue-500 animate-pulse mr-2" />
                )}
             </div>

             <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-all"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-in slide-in-from-top duration-300 max-h-[80vh] overflow-y-auto">
          {/* Mobile Metronome Control */}
          <div className="p-4 border-b border-white/5">
             <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full ${metronomeState.isPlaying ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      <Clock size={16} />
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Metrônomo</div>
                      <div className="text-sm font-black text-white">{metronomeState.bpm} BPM</div>
                   </div>
                </div>
                <button 
                  onClick={onToggleMetronome}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${metronomeState.isPlaying ? 'bg-blue-600/20 text-blue-400' : 'bg-white/10 text-white'}`}
                >
                  {metronomeState.isPlaying ? 'Pausar' : 'Tocar'}
                </button>
             </div>
          </div>

          <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <div key={item.name} className="py-2">
                <div className="px-4 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{item.name}</div>
                {item.items.map((sub) => (
                  <button
                    key={sub.name}
                    onClick={() => handleNavClick(sub.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold transition-colors ${
                      currentView === sub.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-blue-500">{sub.icon}</span>
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
