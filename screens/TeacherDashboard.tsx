
import React, { useState, useEffect, useRef } from 'react';
import { Screen, StudentSummary, Appointment, PaymentReceipt, Course, StudentCourse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { RoutineManager } from '../components/RoutineManager';
import { STORAGE_BASE_URL } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
    onNavigate: (screen: Screen, studentId?: string) => void;
    onLogout: () => void;
    initialTab?: 'dashboard' | 'students' | 'history' | 'reports' | 'settings';
    isAdminView?: boolean;
}

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const getCourseIcon = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('canto') || s.includes('voz')) return '🎤';
    if (s.includes('violao')) return '🎸';
    if (s.includes('guitarra')) return '🎸';
    if (s.includes('bateria')) return '🥁';
    if (s.includes('oratoria') || s.includes('fala')) return '🗣️';
    if (s.includes('musicalizacao') || s.includes('infantil')) return '👶';
    if (s.includes('piano') || s.includes('teclado')) return '🎹';
    if (s.includes('violino')) return '🎻';
    if (s.includes('saxofone') || s.includes('sax')) return '🎷';
    if (s.includes('producao') || s.includes('studio')) return '🎧';
    return '🎵';
};

export const TeacherDashboard: React.FC<Props> = ({ onNavigate, onLogout, initialTab = 'dashboard', isAdminView = false }) => {
    const { user } = useAuth();
    const isSuperAdmin = user?.email && ['lorenapimenteloficial@gmail.com', 'willmakesongs@gmail.com'].includes(user.email.toLowerCase().trim());
    const isActuallyAdmin = user?.role === 'admin' || isSuperAdmin || (user?.email === 'guest@vocalizes.com.br');

    const [showConfig, setShowConfig] = useState(false);
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'history' | 'reports' | 'settings' | 'notifications'>(initialTab);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
    const [financeTab, setFinanceTab] = useState<'overview' | 'by_course' | 'status' | 'repasse'>('overview');
    const [financePeriod, setFinancePeriod] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });
    const [teachers, setTeachers] = useState<any[]>([]);
    const [teacherExpenses, setTeacherExpenses] = useState<any[]>([]);
    const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
    const [editingExpenses, setEditingExpenses] = useState<Record<string, { travel: string, food: string, notes: string }>>({});
    const [editingRepasse, setEditingRepasse] = useState<Record<string, string>>({});
    const [editingStudentRepasse, setEditingStudentRepasse] = useState<Record<string, { fixed?: string, percent?: string }>>({});
    const [savingExpense, setSavingExpense] = useState(false);

    // Notificações Broadcast
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastBody, setBroadcastBody] = useState('');
    const [notificationsHistory, setNotificationsHistory] = useState<any[]>([]);

    // States UI
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'error' | 'loading'>('loading');
    const [newReceiptNotice, setNewReceiptNotice] = useState<{ userName: string, amount: string, userId?: string } | null>(null);

    // States Detalhes
    const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
    const [isRoutineManagerOpen, setIsRoutineManagerOpen] = useState(false);
    const [vocalAssessment, setVocalAssessment] = useState<any | null>(null);
    const [notesInput, setNotesInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editPhone, setEditPhone] = useState('');

    // States Edição Agendamento
    const [editScheduleDay, setEditScheduleDay] = useState('Seg');
    const [editScheduleTime, setEditScheduleTime] = useState('');
    const [editAge, setEditAge] = useState('');

    // UI States
    const [showCourseSelector, setShowCourseSelector] = useState(false);
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

    // Exportação de Agenda
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'txt'>('pdf');
    const [exportPeriod, setExportPeriod] = useState<'week' | 'month'>('week');
    const [exportScope, setExportScope] = useState<'my_courses' | 'all'>('my_courses');

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = studentFilter === 'active'
            ? student.status !== 'inactive'
            : student.status === 'inactive';

        const matchesCourse = selectedCourseId === 'all' ||
            (student.courses?.some(c => c.course_id === selectedCourseId));

        return matchesSearch && matchesStatus && matchesCourse;
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
                async (payload) => {
                    console.log('New receipt uploaded!', payload);
                    fetchData(); // Refresh all data

                    // Show Popup Notification with student name
                    const newR = payload.new as any;
                    if (newR && newR.status === 'pending') {
                        let studentName = 'Um aluno';
                        try {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('name')
                                .eq('id', newR.user_id)
                                .single();
                            if (profile?.name) studentName = profile.name;
                        } catch (_) { }
                        setNewReceiptNotice({ userName: studentName, amount: newR.amount, userId: newR.user_id });
                        setTimeout(() => setNewReceiptNotice(null), 8000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'notifications') {
            fetchNotificationsHistory();
        }
    }, [activeTab]);

    const fetchNotificationsHistory = async () => {
        const { data, error } = await supabase
            .from('notifications_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        if (data) setNotificationsHistory(data);
    };

    const fetchData = async (force: boolean = false) => {
        setLoadingAction(true);
        try {
            // Fetch Courses - Filter by teacher if not admin
            let coursesQuery = supabase.from('courses').select('*').eq('ativo', true);
            if (user?.role === 'teacher' && !isAdminView && !isActuallyAdmin) {
                coursesQuery = coursesQuery.eq('teacher_id', user.id);
            }
            const { data: coursesData } = await coursesQuery;
            if (coursesData) {
                setCourses(coursesData);
                // If only one course, select it automatically for teachers
                if (user?.role === 'teacher' && !isAdminView && !isActuallyAdmin && coursesData.length === 1) {
                    setSelectedCourseId(coursesData[0].id);
                }
            }

            // Role-based student filtering
            let studentQuery = supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student');

            // If teacher and NOT in admin view, filter students
            if (user?.role === 'teacher' && !isAdminView && !isActuallyAdmin) {
                // Determine if we should filter by specific course or just show all their students
                // For now, if we have limited courses, we might want to fetch all their students anyway
                // but the UI filters by courseId. 
                // CRITICAL: We need students that ARE in the teacher's courses.
                if (coursesData && coursesData.length > 0) {
                    const teacherCourseIds = coursesData.map(c => c.id);
                    // Fetch students enrolled in these courses
                    const { data: enrollmentData } = await supabase
                        .from('student_courses')
                        .select('student_id')
                        .in('course_id', teacherCourseIds);

                    const enrolledStudentIds = Array.from(new Set(enrollmentData?.map(e => e.student_id) || []));

                    if (enrolledStudentIds.length > 0) {
                        studentQuery = studentQuery.in('id', enrolledStudentIds);
                    } else {
                        // No students enrolled in their courses
                        setStudents([]);
                        setLoadingAction(false);
                        return;
                    }
                } else {
                    // No courses found for this teacher
                    setStudents([]);
                    setLoadingAction(false);
                    return;
                }
            }

            const { data: sData, error: sError } = await studentQuery;

            const { data: teachersData } = await supabase.from('profiles').select('*').eq('role', 'teacher');
            if (teachersData) setTeachers(teachersData);

            const { data: relationsData } = await supabase.from('student_courses').select('*');

            const dbStudents: StudentSummary[] = sData.map(s => {
                const studentCourses = relationsData?.filter(r => r.student_id === s.id) || [];

                // Use profile as fallback, but specific course might override these later in UI
                return {
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
                    amount: (val => isNaN(val) ? 97 : val)(parseFloat(String(s.amount).replace(',', '.'))),
                    address: s.address || '',
                    contractAgreed: s.contract_agreed,
                    contractAgreedAt: s.contract_agreed_at,
                    signatureUrl: s.signature_url,
                    courses: studentCourses,
                    teacher_id: s.teacher_id,
                    push_token: s.push_token
                };
            });

            // Update local storage and state with fresh data from DB
            // SERVER IS SOURCE OF TRUTH
            localStorage.setItem('vocalizes_local_students', JSON.stringify(dbStudents));
            setStudents(dbStudents);

            // Fetch Receipts - Filtered for teachers
            let receiptQuery = supabase
                .from('payment_receipts')
                .select('*');

            if (user?.role === 'teacher' && !isAdminView && !isActuallyAdmin) {
                // This requires profiles join or a subquery. Supabase handles inner join filters
            }

            const { data: rData } = await receiptQuery.order('created_at', { ascending: false });

            if (rData) {
                // Fetch profiles for these receipts separately to avoid complex join errors
                const userIds = Array.from(new Set(rData.map((r: any) => r.user_id)));
                const { data: profilesForReceipts } = await supabase
                    .from('profiles')
                    .select('id, name, avatar_url, teacher_id')
                    .in('id', userIds);

                let mappedReceipts = rData.map((r: any) => {
                    const prof = profilesForReceipts?.find(p => p.id === r.user_id);
                    return {
                        id: r.id,
                        userId: r.user_id,
                        userName: prof?.name || 'Aluno',
                        userAvatar: prof?.avatar_url,
                        amount: r.amount,
                        receiptUrl: r.receipt_url,
                        status: r.status,
                        createdAt: r.created_at,
                        teacher_id: prof?.teacher_id
                    };
                });

                // Client-side filter for receipts if teacher
                if (user?.role === 'teacher' && !isAdminView && !isActuallyAdmin) {
                    mappedReceipts = mappedReceipts.filter(r => r.teacher_id === user.id);
                }

                setReceipts(mappedReceipts);
                setReceipts(mappedReceipts);
            }

            // Fetch Payment History - Filtered for teachers
            let historyQuery = supabase
                .from('payment_history')
                .select('*')
                .order('payment_date', { ascending: false });

            const { data: hData } = await historyQuery;

            if (hData) {
                let filteredHistory = hData;
                if (user?.role === 'teacher' && !isAdminView && !isActuallyAdmin) {
                    const myStudentIds = sData.map(s => s.id);
                    filteredHistory = hData.filter(h => myStudentIds.includes(h.student_id));
                }
                setPaymentHistory(filteredHistory);
            }

            // Fetch Teacher Expenses (admin only)
            if (isActuallyAdmin) {
                const { data: expData } = await supabase
                    .from('teacher_expenses')
                    .select('*')
                    .eq('month', financePeriod.month)
                    .eq('year', financePeriod.year);
                if (expData) setTeacherExpenses(expData);
            }

            if (force) alert('Dados atualizados com sucesso da nuvem! ☁️');
            setSyncStatus('synced');
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

    const handleBroadcastNotifications = async () => {
        if (!isSuperAdmin) {
            alert('Apenas Lorena e Will podem enviar comunicações em massa.');
            return;
        }
        if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
        setLoadingAction(true);

        // Filtrar alunos com token
        const targets = students.filter(s => s.push_token && s.status !== 'inactive');

        if (targets.length === 0) {
            alert('Nenhum aluno ativo com notificações habilitadas foi encontrado.');
            setLoadingAction(false);
            return;
        }

        if (!confirm(`Deseja enviar este aviso para ${targets.length} alunos?`)) {
            setLoadingAction(false);
            return;
        }

        try {
            // Enviamos um por um ou via endpoint de broadcast se existir
            // Para maior controle, vamos disparar em loop (idealmente seria batch no backend)
            let successCount = 0;
            for (const target of targets) {
                const { error } = await supabase.functions.invoke('send-notification', {
                    body: {
                        userId: target.id,
                        title: broadcastTitle,
                        body: broadcastBody
                    }
                });
                if (!error) successCount++;
            }

            alert(`Processo concluído! ${successCount} de ${targets.length} notificações foram enviadas.`);
            setIsBroadcastModalOpen(false);
            setBroadcastTitle('');
            setBroadcastBody('');
            fetchNotificationsHistory();
        } catch (err) {
            console.error('Broadcast error:', err);
            alert('Houve um erro durante o disparo em massa.');
        } finally {
            setLoadingAction(false);
        }
    };

    const uploadToB2 = async (file: Blob | File, folder: string, filename: string): Promise<string> => {
        // 1. Get Presigned URL from Edge Function
        const { data, error: funcError } = await supabase.functions.invoke('b2-proxy', {
            body: {
                filename,
                contentType: file.type || 'image/jpeg',
                folder
            }
        });

        if (funcError || !data?.url) {
            throw new Error(`Failed to get upload URL: ${funcError?.message || 'Unknown error'}`);
        }

        // 2. Upload directly to B2 via PUT
        const uploadResponse = await fetch(data.url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type || 'image/jpeg'
            }
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        // 3. Construct Public URL
        return `${STORAGE_BASE_URL}/${data.path}`;
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

            // 2. Upload to B2 via Proxy
            const fileExt = 'jpg';
            const fileName = `avatar_${Date.now()}.${fileExt}`;
            const publicUrl = await uploadToB2(compressedBlob, 'avatars', fileName);

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
            const studentId = savedStudent?.id || fakeId;

            // 2. Link student to current course if selected
            if (selectedCourseId && selectedCourseId !== 'all') {
                const amountVal = (val => isNaN(val) ? 97 : val)(parseFloat(String(newStudentAmount).replace(',', '.')));
                const { error: courseError } = await supabase.from('student_courses').insert([{
                    student_id: studentId,
                    course_id: selectedCourseId,
                    status: 'ativo',
                    amount: amountVal,
                    schedule_day: scheduleDay,
                    schedule_time: scheduleTime
                }]);
                if (courseError) {
                    console.error('Error linking student to course:', courseError);
                }
            }

            const newStudentSummary: StudentSummary = {
                id: studentId,
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
            localList.push(newStudentSummary);
            localStorage.setItem('vocalizes_local_students', JSON.stringify(localList));

            setStudents(prev => [...prev, newStudentSummary]);

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
        setIsEditing(false);
    };

    // Load Notes and Assessment when student selected
    useEffect(() => {
        if (selectedStudent) {
            setNotesInput(selectedStudent.notes || '');
            setEditPhone(selectedStudent.phone || '');

            // Per-course scheduling check
            const currentEnrollment = selectedCourseId !== 'all'
                ? selectedStudent.courses?.find(c => c.course_id === selectedCourseId)
                : null;

            setEditScheduleDay(currentEnrollment?.schedule_day || selectedStudent.scheduleDay || 'Seg');
            setEditScheduleTime(currentEnrollment?.schedule_time || selectedStudent.scheduleTime || '14:00');
            setEditAge(selectedStudent.age || '');
            setEditAddress(selectedStudent.address || '');
            setEditInstagram(selectedStudent.instagram || '');

            // Per-course amount check
            const courseAmount = currentEnrollment?.amount;
            setEditAmount(courseAmount !== undefined && courseAmount !== null ? courseAmount : (selectedStudent.amount || 97));

            setEditPaymentDay(selectedStudent.paymentDay || '05');
            setEditStatus(selectedStudent.status as any || 'active');

            // Fetch Assessment
            const fetchAssessment = async () => {
                const { data } = await supabase
                    .from('vocal_assessments')
                    .select('*')
                    .eq('user_id', selectedStudent.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setVocalAssessment(data);
                } else {
                    setVocalAssessment(null);
                }
            };
            fetchAssessment();
        } else {
            // Clear assessment when no student is selected
            setVocalAssessment(null);
        }
    }, [selectedStudent, selectedCourseId]);

    const toggleStudentCourse = async (courseId: string, currentStatus: boolean) => {
        if (!selectedStudent) return;

        try {
            if (currentStatus) {
                // Unlink
                const { error } = await supabase
                    .from('student_courses')
                    .delete()
                    .eq('student_id', selectedStudent.id)
                    .eq('course_id', courseId);
                if (error) throw error;
            } else {
                // Link
                const { error } = await supabase
                    .from('student_courses')
                    .upsert({
                        student_id: selectedStudent.id,
                        course_id: courseId,
                        status: 'ativo'
                    }, { onConflict: 'student_id,course_id' });
                if (error) throw error;
            }
            await fetchData(); // Refresh data
            // Update local selectedStudent to reflect changes
            const updatedStudent = { ...selectedStudent };
            if (currentStatus) {
                updatedStudent.courses = updatedStudent.courses?.filter(c => c.course_id !== courseId);
            } else {
                updatedStudent.courses = [...(updatedStudent.courses || []), { id: '', student_id: selectedStudent.id, course_id: courseId, status: 'ativo', created_at: '' }];
            }
            setSelectedStudent(updatedStudent);
        } catch (err: any) {
            console.error("Erro ao alterar curso:", err);
            alert("Erro ao alterar curso: " + err.message);
        }
    };

    const openWhatsApp = (phone: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone) return;
        const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        window.open(`https://wa.me/${finalPhone}`, '_blank');
    };

    const openInstagram = (handle: string) => {
        if (!handle) return;
        const username = handle.replace('@', '').trim();
        window.open(`https://instagram.com/${username}`, '_blank');
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
            // 1. Update Profile (Global data)
            const { data, error } = await supabase.from('profiles').update({
                phone: editPhone,
                notes: notesInput,
                age: editAge ? parseInt(editAge) : null,
                address: editAddress,
                instagram: editInstagram,
                payment_day: editPaymentDay,
                status: editStatus
            }).eq('id', selectedStudent.id).select();

            if (error) throw error;

            if (selectedCourseId && selectedCourseId !== 'all') {
                const amountVal = typeof editAmount === 'string' ? parseFloat(editAmount.replace(',', '.')) : editAmount;
                const { error: courseError } = await supabase
                    .from('student_courses')
                    .update({
                        amount: amountVal,
                        schedule_day: editScheduleDay,
                        schedule_time: editScheduleTime
                    })
                    .eq('student_id', selectedStudent.id)
                    .eq('course_id', selectedCourseId);

                if (courseError) {
                    console.error('Error updating course specific data:', courseError);
                }
            } else {
                // If "All Courses" is selected, we keep updating the global schedule for backward compatibility/global view
                await supabase.from('profiles').update({
                    schedule_day: editScheduleDay,
                    schedule_time: editScheduleTime,
                    amount: typeof editAmount === 'string' ? parseFloat(editAmount.replace(',', '.')) : editAmount,
                }).eq('id', selectedStudent.id);
            }

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

    const handleExportAgenda = () => {
        const currentDate = selectedDate || new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Determinar o intervalo de datas
        let startDate: Date, endDate: Date;
        if (exportPeriod === 'week') {
            const first = currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1);
            startDate = new Date(year, month, first);
            endDate = new Date(year, month, first + 6);
        } else {
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0);
        }

        const myTeacherCourseIds = courses.filter(c => c.teacher_id === user?.id).map(c => c.id);

        // Gerar os dias do intervalo
        const daysInPeriod: Date[] = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            daysInPeriod.push(new Date(d));
        }

        // Construir os dados da agenda
        const agendaData: { date: Date, time: string, studentName: string, courseName: string, phone: string }[] = [];

        daysInPeriod.forEach(day => {
            if (day.getDay() === 0) return; // Pula domingo
            const dayLabel = WEEK_DAYS[day.getDay() === 0 ? 6 : day.getDay() - 1]; // WEEK_DAYS começa na Segunda

            students.forEach(s => {
                if (s.status === 'inactive') return;

                const relevantCourses = exportScope === 'my_courses' && myTeacherCourseIds.length > 0
                    ? (s.courses?.filter(c => myTeacherCourseIds.includes(c.course_id)) || [])
                    : (s.courses || []);

                if (exportScope === 'my_courses' && myTeacherCourseIds.length > 0 && relevantCourses.length === 0) return;

                const profileMatches = s.scheduleDay === dayLabel;
                const anyCourseMatches = relevantCourses.some(c => c.schedule_day === dayLabel);

                if (profileMatches || anyCourseMatches) {
                    const enrollment = relevantCourses.find(c => c.schedule_day === dayLabel);
                    const scheduleTime = enrollment?.schedule_time || s.scheduleTime || '14:00';
                    const courseName = courses.find(c => c.id === enrollment?.course_id)?.nome || (s.courses && s.courses.length > 0 ? courses.find(c => c.id === s.courses![0].course_id)?.nome : 'Aula');

                    agendaData.push({
                        date: day,
                        time: scheduleTime,
                        studentName: s.name,
                        courseName: courseName || 'Geral',
                        phone: s.phone || 'Sem número'
                    });
                }
            });
        });

        // Ordenar por data e hora
        agendaData.sort((a, b) => {
            if (a.date.getTime() !== b.date.getTime()) return a.date.getTime() - b.date.getTime();
            return a.time.localeCompare(b.time);
        });

        const periodLabel = exportPeriod === 'week' ? 'Semanal' : 'Mensal';
        const scopeLabel = exportScope === 'all' ? 'Academia' : 'Meus Cursos';
        const fileName = `Agenda_${periodLabel}_${scopeLabel}.pdf`.replace(/ /g, '_');

        if (exportFormat === 'pdf') {
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text(`Agenda ${periodLabel} - ${scopeLabel}`, 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Período: ${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')}`, 14, 30);

            const tableColumn = ["Data", "Horário", "Aluno", "Curso", "Contato"];
            const tableRows: any[] = [];

            agendaData.forEach(item => {
                const dateStr = item.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
                tableRows.push([
                    dateStr,
                    item.time,
                    item.studentName,
                    item.courseName,
                    item.phone
                ]);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 38,
                theme: 'striped',
                headStyles: { fillColor: [0, 129, 255] },
                styles: { fontSize: 9 }
            });

            doc.save(fileName);
        } else {
            // Gerar TXT
            let txtContent = `=== Agenda ${periodLabel.toUpperCase()} - ${scopeLabel.toUpperCase()} ===\n`;
            txtContent += `Período: ${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')}\n\n`;

            let currentDateStr = '';
            agendaData.forEach(item => {
                const dateStr = item.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
                if (currentDateStr !== dateStr) {
                    txtContent += `\n--- ${dateStr.toUpperCase()} ---\n`;
                    currentDateStr = dateStr;
                }
                txtContent += `[${item.time}] ${item.studentName} | ${item.courseName} | Tel: ${item.phone}\n`;
            });

            if (agendaData.length === 0) {
                txtContent += 'Nenhum aluno agendado para este período.';
            }

            const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName.replace('.pdf', '.txt');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setIsExportModalOpen(false);
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

        // Helper para filtrar por período
        const isInPeriod = (dateStr: string) => {
            const d = new Date(dateStr);
            return d.getMonth() === financePeriod.month && d.getFullYear() === financePeriod.year;
        };

        // Lógica de Rateio Proporcional
        // Se aluno tem 2 cursos, cada curso conta como 50% do valor mensal dele
        const calculateMetrics = (courseId: string | 'all') => {
            let totalFaturado = 0;
            let totalRecebido = 0;
            let totalAtraso = 0;
            let totalPendente = 0;
            let activeStudentsCount = 0;

            students.forEach(student => {
                const enrolledCourses = student.courses || [];
                const isAll = courseId === 'all';
                const isMatchingCourse = isAll || enrolledCourses.some(c => c.course_id === courseId);

                if (isMatchingCourse) {
                    const divisor = enrolledCourses.length || 1;
                    const proportionalAmount = student.amount / (isAll ? 1 : divisor);

                    if (student.status !== 'inactive') {
                        activeStudentsCount++;
                        if (student.status === 'overdue') totalAtraso += proportionalAmount;
                        if (student.status === 'blocked') totalPendente += proportionalAmount;
                    }
                }
            });

            // Recebido no período selecionado
            paymentHistory.forEach(p => {
                if (isInPeriod(p.payment_date || p.created_at)) {
                    const student = students.find(s => s.id === p.student_id);
                    if (student) {
                        const enrolledCourses = student.courses || [];
                        const isAll = courseId === 'all';
                        if (isAll || enrolledCourses.some(c => c.course_id === courseId)) {
                            const divisor = enrolledCourses.length || 1;
                            totalRecebido += Number(p.amount) / (isAll ? 1 : divisor);
                        }
                    }
                }
            });

            totalFaturado = totalRecebido + totalAtraso + totalPendente;

            return { totalFaturado, totalRecebido, totalAtraso, totalPendente, activeStudentsCount };
        };

        const metrics = calculateMetrics(selectedCourseId);

        const renderTabContent = () => {
            switch (financeTab) {
                case 'overview':
                    return (
                        <div className="space-y-6">
                            {/* Cards de Resumo */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1A202C] p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Total Faturado</p>
                                    <h3 className="text-xl font-bold text-white">R$ {metrics.totalFaturado.toLocaleString()}</h3>
                                </div>
                                <div className="bg-[#1A202C] p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] text-[#0081FF] font-black uppercase mb-1">Total Recebido</p>
                                    <h3 className="text-xl font-bold text-white">R$ {metrics.totalRecebido.toLocaleString()}</h3>
                                </div>
                                <div className="bg-[#1A202C] p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] text-[#FF00BC] font-black uppercase mb-1">Em Atraso</p>
                                    <h3 className="text-xl font-bold text-white">R$ {metrics.totalAtraso.toLocaleString()}</h3>
                                </div>
                                <div className="bg-[#1A202C] p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] text-orange-500 font-black uppercase mb-1">Pendentes</p>
                                    <h3 className="text-xl font-bold text-white">R$ {metrics.totalPendente.toLocaleString()}</h3>
                                </div>
                            </div>

                            {/* Alunos Ativos */}
                            <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <h4 className="text-white font-bold">Alunos Ativos</h4>
                                    <p className="text-xs text-gray-500">Total de matrículas ativas no sistema</p>
                                </div>
                                <div className="text-3xl font-black text-[#0081FF]">{metrics.activeStudentsCount}</div>
                            </div>

                            {/* Pendências de Comprovantes */}
                            {pendingReceipts.length > 0 && (
                                <div className="bg-[#6F4CE7]/10 p-5 rounded-3xl border border-[#6F4CE7]/20">
                                    <h3 className="text-[#6F4CE7] font-bold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-rounded">warning</span>
                                        Comprovantes Pendentes ({pendingReceipts.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {pendingReceipts.slice(0, 3).map(r => (
                                            <div key={r.id} className="flex justify-between items-center text-xs">
                                                <span className="text-white">{r.userName}</span>
                                                <span className="text-gray-400">R$ {r.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );

                case 'by_course':
                    return (
                        <div className="space-y-4">
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
                                <button
                                    onClick={() => setSelectedCourseId('all')}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shrink-0 ${selectedCourseId === 'all' ? 'bg-[#0081FF] text-white' : 'bg-white/5 text-gray-500'}`}
                                >
                                    Todos
                                </button>
                                {courses.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCourseId(c.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shrink-0 ${selectedCourseId === c.id ? 'bg-[#0081FF] text-white' : 'bg-white/5 text-gray-500'}`}
                                    >
                                        {c.nome}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-[#1A202C] rounded-3xl border border-white/5 overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-black/20 text-gray-500 uppercase">
                                        <tr>
                                            <th className="p-4 font-black">Curso</th>
                                            <th className="p-4 font-black">Recebido</th>
                                            <th className="p-4 font-black">Alunos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(selectedCourseId === 'all' ? courses : courses.filter(c => c.id === selectedCourseId)).map(course => {
                                            const courseMetrics = calculateMetrics(course.id);
                                            return (
                                                <tr key={course.id}>
                                                    <td className="p-4 text-white font-bold">{course.nome}</td>
                                                    <td className="p-4 text-[#0081FF] font-black">R$ {courseMetrics.totalRecebido.toFixed(2)}</td>
                                                    <td className="p-4 text-gray-400">{courseMetrics.activeStudentsCount}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );

                case 'status':
                    const statusFiltered = students.filter(s => {
                        const matchesCourse = selectedCourseId === 'all' || s.courses?.some(c => c.course_id === selectedCourseId);
                        return matchesCourse;
                    });

                    return (
                        <div className="space-y-3">
                            {statusFiltered.map(student => (
                                <div key={student.id} onClick={() => setSelectedStudent(student)} className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{student.name}</h4>
                                            <div className="flex gap-1">
                                                {student.courses?.map((sc: any) => (
                                                    <span key={sc.course_id} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 uppercase">
                                                        {courses.find(c => c.id === sc.course_id)?.nome}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${student.status === 'active' ? 'bg-[#0081FF]/10 text-[#0081FF]' :
                                            student.status === 'overdue' ? 'bg-[#FF00BC]/10 text-[#FF00BC]' :
                                                'bg-orange-500/10 text-orange-500'
                                            }`}>
                                            {student.status === 'active' ? 'Em Dia' : student.status === 'overdue' ? 'Atraso' : 'Pendente'}
                                        </span>
                                        <p className="text-[10px] text-gray-500 mt-1">Venc: {student.paymentDay}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );

                case 'repasse':
                    if (!isActuallyAdmin) return <p className="text-gray-500 text-sm text-center py-8">Acesso restrito ao administrador.</p>;

                    const handleSaveExpense = async (teacherId: string) => {
                        setSavingExpense(true);
                        try {
                            const exp = editingExpenses[teacherId];
                            if (exp) {
                                const { error } = await supabase
                                    .from('teacher_expenses')
                                    .upsert({
                                        teacher_id: teacherId,
                                        month: financePeriod.month,
                                        year: financePeriod.year,
                                        travel_expense: parseFloat(exp.travel) || 0,
                                        food_expense: parseFloat(exp.food) || 0,
                                        notes: exp.notes || '',
                                        updated_at: new Date().toISOString()
                                    }, { onConflict: 'teacher_id,month,year' });
                                if (error) throw error;
                            }
                            // Save repasse percent for each course
                            const teacherCourses = courses.filter(c => c.teacher_id === teacherId);
                            for (const course of teacherCourses) {
                                const key = `${teacherId}_${course.id}`;
                                if (editingRepasse[key] !== undefined) {
                                    const newPercent = parseFloat(editingRepasse[key]) || 0;
                                    await supabase.from('courses').update({ repasse_percent: newPercent }).eq('id', course.id);
                                }
                            }
                            // Save individual student repasses
                            const studentEntries = Object.entries(editingStudentRepasse) as [string, { fixed?: string, percent?: string }][];
                            for (const [enrollmentId, values] of studentEntries) {
                                const updateData: any = {};
                                // Handle Fixed Amount
                                if (values.fixed !== undefined) {
                                    updateData.repasse_fixed_amount = values.fixed === '' ? null : parseFloat(values.fixed);
                                }
                                // Handle Custom Percentage
                                if (values.percent !== undefined) {
                                    updateData.repasse_custom_percentage = values.percent === '' ? null : parseFloat(values.percent);
                                }

                                if (Object.keys(updateData).length > 0) {
                                    const { error: sError } = await supabase
                                        .from('student_courses')
                                        .update(updateData)
                                        .eq('id', enrollmentId);
                                    if (sError) throw sError;
                                }
                            }

                            await fetchData();
                            alert('Valores salvos com sucesso! ✅');
                        } catch (err: any) {
                            alert('Erro ao salvar: ' + err.message);
                        } finally {
                            setSavingExpense(false);
                        }
                    };

                    // Calculate grand totals
                    let grandTotalRepasse = 0;

                    return (
                        <div className="space-y-3">
                            {teachers.filter(t => t.role !== 'admin' && !['lorenapimenteloficial@gmail.com', 'willmakesongs@gmail.com'].includes(t.email?.toLowerCase().trim())).map(teacher => {
                                const teacherCourses = courses.filter(c => c.teacher_id === teacher.id);
                                const expense = teacherExpenses.find(e => e.teacher_id === teacher.id);
                                const isExpanded = expandedTeacher === teacher.id;

                                let teacherRepasseFromCourses = 0;
                                let teacherActiveStudents = 0;
                                let teacherTotalMensal = 0;

                                const courseDetails = teacherCourses.map(course => {
                                    // Calculate based on active students' monthly amounts for this course
                                    let courseMonthlyTotal = 0;
                                    let courseStudentCount = 0;
                                    let courseRepasse = 0;

                                    const courseStudents = students.filter(student => {
                                        if (student.status === 'inactive') return false;
                                        const enrolledCourses = student.courses || [];
                                        return enrolledCourses.some(c => c.course_id === course.id);
                                    }).map(student => {
                                        const enrollment = student.courses!.find(c => c.course_id === course.id)!;
                                        courseStudentCount++;

                                        const studentAmount = enrollment.amount != null
                                            ? Number(enrollment.amount)
                                            : (student.amount / (student.courses!.length || 1));

                                        courseMonthlyTotal += studentAmount;

                                        // Determine repasse for this SPECIFIC student
                                        const studentOverride = editingStudentRepasse[enrollment.id];
                                        const defaultPercent = editingRepasse[`${teacher.id}_${course.id}`] !== undefined
                                            ? parseFloat(editingRepasse[`${teacher.id}_${course.id}`]) || 0
                                            : Number(course.repasse_percent) || 50;

                                        let studentRepasse = 0;
                                        if (studentOverride?.fixed !== undefined) {
                                            studentRepasse = parseFloat(studentOverride.fixed) || 0;
                                        } else if (enrollment.repasse_fixed_amount != null) {
                                            studentRepasse = Number(enrollment.repasse_fixed_amount);
                                        } else if (studentOverride?.percent !== undefined) {
                                            studentRepasse = studentAmount * ((parseFloat(studentOverride.percent) || 0) / 100);
                                        } else if (enrollment.repasse_custom_percentage != null) {
                                            studentRepasse = studentAmount * (Number(enrollment.repasse_custom_percentage) / 100);
                                        } else {
                                            studentRepasse = studentAmount * (defaultPercent / 100);
                                        }

                                        courseRepasse += studentRepasse;
                                        return { student, enrollment, studentAmount, studentRepasse };
                                    });

                                    teacherRepasseFromCourses += courseRepasse;
                                    teacherActiveStudents += courseStudentCount;
                                    teacherTotalMensal += courseMonthlyTotal;

                                    return { course, courseStudentCount, courseMonthlyTotal, courseRepasse, students: courseStudents };
                                });

                                const travelExp = editingExpenses[teacher.id]?.travel !== undefined
                                    ? parseFloat(editingExpenses[teacher.id].travel) || 0
                                    : Number(expense?.travel_expense) || 0;
                                const foodExp = editingExpenses[teacher.id]?.food !== undefined
                                    ? parseFloat(editingExpenses[teacher.id].food) || 0
                                    : Number(expense?.food_expense) || 0;

                                const totalLiquido = teacherRepasseFromCourses + travelExp + foodExp;
                                grandTotalRepasse += totalLiquido;

                                return (
                                    <div key={teacher.id} className="bg-[#1A202C] rounded-2xl border border-white/5 overflow-hidden">
                                        {/* Header — clicável */}
                                        <button
                                            onClick={() => {
                                                setExpandedTeacher(isExpanded ? null : teacher.id);
                                                if (!isExpanded && !editingExpenses[teacher.id]) {
                                                    setEditingExpenses(prev => ({
                                                        ...prev,
                                                        [teacher.id]: {
                                                            travel: String(expense?.travel_expense || 0),
                                                            food: String(expense?.food_expense || 0),
                                                            notes: expense?.notes || ''
                                                        }
                                                    }));
                                                    teacherCourses.forEach(c => {
                                                        const key = `${teacher.id}_${c.id}`;
                                                        if (editingRepasse[key] === undefined) {
                                                            setEditingRepasse(prev => ({ ...prev, [key]: String(c.repasse_percent || 50) }));
                                                        }
                                                    });
                                                }
                                            }}
                                            className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#0081FF]/20 text-[#0081FF] flex items-center justify-center font-black text-sm shrink-0">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-white font-bold text-sm">{teacher.name}</p>
                                                <p className="text-gray-500 text-[10px]">{teacherActiveStudents} alunos • {teacherCourses.length} cursos</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#0081FF] font-black text-sm">R$ {totalLiquido.toFixed(2)}</p>
                                                <p className="text-gray-600 text-[10px]">TOTAL</p>
                                            </div>
                                            <span className={`material-symbols-rounded text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                        </button>

                                        {/* Painel expandido */}
                                        {isExpanded && (
                                            <div className="border-t border-white/5 p-4 space-y-5">
                                                {/* Detalhes por curso */}
                                                <div className="space-y-4">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><span className="material-symbols-rounded text-xs">school</span> Cursos & Repasses Individuais</p>

                                                    {courseDetails.map(({ course, courseStudentCount, courseMonthlyTotal, courseRepasse, students: courseStudents }) => (
                                                        <div key={course.id} className="space-y-2">
                                                            {/* Cabeçalho do Curso */}
                                                            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-xs font-black truncate">{getCourseIcon(course.slug)} {course.nome}</p>
                                                                    <p className="text-gray-500 text-[10px] uppercase font-bold">{courseStudentCount} alunos • R$ {courseMonthlyTotal.toFixed(2)} mensal</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[#0081FF] font-black text-xs">R$ {courseRepasse.toFixed(2)}</p>
                                                                    <p className="text-gray-600 text-[8px] uppercase">Repasse Total</p>
                                                                </div>
                                                            </div>

                                                            {/* Lista de Alunos do Curso */}
                                                            <div className="ml-3 space-y-1.5 border-l-2 border-white/5 pl-3">
                                                                {courseStudents.map(({ student, enrollment, studentAmount, studentRepasse }) => (
                                                                    <div key={student.id} className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-3">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <img src={student.avatarUrl} alt={student.name} className="w-6 h-6 rounded-full border border-white/10" />
                                                                                <span className="text-[10px] text-gray-400">{student.name.split(' ')[0]}</span>
                                                                            </div>
                                                                            <p className="text-gray-500 text-[10px]">Mensal: R$ {studentAmount.toFixed(2)}</p>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div className="flex flex-col gap-1">
                                                                                <label className="text-[8px] text-gray-500 font-black uppercase">Fixo (R$)</label>
                                                                                <input
                                                                                    type="number"
                                                                                    placeholder="Ex: 150"
                                                                                    value={editingStudentRepasse[enrollment.id]?.fixed ?? (enrollment.repasse_fixed_amount != null ? String(enrollment.repasse_fixed_amount) : '')}
                                                                                    onChange={(e) => setEditingStudentRepasse(prev => ({
                                                                                        ...prev,
                                                                                        [enrollment.id]: { ...prev[enrollment.id], fixed: e.target.value }
                                                                                    }))}
                                                                                    className="h-8 bg-[#101622] border border-white/10 rounded-lg px-2 text-white text-xs focus:border-[#0081FF] focus:outline-none"
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col gap-1">
                                                                                <label className="text-[8px] text-gray-500 font-black uppercase">Percentual (%)</label>
                                                                                <input
                                                                                    type="number"
                                                                                    placeholder="Ex: 50"
                                                                                    value={editingStudentRepasse[enrollment.id]?.percent ?? (enrollment.repasse_custom_percentage != null ? String(enrollment.repasse_custom_percentage) : '')}
                                                                                    onChange={(e) => setEditingStudentRepasse(prev => ({
                                                                                        ...prev,
                                                                                        [enrollment.id]: { ...prev[enrollment.id], percent: e.target.value }
                                                                                    }))}
                                                                                    className="h-8 bg-[#101622] border border-white/10 rounded-lg px-2 text-white text-xs focus:border-[#0081FF] focus:outline-none"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex justify-between items-center bg-[#0081FF]/5 px-2 py-1 rounded-lg">
                                                                            <span className="text-gray-500 text-[9px] font-bold uppercase">Repasse Calculado</span>
                                                                            <span className="text-[#0081FF] text-[11px] font-black">R$ {studentRepasse.toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {courseDetails.length === 0 && <p className="text-gray-600 text-xs italic text-center py-2">Nenhum curso vinculado.</p>}
                                                </div>

                                                {/* Despesas */}
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><span className="material-symbols-rounded text-xs">receipt</span> Despesas Mensais</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                                            <label className="text-[10px] text-gray-500 block mb-1">🚗 Viagem</label>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-gray-500 text-xs">R$</span>
                                                                <input
                                                                    type="number"
                                                                    value={editingExpenses[teacher.id]?.travel ?? String(expense?.travel_expense || 0)}
                                                                    onChange={(e) => setEditingExpenses(prev => ({
                                                                        ...prev,
                                                                        [teacher.id]: { ...prev[teacher.id], travel: e.target.value }
                                                                    }))}
                                                                    className="w-full h-8 bg-[#101622] border border-white/10 rounded-lg px-2 text-white text-xs font-bold focus:outline-none focus:border-[#0081FF]"
                                                                    min="0" step="0.01"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                                            <label className="text-[10px] text-gray-500 block mb-1">🍽️ Alimentação</label>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-gray-500 text-xs">R$</span>
                                                                <input
                                                                    type="number"
                                                                    value={editingExpenses[teacher.id]?.food ?? String(expense?.food_expense || 0)}
                                                                    onChange={(e) => setEditingExpenses(prev => ({
                                                                        ...prev,
                                                                        [teacher.id]: { ...prev[teacher.id], food: e.target.value }
                                                                    }))}
                                                                    className="w-full h-8 bg-[#101622] border border-white/10 rounded-lg px-2 text-white text-xs font-bold focus:outline-none focus:border-[#0081FF]"
                                                                    min="0" step="0.01"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                                        <label className="text-[10px] text-gray-500 block mb-1">📝 Observações</label>
                                                        <input
                                                            type="text"
                                                            value={editingExpenses[teacher.id]?.notes ?? (expense?.notes || '')}
                                                            onChange={(e) => setEditingExpenses(prev => ({
                                                                ...prev,
                                                                [teacher.id]: { ...prev[teacher.id], notes: e.target.value }
                                                            }))}
                                                            className="w-full h-8 bg-[#101622] border border-white/10 rounded-lg px-2 text-white text-xs focus:outline-none focus:border-[#0081FF]"
                                                            placeholder="Ex: vem de outra cidade..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* Resumo Final */}
                                                <div className="p-3 bg-[#0081FF]/5 rounded-xl border border-[#0081FF]/20 space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-400">Repasse dos cursos</span>
                                                        <span className="text-white font-bold">R$ {teacherRepasseFromCourses.toFixed(2)}</span>
                                                    </div>
                                                    {travelExp > 0 && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-400">+ Viagem</span>
                                                            <span className="text-white">R$ {travelExp.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    {foodExp > 0 && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-400">+ Alimentação</span>
                                                            <span className="text-white">R$ {foodExp.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-sm border-t border-[#0081FF]/20 pt-1 mt-1">
                                                        <span className="text-[#0081FF] font-black">TOTAL REPASSE</span>
                                                        <span className="text-[#0081FF] font-black">R$ {totalLiquido.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                {/* Botão Salvar */}
                                                <button
                                                    onClick={() => handleSaveExpense(teacher.id)}
                                                    disabled={savingExpense}
                                                    className="w-full h-11 rounded-xl bg-[#0081FF] text-white font-black text-xs uppercase tracking-widest hover:bg-[#0081FF]/80 transition-all disabled:opacity-50"
                                                >
                                                    {savingExpense ? 'Salvando...' : '💾 Salvar Valores'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Total Geral */}
                            <div className="bg-[#0081FF]/10 rounded-2xl border border-[#0081FF]/20 p-4 flex justify-between items-center">
                                <span className="text-white font-bold text-sm">Total Repasse (todos)</span>
                                <span className="text-[#0081FF] font-black text-lg">R$ {grandTotalRepasse.toFixed(2)}</span>
                            </div>

                            <p className="text-[10px] text-gray-500 italic px-2">
                                * Repasse = (Recebido × %) + Viagem + Alimentação. Somente Admin tem acesso.
                            </p>
                        </div>
                    );
            }
        };

        return (
            <div className="flex-1 flex flex-col bg-[#101622] overflow-hidden">
                <div className="p-6 pb-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white tracking-tighter uppercase">Financeiro</h2>
                        <div className="flex items-center gap-2 bg-[#1A202C] p-1 rounded-xl border border-white/5">
                            <select
                                value={financePeriod.month}
                                onChange={(e) => setFinancePeriod(prev => ({ ...prev, month: Number(e.target.value) }))}
                                className="bg-transparent text-white text-[10px] font-bold outline-none px-2 py-1"
                            >
                                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (
                                    <option key={i} value={i} className="bg-[#1A202C]">{m}</option>
                                ))}
                            </select>
                            <div className="w-[1px] h-4 bg-white/10"></div>
                            <select
                                value={financePeriod.year}
                                onChange={(e) => setFinancePeriod(prev => ({ ...prev, year: Number(e.target.value) }))}
                                className="bg-transparent text-white text-[10px] font-bold outline-none px-2 py-1"
                            >
                                {[2025, 2026].map(y => (
                                    <option key={y} value={y} className="bg-[#1A202C]">{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Menu de Abas */}
                    <div className="flex gap-1 bg-black/20 p-1 rounded-2xl overflow-x-auto hide-scrollbar">
                        {[
                            { id: 'overview', label: 'Geral', icon: 'payments' },
                            { id: 'by_course', label: 'Cursos', icon: 'analytics' },
                            { id: 'status', label: 'Alunos', icon: 'group' },
                            ...(isActuallyAdmin ? [{ id: 'repasse', label: 'Repasse', icon: 'handshake' }] : [])
                        ].map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setFinanceTab(tab.id)}
                                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 px-4 ${financeTab === tab.id ? 'bg-[#1A202C] text-white shadow-lg' : 'text-gray-500'}`}
                            >
                                <span className="material-symbols-rounded text-sm">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 pb-32 hide-scrollbar">
                    {renderTabContent()}
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
                                { icon: 'schedule', label: 'Horários Disponíveis', color: 'text-vibe-400' },
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
                        className="w-full p-4 bg-[#FF00BC]/10 rounded-3xl border border-[#FF00BC]/20 text-[#FF00BC] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded text-lg">logout</span>
                        Encerrar Sessão
                    </button>

                    <p className="text-center text-[10px] text-gray-700 font-bold uppercase py-4">Versão 1.2.0-beta • 2026</p>
                </div>
            </div>
        );
    };

    const renderNotifications = () => {
        return (
            <div className="flex-1 flex flex-col hide-scrollbar pb-32 overflow-y-auto px-6 pt-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-white font-black text-xl tracking-tight">Comunicados</h3>
                        <p className="text-[10px] text-gray-500 font-extrabold uppercase mt-1 tracking-widest">Avisos e Lembretes Push</p>
                    </div>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setIsBroadcastModalOpen(true)}
                            className="p-4 bg-[#0081FF] rounded-2xl flex items-center gap-2 shadow-lg shadow-[#0081FF]/20 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-rounded text-white">campaign</span>
                            <span className="text-[10px] text-white font-black uppercase">Novo Aviso Geral</span>
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase ml-1">Histórico Recente</p>
                    {notificationsHistory.length > 0 ? (
                        notificationsHistory.map((n) => (
                            <div key={n.id} className="bg-[#1A202C] p-5 rounded-3xl border border-white/5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white font-bold text-sm">{n.title}</h4>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${n.status === 'sent' ? 'bg-green-500/10 text-green-500' :
                                        n.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                                        }`}>
                                        {n.status === 'sent' ? 'Enviado' : n.status === 'failed' ? 'Falhou' : 'Pendente'}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs leading-relaxed">{n.body}</p>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <span className="text-[9px] text-gray-600 font-bold uppercase">{new Date(n.created_at).toLocaleString('pt-BR')}</span>
                                    {n.user_id && (
                                        <span className="text-[9px] text-[#0081FF] font-extrabold uppercase ml-auto">Para: {students.find(s => s.id === n.user_id)?.name || 'Aluno'}</span>
                                    )}
                                    {!n.user_id && (
                                        <span className="text-[9px] text-vibe-400 font-extrabold uppercase ml-auto">Broadcast Geral</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <span className="material-symbols-rounded text-5xl text-gray-700 mb-4">history</span>
                            <p className="text-gray-500 text-sm">Nenhuma notificação enviada ainda.</p>
                        </div>
                    )}
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

        const dayAppointments = students.filter(s => {
            if (s.status === 'inactive') return false;

            // If a specific course is selected, check only its enrollment
            if (selectedCourseId !== 'all') {
                const enrollment = s.courses?.find(c => c.course_id === selectedCourseId);
                if (enrollment) {
                    return enrollment.schedule_day === selectedDayLabel;
                }
                // Fallback to profile if no specific enrollment data but course is associated
                const isEnrolled = s.courses?.some(c => c.course_id === selectedCourseId);
                return isEnrolled && s.scheduleDay === selectedDayLabel;
            }

            // If "All Courses" is selected, match if profile OR any enrollment matches
            const profileMatches = s.scheduleDay === selectedDayLabel;
            const anyCourseMatches = s.courses?.some(c => c.schedule_day === selectedDayLabel);
            return profileMatches || anyCourseMatches;
        }).map(s => {
            // Get data based on context
            const enrollment = selectedCourseId !== 'all'
                ? s.courses?.find(c => c.course_id === selectedCourseId)
                : s.courses?.find(c => c.schedule_day === selectedDayLabel); // Pick first matching enrollment if in "All" view

            const scheduleTime = enrollment?.schedule_time || s.scheduleTime || '14:00';

            return {
                id: s.id,
                studentName: s.name,
                time: scheduleTime,
                endTime: (() => {
                    const [h, m] = scheduleTime.split(':').map(Number);
                    const date = new Date();
                    date.setHours(h, m + 60);
                    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                })(),
                type: `${s.level || 'Iniciante'} • ${s.modality || 'Presencial'}`,
                paymentStatus: s.status,
                avatarUrl: s.avatarUrl,
                phone: s.phone,
                instrument: courses.find(c => c.id === enrollment?.course_id)?.nome || 'Aula'
            };
        }).sort((a, b) => a.time.localeCompare(b.time));

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

                    {/* Pag. Pendentes - Only for Admin */}
                    {isActuallyAdmin && (
                        <div className="bg-[#1A202C] rounded-[24px] p-5 border border-white/5 relative overflow-hidden group hover:border-[#FF00BC]/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[#94A3B8] font-bold text-sm">Pag. Pendentes</h3>
                                <div className="w-8 h-8 rounded-xl bg-[#FF00BC]/10 text-[#FF00BC] flex items-center justify-center">
                                    <span className="material-symbols-rounded text-xl">warning</span>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white tracking-tight">{pendingPaymentsCount}</span>
                                <span className="text-[10px] font-black uppercase text-red-400 bg-[#FF00BC]/10 px-2 py-1 rounded-lg tracking-wider">Atrasados</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Calendar Strip */}
                <div className="px-6 mb-8">
                    <div className="bg-[#1A202C] rounded-[32px] p-6 border border-white/5">
                        {/* Month Header */}
                        <div className="flex justify-between items-center mb-6 px-2">
                            <div className="flex items-center gap-4">
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

                            <button
                                onClick={() => setIsExportModalOpen(true)}
                                className="w-10 h-10 rounded-full bg-[#0081FF]/10 text-[#0081FF] hover:bg-[#0081FF]/20 flex items-center justify-center transition-colors shadow-sm"
                                title="Exportar Agenda"
                            >
                                <span className="material-symbols-rounded text-[20px]">download</span>
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
                                        ? 'bg-[#0081FF] text-white shadow-lg shadow-[#0081FF]/30 scale-110'
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
                                    onClick={() => onNavigate(Screen.STUDENT_DETAIL, apt.studentId)}
                                >
                                    <div className="relative">
                                        <img src={apt.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-[#151A23]" alt={apt.studentName} />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1A202C] flex items-center justify-center overflow-hidden ${apt.paymentStatus === 'overdue' ? 'bg-[#FF00BC]' : 'bg-[#0081FF]'
                                            }`}>
                                            {apt.paymentStatus === 'overdue' && <span className="material-symbols-rounded text-[10px] text-white font-bold">!</span>}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-white truncate">{apt.studentName}</h4>
                                                {apt.paymentStatus === 'overdue' || apt.paymentStatus === 'blocked' ? (
                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[#FF00BC]/10 text-[#FF00BC] tracking-wider">Pendente</span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[#0081FF]/10 text-[#0081FF] tracking-wider">Ativo</span>
                                                )}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${apt.paymentStatus === 'active' || apt.paymentStatus === 'overdue' ? 'text-[#0081FF]/70' :
                                                apt.paymentStatus === 'trial' ? 'text-[#FF00BC]/70' :
                                                    'text-[#FF00BC]/70'
                                                }`}>
                                                {apt.paymentStatus === 'active' || apt.paymentStatus === 'overdue' ? 'ALUNO ATIVO' :
                                                    apt.paymentStatus === 'trial' ? 'ALUNO TESTE' : 'ALUNO BLOQUEADO'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{apt.type}</p>

                                        {/* Optional: Check-in/Status text similar to image 'Em dia' */}
                                        {apt.paymentStatus !== 'overdue' && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="material-symbols-rounded text-[#0081FF] text-[10px]">check_circle</span>
                                                <span className="text-[9px] text-[#0081FF] font-bold">Em dia</span>
                                            </div>
                                        )}
                                        {apt.paymentStatus === 'overdue' && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="material-symbols-rounded text-[#FF00BC] text-[10px]">error</span>
                                                <span className="text-[9px] text-[#FF00BC] font-bold">Pagamento Pendente</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 pl-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNavigate(Screen.STUDENT_DETAIL, apt.studentId);
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

                    {/* Course Filter Tabs */}
                    <div className="mt-6 flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                        {(!user?.role || user?.role === 'admin' || isAdminView || isActuallyAdmin || courses.length > 1) && (
                            <button
                                onClick={() => setSelectedCourseId('all')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCourseId === 'all'
                                    ? 'bg-[#0081FF] text-white border-[#0081FF] shadow-lg shadow-[#0081FF]/20'
                                    : 'bg-[#1A202C] text-gray-500 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                Todos os Cursos
                            </button>
                        )}
                        {courses.map(course => (
                            <button
                                key={course.id}
                                onClick={() => setSelectedCourseId(course.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCourseId === course.id
                                    ? 'bg-[#0081FF] text-white border-[#0081FF] shadow-lg shadow-[#0081FF]/20'
                                    : 'bg-[#1A202C] text-gray-500 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {course.nome}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4 space-y-4 pb-32">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total: {filteredStudents.length} alunos {studentFilter === 'active' ? 'ativos' : 'inativos'}</p>
                        {isActuallyAdmin && (
                            <button onClick={handleDownloadTXT} className="text-[10px] font-black text-[#0081FF] uppercase flex items-center gap-1 hover:underline">
                                <span className="material-symbols-rounded text-sm">download</span> Exportar .TXT
                            </button>
                        )}
                    </div>

                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <button
                                key={student.id}
                                onClick={() => onNavigate(Screen.STUDENT_DETAIL, student.id)}
                                className="w-full bg-[#1A202C] p-4 rounded-3xl border border-white/5 flex items-center justify-between hover:border-white/10 active:scale-[0.98] transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={student.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-[#101622]" alt={student.name} />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#101622] ${student.status === 'active' ? 'bg-[#0081FF]' : student.status === 'trial' ? 'bg-[#FF00BC]' : student.status === 'inactive' ? 'bg-gray-500' : 'bg-[#FF00BC]'}`}>
                                            {student.status === 'trial' && <span className="material-symbols-rounded text-[8px] text-white absolute inset-0 flex items-center justify-center font-bold">bolt</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{student.name}</h4>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                            {student.courses && student.courses.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    {student.courses.map((sc, idx) => {
                                                        const courseDetails = courses.find(c => c.id === sc.course_id);
                                                        return (
                                                            <span key={sc.id} className="text-[10px] text-[#0081FF] font-black uppercase tracking-wider flex items-center gap-1">
                                                                {getCourseIcon(courseDetails?.slug || '')} {courseDetails?.nome || 'Curso'}
                                                                {idx < student.courses!.length - 1 ? ' • ' : ''}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">
                                                {student.courses && student.courses.length > 0 && <span className="mr-2 opacity-50">•</span>}
                                                {student.modality} • {student.level}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* Schedule Context */}
                                    {selectedCourseId !== 'all' && (
                                        <div className="mb-2">
                                            <p className="text-[10px] text-[#0081FF] font-black uppercase tracking-wider mb-0.5 flex items-center justify-end gap-1">
                                                <span className="material-symbols-rounded text-xs">schedule</span>
                                                {(() => {
                                                    const currentEnrollment = student.courses?.find(c => c.course_id === selectedCourseId);
                                                    return `${currentEnrollment?.schedule_day || student.scheduleDay || '---'} • ${currentEnrollment?.schedule_time || student.scheduleTime || '--:--'}`;
                                                })()}
                                            </p>
                                        </div>
                                    )}
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
                </div >
            </div >
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
            case 'notifications': return renderNotifications();
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
                            {activeTab === 'dashboard' ? 'Agenda' : activeTab === 'students' ? 'Alunos' : activeTab === 'reports' ? 'Financeiro' : activeTab === 'notifications' ? 'Comunicados' : 'Ajustes'}
                        </h2>
                    </div>
                    <button onClick={() => setShowConfig(!showConfig)} className="relative">
                        <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-[#101622] z-10 ${syncStatus === 'synced' ? 'bg-[#0081FF]' :
                            syncStatus === 'error' ? 'bg-[#FF00BC] animate-pulse' : 'bg-[#6F4CE7]'
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
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                        { id: 'students', label: 'Alunos', icon: 'group' },
                        { id: 'reports', label: 'Financeiro', icon: 'payments' },
                        { id: 'notifications', label: 'Avisos', icon: 'campaign' },
                        { id: 'settings', label: 'Ajustes', icon: 'settings' }
                    ].map(tab => (
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

                            {/* Dashboard/Financial Badge - Only if reports tab exists */}
                            {tab.id === 'reports' && receipts.some(r => r.status === 'pending') && (
                                <span className="absolute top-0 -right-1 w-2 h-2 bg-[#FF00BC] rounded-full border border-[#101622] animate-pulse"></span>
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
            <div className="h-[150px] shrink-0 w-full bg-[#101622]"></div>

            {/* Botão de Add - FIXED e sem sobreposição - Only for Admin */}
            {isActuallyAdmin && (
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#0081FF] text-white shadow-lg flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all shadow-[#0081FF]/30"
                    style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
                >
                    <span className="material-symbols-rounded text-3xl">add</span>
                </button>
            )}

            {/* Modal de Exportação */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-[300] flex flex-col justify-end p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-[#1A202C] w-full max-w-md mx-auto rounded-[32px] p-6 shadow-2xl border border-white/10 flex flex-col gap-6 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white text-lg">Exportar Agenda</h3>
                            <button onClick={() => setIsExportModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 active:scale-90 transition-all">
                                <span className="material-symbols-rounded text-sm">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Formato do Arquivo</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setExportFormat('pdf')}
                                        className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${exportFormat === 'pdf' ? 'border-[#0081FF] bg-[#0081FF]/10 text-white' : 'border-white/5 bg-black/20 text-gray-400'}`}
                                    >
                                        <span className="material-symbols-rounded mb-1">picture_as_pdf</span>
                                        <span className="font-bold text-sm">PDF (Tabela)</span>
                                    </button>
                                    <button
                                        onClick={() => setExportFormat('txt')}
                                        className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${exportFormat === 'txt' ? 'border-[#0081FF] bg-[#0081FF]/10 text-white' : 'border-white/5 bg-black/20 text-gray-400'}`}
                                    >
                                        <span className="material-symbols-rounded mb-1">subject</span>
                                        <span className="font-bold text-sm">TXT (Texto)</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Período</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setExportPeriod('week')}
                                        className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all ${exportPeriod === 'week' ? 'bg-white/20 text-white' : 'bg-black/20 text-gray-400'}`}
                                    >
                                        Dessa Semana
                                    </button>
                                    <button
                                        onClick={() => setExportPeriod('month')}
                                        className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all ${exportPeriod === 'month' ? 'bg-white/20 text-white' : 'bg-black/20 text-gray-400'}`}
                                    >
                                        Desse Mês
                                    </button>
                                </div>
                            </div>

                            {isActuallyAdmin && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Escopo de Alunos</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setExportScope('my_courses')}
                                            className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all ${exportScope === 'my_courses' ? 'bg-white/20 text-white' : 'bg-black/20 text-gray-400'}`}
                                        >
                                            Meus Cursos
                                        </button>
                                        <button
                                            onClick={() => setExportScope('all')}
                                            className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all ${exportScope === 'all' ? 'bg-white/20 text-white' : 'bg-black/20 text-gray-400'}`}
                                        >
                                            Academia Inteira
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleExportAgenda}
                                className="w-full mt-4 py-4 rounded-xl bg-[#0081FF] text-white font-black uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded">file_download</span>
                                Baixar Arquivo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm bg-[#1A202C] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-full max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#151A23] shrink-0">
                            <h3 className="font-bold text-white">Detalhes do Aluno</h3>
                            <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white"><span className="material-symbols-rounded">close</span></button>
                        </div>

                        <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-4 pb-32">
                            <div className="flex gap-4 items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-2 border-[#0081FF] overflow-hidden">
                                        {isUploadingStudentPhoto ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black/50">
                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-[#1A202C] flex items-center justify-center">
                                                <img src={selectedStudent.avatarUrl} className="w-full h-full object-cover" alt={selectedStudent.name} />
                                            </div>
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
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-lg font-bold text-white leading-none">{selectedStudent.name}</h4>
                                        <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                            <input
                                                type="number"
                                                value={editAge}
                                                onChange={(e) => setEditAge(e.target.value)}
                                                className="bg-transparent border-none text-white text-xs font-bold focus:outline-none w-8 text-center p-0"
                                                placeholder="--"
                                            />
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">anos</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500 uppercase font-black">{selectedStudent.modality} • {selectedStudent.level}</p>
                                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${selectedStudent.status === 'blocked'
                                            ? 'bg-[#FF00BC]/20 border-[#FF00BC]/30 text-red-400'
                                            : selectedStudent.status === 'inactive'
                                                ? 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                                                : 'bg-[#0081FF]/20 border-[#0081FF]/30 text-green-400'
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
                            </div>

                            {/* Status Control Toggle */}
                            <div className="p-5 bg-[#101622] rounded-2xl border border-white/5 space-y-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-[#0081FF] uppercase tracking-[0.15em] mb-1">Controle de Acesso</p>
                                    <p className="text-[11px] text-gray-500 font-medium">Gerencie a liberação das funcionalidades para este aluno</p>
                                </div>

                                <div className="flex bg-[#1A202C] p-1 rounded-2xl border border-white/5 relative h-12 shadow-inner">
                                    <div
                                        className={`absolute top-1 bottom-1 transition-all duration-300 ease-out rounded-xl shadow-lg z-0 ${editStatus === 'active' || editStatus === 'overdue' ? 'left-1 w-[calc(25%-2px)] bg-[#0081FF] shadow-[#0081FF]/20' :
                                            editStatus === 'blocked' ? 'left-[calc(25%+1px)] w-[calc(25%-2px)] bg-[#FF00BC] shadow-[#FF00BC]/20' :
                                                editStatus === 'trial' ? 'left-[calc(50%+1px)] w-[calc(25%-2px)] bg-[#FF00BC] shadow-pink-500/20' :
                                                    'left-[calc(75%+1px)] w-[calc(25%-2px)] bg-gray-600 shadow-gray-500/20'
                                            }`}
                                    />

                                    <button onClick={() => setEditStatus('active')} className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors duration-300 ${editStatus === 'active' || editStatus === 'overdue' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}>
                                        <span className="material-symbols-rounded text-[18px]">check_circle</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Ativo</span>
                                    </button>
                                    <button onClick={() => setEditStatus('blocked')} className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors duration-300 ${editStatus === 'blocked' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}>
                                        <span className="material-symbols-rounded text-[18px]">block</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Bloqueado</span>
                                    </button>
                                    <button onClick={() => setEditStatus('trial')} className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors duration-300 ${editStatus === 'trial' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}>
                                        <span className="material-symbols-rounded text-[18px]">bolt</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Teste</span>
                                    </button>
                                    <button onClick={() => setEditStatus('inactive')} className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors duration-300 ${editStatus === 'inactive' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}>
                                        <span className="material-symbols-rounded text-[18px]">pause_circle</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Inativo</span>
                                    </button>
                                </div>
                            </div>

                            {/* Payment Action Bar */}
                            <div className="mb-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleConfirmPayment}
                                        className="flex-1 bg-[#0081FF] text-white h-12 rounded-xl flex items-center justify-center gap-3 text-xs font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <span className="material-symbols-rounded text-xl">check_circle</span>
                                        <span className="uppercase tracking-wide">Confirmar Pagamento</span>
                                    </button>
                                    {receipts.find(r => r.userId === selectedStudent.id && r.status === 'pending') && (
                                        <button
                                            onClick={async () => {
                                                const receipt = receipts.find(r => r.userId === selectedStudent.id && r.status === 'pending');
                                                if (!receipt?.receiptUrl) return;
                                                // Support both old public URLs and new file paths
                                                if (receipt.receiptUrl.startsWith('http')) {
                                                    window.open(receipt.receiptUrl, '_blank');
                                                } else {
                                                    const { data, error } = await supabase.storage
                                                        .from('receipts')
                                                        .createSignedUrl(receipt.receiptUrl, 3600);
                                                    if (data?.signedUrl) {
                                                        window.open(data.signedUrl, '_blank');
                                                    } else {
                                                        alert('Erro ao gerar link do comprovante: ' + (error?.message || 'Tente novamente.'));
                                                    }
                                                }
                                            }}
                                            className="w-12 h-12 rounded-xl bg-[#6F4CE7]/10 text-[#6F4CE7] flex items-center justify-center border border-[#6F4CE7]/20 hover:bg-[#6F4CE7]/20 transition-all"
                                            title="Ver Comprovante"
                                        >
                                            <span className="material-symbols-rounded text-xl">receipt</span>
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsRoutineManagerOpen(true)}
                                    className="w-full bg-[#1A202C] text-white border border-white/10 h-12 rounded-xl flex items-center justify-center gap-3 text-xs font-bold hover:bg-white/5 transition-all"
                                >
                                    <span className="material-symbols-rounded text-xl text-[#FF00BC]">calendar_month</span>
                                    <span className="uppercase tracking-wide">Gerenciar Cronograma</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {/* 1. Mensalidade */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-[#1A202C] to-[#161b22] border border-white/5 relative overflow-hidden flex flex-col justify-center">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1 shadow-black drop-shadow-md">Mensalidade</p>
                                    <div className="flex items-baseline gap-0.5 relative z-10">
                                        <span className="text-sm font-medium text-gray-500">R$</span>
                                        <input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(parseInt(e.target.value) || 0)}
                                            className="bg-transparent border-none text-white text-2xl font-black focus:outline-none w-24"
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                                        <span className="material-symbols-rounded text-4xl text-white">savings</span>
                                    </div>
                                </div>

                                {/* 2. Vencimento */}
                                <div className="p-4 rounded-xl bg-[#1A202C] border border-white/5 flex flex-col justify-center relative overflow-hidden group">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Vence dia</p>
                                    <div className="flex items-center gap-1 relative z-10">
                                        <span className="text-2xl font-black text-white">{editPaymentDay}</span>
                                        <select
                                            value={editPaymentDay}
                                            onChange={(e) => setEditPaymentDay(e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        >
                                            {['01', '05', '10', '15', '20', '25'].map(d => (
                                                <option key={d} value={d}>Dia {d}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-rounded text-gray-600 text-sm group-hover:text-[#0081FF] transition-colors">edit</span>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                                        <span className="material-symbols-rounded text-4xl text-white">calendar_month</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Agenda Full Width */}
                            <div className="p-4 rounded-xl bg-[#1A202C] border border-white/5 relative mb-3">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Agenda Semanal</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                        <div className="flex-1">
                                            <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Dia da Semana</p>
                                            <select
                                                value={editScheduleDay}
                                                onChange={(e) => setEditScheduleDay(e.target.value)}
                                                className="w-full bg-transparent text-sm font-bold text-white border-none focus:outline-none cursor-pointer appearance-none"
                                            >
                                                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg / Qua', 'Ter / Qui'].map(d => (
                                                    <option key={d} value={d} className="bg-[#1A202C]">{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-[1px] h-8 bg-white/10"></div>
                                        <div className="flex-1">
                                            <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Horário</p>
                                            <input
                                                type="text"
                                                value={editScheduleTime}
                                                onChange={(e) => setEditScheduleTime(e.target.value)}
                                                className="w-full bg-transparent border-none text-white text-sm font-bold focus:outline-none"
                                                placeholder="00:00"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-600 text-center mt-1">
                                        Para múltiplos horários, selecione a combinação ou edite o texto.
                                    </p>
                                </div>
                                <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                                    <span className="material-symbols-rounded text-4xl text-white">schedule</span>
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Redes Sociais & Contato</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => openInstagram(editInstagram)}
                                        className="w-8 h-8 rounded-lg hover:scale-105 active:scale-95 transition-all overflow-hidden"
                                    >
                                        <img src="/assets/icons/instagram.png" alt="Instagram" className="w-full h-full object-cover" />
                                    </button>
                                    <input
                                        type="text"
                                        value={editInstagram}
                                        onChange={(e) => setEditInstagram(e.target.value)}
                                        placeholder="Instagram"
                                        className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-600"
                                    />
                                </div>
                                <div className="flex items-center gap-3 border-t border-white/5 pt-2">
                                    <span className="material-symbols-rounded text-gray-500 text-sm w-8 text-center">location_on</span>
                                    <input
                                        type="text"
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        placeholder="Endereço"
                                        className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-3 border-t border-white/5 pt-2">
                                    <button
                                        onClick={() => openWhatsApp(editPhone)}
                                        className="w-8 h-8 rounded-lg hover:scale-105 active:scale-95 transition-all overflow-hidden"
                                    >
                                        <img src="/assets/icons/whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover" />
                                    </button>
                                    <input
                                        type="text"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        placeholder="Telefone"
                                        className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Cursos Vinculados</p>
                                    <button
                                        onClick={() => setShowCourseSelector(!showCourseSelector)}
                                        className="text-[10px] text-[#0081FF] font-bold uppercase hover:bg-[#0081FF]/10 px-2 py-1 rounded transition-colors"
                                    >
                                        {showCourseSelector ? 'Fechar' : 'Gerenciar'}
                                    </button>
                                </div>

                                {/* Active Courses Summary */}
                                {!showCourseSelector && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStudent.courses && selectedStudent.courses.length > 0 ? (
                                            selectedStudent.courses.map(sc => {
                                                const c = courses.find(course => course.id === sc.course_id);
                                                if (!c) return null;
                                                return (
                                                    <div key={sc.id} className="flex items-center gap-1.5 px-2 py-1 bg-[#0081FF]/10 border border-[#0081FF]/20 rounded-md">
                                                        {getCourseIcon(c.slug) && <span className="text-xs">{getCourseIcon(c.slug)}</span>}
                                                        <span className="text-[10px] text-[#0081FF] font-black uppercase tracking-wider">{c.nome}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">Nenhum curso vinculado</span>
                                        )}
                                        <button
                                            onClick={() => setShowCourseSelector(true)}
                                            className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                        >
                                            <span className="material-symbols-rounded text-sm">add</span>
                                        </button>
                                    </div>
                                )}

                                {/* Course Selector Drawer */}
                                {showCourseSelector && (
                                    <div className="space-y-1 bg-black/20 rounded-lg p-2 border border-white/5 max-h-48 overflow-y-auto">
                                        {courses.map(course => {
                                            const isLinked = selectedStudent.courses?.some(sc => sc.course_id === course.id);
                                            return (
                                                <button
                                                    key={course.id}
                                                    onClick={() => toggleStudentCourse(course.id, !!isLinked)}
                                                    className={`w-full flex items-center justify-between p-2 rounded-md border transition-all ${isLinked
                                                        ? 'bg-[#0081FF]/10 border-[#0081FF]/20'
                                                        : 'bg-transparent border-transparent hover:bg-white/5'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">{getCourseIcon(course.slug)}</span>
                                                        <span className={`text-xs font-medium ${isLinked ? 'text-white' : 'text-gray-400'}`}>{course.nome}</span>
                                                    </div>
                                                    {isLinked && <span className="material-symbols-rounded text-[#0081FF] text-sm">check_circle</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Assessment Section */}
                            {vocalAssessment && (
                                <div className="bg-[#1A202C] p-4 rounded-xl border border-white/5 space-y-3 mb-4">
                                    <h5 className="text-white font-bold text-sm flex items-center gap-2">
                                        <span className="material-symbols-rounded text-[#0081FF]">psychology</span>
                                        Análise Vocal
                                    </h5>
                                    <div className="space-y-2">
                                        {vocalAssessment.color && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Timbre (Ressonância):</span>
                                                <span className="text-white font-medium capitalize">
                                                    {vocalAssessment.color === 'solar' && '☀️ Solar (Brilhante)'}
                                                    {vocalAssessment.color === 'crepuscular' && '🌅 Crepuscular (Misto)'}
                                                    {vocalAssessment.color === 'noturno' && '🌑 Noturno (Escuro)'}
                                                    {!['solar', 'crepuscular', 'noturno'].includes(vocalAssessment.color) && vocalAssessment.color}
                                                </span>
                                            </div>
                                        )}
                                        {vocalAssessment.texture && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Textura:</span>
                                                <span className="text-white font-medium capitalize">
                                                    {vocalAssessment.texture === 'denso' && 'Creme Denso/Amanteigado'}
                                                    {vocalAssessment.texture === 'leve' && 'Leve e Luminoso'}
                                                    {!['denso', 'leve'].includes(vocalAssessment.texture) && vocalAssessment.texture}
                                                </span>
                                            </div>
                                        )}
                                        {vocalAssessment.register && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Conforto/Registro:</span>
                                                <span className="text-white font-medium capitalize">
                                                    {vocalAssessment.register === 'peito' && 'Voz de Peito'}
                                                    {vocalAssessment.register === 'kbca' && 'Voz de Cabeça'}
                                                    {!['peito', 'kbca'].includes(vocalAssessment.register) && `Voz de ${vocalAssessment.register}`}
                                                </span>
                                            </div>
                                        )}
                                        {vocalAssessment.artists && (
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="text-gray-400">Artistas Similares:</span>
                                                <span className="text-white font-medium italic">"{vocalAssessment.artists}"</span>
                                            </div>
                                        )}
                                        {(vocalAssessment.range_goal_low || vocalAssessment.range_goal_high) && (
                                            <div className="flex justify-between text-xs border-t border-white/5 pt-2 mt-1">
                                                <span className="text-gray-400">Extensão Atual:</span>
                                                <span className="text-[#0081FF] font-black">{vocalAssessment.range_goal_low || '?'} - {vocalAssessment.range_goal_high || '?'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Status do Contrato</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${selectedStudent?.contractAgreed ? 'bg-[#0081FF]' : 'bg-[#FF00BC]'}`}></div>
                                    <span className={`text-xs font-bold ${selectedStudent?.contractAgreed ? 'text-[#0081FF]' : 'text-[#FF00BC]'}`}>
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

                            {/* Comprovantes de Pagamento */}
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                                        <span className="material-symbols-rounded text-sm text-[#6F4CE7]">receipt_long</span>
                                        Comprovantes de Pagamento
                                    </p>
                                </div>
                                {(() => {
                                    const studentReceipts = receipts.filter(r => r.userId === selectedStudent.id);
                                    if (studentReceipts.length === 0) {
                                        return (
                                            <p className="text-xs text-gray-600 italic text-center py-2">Nenhum comprovante enviado.</p>
                                        );
                                    }
                                    return (
                                        <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
                                            {studentReceipts.map((r: any) => (
                                                <div key={r.id} className="flex items-center justify-between p-2.5 bg-black/20 rounded-lg border border-white/5">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.status === 'pending' ? 'bg-[#FF00BC]/20 text-[#FF00BC]' :
                                                            r.status === 'approved' ? 'bg-[#0081FF]/20 text-[#0081FF]' :
                                                                'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                            <span className="material-symbols-rounded text-sm">
                                                                {r.status === 'pending' ? 'pending' : r.status === 'approved' ? 'check_circle' : 'cancel'}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-white">R$ {Number(r.amount).toFixed(2)}</p>
                                                            <p className="text-[10px] text-gray-500">
                                                                {new Date(r.createdAt).toLocaleDateString('pt-BR')} •
                                                                <span className={`font-bold ml-1 ${r.status === 'pending' ? 'text-[#FF00BC]' :
                                                                    r.status === 'approved' ? 'text-[#0081FF]' : 'text-gray-400'
                                                                    }`}>
                                                                    {r.status === 'pending' ? 'Pendente' : r.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            if (!r.receiptUrl) return;
                                                            if (r.receiptUrl.startsWith('http')) {
                                                                window.open(r.receiptUrl, '_blank');
                                                            } else {
                                                                const { data, error } = await supabase.storage
                                                                    .from('receipts')
                                                                    .createSignedUrl(r.receiptUrl, 3600);
                                                                if (data?.signedUrl) {
                                                                    window.open(data.signedUrl, '_blank');
                                                                } else {
                                                                    alert('Erro ao abrir comprovante: ' + (error?.message || 'Tente novamente.'));
                                                                }
                                                            }
                                                        }}
                                                        className="w-9 h-9 rounded-lg bg-[#6F4CE7]/10 text-[#6F4CE7] flex items-center justify-center border border-[#6F4CE7]/20 hover:bg-[#6F4CE7]/20 transition-all shrink-0"
                                                        title="Ver Comprovante"
                                                    >
                                                        <span className="material-symbols-rounded text-lg">visibility</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
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
                                    className="w-12 h-12 rounded-xl bg-[#FF00BC]/10 text-[#FF00BC] flex items-center justify-center hover:bg-[#FF00BC]/20 transition-all border border-[#FF00BC]/20"
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
                        <div className="absolute inset-0 z-[210] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-200">
                            <div className="w-full max-w-[280px] bg-[#1A202C] rounded-[32px] border border-white/10 p-8 shadow-2xl flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#FF00BC]/20 text-[#FF00BC] flex items-center justify-center mb-6">
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
                                        className="h-12 rounded-2xl bg-[#FF00BC] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF00BC]/20 active:scale-95 transition-all disabled:opacity-50"
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
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
                <div className="fixed top-20 left-4 right-4 z-[300] animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-[#1A202C] border-2 border-[#FF00BC] rounded-2xl p-4 shadow-2xl shadow-[#FF00BC]/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] shrink-0 animate-pulse">
                            <span className="material-symbols-rounded text-2xl">receipt_long</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">💰 Novo Comprovante!</h4>
                            <p className="text-gray-400 text-xs"><span className="text-[#FF00BC] font-bold">{newReceiptNotice.userName}</span> enviou R$ {Number(newReceiptNotice.amount).toFixed(2)}</p>
                        </div>
                        <button
                            onClick={() => {
                                const student = students.find(s => s.id === newReceiptNotice?.userId);
                                setNewReceiptNotice(null);
                                if (student) {
                                    openStudentDetails(student);
                                } else {
                                    setActiveTab('reports');
                                }
                            }}
                            className="bg-[#FF00BC] text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[#FF00BC]/20"
                        >
                            Ver Agora
                        </button>
                    </div>
                </div>
            )}

            {/* Modal: Broadcast de Notificações */}
            {isBroadcastModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsBroadcastModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#1A202C] rounded-t-[32px] sm:rounded-[32px] p-8 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                                <span className="material-symbols-rounded text-3xl">campaign</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Comunicado Geral</h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Envia para todos os alunos ativos</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block ml-1">Título do Aviso</label>
                                <input
                                    type="text"
                                    value={broadcastTitle}
                                    onChange={(e) => setBroadcastTitle(e.target.value)}
                                    placeholder="Ex: Aula Coletiva nesta Sexta! 🎼"
                                    className="w-full h-14 bg-[#101622] border border-white/5 rounded-2xl px-4 text-sm text-white focus:outline-none focus:border-[#0081FF] transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block ml-1">Conteúdo da Mensagem</label>
                                <textarea
                                    value={broadcastBody}
                                    onChange={(e) => setBroadcastBody(e.target.value)}
                                    placeholder="Escreva aqui a mensagem principal que os alunos receberão como notificação push..."
                                    className="w-full h-32 bg-[#101622] border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#0081FF] transition-all resize-none"
                                />
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
                                <span className="material-symbols-rounded text-[#0081FF]">info</span>
                                <p className="text-[10px] text-[#0081FF] font-bold leading-tight">
                                    ESTA MENSAGEM SERÁ ENVIADA PARA TODOS OS ALUNOS ATIVOS QUE POSSUEM NOTIFICAÇÕES HABILITADAS.
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setIsBroadcastModalOpen(false)} className="flex-1 py-4 font-black text-[10px] uppercase text-gray-500 tracking-widest">Cancelar</button>
                                <button
                                    disabled={loadingAction || !broadcastTitle.trim() || !broadcastBody.trim()}
                                    onClick={handleBroadcastNotifications}
                                    className="flex-[2] h-14 bg-[#0081FF] rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-[#0081FF]/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30"
                                >
                                    {loadingAction && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                    DISPARAR AGORA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Routine Manager Modal */}
            {isRoutineManagerOpen && selectedStudent && (
                <div className="fixed inset-0 z-[210] overflow-hidden flex flex-col bg-[#101622] animate-in slide-in-from-bottom duration-300">
                    <RoutineManager
                        student={selectedStudent}
                        onClose={() => setIsRoutineManagerOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};
