# 🧠 Lorena IA - Guia de Manutenção e Troubleshooting

Este documento serve como a **Fonte Única de Verdade** para manter a Lorena IA operacional. Estes ajustes foram validados após múltiplas falhas de conexão em 2026.

## 🚀 Requisitos Críticos (Proibido Alterar)

Se estas configurações forem alteradas, o chat retornará erro "Ops! Problema de conexão".

### 1. Modelo de IA (Google Gemini)
O ambiente Supabase/API Key do projeto possui uma restrição rigorosa de modelos.
- **Modelo Correto:** `gemini-3-flash-preview`
- **Por que?** Modelos padrão como `gemini-1.5-flash` ou `gemini-pro` retornam erro 404 ou 401 nesta região/chave.

### 2. Estrutura do Histórico (History)
O SDK do Google Gemini exige uma sequência lógica estrita:
- **Regra:** O histórico **DEVE** começar com uma mensagem do `user`.
- **Implementação:** No arquivo `index.ts` da Edge Function, existe uma lógica que filtra o histórico para encontrar a primeira mensagem do usuário. Nunca remova esse `slice`.

### 3. Acesso de Visitante (Guest Mode)
Para que usuários deslogados consigam falar com a Lorena:
- **JWT:** A Edge Function deve ser implantada com `--no-verify-jwt`.
- **UUID Bypass:** O `user_id` enviado por visitantes é a string `'guest'`. A função verifica se o ID é um UUID válido antes de tentar consultar a tabela `profiles` para evitar erro 500 (Data malformada).

---

## 🛠️ Como Atualizar a Lorena

Sempre que fizer alterações na personalidade ou lógica:

1. **Local:** Modifique `supabase/functions/lorena-ai-brain/index.ts`.
2. **Deploy:** 
   ```bash
   npx supabase functions deploy lorena-ai-brain --no-verify-jwt
   ```
3. **Verificação:** Teste sempre via "Entrar como Visitante" no app local (Porta 3000).

## 📝 Histórico de Persona
A Lorena não é um chatbot genérico. Ela é uma **Mentora de Alta Performance**. 
- **Keywords obrigatórias:** 110 BPM, Ciclos de 5s, Apoio Abdominal, Visualizador de Pitch, Alicerce (Fase 1).
- **Tom:** Executivo, parceiro, técnico e direto.

---
> **Atenção:** Se a Lorena parar de responder, verifique primeiro nos logs do Supabase se o erro é `404 (Model Not Found)`. Se for, a Google pode ter mudado o nome do modelo preview. Consulte a lista de modelos disponíveis via API diagnostic.
