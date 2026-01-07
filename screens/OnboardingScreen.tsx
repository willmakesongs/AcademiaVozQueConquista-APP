
import React, { useState, useEffect, useRef } from 'react';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    onComplete: () => void;
}

const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
    const { user, signOut, setUser } = useAuth() as any;

    // Refs for performance (Uncontrolled Components) to avoid re-renders on typing
    const nameRef = useRef<HTMLInputElement>(null);
    const ageRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const instagramRef = useRef<HTMLInputElement>(null);
    const scheduleTimeRef = useRef<HTMLInputElement>(null);

    // States only for selection UI
    const [modality, setModality] = useState<'Presencial' | 'Online'>('Presencial');
    const [level, setLevel] = useState('Iniciante');
    const [scheduleDay, setScheduleDay] = useState('Segunda');
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');

    // Controlled state only for loading
    const [loading, setLoading] = useState(false);

    // Pre-fill data without causing re-renders loop
    useEffect(() => {
        const fetchCourses = async () => {
            const { data } = await supabase.from('courses').select('*').eq('ativo', true);
            if (data) {
                setCourses(data);
                // Pre-select Canto by default if available
                const canto = data.find(c => c.slug === 'canto');
                if (canto) setSelectedCourseId(canto.id);
                else if (data.length > 0) setSelectedCourseId(data[0].id);
            }
        };
        fetchCourses();

        if (user) {
            if (nameRef.current) nameRef.current.value = user.name || '';
            if (phoneRef.current) phoneRef.current.value = user.phone || '';
            if (addressRef.current) addressRef.current.value = user.address || '';
            if (ageRef.current) ageRef.current.value = user.age ? String(user.age) : '';
            if (instagramRef.current) instagramRef.current.value = user.instagram || '';
            if (scheduleTimeRef.current) scheduleTimeRef.current.value = user.scheduleTime || '09:00';

            // Update selections if they exist
            if (user.modality) setModality(user.modality);
            if (user.level) setLevel(user.level);
            if (user.scheduleDay) setScheduleDay(user.scheduleDay);
        }
    }, [user]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) return;

        const nameValue = nameRef.current?.value || '';
        if (!nameValue) {
            alert('Por favor, preencha seu nome.');
            return;
        }

        setLoading(true);
        try {
            // 1. Atualização Garantida (Campos que já existem)
            const { error: coreError } = await supabase
                .from('profiles')
                .update({
                    name: nameValue,
                    phone: phoneRef.current?.value || '',
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (coreError) throw coreError;

            // 2. Atualização "Best Effort"
            try {
                await supabase
                    .from('profiles')
                    .update({
                        age: parseInt(ageRef.current?.value || '0') || null,
                        address: addressRef.current?.value || '',
                        instagram: instagramRef.current?.value || '',
                        modality: modality,
                        level: level,
                        schedule_day: scheduleDay,
                        schedule_time: scheduleTimeRef.current?.value || '09:00',
                    })
                    .eq('id', user.id);
            } catch (extendedError) {
                console.warn('Campos estendidos falharam:', extendedError);
            }

            // 3. Vincular Curso Selecionado
            if (selectedCourseId) {
                try {
                    await supabase
                        .from('student_courses')
                        .upsert({
                            student_id: user.id,
                            course_id: selectedCourseId,
                            status: 'ativo'
                        }, { onConflict: 'student_id,course_id' });
                } catch (courseErr) {
                    console.warn('Vínculo de curso falhou:', courseErr);
                }
            }

            // Force local update
            if (user) {
                setUser({ ...user, onboardingCompleted: true });
            }
            onComplete();
        } catch (err: any) {
            console.error('Erro ao salvar onboarding:', err);
            if (err.message?.includes('column') || err.message?.includes('schema')) {
                alert('Cadastro básico salvo. Alguns detalhes extras podem não ter sido persistidos.');
                if (user) setUser({ ...user, onboardingCompleted: true });
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
            {/* Background Ambient Lights - Optimized with translate3d for GPU acceleration */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0081FF]/10 blur-[120px] rounded-full pointer-events-none" style={{ transform: 'translate3d(0,0,0)' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF00BC]/10 blur-[120px] rounded-full pointer-events-none" style={{ transform: 'translate3d(0,0,0)' }} />

            <div className="w-full max-w-md h-full max-h-[90dvh] flex flex-col bg-[#101622] rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 border border-white/5">
                {/* Header */}
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
                        disabled={loading}
                        className="text-[#0081FF] font-black text-sm uppercase tracking-wider disabled:opacity-30 px-2"
                    >
                        {loading ? '...' : 'Salvar'}
                    </button>
                </div>

                {/* Form Content */}
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
                                    ref={nameRef}
                                    type="text"
                                    placeholder="Ex: Maria Silva"
                                    className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Idade</p>
                                    <input
                                        ref={ageRef}
                                        type="number"
                                        placeholder="25"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-colors text-center"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Endereço</p>
                                    <input
                                        ref={addressRef}
                                        type="text"
                                        placeholder="Rua, Número, Bairro"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-colors"
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
                                        ref={phoneRef}
                                        type="text"
                                        placeholder="(00) 00000-0000"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 pl-12 pr-4 text-white focus:outline-none focus:border-[#0081FF] transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Instagram</p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-500 text-lg">alternate_email</span>
                                    <input
                                        ref={instagramRef}
                                        type="text"
                                        placeholder="usuario_insta"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 pl-12 pr-4 text-white focus:outline-none focus:border-[#0081FF] transition-colors"
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
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Valor da mensalidade</p>
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
                                        ref={scheduleTimeRef}
                                        type="time"
                                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Seleção de Curso */}
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Curso de Interesse</p>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none"
                                >
                                    <option value="" disabled>Selecione um curso...</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id} className="bg-[#1A202C]">
                                            {course.nome}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-500 italic mt-2 ml-1 px-1">
                                    Selecione o curso que você deseja iniciar. Você poderá adicionar outros cursos posteriormente.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
