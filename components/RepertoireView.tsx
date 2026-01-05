import React, { useState } from 'react';
import { YOUTUBE_EMBED_TEMPLATE } from '../constants';

/* =========================
   DADOS DO REPERTÓRIO (MVP)
   ========================= */
export interface RepertoireMusic {
    id: string;
    title: string;
    artist: string;
    style: string;
    difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
    originalKey: string;
    youtubeByKey: {
        [key: string]: string; // "-2", "-1", "0", "+1", "+2"
    };
}

export const REPERTOIRE_DATA: RepertoireMusic[] = [
    {
        id: 'rep001',
        title: 'Evidências',
        artist: 'Chitãozinho & Xoropó',
        style: 'Sertanejo',
        difficulty: 'Iniciante',
        originalKey: 'E',
        youtubeByKey: {
            '-2': 'https://www.youtube.com/embed/VIDEO_ID_MINUS_2', // Placeholder
            '-1': 'https://www.youtube.com/embed/VIDEO_ID_MINUS_1', // Placeholder
            '0': 'https://www.youtube.com/embed/UDhe726GhFs',      // Real ID
            '+1': 'https://www.youtube.com/embed/VIDEO_ID_PLUS_1',  // Placeholder
            '+2': 'https://www.youtube.com/embed/VIDEO_ID_PLUS_2'   // Placeholder
        }
    },
    {
        id: 'rep002',
        title: 'Como Nossos Pais',
        artist: 'Elis Regina',
        style: 'MPB',
        difficulty: 'Intermediário',
        originalKey: 'C',
        youtubeByKey: {
            '0': 'https://www.youtube.com/embed/yWjXqN7Q9o4'
        }
    }
];

interface Props {
    onBack: () => void;
}

export const RepertoireView: React.FC<Props> = ({ onBack }) => {
    const [selected, setSelected] = useState<RepertoireMusic | null>(null);
    const [currentKey, setCurrentKey] = useState('0');
    const [feedbackSent, setFeedbackSent] = useState(false);

    const handleMusicSelect = (music: RepertoireMusic) => {
        setSelected(music);
        setCurrentKey('0');
        setFeedbackSent(false);
    };

    const handleFeedback = (status: 'ok' | 'high' | 'low') => {
        console.log('Feedback enviado:', { musicId: selected?.id, key: currentKey, status });
        setFeedbackSent(true);
        // Future: Integrate with Supabase
    };

    // 1. LIST VIEW
    if (!selected) {
        return (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white">Biblioteca de Karaokê</h2>
                        <p className="text-xs text-gray-400">Escolha uma música para treinar</p>
                    </div>
                </div>

                <div className="grid gap-3">
                    {REPERTOIRE_DATA.map((music) => (
                        <button
                            key={music.id}
                            onClick={() => handleMusicSelect(music)}
                            className="bg-[#1A202C] p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-rounded">mic_external_on</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">{music.title}</h3>
                                    <p className="text-xs text-gray-400">{music.artist}</p>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest block">{music.style}</span>
                                <span className="text-xs text-[#0081FF] font-medium">{music.originalKey}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // 2. DETAIL PLAYER VIEW
    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => setSelected(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <div className="flex-1 overflow-hidden">
                    <h2 className="text-lg font-bold text-white truncate">{selected.title}</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{selected.artist}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span className="text-[#0081FF]">
                            Tom: {currentKey === '0' ? selected.originalKey : `${selected.originalKey} (${currentKey})`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Video Player */}
            <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video relative">
                {selected.youtubeByKey[currentKey] ? (
                    <iframe
                        src={selected.youtubeByKey[currentKey]}
                        title={selected.title}
                        className="w-full h-full absolute top-0 left-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                        <span className="material-symbols-rounded text-4xl mb-2 opacity-50">music_off</span>
                        <p className="text-sm">Tom indisponível no momento.</p>
                        <button
                            onClick={() => setCurrentKey('0')}
                            className="mt-4 text-[#0081FF] text-xs font-bold uppercase tracking-wide hover:underline"
                        >
                            Voltar ao Original
                        </button>
                    </div>
                )}
            </div>

            {/* Key Selector */}
            <div className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3 text-center">Ajuste de Tom</p>
                <div className="flex justify-center gap-2">
                    {['-2', '-1', '0', '+1', '+2'].map((key) => {
                        const isAvailable = !!selected.youtubeByKey[key];
                        const isSelected = currentKey === key;
                        return (
                            <button
                                key={key}
                                disabled={!isAvailable}
                                onClick={() => setCurrentKey(key)}
                                className={`
                            h-10 px-3 rounded-lg text-sm font-bold transition-all
                            ${isSelected
                                        ? 'bg-[#0081FF] text-white shadow-[0_0_15px_rgba(0,129,255,0.4)] scale-110'
                                        : isAvailable
                                            ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                            : 'bg-transparent text-gray-700 cursor-not-allowed border border-white/5'}
                        `}
                            >
                                {key === '0' ? 'Orig' : key}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Feedback Area */}
            <div className="bg-gradient-to-br from-[#1A202C] to-[#151a24] p-5 rounded-2xl border border-white/5 text-center">
                {!feedbackSent ? (
                    <>
                        <p className="text-sm text-gray-300 mb-4">Como você sentiu esse tom?</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => handleFeedback('low')}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform">⬇️</span>
                                <span className="text-[10px] text-gray-400 uppercase">Baixo</span>
                            </button>
                            <button
                                onClick={() => handleFeedback('ok')}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform">✅</span>
                                <span className="text-[10px] text-gray-400 uppercase">Bom</span>
                            </button>
                            <button
                                onClick={() => handleFeedback('high')}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform">🔥</span>
                                <span className="text-[10px] text-gray-400 uppercase">Alto</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="animate-in zoom-in duration-300 py-2">
                        <span className="material-symbols-rounded text-green-500 text-3xl mb-1">check_circle</span>
                        <p className="text-sm text-white font-bold">Obrigado pelo feedback!</p>
                        <p className="text-xs text-gray-500 mt-1">Isso ajuda a personalizar seus treinos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
