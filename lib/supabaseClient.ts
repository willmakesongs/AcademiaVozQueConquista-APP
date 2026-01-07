
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------------------------------------------
// 1. Vá ao seu painel Supabase -> Settings -> API
// 2. Copie a "Project URL" e a "anon public key"
// 3. Cole abaixo dentro das aspas.
// ------------------------------------------------------------------

const SUPABASE_URL = 'https://sedjnyryixudxmmkeoam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZGpueXJ5aXh1ZHhtbWtlb2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyODE0NDIsImV4cCI6MjA4Mjg1NzQ0Mn0.5NozVbt66LPMGYLBd2be_IOX3PttYBZETcowwNOkTRA';

// Validação básica
const isValidUrl = (url: string) => {
  return url && url.startsWith('https://') && !url.includes('SUA_URL');
};

export const isSupabaseConfigured = isValidUrl(SUPABASE_URL);

// Se as chaves não estiverem configuradas, o app usará modo de demonstração (Login Visitante)
// mas mostrará avisos no console.
const clientUrl = isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co';
const clientKey = isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-key';

export const supabase = createClient(clientUrl, clientKey);
