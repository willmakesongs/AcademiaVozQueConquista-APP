import React from 'react';
import { Logo } from '../components/Logo';

interface VisitorConversionScreenProps {
    onJoin: () => void;
    onLearnMore: () => void;
}

export const VisitorConversionScreen: React.FC<VisitorConversionScreenProps> = ({ onJoin, onLearnMore }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0E14] relative overflow-hidden font-sans text-slate-200 p-6">
            {/* Background Ambient Lights */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0081FF]/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF00BC]/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="w-full max-w-md z-10 text-center animate-in fade-in zoom-in-95 duration-700">

                {/* Header Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0081FF] to-[#6F4CE7] flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <span className="material-symbols-rounded text-5xl text-white">sentiment_satisfied</span>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-white mb-4 leading-tight">
                    E aí, curtiu a experiência?
                </h1>

                <div className="bg-[#151A23] border border-white/5 rounded-2xl p-6 mb-8 text-left shadow-2xl">
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        Você acabou de testar o <strong className="text-white">Voz que Conquista</strong> — um app criado para desenvolver sua voz com método, constância e acompanhamento real.
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Para continuar evoluindo, destravar todas as funções e fazer parte da nossa academia, é só dar o próximo passo abaixo.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onJoin}
                        className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#2965FF] to-[#DB25D2] text-white font-black text-lg shadow-[0_0_30px_rgba(41,101,255,0.4)] hover:shadow-[0_0_45px_rgba(219,37,210,0.6)] hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded">diamond</span>
                        Entrar para a Academia
                    </button>

                    <button
                        onClick={onLearnMore}
                        className="w-full h-14 rounded-2xl bg-white/5 text-gray-300 font-bold hover:bg-white/10 hover:text-white transition-all border border-white/5 flex items-center justify-center gap-2"
                    >
                        Quero saber mais
                    </button>
                </div>

                <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                    Voz Que Conquista • Método Oficial
                </p>

            </div>
        </div>
    );
};
