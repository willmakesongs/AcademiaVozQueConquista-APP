
import React, { useEffect, useRef, useState } from 'react';
import { WheelPicker } from './WheelPicker';
import { NoteName } from '../../types';

type Instrument = 'guitar' | 'bass' | 'ukulele';

// Declare jTab global
declare global {
    interface Window {
        jtab: any;
        Raphael: any;
    }
}

export const ChordLibraryJTab: React.FC = () => {
    const [instrument, setInstrument] = useState<Instrument>('guitar');
    const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
    const [selectedQuality, setSelectedQuality] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const chordContainerRef = useRef<HTMLDivElement>(null);

    const roots: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const qualities = ["", "m", "7", "m7", "maj7", "sus4", "sus2", "dim", "aug", "add9", "9"];

    // Load jTab scripts
    useEffect(() => {
        const loadScript = (src: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        };

        const loadScripts = async () => {
            try {
                await loadScript('/jtab/raphael.js');
                await loadScript('/jtab/jtab.js');
                setScriptsLoaded(true);
            } catch (error) {
                console.error('Error loading jTab scripts:', error);
            }
        };

        if (!window.jtab) {
            loadScripts();
        } else {
            setScriptsLoaded(true);
        }
    }, []);

    // Render chord when selection changes
    useEffect(() => {
        if (!scriptsLoaded || !chordContainerRef.current || !window.jtab) return;

        const chordName = `${selectedRoot}${selectedQuality}`;

        // Clear previous chord
        chordContainerRef.current.innerHTML = '';

        try {
            // Create container for jTab
            const container = document.createElement('div');
            container.className = 'jtab-chord';
            chordContainerRef.current.appendChild(container);

            // Render chord using jTab
            window.jtab.render(container, chordName);
        } catch (error) {
            console.error('Error rendering chord:', error);
            chordContainerRef.current.innerHTML = '<p class="text-gray-500">Acorde não disponível</p>';
        }
    }, [selectedRoot, selectedQuality, scriptsLoaded]);

    const chordDisplayName = `${selectedRoot}${selectedQuality || ' Maior'}`;

    return (
        <div className="p-6 flex flex-col items-center">
            {/* Instrument Selector */}
            <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-8 w-full">
                {(['guitar', 'bass', 'ukulele'] as Instrument[]).map(inst => (
                    <button
                        key={inst}
                        onClick={() => setInstrument(inst)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${instrument === inst ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                    >
                        {inst === 'guitar' ? 'Violão' : inst === 'bass' ? 'Baixo' : 'Ukulele'}
                    </button>
                ))}
            </div>

            {/* Current Selection Button */}
            <button
                onClick={() => setIsPickerOpen(true)}
                className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center min-w-[200px] active:scale-95 transition-all"
            >
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Acorde Selecionado</span>
                <span className="text-3xl font-black text-[#FF00BC]">
                    {chordDisplayName}
                </span>
            </button>

            {/* Chord Diagram Container */}
            <div className="flex flex-col items-center">
                {scriptsLoaded ? (
                    <div
                        ref={chordContainerRef}
                        className="chord-display bg-white rounded-2xl p-8 shadow-2xl min-w-[300px] min-h-[400px] flex items-center justify-center"
                    />
                ) : (
                    <div className="text-gray-500 italic py-10">Carregando biblioteca de acordes...</div>
                )}
            </div>

            {/* Rolling Picker Panel */}
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
                                width="w-1/2"
                            />
                            <WheelPicker
                                items={qualities}
                                value={selectedQuality}
                                onChange={setSelectedQuality}
                                width="w-1/2"
                            />
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .jtab-chord :global(svg) {
                    max-width: 100%;
                    height: auto;
                }
            `}</style>
        </div>
    );
};
