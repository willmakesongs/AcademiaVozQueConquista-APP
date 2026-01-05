
import React, { useState, useEffect, useRef } from 'react';
import { Screen, StudentSummary, Appointment, PaymentReceipt } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Props {
    onNavigate: (screen: Screen) => void;
    onLogout: () => void;
    initialTab?: 'dashboard' | 'students' | 'history' | 'reports' | 'settings';
    isAdminView?: boolean;
}

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const TeacherDashboard: React.FC<Props> = ({ onNavigate, onLogout, initialTab = 'dashboard', isAdminView = false }) => {
    const { user } = useAuth();
    const [showConfig, setShowConfig] = useState(false);
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'history' | 'reports' | 'settings'>(initialTab);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

    // States UI
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'error' | 'loading'>('loading');
    const [newReceiptNotice, setNewReceiptNotice] = useState<{ userName: string, amount: string } | null>(null);

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
    const [editStatus, setEditStatus] = useState<'active' | 'blocked' | 'overdue' | 'trial' | 'inactive'>('active');
    const [isUploadingStudentPhoto, setIsUploadingStudentPhoto] = useState(false);
    const studentFileInputRef = useRef<HTMLInputElement>(null);

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
    const [studentFilter, setStudentFilter] = useState<'active' | 'inactive'>('active');

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = studentFilter === 'active'
            ? student.status !== 'inactive'
            : student.status === 'inactive';
        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        fetchData();

        // 🟢 Realtime Subscription for Payment Receipts
        const channel = supabase
            .channel('receipts_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'payment_receipts'
                },
                (payload) => {
                    console.log('New receipt uploaded!', payload);
                    fetchData(); // Refresh all data

                    // Show Popup Notification
                    const newR = payload.new as any;
                    if (newR && newR.status === 'pending') {
                        // We need the name, so we fetch it or just use a generic "Novo Recibo"
                        // Since we just called fetchData, we can try to find the student name later or just show a generic msg
                        setNewReceiptNotice({ userName: 'Um aluno', amount: newR.amount });
                        setTimeout(() => setNewReceiptNotice(null), 5000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
                    amount: (s.amount !== null && s.amount !== undefined) ? s.amount : 97,
                    address: s.address || '',
                    contractAgreed: s.contract_agreed,
                    contractAgreedAt: s.contract_agreed_at,
                    signatureUrl: s.signature_url
                }));

                // Update local storage and state with fresh data from DB
                // SERVER IS SOURCE OF TRUTH
                localStorage.setItem('vocalizes_local_students', JSON.stringify(dbStudents));
                setStudents(dbStudents);

                // Fetch Receipts
                const { data: rData } = await supabase
                    .from('payment_receipts')
                    .select('*, profiles:user_id(name, avatar_url)')
                    .order('created_at', { ascending: false });

                if (rData) {
                    const mappedReceipts = rData.map((r: any) => ({
                        id: r.id,
                        userId: r.user_id,
                        userName: r.profiles?.name || 'Aluno',
                        userAvatar: r.profiles?.avatar_url,
                        amount: r.amount,
                        receiptUrl: r.receipt_url,
                        status: r.status,
                        createdAt: r.created_at
                    }));
                    setReceipts(mappedReceipts);
                    setReceipts(mappedReceipts);
                }

                // Fetch Payment History (confirmed manual + receipts)
                const { data: hData } = await supabase
                    .from('payment_history')
                    .select('*')
                    .order('payment_date', { ascending: false });

                if (hData) {
                    setPaymentHistory(hData);
                }

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

    const handleStudentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedStudent) return;

        setIsUploadingStudentPhoto(true);

        try {
            // 1. Compress Image using Canvas (Same logic as in ProfileScreen)
            const compressedBlob = await new Promise<Blob>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 400;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        canvas.toBlob((blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Canvas toBlob failed'));
                        }, 'image/jpeg', 0.8);
                    };
                    img.src = event.target?.result as string;
                };
                reader.readAsDataURL(file);
            });

            // 2. Upload to Supabase Storage
            const fileExt = 'jpg';
            const fileName = `avatar_${Date.now()}.${fileExt}`;
            const filePath = `${selectedStudent.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 4. Update Profile in DB
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', selectedStudent.id);

            if (updateError) throw updateError;

            // 5. Update Local State
            setStudents(prev => prev.map(s =>
                s.id === selectedStudent.id ? { ...s, avatarUrl: publicUrl } : s
            ));
            setSelectedStudent(prev => prev ? { ...prev, avatarUrl: publicUrl } : null);

            alert('Foto do aluno atualizada com sucesso!');
        } catch (err: any) {
            console.error('Erro no upload:', err);
            alert('Erro ao processar foto: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setIsUploadingStudentPhoto(false);
            if (studentFileInputRef.current) studentFileInputRef.current.value = '';
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
            amount: (val => isNaN(val) ? 97 : val)(parseFloat(String(newStudentAmount).replace(',', '.'))),
            address: newStudentAddress,
            instagram: newStudentInstagram
        };

        try {
            const { data, error } = await supabase.from('profiles').insert([{
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
                notes: newStudentNotes || null,
                amount: (val => isNaN(val) ? 97 : val)(parseFloat(String(newStudentAmount).replace(',', '.'))),
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
                amount: (val => isNaN(val) ? 97 : val)(parseFloat(String(newStudentAmount).replace(',', '.'))),
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
        } catch (err: any) {
            console.error(err);
            alert('Erro ao salvar: ' + (err.message || JSON.stringify(err)));
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
        setEditAmount((student.amount !== null && student.amount !== undefined) ? student.amount : 97);
        // Deleting duplicate line 391 automatically in next chunk logic if applicable or just replacing both
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
                amount: typeof editAmount === 'string' ? parseFloat(editAmount.replace(',', '.')) : editAmount,
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
            // Fechar o modal após salvar
            setSelectedStudent(null);
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
        if (filteredStudents.length === 0) return;

        const header = `LISTA DE ALUNOS (${studentFilter === 'active' ? 'ATIVOS' : 'INATIVOS'}) - ACADEMIA VOZ QUE CONQUISTA\nData de Exportação: ${new Date().toLocaleDateString('pt-BR')}\n${'='.repeat(50)}\n\n`;
        const content = filteredStudents.map((s, idx) => {
            const statusLabel = s.status === 'active' ? 'ATIVO' :
                s.status === 'overdue' ? 'EM ATRASO' :
                    s.status === 'trial' ? 'TESTE' :
                        s.status === 'blocked' ? 'BLOQUEADO' : 'INATIVO';
            return `${idx + 1}. ${s.name.toUpperCase()}\n` +
                `   Status: ${statusLabel}\n` +
                `   Plano: ${s.plan || 'Pro'}\n` +
                `   Vencimento: Dia ${s.paymentDay || '05'}\n` +
                `   Valor: R$ ${s.amount || 0}\n` +
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

    const handleApproveReceipt = async (receiptId: string) => {
        if (!confirm('Confirmar recebimento deste pagamento?')) return;
        setLoadingAction(true);
        try {
            const { error } = await supabase
                .from('payment_receipts')
                .update({ status: 'approved' })
                .eq('id', receiptId);

            if (error) throw error;
            await fetchData();
            alert('Pagamento confirmado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao confirmar pagamento.');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleRejectReceipt = async (receiptId: string) => {
        if (!confirm('Rejeitar este comprovante?')) return;
        setLoadingAction(true);
        try {
            const { error } = await supabase
                .from('payment_receipts')
                .update({ status: 'rejected' })
                .eq('id', receiptId);

            if (error) throw error;
            await fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingAction(false);
        }
    };

    const renderFinancial = () => {
        const pendingReceipts = receipts.filter(r => r.status === 'pending');

        // 1. Calculate Received (Current Month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const receivedThisMonth = paymentHistory
            .filter(p => {
                const d = new Date(p.payment_date || p.created_at); // fallback
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // 2. Calculate Pending (Overdue Students Total Amount)
        // Assuming monthly fee is roughly constant or using last payment amount as proxy
        const overdueStudents = students.filter(s => s.status === 'overdue');
        const pendingAmount = overdueStudents.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // 3. Chart Data (Last 6 Months)
        const chartData = [];
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(currentMonth - i);
            const mon = d.getMonth();
            const yr = d.getFullYear();

            const total = paymentHistory
                .filter(p => {
                    const pd = new Date(p.payment_date || p.created_at);
                    return pd.getMonth() === mon && pd.getFullYear() === yr;
                })
                .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

            chartData.push({ label: months[mon], value: total });
        }

        // Simple SVG Line Chart Logic
        const maxVal = Math.max(...chartData.map(d => d.value), 100); // min 100 to avoid div/0
        const chartPoints = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * 100;
            const y = 100 - (d.value / maxVal) * 80; // keep some padding top/bottom
            return `${x},${y}`;
        }).join(' ');

        // Smooth curve approximation (Beziers would be better, but polyline is okay for simple trend)
        // Let's try to make it slightly curved by using C commands or just simple L for now to ensure robustness without heavy math lib
        // Actually, let's use a simple cubic bezier smoothing if possible, or just straight lines. 
        // For "smoothness" like the image, standard SVG smoothing is needed.
        // Let's stick to polyline for safety, it's "close enough" for a quick implementation.
        // Update: Let's do a simple Catmull-Rom to Bezier or just standard polyline.
        // To keep it simple and robust: Polyline.

        return (
            <div className="flex-1 flex flex-col bg-[#101622] overflow-hidden">
                <div className="p-6 space-y-6 overflow-y-auto hide-scrollbar pb-32">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-white">Dashboard Financeiro</h2>
                        <div className="w-10 h-10 rounded-full bg-[#1A202C] border border-white/10 flex items-center justify-center overflow-hidden">
                            <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'Admin')}`} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Cards Top */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1A202C] p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-rounded text-6xl text-green-500">arrow_upward</span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <span className="material-symbols-rounded text-lg">arrow_upward</span>
                                </div>
                                <span className="text-sm text-gray-400">Recebido (Mês)</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">R$ {receivedThisMonth.toFixed(2)}</h3>
                            <span className="text-xs text-green-500 font-bold">+12% vs mês anterior</span>
                        </div>

                        <div className="bg-[#1A202C] p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-rounded text-6xl text-orange-500">priority_high</span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                                    <span className="material-symbols-rounded text-lg">priority_high</span>
                                </div>
                                <span className="text-sm text-gray-400">Pendente</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">R$ {pendingAmount.toFixed(2)}</h3>
                            <span className="text-xs text-orange-500 font-bold">+5% inadimplência</span>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm text-gray-400 mb-1">Tendência de Receita</h3>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-bold text-white">R$ {chartData.reduce((a, b) => a + b.value, 0).toLocaleString()}</h2>
                                    <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded-full">+8.5%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Últimos 6 meses</p>
                            </div>
                        </div>

                        <div className="h-40 w-full relative">
                            {/* SVG Chart */}
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                {/* Gradient Defs */}
                                <defs>
                                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#0081FF" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#0081FF" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Fill Area */}
                                <path
                                    d={`M0,100 ${chartPoints.split(' ').map(p => 'L' + p).join(' ')} L100,100 Z`}
                                    fill="url(#gradient)"
                                />
                                {/* Line */}
                                <polyline
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="3"
                                    points={chartPoints}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {/* Dots */}
                                {chartData.map((d, i) => {
                                    const x = (i / (chartData.length - 1)) * 100;
                                    const y = 100 - (d.value / maxVal) * 80;
                                    return (
                                        <circle key={i} cx={x} cy={y} r="2" fill="white" stroke="#3B82F6" strokeWidth="2" />
                                    );
                                })}
                            </svg>

                            {/* X Axis Labels */}
                            <div className="flex justify-between mt-4">
                                {chartData.map((d, i) => (
                                    <span key={i} className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase">{d.label}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pending Receipts Section (Critical Action Items) */}
                    {pendingReceipts.length > 0 && (
                        <div className="bg-[#1A202C] p-5 rounded-3xl border border-white/5 border-l-4 border-l-yellow-500">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-rounded text-yellow-500">warning</span>
                                Comprovantes para Análise ({pendingReceipts.length})
                            </h3>
                            <div className="space-y-3">
                                {pendingReceipts.map(receipt => (
                                    <div key={receipt.id} className="bg-[#101622] p-3 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-white text-sm font-bold">{receipt.userName}</p>
                                            <p className="text-xs text-gray-500">Enviou R$ {receipt.amount}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveReceipt(receipt.id)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"><span className="material-symbols-rounded text-sm">check</span></button>
                                            <button onClick={() => handleRejectReceipt(receipt.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><span className="material-symbols-rounded text-sm">close</span></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Overdue Payments List */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Pagamentos Atrasados</h3>
                            <button className="text-blue-500 text-xs font-bold hover:underline">Ver todos</button>
                        </div>

                        {overdueStudents.length === 0 ? (
                            <div className="p-8 text-center bg-[#1A202C] rounded-3xl border border-white/5 border-dashed">
                                <span className="material-symbols-rounded text-4xl text-green-500/50 mb-2">check_circle</span>
                                <p className="text-gray-500 text-sm">Nenhum pagamento atrasado!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {overdueStudents.slice(0, 5).map(student => (
                                    <div key={student.id} className="bg-[#1A202C] p-4 rounded-3xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={student.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-[#101622]" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{student.name}</h4>
                                                <p className="text-xs text-red-400 font-medium">Venceu em {new Date(student.nextDueDate || Date.now()).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-sm font-black text-white">R$ {student.amount},00</span>
                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-500 mt-1">
                                                <span className="material-symbols-rounded text-sm">warning</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Button Floating (from design) - Optional or reuse existing functionality */}
                    {/* The list usually has a + button to add manual payment? */}
                    {/* We already have "Confirm Payment" inside student details. Let's keep it simple. */}

                </div>
            </div>
        );
    };

    const handleConfirmPayment = async () => {
        if (!selectedStudent) return;
        if (!confirm(`Confirmar recebimento de R$ ${editAmount},00 de ${selectedStudent.name}? Isso renovará o acesso por 30 dias.`)) return;

        setLoadingAction(true);
        try {
            const now = new Date();
            const nextDue = new Date();
            nextDue.setDate(now.getDate() + 30);

            // 1. Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    status: 'active',
                    last_payment_date: now.toISOString(),
                    next_due_date: nextDue.toISOString(),
                    amount: editAmount
                })
                .eq('id', selectedStudent.id);

            if (profileError) throw profileError;

            // 2. Log History
            const { error: historyError } = await supabase
                .from('payment_history')
                .insert({
                    student_id: selectedStudent.id,
                    teacher_id: user?.id,
                    amount: editAmount,
                    payment_date: now.toISOString(),
                    method: 'manual'
                });

            if (historyError) {
                console.error("History error (non-fatal):", historyError);
                // Don't throw, just log, as priority is access renewal
            }

            await fetchData();
            setSelectedStudent(prev => prev ? { ...prev, status: 'active', nextDueDate: nextDue.toISOString() } : null);
            alert('Pagamento confirmado e acesso renovado!');
        } catch (error: any) {
            console.error(error);
            alert('Erro ao confirmar: ' + error.message);
        } finally {
            setLoadingAction(false);
        }
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
                const day = new Date(new Date(current).setDate(first + i));
                week.push({
                    date: day,
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
            type: `${s.level || 'Iniciante'} • ${s.modality || 'Presencial'}`,
            paymentStatus: s.status,
            avatarUrl: s.avatarUrl,
            phone: s.phone,
            instrument: 'Canto' // Default or derived if available
        })).sort((a, b) => a.time.localeCompare(b.time));

        const studentsTodayCount = dayAppointments.length;
        const pendingPaymentsCount = students.filter(s => s.status === 'overdue' || s.status === 'blocked').length;

        // Formata data para ex: "24 de Outubro"
        const formattedSelectedDate = selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        const monthYear = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        return (
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
                {/* Top Statistics Cards */}
                <div className="grid grid-cols-2 gap-4 px-6 pt-6 mb-8">
                    {/* Alunos Hoje */}
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5 relative overflow-hidden group hover:border-[#0081FF]/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[#94A3B8] font-bold text-sm">Alunos Hoje</h3>
                            <div className="w-8 h-8 rounded-xl bg-[#0081FF]/10 text-[#0081FF] flex items-center justify-center">
                                <span className="material-symbols-rounded text-xl">groups</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white tracking-tight">{studentsTodayCount}</span>
                        </div>
                    </div>

                    {/* Pag. Pendentes */}
                    <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5 relative overflow-hidden group hover:border-red-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[#94A3B8] font-bold text-sm">Pag. Pendentes</h3>
                            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                                <span className="material-symbols-rounded text-xl">warning</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white tracking-tight">{pendingPaymentsCount}</span>
                            <span className="text-[10px] font-black uppercase text-red-400 bg-red-500/10 px-2 py-1 rounded-lg tracking-wider">Atrasados</span>
                        </div>
                    </div>
                </div>

                {/* Calendar Strip */}
                <div className="px-6 mb-8">
                    <div className="bg-[#1A202C] rounded-[32px] p-6 border border-white/5">
                        {/* Month Header */}
                        <div className="flex justify-between items-center mb-6 px-2">
                            <button onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() - 7);
                                setSelectedDate(newDate);
                            }} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-gray-400 hover:text-white">
                                <span className="material-symbols-rounded">chevron_left</span>
                            </button>

                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{monthYear}</h3>

                            <button onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() + 7);
                                setSelectedDate(newDate);
                            }} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-gray-400 hover:text-white">
                                <span className="material-symbols-rounded">chevron_right</span>
                            </button>
                        </div>

                        {/* Days Grid */}
                        <div className="flex justify-between items-center">
                            {weekDates.map((date, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(date.date)}
                                    className="group flex flex-col items-center gap-3 relative"
                                >
                                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${date.active ? 'text-[#0081FF]' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                        {date.dayName}
                                    </span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${date.active
                                        ? 'bg-[#0081FF] text-white shadow-lg shadow-blue-500/30 scale-110'
                                        : 'bg-transparent text-gray-400 hover:bg-white/5 group-hover:text-white'
                                        }`}>
                                        {date.dayNum}
                                    </div>
                                    {date.active && <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#0081FF]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Agenda List Header */}
                <div className="px-8 mt-4 mb-4 flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-[#0081FF]"></div>
                    <h3 className="text-lg font-black text-white tracking-tight">Agenda - {formattedSelectedDate}</h3>
                </div>

                {/* Appointments List */}
                <div className="px-6 space-y-3">
                    {dayAppointments.length > 0 ? (
                        dayAppointments.map((apt: any) => (
                            <div key={apt.id} className="bg-[#1A202C] rounded-[24px] p-4 border border-white/5 flex items-center gap-4 group hover:border-white/10 transition-all active:scale-[0.99]">
                                {/* Time Column */}
                                <div className="flex flex-col items-center min-w-[50px] border-r border-white/5 pr-4">
                                    <span className="text-sm font-black text-white">{apt.time}</span>
                                    <span className="text-[10px] font-bold text-gray-500">{apt.endTime}</span>
                                </div>

                                {/* Student Info */}
                                <div
                                    className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => {
                                        const student = students.find(s => s.name === apt.studentName);
                                        if (student) openStudentDetails(student);
                                    }}
                                >
                                    <div className="relative">
                                        <img src={apt.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-[#151A23]" alt={apt.studentName} />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1A202C] flex items-center justify-center overflow-hidden ${apt.paymentStatus === 'overdue' ? 'bg-red-500' : 'bg-green-500'
                                            }`}>
                                            {apt.paymentStatus === 'overdue' && <span className="material-symbols-rounded text-[10px] text-white font-bold">!</span>}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-white truncate">{apt.studentName}</h4>
                                            {apt.paymentStatus === 'active' ? (
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-green-500/10 text-green-500 tracking-wider">Ativo</span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 text-red-500 tracking-wider">Pendente</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{apt.type}</p>

                                        {/* Optional: Check-in/Status text similar to image 'Em dia' */}
                                        {apt.paymentStatus !== 'overdue' && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="material-symbols-rounded text-green-500 text-[10px]">check_circle</span>
                                                <span className="text-[9px] text-green-500 font-bold">Em dia</span>
                                            </div>
                                        )}
                                        {apt.paymentStatus === 'overdue' && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="material-symbols-rounded text-red-500 text-[10px]">error</span>
                                                <span className="text-[9px] text-red-500 font-bold">Pagamento Pendente</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 pl-2">
                                    <button
                                        onClick={() => {
                                            const student = students.find(s => s.name === apt.studentName);
                                            if (student) openStudentDetails(student);
                                        }}
                                        className="w-9 h-9 rounded-full bg-[#0081FF]/10 text-[#0081FF] flex items-center justify-center hover:bg-[#0081FF] hover:text-white transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-rounded text-lg">edit</span>
                                    </button>
                                    <button
                                        className="w-9 h-9 rounded-full bg-white/5 text-gray-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                                        title="Histórico / Agendamento"
                                    >
                                        <span className="material-symbols-rounded text-lg">history</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-[#1A202C] text-gray-600 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <span className="material-symbols-rounded text-3xl">event_busy</span>
                            </div>
                            <h3 className="text-white font-bold mb-1">Dia Livre!</h3>
                            <p className="text-gray-500 text-xs">Nenhum aluno agendado para hoje.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderStudentList = () => {
        return (
            <div className="flex-1 flex flex-col bg-[#101622] overflow-hidden">
                <div className="px-6 pt-6">
                    <div className="flex bg-[#1A202C] p-1 rounded-2xl border border-white/5 mb-6 shadow-inner relative">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#0081FF] rounded-xl shadow-lg shadow-[#0081FF]/20 transition-all duration-300 ease-out ${studentFilter === 'inactive' ? 'translate-x-full' : 'translate-x-0'}`}
                        />
                        <button
                            onClick={() => setStudentFilter('active')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider relative z-10 transition-colors duration-300 ${studentFilter === 'active' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                        >
                            Ativos
                        </button>
                        <button
                            onClick={() => setStudentFilter('inactive')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider relative z-10 transition-colors duration-300 ${studentFilter === 'inactive' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                        >
                            Inativos
                        </button>
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-500">search</span>
                        <input
                            type="text"
                            placeholder="Buscar aluno por nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 bg-[#1A202C] rounded-2xl border border-white/5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#0081FF] transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4 space-y-4 pb-32">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total: {filteredStudents.length} alunos {studentFilter === 'active' ? 'ativos' : 'inativos'}</p>
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
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#101622] ${student.status === 'active' ? 'bg-green-500' : student.status === 'trial' ? 'bg-[#FF00BC]' : student.status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'}`}>
                                            {student.status === 'trial' && <span className="material-symbols-rounded text-[8px] text-white absolute inset-0 flex items-center justify-center font-bold">bolt</span>}
                                        </div>
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
                            <span className="material-symbols-rounded text-5xl text-gray-700 mb-4">{studentFilter === 'active' ? 'person_search' : 'person_off'}</span>
                            <p className="text-gray-500 text-sm font-medium">
                                {studentFilter === 'active'
                                    ? 'Nenhum aluno ativo encontrado.'
                                    : 'Nenhum aluno inativo por enquanto.'}
                            </p>
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
        <div className="flex flex-col h-[100dvh] bg-[#101622] relative overflow-hidden">
            {/* Header com Abas Integradas */}
            <header className="bg-[#101622] border-b border-white/5 z-40 relative pt-12 shrink-0">
                {/* Top Bar */}
                <div className="px-6 pb-4 flex justify-between items-center">
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
                </div>

                {/* Navigation Tabs (Novas Abas Superiores) */}
                <div className="px-6 pb-0 overflow-x-auto hide-scrollbar flex gap-4">
                    {(isAdminView ? [
                        { id: 'reports', label: 'Financeiro', icon: 'payments' },
                        { id: 'settings', label: 'Ajustes', icon: 'settings' }
                    ] : [
                        { id: 'dashboard', label: 'Início', icon: 'calendar_month' },
                        { id: 'students', label: 'Alunos', icon: 'groups' },
                        { id: 'reports', label: 'Financeiro', icon: 'payments' },
                        { id: 'settings', label: 'Ajustes', icon: 'settings' }
                    ]).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-1 pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap relative ${activeTab === tab.id
                                ? 'text-[#0081FF] border-[#0081FF]'
                                : 'text-gray-500 border-transparent hover:text-gray-300'
                                }`}
                        >
                            <span className={`material-symbols-rounded text-lg ${activeTab === tab.id ? 'filled' : ''}`}>{tab.icon}</span>
                            <span>{tab.label}</span>

                            {/* Dashboard/Financial Badge */}
                            {tab.id === 'reports' && receipts.some(r => r.status === 'pending') && (
                                <span className="absolute top-0 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#101622] animate-pulse"></span>
                            )}
                        </button>
                    ))}
                </div>
            </header>

            {/* Conteúdo Principal Ajustado */}
            <div className="flex-1 overflow-hidden relative w-full flex flex-col">
                {renderContent()}
            </div>

            {/* Spacer for Global Bottom Nav (This ensures content isn't covered) */}
            <div className="h-[80px] shrink-0 w-full bg-[#101622]"></div>

            {/* Botão de Add - FIXED e sem sobreposição */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#0081FF] text-white shadow-lg flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all shadow-blue-500/30"
                style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
            >
                <span className="material-symbols-rounded text-3xl">add</span>
            </button>


            {/* Modals */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm bg-[#1A202C] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#151A23]">
                            <h3 className="font-bold text-white">Detalhes do Aluno</h3>
                            <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white"><span className="material-symbols-rounded">close</span></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar">
                            <div className="flex gap-4 items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-2 border-[#0081FF] overflow-hidden">
                                        {isUploadingStudentPhoto ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black/50">
                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <img src={selectedStudent.avatarUrl} className="w-full h-full object-cover" alt="" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => studentFileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0081FF] border-2 border-[#1A202C] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                                    >
                                        <span className="material-symbols-rounded text-sm">photo_camera</span>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-white">{selectedStudent.name}</h4>
                                    <p className="text-xs text-gray-500 uppercase font-black">{selectedStudent.modality} • {selectedStudent.level}</p>
                                    <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${selectedStudent.status === 'blocked'
                                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                        : selectedStudent.status === 'inactive'
                                            ? 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                                            : 'bg-green-500/20 border-green-500/30 text-green-400'
                                        }`}>
                                        <span className="material-symbols-rounded text-[14px]">
                                            {selectedStudent.status === 'blocked' ? 'lock' : selectedStudent.status === 'inactive' ? 'pause_circle' : 'check_circle'}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase">
                                            {selectedStudent.status === 'blocked' ? 'Bloqueado' : selectedStudent.status === 'inactive' ? 'Inativo' : 'Ativo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Control Toggle - Refined Layout */}
                            <div className="p-5 bg-[#101622] rounded-2xl border border-white/5 space-y-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-[#0081FF] uppercase tracking-[0.15em] mb-1">Controle de Acesso</p>
                                    <p className="text-[11px] text-gray-500 font-medium">Gerencie a liberação das funcionalidades para este aluno</p>
                                </div>

                                <div className="flex bg-[#1A202C] p-1 rounded-2xl border border-white/5 relative h-12 shadow-inner">
                                    <div
                                        className={`absolute top-1 bottom-1 transition-all duration-300 ease-out rounded-xl shadow-lg z-0 ${editStatus === 'active' || editStatus === 'overdue' ? 'left-1 w-[calc(25%-2px)] bg-green-500 shadow-green-500/20' :
                                            editStatus === 'blocked' ? 'left-[calc(25%+1px)] w-[calc(25%-2px)] bg-red-500 shadow-red-500/20' :
                                                editStatus === 'trial' ? 'left-[calc(50%+1px)] w-[calc(25%-2px)] bg-[#FF00BC] shadow-pink-500/20' :
                                                    'left-[calc(75%+1px)] w-[calc(25%-2px)] bg-gray-600 shadow-gray-500/20'
                                            }`}
                                    />

                                    <button
                                        onClick={() => setEditStatus('active')}
                                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors duration-300 ${editStatus === 'active' || editStatus === 'overdue' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                                    >
                                        <span className="material-symbols-rounded text-[18px]">check_circle</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Ativo</span>
                                    </button>

                                    <button
                                        onClick={() => setEditStatus('blocked')}
                                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors duration-300 ${editStatus === 'blocked' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                                    >
                                        <span className="material-symbols-rounded text-[18px]">block</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Bloqueado</span>
                                    </button>

                                    <button
                                        onClick={() => setEditStatus('trial')}
                                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors duration-300 ${editStatus === 'trial' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                                    >
                                        <span className="material-symbols-rounded text-[18px]">bolt</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Teste</span>
                                    </button>

                                    <button
                                        onClick={() => setEditStatus('inactive')}
                                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors duration-300 ${editStatus === 'inactive' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                                    >
                                        <span className="material-symbols-rounded text-[18px]">pause_circle</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Inativo</span>
                                    </button>
                                </div>
                            </div>

                            {/* ... Rest of Edit Form ... */}
                            {/* NOTE: Preserving the existing form logic, just ensuring scroll container is good */}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Pagamento & Ciclo</p>
                                        {selectedStudent?.nextDueDate && (
                                            <p className={`text-[10px] font-bold ${new Date(selectedStudent.nextDueDate) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                                                Vence: {new Date(selectedStudent.nextDueDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleConfirmPayment}
                                        className="w-full bg-[#0081FF]/20 text-[#0081FF] h-10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-[#0081FF]/30 transition-all mb-3"
                                    >
                                        <span className="material-symbols-rounded text-sm">payments</span>
                                        Confirmar Pagamento Recebido
                                    </button>

                                    {/* Link para o Comprovante se existir pendente */}
                                    {receipts.find(r => r.userId === selectedStudent.id && r.status === 'pending') && (
                                        <a
                                            href={receipts.find(r => r.userId === selectedStudent.id && r.status === 'pending')?.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-yellow-500/20 text-yellow-600 h-10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-yellow-500/30 transition-all mb-3 border border-yellow-500/20"
                                        >
                                            <span className="material-symbols-rounded text-sm">visibility</span>
                                            Ver Comprovante Enviado
                                        </a>
                                    )}

                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Dia de Vencimento Preferencial</p>
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
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Agenda</p>
                                    <div className="flex gap-2">
                                        <select
                                            value={editScheduleDay}
                                            onChange={(e) => setEditScheduleDay(e.target.value)}
                                            className="bg-transparent border-none text-white text-sm focus:outline-none appearance-none font-bold cursor-pointer"
                                        >
                                            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
                                                <option key={d} value={d} className="bg-[#1A202C]">{d}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="time"
                                            value={editScheduleTime}
                                            onChange={(e) => setEditScheduleTime(e.target.value)}
                                            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none font-bold text-right cursor-pointer"
                                        />
                                    </div>
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
                                {/* ... address and phone ... */}
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

                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Status do Contrato</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${selectedStudent?.contractAgreed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={`text-xs font-bold ${selectedStudent?.contractAgreed ? 'text-green-500' : 'text-red-500'}`}>
                                        {selectedStudent?.contractAgreed ? 'Contrato Assinado' : 'Pendente de Assinatura'}
                                    </span>
                                </div>
                                {selectedStudent?.contractAgreed && (
                                    <>
                                        <p className="text-[10px] text-gray-400">
                                            Assinado em: {selectedStudent.contractAgreedAt ? `${new Date(selectedStudent.contractAgreedAt).toLocaleDateString('pt-BR')} às ${new Date(selectedStudent.contractAgreedAt).toLocaleTimeString('pt-BR')}` : 'Data desconhecida'}
                                        </p>
                                        {selectedStudent.signatureUrl && (
                                            <div className="mt-2">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Assinatura Digital</p>
                                                <div className="bg-white rounded-lg p-2 h-24 w-full overflow-hidden flex items-center justify-center">
                                                    <img src={selectedStudent.signatureUrl} alt="Assinatura do Aluno" className="h-full object-contain" />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
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
                                    {loadingAction ? '...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pop-up de Confirmação Exclusão */}
                    {showDeleteConfirm && (
                        <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-200">
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
                    <div className="w-full max-w-md h-full max-h-[90dvh] flex flex-col bg-[#101622] rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="w-full h-full flex flex-col">
                            {/* Header Fixado */}
                            <div className="px-6 pt-12 pb-4 flex justify-between items-center border-b border-white/5 bg-[#151A23] shrink-0">
                                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/5 transition-colors">
                                    <span className="material-symbols-rounded text-2xl">close</span>
                                </button>
                                <h3 className="text-lg font-black text-white">Novo Aluno</h3>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddStudent();
                                    }}
                                    disabled={loadingAction}
                                    className="text-[#0081FF] font-black text-sm uppercase tracking-wider disabled:opacity-30 px-2"
                                >
                                    {loadingAction ? '...' : 'Salvar'}
                                </button>
                            </div>

                            {/* Form Content Scrollable */}
                            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 hide-scrollbar pb-32">
                                {/* ... (Existing Form Fields) ... */}
                                {/* Re-using existing render logic for the form fields to ensure no functionality lost */}
                                {/* Pessoal */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-rounded text-[#0081FF] text-lg">person</span>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dados Pessoais</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Nome Completo</p>
                                            <input type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Ex: Maria Silva" className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-all" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Idade</p>
                                                <input type="number" value={newStudentAge} onChange={(e) => setNewStudentAge(e.target.value)} placeholder="25" className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-all text-center" />
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Endereço</p>
                                                <input type="text" value={newStudentAddress} onChange={(e) => setNewStudentAddress(e.target.value)} placeholder="Rua, Número, Bairro" className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white focus:outline-none focus:border-[#0081FF] transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </section>

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
                                                <input type="text" value={newStudentPhone} onChange={(e) => setNewStudentPhone(e.target.value)} placeholder="(00) 00000-0000" className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 pl-12 pr-4 text-white focus:outline-none focus:border-[#0081FF] transition-all" />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Instagram</p>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-500 text-lg">alternate_email</span>
                                                <input type="text" value={newStudentInstagram} onChange={(e) => setNewStudentInstagram(e.target.value)} placeholder="usuario_insta" className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 pl-12 pr-4 text-white focus:outline-none focus:border-[#0081FF] transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-rounded text-[#0081FF] text-lg">school</span>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalhes da Aula</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Tipo de Aula</p>
                                            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                                <button onClick={() => setNewStudentModality('Presencial')} className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${newStudentModality === 'Presencial' ? 'bg-[#0081FF] text-white shadow-lg' : 'text-gray-400'}`}> <span className="material-symbols-rounded text-lg">location_on</span> Presencial </button>
                                                <button onClick={() => setNewStudentModality('Online')} className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${newStudentModality === 'Online' ? 'bg-[#0081FF] text-white shadow-lg' : 'text-gray-400'}`}> <span className="material-symbols-rounded text-lg">videocam</span> Online </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Classificação</p>
                                                <select value={newStudentLevel} onChange={(e) => setNewStudentLevel(e.target.value)} className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none"> {['Iniciante', 'Intermediário', 'Avançado'].map(l => <option key={l} value={l} className="bg-[#1A202C]">{l}</option>)} </select>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Valor (R$)</p>
                                                <input type="number" value={newStudentAmount} onChange={(e) => setNewStudentAmount(e.target.value)} className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Dia da Aula</p>
                                                <select value={scheduleDay} onChange={(e) => setScheduleDay(e.target.value)} className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none"> {WEEK_DAYS.map(d => <option key={d} value={d} className="bg-[#1A202C]">{d}</option>)} </select>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Horário</p>
                                                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-4 text-white outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-rounded text-[#0081FF] text-lg">description</span>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outros</h4>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Anotações</p>
                                        <textarea value={newStudentNotes} onChange={(e) => setNewStudentNotes(e.target.value)} placeholder="Observações..." className="w-full h-32 bg-white/5 rounded-2xl border border-white/5 p-4 text-white focus:outline-none focus:border-[#0081FF] resize-none transition-all" />
                                    </div>
                                </section>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Input for student photo upload */}
            <input
                type="file"
                ref={studentFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleStudentPhotoUpload}
            />
            {/* Popup Notification for New Receipts */}
            {newReceiptNotice && (
                <div className="fixed top-20 left-4 right-4 z-[100] animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-[#1A202C] border-2 border-[#0081FF] rounded-2xl p-4 shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] shrink-0">
                            <span className="material-symbols-rounded text-2xl">payments</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">Novo Comprovante Recebido!</h4>
                            <p className="text-gray-400 text-xs text-balance">Verifique o novo pagamento na aba financeira.</p>
                        </div>
                        <button
                            onClick={() => {
                                setNewReceiptNotice(null);
                                setActiveTab('reports');
                            }}
                            className="bg-[#0081FF] text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider"
                        >
                            Ver Agora
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
