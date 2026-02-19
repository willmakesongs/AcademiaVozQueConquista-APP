
import React, { useState, useEffect } from 'react';
import { Vocalize, Screen } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient'; // Import Supabase
import { requestForToken } from '../lib/firebase'; // Import Firebase Messaging
import { LORENA_AVATAR_URL, MODULES, MINIMALIST_LOGO_URL } from '../constants';

interface Props {
    onNavigate: (screen: Screen) => void;
    onPlayVocalize: (vocalize: Vocalize) => void;
}

export const StudentDashboard: React.FC<Props> = ({ onNavigate, onPlayVocalize }) => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || 'Voz';

    const [progress, setProgress] = useState(0);
    const [nextLesson, setNextLesson] = useState<{ id: string, title: string, type: 'topic' | 'vocalize' } | null>(null);

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

    // SEO Title & Meta
    useEffect(() => {
        document.title = "Academia de Música & Tecnologia | Academia VQC";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Acesse seus cursos de música, oratória e instrumentos. A tecnologia do app unida ao seu ensino presencial.');

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

        // 0. Request Firebase Token
        if (user?.id) {
            requestForToken(user.id).then(({ token, error }) => {
                if (error) console.error("FCM Token Error:", error);
                else console.log("FCM Token Updated:", token);
            });
        }

        // Fetch Notifications
        const fetchNotifications = async () => {
            if (!user?.id) return;
            try {
                const { data, error } = await supabase
                    .from('notifications_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (data) {
                    setNotifications(data);
                    // Assuming 'read' status isn't tracked yet, we can check a local storage or add a field later.
                    // For now, let's show count of 'pending' or just latest. 
                    // Or better: any notification created after last 'read_at' timestamp (if we had one).
                    // Simple approach: unread if status is 'pending' OR (better) use a local storage 'last_viewed_notifications'

                    const lastViewed = localStorage.getItem('last_viewed_notifications');
                    const newNotes = data.filter(n => !lastViewed || new Date(n.created_at).getTime() > new Date(lastViewed).getTime());
                    setUnreadCount(newNotes.length);
                }
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        };

        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('public:notifications_history')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications_history', filter: `user_id=eq.${user?.id}` }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [user?.id]);

    const handleOpenNotifications = () => {
        setIsNotificationModalOpen(true);
        setUnreadCount(0);
        localStorage.setItem('last_viewed_notifications', new Date().toISOString());
    };

    return (
        <div className="min-h-screen bg-[#101622] pb-40">
            {/* Header */}
            <header className="pt-8 pb-4 px-6 flex justify-between items-center bg-[#101622]/95 backdrop-blur-sm sticky top-0 z-20 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <h1 className="sr-only">Dashboard do Aluno</h1>
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
                <button
                    onClick={handleOpenNotifications}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white relative hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-rounded">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-3 w-2 h-2 bg-[#FF00BC] rounded-full border border-[#101622] animate-pulse"></span>
                    )}
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
                    className="relative overflow-hidden bg-gradient-to-br from-[#1A202C] to-[#25213b] p-5 rounded-2xl border border-[#6F4CE7]/30 active:scale-[0.98] active:bg-[#6F4CE7]/5 cursor-pointer shadow-lg shadow-vibe-900/10 touch-manipulation"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#6F4CE7] blur-[80px] opacity-10 group-hover:opacity-25 transition-opacity"></div>

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-brand-gradient p-[2px] shrink-0 shadow-lg shadow-vibe-900/40">
                            <div className="w-full h-full bg-[#1A202C] rounded-full flex items-center justify-center overflow-hidden">
                                <img
                                    src={LORENA_AVATAR_URL}
                                    alt="Lorena Bot"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white mb-1">Lorena IA</h2> {/* Changed to h1 */}
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
                <div className="bg-[#1A202C] p-5 rounded-2xl border border-[#0081FF]/20 relative overflow-hidden">
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-full bg-[#0081FF]/5 skew-x-12"></div>

                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                        <img src={MINIMALIST_LOGO_URL} alt="VQC" className="h-5 w-auto object-contain opacity-90" />
                        VQC Studio
                    </h3>
                    <p className="text-sm text-gray-300 mb-4 relative z-10">
                        O estúdio guarda segredos! Acesse a ferramenta essencial para o seu treino diário:
                    </p>

                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <div
                            onClick={() => onNavigate(Screen.STUDIO)}
                            className="bg-[#151A23] p-4 rounded-xl border border-white/5 hover:border-[#0081FF]/30 transition-all shadow-lg shadow-black/20 group cursor-pointer active:scale-95 touch-manipulation flex flex-col items-center text-center"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] mb-3 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-rounded">speed</span>
                            </div>
                            <strong className="text-white text-xs block mb-1 uppercase tracking-wider">Metrônomo VQC</strong>
                            <p className="text-[10px] text-gray-500">Desenvolva sua precisão rítmica com a melhor ferramenta de estudo.</p>
                        </div>
                        <div
                            onClick={() => onNavigate(Screen.PROFILE)}
                            className="bg-[#151A23]/50 p-4 rounded-xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-60 cursor-pointer hover:border-white/20 active:scale-95 transition-all touch-manipulation"
                        >
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

            {/* Notification Modal */}
            {isNotificationModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNotificationModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#1A202C] rounded-t-[32px] sm:rounded-[32px] p-6 animate-in slide-in-from-bottom-10 duration-300 border border-white/10 max-h-[80vh] flex flex-col">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 sm:hidden"></div>

                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <span className="material-symbols-rounded text-[#0081FF]">notifications</span>
                                Notificações
                            </h3>
                            <button onClick={() => setIsNotificationModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 space-y-3 px-2 pb-4">
                            {notifications.length > 0 ? (
                                notifications.map((note) => (
                                    <div key={note.id} className="bg-[#101622] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-white text-sm">{note.title}</h4>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(note.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">{note.body}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <span className="material-symbols-rounded text-4xl mb-2 opacity-50">notifications_off</span>
                                    <p className="text-sm">Nenhuma notificação por enquanto.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
