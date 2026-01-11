import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { MODULES, LORENA_AVATAR_URL, INITIAL_TASKS } from '../constants';
import { Task } from '../types';

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

    // Estado da API Key
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [checkingKey, setCheckingKey] = useState(true);
    const [envApiKey, setEnvApiKey] = useState<string | null>(null);

    // Inicializa mensagens
    const [messages, setMessages] = useState<Message[]>(() => {
        if (cachedMessages && cachedUserId === user?.id) {
            return cachedMessages;
        }
        return [{
            id: 'welcome',
            role: 'model',
            text: `Olá, ${user?.name || 'Voz'}! 🎶✨ Eu sou a Lorena IA. Como posso ajudar a brilhar sua voz hoje? \n\nPosso sugerir exercícios, tirar dúvidas do método ou encontrar um karaokê pra você treinar!`
        }];
    });

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const chatSessionRef = useRef<Chat | null>(null);

    // 1. VERIFICAÇÃO DE API KEY ROBUSTA
    useEffect(() => {
        const checkKey = async () => {
            setCheckingKey(true);
            try {
                // Tenta obter via process.env (configurado no vite.config.ts)
                const key = process.env.API_KEY || process.env.GEMINI_API_KEY;

                if (key && key.length > 10 && !key.includes("PLACEHOLDER")) {
                    setEnvApiKey(key);
                    setApiKeyReady(true);
                    setTimeout(() => initChat(key), 100);
                } else {
                    setApiKeyReady(false);
                }
            } catch (error) {
                console.error("Erro na verificação da chave:", error);
                setApiKeyReady(false);
            } finally {
                setCheckingKey(false);
            }
        };
        checkKey();
    }, []);

    // Sincroniza cache
    useEffect(() => {
        cachedMessages = messages;
        cachedUserId = user?.id || null;
    }, [messages, user]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isTyping]);

    const initChat = async (key?: string) => {
        try {
            const apiKey = key || envApiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey) return;

            const ai = new GoogleGenAI({ apiKey: apiKey });

            // BUSCA CONTEXTO DA ROTINA DINAMICAMENTE
            let currentTasks = INITIAL_TASKS;
            try {
                const saved = localStorage.getItem('vocalizes_routine_tasks');
                if (saved) {
                    currentTasks = JSON.parse(saved);
                }
            } catch (e) {
                console.warn("Falha ao ler rotina para o prompt:", e);
            }

            const systemPrompt = `
        Você é a **Lorena Pimentel IA**, a mentora virtual da academia "Voz Que Conquista".
        
        **Sua Personalidade:**
        - Vibrante, solar, encorajadora e apaixonada por voz.
        - Use emojis de música (✨, 🎤, 🎶), mas sem exagerar.
        - Linguagem natural (pt-BR), como uma professora no WhatsApp.

        **Regras de Resposta:**
        - Se o aluno pedir **Letra de Música**, formate com espaçamento claro entre estrofes.
        - Seja concisa e prática.
        - SEMPRE use o contexto da rotina do aluno para dar feedbacks personalizados.
        
        **Contexto do Aluno:**
        Nome: ${user?.name || 'Aluno'}.
        Módulos Disponíveis: ${MODULES.map(m => m.title).join(', ')}.
        Tarefas da Rotina Atual: ${JSON.stringify(currentTasks)}.
        `;

            const history = messages
                .filter(m => m.id !== 'welcome' && !m.isLoading && m.text && m.text.trim() !== "" && !m.text.includes("Minha conexão falhou"))
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            // MODELO ATUALIZADO: gemini-3-flash-preview
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: systemPrompt,
                },
                history: history
            });

        } catch (e) {
            console.error("Falha ao inicializar sessão de chat:", e);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        if (!chatSessionRef.current) {
            await initChat(envApiKey || undefined);
        }

        if (!chatSessionRef.current) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "⚠️ Não consegui conectar com a Lorena IA. Verifique sua conexão ou a chave API."
            }]);
            return;
        }

        const userText = inputText;
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        const botMsgId = (Date.now() + 1).toString();
        const botPlaceholder: Message = {
            id: botMsgId,
            role: 'model',
            text: '',
            isLoading: true
        };
        setMessages(prev => [...prev, botPlaceholder]);

        try {
            const resultStream = await chatSessionRef.current.sendMessageStream({ message: userText });

            let accumulatedText = '';
            for await (const chunk of resultStream) {
                const chunkText = chunk.text || '';
                accumulatedText += chunkText;

                setMessages(prev => {
                    const newMsgs = [...prev];
                    const targetIndex = newMsgs.findIndex(m => m.id === botMsgId);
                    if (targetIndex !== -1) {
                        newMsgs[targetIndex] = {
                            ...newMsgs[targetIndex],
                            text: accumulatedText,
                            isLoading: false
                        };
                    }
                    return newMsgs;
                });
            }
        } catch (error: any) {
            console.error("Erro no envio:", error);

            let errorMsg = "Ops! Tive um problema de conexão. Poderia repetir? 🔄";
            const errStr = error.toString();

            if (errStr.includes("404") || errStr.includes("not found")) {
                errorMsg = "⚠️ Modelo em manutenção. Tente novamente em breve.";
            } else if (errStr.includes("API key") || errStr.includes("403")) {
                errorMsg = "⚠️ Erro de Autenticação: Chave API inválida.";
            } else if (errStr.includes("429") || errStr.includes("quota")) {
                errorMsg = "⏳ A Lorena está muito ocupada! Aguarde 10 segundos e tente novamente.";
            }

            setMessages(prev => {
                const clean = prev.filter(m => m.id !== botMsgId);
                return [...clean, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: errorMsg
                }];
            });

            chatSessionRef.current = null;
        } finally {
            setIsTyping(false);
        }
    };

    if (!checkingKey && !apiKeyReady) {
        return (
            <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden text-center p-8">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-red-500/20">
                    <span className="material-symbols-rounded text-5xl text-red-500">vpn_key_off</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Chave API Necessária</h2>
                <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
                    Certifique-se de que a variável de ambiente <code>API_KEY</code> está configurada corretamente no seu projeto.
                </p>
                <button onClick={onBack} className="w-full py-4 rounded-xl bg-white/5 text-white font-bold border border-white/10">
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden">
            <div className="pt-8 px-6 pb-4 bg-[#101622]/95 backdrop-blur-sm z-20 border-b border-white/5 flex items-center gap-4">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        Lorena Pimentel
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
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
                    <button onClick={handleSendMessage} disabled={!inputText.trim() || isTyping} className={`w-10 h-10 rounded-xl flex items-center justify-center ${inputText.trim() ? 'bg-[#0081FF] text-white shadow-lg' : 'bg-white/5 text-gray-600'}`}>
                        <span className="material-symbols-rounded">send</span>
                    </button>
                </div>
                <p className="text-[10px] text-center text-gray-600 mt-2">Lorena IA pode cometer erros.</p>
            </div>
        </div>
    );
};
