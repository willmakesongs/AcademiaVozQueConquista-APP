import React from 'react';
import { Logo } from '../components/Logo';

interface BlockedScreenProps {
    onLogout: () => void;
}

export const BlockedScreen: React.FC<BlockedScreenProps> = ({ onLogout }) => {
    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-sm w-full">
                <div className="mb-8 flex justify-center scale-110">
                    <Logo />
                </div>

                <div className="bg-[#1A202C]/80 backdrop-blur-xl rounded-[32px] p-8 border border-red-500/20 shadow-2xl shadow-red-900/20">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20">
                        <span className="material-symbols-rounded text-4xl">lock</span>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">Acesso Suspenso</h1>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        Identificamos uma pendência em sua assinatura. Para continuar acessando os conteúdos e ferramentas da academia, realize o pagamento.
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white">
                                    <span className="material-symbols-rounded text-lg">payments</span>
                                </div>
                                <span className="text-sm font-bold text-white uppercase tracking-wider">Pague via PIX</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mb-2">Chave E-mail (Copiar e colar no seu banco)</p>
                            <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2 overflow-hidden">
                                <span className="text-white font-mono text-[11px] truncate">lorenapimenteloficial@gmail.com</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText('lorenapimenteloficial@gmail.com')}
                                    className="shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                >
                                    <span className="material-symbols-rounded text-sm">content_copy</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => window.open('https://wa.me/55SEUNUMERO', '_blank')}
                        className="w-full h-14 rounded-2xl bg-white text-black font-bold mb-4 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded">chat</span>
                        Já paguei / Suporte
                    </button>

                    <button
                        onClick={onLogout}
                        className="text-gray-500 text-sm font-medium hover:text-white transition-colors"
                    >
                        Sair da Conta
                    </button>
                </div>

                <p className="mt-8 text-[10px] text-gray-600 uppercase font-bold tracking-[0.2em]">
                    Powered by Vocalizes Tech
                </p>
            </div>
        </div>
    );
};
