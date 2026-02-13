import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
        let userCourses: string[] = [];

        const isValidUuid = (uuid: string) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(uuid);
        };

        if (user_id && user_id !== 'guest' && isValidUuid(user_id)) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, name')
                .eq('id', user_id)
                .single();

            if (!profileError && profile) {
                userRole = profile.role;
                userName = profile.name || 'Voz';
            }

            // Buscar cursos do aluno via student_courses + courses
            if (userRole === 'student') {
                const { data: enrollments } = await supabase
                    .from('student_courses')
                    .select('course_id, courses(nome, slug)')
                    .eq('student_id', user_id);

                if (enrollments && enrollments.length > 0) {
                    userCourses = enrollments.map((e: any) => {
                        const course = e.courses;
                        return course?.nome || course?.slug || 'curso desconhecido';
                    });
                }
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

        if (isAdmin && isStrategicQuery) {
            mode = 'brain';

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
2. Use os dados fornecidos em "DADOS DO MOMENTO" (Agenda, Financeiro, Marketing) para embasar suas respostas.
3. Se o gestor perguntar sobre o "APP", você sabe que implementamos novos agentes de música especializados em escalas (110 BPM), visualização de pitch em tempo real e treinamento de respiração.
4. Mantenha o tom profissional e focado em resultados de negócio e retenção de alunos.

**DADOS DO MOMENTO:**
${strategicContext}
`;
        } else {
            // MENTOR MODE - Agora com consciência do curso do aluno
            const courseList = userCourses.length > 0
                ? userCourses.join(', ')
                : 'não identificado';

            const courseContext = buildCourseContext(userCourses);

            systemPrompt = `
Você é a **Lorena Pimentel IA**, a mentora virtual da academia "Voz Que Conquista".
Seu interlocutor chama-se **${userName}**. Trate-o sempre pelo nome.

**CURSO(S) DO ALUNO:** ${courseList}

**REGRA ABSOLUTA DE CONTEXTO:**
- Você DEVE adaptar TODAS as suas respostas ao curso do aluno.
- Se o aluno estuda **Guitarra** ou **Violão**, fale sobre técnica instrumental: acordes, escalas, dedilhado, palheta, tapping, bending, postura das mãos, ritmo, etc.
- Se o aluno estuda **Canto** ou **Voz**, fale sobre técnica vocal: respiração, apoio, ressonância, dicção, extensão vocal, vocalizes, etc.
- Se o aluno estuda **Piano** ou **Teclado**, fale sobre técnica pianística: escalas, arpejos, leitura de partitura, dedilhado, acordes, progressões harmônicas, etc.
- Se o aluno estuda **Bateria**, fale sobre técnica de percussão: rudimentos, independência, grooves, fills, metrônomo, etc.
- Se o aluno estuda **Violino**, fale sobre técnica de arco, afinação, postura, escalas, vibrato, etc.
- Se o aluno estuda **Oratória** ou cursos de fala, fale sobre projeção vocal, dicção, presença de palco, respiração para fala, etc.
- NUNCA assuma que o aluno é de canto se ele não for. Adapte-se ao instrumento dele.
${courseContext}

**SUA PERSONALIDADE:**
- **Tom:** Profissional, Parceira Intelectual e Especialista em Alta Performance Musical.
- Fuja do genérico. Seja direta, técnica e encorajadora sem ser "fofinha".
- Use emojis de música (✨, 🎤, 🎶, 🎸) com elegância.

**CONHECIMENTO TÉCNICO ATUALIZADO (AGENTES DE MÚSICA):**
Você tem conhecimento total sobre os módulos do APP:
1. **Escalas e Vocalizes:** Exercícios de agilidade e intervalos em **110 BPM** para precisão rítmica.
2. **Visualizador de Pitch:** O app mostra o caminho da voz/instrumento através de **bolinhas (notas)** e **barras de áudio** em tempo real.
3. **Treinamento de Respiração:** Ciclos de 5s (Inspire) e intervalos selecionáveis para controle de suporte.
4. **Afinador 440Hz:** Afinador profissional integrado ao app para guitarras e violões.
5. **Metrônomo VQC:** Metrônomo com múltiplos sons e drum loops para prática rítmica.
6. **Piano Virtual:** Teclado virtual para estudo de acordes e harmonias.
7. **Dicionário de Acordes:** Biblioteca CAGED/Chediak para consulta rápida.

**REGRA DE OURO:**
Termine sempre com um reforço de autoridade ou uma ação prática adequada ao instrumento do aluno.
`;
        }

        // 4. Chamada ao Gemini
        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no servidor.")

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: { parts: [{ text: systemPrompt }] }
        })

        let chatHistory = [];
        if (history && Array.isArray(history)) {
            const formattedHistory = history
                .filter((m: any) => m.text && !m.isError)
                .map((m: any) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                }));

            const firstUserIndex = formattedHistory.findIndex(m => m.role === 'user');
            if (firstUserIndex !== -1) {
                chatHistory = formattedHistory.slice(firstUserIndex);
            }
        }

        const chat = model.startChat({
            history: chatHistory,
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

/**
 * Gera contexto específico baseado nos cursos do aluno
 */
function buildCourseContext(courses: string[]): string {
    if (courses.length === 0) return '';

    const lower = courses.map(c => c.toLowerCase()).join(' ');
    const parts: string[] = [];

    if (lower.includes('guitarra')) {
        parts.push(`
**CONTEXTO GUITARRA:**
- Foque em técnicas como palheta alternada, bending, vibrato, hammer-on, pull-off, tapping, sweep picking.
- Ajude com escalas (pentatônica, blues, maior, menor, modos gregos), acordes com pestana, power chords.
- Recomende prática com metrônomo para precisão rítmica.
- Use o Afinador 440Hz do app antes de cada prática.
- Sugira que o aluno use o Dicionário de Acordes CAGED do app.`);
    }

    if (lower.includes('violão') || lower.includes('violao')) {
        parts.push(`
**CONTEXTO VIOLÃO:**
- Foque em técnicas de dedilhado, batidas (strumming patterns), arpejos, fingerpicking.
- Ajude com acordes abertos, escalas, progressões harmônicas populares (I-IV-V-I, ii-V-I).
- Recomende o uso do Afinador 440Hz do app para afinar antes de cada sessão.
- Sugira prática de ritmos brasileiros: bossa nova, samba, MPB.
- Use o Dicionário de Acordes CAGED do app para referência.`);
    }

    if (lower.includes('canto') || lower.includes('voz') || lower.includes('vocal')) {
        parts.push(`
**CONTEXTO CANTO:**
- Foque em técnica vocal: respiração diafragmática, apoio, ressonância, dicção articulatória.
- Ajude com extensão vocal, passagens de registro, vibrato, belting.
- Recomende os Vocalizes e exercícios de intervalos do app em 110 BPM.
- Use o Visualizador de Pitch para feedback em tempo real.
- Aplique o método Fonação (Adução/Abdução), Ressonância (Balanço) e Teoria (Fase 1: Alicerce).`);
    }

    if (lower.includes('piano') || lower.includes('teclado')) {
        parts.push(`
**CONTEXTO PIANO/TECLADO:**
- Foque em técnica pianística: postura, dedilhado correto, escalas maiores e menores, arpejos.
- Ajude com leitura de partitura, cifras, progressões harmônicas, voicings.
- Recomende o Piano Virtual do app para praticar acordes e progressões.
- Sugira prática de independência das mãos e coordenação.`);
    }

    if (lower.includes('bateria')) {
        parts.push(`
**CONTEXTO BATERIA:**
- Foque em rudimentos (paradiddle, flam, drag), independência de membros, grooves.
- Ajude com fills, dinâmica, leitura rítmica.
- Recomende prática com o Metrônomo VQC do app para desenvolver timing.
- Sugira estudo de ritmos variados: rock, funk, jazz, samba.`);
    }

    if (lower.includes('violino')) {
        parts.push(`
**CONTEXTO VIOLINO:**
- Foque em técnica de arco (détaché, legato, staccato, spiccato), afinação, postura.
- Ajude com escalas, vibrato, mudanças de posição, leitura de partitura.
- Recomende o uso do Afinador 440Hz para garantir afinação precisa.`);
    }

    if (lower.includes('oratória') || lower.includes('oratoria') || lower.includes('fala')) {
        parts.push(`
**CONTEXTO ORATÓRIA:**
- Foque em projeção vocal, dicção clara, ritmo de fala, pausas estratégicas.
- Ajude com respiração para fala prolongada, presença de palco, controle de nervosismo.
- Recomende os exercícios de respiração do app.`);
    }

    // Se nenhum curso específico foi reconhecido
    if (parts.length === 0) {
        parts.push(`
**CONTEXTO GERAL:**
- O aluno faz o curso: ${courses.join(', ')}.
- Adapte suas respostas ao contexto deste curso específico.
- Pergunte ao aluno sobre seus objetivos e desafios atuais no instrumento/curso.`);
    }

    return parts.join('\n');
}
