
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

export const TeacherDashboard: React.FC<Props> = ({ onNavigate, onLogout, initialTab = 'dashboard' }) => {
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

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'error' | 'loading'>('loading');

    // States Detalhes
    const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
    const [notesInput, setNotesInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editPhone, setEditPhone] = useState('');

    // States Edição Agendamento
    const [editScheduleDay, setEditScheduleDay] = useState('Seg');
    const [editScheduleTime, setEditScheduleTime] = useState('');
    const [editAge, setEditAge] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editInstagram, setEditInstagram] = useState('');
    const [editAmount, setEditAmount] = useState(97);
    const [editPaymentDay, setEditPaymentDay] = useState('05');
    const [editStatus, setEditStatus] = useState<'active' | 'blocked' | 'overdue'>('active');

    // Form Novo Aluno
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentAge, setNewStudentAge] = useState('');
    const [newStudentPhone, setNewStudentPhone] = useState('');
    const [newStudentAddress, setNewStudentAddress] = useState('');
    const [newStudentInstagram, setNewStudentInstagram] = useState('');
    const [newStudentNotes, setNewStudentNotes] = useState('');

    // Agendamento Novo Aluno
    const [scheduleDay, setScheduleDay] = useState('Seg');
    const [scheduleTime, setScheduleTime] = useState('14:00');

    const [newStudentLevel, setNewStudentLevel] = useState('Iniciante');
    const [newStudentModality, setNewStudentModality] = useState<'Online' | 'Presencial'>('Presencial');
    const [paymentDay, setPaymentDay] = useState('05');
    const [newStudentAmount, setNewStudentAmount] = useState('97');

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (force: boolean = false) => {
        setLoadingAction(true);
        try {
            const { data: sData, error: sError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student');

            if (sError) throw sError;

            if (sData) {
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
                    paymentDay: s.payment_day || '05',
                    notes: s.notes || '',
                    modality: s.modality || 'Online',
                    scheduleDay: s.schedule_day || 'Seg',
                    scheduleTime: s.schedule_time || '14:00',
                    amount: s.amount || 97,
                    address: s.address || '',
                    instagram: s.instagram || ''
                }));

                // Update local storage and state with fresh data from DB
                // SERVER IS SOURCE OF TRUTH
                localStorage.setItem('vocalizes_local_students', JSON.stringify(dbStudents));
                setStudents(dbStudents);

                if (force) alert('Dados atualizados com sucesso da nuvem! ☁️');
                setSyncStatus('synced');
            }
        } catch (error: any) {
            console.warn('Network/DB error, using fallback:', error);
            setSyncStatus('error');
            if (force) alert('Erro ao buscar dados. Verifique a conexão. ⚠️');

            // Emergency fallback for offline use
            const localData = localStorage.getItem('vocalizes_local_students');
            if (localData) {
                try {
                    setStudents(JSON.parse(localData));
                } catch (e) {
                    console.error('Local data corrupt:', e);
                }
            }
        } finally {
            setLoadingAction(false);
            if (syncStatus === 'loading') setSyncStatus('synced'); // Default to synced if no error caught initially
        }
    };

    const handleAddStudent = async () => {
        if (!newStudentName.trim() || !newStudentAge.trim() || !newStudentPhone.trim()) {
            alert('Por favor, preencha os campos obrigatórios: Nome, Idade e Telefone.');
            return;
        }
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
            notes: newStudentNotes,
            modality: newStudentModality,
            scheduleDay: scheduleDay,
            scheduleTime: scheduleTime,
            amount: parseInt(String(newStudentAmount)) || 97,
            address: newStudentAddress,
            instagram: newStudentInstagram
        };

        try {
            const { data, error } = await supabase.from('profiles').insert([{
                name: newStudentName,
                role: 'student',
                avatar_url: avatarUrl,
                phone: newStudentPhone || null,
                age: newStudentAge ? parseInt(newStudentAge) : null,
                modality: newStudentModality,
                schedule_day: scheduleDay,
                schedule_time: scheduleTime,
                instagram: newStudentInstagram || null,
                address: newStudentAddress || null,
                notes: newStudentNotes || null,
                amount: parseInt(String(newStudentAmount)) || 97,
                payment_day: paymentDay
            }]).select();

            if (error) throw error;

            const savedStudent = data?.[0];
            const newStudentLocal: StudentSummary = {
                id: savedStudent?.id || fakeId,
                name: newStudentName,
                avatarUrl,
                level: newStudentLevel,
                lastPractice: 'Nunca',
                progress: 0,
                status: 'active',
                age: newStudentAge,
                phone: newStudentPhone,
                paymentDay: paymentDay,
                notes: newStudentNotes,
                modality: newStudentModality,
                scheduleDay: scheduleDay,
                scheduleTime: scheduleTime,
                amount: parseInt(String(newStudentAmount)) || 97,
                address: newStudentAddress,
                instagram: newStudentInstagram
            };

            const existingLocal = localStorage.getItem('vocalizes_local_students');
            const localList = existingLocal ? JSON.parse(existingLocal) : [];
            localList.push(newStudentLocal);
            localStorage.setItem('vocalizes_local_students', JSON.stringify(localList));

            setStudents(prev => [...prev, newStudentLocal]);

            // Reset fields
            setNewStudentName('');
            setNewStudentAge('');
            setNewStudentPhone('');
            setNewStudentAddress('');
            setNewStudentInstagram('');
            setNewStudentNotes('');
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
        setEditAge(student.age || '');
        setEditAddress(student.address || '');
        setEditInstagram(student.instagram || '');
        setEditAmount(student.amount || 97);
        setEditAmount(student.amount || 97);
        setEditPaymentDay(student.paymentDay || '05');
        setEditStatus(student.status as any || 'active');
        setIsEditing(false);
    };

    const openWhatsApp = (phone: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone) return;
        const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        window.open(`https://wa.me/${finalPhone}`, '_blank');
    };

    const handleSaveChanges = async () => {
        if (!selectedStudent) return;
        setLoadingAction(true);
        const updatedStudent: StudentSummary = {
            ...selectedStudent,
            notes: notesInput,
            phone: editPhone,
            scheduleDay: editScheduleDay,
            scheduleTime: editScheduleTime,
            age: editAge,
            address: editAddress,
            instagram: editInstagram,
            amount: editAmount,
            paymentDay: editPaymentDay,
            status: editStatus
        };

        try {
            const { data, error } = await supabase.from('profiles').update({
                phone: editPhone,
                notes: notesInput,
                schedule_day: editScheduleDay,
                schedule_time: editScheduleTime,
                age: editAge ? parseInt(editAge) : null,
                address: editAddress,
                instagram: editInstagram,
                amount: editAmount,
                payment_day: editPaymentDay,
                status: editStatus
            }).eq('id', selectedStudent.id).select();

            if (error) throw error;

            if (!data || data.length === 0) {
                alert('⚠️ Atenção: As alterações NÃO foram salvas no servidor. \n\nIsso acontece se você não tiver permissão para editar este aluno. As mudanças serão perdidas ao recarregar o app.');
            }

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

    const handleDeleteStudent = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedStudent) return;
        const studentId = selectedStudent.id;
        setLoadingAction(true);
        try {
            const { data, error } = await supabase.from('profiles').delete().eq('id', studentId).select();

            if (error) {
                console.error('Delete error:', error);
                alert('Erro ao excluir do servidor: ' + error.message);
                return;
            }

            if (!data || data.length === 0) {
                console.warn('No rows deleted from Supabase. Check RLS policies.');
                alert('⚠️ Atenção: O aluno foi removido da sua tela, mas o servidor NÃO permitiu a exclusão permanente no banco de dados. \n\nIsso geralmente acontece quando você não tem permissão de "Professor Administrador" para este registro. Após recarregar, o aluno voltará.');
            }

            const existingLocal = localStorage.getItem('vocalizes_local_students');
            if (existingLocal) {
                const localList: StudentSummary[] = JSON.parse(existingLocal);
                const updatedList = localList.filter(s => s.id !== studentId);
                localStorage.setItem('vocalizes_local_students', JSON.stringify(updatedList));
            }

            setStudents(prev => prev.filter(s => s.id !== studentId));
            setSelectedStudent(null);
            setShowDeleteConfirm(false);
        } catch (err: any) {
            console.error(err);
            alert('Erro inesperado: ' + err.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDownloadTXT = () => {
        if (students.length === 0) return;

        const header = `LISTA DE ALUNOS - ACADEMIA VOZ QUE CONQUISTA\nData de Exportação: ${new Date().toLocaleDateString('pt-BR')}\n${'='.repeat(50)}\n\n`;
        const content = students.map((s, idx) => {
            return `${idx + 1}. ${s.name.toUpperCase()}\n` +
                `   Status: ${s.status === 'active' ? 'ATIVO' : s.status === 'overdue' ? 'PENDENTE' : 'INATIVO'}\n` +
                `   Plano: ${s.plan || 'Pro'}\n` +
                `   Vencimento: Dia ${s.paymentDay || '05'}\n` +
                `   Telefone: ${s.phone || 'Não informado'}\n` +
                `   Agendamento: ${s.scheduleDay || '---'} às ${s.scheduleTime || '--:--'}\n` +
                `   Obs: ${s.notes || 'Nenhuma'}\n` +
                `${'-'.repeat(30)}`;
        }).join('\n\n');

        const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Alunos_AcademiaVoz_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const renderFinancial = () => {
        const totalReceived = students.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.amount || 0), 0);
        const totalPending = students.filter(s => s.status === 'overdue').reduce((acc, s) => acc + (s.amount || 0), 0);
        const overdueStudents = students.filter(s => s.status === 'overdue' || s.status === 'blocked');

        // Mock data for chart - in a real app this would come from historical table
        const chartData = [10, 25, 18, 32, 28, 45]; // Simple relative points
        const maxVal = Math.max(...chartData);
        const points = chartData.map((val, idx) => {
            const x = (idx / (chartData.length - 1)) * 100;
            const y = 100 - ((val / maxVal) * 100);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 px-6 pt-6">
                    <div className="bg-white rounded-[24px] p-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3 relative z-10">
                            <span className="material-symbols-rounded">arrow_upward</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Recebido (Mês)</p>
                        <h3 className="text-2xl font-black text-[#101622]">R$ {totalReceived.toLocaleString('pt-BR')}</h3>
                        <p className="text-[10px] text-green-600 font-bold flex items-center mt-1">
                            <span className="material-symbols-rounded text-sm mr-0.5">trending_up</span> +12% vs mês anterior
                        </p>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-3 relative z-10">
                            <span className="material-symbols-rounded">priority_high</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pendente</p>
                        <h3 className="text-2xl font-black text-[#101622]">R$ {totalPending.toLocaleString('pt-BR')}</h3>
                        <p className="text-[10px] text-orange-500 font-bold flex items-center mt-1">
                            <span className="material-symbols-rounded text-sm mr-0.5">warning</span> Ação necessária
                        </p>
                    </div>
                </div>

                {/* Revenue Chart Section */}
                <div className="px-6 mt-6">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Tendência de Receita</p>
                                <h3 className="text-3xl font-black text-[#101622]">R$ 152k <span className="text-sm font-bold text-green-500 bg-green-100 px-2 py-0.5 rounded-full ml-1">+8.5%</span></h3>
                                <p className="text-xs text-gray-400 mt-1">Últimos 6 meses</p>
                            </div>
                        </div>

                        <div className="h-32 w-full relative">
                            {/* Simple SVG Chart */}
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                {/* Gradient Defs */}
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#0081FF" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#0081FF" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Area Path */}
                                <path
                                    d={`M0,100 L${points} L100,100 Z`}
                                    fill="url(#chartGradient)"
                                />

                                {/* Line Path */}
                                <path
                                    d={`M${points}`}
                                    fill="none"
                                    stroke="#0081FF"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Points */}
                                {chartData.map((val, idx) => {
                                    const x = (idx / (chartData.length - 1)) * 100;
                                    const y = 100 - ((val / maxVal) * 100);
                                    return (
                                        <circle key={idx} cx={x} cy={y} r="2" fill="white" stroke="#0081FF" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                    );
                                })}
                            </svg>

                            {/* X Axis Labels */}
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mt-4">
                                <span>Jan</span>
                                <span>Fev</span>
                                <span>Mar</span>
                                <span>Abr</span>
                                <span>Mai</span>
                                <span>Jun</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overdue List */}
                <div className="px-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-black text-white tracking-tight">Pagamentos Atrasados</h4>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setActiveTab('students');
                            }}
                            className="text-xs text-[#0081FF] font-bold hover:underline"
                        >
                            Ver todos
                        </button>
                    </div>
                    <div className="space-y-3">
                        {overdueStudents.length > 0 ? (
                            overdueStudents.map(student => (
                                <div key={student.id} onClick={() => openStudentDetails(student)} className="bg-white p-4 rounded-[24px] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={student.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                                                <span className="material-symbols-rounded text-[10px] font-bold">!</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-[#101622]">{student.name}</h5>
                                            <p className="text-[10px] text-red-500 font-bold">5 dias de atraso</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#101622]">R$ {student.amount || 97},00</p>
                                        <span className="material-symbols-rounded text-red-500 text-lg opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">arrow_forward</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center bg-[#1A202C]/50 rounded-[24px] border border-dashed border-white/10 text-gray-500 text-xs">
                                <span className="material-symbols-rounded text-2xl mb-1 block opacity-50">task_alt</span>
                                Nenhum pagamento atrasado ✨
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderSettings = () => {
        return (
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
                <div className="px-6 pt-6 space-y-6">
                    <section className="space-y-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Escola & Administração</p>
                        <div className="bg-[#1A202C] rounded-3xl border border-white/5 overflow-hidden">
                            {[
                                { icon: 'edit', label: 'Editar Perfil Profissional', color: 'text-blue-400' },
                                { icon: 'schedule', label: 'Horários Disponíveis', color: 'text-purple-400' },
                                { icon: 'history', label: 'Histórico de Atendimentos', color: 'text-orange-400' },
                                { icon: 'description', label: 'Modelo de Contrato Padrao', color: 'text-green-400' }
                            ].map((item, idx) => (
                                <button key={idx} className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all ${idx !== 0 ? 'border-t border-white/5' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-rounded ${item.color}`}>{item.icon}</span>
                                        <span className="text-sm text-gray-200">{item.label}</span>
                                    </div>
                                    <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Suporte & App</p>
                        <div className="bg-[#1A202C] rounded-3xl border border-white/5 overflow-hidden">
                            {[
                                { icon: 'help', label: 'Central de Ajuda', color: 'text-gray-400' },
                                { icon: 'bug_report', label: 'Reportar um Problema', color: 'text-red-400' },
                                { icon: 'info', label: 'Sobre o App', color: 'text-blue-400' }
                            ].map((item, idx) => (
                                <button key={idx} className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all ${idx !== 0 ? 'border-t border-white/5' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-rounded ${item.color}`}>{item.icon}</span>
                                        <span className="text-sm text-gray-200">{item.label}</span>
                                    </div>
                                    <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <button
                        onClick={onLogout}
                        className="w-full p-4 bg-red-500/10 rounded-3xl border border-red-500/20 text-red-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded text-lg">logout</span>
                        Encerrar Sessão
                    </button>

                    <p className="text-center text-[10px] text-gray-700 font-bold uppercase py-4">Versão 1.2.0-beta • 2026</p>
                </div>
            </div>
        );
    };

    const renderAgenda = () => {
        const getWeekDates = (date: Date) => {
            const current = new Date(date);
            const first = current.getDate() - (current.getDay() === 0 ? 6 : current.getDay() - 1); // Start from Monday
            const week = [];
            for (let i = 0; i < 7; i++) {
                const day = new Date(current.setDate(first + i));
                week.push({
                    date: new Date(day),
                    dayName: WEEK_DAYS[i].charAt(0),
                    dayNum: day.getDate().toString().padStart(2, '0'),
                    fullDayName: WEEK_DAYS[i],
                    active: day.toDateString() === selectedDate.toDateString()
                });
            }
            return week;
        };

        const weekDates = getWeekDates(selectedDate);
        const selectedDayLabel = WEEK_DAYS[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1];

        const dayAppointments = students.filter(s => s.scheduleDay === selectedDayLabel).map(s => ({
            id: s.id,
            studentName: s.name,
            time: s.scheduleTime || '00:00',
            endTime: s.scheduleTime ? (() => {
                const [h, m] = s.scheduleTime.split(':');
                const date = new Date();
                date.setHours(parseInt(h), parseInt(m) + 60);
                return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            })() : '01:00',
            type: `${s.level} • ${s.modality}`,
            paymentStatus: s.status,
            avatarUrl: s.avatarUrl,
            phone: s.phone
        })).sort((a, b) => a.time.localeCompare(b.time));

        const totalReceived = students.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.amount || 0), 0);
        const studentsTodayCount = dayAppointments.length;
        const pendingPaymentsCount = students.filter(s => s.status === 'overdue').length;

        return (
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
                <div className="grid grid-cols-3 gap-3 px-6 pt-6">
                    <div className="bg-[#1A202C] rounded-[24px] p-4 border border-white/5 flex flex-col justify-between">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Agenda</p>
                        <h3 className="text-xl font-black text-white">{studentsTodayCount}</h3>
                    </div>
                    <div className="bg-[#1A202C] rounded-[24px] p-4 border border-white/5 flex flex-col justify-between">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Recebido</p>
                        <h3 className="text-xl font-black text-green-400">R$ {totalReceived}</h3>
                    </div>
                    <div className="bg-[#1A202C] rounded-[24px] p-4 border border-white/5 flex flex-col justify-between">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Pendente</p>
                        <h3 className="text-xl font-black text-red-400">{pendingPaymentsCount}</h3>
                    </div>
                </div>

                <div className="px-6 mt-6">
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <button onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() - 7);
                                setSelectedDate(newDate);
                            }} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                                <span className="material-symbols-rounded text-gray-400 text-lg">chevron_left</span>
                            </button>
                            <p className="text-sm font-black text-white">
                                {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                            </p>
                            <button onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() + 7);
                                setSelectedDate(newDate);
                            }} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                                <span className="material-symbols-rounded text-gray-400 text-lg">chevron_right</span>
                            </button>
                        </div>
                        <div className="flex justify-between">
                            {weekDates.map((date, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(date.date)}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">{date.dayName}</span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${date.active ? 'bg-[#0081FF] text-white shadow-lg shadow-blue-500/20 scale-110' : 'text-white hover:bg-white/5'}`}>
                                        {date.dayNum}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-white tracking-tight">Agenda - {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</h3>
                    </div>

                    <div className="space-y-4">
                        {dayAppointments.length > 0 ? (
                            dayAppointments.map((apt: any) => (
                                <div key={apt.id} className="bg-[#1A202C] rounded-[24px] p-4 border border-white/5 flex items-center gap-4 relative overflow-hidden">
                                    {apt.paymentStatus === 'overdue' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}

                                    <div className="text-center min-w-[60px]">
                                        <p className="text-sm font-black text-white">{apt.time}</p>
                                        <p className="text-[10px] text-gray-500 font-bold">{apt.endTime}</p>
                                    </div>

                                    <div className="flex-1 flex items-center gap-3 min-w-0">
                                        <img src={apt.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-[#1A202C]" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="text-sm font-bold text-white truncate">{apt.studentName}</h4>
                                            </div>
                                            <p className="text-[10px] text-gray-500 truncate mb-1">{apt.type}</p>
                                            <div className="flex items-center gap-1">
                                                {apt.paymentStatus === 'overdue' ? (
                                                    <div className="flex items-center gap-1 text-[9px] text-red-500 font-bold uppercase">
                                                        <span className="material-symbols-rounded text-[12px]">error</span> Pendente
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-[9px] text-green-500 font-bold uppercase">
                                                        <span className="material-symbols-rounded text-[12px]">check_circle</span> Em dia
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                const student = students.find(s => s.name === apt.studentName);
                                                if (student) openStudentDetails(student);
                                            }}
                                            className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                                        >
                                            <span className="material-symbols-rounded text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const student = students.find(s => s.name === apt.studentName);
                                                if (student && student.phone) openWhatsApp(student.phone);
                                            }}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${apt.paymentStatus === 'overdue' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                        >
                                            <span className="material-symbols-rounded text-lg">{apt.paymentStatus === 'overdue' ? 'notifications_active' : 'schedule'}</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center bg-[#1A202C]/50 rounded-[32px] border border-dashed border-white/10 px-6">
                                <span className="material-symbols-rounded text-4xl text-gray-600 mb-2">calendar_today</span>
                                <p className="text-gray-500 text-sm font-medium">Nenhum aluno agendado para este dia.</p>
                                <p className="text-[10px] text-gray-600 uppercase font-black mt-1 mb-4">Verifique outros dias ou adicione um novo</p>
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-[#0081FF] uppercase tracking-wider hover:bg-white/10 transition-all"
                                >
                                    <span className="material-symbols-rounded text-sm">groups</span>
                                    Ver todos os alunos cadastrados
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderStudentList = () => {
        return (
            <div className="flex-1 flex flex-col bg-[#101622] overflow-hidden">
                <div className="px-6 pt-6 pb-2">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-500">search</span>
                        <input
                            type="text"
                            placeholder="Buscar aluno por nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 bg-[#1A202C] rounded-2xl border border-white/5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#0081FF] transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4 space-y-4 pb-32">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total: {students.length} alunos cadastrados</p>
                        <button onClick={handleDownloadTXT} className="text-[10px] font-black text-[#0081FF] uppercase flex items-center gap-1 hover:underline">
                            <span className="material-symbols-rounded text-sm">download</span> Exportar .TXT
                        </button>
                    </div>

                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <button
                                key={student.id}
                                onClick={() => openStudentDetails(student)}
                                className="w-full bg-[#1A202C] p-4 rounded-3xl border border-white/5 flex items-center justify-between hover:border-white/10 active:scale-[0.98] transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={student.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-[#101622]" alt="" />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1A202C] ${student.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{student.name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{student.modality} • {student.level}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Pagamento</p>
                                    <p className="text-xs font-black text-white">Dia {student.paymentDay || '05'}</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-[#1A202C]/30 rounded-3xl border border-dashed border-white/5">
                            <span className="material-symbols-rounded text-5xl text-gray-700 mb-4">person_search</span>
                            <p className="text-gray-500 text-sm font-medium">Nenhum aluno encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPlaceholder = (title: string) => (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <span className="material-symbols-rounded text-4xl text-gray-600 mb-4">construction</span>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 italic">Esta funcionalidade está em desenvolvimento.</p>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return renderAgenda();
            case 'students': return renderStudentList();
            case 'reports': return renderFinancial();
            case 'settings': return renderSettings();
            default: return renderAgenda();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#101622] relative">
            <header className="px-6 pt-12 pb-4 bg-[#101622] border-b border-white/5 flex justify-between items-center z-40">
                <div className="flex items-center gap-4">
                    <button className="text-white" onClick={() => onNavigate(Screen.LIBRARY)}>
                        <span className="material-symbols-rounded text-2xl">menu</span>
                    </button>
                    <h2 className="text-xl font-black text-white tracking-tight">
                        {activeTab === 'dashboard' ? 'Agenda' : activeTab === 'students' ? 'Alunos' : activeTab === 'reports' ? 'Financeiro' : 'Ajustes'}
                    </h2>
                </div>
                <button onClick={() => setShowConfig(!showConfig)} className="relative">
                    <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-[#101622] z-10 ${syncStatus === 'synced' ? 'bg-green-500' :
                        syncStatus === 'error' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                        }`}></div>
                    <img src={user?.avatarUrl || 'https://picsum.photos/200'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-[#1A202C]" />
                    {showConfig && (
                        <div className="absolute right-0 top-12 w-48 bg-[#1A202C] rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                            <button onClick={() => fetchData(true)} className="w-full text-left px-3 py-3 hover:bg-white/5 text-sm flex items-center gap-2 text-blue-400 font-bold border-b border-white/5">
                                <span className="material-symbols-rounded text-lg">sync</span> Atualizar
                            </button>
                            <button onClick={onLogout} className="w-full text-left px-3 py-3 hover:bg-white/5 text-sm flex items-center gap-2 text-red-400 font-bold">
                                <span className="material-symbols-rounded text-lg">logout</span> Sair
                            </button>
                        </div>
                    )}
                </button>
            </header>

            {renderContent()}

            {/* Botão de Add - agora absolute para respeitar o max-w do container pai */}
            <button onClick={() => setIsAddModalOpen(true)} className="absolute bottom-28 right-6 w-14 h-14 rounded-full bg-[#0081FF] text-white shadow-lg flex items-center justify-center z-20 hover:scale-110 active:scale-95 transition-all">
                <span className="material-symbols-rounded text-3xl">add</span>
            </button>

            <div className="fixed bottom-0 inset-x-0 bg-[#101622] border-t border-white/5 px-6 py-3 flex justify-between items-center z-30 pb-8">
                {[
                    { id: 'dashboard', icon: 'calendar_month', label: 'Início' },
                    { id: 'students', icon: 'groups', label: 'Alunos' },
                    { id: 'reports', icon: 'payments', label: 'Financeiro' },
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
                                    <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${selectedStudent.status === 'blocked'
                                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                        : 'bg-green-500/20 border-green-500/30 text-green-400'
                                        }`}>
                                        <span className="material-symbols-rounded text-[14px]">
                                            {selectedStudent.status === 'blocked' ? 'lock' : 'check_circle'}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase">
                                            {selectedStudent.status === 'blocked' ? 'Bloqueado' : 'Ativo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Control Toggle */}
                            <div className="p-4 bg-[#101622] rounded-xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">Acesso ao App</p>
                                    <p className="text-[10px] text-gray-500">Bloquear acesso em caso de pendência</p>
                                </div>
                                <div className="flex bg-[#1A202C] p-1 rounded-lg border border-white/5">
                                    <button
                                        onClick={() => setEditStatus('active')}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${editStatus === 'active' || editStatus === 'overdue'
                                            ? 'bg-green-500 text-white'
                                            : 'text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-rounded text-[14px]">check</span> Liberado
                                    </button>
                                    <button
                                        onClick={() => setEditStatus('blocked')}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${editStatus === 'blocked'
                                            ? 'bg-red-500 text-white'
                                            : 'text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-rounded text-[14px]">lock</span> Bloqueado
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Pagamento</p>
                                    <select
                                        value={editPaymentDay}
                                        onChange={(e) => setEditPaymentDay(e.target.value)}
                                        className="w-full bg-transparent border-none text-white text-sm focus:outline-none appearance-none"
                                    >
                                        {['01', '05', '10', '15', '20', '25'].map(d => (
                                            <option key={d} value={d} className="bg-[#1A202C]">Dia {d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Agenda</p>
                                    <p className="text-sm text-white">{selectedStudent.scheduleDay} {selectedStudent.scheduleTime}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Idade</p>
                                    <input
                                        type="number"
                                        value={editAge}
                                        onChange={(e) => setEditAge(e.target.value)}
                                        className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
                                        placeholder="Idade"
                                    />
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Mensalidade</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-white text-sm">R$</span>
                                        <input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(parseInt(e.target.value) || 0)}
                                            className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Redes Sociais & Contato</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500 text-sm">@</span>
                                    <input
                                        type="text"
                                        value={editInstagram}
                                        onChange={(e) => setEditInstagram(e.target.value)}
                                        placeholder="Instagram"
                                        className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-3 border-t border-white/5 pt-2">
                                    <span className="material-symbols-rounded text-gray-500 text-sm">location_on</span>
                                    <input
                                        type="text"
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        placeholder="Endereço"
                                        className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-3 border-t border-white/5 pt-2">
                                    <span className="material-symbols-rounded text-gray-500 text-sm">call</span>
                                    <input
                                        type="text"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        placeholder="Telefone"
                                        className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none"
                                    />
                                    <button
                                        onClick={() => openWhatsApp(editPhone)}
                                        className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500/30 transition-all"
                                    >
                                        <span className="material-symbols-rounded text-lg">chat</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase ml-1">Observações de desenvolvimento</p>
                                <textarea
                                    value={notesInput}
                                    onChange={(e) => setNotesInput(e.target.value)}
                                    className="w-full h-32 bg-[#101622] rounded-xl border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-[#0081FF] resize-none"
                                    placeholder="Escreva aqui a evolução do aluno..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteStudent();
                                    }}
                                    disabled={loadingAction}
                                    className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all border border-red-500/20"
                                    title="Excluir Aluno"
                                >
                                    <span className="material-symbols-rounded">delete</span>
                                </button>
                                <button onClick={() => setSelectedStudent(null)} className="flex-1 h-12 rounded-xl border border-white/10 text-gray-400 font-bold text-sm">Fechar</button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSaveChanges();
                                    }}
                                    disabled={loadingAction}
                                    className="flex-1 h-12 rounded-xl bg-[#0081FF] text-white font-bold text-sm disabled:opacity-50"
                                >
                                    {loadingAction ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pop-up de Confirmação customizado */}
                    {showDeleteConfirm && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-200">
                            <div className="w-full max-w-[280px] bg-[#1A202C] rounded-[32px] border border-white/10 p-8 shadow-2xl flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-6">
                                    <span className="material-symbols-rounded text-3xl">delete_forever</span>
                                </div>
                                <h3 className="text-white font-black text-lg mb-2">Excluir Aluno?</h3>
                                <p className="text-gray-400 text-sm mb-8 leading-relaxed">Esta ação não pode ser desfeita. Deseja continuar?</p>

                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="h-12 rounded-2xl bg-white/5 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        NÃO
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={loadingAction}
                                        className="h-12 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {loadingAction ? '...' : 'SIM'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isAddModalOpen && (
                <div className="absolute inset-0 z-[60] flex flex-col bg-[#101622] animate-in slide-in-from-bottom duration-300">
                    <div className="w-full h-full flex flex-col">
                        {/* Header - Alinhado com o estilo mobile do app */}
                        <div className="px-6 pt-12 pb-4 flex justify-between items-center border-b border-white/5 bg-[#151A23]">
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/5 transition-colors">
                                <span className="material-symbols-rounded text-2xl">close</span>
                            </button>
                            <h3 className="text-lg font-black text-white">Novo Aluno</h3>
                            <button
                                onClick={handleAddStudent}
                                disabled={!newStudentName.trim() || !newStudentAge.trim() || !newStudentPhone.trim() || loadingAction}
                                className="text-[#0081FF] font-black text-sm uppercase tracking-wider disabled:opacity-30 px-2"
                            >
                                {loadingAction ? '...' : 'Salvar'}
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 hide-scrollbar">

                            {/* Dados Pessoais */}
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
                                            value={newStudentName}
                                            onChange={(e) => setNewStudentName(e.target.value)}
                                            placeholder="Ex: Maria Silva"
                                            className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-1">
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Idade</p>
                                            <input
                                                type="number"
                                                value={newStudentAge}
                                                onChange={(e) => setNewStudentAge(e.target.value)}
                                                placeholder="25"
                                                className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-all text-center"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Endereço</p>
                                            <input
                                                type="text"
                                                value={newStudentAddress}
                                                onChange={(e) => setNewStudentAddress(e.target.value)}
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
                                                value={newStudentPhone}
                                                onChange={(e) => setNewStudentPhone(e.target.value)}
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
                                                value={newStudentInstagram}
                                                onChange={(e) => setNewStudentInstagram(e.target.value)}
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
                                                onClick={() => setNewStudentModality('Presencial')}
                                                className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${newStudentModality === 'Presencial' ? 'bg-[#0081FF] text-white shadow-lg' : 'text-gray-400'}`}
                                            >
                                                <span className="material-symbols-rounded text-lg">location_on</span> Presencial
                                            </button>
                                            <button
                                                onClick={() => setNewStudentModality('Online')}
                                                className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${newStudentModality === 'Online' ? 'bg-[#0081FF] text-white shadow-lg' : 'text-gray-400'}`}
                                            >
                                                <span className="material-symbols-rounded text-lg">videocam</span> Online
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Classificação Vocal</p>
                                        <div className="relative">
                                            <select
                                                value={newStudentLevel}
                                                onChange={(e) => setNewStudentLevel(e.target.value)}
                                                className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none appearance-none"
                                            >
                                                {['Iniciante', 'Intermediário', 'Avançado'].map(l => (
                                                    <option key={l} value={l} className="bg-[#1A202C]">{l}</option>
                                                ))}
                                            </select>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-500 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Dia do Vencimento</p>
                                            <select
                                                value={paymentDay}
                                                onChange={(e) => setPaymentDay(e.target.value)}
                                                className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none"
                                            >
                                                {['01', '05', '10', '15', '20', '25'].map(d => (
                                                    <option key={d} value={d} className="bg-[#1A202C]">{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Valor Mensal (R$)</p>
                                            <input
                                                type="number"
                                                value={newStudentAmount}
                                                onChange={(e) => setNewStudentAmount(e.target.value)}
                                                placeholder="97"
                                                className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Dia da Aula</p>
                                            <select value={scheduleDay} onChange={(e) => setScheduleDay(e.target.value)} className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none">
                                                {WEEK_DAYS.map(d => <option key={d} value={d} className="bg-[#1A202C]">{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Horário</p>
                                            <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Outros */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-rounded text-[#0081FF] text-lg">description</span>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outros</h4>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Anotações</p>
                                    <textarea
                                        value={newStudentNotes}
                                        onChange={(e) => setNewStudentNotes(e.target.value)}
                                        placeholder="Observações importantes sobre o aluno..."
                                        className="w-full h-32 bg-white/5 rounded-2xl border border-white/5 p-4 text-white focus:outline-none focus:border-[#0081FF] resize-none transition-all"
                                    />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
