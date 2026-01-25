

import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, signInAsGuest } = useAuth();

  // Estados
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [adminCode, setAdminCode] = useState(''); // Master Password State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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

    if (rememberMe) {
      localStorage.setItem('vocalizes_saved_email', email);
    } else {
      localStorage.removeItem('vocalizes_saved_email');
    }

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Por favor, informe seu nome.');
        if (!phone.trim()) throw new Error('Por favor, informe seu WhatsApp/Telefone.');
        if (role === 'teacher' && !adminCode.trim()) throw new Error('Para cadastro de professor, a Senha Mestre é obrigatória.');

        const { error, data } = await signUp(email, password, name, phone, role, adminCode);
        if (error) {
          throw new Error(typeof error === 'object' ? JSON.stringify(error) : error);
        }

        if (data && data.session) {
          // AuthContext handles redirect
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
      <style>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 129, 255, 0.2); }
          50% { box-shadow: 0 0 40px rgba(0, 129, 255, 0.5); }
        }
        .animate-float-slow { animation: float 15s ease-in-out infinite; }
        .animate-float-medium { animation: float 10s ease-in-out infinite reverse; }
        .animate-float-fast { animation: float 8s ease-in-out infinite; }
      `}</style>

      {/* Background Ambient Lights with Animation */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0081FF]/20 blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF00BC]/20 blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-float-medium" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6F4CE7]/15 blur-[120px] rounded-full pointer-events-none animate-float-fast" />

      {/* Main Container - Glassmorphism Card */}
      <div className="w-full max-w-[440px] p-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#151A23]/60 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 relative group cursor-default">
            <div className="absolute inset-0 bg-brand-gradient blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
            <Logo size="xl" className="relative drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 text-center drop-shadow-lg">
            ACADEMIA VQC
          </h1>
          <p className="text-[#FF00BC] font-bold tracking-[0.2em] text-[10px] uppercase">
            Lorena Pimentel
          </p>
        </div>

        {/* Role Selector */}
        <div className="bg-[#0B0E14]/80 p-1.5 rounded-2xl flex relative mb-8 border border-white/5 shadow-inner">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#2A3441] rounded-xl shadow-lg ring-1 ring-white/5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${role === 'teacher' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'
              }`}
          ></div>
          <button
            onClick={() => setRole('student')}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl z-10 transition-colors active:scale-95 touch-manipulation ${role === 'student' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Aluno
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl z-10 transition-colors active:scale-95 touch-manipulation ${role === 'teacher' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Professor
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {isSignUp && (
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#0081FF] group-focus-within:scale-110 duration-300">
                <span className="material-symbols-rounded">person</span>
              </div>
              <input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 bg-[#0B0E14]/60 border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#0B0E14] focus:ring-1 focus:ring-[#0081FF]/50 transition-all duration-300"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#0081FF] group-focus-within:scale-110 duration-300">
              <span className="material-symbols-rounded">mail</span>
            </div>
            <input
              type="email"
              placeholder="Seu melhor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 bg-[#0B0E14]/60 border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#0B0E14] focus:ring-1 focus:ring-[#0081FF]/50 transition-all duration-300"
              required
              autoComplete="email"
            />
          </div>

          {isSignUp && (
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#0081FF] group-focus-within:scale-110 duration-300">
                <span className="material-symbols-rounded">call</span>
              </div>
              <input
                type="tel"
                placeholder="Telefone / WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-14 bg-[#0B0E14]/60 border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#0B0E14] focus:ring-1 focus:ring-[#0081FF]/50 transition-all duration-300"
                required
                autoComplete="tel"
              />
            </div>
          )}

          {/* Master Password Input for Teachers */}
          {isSignUp && role === 'teacher' && (
            <div className="group relative animate-in fade-in slide-in-from-top-2">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/70 transition-colors group-focus-within:text-[#0081FF] group-focus-within:scale-110 duration-300">
                <span className="material-symbols-rounded">vpn_key</span>
              </div>
              <input
                type="password"
                placeholder="Senha Mestre (Admin)"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full h-14 bg-[#0B0E14]/60 border border-[#FF00BC]/30 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 focus:bg-[#0B0E14] focus:ring-1 focus:ring-purple-500/50 transition-all duration-300"
                required
              />
            </div>
          )}

          <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#0081FF] group-focus-within:scale-110 duration-300">
              <span className="material-symbols-rounded">lock</span>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 bg-[#0B0E14]/60 border border-white/5 rounded-2xl pl-12 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 focus:bg-[#0B0E14] focus:ring-1 focus:ring-[#0081FF]/50 transition-all duration-300"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
            >
              <span className="material-symbols-rounded text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Opção Permanecer Conectado */}
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-3 px-1 cursor-pointer group w-fit opacity-80 hover:opacity-100 transition-opacity"
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${rememberMe
              ? 'bg-[#0081FF] border-[#0081FF]'
              : 'bg-transparent border-white/20 group-hover:border-white/40'
              }`}>
              {rememberMe && <span className="material-symbols-rounded text-xs text-white leading-none">check</span>}
            </div>
            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
              Permanecer conectado
            </span>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-200 text-xs flex gap-3 items-start animate-in zoom-in-95 backdrop-blur-sm">
              <span className="material-symbols-rounded text-red-500 text-sm mt-0.5">error</span>
              <div className="flex-1">
                <p className="font-semibold">{error}</p>

                {emailExistsError && (
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg w-full text-xs font-bold transition-all flex items-center justify-center gap-2 border border-red-500/20"
                  >
                    <span className="material-symbols-rounded text-sm">login</span>
                    Ir para Login
                  </button>
                )}

                {showTroubleshoot && !emailExistsError && (
                  <div className="mt-2 pt-2 border-t border-red-500/20">
                    <p className="text-[10px] text-red-400 mb-1 font-bold">DICA DE SUPORTE:</p>
                    <p className="text-[10px] opacity-80 mb-1">Verifique sua conexão ou se bloqueadores de anúncios estão ativos.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-green-950/40 border border-green-500/20 text-green-200 text-xs flex gap-3 items-center animate-in zoom-in-95 backdrop-blur-sm">
              <span className="material-symbols-rounded text-green-500">check_circle</span>
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full h-14 mt-4 rounded-2xl bg-brand-gradient text-white font-bold text-lg shadow-[0_4px_30px_rgba(0,129,255,0.4)] hover:shadow-[0_6px_40px_rgba(111,76,231,0.5)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
            <div className="relative flex items-center gap-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {isSignUp ? 'Criar Conta' : 'Acessar Plataforma'}
                  {!isSignUp && <span className="material-symbols-rounded text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                </>
              )}
            </div>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            {isSignUp ? 'Já possui conta?' : 'Novo por aqui?'}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg(''); setEmailExistsError(false); }}
              className="text-[#0081FF] font-bold hover:text-[#0081FF]/80 hover:underline transition-all"
            >
              {isSignUp ? 'Fazer Login' : 'Cadastre-se agora'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#151A23] px-2 text-slate-500">Ou continue como</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors border border-white/5 hover:border-white/10 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-rounded text-sm text-[#FF00BC]">rocket_launch</span>
            Visitante (Modo Demonstração)
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center opacity-30">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
            Powered by Vocalizes Tech
            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
          </p>
        </div>

      </div>
    </div>
  );
};

