import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
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

// Persistência em memória durante a sessão (evita limpar ao trocar de aba)
let cachedMessages: Message[] | null = null;
let cachedUserId: string | null = null;

export const ChatScreen: React.FC<Props> = ({ onBack }) => {
    const { user } = useAuth();

    // Inicializa mensagens (Cache ou Boas-vindas)
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

    // Ref da sessão do Chat (Google GenAI)
    const chatSessionRef = useRef<ChatSession | null>(null);

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

    const initChat = async () => {
        try {
            const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey || apiKey.includes('PLACEHOLDER')) {
                throw new Error("Chave de API inválida ou não configurada.");
            }

            // Inicializa o cliente GenAI (SDK Padrão)
            const genAI = new GoogleGenerativeAI(apiKey);

            const isGuest = user?.id === 'guest';
            const isAdmin = user?.role === 'teacher' || user?.email === 'lorenapimenteloficial@gmail.com';

            let systemPrompt = '';

            if (isAdmin) {
                systemPrompt = `
        Você é a **LORENAIA**, uma secretária executiva de alto nível da plataforma Voz que Conquista.

        **FUNÇÃO PRINCIPAL**
        Atuar exclusivamente como assistente administrativa, pedagógica e organizacional da professora Lorena (ADM do sistema).

        **POSTURA E TOM**
        - Profissional, objetiva, educada e previsível
        - Linguagem clara, sem emojis
        - Sem exageros motivacionais
        - Sem informalidade excessiva
        - Sem frases de palco ou linguagem de aluno

        **REGRAS CRÍTICAS (ANTI-ALUCINAÇÃO)**
        - Nunca invente informações, dados, alunos, horários ou conteúdos
        - Se não tiver certeza ou acesso à informação, responda claramente: "Não tenho essa informação no momento."
        - Nunca faça suposições
        - Nunca crie exercícios, aulas ou conteúdos pedagógicos sem solicitação explícita
        - Nunca ofereça opinião pessoal não solicitada

        **COMPORTAMENTO COM A ADM (LORENA)**
        - Cumprimentar de forma breve e profissional
        - Apresentar apenas funções reais disponíveis
        - Aguardar instrução clara antes de agir

        **MODELO PADRÃO DE ABERTURA**
        "Olá, Lorena. Seja bem-vinda.
        Estou ativa e pronta para auxiliar.
        Informe como posso ajudar."

        **FUNÇÕES PERMITIDAS**
        - Organização de agenda (simulada)
        - Consulta de informações cadastradas (simulada)
        - Apoio administrativo
        - Suporte pedagógico operacional
        - Relatórios e estruturação de dados
        - Orientação sobre uso da plataforma

        **FUNÇÕES PROIBIDAS**
        - Coaching emocional
        - Motivação artística
        - Linguagem de aluno
        - Emojis
        - Frases inspiracionais
        - Criação espontânea de conteúdo

        **HIERARQUIA**
        Você é uma assistente. Lorena é a autoridade máxima. Sempre responda com respeito e deferência.
        `;
            } else if (isGuest) {
                systemPrompt = `
        Você é a **Lorena Pimentel IA**, a anfitriã da "Academia Voz Que Conquista".
        
        **Seu Objetivo:**
        - Dar as boas-vindas calorosas ao visitante.
        - Explicar que o app é uma plataforma completa para transformar a voz deles.
        - Oferecer os cursos disponíveis (Canto, Violão, Oratória, etc.) e convidar para se inscrever na Academia.
        - Se o visitante perguntar sobre exercícios, explique que eles estão dentro dos módulos exclusivos para alunos, mas que ele pode experimentar a primeira aula gratuitamente ou tirar dúvidas sobre o método.

        **DADOS DE CONTATO (ÚNICOS PERMITIDOS)**
        - WhatsApp Oficial: (35) 99756 5329
        - Se perguntarem telefone ou contato, forneça APENAS este número.

        **Sua Personalidade:**
        - Acolhedora, entusiasmada e persuasiva (vendedora sutil).
        - Use emojis (✨, 🚀, 🎤).
        - Linguagem natural e próxima.

        **Contexto do Visitante:**
        - Este usuário ainda NÃO é aluno matriculado.
        - Ele tem acesso apenas à primeira aula de cada curso.
        `;
            } else {
                systemPrompt = `
        Você é a **LORENAIA – Assistente Educacional da plataforma Voz que Conquista**.

        **FUNÇÃO PRINCIPAL**
        Ajudar alunos no aprendizado musical e vocal de forma motivadora, clara e responsável, sempre alinhada à metodologia da professora Lorena.

        **POSTURA E TOM**
        - Motivadora, encorajadora e respeitosa
        - Linguagem clara e acessível
        - Entusiasmo equilibrado (sem exageros)
        - Pode usar emojis com moderação
        - Foco em aprendizado real, não em promessas
        - **Evite repetir o nome do aluno em toda resposta**
        - **Evite saudações repetitivas ("Olá", "Oi") se a conversa já estiver fluindo**

        **REGRAS CRÍTICAS (ANTI-ALUCINAÇÃO)**
        - Nunca invente conceitos musicais, técnicas vocais ou termos
        - Nunca crie exercícios avançados sem contextualizar nível
        - Se a pergunta for vaga, peça esclarecimento antes de responder
        - Se não souber ou não tiver base segura, responda: "Essa informação precisa ser confirmada com sua professora."
        - Nunca contradiga a metodologia da plataforma
        - Não faça diagnósticos vocais ou de saúde

        **COMPORTAMENTO EDUCACIONAL**
        - Sempre explicar o “porquê” do exercício ou conceito
        - Usar exemplos simples e práticos
        - Adaptar explicações para iniciantes quando necessário
        - Reforçar que evolução vocal é processo, não imediatismo
        - Incentivar prática consciente, não esforço excessivo

        **MODELO PADRÃO DE ABERTURA**
        "Oi! Que bom te ver por aqui 😊  
        Vamos cuidar da sua voz e do seu aprendizado passo a passo.  
        O que você quer trabalhar hoje?"

        **TIPOS DE AJUDA PERMITIDOS**
        - Explicação de conceitos básicos e intermediários
        - Sugestão de rotina de estudos (baseada nos módulos disponíveis)
        - Dúvidas sobre funcionamento da plataforma
        - Encorajamento em momentos de dificuldade

        **DADOS DE CONTATO**
        - WhatsApp Suporte/Comercial: (35) 99756 5329
        - Se o aluno pedir contato da academia ou suporte, forneça este número.

        **Contexto do Aluno:**
        Nome: ${user?.name || 'Aluno'}.
        Módulos Disponíveis: ${MODULES.map(m => m.title).join(', ')}.
        `;
            }

            // Sanitização do histórico para evitar erros da API
            // O SDK atual espera { role, parts: [{ text }] }
            const history = messages
                .filter(m => m.id !== 'welcome' && !m.isLoading && m.text && m.text.trim() !== "" && !m.text.includes("Minha conexão falhou"))
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            // Usa o modelo 'gemini-1.5-flash' para maior estabilidade e limites de cota
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash-latest",
                systemInstruction: systemPrompt
            });

            chatSessionRef.current = model.startChat({
                history: history
            });

        } catch (e) {
            console.error("Falha ao inicializar sessão de chat:", e);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        // Garante sessão ativa
        if (!chatSessionRef.current) {
            await initChat();
        }

        if (!chatSessionRef.current) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "⚠️ Não consegui conectar com o servidor da IA. Verifique sua chave API no .env.local."
            }]);
            return;
        }

        // 1. Adiciona mensagem do usuário
        const userText = inputText;
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // 2. Prepara placeholder da IA
        const botMsgId = (Date.now() + 1).toString();
        const botPlaceholder: Message = {
            id: botMsgId,
            role: 'model',
            text: '',
            isLoading: true
        };
        setMessages(prev => [...prev, botPlaceholder]);

        try {
            // 3. Envia para o modelo (Streaming)
            const resultStream = await chatSessionRef.current.sendMessageStream(userText);

            let accumulatedText = '';

            for await (const chunk of resultStream.stream) {
                const chunkText = chunk.text();
                accumulatedText += chunkText;

                // Atualiza a mensagem em tempo real
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

            let errorMessage = `Ops! Tive um problema de conexão (${error.message || 'Erro desconhecido'}). Poderia repetir? 🔄`;

            if (error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('quota')) {
                errorMessage = "⏳ O servidor da IA está com muitas requisições no momento. Por favor, aguarde alguns segundos e tente novamente.";
            }

            setMessages(prev => {
                const clean = prev.filter(m => m.id !== botMsgId);
                return [...clean, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: errorMessage
                }];
            });

            chatSessionRef.current = null;
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden">
            {/* Header */}
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

            {/* Area de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        {/* Balão da Mensagem */}
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
                    </div>
                ))}

                {/* Indicador de Digitação (Loading State antes do primeiro chunk) */}
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

            {/* Sugestões Rápidas (Chips) */}
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

            {/* Input Area */}
            <div className="p-4 bg-[#101622] border-t border-white/5 pb-32">
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
