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
