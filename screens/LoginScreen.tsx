
import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, signInAsGuest } = useAuth();

  // Estados
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [adminCode, setAdminCode] = useState(''); // Master Password State (Security preserved)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Novo estado para telefone
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState(false);

  // Carregar email salvo ao iniciar
  useEffect(() => {
    const savedEmail = localStorage.getItem('vocalizes_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setEmailExistsError(false);
    setShowTroubleshoot(false);
    setLoading(true);

    // Lógica de Salvar/Remover Email
    if (rememberMe) {
      localStorage.setItem('vocalizes_saved_email', email);
    } else {
      localStorage.removeItem('vocalizes_saved_email');
    }

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Por favor, informe seu nome.');
        if (!phone.trim()) throw new Error('Por favor, informe seu WhatsApp/Telefone.'); // Validação
        if (role === 'teacher' && !adminCode.trim()) throw new Error('Para cadastro de professor, a Senha Mestre é obrigatória.');

        const { error, data } = await signUp(email, password, name, phone, role, adminCode);
        if (error) {
          throw new Error(typeof error === 'object' ? JSON.stringify(error) : error);
        }

        if (data && data.session) {
          // AuthContext redireciona automaticamente se tiver sessão
        } else {
          setSuccessMsg('Conta criada! Se necessário, verifique seu email para confirmar.');
        }
      } else {
        const { error } = await signIn(role, email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      let msg = '';

      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = String(err.message);
      } else {
        msg = String(err);
      }

      // Se o erro ainda for [object Object], tenta stringify
      if (msg === '[object Object]') {
        try { msg = JSON.stringify(err); } catch { }
      }

      if (msg.trim().startsWith('{') && msg.includes('"message":')) {
        try {
          const parsed = JSON.parse(msg);
          msg = parsed.message || parsed.error_description || msg;
        } catch (e) { /* ignore */ }
      }

      const lowerMsg = msg.toLowerCase();

      if (lowerMsg.includes('invalid login') || lowerMsg.includes('invalid_grant')) {
        setError('Email ou senha incorretos.');
      }
      else if (lowerMsg.includes('already registered') || lowerMsg.includes('already exists') || lowerMsg.includes('unique constraint')) {
        setError('Este email já possui uma conta.');
        setEmailExistsError(true);
      }
      else {
        msg = msg.replace(/{"message":"|","code":.*}/g, '');
        setError(msg);
      }

      if (lowerMsg.includes('fetch') || lowerMsg.includes('load failed')) {
        setShowTroubleshoot(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAsGuest(role);
    } catch (err) {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsSignUp(false);
    setError('');
    setEmailExistsError(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0E14] relative overflow-hidden font-sans text-slate-200">

      {/* Background Ambient Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0081FF]/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF00BC]/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#6F4CE7]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[420px] p-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 relative group">
            <div className="absolute inset-0 bg-brand-gradient blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
            <Logo size="xl" className="relative drop-shadow-2xl" />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 text-center">
            LORENA PIMENTEL
          </h1>
          <p className="text-[#EE13CA] font-semibold tracking-wider text-[11px] uppercase">
            Academia Voz Que Conquista
          </p>
        </div>

        {/* Role Selector */}
        <div className="bg-[#151A23] p-1.5 rounded-2xl flex relative mb-8 border border-white/5">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#2A3441] rounded-xl shadow-sm transition-all duration-300 ease-spring ${role === 'teacher' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'
              }`}
          ></div>
          <button
            onClick={() => setRole('student')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl z-10 transition-colors ${role === 'student' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Aluno
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl z-10 transition-colors ${role === 'teacher' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Professor
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {isSignUp && (
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-[#0081FF]">
                <span className="material-symbols-rounded">person</span>
              </div>
              <input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 bg-[#151A23] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#1A202C] transition-all"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-[#0081FF]">
              <span className="material-symbols-rounded">mail</span>
            </div>
            <input
              type="email"
              placeholder="Seu melhor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 bg-[#151A23] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#1A202C] transition-all"
              required
              autoComplete="email"
            />
          </div>

          {isSignUp && (
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-[#0081FF]">
                <span className="material-symbols-rounded">call</span>
              </div>
              <input
                type="tel"
                placeholder="Telefone / WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-14 bg-[#151A23] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#1A202C] transition-all"
                required
                autoComplete="tel"
              />
            </div>
          )}

          {/* Master Password Input for Teachers */}
          {isSignUp && role === 'teacher' && (
            <div className="group relative animate-in fade-in slide-in-from-top-2">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 transition-colors group-focus-within:text-[#0081FF]">
                <span className="material-symbols-rounded">vpn_key</span>
              </div>
              <input
                type="password"
                placeholder="Senha Mestre (Admin)"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full h-14 bg-[#151A23] border border-red-500/30 rounded-2xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:bg-[#1A202C] transition-all"
                required
              />
            </div>
          )}

          <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-[#0081FF]">
              <span className="material-symbols-rounded">lock</span>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 bg-[#151A23] border border-white/5 rounded-2xl pl-12 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#1A202C] transition-all"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
            >
              <span className="material-symbols-rounded text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Opção Permanecer Conectado */}
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-3 px-1 cursor-pointer group w-fit"
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${rememberMe
              ? 'bg-[#2A3441] border-[#0081FF]'
              : 'bg-[#151A23] border-gray-600 group-hover:border-gray-400'
              }`}>
              {rememberMe && <div className="w-2.5 h-2.5 rounded-full bg-[#0081FF] animate-in zoom-in-50" />}
            </div>
            <span className={`text-sm select-none transition-colors ${rememberMe ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
              Permanecer conectado
            </span>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex gap-3 items-start animate-in zoom-in-95">
              <span className="material-symbols-rounded text-red-500 text-sm mt-0.5">error</span>
              <div className="flex-1">
                <p className="font-semibold">{error}</p>

                {emailExistsError && (
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg w-full text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded text-sm">login</span>
                    Fazer Login
                  </button>
                )}

                {showTroubleshoot && !emailExistsError && (
                  <div className="mt-2 pt-2 border-t border-red-500/20">
                    <p className="text-[10px] text-red-400 mb-1 font-bold">DICA DE SUPORTE:</p>
                    <p className="text-[10px] opacity-80 mb-1">Verifique sua conexão ou se o bloqueador de anúncios não está impedindo o login.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-200 text-xs flex gap-3 items-center animate-in zoom-in-95">
              <span className="material-symbols-rounded text-green-500">check_circle</span>
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-2 rounded-2xl bg-gradient-to-r from-[#2965FF] to-[#DB25D2] text-white font-bold text-lg shadow-[0_0_30px_rgba(41,101,255,0.4)] hover:shadow-[0_0_45px_rgba(219,37,210,0.6)] hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              isSignUp ? 'Criar minha conta' : 'Entrar'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center space-y-4">
          <p className="text-slate-400 text-sm">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não é membro?'}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg(''); setEmailExistsError(false); }}
              className="ml-2 text-white font-bold hover:underline transition-all"
            >
              {isSignUp ? 'Fazer Login' : 'Cadastre-se grátis'}
            </button>
          </p>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors border border-white/5 hover:border-white/10"
          >
            <span className="material-symbols-rounded text-sm">rocket_launch</span>
            Entrar como Visitante (Modo Teste)
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center opacity-40">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Powered by Vocalizes Tech
          </p>
        </div>

      </div>
    </div>
  );
};
