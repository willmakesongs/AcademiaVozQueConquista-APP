
import React, { useState, useEffect } from 'react';
import { Task, Screen } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    onNavigate: (screen: Screen) => void;
    courseContext?: string; // Para filtros futuros por curso
}

const WEEK_DAYS = [
    { day: 'Seg', date: '29', active: false },
    { day: 'Ter', date: '30', active: false },
    { day: 'Qua', date: '31', active: false },
    { day: 'Qui', date: '01', active: false },
    { day: 'Sex', date: '02', active: true },
    { day: 'Sáb', date: '03', active: false },
    { day: 'Dom', date: '04', active: false },
];

const CATEGORIES = ['Aquecimento', 'Técnica', 'Repertório', 'Saúde Vocal'];

export const RoutineView: React.FC<Props> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState('02');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | number | null>(null);

    // Form States
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('Técnica');
    const [newTaskTime, setNewTaskTime] = useState('10:00');
    const [newTaskDuration, setNewTaskDuration] = useState('15');
    const [newTaskDate, setNewTaskDate] = useState('02');

    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('routines')
                .select('*')
                .eq('user_id', user?.id)
                .order('time', { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks
        .filter(t => t.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
    const progressPercentage = filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0;

    const resetForm = () => {
        setNewTaskTitle('');
        setNewTaskCategory('Técnica');
        setNewTaskTime('10:00');
        setNewTaskDuration('15');
        setNewTaskDate(selectedDate);
        setEditingTask(null);
    };

    const handleSaveTask = async () => {
        if (!newTaskTitle.trim() || !user) return;
        try {
            if (editingTask) {
                const { error } = await supabase.from('routines').update({
                    title: newTaskTitle,
                    category: newTaskCategory,
                    time: newTaskTime,
                    duration: `${newTaskDuration} min`,
                    date: newTaskDate
                }).eq('id', editingTask.id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('routines').insert([{
                    user_id: user.id,
                    title: newTaskTitle,
                    category: newTaskCategory,
                    time: newTaskTime,
                    duration: `${newTaskDuration} min`,
                    date: newTaskDate,
                    status: 'pending'
                }]).select();
                if (error) throw error;
                if (data) setTasks(prev => [...prev, data[0]]);
            }
            fetchTasks();
            setIsAddModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Error saving task:', err);
        }
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;
        try {
            const { error } = await supabase.from('routines').delete().eq('id', taskToDelete);
            if (error) throw error;
            setTasks(prev => prev.filter(t => String(t.id) !== String(taskToDelete)));
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const toggleTaskStatus = async (taskId: string | number) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === 'locked') return;
        const newStatus = task.status === 'pending' ? 'completed' : 'pending';
        try {
            const { error } = await supabase.from('routines').update({ status: newStatus }).eq('id', taskId);
            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error('Error toggling status:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Calendar Strip */}
            <div className="overflow-x-auto hide-scrollbar -mx-6 px-6">
                <div className="flex gap-3 min-w-max pb-2">
                    {WEEK_DAYS.map((item) => (
                        <button
                            key={item.date}
                            onClick={() => setSelectedDate(item.date)}
                            className={`flex flex-col items-center justify-center w-14 h-20 rounded-2xl border transition-all ${selectedDate === item.date
                                ? 'bg-[#FF00BC] border-[#FF00BC] text-white shadow-[0_4px_20px_rgba(255,0,188,0.4)]'
                                : 'bg-[#1A202C] border-white/5 text-gray-400'
                                }`}
                        >
                            <span className="text-xs font-medium mb-1">{item.day}</span>
                            <span className="text-lg font-bold">{item.date}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-[#1A202C] to-[#161b26] p-5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">Metas de Hoje</h3>
                        <p className="text-xs text-gray-400">
                            {filteredTasks.length === 0 ? "Nenhuma tarefa" : `${completedCount} de ${filteredTasks.length} concluídas`}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span className="material-symbols-rounded">emoji_events</span>
                    </div>
                </div>
                <div className="h-2 w-full bg-[#101622] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0081FF] to-[#6F4CE7] transition-all" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30">
                        <span className="material-symbols-rounded text-4xl mb-2">calendar_today</span>
                        <p className="text-sm">Dia livre de estudos.</p>
                    </div>
                ) : (
                    <div className="space-y-4 relative">
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/5"></div>
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="relative pl-12">
                                <button
                                    onClick={() => toggleTaskStatus(task.id)}
                                    className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-[#101622] flex items-center justify-center z-10 ${task.status === 'completed' ? 'bg-[#0081FF]' : 'bg-[#FF00BC]'}`}
                                >
                                    <span className="material-symbols-rounded text-lg text-white">
                                        {task.status === 'completed' ? 'check' : 'play_arrow'}
                                    </span>
                                </button>
                                <div
                                    onClick={() => onNavigate(Screen.PLAYER)}
                                    className="p-4 rounded-xl bg-[#1A202C] border border-white/5 cursor-pointer"
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-bold text-[#FF00BC] uppercase">{task.time}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">{task.category}</span>
                                    </div>
                                    <h4 className="font-bold text-white text-sm">{task.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-gray-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10"
            >
                <span className="material-symbols-rounded">add</span>
                Adicionar Tarefa
            </button>

            {/* Modal Simplificado para Add vinculada à Tab */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-[#1A202C] rounded-2xl border border-white/10 p-6 space-y-4">
                        <h3 className="font-bold text-white">Nova Tarefa</h3>
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Ex: Treino de Agudos"
                            className="w-full h-12 bg-[#101622] rounded-xl px-4 text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="bg-[#101622] p-2 rounded-lg text-white" />
                            <input type="number" value={newTaskDuration} onChange={e => setNewTaskDuration(e.target.value)} placeholder="Min" className="bg-[#101622] p-2 rounded-lg text-white" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-gray-400">Cancelar</button>
                            <button onClick={handleSaveTask} className="flex-1 py-3 bg-[#6F4CE7] text-white rounded-xl font-bold">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
