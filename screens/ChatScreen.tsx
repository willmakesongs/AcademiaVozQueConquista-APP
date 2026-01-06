
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from '../contexts/AuthContext';
import { MODULES, LORENA_AVATAR_URL } from '../constants';
import { supabase } from '../lib/supabaseClient';

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

// Tarefas iniciais (Mock do contexto do aluno)
const STUDENT_TASKS_CONTEXT = [
    { id: 1, title: 'Aquecimento Matinal', status: 'completed' },
    { id: 2, title: 'Técnica de Respiração (Módulo 3)', status: 'pending' },
    { id: 3, title: 'Repertório: Let It Be', status: 'pending' }
];

// Variáveis globais para persistência
let cachedMessages: Message[] | null = null;
let cachedUserId: string | null = null;

export const ChatScreen: React.FC<Props> = ({ onBack }) => {
    const { user, visitorTimeRemaining } = useAuth();
    const isTimeUp = visitorTimeRemaining !== null && visitorTimeRemaining <= 0;

    // State para a Chave de API
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [configInput, setConfigInput] = useState('');

    // Inicializa mensagens do cache
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
    const chatSessionRef = useRef<any | null>(null);

    // Verifica e carrega a Chave de API
    useEffect(() => {
        const checkKey = () => {
            // 1. Tenta pegar do ambiente (Vercel/env)
            // No Vite, as variáveis do Vercel mapeadas no vite.config.ts ficam em process.env
            const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

            // Verifica se é uma chave válida
            if (envKey && envKey.length > 20 && !envKey.includes('PLACEHOLDER')) {
                console.log("Lorena IA: Usando Chave Mestra do Ambiente.");
                setApiKey(envKey);
                setShowConfig(false);
                return;
            }

            // 2. Tenta pegar do LocalStorage (Caso o admin queira trocar)
            const localKey = localStorage.getItem('gemini_api_key');
            if (localKey) {
                setApiKey(localKey);
                setShowConfig(false);
                return;
            }

            // 3. Se não tiver chave em NENHUM lugar, mostra tela de configuração
            setShowConfig(true);
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

    // Inicializa Chat (Apenas quando tiver chave)
    useEffect(() => {
        if (!apiKey) return;

        const initChat = async () => {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);

                const systemPrompt = `
            Você é a **Lorena Pimentel IA**, a mentora virtual da academia "Voz Que Conquista".
            
            **Sua Personalidade:**
            - **Tom:** Profissional, Parceira Intelectual e Especialista em Alta Performance.
            - Fuja do genérico. Seja direta, técnica e encorajadora sem ser infantil.
            - Use emojis de música (✨, 🎤, 🎶) com moderação e elegância.
            - Fale como uma mentora de executivos e artistas de elite: clara, sóbria e altamente capacitada.

            **Estrutura de Feedback (Critique Style):**
            Sempre que o aluno falar sobre concluir uma prática ou exercício, forneça uma análise seguindo estes pilares:
            1. **Checklist de Clareza:** Avalie se a articulação das consoantes foi precisa.
            2. **Gestão de Tensão:** Alerte sobre a Arquitetura Corporal (ombros, queixo, coluna de ar).
            3. **Reforço de Autoridade:** Enfatize que a voz deve ser firme e o aluno NUNCA deve pedir desculpas por ocupar o espaço.

            **Formatação de Resposta:**
            - **Letras de Música:** Se o aluno pedir uma letra, apresente-a de forma limpa, com espaçamento entre as estrofes. Não coloque links no meio da letra.
            - **Links:** Se usar a ferramenta de busca, NÃO liste as URLs no texto. O sistema exibe cards automaticamente.
            
            **Seu Conhecimento:**
            Módulos: ${JSON.stringify(MODULES.map(m => m.title))}
            Aluno: ${user?.name}. Tarefas: ${JSON.stringify(STUDENT_TASKS_CONTEXT)}.

            **Regra de Ouro:**
            Termine sempre com um reforço de autoridade ou uma ação prática de comando.
            `;

                const model = genAI.getGenerativeModel({
                    model: "gemini-3-flash-preview",
                    systemInstruction: systemPrompt
                });

                const history = messages
                    .filter(m => m.id !== 'welcome' && !m.text.includes("Minha conexão falhou") && !m.text.includes("Erro Técnico"))
                    .map(m => ({
                        role: m.role,
                        parts: [{ text: m.text }]
                    }));

                console.log("Lorena IA: Iniciando com gemini-3-flash-preview...");

                chatSessionRef.current = model.startChat({
                    history: history
                });
            } catch (e) {
                console.error("Erro ao inicializar chat:", e);
            }
        };

        initChat();
    }, [apiKey]); // Recria se a chave mudar

    const handleSaveKey = () => {
        if (!configInput.trim() || configInput.length < 20) {
            alert("Por favor, insira uma chave API válida.");
            return;
        }
        localStorage.setItem('gemini_api_key', configInput.trim());
        setApiKey(configInput.trim());
        setShowConfig(false);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        // Sem verificação de apiKey local - usaremos a Edge Function

        if (!chatSessionRef.current) {
            // Re-inicialização de segurança se a sessão foi perdida
            const systemPrompt = `
            Você é a **Lorena Pimentel IA**, a mentora virtual da academia "Voz Que Conquista".
            Seu interlocutor atual chama-se **${user?.name || 'Voz'}**. Trate-o sempre pelo nome.
            
            **Sua Personalidade:**
            - **Tom:** Profissional, Parceira Intelectual e Especialista em Alta Performance.
            - Fuja do genérico. Seja direta, técnica e encorajadora.
            - Use emojis de música (✨, 🎤, 🎶) com elegância.
            - Fale como uma mentora de elite: clara e sóbria.

            **Estrutura de Feedback:**
            Sempre que o aluno(**${user?.name || 'Voz'}**) falar sobre concluir uma prática, avalie:
            1. **Clareza:** Articulação das consoantes.
            2. **Tensão:** Arquitetura Corporal.
            3. **Autoridade:** A voz deve ser firme.

            **Formatação:**
            - **Letras:** Sem links no meio.
            - **Links:** O sistema exibe cards automaticamente. NÃO liste URLs.
            
            **Seu Conhecimento:**
            Módulos: ${JSON.stringify(MODULES.map(m => m.title))}
            Aluno: ${user?.name}. Tarefas: ${JSON.stringify(STUDENT_TASKS_CONTEXT)}.

            **Regra de Ouro:**
            Termine sempre com um reforço de autoridade ou uma ação prática de comando para o **${user?.name || 'Voz'}**.
            `;

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview", systemInstruction: systemPrompt });
            chatSessionRef.current = model.startChat({});
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputText
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
            // CÉREBRO UNIFICADO: Todas as mensagens passam pela Edge Function agora
            // A função decide se é Brain Mode ou Mentor Mode e gerencia a chave internamente no servidor.
            const { data, error } = await supabase.functions.invoke('lorena-ai-brain', {
                body: {
                    query: userMsg.text,
                    user_id: user?.id,
                    history: messages.slice(-5) // Passa contexto recente
                }
            });

            if (error) throw error;

            setMessages(prev => prev.map(m =>
                m.id === botMsgId ? { ...m, text: data.answer, isLoading: false } : m
            ));

        } catch (error: any) {
            console.error("Erro no chat:", error);
            setMessages(prev => prev.map(m =>
                m.id === botMsgId ? {
                    ...m,
                    text: "Ops, minha conexão com o servidor falhou momentaneamente. Tente enviar novamente! 🔌✨",
                    isLoading: false,
                    isError: true
                } : m
            ));
        } finally {
            setIsTyping(false);
        }
    };
    return (
        <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="pt-8 px-6 pb-4 bg-[#101622]/95 backdrop-blur-sm z-20 border-b border-white/5 flex items-center gap-4 shadow-lg shadow-purple-900/10">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        Lorena Pimentel
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </h1>
                    <p className="text-xs text-[#FF00BC] font-medium">Mentora IA • Voz Que Conquista</p>
                </div>
            </div>

            {/* Chat Area */}
            < div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar" ref={scrollRef} >
                {
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div
                                className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed relative ${msg.role === 'user'
                                    ? 'bg-[#1A202C] text-white rounded-tr-none border border-white/10'
                                    : 'bg-gradient-to-br from-[#2D3748] to-[#1A202C] text-gray-100 rounded-tl-none border border-white/5 shadow-md'
                                    }`}
                            >
                                {/* Renderiza Markdown simplificado (quebras de linha) */}
                                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                            </div>

                            {/* Renderiza Grounding como CARDS horizontais abaixo da mensagem */}
                            {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                                <div className="w-full max-w-[90%] mt-3 pl-2 overflow-x-auto hide-scrollbar">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-1">
                                        <span className="material-symbols-rounded text-xs">manage_search</span>
                                        Sugestões & Referências
                                    </p>
                                    <div className="flex gap-3 pb-2">
                                        {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => (
                                            chunk.web?.uri && (
                                                <a
                                                    key={idx}
                                                    href={chunk.web.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="min-w-[200px] max-w-[200px] bg-[#101622] border border-white/10 rounded-xl p-3 hover:border-[#0081FF] transition-colors flex flex-col gap-2 group"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                                            <span className="material-symbols-rounded text-xs">public</span>
                                                        </div>
                                                        <span className="material-symbols-rounded text-xs text-gray-600 -rotate-45">arrow_forward</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-300 line-clamp-2 leading-tight group-hover:text-[#0081FF] transition-colors">
                                                        {chunk.web.title || "Referência Externa"}
                                                    </span>
                                                </a>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                }

                {
                    isTyping && messages[messages.length - 1]?.text === '' && (
                        <div className="flex justify-start">
                            <div className="bg-[#1A202C] p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center w-16 h-10 border border-white/5">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    )
                }

                <div className="h-4"></div>
            </div >

            {/* Quick Actions (Chips) */}
            {
                !isTyping && messages.length < 4 && (
                    <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                        <button onClick={() => setInputText("O que tenho pra treinar hoje?")} className="whitespace-nowrap px-4 py-2 rounded-full bg-[#1A202C] border border-white/10 text-xs text-gray-300 hover:text-white hover:border-[#FF00BC]/50 transition-colors">
                            📅 Minha Rotina
                        </button>
                        <button onClick={() => setInputText("Letra de Queen - Love of my Life")} className="whitespace-nowrap px-4 py-2 rounded-full bg-[#1A202C] border border-white/10 text-xs text-gray-300 hover:text-white hover:border-[#FF00BC]/50 transition-colors">
                            🎵 Letra de Música
                        </button>
                        <button onClick={() => setInputText("Estou com a garganta arranhando")} className="whitespace-nowrap px-4 py-2 rounded-full bg-[#1A202C] border border-white/10 text-xs text-gray-300 hover:text-white hover:border-[#FF00BC]/50 transition-colors">
                            🚑 SOS Voz
                        </button>
                    </div>
                )
            }

            {/* Visitor/Trial Limit Overlay */}
            {
                isTimeUp && (
                    <div className="absolute inset-0 bg-[#101622]/80 backdrop-blur-sm z-50 flex items-center justify-center p-8 text-center">
                        <div className="bg-[#1A202C] border border-white/10 rounded-3xl p-8 max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-rounded text-4xl text-red-500">lock_clock</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Tempo Expirado!</h3>
                            <p className="text-sm text-gray-400 mb-6">Seu tempo de teste da Lorena IA acabou. Para continuar conversando e ter acesso a todos os módulos, torne-se um aluno oficial!</p>
                            <button
                                onClick={onBack}
                                className="w-full h-12 bg-[#0081FF] hover:bg-[#006bd1] text-white font-bold rounded-xl transition-all"
                            >
                                Voltar ao Início
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Input Area */}
            <div className={`p-4 bg-[#101622] border-t border-white/5 pb-24 ${isTimeUp ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex gap-2 items-end bg-[#1A202C] p-2 rounded-2xl border border-white/10 focus-within:border-[#6F4CE7] transition-colors shadow-lg">
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
                    A IA pode cometer erros. Verifique informações importantes.
                </p>
            </div>
        </div >
    );
};
