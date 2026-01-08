
import React, { useRef, useState } from 'react';
import { SelectedNote, FretboardMode } from '../../types';
import { getNoteAt, formatMusicText, getIntervalAt, calculateFinger } from '../../services/CAGED/chordLogic';
import { X, Layers } from 'lucide-react';

interface ChordChartProps {
  selectedNotes: SelectedNote[];
  displayMode: FretboardMode;
  onModeChange: (mode: FretboardMode) => void;
  rootNote: string;
  isInteractive?: boolean;
  onToggleNote?: (sIdx: number, fret: number) => void;
}

const ChordChart: React.FC<ChordChartProps> = ({
  selectedNotes,
  displayMode,
  onModeChange,
  rootNote,
  isInteractive = false,
  onToggleNote
}) => {
  // Cálculo inteligente da posição inicial do braço
  const pressedNotes = selectedNotes.filter(n => n.fret > 0);
  const frets = pressedNotes.map(n => n.fret);
  const minFret = frets.length > 0 ? Math.min(...frets) : 1;
  const maxFret = frets.length > 0 ? Math.max(...frets) : 1;

  // REGRA: Se o acorde couber inteiramente até a casa 4, FIXAR o início na Casa 1.
  const startFret = maxFret <= 4 ? 1 : minFret;

  const numFretsInChart = 4;

  const stringsIndices = [5, 4, 3, 2, 1, 0];
  const modes: FretboardMode[] = ['notes', 'intervals', 'fingers'];
  const currentIndex = modes.indexOf(displayMode);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const touchStartRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInteractive) return;
    touchStartRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isInteractive) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartRef.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (isInteractive) return;
    setIsDragging(false);
    const threshold = 60;
    if (dragOffset > threshold) {
      const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
      onModeChange(modes[prevIndex]);
    } else if (dragOffset < -threshold) {
      const nextIndex = (currentIndex + 1) % modes.length;
      onModeChange(modes[nextIndex]);
    }
    setDragOffset(0);
  };

  const getMarkerLabel = (sIdx: number, fret: number, mode: FretboardMode) => {
    if (mode === 'notes') return formatMusicText(getNoteAt(sIdx, fret));
    if (mode === 'fingers') return calculateFinger(sIdx, fret, selectedNotes);
    if (mode === 'intervals') {
      const note = getNoteAt(sIdx, fret);
      return getIntervalAt(note, rootNote);
    }
    return '';
  };

  const getModeTitle = (m: FretboardMode) => {
    switch (m) {
      case 'notes': return 'NOTAS';
      case 'intervals': return 'INTERVALOS';
      case 'fingers': return 'DEDOS';
    }
  };

  // Renderiza a barra da pestana (Apenas no modo Dedos e se houver múltiplas notas na menor casa)
  const renderBarre = (mode: FretboardMode, active: boolean) => {
    if (mode !== 'fingers') return null;

    const pNotes = selectedNotes.filter(n => n.fret > 0);
    if (pNotes.length < 2) return null;

    const currentFrets = pNotes.map(n => n.fret);
    const barreFret = Math.min(...currentFrets);

    // Verifica se está visível no range atual
    if (barreFret < startFret || barreFret >= startFret + numFretsInChart) return null;

    // Notas que compõem a pestana (mesma casa, menor casa do acorde)
    const barreNotes = pNotes.filter(n => n.fret === barreFret);

    // Só desenha a barra se houver 2 ou mais notas na mesma casa (pestana real)
    if (barreNotes.length < 2) return null;

    // Calcula a extensão da barra
    const stringPositions = barreNotes.map(n => stringsIndices.indexOf(n.stringIndex));
    const minPos = Math.min(...stringPositions);
    const maxPos = Math.max(...stringPositions);

    return (
      <div
        className="absolute h-8 bg-blue-600 rounded-full z-10 transition-all duration-500 shadow-lg flex items-center justify-center pointer-events-none"
        style={{
          opacity: active ? 0.9 : 0,
          transform: `translateY(-50%) scale(${active ? 1 : 0.9})`,
          left: `${minPos * 20}%`, // Início no centro da primeira nota
          width: `${(maxPos - minPos) * 20}%`, // Extensão até o centro da última nota
          top: `${((barreFret - startFret) * 25) + 12.5}%`,
        }}
      >
        <div className="absolute inset-y-0 -left-5 -right-5 bg-blue-600 rounded-full -z-10"></div>
        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest drop-shadow-md">Pestana</span>
      </div>
    );
  };

  const renderChartLayer = (mode: FretboardMode, active: boolean) => (
    <div
      className="absolute inset-0 transition-all duration-500 z-20"
      style={{
        opacity: active ? 1 : 0,
        transform: `scale(${active ? 1 : 0.95})`,
        pointerEvents: 'none'
      }}
    >
      {renderBarre(mode, active)}

      {selectedNotes.filter(n => n.fret >= startFret && n.fret < startFret + numFretsInChart).map(note => {
        const stringPos = stringsIndices.indexOf(note.stringIndex);
        const fretPos = note.fret - startFret;
        const label = getMarkerLabel(note.stringIndex, note.fret, mode);
        const isRoot = label === 'T' || (mode === 'notes' && formatMusicText(getNoteAt(note.stringIndex, note.fret)) === rootNote);

        return (
          <div
            key={`${mode}-${note.stringIndex}-${note.fret}`}
            className="absolute z-20"
            style={{
              left: `${(stringPos * 20)}%`,
              top: `${(fretPos * 25) + 12.5}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: isInteractive ? 'auto' : 'none'
            }}
            onClick={(e) => {
              if (isInteractive && onToggleNote) {
                e.stopPropagation();
                onToggleNote(note.stringIndex, -1);
              }
            }}
          >
            <div className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center transition-all active:scale-90 ${isRoot
              ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
              : 'bg-blue-600 shadow-xl shadow-blue-600/40'
              }`}>
              <span className="text-[10px] font-black text-white uppercase select-none">
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex justify-center">
        <button
          onClick={() => setIsPopUpOpen(true)}
          disabled={isInteractive}
          className={`group flex items-center gap-4 bg-black/40 px-8 py-4 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-all active:scale-95 shadow-xl backdrop-blur-md ${isInteractive ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Layers size={18} className="text-blue-500" />
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Exibição</span>
            <span className="text-lg font-black text-white tracking-tighter uppercase">
              MODO: <span className="text-blue-500">{getModeTitle(displayMode)}</span>
            </span>
          </div>
        </button>
      </div>

      <div
        className="flex flex-col items-center select-none touch-none overflow-visible transition-all duration-500 flex-shrink-0 w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
        }}
      >
        <div className="relative mt-12 sm:mt-16 w-[170px] sm:w-[220px]">
          {/* Fret Indicators (Casa) - Absolutely positioned on the left to not affect centering */}
          <div className="absolute -left-10 sm:-left-16 top-0 bottom-0 flex flex-col pt-3 w-10 sm:w-14 items-end pointer-events-none">
            <span className="text-blue-500 font-black text-lg sm:text-2xl leading-none">
              {startFret === 1 ? '' : `${startFret}ª`}
            </span>
            <span className="text-[7px] sm:text-[9px] font-black text-slate-600 uppercase tracking-tighter text-right">
              {startFret === 1 ? '' : 'CASA'}
            </span>
          </div>

          <div className="relative w-full">
            {/* INDICATORS (Aligned) */}
            <div className="absolute -top-9 left-0 right-0 h-9 pointer-events-none z-40">
              {stringsIndices.map((sIdx, i) => {
                const note = selectedNotes.find(n => n.stringIndex === sIdx);
                const isMuted = !note;
                const isOpen = note?.fret === 0;

                return (
                  <div
                    key={sIdx}
                    className="absolute bottom-0 transform -translate-x-1/2 flex justify-center pointer-events-auto pb-1"
                    style={{ left: `${i * 20}%` }}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-transform active:scale-125 ${isInteractive ? 'cursor-pointer hover:bg-white/5 rounded-lg' : ''}`}
                      onClick={() => isInteractive && onToggleNote && onToggleNote(sIdx, isMuted ? 0 : -1)}
                    >
                      {isMuted ? (
                        <X size={12} className="text-red-500/60" />
                      ) : isOpen ? (
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center shadow-lg ${(getMarkerLabel(sIdx, 0, displayMode) === 'T') ? 'border-orange-500 bg-[#0d1017]' : 'border-green-500 bg-[#0d1017]'
                          }`}>
                          <span className={`text-[7px] sm:text-[9px] font-black ${(getMarkerLabel(sIdx, 0, displayMode) === 'T') ? 'text-orange-500' : 'text-green-500'
                            }`}>
                            {getMarkerLabel(sIdx, 0, displayMode)}
                          </span>
                        </div>
                      ) : (
                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fretboard Body */}
            <div className="relative border-l border-r border-white/10" style={{ height: '220px' }}>
              {startFret === 1 && (
                <div className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-b from-slate-200 to-slate-400 rounded-sm z-10 shadow-sm"></div>
              )}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {Array.from({ length: numFretsInChart + 1 }).map((_, i) => (
                  <div key={i} className="h-[2px] bg-white/10 w-full shadow-sm"></div>
                ))}
              </div>

              {modes.map((m) => renderChartLayer(m, m === displayMode))}

              <div className="absolute inset-0 flex justify-between z-10">
                {stringsIndices.map((sIdx) => (
                  <div
                    key={sIdx}
                    className={`w-[1px] bg-white/10 h-full relative group/string ${isInteractive ? 'cursor-crosshair' : ''}`}
                  >
                    {isInteractive && (
                      <div
                        className="absolute inset-y-0 -left-4 w-8 hover:bg-blue-500/10 active:bg-blue-500/20 transition-colors z-0"
                        onClick={(e) => {
                          if (onToggleNote) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const y = e.clientY - rect.top;
                            const fretInView = Math.floor((y / rect.height) * numFretsInChart);
                            onToggleNote(sIdx, startFret + fretInView);
                          }
                        }}
                      />
                    )}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-400 to-slate-200 opacity-20 pointer-events-none" style={{ width: `${1 + (sIdx * 0.3)}px` }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM NOTES (Now perfectly aligned) */}
            <div className="absolute -bottom-9 left-0 right-0 h-9 flex items-center pointer-events-none">
              {['E', 'A', 'D', 'G', 'B', 'E'].map((name, i) => (
                <span
                  key={i}
                  className="absolute transform -translate-x-1/2 text-[8px] sm:text-[10px] font-black text-slate-700 w-6 text-center uppercase"
                  style={{ left: `${i * 20}%` }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isPopUpOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsPopUpOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#12141c] border border-white/10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Escolha o <span className="text-blue-500">Modo</span></h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Dicionário CAGED</p>
              </div>
              <button onClick={() => setIsPopUpOpen(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 flex flex-col gap-4">
              {modes.map((m) => (
                <button
                  key={m}
                  onClick={() => { onModeChange(m); setIsPopUpOpen(false); }}
                  className={`w-full p-6 rounded-[2rem] flex items-center justify-between transition-all active:scale-95 border ${displayMode === m
                    ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/30'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  <span className="text-xl font-black uppercase tracking-tighter">{getModeTitle(m)}</span>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${displayMode === m ? 'border-white bg-white/20' : 'border-slate-800'}`}>
                    {displayMode === m && <div className="w-4 h-4 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordChart;
