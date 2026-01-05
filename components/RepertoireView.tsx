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
    category: string; // 'Pop', 'Rock', 'Sertanejo', 'MPB', 'Gospel'
    duration: string;
    thumbnailUrl: string;
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
        artist: 'Chitãozinho & Xororó',
        style: 'Sertanejo',
        category: 'Sertanejo',
        duration: '4:50',
        thumbnailUrl: 'https://img.youtube.com/vi/UDhe726GhFs/hqdefault.jpg',
        difficulty: 'Iniciante',
        originalKey: 'E',
        youtubeByKey: {
            '-2': '',
            '-1': '',
            '0': 'https://www.youtube.com/embed/UDhe726GhFs',
            '+1': '',
            '+2': ''
        }
    },
    {
        id: 'rep002',
        title: 'Como Nossos Pais',
        artist: 'Elis Regina',
        style: 'MPB',
        category: 'MPB',
        duration: '4:20',
        thumbnailUrl: 'https://img.youtube.com/vi/yWjXqN7Q9o4/hqdefault.jpg',
        difficulty: 'Intermediário',
        originalKey: 'C',
        youtubeByKey: {
            '0': 'https://www.youtube.com/embed/yWjXqN7Q9o4'
        }
    },
    {
        id: 'rep003',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        style: 'Rock',
        category: 'Rock',
        duration: '5:55',
        thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
        difficulty: 'Avançado',
        originalKey: 'Bb',
        youtubeByKey: {
            '0': 'https://www.youtube.com/embed/fJ9rUzIMcZQ'
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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const categories = ['Todos', 'Pop', 'Rock', 'Sertanejo', 'MPB', 'Gospel'];

    const filteredData = REPERTOIRE_DATA.filter(music => {
        const matchesSearch = music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            music.artist.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || music.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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

    // 1. LIST VIEW (SEARCH UI)
    if (!selected) {
        return (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
                {/* Header Title */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Buscar Karaokê</h2>
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <span className="material-symbols-rounded text-[#8B5CF6] group-focus-within:text-[#A78BFA] transition-colors">search</span>
                    </div>
                    <input
                        type="text"
                        placeholder="O que você quer cantar hoje?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1E1E2E] text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 focus:outline-none transition-all placeholder-gray-500 shadow-lg"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
                        >
                            <span className="material-symbols-rounded text-sm">close</span>
                        </button>
                    )}
                </div>

                {/* Categories (Pills) */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 hide-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                        px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all
                        ${selectedCategory === cat
                                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                                    : 'bg-[#1E1E2E] text-gray-400 border border-white/5 hover:bg-white/5'}
                    `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results Info */}
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-white font-bold text-lg">Resultados</h3>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{filteredData.length} ENCONTRADOS</span>
                </div>

                {/* Music List */}
                <div className="grid gap-4 pb-20">
                    {filteredData.map((music) => (
                        <button
                            key={music.id}
                            onClick={() => handleMusicSelect(music)}
                            className="group bg-[#1E1E2E] p-4 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-[#27273A] transition-all relative overflow-hidden"
                        >
                            {/* Background Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-white/0 group-hover:via-white/5 transition-all duration-500"></div>

                            <div className="flex items-center gap-4 relative z-10 w-full">
                                {/* Thumbnail */}
                                <div className="relative w-24 aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                                    <img src={music.thumbnailUrl} alt={music.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                                        {music.duration}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-left min-w-0">
                                    <h3 className="text-white font-bold text-base truncate mb-0.5 leading-tight">{music.title}</h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                                        <span className="material-symbols-rounded text-[14px] text-[#8B5CF6]">music_note</span>
                                        {music.artist}
                                    </p>
                                </div>

                                {/* Action Button */}
                                <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                                    <span className="material-symbols-rounded">play_arrow</span>
                                </div>
                            </div>
                        </button>
                    ))}

                    {filteredData.length === 0 && (
                        <div className="text-center py-1 mt-6 opacity-50">
                            <span className="material-symbols-rounded text-4xl mb-2">search_off</span>
                            <p>Nenhuma música encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 2. DETAIL PLAYER VIEW
    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setSelected(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors flex-shrink-0"
                >
                    <span className="material-symbols-rounded">keyboard_arrow_down</span>
                </button>
                <div className="flex-1 text-center pr-10">
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Tocando Agora</span>
                </div>
            </div>

            {/* Main Content Area - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto pb-10 hide-scrollbar">

                {/* Video/Album Art Container */}
                <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl bg-black aspect-square relative border border-white/5 mx-4 sm:mx-0">
                    {selected.youtubeByKey[currentKey] ? (
                        <iframe
                            src={selected.youtubeByKey[currentKey]}
                            title={selected.title}
                            className="w-full h-full absolute top-0 left-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center relative">
                            {/* Blurred Background */}
                            <img src={selected.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl" />

                            <div className="relative z-10 flex flex-col items-center p-6 text-center">
                                <span className="material-symbols-rounded text-5xl mb-4 text-white/20">music_off</span>
                                <h3 className="text-white font-bold text-lg mb-2">Tom Indisponível</h3>
                                <p className="text-gray-400 text-sm mb-6">Esta versão específica ainda não está no nosso acervo.</p>
                                <button
                                    onClick={() => setCurrentKey('0')}
                                    className="px-6 py-2 bg-[#8B5CF6] text-white rounded-full text-sm font-bold hover:bg-[#7C3AED] transition-colors shadow-lg"
                                >
                                    Voltar para Original
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Song Info */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selected.title}</h2>
                        <p className="text-gray-400 text-lg">{selected.artist}</p>
                    </div>
                    <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#8B5CF6] hover:bg-white/10 transition-colors">
                        <span className="material-symbols-rounded text-2xl">favorite</span>
                    </button>
                </div>

                {/* Key Control Card - The "Hero" Feature */}
                <div className="bg-[#1E1E2E] p-6 rounded-3xl border border-white/5 mb-6 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#8B5CF6] blur-[80px] opacity-10"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-rounded text-[#8B5CF6]">graphic_eq</span>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Controle de Tom</span>
                            </div>
                            <button
                                onClick={() => setCurrentKey('0')}
                                className="text-[10px] font-bold text-[#8B5CF6] border border-[#8B5CF6]/30 px-2 py-1 rounded-lg hover:bg-[#8B5CF6]/10 transition-colors uppercase"
                            >
                                Resetar
                            </button>
                        </div>

                        {/* Large Indicator */}
                        <div className="text-center mb-8">
                            <span className="text-6xl font-bold text-white tracking-tighter">
                                {currentKey === '0' ? 'Original' : (parseInt(currentKey) > 0 ? `+${currentKey}` : currentKey)}
                            </span>
                            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-2 font-medium">
                                {currentKey === '0' ? 'Tom de Referência' : 'Semitons'}
                            </p>
                        </div>

                        {/* Controls (Styled like a slider) */}
                        <div className="flex items-center gap-4 justify-between bg-black/20 p-2 rounded-2xl">
                            <button
                                onClick={() => {
                                    const keys = ['-2', '-1', '0', '+1', '+2'];
                                    const currentIndex = keys.indexOf(currentKey);
                                    if (currentIndex > 0) setCurrentKey(keys[currentIndex - 1]);
                                }}
                                disabled={currentKey === '-2'}
                                className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                            >
                                <span className="material-symbols-rounded">remove</span>
                            </button>

                            {/* Visual Dots */}
                            <div className="flex gap-2.5">
                                {['-2', '-1', '0', '+1', '+2'].map(key => (
                                    <div
                                        key={key}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentKey === key ? 'bg-[#8B5CF6] scale-150' : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    const keys = ['-2', '-1', '0', '+1', '+2'];
                                    const currentIndex = keys.indexOf(currentKey);
                                    if (currentIndex < 4) setCurrentKey(keys[currentIndex + 1]);
                                }}
                                disabled={currentKey === '+2'}
                                className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                            >
                                <span className="material-symbols-rounded">add</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-[#1E1E2E] p-4 rounded-2xl border border-white/5 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
                        <span className="material-symbols-rounded text-gray-400 group-hover:text-white transition-colors">playlist_add</span>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">Salvar</span>
                    </button>
                    <button className="bg-[#1E1E2E] p-4 rounded-2xl border border-white/5 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
                        <span className="material-symbols-rounded text-gray-400 group-hover:text-white transition-colors">share</span>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">Compartilhar</span>
                    </button>
                </div>

                {/* Feedback Section (Minimized) */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500 mb-3">Como ficou pra você?</p>
                    <div className="flex justify-center gap-6">
                        {!feedbackSent ? (
                            <>
                                <button onClick={() => handleFeedback('low')} className="text-2xl hover:scale-125 transition-transform" title="Muito Baixo">⬇️</button>
                                <button onClick={() => handleFeedback('ok')} className="text-2xl hover:scale-125 transition-transform" title="Confortável">✅</button>
                                <button onClick={() => handleFeedback('high')} className="text-2xl hover:scale-125 transition-transform" title="Muito Alto">⬆️</button>
                            </>
                        ) : (
                            <span className="text-xs text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full">Feedback Enviado!</span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
