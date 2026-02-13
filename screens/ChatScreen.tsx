import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { MODULES, LORENA_AVATAR_URL } from '../constants';

interface Props {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isLoading?: boolean;
    groundingMetadata?: any;
}

// Persistência em memória durante a sessão
let cachedMessages: Message[] | null = null;
let cachedUserId: string | null = null;

export const ChatScreen: React.FC<Props> = ({ onBack }) => {
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>(() => {
        if (cachedMessages && cachedUserId === user?.id) {
            return cachedMessages;
        }

        const isGuest = user?.id === 'guest';
        const welcomeText = isGuest
            ? "Olá! Sou a Lorena IA, sua mentora na Academia Voz Que Conquista. ✨\n\nEstou aqui para te mostrar como podemos transformar sua voz. Mas antes de começarmos, como você gostaria de ser chamado?"
            : `Olá, ${user?.name || 'Voz'}! 🎶✨ Eu sou a Lorena IA, sua mentora na Academia Voz Que Conquista. Como posso te ajudar na sua jornada musical hoje? \n\nPosso sugerir exercícios, tirar dúvidas técnicas ou te ajudar com sua prática!`;

        return [{
            id: 'welcome',
            role: 'model',
            text: welcomeText
        }];
    });

    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Persistência em cache local já está configurada
    useEffect(() => {
        cachedMessages = messages;
        cachedUserId = user?.id || null;
    }, [messages, user]);

    // Auto-scroll fluído
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isThinking]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isThinking) return;

        const userText = inputText;
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsThinking(true);

        const botMsgId = (Date.now() + 1).toString();
        const botPlaceholder: Message = {
            id: botMsgId,
            role: 'model',
            text: '',
            isLoading: true
        };
        setMessages(prev => [...prev, botPlaceholder]);

        try {
            // Chamada para a Edge Function Lorena Brain
            const { data, error } = await supabase.functions.invoke('lorena-ai-brain', {
                body: {
                    query: userText,
                    user_id: user?.id,
                    history: messages.slice(-10) // Envia as últimas 10 mensagens para contexto
                }
            });

            if (error || !data) {
                throw new Error(error?.message || "Falha na resposta da Lorena");
            }

            setMessages(prev => {
                const newMsgs = [...prev];
                const targetIndex = newMsgs.findIndex(m => m.id === botMsgId);
                if (targetIndex !== -1) {
                    newMsgs[targetIndex] = {
                        ...newMsgs[targetIndex],
                        text: data.answer,
                        isLoading: false
                    };
                }
                return newMsgs;
            });

        } catch (error: any) {
            console.error("Erro na Lorena IA:", error);

            let errorMsg = "Ops! Tive um problema de conexão. Poderia repetir? 🔄";
            const errStr = error.toString().toLowerCase();

            if (errStr.includes("404")) {
                errorMsg = "⚠️ Serviço da Lorena em manutenção. Tente novamente em breve.";
            } else if (errStr.includes("api key") || errStr.includes("403")) {
                errorMsg = "⚠️ Erro de Configuração: Chave API não encontrada no servidor.";
            } else if (errStr.includes("quota") || errStr.includes("429")) {
                errorMsg = "⏳ A Lorena está processando muitas dúvidas! Aguarde 10 segundos.";
            }

            setMessages(prev => {
                const clean = prev.filter(m => m.id !== botMsgId);
                return [...clean, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: errorMsg
                }];
            });
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden">
            <div className="pt-8 px-6 pb-4 bg-[#101622]/95 backdrop-blur-sm z-20 border-b border-white/5 flex items-center gap-4">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        Lorena Pimentel
                        <span className="w-2 h-2 rounded-full bg-[#0081FF] animate-pulse"></span>
                    </h1>
                    <p className="text-xs text-[#FF00BC] font-medium">Mentora IA • Voz Que Conquista</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-gradient p-[2px] overflow-hidden">
                    <img src={LORENA_AVATAR_URL} className="w-full h-full object-cover rounded-full" alt="Lorena Bot" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#1A202C] text-white rounded-tr-none border border-white/10' : 'bg-gradient-to-br from-[#2D3748] to-[#1A202C] text-gray-100 rounded-tl-none border border-white/5'}`}>
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                            {msg.isLoading && <span className="inline-block w-1.5 h-4 ml-1 bg-[#FF00BC] animate-pulse align-middle"></span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* PADDING AUMENTADO PARA pb-44 PARA EVITAR SOBREPOSIÇÃO PELO BOTÃO DO MENU */}
            <div className="p-4 bg-[#101622] border-t border-white/5 pb-44">
                <div className="flex gap-2 items-end bg-[#1A202C] p-2 rounded-2xl border border-white/10 focus-within:border-[#6F4CE7] transition-all">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Converse com a Lorena..."
                        className="flex-1 bg-transparent text-white text-sm p-3 max-h-32 min-h-[44px] focus:outline-none resize-none"
                        rows={1}
                    />
                    <button onClick={handleSendMessage} disabled={!inputText.trim() || isThinking} className={`w-10 h-10 rounded-xl flex items-center justify-center ${inputText.trim() ? 'bg-[#0081FF] text-white shadow-lg' : 'bg-white/5 text-gray-600'}`}>
                        <span className="material-symbols-rounded">send</span>
                    </button>
                </div>
                <p className="text-[10px] text-center text-gray-600 mt-2">Lorena IA pode cometer erros.</p>
            </div>
        </div>
    );
};
