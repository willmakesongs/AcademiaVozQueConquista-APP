
import React, { useState, useEffect } from 'react';
import { Screen, StudentSummary, StudyPlan, LessonReport, AttendanceRecord, Task } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { RoutineManager } from '../components/RoutineManager';

interface Props {
    studentId: string;
    onBack: () => void;
    onNavigate: (screen: Screen, studentId?: string) => void;
}

export const StudentDetailDashboard: React.FC<Props> = ({ studentId, onBack, onNavigate }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || (user?.email && ['lorenapimenteloficial@gmail.com', 'willmakesongs@gmail.com'].includes(user.email.toLowerCase().trim()));

    const [student, setStudent] = useState<StudentSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pedagogy' | 'finance'>('pedagogy');

    // Dados Pedagógicos
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [lessonReports, setLessonReports] = useState<LessonReport[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

    // States Modais
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isRoutineManagerOpen, setIsRoutineManagerOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edição
    const [editingReport, setEditingReport] = useState<LessonReport | null>(null);
    const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null);

    // Edição Financeira (Admin apenas)
    const [isEditingFinance, setIsEditingFinance] = useState(false);
    const [editAmount, setEditAmount] = useState<string>('');
    const [editPaymentDay, setEditPaymentDay] = useState<string>('');

    // Form Fields
    const [newReportSummary, setNewReportSummary] = useState('');
    const [newReportHomework, setNewReportHomework] = useState('');
    const [newAttendanceStatus, setNewAttendanceStatus] = useState<'present' | 'absent' | 'replaced' | 'to_be_replaced'>('present');
    const [newPlanTitle, setNewPlanTitle] = useState('');
    const [newPlanContent, setNewPlanContent] = useState('');

    // Visualizador de Foto
    const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);

    // Notificação
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationBody, setNotificationBody] = useState('');

    useEffect(() => {
        const fetchStudent = async () => {
            if (!studentId) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', studentId)
                    .single();

                if (data) {
                    setStudent({
                        id: data.id,
                        name: data.name,
                        avatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
                        level: data.level || 'Iniciante',
                        lastPractice: 'Hoje',
                        progress: 0,
                        status: data.status || 'active',
                        phone: data.phone || '',
                        age: String(data.age || ''),
                        paymentDay: data.payment_day || '05',
                        notes: data.notes || '',
                        modality: data.modality || 'Online',
                        scheduleDay: data.schedule_day || 'Seg',
                        scheduleTime: data.schedule_time || '14:00',
                        amount: data.amount || 97,
                        address: data.address || '',
                    });
                    setEditAmount(String(data.amount || 97));
                    setEditPaymentDay(data.payment_day || '05');
                }

                // Fetch Study Plan
                const { data: planData } = await supabase
                    .from('student_study_plans')
                    .select('*')
                    .eq('student_id', studentId)
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (planData) setStudyPlan(planData);

                // Fetch Lesson Reports
                const { data: reportsData } = await supabase
                    .from('lesson_reports')
                    .select('*')
                    .eq('student_id', studentId)
                    .order('lesson_date', { ascending: false });
                if (reportsData) setLessonReports(reportsData);

                // Fetch Attendance
                const { data: attendanceData } = await supabase
                    .from('attendance_records')
                    .select('*')
                    .eq('student_id', studentId)
                    .order('date', { ascending: false });
                if (attendanceData) setAttendanceRecords(attendanceData);

            } catch (err) {
                console.error('Error fetching student data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [studentId]);

    const handleAddReport = async () => {
        if (!newReportSummary.trim()) return;
        setSaving(true);
        try {
            if (editingReport) {
                const { error } = await supabase.from('lesson_reports').update({
                    summary: newReportSummary,
                    homework: newReportHomework,
                }).eq('id', editingReport.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('lesson_reports').insert([{
                    student_id: studentId,
                    teacher_id: user?.id,
                    summary: newReportSummary,
                    homework: newReportHomework,
                    lesson_date: new Date().toISOString().split('T')[0]
                }]);
                if (error) throw error;
            }

            // Refresh list
            const { data } = await supabase
                .from('lesson_reports')
                .select('*')
                .eq('student_id', studentId)
                .order('lesson_date', { ascending: false });
            if (data) setLessonReports(data);

            setIsReportModalOpen(false);
            setEditingReport(null);
            setNewReportSummary('');
            setNewReportHomework('');
        } catch (err) {
            console.error('Error saving report:', err);
            alert('Erro ao salvar relatório');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteReport = async (id: string | number) => {
        if (!confirm('Deseja excluir este relatório?')) return;
        try {
            const { error } = await supabase
                .from('lesson_reports')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setLessonReports(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Error deleting report:', err);
        }
    };

    const handleAddAttendance = async () => {
        setSaving(true);
        try {
            if (editingAttendance) {
                const { error } = await supabase.from('attendance_records').update({
                    status: newAttendanceStatus,
                }).eq('id', editingAttendance.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('attendance_records').insert([{
                    student_id: studentId,
                    teacher_id: user?.id,
                    status: newAttendanceStatus,
                    date: new Date().toISOString().split('T')[0]
                }]);
                if (error) throw error;
            }

            // Refresh list
            const { data } = await supabase
                .from('attendance_records')
                .select('*')
                .eq('student_id', studentId)
                .order('date', { ascending: false });
            if (data) setAttendanceRecords(data);

            setIsAttendanceModalOpen(false);
            setEditingAttendance(null);
        } catch (err) {
            console.error('Error saving attendance:', err);
            alert('Erro ao salvar presença');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAttendance = async (id: string | number) => {
        if (!confirm('Excluir este registro de presença?')) return;
        try {
            const { error } = await supabase
                .from('attendance_records')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setAttendanceRecords(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting attendance:', err);
        }
    };

    const handleSavePlan = async () => {
        if (!newPlanTitle.trim()) return;
        setSaving(true);
        try {
            // Deactivate old plans
            await supabase
                .from('student_study_plans')
                .update({ is_active: false })
                .eq('student_id', studentId);

            const { error } = await supabase.from('student_study_plans').insert([{
                student_id: studentId,
                teacher_id: user?.id,
                title: newPlanTitle,
                content: newPlanContent,
                is_active: true
            }]);

            if (error) throw error;

            // Refresh plan
            const { data } = await supabase
                .from('student_study_plans')
                .select('*')
                .eq('student_id', studentId)
                .eq('is_active', true)
                .single();
            if (data) setStudyPlan(data);

            setIsPlanModalOpen(false);
            setNewPlanTitle('');
            setNewPlanContent('');
        } catch (err) {
            console.error('Error saving plan:', err);
            alert('Erro ao salvar plano');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveFinance = async () => {
        setSaving(true);
        try {
            const amountVal = parseFloat(editAmount.replace(',', '.'));
            const { error } = await supabase
                .from('profiles')
                .update({
                    amount: amountVal,
                    payment_day: editPaymentDay
                })
                .eq('id', studentId);

            if (error) throw error;

            setStudent(prev => prev ? { ...prev, amount: amountVal, paymentDay: editPaymentDay } : null);
            setIsEditingFinance(false);
        } catch (err) {
            console.error('Error saving finance info:', err);
            alert('Erro ao salvar informações financeiras');
        } finally {
            setSaving(false);
        }
    };

    const handleSendNotification = async () => {
        if (!notificationTitle.trim() || !notificationBody.trim()) return;
        setSaving(true);
        try {
            // Chamada para a Edge Function do Supabase
            const { data, error } = await supabase.functions.invoke('send-notification', {
                body: {
                    userId: studentId,
                    title: notificationTitle,
                    body: notificationBody,
                }
            });

            if (error) throw error;

            alert('Notificação enviada com sucesso!');
            setIsNotificationModalOpen(false);
            setNotificationTitle('');
            setNotificationBody('');
        } catch (err) {
            console.error('Error sending notification:', err);
            alert('Erro ao enviar notificação. Verifique se o aluno tem as notificações habilitadas.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#101622] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0081FF]"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-[#101622] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-xl font-bold text-white mb-2">Aluno não encontrado</h2>
                <button onClick={onBack} className="text-[#0081FF] font-bold">Voltar</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#101622] text-white flex flex-col">
            {/* Header */}
            <div className="p-6 bg-[#1A202C] border-b border-white/5 sticky top-0 z-30">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-all">
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <div className="flex-1">
                        <h2 className="text-xl font-black tracking-tight">{student.name}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{student.level} • {student.modality}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-2 border-[#0081FF] overflow-hidden bg-[#101622] flex-shrink-0 cursor-pointer active:scale-95 transition-transform" onClick={() => setIsPhotoPreviewOpen(true)}>
                        <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => {
                            setNotificationTitle(`Olá, ${student.name.split(' ')[0]}! 🎼`);
                            setIsNotificationModalOpen(true);
                        }}
                        className="flex-1 py-3 bg-[#0081FF]/10 text-[#0081FF] border border-[#0081FF]/20 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-rounded">notifications_active</span>
                        <span className="text-[10px] font-black uppercase">Notificar Aluno</span>
                    </button>
                    <a
                        href={`https://wa.me/${student.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-3 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-rounded">chat</span>
                        <span className="text-[10px] font-black uppercase">WhatsApp</span>
                    </a>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-[#101622] rounded-2xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('pedagogy')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pedagogy' ? 'bg-[#0081FF] text-white shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        Pedagógico
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'finance' ? 'bg-[#0081FF] text-white shadow-lg' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Financeiro
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 pb-24">
                {activeTab === 'pedagogy' ? (
                    <>
                        {/* Seção: Plano de Estudos (Rotina) */}
                        <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest">Rotina de Estudos</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsRoutineManagerOpen(true)}
                                        className="h-8 px-3 rounded-full bg-[#FF00BC]/10 text-[#FF00BC] flex items-center justify-center gap-2 active:scale-95 transition-all"
                                    >
                                        <span className="material-symbols-rounded text-lg">calendar_month</span>
                                        <span className="text-[10px] font-black uppercase">Gerenciar</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewPlanTitle(studyPlan?.title || '');
                                            setNewPlanContent(studyPlan?.content || '');
                                            setIsPlanModalOpen(true);
                                        }}
                                        className="w-8 h-8 rounded-full bg-[#0081FF]/10 text-[#0081FF] flex items-center justify-center active:scale-90 transition-all"
                                    >
                                        <span className="material-symbols-rounded text-lg">edit_note</span>
                                    </button>
                                </div>
                            </div>
                            {studyPlan ? (
                                <div className="space-y-2">
                                    <p className="font-bold text-white text-lg">{studyPlan.title}</p>
                                    <div className="text-gray-400 text-sm whitespace-pre-wrap">{studyPlan.content}</div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm italic">Nenhuma rotina ativa definida.</p>
                            )}
                        </div>

                        {/* Seção: Presença */}
                        <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                            <h3 className="text-sm font-black uppercase text-gray-500 mb-4 tracking-widest">Controle de Presença</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {attendanceRecords.slice(0, 3).map((record) => (
                                    <div
                                        key={record.id}
                                        onClick={() => {
                                            setEditingAttendance(record);
                                            setNewAttendanceStatus(record.status as any);
                                            setIsAttendanceModalOpen(true);
                                        }}
                                        className={`h-10 rounded-xl flex items-center justify-center font-black cursor-pointer active:scale-95 transition-all ${record.status === 'present' ? 'bg-[#00C853]/10 text-[#00C853]' :
                                            record.status === 'absent' ? 'bg-[#FF3D00]/10 text-[#FF3D00]' :
                                                'bg-[#0081FF]/10 text-[#0081FF]'
                                            }`}>
                                        {record.status === 'present' ? 'P' : record.status === 'absent' ? 'F' : 'R'}
                                    </div>
                                ))}
                                <button
                                    onClick={() => setIsAttendanceModalOpen(true)}
                                    className="h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-rounded text-sm">add</span>
                                </button>
                            </div>
                        </div>

                        {/* Seção: Últimos Relatórios */}
                        <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest">Relatórios de Aula</h3>
                                <button
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="w-8 h-8 rounded-full bg-[#0081FF]/10 text-[#0081FF] flex items-center justify-center active:scale-90 transition-all"
                                >
                                    <span className="material-symbols-rounded text-lg">add</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {lessonReports.length > 0 ? (
                                    lessonReports.slice(0, 3).map(report => (
                                        <div
                                            key={report.id}
                                            onClick={() => {
                                                setEditingReport(report);
                                                setNewReportSummary(report.summary);
                                                setNewReportHomework(report.homework || '');
                                                setIsReportModalOpen(true);
                                            }}
                                            className="p-4 bg-[#101622] rounded-2xl border border-white/5 cursor-pointer hover:border-white/10 transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-[10px] font-black text-[#0081FF] uppercase">{new Date(report.lesson_date).toLocaleDateString()}</p>
                                                <span className="material-symbols-rounded text-xs text-gray-600">edit</span>
                                            </div>
                                            <p className="text-sm text-gray-300 mb-2">{report.summary}</p>
                                            {report.homework && (
                                                <div className="mt-2 pt-2 border-t border-white/5">
                                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Dever de Casa</p>
                                                    <p className="text-xs text-gray-400">{report.homework}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm italic">Nenhum relatório registrado.</p>
                                )}
                            </div>
                        </div>

                        {/* Seção: Informações Gerais */}
                        <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                            <h3 className="text-sm font-black uppercase text-gray-500 mb-4 tracking-widest">Dados Base</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">Idade</p>
                                    <p className="font-bold">{student.age || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">Telefone</p>
                                    <p className="font-bold">{student.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">Dia</p>
                                    <p className="font-bold">{student.scheduleDay}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">Horário</p>
                                    <p className="font-bold">{student.scheduleTime}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest">Dados Financeiros</h3>
                                {isAdmin && !isEditingFinance && (
                                    <button
                                        onClick={() => setIsEditingFinance(true)}
                                        className="w-8 h-8 rounded-full bg-white/5 text-gray-400 flex items-center justify-center active:scale-90 transition-all"
                                    >
                                        <span className="material-symbols-rounded text-lg">edit</span>
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-400 font-black uppercase">Mensalidade</p>
                                    {isEditingFinance ? (
                                        <div className="flex items-center gap-2 bg-[#101622] px-3 py-1 rounded-xl border border-white/10">
                                            <span className="text-gray-500 text-sm font-bold">R$</span>
                                            <input
                                                type="text"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                className="bg-transparent text-white font-black text-right w-20 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-xl font-black text-[#00C853]">R$ {student.amount?.toLocaleString()}</p>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-400 font-black uppercase">Dia de Pagamento</p>
                                    {isEditingFinance ? (
                                        <select
                                            value={editPaymentDay}
                                            onChange={(e) => setEditPaymentDay(e.target.value)}
                                            className="bg-[#101622] text-white font-bold p-2 rounded-xl border border-white/10 outline-none"
                                        >
                                            {Array.from({ length: 31 }, (_, i) => {
                                                const day = String(i + 1).padStart(2, '0');
                                                return <option key={day} value={day}>{day}</option>;
                                            })}
                                        </select>
                                    ) : (
                                        <p className="font-bold">Dia {student.paymentDay}</p>
                                    )}
                                </div>
                                {isEditingFinance && (
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => {
                                                setEditAmount(String(student.amount || 97));
                                                setEditPaymentDay(student.paymentDay || '05');
                                                setIsEditingFinance(false);
                                            }}
                                            className="flex-1 py-3 text-xs font-bold text-gray-500 uppercase"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSaveFinance}
                                            disabled={saving}
                                            className="flex-1 py-3 bg-[#0081FF] text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-[#0081FF]/20"
                                        >
                                            {saving ? '...' : 'Salvar'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5 text-center">
                            <span className="material-symbols-rounded text-4xl text-[#0081FF] mb-2">receipt_long</span>
                            <p className="text-xs text-gray-500 font-bold uppercase">Histórico de Pagamentos em Breve</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Novo Relatório */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#1A202C] rounded-t-[32px] sm:rounded-[32px] p-8 animate-in slide-in-from-bottom-10 duration-300 border-t border-white/10 sm:border border-white/5">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 sm:hidden"></div>
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <span className="material-symbols-rounded text-[#0081FF]">add_task</span>
                            Relatório de Aula
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Resumo da Aula</label>
                                <textarea
                                    value={newReportSummary}
                                    onChange={(e) => setNewReportSummary(e.target.value)}
                                    placeholder="O que foi trabalhado hoje?"
                                    className="w-full bg-[#101622] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#0081FF] transition-all min-h-[100px]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Dever de Casa</label>
                                <textarea
                                    value={newReportHomework}
                                    onChange={(e) => setNewReportHomework(e.target.value)}
                                    placeholder="O que o aluno deve praticar?"
                                    className="w-full bg-[#101622] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#0081FF] transition-all min-h-[80px]"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                {editingReport && (
                                    <button
                                        onClick={() => handleDeleteReport(editingReport.id)}
                                        className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20"
                                    >
                                        <span className="material-symbols-rounded">delete</span>
                                    </button>
                                )}
                                <button onClick={() => { setIsReportModalOpen(false); setEditingReport(null); }} className="flex-1 py-4 font-bold text-gray-500 hover:text-white transition-colors">Cancelar</button>
                                <button
                                    disabled={saving || !newReportSummary.trim()}
                                    onClick={handleAddReport}
                                    className="flex-[2] py-4 bg-[#0081FF] rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#0081FF]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                    {editingReport ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Presença */}
            {isAttendanceModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAttendanceModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-[#1A202C] rounded-t-[32px] sm:rounded-[32px] p-8 animate-in slide-in-from-bottom-10 duration-300">
                        <h3 className="text-xl font-black mb-6 text-center">Registrar Presença</h3>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { id: 'present', label: 'Presente', icon: 'check_circle', color: '#00C853' },
                                { id: 'absent', label: 'Falta', icon: 'cancel', color: '#FF3D00' },
                                { id: 'replaced', label: 'Reposição', icon: 'sync', color: '#0081FF' },
                                { id: 'to_be_replaced', label: 'A Repor', icon: 'schedule', color: '#FFAB00' }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setNewAttendanceStatus(s.id as any)}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${newAttendanceStatus === s.id ? 'border-white/20 bg-white/5' : 'border-white/5 opacity-50'
                                        }`}
                                >
                                    <span className="material-symbols-rounded" style={{ color: s.color }}>{s.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider">{s.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            {editingAttendance && (
                                <button
                                    onClick={() => handleDeleteAttendance(editingAttendance.id)}
                                    className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20"
                                >
                                    <span className="material-symbols-rounded">delete</span>
                                </button>
                            )}
                            <button
                                disabled={saving}
                                onClick={handleAddAttendance}
                                className="flex-1 py-4 bg-[#0081FF] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {saving && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                {editingAttendance ? 'Atualizar' : 'Confirmar'}
                            </button>
                            {!editingAttendance && <button onClick={() => setIsAttendanceModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500">Voltar</button>}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Editar Plano de Estudos */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#1A202C] rounded-t-[32px] sm:rounded-[32px] p-8 animate-in slide-in-from-bottom-10 duration-300">
                        <h3 className="text-xl font-black mb-6">Rotina de Estudos</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Título do Plano</label>
                                <input
                                    type="text"
                                    value={newPlanTitle}
                                    onChange={(e) => setNewPlanTitle(e.target.value)}
                                    placeholder="Ex: Foco em Respiração e Apoio"
                                    className="w-full bg-[#101622] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#0081FF] transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Conteúdo (Markdown)</label>
                                <textarea
                                    value={newPlanContent}
                                    onChange={(e) => setNewPlanContent(e.target.value)}
                                    placeholder="Descreva os exercícios, tempos e metas..."
                                    className="w-full bg-[#101622] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#0081FF] transition-all min-h-[200px]"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setIsPlanModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500">Voltar</button>
                                <button
                                    disabled={saving || !newPlanTitle.trim()}
                                    onClick={handleSavePlan}
                                    className="flex-[2] py-4 bg-[#0081FF] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {saving && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                    Publicar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Enviar Notificação */}
            {isNotificationModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNotificationModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#1A202C] rounded-t-[32px] sm:rounded-[32px] p-8 animate-in slide-in-from-bottom-10 duration-300">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <span className="material-symbols-rounded text-[#0081FF]">send</span>
                            Enviar Notificação Push
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Título da Mensagem</label>
                                <input
                                    type="text"
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="Ex: Novo treinamento disponível!"
                                    className="w-full bg-[#101622] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#0081FF] transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Conteúdo</label>
                                <textarea
                                    value={notificationBody}
                                    onChange={(e) => setNotificationBody(e.target.value)}
                                    placeholder="Descreva o aviso para o aluno..."
                                    className="w-full bg-[#101622] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#0081FF] transition-all min-h-[120px]"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setIsNotificationModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500">Voltar</button>
                                <button
                                    disabled={saving || !notificationTitle.trim() || !notificationBody.trim()}
                                    onClick={handleSendNotification}
                                    className="flex-[2] py-4 bg-[#0081FF] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {saving && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                    Disparar Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Routine Manager Modal */}
            {isRoutineManagerOpen && (
                <div className="fixed inset-0 z-[200] overflow-hidden flex flex-col bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="flex-1 flex flex-col bg-[#101622] max-w-md mx-auto w-full shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <RoutineManager
                            student={student as any}
                            onClose={() => setIsRoutineManagerOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Photo Preview Modal */}
            {isPhotoPreviewOpen && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
                    onClick={() => setIsPhotoPreviewOpen(false)}
                >
                    <div className="relative w-full max-w-lg aspect-square">
                        <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-full h-full object-contain rounded-3xl shadow-2xl"
                        />
                        <button
                            onClick={() => setIsPhotoPreviewOpen(false)}
                            className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all active:scale-90"
                        >
                            <span className="material-symbols-rounded text-white">close</span>
                        </button>

                        <div className="absolute -bottom-12 left-0 right-0 text-center">
                            <p className="text-white font-bold text-lg">{student.name}</p>
                            <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{student.level}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

