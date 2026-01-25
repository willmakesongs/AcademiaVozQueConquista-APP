
import React, { useState, useEffect } from 'react';
import { Vocalize, Screen } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LORENA_AVATAR_URL, MODULES, VOCALIZES, MINIMALIST_LOGO_URL } from '../constants';

interface Props {
    onNavigate: (screen: Screen) => void;
    onPlayVocalize: (vocalize: Vocalize) => void;
}

export const StudentDashboard: React.FC<Props> = ({ onNavigate, onPlayVocalize }) => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || 'Voz';

    const [progress, setProgress] = useState(0);
    const [nextLesson, setNextLesson] = useState<{ id: string, title: string, type: 'topic' | 'vocalize' } | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('checklist_progress');
        if (saved) {
            try {
                const checklist = JSON.parse(saved);

                // 1. Calcular Progresso Total
                // Vamos contar todos os tópicos de todos os módulos
                const allTopics = MODULES.flatMap(m => m.topics);
                const totalTopics = allTopics.length;
                const completedTopics = allTopics.filter(t => checklist[t.id]).length;

                const percentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
                setProgress(Math.round(percentage));

                // 2. Tentar encontrar a próxima aula
                const firstPending = allTopics.find(t => !checklist[t.id]);
                if (firstPending) {
                    setNextLesson({ id: firstPending.id, title: firstPending.title, type: 'topic' });
                }
            } catch (e) {
                console.error("Erro ao calcular progresso:", e);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#101622] pb-40">
            {/* Header */}
            <header className="pt-8 pb-4 px-6 flex justify-between items-center bg-[#101622]/95 backdrop-blur-sm sticky top-0 z-20 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={user?.avatarUrl || 'https://picsum.photos/200'}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-[#6F4CE7]"
                        />
                        {user?.level && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#6F4CE7] rounded-full flex items-center justify-center border-2 border-[#101622]">
                                <span className="text-[10px] font-black text-white">{user.level}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400 font-medium">Bem-vindo(a), {firstName}</p>
                            {user?.streak && user.streak > 0 && (
                                <div className="flex items-center gap-0.5 bg-orange-500/20 px-1.5 py-0.5 rounded-full border border-orange-500/30">
                                    <span className="material-symbols-rounded text-orange-500 text-xs">local_fire_department</span>
                                    <span className="text-[10px] font-black text-orange-500">{user.streak}</span>
                                </div>
                            )}
                        </div>
                        <div className="w-32 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden relative">
                            <div
                                className="h-full bg-gradient-to-r from-[#0081FF] to-[#6F4CE7] transition-all duration-1000"
                                style={{ width: `${((user?.xp || 0) % 1000) / 10}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white relative hover:bg-white/10 transition-colors">
                    <span className="material-symbols-rounded">notifications</span>
                    <span className="absolute top-2.5 right-3 w-2 h-2 bg-[#FF00BC] rounded-full border border-[#101622]"></span>
                </button>
            </header>

            <div className="px-6 py-6 space-y-8">

                {/* Section: Sua Evolução (DYNAMIC CARD) */}
                <div className="bg-gradient-to-br from-[#1A202C] to-[#111827] p-6 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[60px] opacity-10"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-rounded text-[#0081FF]">signal_cellular_alt</span>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Sua Evolução</h3>
                            </div>
                            <span className="text-2xl font-black text-white">{progress}%</span>
                        </div>

                        {/* Progress Bar Large */}
                        <div className="w-full h-3 bg-white/5 rounded-full mb-8 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#0081FF] to-[#6F4CE7] rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status do Curso</p>
                                <p className="text-white font-bold">{progress > 90 ? 'Quase mestre!' : (progress > 50 ? 'Em ascensão' : 'Iniciante focado')}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Nível VQC</p>
                                <p className="text-white font-bold">Lvl {user?.level || 1}</p>
                            </div>
                        </div>

                        {/* Next Action CTA */}
                        {nextLesson && (
                            <button
                                onClick={() => onNavigate(Screen.LIBRARY)}
                                className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between px-5 transition-all group"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] text-[#0081FF] font-black uppercase mb-0.5">Sugestão da Lorena:</p>
                                    <p className="text-sm font-bold text-white truncate max-w-[180px]">{nextLesson.title}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] group-hover:bg-[#0081FF] group-hover:text-white transition-all">
                                    <span className="material-symbols-rounded">play_arrow</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Section: LORENA IA (Destaque Principal) */}
                <div
                    onClick={() => onNavigate(Screen.CHAT)}
                    className="relative overflow-hidden bg-gradient-to-br from-[#1A202C] to-[#25213b] p-5 rounded-2xl border border-[#6F4CE7]/30 active:scale-[0.98] active:bg-[#6F4CE7]/5 cursor-pointer shadow-lg shadow-purple-900/10 touch-manipulation"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#6F4CE7] blur-[80px] opacity-10 group-hover:opacity-25 transition-opacity"></div>

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-brand-gradient p-[2px] shrink-0 shadow-lg shadow-purple-900/40">
                            <div className="w-full h-full bg-[#1A202C] rounded-full flex items-center justify-center overflow-hidden">
                                <img
                                    src={LORENA_AVATAR_URL}
                                    alt="Lorena Bot"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Lorena IA</h3>
                            <p className="text-xs text-[#6F4CE7] font-bold uppercase tracking-wide mb-2">Sua Mentora Virtual 24h</p>
                            <p className="text-sm text-gray-300 mb-4">
                                Este chatbot inteligente conhece todo o nosso método! Ela está aqui para tirar dúvidas, sugerir músicas e te guiar quando o professor não estiver por perto.
                            </p>

                            <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-3">
                                <p className="text-[10px] text-gray-500 uppercase mb-2 font-bold flex items-center gap-1">
                                    <span className="material-symbols-rounded text-xs">tips_and_updates</span>
                                    Exemplos do que pedir:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex gap-2 items-start text-xs text-gray-300">
                                        <span className="material-symbols-rounded text-[#FF00BC] text-sm shrink-0">chat_bubble</span>
                                        "Me sugira 3 músicas pop para voz grave (Barítono)."
                                    </li>
                                    <li className="flex gap-2 items-start text-xs text-gray-300">
                                        <span className="material-symbols-rounded text-[#FF00BC] text-sm shrink-0">chat_bubble</span>
                                        "Minha garganta está arranhando, o que eu faço?"
                                    </li>
                                    <li className="flex gap-2 items-start text-xs text-gray-300">
                                        <span className="material-symbols-rounded text-[#FF00BC] text-sm shrink-0">chat_bubble</span>
                                        "Me dê a letra de 'Hallelujah' e explique o significado."
                                    </li>
                                </ul>
                            </div>
                            <div className="text-xs text-[#6F4CE7] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Toque para conversar agora <span className="material-symbols-rounded text-sm">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: FERRAMENTAS DE ESTÚDIO (PERFIL) */}
                <div
                    onClick={() => onNavigate(Screen.STUDIO)}
                    className="bg-[#1A202C] p-5 rounded-2xl border border-[#0081FF]/20 cursor-pointer active:bg-[#0081FF]/5 active:scale-[0.98] transition-all relative overflow-hidden touch-manipulation"
                >
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-full bg-[#0081FF]/5 skew-x-12"></div>

                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                        <img src={MINIMALIST_LOGO_URL} alt="VQC" className="h-5 w-auto object-contain opacity-90" />
                        VQC Studio
                    </h3>
                    <p className="text-sm text-gray-300 mb-4 relative z-10">
                        O estúdio guarda segredos! Acesse a ferramenta essencial para o seu treino diário:
                    </p>

                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <div className="bg-[#151A23] p-4 rounded-xl border border-white/5 hover:border-[#0081FF]/30 transition-colors shadow-lg shadow-black/20 group">
                            <img src="/metronome-icon.png" alt="Metrônomo" className="w-8 h-8 object-contain mb-2 group-hover:scale-110 transition-transform rounded-full" />
                            <strong className="text-white text-xs block mb-1 uppercase tracking-wider">Metrônomo VQC</strong>
                            <p className="text-[10px] text-gray-500">Desenvolva sua precisão rítmica com a melhor ferramenta de estudo.</p>
                        </div>
                        <div className="bg-[#151A23]/50 p-4 rounded-xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-60">
                            <span className="material-symbols-rounded text-gray-600 mb-2 block text-xl">pending</span>
                            <strong className="text-gray-500 text-[10px] block uppercase tracking-widest">Breve: Novos Apps</strong>
                            <p className="text-[9px] text-gray-700">Grave, Teclado e mais...</p>
                        </div>
                    </div>
                </div>

                {/* Quote & CTA */}
                <div className="text-center pt-4 pb-2">
                    <span className="material-symbols-rounded text-4xl text-[#6F4CE7]/30 mb-2">format_quote</span>
                    <p className="text-lg font-serif italic text-white mb-6">
                        "A voz é a única arte onde o instrumento é a própria vida."
                    </p>

                    <button
                        onClick={() => onNavigate(Screen.LIBRARY)}
                        className="w-full py-4 rounded-2xl bg-brand-gradient text-white font-bold shadow-[0_10px_40px_rgba(111,76,231,0.3)] hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded">play_circle</span>
                        Acessar a Academia
                    </button>
                </div>

            </div>
        </div>
    );
};
