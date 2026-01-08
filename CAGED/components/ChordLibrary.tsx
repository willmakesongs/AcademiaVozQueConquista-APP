
import React, { useState, useMemo, useEffect } from 'react';
import { NOTES, NoteName, FretboardMode, SelectedNote } from '../types';
import { getCagedPosition, getChordTemplate, saveChordOverride, resetChordOverride } from '../services/cagedLogic';
import { getFrequency } from '../services/chordLogic';
import { playChord, initAudio } from '../services/audio';
import ChordChart from './ChordChart';
import { Hash, LayoutGrid, Settings2, X, Volume2, Edit3, Save, RotateCcw, Sparkles, Database } from 'lucide-react';

declare global { interface Window { Tonal: any; } }

interface ChordLibraryProps {
  displayMode: FretboardMode;
  onModeChange: (mode: FretboardMode) => void;
}

const ChordLibrary: React.FC<ChordLibraryProps> = ({ displayMode, onModeChange }) => {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedType, setSelectedType] = useState<string>('major');
  const [activeShape, setActiveShape] = useState<string>('C');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const [dbVersion, setDbVersion] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempNotes, setTempNotes] = useState<SelectedNote[]>([]);
  const [hasCustomVersion, setHasCustomVersion] = useState(false);

  const chordCategories = [
    { 
      label: 'Tríades & Power', 
      types: [
        { name: 'Maior', symbol: 'major' }, 
        { name: 'Menor', symbol: 'minor' },
        { name: 'Aumentada', symbol: 'aug' },
        { name: 'Power Chd (5)', symbol: '5' }
      ] 
    },
    { 
      label: 'Suspensos / Add', 
      types: [
        { name: 'Sus4', symbol: 'sus4' }, 
        { name: 'Sus2', symbol: 'sus2' }, 
        { name: 'Add9', symbol: 'add9' }
      ] 
    },
    { 
      label: 'Sextas', 
      types: [
        { name: 'Maior 6', symbol: '6' }, 
        { name: 'Menor 6', symbol: 'm6' }
      ] 
    },
    { 
      label: 'Tétrades (7)', 
      types: [
        { name: 'Dominante 7', symbol: '7' }, 
        { name: 'Maior 7 (7M)', symbol: 'maj7' }, 
        { name: 'Menor 7', symbol: 'm7' },
        { name: 'm7b5 (Meio Dim)', symbol: 'm7b5' }, 
        { name: 'Diminuto (dim7)', symbol: 'dim7' }
      ] 
    },
    { 
      label: 'Nonas / Tensões', 
      types: [
        { name: 'Dominante 9', symbol: '9' }, 
        { name: 'Maior 9', symbol: 'maj9' }, 
        { name: 'Menor 9', symbol: 'm9' },
        { name: 'Dom 7b9', symbol: '7b9' }
      ] 
    }
  ];

  const cagedShapes = ['C', 'A', 'G', 'E', 'D'];

  useEffect(() => {
    setHasCustomVersion(!!getChordTemplate(selectedType, activeShape));
  }, [selectedType, activeShape, dbVersion]);

  const displayNotes = useMemo(() => {
    if (isEditing) return tempNotes;
    return getCagedPosition(selectedRoot, selectedType, activeShape);
  }, [selectedRoot, selectedType, activeShape, isEditing, tempNotes, dbVersion]);

  const handlePlayChord = async (notesToPlay?: SelectedNote[]) => {
    await initAudio();
    const notes = notesToPlay || displayNotes;
    if (notes.length === 0) return;
    
    const frequencies = notes.map(n => getFrequency(n.stringIndex, n.fret));
    setIsAnimating(true);
    playChord(frequencies);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setTempNotes([...displayNotes]);
      setIsEditing(true);
    }
  };

  const handleToggleNoteInEdit = (sIdx: number, fret: number) => {
    setTempNotes(prev => {
      const filtered = prev.filter(n => n.stringIndex !== sIdx);
      if (fret === -1) return filtered;
      return [...filtered, { stringIndex: sIdx, fret }];
    });
  };

  const handleSaveOverride = () => {
    saveChordOverride(selectedType, activeShape, tempNotes, selectedRoot);
    setIsEditing(false);
    setDbVersion(v => v + 1); 
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleResetOverride = () => {
    resetChordOverride(selectedType, activeShape);
    setDbVersion(v => v + 1);
    setIsEditing(false);
  };

  const getDisplayName = () => {
    if (selectedType === 'major' || selectedType === '') return selectedRoot;
    let suffix = selectedType === 'minor' ? 'm' : selectedType;
    if (suffix === 'm7b5') suffix = 'm7(b5)';
    return `${selectedRoot}${suffix}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Toast de Sucesso */}
      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-green-600 text-white px-8 py-5 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-center gap-4 animate-in slide-in-from-top-4">
          <Database size={24} className="animate-pulse"/>
          <div className="flex flex-col">
            <span className="font-black text-sm uppercase tracking-tighter">Dicionário Chediak Atualizado</span>
            <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Padrão aplicado a todas as tonalidades.</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-[#0e1017] p-8 rounded-[3rem] border border-white/5 shadow-xl">
                <h3 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                  <Hash size={14} className="text-blue-500"/> Escolha a Tônica
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {NOTES.map(note => (
                    <button
                      key={note}
                      onClick={() => { setSelectedRoot(note); if(isEditing) setIsEditing(false); }}
                      className={`py-4 rounded-2xl font-black text-xs transition-all ${
                        selectedRoot === note ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
            </div>

            <div className="lg:col-span-8 bg-[#0e1017] p-8 rounded-[3rem] border border-white/5 shadow-xl flex flex-col justify-center">
                <h3 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                  <Settings2 size={14} className="text-blue-500"/> Qualidade Harmônica
                </h3>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group w-full p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] flex items-center justify-between hover:bg-blue-600/10 transition-all active:scale-[0.98]"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                      {getDisplayName()}
                    </span>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Clique para mudar o tipo de acorde</span>
                  </div>
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                    <LayoutGrid size={24} />
                  </div>
                </button>
            </div>
        </div>

        <div className="bg-[#0e1017] rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
            
            <div className="p-8 bg-black/40 border-b border-white/5 flex justify-center">
               <div className="flex flex-col md:flex-row items-center gap-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] self-center">Formas CAGED:</span>
                  <div className="flex gap-2">
                    {cagedShapes.map(shape => (
                      <button
                        key={shape}
                        onClick={() => { setActiveShape(shape); if(isEditing) setIsEditing(false); }}
                        className={`w-14 h-14 rounded-2xl text-sm font-black transition-all ${
                          activeShape === shape ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-white/5 text-slate-600 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>

                  {hasCustomVersion && !isEditing && (
                      <div className="ml-4 bg-orange-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg border border-white/20">
                         <Sparkles size={10}/> EDITADO
                      </div>
                  )}
               </div>
            </div>

            <div className="p-10 md:p-24 flex flex-col items-center justify-center bg-[#08090d]">
                {isEditing && (
                  <div className="mb-12 p-8 bg-orange-600/5 border border-orange-500/20 rounded-[3rem] text-center max-w-lg">
                    <p className="text-orange-400 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                      <Database size={20}/> EDITANDO PADRÃO GLOBAL
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">
                      Ajuste o shape para <b>{getDisplayName()}</b>. Esta correção será aplicada automaticamente para todas as outras tônicas usando matemática intervalar.
                    </p>
                  </div>
                )}
                
                <div className="mb-10">
                   <ChordChart 
                    selectedNotes={displayNotes} 
                    displayMode={displayMode}
                    onModeChange={onModeChange}
                    rootNote={selectedRoot}
                    isInteractive={isEditing}
                    onToggleNote={handleToggleNoteInEdit}
                   />
                </div>

                <div className="flex flex-row w-full max-w-md mx-auto gap-3 mb-12 px-2 md:px-0">
                      <button 
                        onClick={() => handlePlayChord()}
                        className={`group flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 py-4 md:px-8 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap ${
                          isAnimating ? 'bg-blue-400 text-white scale-95' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'
                        }`}
                      >
                        <Volume2 size={16} className="md:w-[18px] md:h-[18px]" />
                        {isEditing ? 'OUVIR' : 'OUVIR'}
                      </button>

                      {!isEditing ? (
                        <button 
                          onClick={handleEditToggle}
                          className="group flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 py-4 md:px-8 md:py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 whitespace-nowrap"
                        >
                          <Edit3 size={16} className="text-orange-500 md:w-[18px] md:h-[18px]" />
                          CORRIGIR
                        </button>
                      ) : (
                        <div className="flex w-full gap-2 animate-in zoom-in-95">
                          <button 
                            onClick={handleSaveOverride}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 md:px-6 md:py-5 rounded-2xl bg-orange-600 text-white font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-orange-500 shadow-xl shadow-orange-600/30 active:scale-95 transition-all"
                          >
                            <Save size={16} /> SALVAR
                          </button>
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 md:px-6 md:py-5 rounded-2xl bg-slate-800 text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all"
                          >
                            CANCELAR
                          </button>
                          {hasCustomVersion && (
                            <button 
                              onClick={handleResetOverride}
                              className="flex items-center justify-center w-12 h-auto md:w-16 rounded-2xl bg-red-600/20 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                              title="Restaurar Padrão Chediak"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
                        </div>
                      )}
                </div>

                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Motor de Harmonia: Almir Chediak Standard</p>
                </div>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#12141c] border border-white/10 rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Escolha a <span className="text-blue-500">Qualidade</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center transition-all text-slate-400 active:scale-90">
                  <X size={32} />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-10 space-y-12">
               {chordCategories.map((category, catIdx) => (
                 <div key={catIdx} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.6em] whitespace-nowrap">{category.label}</h4>
                      <div className="h-[1px] flex-grow bg-white/5"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {category.types.map(type => (
                        <button
                          key={type.symbol}
                          onClick={() => { setSelectedType(type.symbol); setIsModalOpen(false); if(isEditing) setIsEditing(false); }}
                          className={`px-6 py-6 rounded-[2rem] font-black text-sm transition-all border flex flex-col items-center gap-1 ${
                            selectedType === type.symbol 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/30 scale-105' 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-lg">{type.name}</span>
                          <span className="text-[9px] opacity-40 uppercase">{type.symbol}</span>
                        </button>
                      ))}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordLibrary;
