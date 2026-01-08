
import React, { useState, useMemo, useEffect } from 'react';
import { NOTES, NoteName, FretboardMode, SelectedNote } from '../../types';
import { getCagedPosition, getChordTemplate, saveChordOverride, resetChordOverride } from '../../services/CAGED/cagedLogic';
import { getFrequency } from '../../services/CAGED/chordLogic';
import { playChord, initAudio } from '../../services/CAGED/audio';
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
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
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
          <Database size={24} className="animate-pulse" />
          <div className="flex flex-col">
            <span className="font-black text-sm uppercase tracking-tighter">Dicionário Chediak Atualizado</span>
            <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Padrão aplicado a todas as tonalidades.</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="group bg-[#1C1C1E] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-sm flex flex-col items-center justify-center hover:bg-white/[0.02] transition-all active:scale-[0.98]"
          >
            <span className="text-[9px] font-bold text-[#007AFF] uppercase tracking-[0.4em] mb-2 opacity-40 group-hover:opacity-100 transition-opacity">Tom</span>
            <span className="text-3xl md:text-5xl font-bold text-white tracking-tighter">
              {selectedRoot}
            </span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group bg-[#1C1C1E] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-sm flex flex-col items-center justify-center hover:bg-white/[0.02] transition-all active:scale-[0.98]"
          >
            <span className="text-[9px] font-bold text-[#007AFF] uppercase tracking-[0.4em] mb-2 opacity-40 group-hover:opacity-100 transition-opacity">Tipo</span>
            <span className="text-xl md:text-3xl font-bold text-white tracking-tighter text-center">
              {selectedType === 'major' || selectedType === '' ? 'Maior' : (selectedType === 'minor' ? 'm' : (selectedType === 'm7b5' ? 'm7(b5)' : selectedType))}
            </span>
          </button>
        </div>

        <div className="bg-[#1C1C1E] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-sm flex flex-col">

          <div className="p-10 bg-white/[0.02] border-b border-white/5 flex flex-col items-center gap-6">
            <div className="flex gap-2 sm:gap-3 justify-center">
              {cagedShapes.map(shape => (
                <button
                  key={shape}
                  onClick={() => { setActiveShape(shape); if (isEditing) setIsEditing(false); }}
                  className={`w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold transition-all ${activeShape === shape ? 'bg-[#007AFF] text-white shadow-xl scale-110 z-10' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {shape}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-[0.5em] opacity-40">Shapes CAGED</span>
              {hasCustomVersion && !isEditing && (
                <div className="bg-orange-500/10 text-orange-500 text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-orange-500/20 animate-in fade-in zoom-in-95">
                  <Sparkles size={10} /> Shape Customizado
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-10 flex flex-col items-center justify-center bg-[#0C0C0E]">
            {isEditing && (
              <div className="mb-6 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-center max-w-lg">
                <p className="text-orange-500 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 text-center">
                  <Database size={16} /> Modificando Shape Global
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-2 leading-relaxed">
                  Lembre-se: mudanças aqui afetam este shape em todos os tons.
                </p>
              </div>
            )}

            <div className="mb-6 w-full flex justify-center overflow-x-auto hide-scrollbar">
              <ChordChart
                selectedRoot={selectedRoot}
                selectedNotes={displayNotes}
                displayMode={displayMode}
                onModeChange={onModeChange}
                rootNote={selectedRoot}
                isInteractive={isEditing}
                onToggleNote={handleToggleNoteInEdit}
              />
            </div>

            <div className="flex flex-row w-full max-w-sm mx-auto gap-3 mb-10">
              <button
                onClick={() => handlePlayChord()}
                className={`group flex-1 h-14 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${isAnimating ? 'bg-[#007AFF]/60 text-white' : 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20'
                  }`}
              >
                <Volume2 size={18} />
                Tocar
              </button>

              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Edit3 size={18} className="text-orange-500" />
                  Editar
                </button>
              ) : (
                <div className="flex w-full gap-2 animate-in zoom-in-95">
                  <button
                    onClick={handleSaveOverride}
                    className="flex-1 h-14 rounded-2xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-500 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
                  >
                    X
                  </button>
                  {hasCustomVersion && (
                    <button
                      onClick={handleResetOverride}
                      className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                      title="Restaurar Padrão"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-center opacity-30">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Padrão Almir Chediak High-Fidelity</p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#12141c] border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Escolha a <span className="text-blue-500">Qualidade</span></h3>
              <button onClick={() => setIsModalOpen(false)} className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center transition-all text-slate-400 active:scale-90">
                <X size={32} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-10 space-y-12 hide-scrollbar">
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
                        onClick={() => { setSelectedType(type.symbol); setIsModalOpen(false); if (isEditing) setIsEditing(false); }}
                        className={`px-6 py-6 rounded-[2rem] font-black text-sm transition-all border flex flex-col items-center gap-1 ${selectedType === type.symbol
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

      {/* Modal de Escolha da Nota (Tom) */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsNoteModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#1C1C1E] border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">Escolha o <span className="text-[#007AFF]">Tom</span></h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center transition-all text-gray-400 active:scale-90">
                <X size={20} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 max-h-[60vh] hide-scrollbar">
              <div className="grid grid-cols-3 gap-2">
                {NOTES.map(note => (
                  <button
                    key={note}
                    onClick={() => { setSelectedRoot(note); setIsNoteModalOpen(false); if (isEditing) setIsEditing(false); }}
                    className={`h-20 rounded-2xl font-bold text-lg transition-all flex items-center justify-center ${selectedRoot === note ? 'bg-[#007AFF] text-white shadow-xl scale-[1.02]' : 'bg-white/5 text-gray-400 hover:bg-white/10 active:scale-95'
                      }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 bg-black/10 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Seleção Rápida de Tonalidade</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordLibrary;
