
import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    onComplete: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
    const { user } = useAuth();
    const [age, setAge] = useState('');
    const [instagram, setInstagram] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    age: parseInt(age) || null,
                    instagram: instagram,
                    address: address,
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (error) throw error;
            onComplete();
        } catch (err) {
            console.error('Erro ao salvar cadastro:', err);
            alert('Erro ao salvar seus dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#101622] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambient Lights */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0081FF]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF00BC]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-8">
                    <Logo size="lg" className="mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo(a)!</h1>
                    <p className="text-gray-400">Complete seu cadastro para acessar a Academia.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 bg-[#1A202C]/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#0081FF] uppercase tracking-wider ml-1">Idade</label>
                        <div className="relative group">
                            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0081FF] transition-colors">cake</span>
                            <input
                                type="number"
                                required
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Sua idade"
                                className="w-full h-14 bg-[#101622] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#0081FF]/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#FF00BC] uppercase tracking-wider ml-1">Instagram</label>
                        <div className="relative group">
                            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF00BC] transition-colors">alternate_email</span>
                            <input
                                type="text"
                                required
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="@seuusuario"
                                className="w-full h-14 bg-[#101622] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#FF00BC]/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#6F4CE7] uppercase tracking-wider ml-1">Endereço</label>
                        <div className="relative group">
                            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#6F4CE7] transition-colors">location_on</span>
                            <input
                                type="text"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Cidade/UF"
                                className="w-full h-14 bg-[#101622] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#6F4CE7]/50 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 mt-6 rounded-2xl bg-gradient-to-r from-[#0081FF] to-[#6F4CE7] text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                Finalizar Cadastro
                                <span className="material-symbols-rounded">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
