-- Execute este comando no Editor SQL do seu Supabase para adicionar as colunas que faltam
-- Isso permitirá salvar todos os dados do formulário de onboarding

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS modality text,
ADD COLUMN IF NOT EXISTS level text,
ADD COLUMN IF NOT EXISTS schedule_day text,
ADD COLUMN IF NOT EXISTS schedule_time text;

-- 1. Ativar RLS na tabela de perfis (Essencial para segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Criar política: Alunos só leem/editam o próprio perfil
CREATE POLICY "Users can only update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Profiles are viewable by owner" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. Adicionar coluna de metadados para a Lorena IA
-- Isso permite que a IA salve notas sobre o comportamento do aluno
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_pedagogical_notes jsonb DEFAULT '{}'::jsonb;

-- 4. Tabela para registrar o progresso técnico diário (Metodologia Berklee/VQC)
CREATE TABLE IF NOT EXISTS public.practice_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_name text NOT NULL, -- Ex: 'Troca C-G no CAGED'
    duration_minutes integer,
    bpm_reached integer, -- Crucial para Guitarra/Violão
    difficulty_rating integer CHECK (difficulty_rating BETWEEN 1 AND 5),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar segurança para os logs
ALTER TABLE public.practice_logs ENABLE ROW LEVEL SECURITY;

-- Alunos só veem e gerenciam seus próprios treinos
CREATE POLICY "Users can manage their own practice logs" 
ON public.practice_logs FOR ALL 
USING (auth.uid() = student_id);


Insi