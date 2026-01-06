import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

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
        const { query, user_id } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Identificação da Intenção e Busca de Contexto
        let contextData: any = {}
        let strategicContext = ""

        const lowerQuery = query.toLowerCase()

        if (lowerQuery.includes("agenda") || lowerQuery.includes("semana") || lowerQuery.includes("aula")) {
            const { data } = await supabase.from('agenda_semana').select('*')
            contextData.agenda = data
            strategicContext += `\nCONTEXTO AGENDA: Temos ${data?.length || 0} aulas agendadas. Analise horários nobres e identifique possíveis brechas para novos alunos.`
        }

        if (lowerQuery.includes("financeiro") || lowerQuery.includes("previsão") || lowerQuery.includes("dinheiro") || lowerQuery.includes("receita")) {
            const { data } = await supabase.from('dashboard_financeiro').select('*').single()
            contextData.financeiro = data
            strategicContext += `\nCONTEXTO FINANCEIRO: Total de alunos ativos: ${data?.total_alunos_ativos}. Receita prevista: R$ ${data?.previsao_receita_mensal}. Inadimplentes: ${data?.alunos_inadimplentes}. Foque na saúde financeira e metas de crescimento.`
        }

        if (lowerQuery.includes("marketing") || lowerQuery.includes("postagem") || lowerQuery.includes("instagram") || lowerQuery.includes("divulgar")) {
            const { data } = await supabase.from('alunos').select('name, instrumento').limit(5)
            contextData.insights_alunos = data
            strategicContext += `\nCONTEXTO MARKETING: Aqui estão alguns alunos recentes para usar como prova social: ${JSON.stringify(data)}.`
        }

        // 2. Configuração do System Prompt com as 5 Dicas do Usuário
        const systemPrompt = `
Você é a **Lorena IA (Brain Mode)**, a parceira estratégica e parceira intelectual do Will na Academia Voz Que Conquista.
Seu objetivo é ajudar na gestão e no crescimento da escola, usando dados reais.

**DIRETRIZES DE MARKETING E GESTÃO:**
1. Priorize o canal "Will Make Songs" (IA + Toque Humano).
2. Sugira postagens que mostrem o progresso dos alunos da Academia Lorena Pimentel (Prova Social).
3. Use gatilhos mentais de Autoridade e Prova Social em todas as estratégias.
4. Se houver horários vagos na agenda (verifique contextData se disponível), sugira um CTA (Call to Action) específico para moradores de Lavras-MG.
5. Mantenha o tom profissional em educação musical, desafiando o Will a ser mais constante nas redes.

**DADOS DO MOMENTO:**
${strategicContext}

**PERSONALIDADE:**
- Parceira Intelectual: Direta, técnica, analítica e encorajadora.
- Fale como uma co-fundadora da academia.
- Termine sempre com uma "Ação de Comando".
`

        // 3. Chamada ao Gemini
        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) throw new Error("GEMINI_API_KEY não configurada")

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Pergunta do Will: ${query}` }
        ])

        const answer = result.response.text()

        return new Response(JSON.stringify({
            answer,
            contextUsed: contextData
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
