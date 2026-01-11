import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
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

// Contexto simulado do aluno para a IA
const STUDENT_TASKS_CONTEXT = [
    { id: 1, title: 'Aquecimento Matinal', status: 'completed' },
    { id: 2, title: 'Técnica de Respiração (Módulo 3)', status: 'pending' },
    { id: 3, title: 'Repertório: Let It Be', status: 'pending' }
];

// Persistência em memória durante a sessão
let cachedMessages: Message[] | null = null;
let cachedUserId: string | null = null;

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

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
                // A: Tenta obter via process.env (seguro para browser)
                let key: string | undefined;
                try {
                    key = process.env.API_KEY || process.env.GEMINI_API_KEY;
                } catch (e) {
                    // process not defined in browser without polyfill
                    console.warn("process.env access failed, checking alternatives");
                }

                if (key && key.length > 10 && !key.includes("PLACEHOLDER")) {
                    console.log("Ambiente: Chave API detectada via variáveis.");
                    setEnvApiKey(key);
                    setApiKeyReady(true);
                    setTimeout(() => initChat(key), 100);
                    return;
                }

                // B: Verifica ambiente AI Studio / Project IDX
                if (typeof window !== 'undefined' && window.aistudio) {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    if (hasKey) {
                        setApiKeyReady(true);
                        setTimeout(() => initChat(), 100);
                    } else {
                        setApiKeyReady(false);
                    }
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
            // Inicializa o cliente GenAI com a chave correta
            const apiKey = key || envApiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey) return;

            const ai = new GoogleGenAI({ apiKey: apiKey });

            const systemPrompt = `
        Você é a **Lorena Pimentel IA**, a mentora virtual da academia "Voz Que Conquista".
        
        **Sua Personalidade:**
        - Vibrante, solar, encorajadora e apaixonada por voz.
        - Use emojis de música (✨, 🎤, 🎶), mas sem exagerar.
        - Linguagem natural (pt-BR), como uma professora no WhatsApp.

        **Regras de Resposta:**
        - Se o aluno pedir **Letra de Música**, formate com espaçamento claro entre estrofes.
        - Use as informações do Google Search para enriquecer sua resposta com fatos recentes se necessário.
        - Seja concisa e prática.
        
        **Contexto do Aluno:**
        Nome: ${user?.name || 'Aluno'}.
        Módulos Disponíveis: ${MODULES.map(m => m.title).join(', ')}.
        Tarefas Atuais: ${JSON.stringify(STUDENT_TASKS_CONTEXT)}.
        `;

            const history = messages
                .filter(m => m.id !== 'welcome' && !m.isLoading && m.text && m.text.trim() !== "" && !m.text.includes("Minha conexão falhou"))
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            // MODELO ESTÁVEL: gemini-1.5-flash (Maior cota na conta gratuita)
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-1.5-flash',
                config: {
                    systemInstruction: systemPrompt
                    // Grounding desativado temporariamente para economizar cota (Search Tool)
                },
                history: history
            });

        } catch (e) {
            console.error("Falha ao inicializar sessão de chat:", e);
        }
    };

    const handleSelectKey = async () => {
        if (window.aistudio) {
            try {
                await window.aistudio.openSelectKey();
                setTimeout(() => {
                    setApiKeyReady(true);
                    initChat();
                }, 1000);
            } catch (e) {
                console.error("Erro na seleção de chave:", e);
                alert("Erro ao conectar chave. Tente novamente.");
            }
        } else {
            alert("Ambiente de seleção automática não disponível. Por favor, configure a variável 'API_KEY' no painel da Vercel/Netlify.");
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
                text: "⚠️ Não consegui conectar com o servidor da IA. Verifique sua conexão ou a chave API."
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
            let finalMetadata = null;

            for await (const chunk of resultStream) {
                const chunkText = chunk.text || '';
                accumulatedText += chunkText;

                if (chunk.candidates?.[0]?.groundingMetadata) {
                    finalMetadata = chunk.candidates[0].groundingMetadata;
                }

                setMessages(prev => {
                    const newMsgs = [...prev];
                    const targetIndex = newMsgs.findIndex(m => m.id === botMsgId);
                    if (targetIndex !== -1) {
                        newMsgs[targetIndex] = {
                            ...newMsgs[targetIndex],
                            text: accumulatedText,
                            groundingMetadata: finalMetadata,
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

            // Tratamento de erros específicos
            if (errStr.includes("404") || errStr.includes("not found")) {
                errorMsg = "⚠️ Erro Técnico: O modelo de IA está indisponível ou descontinuado na região atual. Tente recarregar a página.";
            } else if (errStr.includes("API key") || errStr.includes("403")) {
                errorMsg = "⚠️ Erro de Autenticação: Chave API inválida ou não configurada no Vercel/Supabase.";
            } else if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("Quota exceeded")) {
                // Mensagem amigável para erro de cota
                errorMsg = "⏳ Ufa! Recebi muitas mensagens de uma vez e preciso recuperar o fôlego. Aguarde cerca de 30 segundos e tente novamente!";
            } else if (errStr.includes("503") || errStr.includes("overloaded")) {
                errorMsg = "🤯 O servidor da IA está superlotado no momento. Tente novamente em alguns segundos.";
            }

            setMessages(prev => {
                const clean = prev.filter(m => m.id !== botMsgId);
                return [...clean, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: errorMsg
                }];
            });

            // Força recriação da sessão para tentar limpar erros
            chatSessionRef.current = null;
        } finally {
            setIsTyping(false);
        }
    };

    if (!checkingKey && !apiKeyReady) {
        return (
            <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden">
                <div className="pt-8 px-6 pb-4 flex items-center gap-4 z-20">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold text-white">Configuração IA</h1>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 animate-in fade-in zoom-in-95">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                        <span className="material-symbols-rounded text-5xl text-red-500">vpn_key_off</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">Chave API Necessária</h2>
                    <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
                        Para conversar com a Lorena, precisamos conectar ao Google Gemini.
                    </p>

                    {window.aistudio ? (
                        <button
                            onClick={handleSelectKey}
                            className="w-full py-4 rounded-xl bg-brand-gradient text-white font-bold shadow-lg shadow-purple-900/40 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-rounded">login</span>
                            Conectar Google Gemini
                        </button>
                    ) : (
                        <div className="bg-[#1A202C] p-6 rounded-2xl border border-white/10 w-full max-w-sm text-left">
                            <strong className="text-yellow-500 text-sm block mb-2 flex items-center gap-2">
                                <span className="material-symbols-rounded">warning</span>
                                Modo Produção Detectado
                            </strong>
                            <p className="text-xs text-gray-300 leading-relaxed mb-4">
                                Você está acessando o app fora do ambiente de desenvolvimento. É necessário configurar a variável de ambiente:
                            </p>
                            <code className="block bg-black/30 p-3 rounded-lg text-xs font-mono text-[#0081FF] mb-4">
                                API_KEY=sua_chave_aqui
                            </code>
                            <p className="text-[10px] text-gray-500">
                                Configure isso no painel da Vercel (Settings &gt; Environment Variables) e faça o deploy novamente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden">
            <div className="pt-8 px-6 pb-4 bg-[#101622]/95 backdrop-blur-sm z-20 border-b border-white/5 flex items-center gap-4 shadow-lg shadow-purple-900/10">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        Lorena Pimentel
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                    </h1>
                    <p className="text-xs text-[#FF00BC] font-medium">Mentora IA • Voz Que Conquista</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-gradient p-[2px]">
                    <div className="w-full h-full bg-[#101622] rounded-full flex items-center justify-center overflow-hidden relative">
                        <img src={LORENA_AVATAR_URL} className="w-full h-full object-cover" alt="Lorena Bot" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div
                            className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed relative shadow-md ${msg.role === 'user'
                                    ? 'bg-[#1A202C] text-white rounded-tr-none border border-white/10'
                                    : 'bg-gradient-to-br from-[#2D3748] to-[#1A202C] text-gray-100 rounded-tl-none border border-white/5'
                                }`}
                        >
                            <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                            {msg.isLoading && (
                                <span className="inline-block w-1.5 h-4 ml-1 bg-[#FF00BC] animate-pulse align-middle"></span>
                            )}
                        </div>

                        {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                            <div className="w-full max-w-[90%] mt-3 pl-2 overflow-x-auto hide-scrollbar">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-1">
                                    <span className="material-symbols-rounded text-xs">manage_search</span>
                                    Referências Encontradas
                                </p>
                                <div className="flex gap-3 pb-2">
                                    {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                                        if (!chunk.web?.uri) return null;
                                        return (
                                            <a
                                                key={idx}
                                                href={chunk.web.uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="min-w-[200px] max-w-[200px] bg-[#101622] border border-white/10 rounded-xl p-3 hover:border-[#0081FF] transition-all hover:-translate-y-1 flex flex-col gap-2 group shadow-lg"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                                        <span className="material-symbols-rounded text-xs">public</span>
                                                    </div>
                                                    <span className="material-symbols-rounded text-xs text-gray-600 -rotate-45 group-hover:text-[#0081FF]">arrow_forward</span>
                                                </div>
                                                <span className="text-xs font-bold text-gray-300 line-clamp-2 leading-tight group-hover:text-[#0081FF] transition-colors">
                                                    {chunk.web.title || "Link Externo"}
                                                </span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && messages[messages.length - 1]?.text === '' && (
                    <div className="flex justify-start animate-in fade-in">
                        <div className="bg-[#1A202C] p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center w-16 h-10 border border-white/5">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}

                <div className="h-4"></div>
            </div>

            {!isTyping && messages.length < 4 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                    <button onClick={() => setInputText("O que tenho pra treinar hoje?")} className="whitespace-nowrap px-4 py-2 rounded-full bg-[#1A202C] border border-white/10 text-xs text-gray-300 hover:text-white hover:border-[#FF00BC]/50 transition-colors">
                        📅 Minha Rotina
                    </button>
                    <button onClick={() => setInputText("Letra de Queen - Love of my Life")} className="whitespace-nowrap px-4 py-2 rounded-full bg-[#1A202C] border border-white/10 text-xs text-gray-300 hover:text-white hover:border-[#FF00BC]/50 transition-colors">
                        🎵 Letra de Música
                    </button>
                    <button onClick={() => setInputText("Minha garganta está arranhando, o que fazer?")} className="whitespace-nowrap px-4 py-2 rounded-full bg-[#1A202C] border border-white/10 text-xs text-gray-300 hover:text-white hover:border-[#FF00BC]/50 transition-colors">
                        🚑 SOS Voz
                    </button>
                </div>
            )}

            <div className="p-4 bg-[#101622] border-t border-white/5 pb-safe-bottom">
                <div className="flex gap-2 items-end bg-[#1A202C] p-2 rounded-2xl border border-white/10 focus-within:border-[#6F4CE7] focus-within:ring-1 focus-within:ring-[#6F4CE7]/30 transition-all shadow-lg">
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
                        className="flex-1 bg-transparent text-white text-sm p-3 max-h-32 min-h-[44px] focus:outline-none resize-none hide-scrollbar placeholder-gray-500"
                        rows={1}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isTyping}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${inputText.trim()
                                ? 'bg-[#0081FF] text-white shadow-lg transform active:scale-95'
                                : 'bg-white/5 text-gray-600'
                            }`}
                    >
                        <span className="material-symbols-rounded">send</span>
                    </button>
                </div>
                <p className="text-[10px] text-center text-gray-600 mt-2">
                    Lorena IA pode cometer erros. Verifique informações importantes.
                </p>
            </div>
        </div>
    );
};
