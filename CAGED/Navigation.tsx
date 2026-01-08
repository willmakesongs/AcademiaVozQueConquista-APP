
import React, { useState } from 'react';
import { Menu, X, Music, ChevronDown, Book, Search, Tooltip } from 'lucide-react';

interface NavigationProps {
  onViewChange: (view: 'identifier' | 'library') => void;
  currentView: string;
}

const Navigation: React.FC<NavigationProps> = ({ onViewChange, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { 
      name: 'Acordes', 
      items: [
        { name: 'Monte o Acorde', id: 'identifier', icon: <Search size={14}/> },
        { name: 'Biblioteca de Acordes', id: 'library', icon: <Book size={14}/> },
        { name: 'Progressões', id: 'progressions', icon: <Music size={14}/> }
      ] 
    },
    { name: 'Escalas', items: [{ name: 'Localizador', id: 'identifier', icon: <Search size={14}/> }] },
    { name: 'Ferramentas', items: [{ name: 'Metrônomo Pro', id: 'identifier', icon: <Music size={14}/> }] },
  ];

  const handleNavClick = (viewId: string) => {
    if (viewId === 'identifier' || viewId === 'library') {
      onViewChange(viewId as 'identifier' | 'library');
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('identifier')}>
              <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-500/20">
                <Music size={22} className="text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter">Will Make <span className="text-blue-500">Chords</span></span>
            </div>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-2">
                {navItems.map((item) => (
                  <div key={item.name} className="relative group">
                    <button className="px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 text-slate-300 hover:text-white">
                      {item.name} <ChevronDown size={14} className="opacity-50" />
                    </button>
                    <div className="absolute left-0 mt-1 w-64 rounded-xl shadow-2xl py-2 bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.items.map((sub) => (
                        <button 
                          key={sub.name} 
                          onClick={() => handleNavClick(sub.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <span className="text-blue-500 opacity-70">{sub.icon}</span>
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                Status: <span className="text-green-500">Live Edition</span>
              </div>
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <div key={item.name} className="py-2">
                <div className="px-4 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{item.name}</div>
                {item.items.map((sub) => (
                  <button
                    key={sub.name}
                    onClick={() => handleNavClick(sub.id)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
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
