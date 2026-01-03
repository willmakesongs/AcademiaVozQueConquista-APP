
import React, { useState, useEffect, useRef } from 'react';
import { Screen, StudentSummary, Appointment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Props {
    onNavigate: (screen: Screen) => void;
    onLogout: () => void;
    initialTab?: 'dashboard' | 'students' | 'history' | 'reports' | 'settings';
}

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const TeacherDashboard: React.FC<Props> = ({ onNavigate, onLogout, initialTab = 'students' }) => {
    const { user } = useAuth();
    const [showConfig, setShowConfig] = useState(false);
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'history' | 'reports' | 'settings'>(initialTab);

    // States UI
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // States Detalhes
    const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
    const [notesInput, setNotesInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editPhone, setEditPhone] = useState('');

    // States Edição Agendamento
    const [editScheduleDay, setEditScheduleDay] = useState('Seg');
    const [editScheduleTime, setEditScheduleTime] = useState('');

    // Form Novo Aluno
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentAge, setNewStudentAge] = useState('');
    const [newStudentPhone, setNewStudentPhone] = useState('');
    const [newStudentInsta, setNewStudentInsta] = useState('');

    // Agendamento Novo Aluno
    const [scheduleDay, setScheduleDay] = useState('Seg');
    const [scheduleTime, setScheduleTime] = useState('14:00');

    const [newStudentLevel, setNewStudentLevel] = useState('Iniciante');
    const [newStudentModality, setNewStudentModality] = useState<'Online' | 'Presencial'>('Presencial');
    const [paymentDay, setPaymentDay] = useState('05');

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const localData = localStorage.getItem('vocalizes_local_students');
        const localStudents: StudentSummary[] = localData ? JSON.parse(localData) : [];

        try {
            const { data: sData, error: sError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student');

            if (sError) {
                if (String(sError.code) === '42501') {
                    const merged = [...localStudents];
                    const unique = merged.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);
                    setStudents(unique);
                } else {
                    throw sError;
                }
            } else if (sData) {
                const dbStudents: StudentSummary[] = sData.map(s => ({
                    id: s.id,
                    name: s.name,
                    avatarUrl: s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`,
                    level: 'Iniciante',
                    lastPractice: 'Hoje',
                    progress: 0,
                    status: (s.status as any) || 'active',
                    phone: s.phone || '',
                    age: s.age ? String(s.age) : '',
                    paymentDay: '05',
                    notes: s.notes || '',
                    modality: s.modality || 'Online',
                    scheduleDay: s.schedule_day || 'Seg',
                    scheduleTime: s.schedule_time || '14:00',
                    amount: s.amount || 97
                }));

                const allStudentsMap = new Map<string, StudentSummary>();
                dbStudents.forEach(s => allStudentsMap.set(s.id, s));
                localStudents.forEach(s => allStudentsMap.set(s.id, s));

                setStudents(Array.from(allStudentsMap.values()));
            }
        } catch (error) {
            console.warn('Fallback to local data:', error);
            const merged = [...localStudents];
            const unique = merged.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);
            setStudents(unique);
        }
    };

    const handleAddStudent = async () => {
        if (!newStudentName.trim()) return;
        setLoadingAction(true);
        const fakeId = crypto.randomUUID();
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudentName)}&background=random&color=fff`;

        const newStudentLocal: StudentSummary = {
            id: fakeId,
            name: newStudentName,
            avatarUrl,
            level: newStudentLevel,
            lastPractice: 'Nunca',
            progress: 0,
            status: 'active',
            age: newStudentAge,
            phone: newStudentPhone,
            paymentDay: paymentDay,
            notes: '',
            modality: newStudentModality,
            scheduleDay: scheduleDay,
            scheduleTime: scheduleTime,
            amount: 97
        };

        try {
            await supabase.from('profiles').insert([{
                id: fakeId,
                name: newStudentName,
                role: 'student',
                avatar_url: avatarUrl,
                phone: newStudentPhone || null,
                age: newStudentAge ? parseInt(newStudentAge) : null,
                modality: newStudentModality,
                schedule_day: scheduleDay,
                schedule_time: scheduleTime
            }]);

            const existingLocal = localStorage.getItem('vocalizes_local_students');
            const localList = existingLocal ? JSON.parse(existingLocal) : [];
            localList.push(newStudentLocal);
            localStorage.setItem('vocalizes_local_students', JSON.stringify(localList));

            setStudents(prev => [...prev, newStudentLocal]);
            setNewStudentName('');
            setIsAddModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
        }
    };

    const openStudentDetails = (student: StudentSummary) => {
        setSelectedStudent(student);
        setNotesInput(student.notes || '');
        setEditPhone(student.phone || '');
        setEditScheduleDay(student.scheduleDay || 'Seg');
        setEditScheduleTime(student.scheduleTime || '14:00');
        setIsEditing(false);
    };

    const handleSaveChanges = async () => {
        if (!selectedStudent) return;
        setLoadingAction(true);
        const updatedStudent: StudentSummary = {
            ...selectedStudent,
            notes: notesInput,
            phone: editPhone,
            scheduleDay: editScheduleDay,
            scheduleTime: editScheduleTime
        };

        try {
            await supabase.from('profiles').update({
                phone: editPhone,
                notes: notesInput,
                schedule_day: editScheduleDay,
                schedule_time: editScheduleTime
            }).eq('id', selectedStudent.id);

            const existingLocal = localStorage.getItem('vocalizes_local_students');
            let localList: StudentSummary[] = existingLocal ? JSON.parse(existingLocal) : [];
            const localIndex = localList.findIndex(s => s.id === selectedStudent.id);
            if (localIndex >= 0) localList[localIndex] = updatedStudent;
            else localList.push(updatedStudent);
            localStorage.setItem('vocalizes_local_students', JSON.stringify(localList));

            setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));
            setSelectedStudent(updatedStudent);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
        }
    };

    const renderDashboard = () => {
        const totalReceived = students.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.amount || 0), 0);
        const totalPending = students.filter(s => s.status === 'overdue').reduce((acc, s) => acc + (s.amount || 0), 0);
        const overdueStudents = students.filter(s => s.status === 'overdue' || s.status === 'blocked');

        return (
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
                <div className="grid grid-cols-2 gap-4 px-6 pt-6">
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-3">
                            <span className="material-symbols-rounded">arrow_upward</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Recebido (Mês)</p>
                        <h3 className="text-xl font-black text-white">R$ {totalReceived.toLocaleString('pt-BR')}</h3>
                        <p className="text-[10px] text-green-400 font-bold mt-1">+12% vs mês anterior</p>
                    </div>
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-3">
                            <span className="material-symbols-rounded">priority_high</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pendente</p>
                        <h3 className="text-xl font-black text-white">R$ {totalPending.toLocaleString('pt-BR')}</h3>
                        <p className="text-[10px] text-orange-400 font-bold mt-1">+5% inadimplência</p>
                    </div>
                </div>

                <div className="px-6 mt-6">
                    <div className="bg-[#1A202C] rounded-[32px] p-6 border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Tendência de Receita</p>
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-2xl font-black text-white">R$ 152k</h3>
                            <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">+8.5%</span>
                        </div>
                        <div className="h-32 w-full relative">
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0081FF" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#0081FF" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0 80 Q 40 20, 80 50 T 160 40 T 240 60 T 320 30 T 400 50" fill="none" stroke="#0081FF" strokeWidth="3" strokeLinecap="round" />
                                <path d="M0 80 Q 40 20, 80 50 T 160 40 T 240 60 T 320 30 T 400 50 L 400 120 L 0 120 Z" fill="url(#chartGradient)" />
                            </svg>
                        </div>
                        <div className="flex justify-between mt-4">
                            {['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN'].map(m => (
                                <span key={m} className={`text-[9px] font-bold ${m === 'JUN' ? 'text-[#0081FF]' : 'text-gray-300'}`}>{m}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Pagamentos Atrasados</h4>
                        <button className="text-xs text-[#0081FF] font-bold">Ver todos</button>
                    </div>
                    <div className="space-y-3">
                        {overdueStudents.length > 0 ? (
                            overdueStudents.map(student => (
                                <div key={student.id} onClick={() => openStudentDetails(student)} className="bg-[#1A202C] p-4 rounded-[24px] border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={student.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                                        <div>
                                            <h5 className="text-sm font-bold text-white">{student.name}</h5>
                                            <p className="text-[10px] text-red-400 font-bold">5 dias de atraso</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                        <p className="text-sm font-black text-white">R$ {student.amount || 97},00</p>
                                        <span className="material-symbols-rounded text-red-500 text-lg">warning</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center bg-[#1A202C]/50 rounded-[24px] border border-dashed border-white/10 text-gray-500 text-xs">Nenhum pagamento atrasado ✨</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderStudentList = () => (
        <div className="px-6 py-6 space-y-8 flex-1 overflow-y-auto hide-scrollbar pb-24">
            <div>
                <div className="flex justify-between items-center mb-4 h-10">
                    {isSearchOpen ? (
                        <div className="flex-1 flex items-center bg-[#1A202C] rounded-xl px-3 border border-[#0081FF]">
                            <span className="material-symbols-rounded text-[#0081FF] text-sm">search</span>
                            <input type="text" autoFocus placeholder="Buscar aluno..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none text-white text-sm w-full h-10 px-2 focus:outline-none" />
                            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-gray-400 hover:text-white"><span className="material-symbols-rounded text-sm">close</span></button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-white">Meus Alunos</h3>
                            <button onClick={() => setIsSearchOpen(true)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"><span className="material-symbols-rounded text-sm">search</span></button>
                        </>
                    )}
                </div>
                <div className="space-y-3">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <div key={student.id} onClick={() => openStudentDetails(student)} className="flex items-center p-3 rounded-xl bg-[#1A202C] border border-white/5 hover:border-[#6F4CE7]/30 transition-all cursor-pointer group">
                                <img src={student.avatarUrl} alt={student.name} className={`w-12 h-12 rounded-full border-2 mr-4 ${student.status === 'active' ? 'border-green-500/50' : 'border-gray-600'}`} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-white truncate">{student.name}</h4>
                                    <div className="flex items-center gap-2">
                                        {student.modality && <span className={`text-[9px] uppercase font-bold ${student.modality === 'Online' ? 'text-[#0081FF]' : 'text-[#EE13CA]'}`}>{student.modality}</span>}
                                        <p className="text-xs text-gray-500">{student.scheduleDay ? `${student.scheduleDay} às ${student.scheduleTime}` : 'Sem horário'}</p>
                                    </div>
                                </div>
                                <span className="material-symbols-rounded text-gray-600 group-hover:text-white ml-2">chevron_right</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-sm">Nenhum aluno encontrado.</div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderPlaceholder = (title: string) => (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <span className="material-symbols-rounded text-4xl text-gray-600 mb-4">construction</span>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 italic">Esta funcionalidade está em desenvolvimento.</p>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'students': return renderStudentList();
            case 'reports': return renderPlaceholder('Relatórios Financeiros');
            case 'settings': return renderPlaceholder('Configurações do Painel');
            default: return renderDashboard();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#101622] relative">
            <header className="px-6 pt-12 pb-4 bg-[#101622] border-b border-white/5 flex justify-between items-center z-40">
                <div className="flex items-center gap-4">
                    <button className="text-white" onClick={() => onNavigate(Screen.LIBRARY)}>
                        <span className="material-symbols-rounded text-2xl">menu</span>
                    </button>
                    <h2 className="text-xl font-black text-white tracking-tight">Dashboard</h2>
                </div>
                <button onClick={() => setShowConfig(!showConfig)} className="relative">
                    <img src={user?.avatarUrl || 'https://picsum.photos/200'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-[#1A202C]" />
                    {showConfig && (
                        <div className="absolute right-0 top-12 w-48 bg-[#1A202C] rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                            <button onClick={onLogout} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm flex items-center gap-2 text-red-400 font-bold">
                                <span className="material-symbols-rounded text-lg">logout</span> Sair
                            </button>
                        </div>
                    )}
                </button>
            </header>

            {renderContent()}

            <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-[#0081FF] text-white shadow-lg flex items-center justify-center z-20 hover:scale-110 active:scale-95 transition-all">
                <span className="material-symbols-rounded text-3xl">add</span>
            </button>

            <div className="fixed bottom-0 inset-x-0 bg-[#101622] border-t border-white/5 px-6 py-3 flex justify-between items-center z-30 pb-8">
                {[
                    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
                    { id: 'students', icon: 'school', label: 'Alunos' },
                    { id: 'reports', icon: 'bar_chart', label: 'Relatórios' },
                    { id: 'settings', icon: 'settings', label: 'Ajustes' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-[#0081FF]' : 'text-gray-400'}`}>
                        <span className="material-symbols-rounded text-2xl">{tab.icon}</span>
                        <span className="text-[9px] font-bold uppercase">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Modals */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm bg-[#1A202C] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#151A23]">
                            <h3 className="font-bold text-white">Detalhes do Aluno</h3>
                            <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white"><span className="material-symbols-rounded">close</span></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="flex gap-4 items-center">
                                <img src={selectedStudent.avatarUrl} className="w-16 h-16 rounded-full border-2 border-[#0081FF]" alt="" />
                                <div>
                                    <h4 className="text-lg font-bold text-white">{selectedStudent.name}</h4>
                                    <p className="text-xs text-gray-500 uppercase font-black">{selectedStudent.modality} • {selectedStudent.level}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Pagamento</p>
                                    <p className="text-sm text-white">Dia {selectedStudent.paymentDay || '05'}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Agenda</p>
                                    <p className="text-sm text-white">{selectedStudent.scheduleDay} {selectedStudent.scheduleTime}</p>
                                </div>
                            </div>
                            <textarea
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                className="w-full h-32 bg-[#101622] rounded-xl border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-[#0081FF] resize-none"
                                placeholder="Observações..."
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedStudent(null)} className="flex-1 h-12 rounded-xl border border-white/10 text-gray-400 font-bold text-sm">Fechar</button>
                                <button onClick={handleSaveChanges} disabled={loadingAction} className="flex-1 h-12 rounded-xl bg-[#0081FF] text-white font-bold text-sm disabled:opacity-50">
                                    {loadingAction ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm bg-[#1A202C] rounded-2xl border border-white/10 shadow-2xl flex flex-col">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#151A23] rounded-t-2xl">
                            <h3 className="font-bold text-white">Novo Aluno</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white"><span className="material-symbols-rounded">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Nome do Aluno" className="w-full h-12 bg-[#101622] rounded-xl border border-white/10 px-4 text-white focus:outline-none focus:border-[#0081FF]" />
                            <div className="grid grid-cols-2 gap-3">
                                <select value={scheduleDay} onChange={(e) => setScheduleDay(e.target.value)} className="h-12 bg-[#101622] rounded-xl border border-white/10 px-3 text-white outline-none">
                                    {WEEK_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="h-12 bg-[#101622] rounded-xl border border-white/10 px-3 text-white outline-none" />
                            </div>
                            <button onClick={handleAddStudent} disabled={!newStudentName.trim() || loadingAction} className="w-full h-12 bg-[#0081FF] text-white font-bold rounded-xl shadow-lg disabled:opacity-50">
                                {loadingAction ? 'Salvando...' : 'Cadastrar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
