
import React, { useState, useRef, useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { MODULES, LORENA_AVATAR_URL } from '../constants';
import { GoogleGenerativeAI } from "@google/generative-ai";

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


    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

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
            // Lógica Cliente-Side (Revertido)
            const apiKey = process.env.GEMINI_API_KEY || '';
            if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
                throw new Error("Chave de API (GEMINI_API_KEY) não configurada no .env.local");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const systemPrompt = `
Você é a **Lorena Pimentel IA**, a mentora virtual da academia "Voz Que Conquista".
Seu interlocutor chama-se **${user?.name || 'Aluno'}**. Trate-o sempre pelo nome.

**SUA PERSONALIDADE:**
- **Tom:** Profissional, Parceira Intelectual e Especialista em Alta Performance Vocal.
- Fuja do genérico. Seja direta, técnica e encorajadora sem ser infantil.
- Use emojis de música (✨, 🎤, 🎶) com moderação e elegância.
- **Não invente dados.** Se não souber, diga que precisa consultar o método.

**ESTRUTURA DE FEEDBACK (CRITIQUE STYLE):**
Se o aluno falar sobre prática/exercício:
1. **Clareza:** Articulação precisa.
2. **Tensão:** Monitorar corpo (ombros/queixo).
3. **Autoridade:** Voz firme, sem pedir desculpas.

**REGRA DE OURO:**
Termine sempre com um reforço de autoridade ou uma ação prática de comando para o **${user?.name || 'Aluno'}**.
`;

            // Histórico para o Gemini SDK
            const chatHistory = messages
                .filter(m => !m.isLoading && !m.groundingMetadata) // Filtra metadados e loadings
                .map(m => ({
                    role: m.role === 'model' ? 'model' : 'user',
                    parts: [{ text: m.text }]
                }));

            // O Gemini SDK exige que a primeira mensagem do histórico seja do USUÁRIO.
            // Se a primeira for da "model" (boas-vindas), removemos ela da lista enviada para a API.
            if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
                chatHistory.shift();
            }

            const chat = model.startChat({
                history: chatHistory,
                systemInstruction: {
                    role: 'system',
                    parts: [{ text: systemPrompt }]
                }
            });

            const result = await chat.sendMessage(userMsg.text);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => prev.map(m =>
                m.id === botMsgId ? { ...m, text: text, isLoading: false } : m
            ));

        } catch (error: any) {
            console.error("Erro no chat:", error);
            setMessages(prev => prev.map(m =>
                m.id === botMsgId ? {
                    ...m,
                    text: `Ops, minha conexão falhou! 🔌✨\n(Erro: ${error.message || JSON.stringify(error)})`,
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
