
import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    onComplete: () => void;
}

const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
    const { user, signOut, setUser } = useAuth() as any; // Cast to any temporarily if type update lag

    // Form States
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [modality, setModality] = useState<'Presencial' | 'Online'>('Presencial');
    const [level, setLevel] = useState('Iniciante');
    const [scheduleDay, setScheduleDay] = useState('Segunda');
    const [scheduleTime, setScheduleTime] = useState('09:00');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            // 1. Atualização Garantida (Campos que já existem)
            const { error: coreError } = await supabase
                .from('profiles')
                .update({
                    name: name,
                    phone: phone,
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (coreError) throw coreError;

            // 2. Atualização "Best Effort" (Campos novos que podem não existir no banco ainda)
            // Se falhar, o usuário prossegue, mas os dados extras não salvam (melhor que travar)
            try {
                await supabase
                    .from('profiles')
                    .update({
                        age: parseInt(age) || null,
                        address: address,
                        instagram: instagram,
                        modality: modality,
                        level: level,
                        schedule_day: scheduleDay,
                        schedule_time: scheduleTime,
                    })
                    .eq('id', user.id);
            } catch (extendedError) {
                console.warn('Campos estendidos falharam (provavelmente colunas faltando no DB):', extendedError);
            }
            // Force local update so App.tsx redirects immediately
            if (user) {
                setUser({ ...user, onboardingCompleted: true });
            }
            onComplete();
        } catch (err: any) {
            console.error('Erro ao salvar onboarding:', err);
            // Se for erro de schema, tentamos prosseguir apenas com o básico se não tiver ido antes
            if (err.message?.includes('column') || err.message?.includes('schema')) {
                alert('Aviso: Alguns dados extras não puderam ser salvos por atualização pendente no sistema, mas seu cadastro básico foi concluído.');
                if (user) {
                    setUser({ ...user, onboardingCompleted: true });
                }
                onComplete();
            } else {
                alert('Erro ao salvar: ' + (err.message || String(err)));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101622] p-4 overflow-hidden">
            {/* Background Ambient Lights */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0081FF]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF00BC]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md h-full max-h-[90dvh] flex flex-col bg-[#101622] rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 border border-white/5">
                {/* Header Fixado conforme mockup */}
                <div className="px-6 pt-12 pb-4 flex justify-between items-center border-b border-white/5 bg-[#151A23] shrink-0">
                    <button
                        onClick={() => signOut()}
                        className="text-red-500 font-bold text-xs uppercase tracking-wider hover:text-red-400 transition-colors"
                    >
                        Sair
                    </button>
                    <h3 className="text-lg font-black text-white">Novo Aluno</h3>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading || !name}
                        className="text-[#0081FF] font-black text-sm uppercase tracking-wider disabled:opacity-30 px-2"
                    >
                        {loading ? '...' : 'Salvar'}
                    </button>
                </div>

                {/* Form Content Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 hide-scrollbar pb-32">

                    {/* Pessoal */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-rounded text-[#0081FF] text-lg">person</span>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dados Pessoais</h4>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Nome Completo</p>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Maria Silva"
                                    className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Idade</p>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="25"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-all text-center"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Endereço</p>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Rua, Número, Bairro"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contato */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-rounded text-[#0081FF] text-lg">contact_mail</span>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contato</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Telefone / WhatsApp</p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-500 text-lg">call</span>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 pl-12 pr-4 text-white focus:outline-none focus:border-[#0081FF] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Instagram</p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-500 text-lg">alternate_email</span>
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="usuario_insta"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 pl-12 pr-4 text-white focus:outline-none focus:border-[#0081FF] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Detalhes da Aula */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-rounded text-[#0081FF] text-lg">school</span>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalhes da Aula</h4>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Tipo de Aula</p>
                                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => setModality('Presencial')}
                                        className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${modality === 'Presencial' ? 'bg-[#0081FF] text-white shadow-lg' : 'text-gray-400'}`}
                                    >
                                        <span className="material-symbols-rounded text-lg">location_on</span> Presencial
                                    </button>
                                    <button
                                        onClick={() => setModality('Online')}
                                        className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${modality === 'Online' ? 'bg-[#0081FF] text-white shadow-lg' : 'text-gray-400'}`}
                                    >
                                        <span className="material-symbols-rounded text-lg">videocam</span> Online
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Classificação</p>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none"
                                    >
                                        {['Iniciante', 'Intermediário', 'Avançado'].map(l => <option key={l} value={l} className="bg-[#1A202C]">{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Aula</p>
                                    <div className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white flex items-center italic text-xs opacity-50">
                                        Definido pelo professor
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Dia da Aula</p>
                                    <select
                                        value={scheduleDay}
                                        onChange={(e) => setScheduleDay(e.target.value)}
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none"
                                    >
                                        {WEEK_DAYS.map(d => <option key={d} value={d} className="bg-[#1A202C]">{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Horário</p>
                                    <input
                                        type="time"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
