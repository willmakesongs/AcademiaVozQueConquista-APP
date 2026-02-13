import React, { useState, useEffect, useRef } from 'react';

interface Props {
    chord: { name: string; lh: number[]; rh: number[] };
    total: number;
    currentIndex: number;
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export const PianoChordViewer: React.FC<Props> = ({
    chord,
    total,
    currentIndex,
    isFullscreen = false,
    onToggleFullscreen,
    onNext,
    onPrev
}) => {
    const [isLandscape, setIsLandscape] = useState(false);
    const [showUI, setShowUI] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const keyboardRef = useRef<HTMLDivElement>(null);
    const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-centering logic
    useEffect(() => {
        if (scrollContainerRef.current && keyboardRef.current) {
            const activeNotes = [...chord.lh, ...chord.rh];
            if (activeNotes.length === 0) return;

            const minNote = Math.min(...activeNotes);
            const maxNote = Math.max(...activeNotes);

            const whiteKeyCount = getWhiteKeyIndex(36);
            const totalWidth = keyboardRef.current.offsetWidth;
            const whiteKeyWidth = totalWidth / whiteKeyCount;

            const minX = getWhiteKeyIndex(minNote) * whiteKeyWidth;
            const maxX = getWhiteKeyIndex(maxNote) * whiteKeyWidth + whiteKeyWidth;
            const centerX = (minX + maxX) / 2;

            const containerWidth = scrollContainerRef.current.offsetWidth;
            const scrollTarget = centerX - (containerWidth / 2);

            scrollContainerRef.current.scrollTo({
                left: Math.max(0, scrollTarget),
                behavior: 'smooth'
            });
        }
    }, [chord, isFullscreen, isLandscape]);

    // UI Visibility Toggle (Hide after inactivity in fullscreen)
    useEffect(() => {
        if (isFullscreen) {
            const resetTimer = () => {
                setShowUI(true);
                if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
                uiTimeoutRef.current = setTimeout(() => setShowUI(false), 3000);
            };
            resetTimer();
            return () => { if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current); };
        } else {
            setShowUI(true);
        }
    }, [isFullscreen, chord, currentIndex]);

