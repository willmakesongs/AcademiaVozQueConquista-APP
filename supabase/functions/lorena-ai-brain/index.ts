import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { query, user_id, history } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Verificar Perfil e Cargo do Usuário
        let userRole = 'student';
        let userName = 'Voz';

        if (user_id) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, name')
                .eq('id', user_id)
                .single();

            if (!profileError && profile) {
                userRole = profile.role; // 'admin', 'teacher', 'student'
                userName = profile.name || 'Voz';
            }
        }

        const isAdmin = userRole === 'admin' || userRole === 'teacher';

        // 2. Identificação de Intenção (Brain Mode vs Mentor Mode)
        let mode = 'mentor';
        let contextData: any = {};
        let strategicContext = "";

        const lowerQuery = query.toLowerCase();
        const strategyKeywords = [
            "agenda", "semana", "aula",
            "financeiro", "previsão", "dinheiro", "receita", "faturamento",
            "marketing", "postagem", "instagram", "divulgar",
            "aluno", "matrícula", "ativos", "cancelados"
        ];

        const isStrategicQuery = strategyKeywords.some(k => lowerQuery.includes(k));

        // Lógica de Seleção de Modo
        if (isAdmin && isStrategicQuery) {
            mode = 'brain';

            // Coleta de Dados Estratégicos (apenas se for admin)
            if (lowerQuery.includes("agenda") || lowerQuery.includes("semana") || lowerQuery.includes("aula")) {
                const { data } = await supabase.from('agenda_semana').select('*');
                contextData.agenda = data;
                strategicContext += `\nCONTEXTO AGENDA: Temos ${data?.length || 0} aulas agendadas. Detalhes: ${JSON.stringify(data)}. Analise horários e sugira otimizações.`;
            }

            if (lowerQuery.includes("financeiro") || lowerQuery.includes("previsão") || lowerQuery.includes("dinheiro") || lowerQuery.includes("receita") || lowerQuery.includes("faturamento")) {
                const { data } = await supabase.from('dashboard_financeiro').select('*').single();
                contextData.financeiro = data;
                strategicContext += `\nCONTEXTO FINANCEIRO: Total de alunos ativos: ${data?.total_alunos_ativos}. Receita prevista: R$ ${data?.previsao_receita_mensal}. Inadimplentes: ${data?.alunos_inadimplentes}.`;
            }

            if (lowerQuery.includes("marketing") || lowerQuery.includes("postagem") || lowerQuery.includes("instagram") || lowerQuery.includes("divulgar")) {
                const { data } = await supabase.from('alunos').select('name, instrumento').limit(5);
                contextData.insights_alunos = data;
                strategicContext += `\nCONTEXTO MARKETING: Alunos recentes para prova social: ${JSON.stringify(data)}.`;
            }

            if (lowerQuery.includes("aluno") || lowerQuery.includes("matricula") || lowerQuery.includes("ativos")) {
                const { data: totalAlunos } = await supabase.from('alunos').select('count', { count: 'exact' });
                strategicContext += `\nCONTEXTO GERAL: Total de alunos na base: ${totalAlunos?.count || 'N/A'}.`;
            }

        } else {
            mode = 'mentor';
        }

        // 3. Definição do System Prompt
        let systemPrompt = "";

        if (mode === 'brain') {
            systemPrompt = `
Você é a **Lorena IA (Brain Mode)**, a parceira estratégica e co-fundadora da Academia Voz Que Conquista.
Seu interlocutor é **${userName}** (Gestor).

**OBJETIVO:**
Ajudar na gestão, crescimento e estratégia da escola baseada nos dados reais fornecidos.

**DIRETRIZES:**
1. Seja direta, técnica e executiva.
2. Use os dados fornecidos em "DADOS DO MOMENTO" para embasar suas respostas.
3. Se faltarem dados, dê conselhos gerais de gestão escolar.
4. Mantenha o tom profissional e focado em resultados.

**DADOS DO MOMENTO:**
${strategicContext}
`;
        } else {
            // MENTOR MODE (Padrão para alunos e dúvidas técnicas)
            systemPrompt = `
Você é a **Lorena Pimentel IA**, a mentora virtual da academia "Voz Que Conquista".
Seu interlocutor chama-se **${userName}**. Trate-o sempre pelo nome.

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
Termine sempre com um reforço de autoridade ou uma ação prática de comando para o **${userName}**.
`;
        }

        // 4. Chamada ao Gemini
        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no servidor.")

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        // Formatação do Histórico para o Gemini API
        // O formato esperado é { role: "user" | "model", parts: [{ text: "..." }] }
        let chatHistory = [];
        if (history && Array.isArray(history)) {
            chatHistory = history
                .filter((m: any) => m.text && !m.isError) // Remove mensagens de erro ou vazias
                .map((m: any) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                }));
        }

        const chat = model.startChat({
            history: chatHistory,
            systemInstruction: systemPrompt
        });

        const result = await chat.sendMessage(query);
        const answer = result.response.text();

        return new Response(JSON.stringify({
            answer,
            mode,
            contextUsed: mode === 'brain' ? contextData : null
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error: any) {
        console.error("Erro na Edge Function:", error.message);
        return new Response(JSON.stringify({
            error: error.message,
            details: "Erro interno no processamento da IA."
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
