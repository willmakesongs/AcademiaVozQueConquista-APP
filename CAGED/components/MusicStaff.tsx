
import React from 'react';
import { SelectedNote } from '../types';
import { getScientificPitch } from '../services/chordLogic';

interface MusicStaffProps {
  notes: SelectedNote[];
  className?: string;
}

const MusicStaff: React.FC<MusicStaffProps> = ({ notes, className }) => {
  // Configurações do SVG
  const width = 200;
  const height = 160;
  const startY = 50; // Linha superior (F5)
  const lineSpacing = 10;
  
  // Clave de Sol (Path simplificado)
  const trebleClefPath = "M 25 105 C 15 105 10 95 15 85 C 20 75 35 75 40 85 C 45 95 35 105 25 105 L 25 105 C 20 105 20 85 25 70 C 30 55 45 45 35 25 C 30 15 25 20 25 25 L 25 125 C 25 135 15 135 15 125"; 

  // Mapeamento de Posição Vertical
  // Pauta Padrão (Clave de Sol):
  // F5 (Linha 5 - Topo) -> Index 0 (Referência Visual)
  // E5 (Espaço) -> 0.5
  // D5 (Linha 4) -> 1
  // ...
  // C4 (Dó Central) -> Ledger Line inferior
  
  // Vamos usar "Steps" a partir de F5.
  // Nota F5 = 0 steps. E5 = 1 step. D5 = 2 steps. C4 = ...
  
  const getStaffPosition = (noteName: string, octave: number) => {
    // Guitarra escreve-se uma oitava acima do som real.
    // Som E2 -> Escrita E3 (Abaixo da pauta)
    // Som C4 (Middle C) -> Escrita C5 (Espaço 3)
    const visualOctave = octave + 1; 
    
    const baseOctave = 5;
    const baseNoteIndex = 3; // F (C=0, D=1, E=2, F=3...)
    
    const noteMap: Record<string, number> = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
    const cleanNote = noteName.replace(/[#b]/, ''); // Remove acidente para posição
    const currentNoteIndex = noteMap[cleanNote];
    
    // Diferença em "graus" da escala diatônica
    const octaveDiff = visualOctave - baseOctave;
    const noteDiff = currentNoteIndex - baseNoteIndex;
    
    const totalSteps = (octaveDiff * 7) + noteDiff;
    
    // Invertendo porque Y cresce para baixo
    // F5 é Y=startY. Se steps for positivo (agudo), sobe (Y diminui).
    // Espera... F5 (Top Line). G5 está ACIMA (-1 step). E5 está ABAIXO (+1 step).
    // Minha lógica de diff: G5 (4) - F5 (3) = +1. Mas visualmente G5 é "menor Y".
    // Então Y = startY - (totalSteps * (lineSpacing / 2))
    
    return startY - (totalSteps * (lineSpacing / 2));
  };

  const sortedNotes = [...notes].sort((a, b) => {
    // Ordenar grave para agudo para renderização limpa
    const pA = getScientificPitch(a.stringIndex, a.fret);
    const pB = getScientificPitch(b.stringIndex, b.fret);
    if (pA.octave !== pB.octave) return pA.octave - pB.octave;
    const noteMap: Record<string, number> = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
    return noteMap[pA.note.replace(/[#b]/, '')] - noteMap[pB.note.replace(/[#b]/, '')];
  });

  return (
    <div className={`bg-[#f0f0f0] rounded-xl p-4 shadow-inner ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Linhas da Pauta */}
        {[0, 1, 2, 3, 4].map(i => (
          <line 
            key={i} 
            x1="10" 
            y1={startY + (i * lineSpacing)} 
            x2={width - 10} 
            y2={startY + (i * lineSpacing)} 
            stroke="#333" 
            strokeWidth="1" 
          />
        ))}

        {/* Clave de Sol (Simplificada visualmente ou desenhada) */}
        <text x="10" y={startY + 30} fontFamily="serif" fontSize="45" fill="#111">🎼</text>

        {/* Notas */}
        {sortedNotes.map((n, idx) => {
          const { note, octave } = getScientificPitch(n.stringIndex, n.fret);
          const y = getStaffPosition(note, octave);
          const x = 60 + (idx * 25); // Espaçamento horizontal
          const cleanNote = note.replace(/[#b]/, '');
          const accident = note.includes('#') ? '♯' : note.includes('b') ? '♭' : '';

          // Linhas Suplementares (Ledger Lines)
          // Top line is F5 (startY). Y < startY is above.
          // Bottom line is E4 (startY + 40). Y > startY+40 is below.
          const needsLedgerAbove = y <= startY - lineSpacing; 
          const needsLedgerBelow = y >= startY + (4 * lineSpacing) + lineSpacing;
          
          // Cálculo simplificado de ledger lines:
          // Se Y for múltiplo de lineSpacing fora da grade
          // C4 (Middle C) visualmente em Gtr é C5? Não, C4 som -> C5 escrita.
          // C5 está no espaço 3. C4 escrita (C3 som) está na linha suplementar.
          
          // Vamos desenhar linha se a posição for "em cima de uma linha" e fora do range
          // Range pauta: startY (F5) até startY+40 (E4)
          // A cada 10px tem uma linha.
          
          const ledgers = [];
          // Linhas inferiores (C4 escrita e abaixo)
          for (let ly = startY + 50; ly <= y; ly += 10) {
             ledgers.push(ly);
          }
          // Linhas superiores (A5 escrita e acima)
          for (let ly = startY - 10; ly >= y; ly -= 10) {
             ledgers.push(ly);
          }

          return (
            <g key={`${n.stringIndex}-${n.fret}`}>
              {/* Ledger Lines */}
              {ledgers.map(ly => (
                 <line key={ly} x1={x - 8} y1={ly} x2={x + 8} y2={ly} stroke="#333" strokeWidth="1" />
              ))}
              
              {/* Haste (Stem) - Regra básica: Notas abaixo da linha central (B4), haste pra cima. Acima, pra baixo. */}
              {/* Linha central é B4 (startY + 20) */}
              <line 
                x1={y > startY + 20 ? x + 3.5 : x - 3.5} 
                y1={y} 
                x2={y > startY + 20 ? x + 3.5 : x - 3.5} 
                y2={y > startY + 20 ? y - 25 : y + 25} 
                stroke="#000" 
                strokeWidth="1.5" 
              />

              {/* Cabeça da Nota */}
              <ellipse cx={x} cy={y} rx="5" ry="4" fill="#000" transform={`rotate(-20 ${x} ${y})`} />

              {/* Acidente */}
              {accident && (
                <text x={x - 12} y={y + 4} fontSize="14" fill="#000" fontWeight="bold">
                  {accident}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MusicStaff;
