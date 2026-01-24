
import React, { useState } from 'react';
import { Tuner } from '../components/Studio/Tuner';
import { Metronome } from '../components/Studio/Metronome';
import { ChordLibraryJTab } from '../components/Studio/ChordLibraryJTab';
import { Scales } from '../components/Studio/Scales';

interface Props {
    onBack: () => void;
}

type Module = 'tuner' | 'metronome' | 'chords' | 'scales';

export const StudioScreen: React.FC<Props> = ({ onBack }) => {
    const [activeModule, setActiveModule] = useState<Module>('tuner');

    const renderModule = () => {
        switch (activeModule) {
            case 'tuner':
                return <Tuner />;
            case 'metronome':
                return <Metronome />;
            case 'chords':
                return <ChordLibraryJTab />;
            case 'scales':
                return <Scales />;
            default:
                return <Tuner />;
        }
    };

    return (
        <div className="min-h-screen bg-[#101622] flex flex-col text-white">
            {/* Header */}
            <header className="pt-8 px-6 pb-4 bg-[#101622]/95 border-b border-white/5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">VQC Studio</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto hide-scrollbar pb-32">
                {renderModule()}
            </main>

            {/* Bottom Navigation Tabs */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1A202C] border-t border-white/5 px-6 py-4 flex justify-around items-center z-50">
                <button
                    onClick={() => setActiveModule('tuner')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeModule === 'tuner' ? 'text-[#0081FF]' : 'text-gray-500'}`}
                >
                    <span className="material-symbols-rounded text-2xl">graphic_eq</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Afinador</span>
                </button>

                <button
                    onClick={() => setActiveModule('metronome')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeModule === 'metronome' ? 'text-[#6F4CE7]' : 'text-gray-500'}`}
                >
                    <span className="material-symbols-rounded text-2xl">timer</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Metrônomo</span>
                </button>

                <button
                    onClick={() => setActiveModule('scales')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeModule === 'scales' ? 'text-[#0081FF]' : 'text-gray-500'}`}
                >
                    <span className="material-symbols-rounded text-2xl">straighten</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Escalas</span>
                </button>

                <button
                    onClick={() => setActiveModule('chords')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeModule === 'chords' ? 'text-[#FF00BC]' : 'text-gray-500'}`}
                >
                    <span className="material-symbols-rounded text-2xl">library_music</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Acordes</span>
                </button>
            </nav>
        </div>
    );
};