    // Double tap handler for mobile
    const lastTap = useRef<number>(0);
    const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            if (onToggleFullscreen) onToggleFullscreen();
        } else {
            // Single tap - show UI if hidden
            if (isFullscreen && !showUI) setShowUI(true);
        }
        lastTap.current = now;
    };

    const totalKeys = 36; // 3 octaves
    const keys = Array.from({ length: totalKeys });

    const isBlack = (index: number) => {
        const m = index % 12;
        return [1, 3, 6, 8, 10].includes(m);
    };

    const getWhiteKeyIndex = (index: number) => {
        let count = 0;
        for (let i = 0; i < index; i++) {
            if (!isBlack(i)) count++;
        }
        return count;
    };

    const getRootIndex = () => {
        const rootPart = chord.name.split('/')[0].split(' ')[0];
        const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        let rootIdx = names.indexOf(rootPart);
        if (rootIdx === -1) rootIdx = flatNames.indexOf(rootPart);
        if (rootIdx === -1) {
            if (rootPart.startsWith('Dó')) rootIdx = 0;
            else if (rootPart.startsWith('Ré')) rootIdx = 2;
            else if (rootPart.startsWith('Mi')) rootIdx = 4;
            else if (rootPart.startsWith('Fá')) rootIdx = 5;
            else if (rootPart.startsWith('Sol')) rootIdx = 7;
            else if (rootPart.startsWith('Lá')) rootIdx = 9;
            else if (rootPart.startsWith('Si')) rootIdx = 11;
        }
        return rootIdx === -1 ? 0 : rootIdx;
    };

    const getNoteName = (index: number) => {
        const rootIdx = getRootIndex();
        const noteIdx = index % 12;
        const interval = (noteIdx - rootIdx + 12) % 12;
        const isMinor = chord.name.toLowerCase().includes('menor') || (chord.name.includes('m') && !chord.name.toLowerCase().includes('major'));

        // Pedagogical rule: Minor chords force ALL accidental notes to flats (isMinor = true)
        const flatKeys = ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'Dbm', 'Ebm', 'Fm', 'Gbm', 'Abm', 'Bbm', 'Cm', 'Gm'];
        const useFlats = isMinor || flatKeys.some(k => chord.name.startsWith(k)) || chord.name.includes('b') || chord.name.includes('/Ab') || chord.name.includes('/Bb') || chord.name.includes('/Db') || chord.name.includes('/Eb') || chord.name.includes('/Gb');

        const sharpNames = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];
        const flatNames = ['Dó', 'Réb', 'Ré', 'Mib', 'Mi', 'Fá', 'Solb', 'Sol', 'Láb', 'Lá', 'Sib', 'Si'];

        return useFlats ? flatNames[noteIdx] : sharpNames[noteIdx];
    };

    const getNoteDegree = (index: number) => {
        const rootIdx = getRootIndex();
        const noteIdx = index % 12;
        const interval = (noteIdx - rootIdx + 12) % 12;

        const degreeMap: Record<number, string> = {
            0: '1', 1: '2b', 2: '2', 3: '3', 4: '3', 5: '4', 6: '4#', 7: '5', 8: '6b', 9: '6', 10: '7b', 11: '7'
        };
        return degreeMap[interval] || '';
    };

    const getTriadNotesWithDegrees = () => {
        const noteData = chord.rh.map(idx => ({ name: getNoteName(idx), degree: getNoteDegree(idx) }));
        const uniqueNotes: { name: string; degree: string }[] = [];
        const seenDegrees = new Set<string>();
        noteData.forEach(n => {
            if (n.degree && !seenDegrees.has(n.degree)) {
                uniqueNotes.push(n);
                seenDegrees.add(n.degree);
            }
        });
        uniqueNotes.sort((a, b) => parseInt(a.degree) - parseInt(b.degree));
        return uniqueNotes.map(n => {
            const displayNote = n.name.replace('b', 'b').toUpperCase().replace('B', 'b');
            return `${n.degree} ${displayNote}`;
        }).join(' - ');
    };

    const whiteKeyCount = getWhiteKeyIndex(totalKeys);
    const whiteKeyWidthPercent = 100 / whiteKeyCount;

    return (
        <div
            onClick={handleTap}
            className={`flex flex-col items-center w-full transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] bg-black p-0' : 'max-w-md mx-auto transform animate-in fade-in zoom-in-95 p-4'}`}
        >

            {/* Fullscreen Overlay UI (Chord Name + Arrows) */}
            {isFullscreen && (
                <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Chord Name Overlay */}
                    <div className="absolute top-10 left-0 right-0 text-center animate-in slide-in-from-top duration-500">
                        <h3 className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                            {chord.name}
                        </h3>
                        <p className="text-xl font-bold text-white/80 mt-2 tracking-widest drop-shadow-[0_2px_5px_rgba(0,0_0,0.5)]">
                            {getTriadNotesWithDegrees()}
                        </p>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6">
                        {onPrev && currentIndex > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                className="w-16 h-16 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform"
                            >
                                <span className="material-symbols-rounded text-4xl">chevron_left</span>
                            </button>
                        )}
                        {onNext && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onNext(); }}
                                className={`w-16 h-16 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform ${currentIndex >= total ? 'opacity-20' : ''}`}
                            >
                                <span className="material-symbols-rounded text-4xl">chevron_right</span>
                            </button>
                        )}
                    </div>

                    {/* Exit Hint */}
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">
                            Toque 2x para sair
                        </p>
                    </div>
                </div>
            )}

            {/* Header - Hidden in Fullscreen */}
            {!isFullscreen && (
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4">
                        <h3 className="text-4xl font-black text-white tracking-tighter">{chord.name}</h3>
                        {onToggleFullscreen && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleFullscreen(); }}
                                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-lg"
                            >
                                <span className="material-symbols-rounded text-2xl">fullscreen</span>
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                        <p className="text-[11px] font-black text-brand-blue uppercase tracking-[0.4em]">
                            ACORDE {currentIndex + 1} DE {total}
                        </p>
                        <div className="inline-block px-4 py-1.5 bg-white/5 rounded-full border border-white/5 mx-auto">
                            <p className="text-[12px] font-bold text-gray-400 tracking-widest">
                                <span className="text-[#6F4CE7]">{getTriadNotesWithDegrees()}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Container */}
            <div
                className={`relative w-full overflow-hidden transition-all duration-500 
            ${isFullscreen
                        ? 'flex-1 rounded-0 bg-black'
                        : 'h-80 p-5 bg-[#0A0F18] rounded-[3rem] border border-white/10 shadow-2xl cursor-pointer hover:border-white/20'
                    }`}
            >
                <div
                    ref={scrollContainerRef}
                    className={`absolute inset-0 overflow-x-auto hide-scrollbar flex transition-all duration-500 
                ${isFullscreen
                            ? (isLandscape ? 'p-0' : 'p-4 pb-20')
                            : 'p-5'
                        }`}
                >
                    {/* Keyboard Frame */}
                    <div
                        ref={keyboardRef}
                        className={`relative flex bg-[#1A202C] shadow-2xl overflow-hidden h-full 
                    ${isFullscreen
                                ? 'min-w-[1700px] flex-1 rounded-none'
                                : 'min-w-[800px] flex-1 rounded-b-2xl'
                            }`}
                    >
                        {/* White Keys */}
                        {keys.map((_, i) => !isBlack(i) && (
                            <div
                                key={`white-${i}`}
                                className={`flex-1 border-r-2 border-black/40 relative transition-colors duration-300
                            ${(chord.lh.includes(i) || chord.rh.includes(i))
                                        ? 'bg-gradient-to-b from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]'
                                        : 'bg-gradient-to-b from-[#F9FAFB] via-white to-[#E5E7EB]'
                                    } 
                            ${isFullscreen ? 'rounded-none' : 'rounded-b-xl'}
                            shadow-[inset_1px_0_0_rgba(255,255,255,0.8),inset_-1px_0_0_rgba(0,0,0,0.1),inset_0_-10px_15px_rgba(0,0,0,0.15)]
                        `}
                                style={{ height: '100%' }}
                            >
                                {/* Vertical Top Shadow for depth */}
                                <div className="absolute top-0 left-0 right-0 h-4 bg-black/10"></div>

                                {chord.lh.includes(i) && (
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
                                        <div className={`mb-2 ${isFullscreen ? 'w-12 h-12' : 'w-8 h-8'} rounded-full bg-brand-blue shadow-2xl border-4 border-white/60 animate-in zoom-in duration-300 z-20 flex items-center justify-center`}>
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                                        </div>
                                        <div className="flex flex-col items-center mb-4">
                                            <span className={`font-black text-brand-blue drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] leading-none ${isFullscreen ? 'text-3xl' : 'text-[13px]'}`}>
                                                {getNoteName(i)}
                                            </span>
                                            <span className={`font-black text-brand-blue drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] opacity-80 mt-1 ${isFullscreen ? 'text-xl' : 'text-[10px]'}`}>
                                                {getNoteDegree(i)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {chord.rh.includes(i) && (
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
                                        <div className={`mb-2 ${isFullscreen ? 'w-12 h-12' : 'w-8 h-8'} rounded-full bg-[#FF0000] shadow-2xl border-4 border-white/60 animate-in zoom-in duration-300 z-20 flex items-center justify-center`}>
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                                        </div>
                                        <div className="flex flex-col items-center mb-4">
                                            <span className={`font-black text-[#FF0000] drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] leading-none ${isFullscreen ? 'text-3xl' : 'text-[13px]'}`}>
                                                {getNoteName(i)}
                                            </span>
                                            <span className={`font-black text-[#FF0000] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] opacity-80 mt-1 ${isFullscreen ? 'text-xl' : 'text-[10px]'}`}>
                                                {getNoteDegree(i)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Black Keys */}
                        {keys.map((_, i) => isBlack(i) ? (
                            <div
                                key={`black-${i}`}
                                className={`absolute shadow-[0_12px_20px_-5px_rgba(0,0,0,0.7)] z-10 border-x border-white/10 transition-colors duration-300
                            ${(chord.lh.includes(i) || chord.rh.includes(i))
                                        ? 'bg-gradient-to-b from-[#4A3B00] via-[#715900] to-[#927600] border-amber-500/50'
                                        : 'bg-gradient-to-b from-[#111827] via-[#1F2937] to-[#374151]'
                                    }
                            ${isFullscreen ? 'rounded-none' : 'rounded-b-lg'}
                        `}
                                style={{
                                    width: `${whiteKeyWidthPercent * 0.72}%`,
                                    height: '65%',
                                    left: `${(getWhiteKeyIndex(i) * whiteKeyWidthPercent) - (whiteKeyWidthPercent * 0.36)}%`
                                }}
                            >
                                {/* Highlighting sheen for black keys */}
                                <div className="absolute top-0 left-[20%] right-[20%] h-full w-[2px] bg-white/5"></div>

                                {chord.lh.includes(i) && (
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
                                        <div className={`mb-1 ${isFullscreen ? 'w-10 h-10' : 'w-6 h-6'} rounded-full bg-brand-blue shadow-2xl border-2 border-white/40 animate-in zoom-in duration-300 flex items-center justify-center`}>
                                            <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                        </div>
                                        <div className="flex flex-col items-center mb-2">
                                            <span className={`font-black text-brand-blue drop-shadow-[0_2px_4px_rgba(0,0,0,1)] leading-none ${isFullscreen ? 'text-2xl' : 'text-[11px]'}`}>
                                                {getNoteName(i)}
                                            </span>
                                            <span className={`font-black text-brand-blue drop-shadow-[0_2px_3px_rgba(0,0,0,1)] opacity-80 mt-1 ${isFullscreen ? 'text-lg' : 'text-[9px]'}`}>
                                                {getNoteDegree(i)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {chord.rh.includes(i) && (
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
                                        <div className={`mb-1 ${isFullscreen ? 'w-10 h-10' : 'w-6 h-6'} rounded-full bg-[#FF0000] shadow-2xl border-2 border-white/40 animate-in zoom-in duration-300 flex items-center justify-center`}>
                                            <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                        </div>
                                        <div className="flex flex-col items-center mb-2">
                                            <span className={`font-black text-[#FF0000] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] leading-none ${isFullscreen ? 'text-2xl' : 'text-[11px]'}`}>
                                                {getNoteName(i)}
                                            </span>
                                            <span className={`font-black text-[#FF0000] drop-shadow-[0_2px_3px_rgba(0,0,0,1)] opacity-80 mt-1 ${isFullscreen ? 'text-lg' : 'text-[9px]'}`}>
                                                {getNoteDegree(i)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null)}
                    </div>
                </div>
            </div>

            {/* Navigation Indicators & Legend - Hidden in Fullscreen */}
            {!isFullscreen && (
                <div className="w-full flex flex-col items-center">
                    {/* Status Dots */}
                    <div className="flex gap-2 mt-10 mb-8">
                        {Array.from({ length: total }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-10 bg-brand-blue' : 'w-2.5 bg-white/10'}`}
                            />
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="p-8 bg-[#161B22]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 w-full shadow-2xl">
                        <div className="flex items-center justify-around">
                            <div className="flex items-center gap-5">
                                <div className="w-8 h-8 rounded-full bg-brand-blue border-2 border-white/20 shadow-lg flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white/40"></div>
                                </div>
                                <span className="text-[13px] font-black text-gray-300 uppercase tracking-widest">Mão Esquerda</span>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="w-8 h-8 rounded-full bg-[#FF0000] border-2 border-white/20 shadow-lg flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white/40"></div>
                                </div>
                                <span className="text-[13px] font-black text-gray-300 uppercase tracking-widest">Mão Direita</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-brand-blue/60 mt-8 text-center font-black uppercase tracking-[0.4em] animate-pulse">
                        Toque no piano para expandir
                    </p>
                </div>
            )}
        </div>
    );
};
