

import React from 'react';

interface Props {
    onBack: () => void;
}

export const StudioScreen: React.FC<Props> = ({ onBack }) => {
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

            {/* Main Content Space */}
            <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-[#0081FF]/10 flex items-center justify-center mb-6 animate-pulse">
                    <span className="material-symbols-rounded text-4xl text-[#0081FF]">construction</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Novo VQC Studio em breve
                </h2>
                <p className="text-gray-400 max-w-xs leading-relaxed">
                    Estamos preparando uma experiência musical totalmente reformulada para você.
                </p>
            </main>
        </div>
    );
};

