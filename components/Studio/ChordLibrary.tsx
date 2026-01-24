
import React, { useState } from 'react';
import { WheelPicker } from './WheelPicker';
import { PianoKeyboard } from './PianoKeyboard';
import { getCagedPosition } from '../../services/CAGED/cagedLogic';
import { NoteName } from '../../types';

type Instrument = 'guitar' | 'bass' | 'ukulele' | 'piano';

const INSTRUMENT_CONFIG = {
    guitar: { strings: 6, spacing: 32, labels: ['E', 'A', 'D', 'G', 'B', 'E'] },
    bass: { strings: 4, spacing: 44, labels: ['E', 'A', 'D', 'G'] },
    bass5: { strings: 5, spacing: 38, labels: ['B', 'E', 'A', 'D', 'G'] },
    ukulele: { strings: 4, spacing: 44, labels: ['G', 'C', 'E', 'A'] },
    piano: { strings: 0, spacing: 0, labels: [] } // Piano uses keyboard instead
};

const CAGED_SHAPES = ['C', 'A', 'G', 'E', 'D'];

export const ChordLibrary: React.FC = () => {
    const [instrument, setInstrument] = useState<Instrument>('guitar');
    const [bassStrings, setBassStrings] = useState<4 | 5>(4);
    const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
    const [selectedQuality, setSelectedQuality] = useState('Maior');
    const [selectedExtension, setSelectedExtension] = useState('tríade');
    const [selectedShape, setSelectedShape] = useState('C');
    const [selectedInversion, setSelectedInversion] = useState(0); // 0=Root, 1=1st, 2=2nd
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const roots: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const qualities = ["Maior", "Menor", "Dom", "Dim", "Sus7", "Sus4"];
    const extensions = ["tríade", "7", "9", "add9", "11", "13"];

    // Map quality to CAGED type
    const getChordType = () => {
        if (selectedExtension !== 'tríade') {
            return selectedExtension;
        }
        if (selectedQuality === 'Maior') return 'major';
        if (selectedQuality === 'Menor') return 'minor';
        return selectedQuality.toLowerCase();
    };

    const chordType = getChordType();
    const chordPositions = getCagedPosition(selectedRoot, chordType, selectedShape);

    return (
        <div className="p-6 flex flex-col items-center">
            {/* Instrument Selector */}
            <div className="flex flex-col w-full mb-8">
                <div className="flex gap-2 p-1 bg-black/20 rounded-xl w-full">
                    {(['guitar', 'piano', 'bass', 'ukulele'] as Instrument[]).map(inst => (
                        <button
                            key={inst}
                            onClick={() => setInstrument(inst)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${instrument === inst ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                        >
                            {inst === 'guitar' ? 'Violão' : inst === 'piano' ? 'Piano' : inst === 'bass' ? 'Baixo' : 'Ukulele'}
                        </button>
                    ))}
                </div>

                {/* Bass Strings Toggle */}
                {instrument === 'bass' && (
                    <div className="flex justify-center mt-4 gap-4 animate-in fade-in slide-in-from-top-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-1">Cordas:</span>
                        <div className="flex bg-black/20 rounded-lg p-1">
                            <button
                                onClick={() => setBassStrings(4)}
                                className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${bassStrings === 4 ? 'bg-[#0081FF] text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                4
                            </button>
                            <button
                                onClick={() => setBassStrings(5)}
                                className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${bassStrings === 5 ? 'bg-[#0081FF] text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                5
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Selection Button (Triggers Picker) */}
            <button
                onClick={() => setIsPickerOpen(true)}
                className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center min-w-[200px] active:scale-95 transition-all"
            >
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Acorde Selecionado</span>
                <span className="text-3xl font-black text-[#FF00BC]">
                    {selectedRoot} {selectedQuality} {selectedExtension !== 'tríade' ? selectedExtension : ''}
                </span>
                <span className="text-[8px] text-gray-400 mt-1">
                    {instrument === 'piano'
                        ? `Inversão: ${selectedInversion === 0 ? 'Fundamental' : selectedInversion + 'ª'}`
                        : `Shape: ${selectedShape}`}
                </span>
            </button>

            {/* Shape/Inversion Selector */}
            <div className="flex gap-2 mb-8">
                {instrument === 'piano' ? (
                    // Piano Inversion Selector
                    [0, 1, 2].map(inv => (
                        <button
                            key={inv}
                            onClick={() => setSelectedInversion(inv)}
                            className={`px-4 py-2 rounded-full flex items-center justify-center font-bold text-xs transition-all ${selectedInversion === inv ? 'bg-[#0081FF] text-white shadow-lg' : 'bg-white/5 text-gray-500'}`}
                        >
                            {inv === 0 ? 'Fund.' : `${inv}ª Inv.`}
                        </button>
                    ))
                ) : (
                    // Guitar CAGED Selector
                    CAGED_SHAPES.map(shape => (
                        <button
                            key={shape}
                            onClick={() => setSelectedShape(shape)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${selectedShape === shape ? 'bg-[#0081FF] text-white shadow-lg' : 'bg-white/5 text-gray-500'}`}
                        >
                            {shape}
                        </button>
                    ))
                )}
            </div>

            {/* Chord Diagram */}
            <div className="flex flex-col items-center">
                {chordPositions.length > 0 ? (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-4xl font-black mb-1">{selectedRoot} {selectedQuality}</h2>
                        <p className="text-[#FF00BC] text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
                            {instrument === 'piano'
                                ? (selectedInversion === 0 ? 'Posição Fundamental' : `${selectedInversion}ª Inversão`)
                                : `Shape ${selectedShape}`}
                        </p>

                        {instrument === 'piano' ? (
                            <PianoKeyboard root={selectedRoot} chordType={chordType} inversion={selectedInversion} />
                        ) : (
                            <ChordDiagram
                                instrument={instrument}
                                positions={chordPositions}
                                bassStrings={bassStrings}
                            />
                        )}
                    </div>
                ) : (
                    <div className="text-gray-600 italic py-10">Shape não disponível para este acorde</div>
                )}
            </div>

            {/* Rolling Picker Panel (iOS Style) */}
            {isPickerOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsPickerOpen(false)} />

                    <div className="relative w-full max-w-md bg-[#1A202C] rounded-t-[32px] border-t border-white/10 p-6 pb-12 pointer-events-auto animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setIsPickerOpen(false)}
                                className="text-[#FF00BC] font-bold uppercase tracking-widest text-sm py-2 px-4"
                            >
                                Pronto
                            </button>
                        </div>

                        <div className="flex justify-between items-center bg-black/20 rounded-2xl p-4">
                            <WheelPicker
                                items={roots}
                                value={selectedRoot}
                                onChange={setSelectedRoot}
                                width="w-1/3"
                            />
                            <WheelPicker
                                items={qualities}
                                value={selectedQuality}
                                onChange={setSelectedQuality}
                                width="w-1/3"
                            />
                            <WheelPicker
                                items={extensions}
                                value={selectedExtension}
                                onChange={setSelectedExtension}
                                width="w-1/3"
                            />
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

const ChordDiagram: React.FC<{ instrument: Instrument; positions: any[]; bassStrings?: 4 | 5 }> = ({ instrument, positions, bassStrings = 4 }) => {
    // Determine configuration based on instrument and settings
    let config = INSTRUMENT_CONFIG[instrument];
    if (instrument === 'bass' && bassStrings === 5) {
        config = INSTRUMENT_CONFIG.bass5;
    }

    // Determine string indices for visual mapping
    // Guitar: 5(E) -> 0(E)
    // Bass 4: 5(E) -> 2(D) [Standard tuning mapping logic required]
    // For now, we manually map assuming standard tuning relationships
    let stringsIndices: number[];

    if (instrument === 'guitar') {
        stringsIndices = [5, 4, 3, 2, 1, 0]; // E A D G B E
    } else if (instrument === 'bass') {
        if (bassStrings === 5) {
            stringsIndices = [6, 5, 4, 3, 2]; // B E A D G (Mock indices for mapping)
        } else {
            stringsIndices = [5, 4, 3, 2]; // E A D G
        }
    } else if (instrument === 'ukulele') {
        // Ukulele (G C E A) logic:
        // 4th string (G) is high G, but physically top string.
        // 3rd (C), 2nd (E), 1st (A).
        stringsIndices = [3, 2, 1, 0];
    } else {
        stringsIndices = [5, 4, 3, 2, 1, 0];
    }

    const totalWidth = (config.strings - 1) * config.spacing;

    // Calculate fret range
    const pressedFrets = positions.filter(p => p.fret > 0).map(p => p.fret);
    const minFret = pressedFrets.length > 0 ? Math.min(...pressedFrets) : 1;
    const maxFret = pressedFrets.length > 0 ? Math.max(...pressedFrets) : 5;
    const startFret = maxFret <= 4 ? 1 : minFret;
    const numFretsInChart = 4;

    return (
        <div className="relative flex flex-col items-center">
            {/* String Labels (Top) - Open/Muted indicators */}
            <div className="flex justify-between mb-4" style={{ width: totalWidth + 4 }}>
                {stringsIndices.map((sIdx) => {
                    const note = positions.find(p => p.stringIndex === sIdx);
                    const isMuted = !note;
                    const isOpen = note?.fret === 0;

                    return (
                        <div key={sIdx} className="w-8 text-center text-[10px] font-bold text-gray-500">
                            {isMuted ? 'X' : (isOpen ? 'O' : '')}
                        </div>
                    );
                })}
            </div>

            {/* Fretboard Grid */}
            <div className="relative border-t-8 border-gray-400" style={{ width: totalWidth }}>
                <div className="flex justify-between">
                    {Array.from({ length: config.strings }).map((_, i) => (
                        <div key={i} className="w-1 h-64 bg-gray-600 relative" />
                    ))}
                </div>

                {/* Horizontal Frets */}
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: numFretsInChart + 1 }).map((_, i) => (
                        <div key={i} className="absolute left-0 right-0 h-px bg-white/20" style={{ top: `${(i / numFretsInChart) * 100}%` }} />
                    ))}
                </div>

                {/* Fret Number Label */}
                {startFret > 1 && (
                    <div className="absolute -left-12 top-2 text-[#0081FF] font-black text-lg">
                        {startFret}ª
                    </div>
                )}

                {/* Dots (Fingers) */}
                {positions
                    .filter(p => stringsIndices.includes(p.stringIndex)) // FILTER INVALID STRINGS
                    .filter(p => p.fret >= startFret && p.fret < startFret + numFretsInChart)
                    .map((pos, idx) => {
                        const stringPos = stringsIndices.indexOf(pos.stringIndex);
                        const fretPos = pos.fret - startFret;

                        // Safety check
                        if (stringPos === -1) return null;

                        return (
                            <div
                                key={idx}
                                className="absolute w-7 h-7 rounded-full bg-[#0081FF] border-2 border-[#101622] flex items-center justify-center text-[10px] font-bold text-white z-10 shadow-lg"
                                style={{
                                    top: `${((fretPos + 0.5) / numFretsInChart) * 100}%`,
                                    left: `${stringPos * config.spacing}px`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {pos.finger || ''}
                            </div>
                        );
                    })}
            </div>

            {/* String Names (Bottom) */}
            <div className="flex gap-6 mt-8 px-2">
                {config.labels.map((label, i) => (
                    <div key={i} className="w-4 text-center text-[10px] font-black text-gray-600">
                        {label}
                    </div>
                ))}
            </div>
        </div >
    );
};
