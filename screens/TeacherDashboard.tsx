
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
    const [selectedDate, setSelectedDate] = useState(new Date());

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
                    amount: s.amount || 97,
                    address: s.address || '',
                    instagram: s.instagram || ''
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
            notes: newStudentNotes,
            modality: newStudentModality,
            scheduleDay: scheduleDay,
            scheduleTime: scheduleTime,
            amount: 97,
            address: newStudentAddress,
            instagram: newStudentInstagram
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
                schedule_time: scheduleTime,
                instagram: newStudentInstagram || null,
                address: newStudentAddress || null,
                notes: newStudentNotes || null
            }]);

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
            amount: editAmount
        };

        try {
            await supabase.from('profiles').update({
                phone: editPhone,
                notes: notesInput,
                schedule_day: editScheduleDay,
                schedule_time: editScheduleTime,
                age: editAge ? parseInt(editAge) : null,
                address: editAddress,
                instagram: editInstagram,
                amount: editAmount
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

    const handleDeleteStudent = async (studentId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;
        setLoadingAction(true);
        try {
            await supabase.from('profiles').delete().eq('id', studentId);

            const existingLocal = localStorage.getItem('vocalizes_local_students');
            if (existingLocal) {
                const localList: StudentSummary[] = JSON.parse(existingLocal);
                const updatedList = localList.filter(s => s.id !== studentId);
                localStorage.setItem('vocalizes_local_students', JSON.stringify(updatedList));
            }

            setStudents(prev => prev.filter(s => s.id !== studentId));
            setSelectedStudent(null);
        } catch (err) {
            console.error(err);
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

        return (
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
                <div className="grid grid-cols-2 gap-4 px-6 pt-6">
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-3">
                            <span className="material-symbols-rounded">arrow_upward</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Recebido (Mês)</p>
                        <h3 className="text-xl font-black text-white">R$ {totalReceived.toLocaleString('pt-BR')}</h3>
                    </div>
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-3">
                            <span className="material-symbols-rounded">priority_high</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pendente</p>
                        <h3 className="text-xl font-black text-white">R$ {totalPending.toLocaleString('pt-BR')}</h3>
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
                                            <p className="text-[10px] text-red-400 font-bold">Atrasado</p>
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

        const studentsTodayCount = dayAppointments.length;
        const pendingPaymentsCount = students.filter(s => s.status === 'overdue').length;

        return (
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
                <div className="grid grid-cols-2 gap-4 px-6 pt-6">
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[12px] text-gray-400 font-bold">Agenda Hoje</p>
                            <span className="material-symbols-rounded text-blue-500 text-xl">groups</span>
                        </div>
                        <h3 className="text-3xl font-black text-white">{studentsTodayCount}</h3>
                    </div>
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[12px] text-gray-400 font-bold">Pendentes</p>
                            <span className="material-symbols-rounded text-red-500 text-xl">warning</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-white">{pendingPaymentsCount}</h3>
                            <span className="text-[10px] text-red-500 font-bold uppercase">Atrasados</span>
                        </div>
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
                        <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                            <span className="material-symbols-rounded">search</span>
                        </button>
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
                                        <img src={apt.avatarUrl} className={`w-12 h-12 rounded-full object-cover border-2 ${apt.inactive ? 'border-gray-700 grayscale' : 'border-[#1A202C]'}`} alt="" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className={`text-sm font-bold truncate ${apt.inactive ? 'text-gray-500' : 'text-white'}`}>{apt.studentName}</h4>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${apt.inactive ? 'bg-gray-800 text-gray-500' : 'bg-green-500/10 text-green-500'}`}>
                                                    {apt.inactive ? 'Inativo' : 'Ativo'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 truncate mb-1">{apt.type}</p>
                                            <div className="flex items-center gap-1">
                                                {apt.inactive ? (
                                                    <span className="text-[9px] text-gray-500 font-bold">Sem pagamentos</span>
                                                ) : apt.paymentStatus === 'overdue' ? (
                                                    <div className="flex items-center gap-1 text-[9px] text-red-500 font-bold uppercase">
                                                        <span className="material-symbols-rounded text-[12px]">error</span> Pagamento Pendente
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
            case 'settings': return renderPlaceholder('Configurações do Painel');
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
                                    onClick={() => handleDeleteStudent(selectedStudent.id)}
                                    disabled={loadingAction}
                                    className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all border border-red-500/20"
                                    title="Excluir Aluno"
                                >
                                    <span className="material-symbols-rounded">delete</span>
                                </button>
                                <button onClick={() => setSelectedStudent(null)} className="flex-1 h-12 rounded-xl border border-white/10 text-gray-400 font-bold text-sm">Fechar</button>
                                <button onClick={handleSaveChanges} disabled={loadingAction} className="flex-1 h-12 rounded-xl bg-[#0081FF] text-white font-bold text-sm disabled:opacity-50">
                                    {loadingAction ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>
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
                                disabled={!newStudentName.trim() || loadingAction}
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
