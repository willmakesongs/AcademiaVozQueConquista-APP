
import React, { useRef, useState } from 'react';
import { SelectedNote, FretboardMode } from '../../types';
import { getNoteAt, formatMusicText } from '../../services/CAGED/chordLogic';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FretboardProps {
  selectedNotes: SelectedNote[];
  onToggleNote: (stringIndex: number, fret: number) => void;
  displayMode: FretboardMode;
  onModeChange: (mode: FretboardMode) => void;
  rootNote?: string;
}

const Fretboard: React.FC<FretboardProps> = ({ selectedNotes, onToggleNote }) => {
  const fretCount = 15;
  const displayedStrings = [5, 4, 3, 2, 1, 0]; 
  
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartRef.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);
  };

  const getMarkerLabel = (sIdx: number, fret: number) => {
    return formatMusicText(getNoteAt(sIdx, fret));
  };

  return (
    <div 
      className="relative flex flex-col items-center select-none overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex gap-4">
        <div className="flex flex-col pt-12">
          {Array.from({ length: fretCount }).map((_, i) => (
            <div key={`num-${i}`} className="h-16 flex items-center justify-end pr-2">
              <span className="text-slate-700 font-black text-sm italic">{i + 1}</span>
            </div>
          ))}
        </div>

        <div 
          className="relative bg-[#0d0d0d] border-l border-r border-white/10 shadow-2xl rounded-b-xl overflow-hidden" 
          style={{ 
            width: '280px', 
            maxWidth: '320px',
            transform: `translateX(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <div className="h-3 w-full bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] shadow-md z-30 relative border-b border-black/20"></div>
          
          {[3, 5, 7, 9, 12, 15].map(f => (
            <div 
              key={`inlay-${f}`}
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none opacity-20"
              style={{ top: `${(f - 1) * 64 + 32}px` }}
            >
              {f === 12 ? (
                <div className="flex gap-12">
                   <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                   <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-300"></div>
              )}
            </div>
          ))}

          <div className="absolute inset-0 flex flex-col">
            {Array.from({ length: fretCount }).map((_, i) => (
              <div key={`fret-${i}`} className="h-16 border-b border-white/10 relative">
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 shadow-sm opacity-60"></div>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex justify-between px-4 md:px-5">
            {displayedStrings.map((sIdx) => {
              const isWound = sIdx >= 3;
              return (
                <div key={`str-phys-${sIdx}`} className="relative h-full flex justify-center" style={{ width: '40px' }}>
                  <div 
                    className="h-full shadow-lg"
                    style={{ 
                      width: `${isWound ? 3 + (sIdx - 3) * 0.8 : 1 + sIdx * 0.2}px`,
                      background: isWound 
                        ? 'linear-gradient(to right, #c5a059, #8b7355, #c5a059)' 
                        : 'linear-gradient(to right, #f1f5f9, #94a3b8, #f1f5f9)',
                      opacity: 0.8
                    }}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="absolute inset-0 flex justify-between px-4 md:px-5">
            {displayedStrings.map((sIdx) => (
              <div key={`notes-string-${sIdx}`} className="relative h-full flex justify-center" style={{ width: '40px' }}>
                <div className="absolute inset-0 flex flex-col">
                  {Array.from({ length: fretCount }).map((_, fIdx) => {
                    const fretNum = fIdx + 1;
                    const note = selectedNotes.find(n => n.stringIndex === sIdx);
                    const isActive = note?.fret === fretNum;
                    return (
                      <div key={`cell-${sIdx}-${fretNum}`} className="h-16 w-full flex items-center justify-center relative">
                        {isActive && (
                          <div onClick={() => onToggleNote(sIdx, fretNum)} className="z-40 w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-[0_5px_20px_rgba(37,99,235,0.6)] cursor-pointer">
                            <span className="text-white font-black text-[10px] uppercase">
                              {getMarkerLabel(sIdx, fretNum)}
                            </span>
                          </div>
                        )}
                        {!isActive && (
                           <div onClick={() => onToggleNote(sIdx, fretNum)} className="w-full h-full cursor-pointer z-10"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
