
import React, { useState, useEffect } from 'react';
import { Task, StudentSummary } from '../types';
import { supabase } from '../lib/supabaseClient';

interface Props {
    student: StudentSummary;
    onClose: () => void;
}

const WEEK_DAYS_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const CATEGORIES = ['Aquecimento', 'Técnica', 'Repertório', 'Saúde Vocal', 'Teoria', 'Desafio'];

export const RoutineManager: React.FC<Props> = ({ student, onClose }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'editor'
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

    // Lista de datas simplificada (hoje e próximos 6 dias)
    const [dates, setDates] = useState<{ label: string, date: string, active: boolean }[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        // Gerar datas para os próximos 7 dias
        const today = new Date();
        const newDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            const dayNum = String(d.getDate()).padStart(2, '0');
            newDates.push({
                label: WEEK_DAYS_LABELS[(d.getDay() === 0 ? 6 : d.getDay() - 1)],
                date: dayNum,
                active: i === 0
            });
        }
        setDates(newDates);
        setSelectedDate(newDates[0].date);
    }, []);

    useEffect(() => {
        if (student.id) {
            fetchTasks();
        }
    }, [student.id, selectedDate]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('routines')
                .select('*')
                .eq('user_id', student.id)
                .eq('date', selectedDate)
                .order('time', { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = () => {
        setEditingTask({
            user_id: student.id,
            title: '',
            category: 'Técnica',
            time: '10:00',
            duration: '15 min',
            date: selectedDate,
            status: 'pending',
            description: '',
            is_guidance: false
        } as any);
        setActiveTab('editor');
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setActiveTab('editor');
    };

    const handleSaveTask = async () => {
        if (!editingTask || !editingTask.title) return;
        try {
            setLoading(true);
            if (editingTask.id) {
                const { error } = await supabase
                    .from('routines')
                    .update(editingTask)
                    .eq('id', editingTask.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('routines')
                    .insert([editingTask]);
                if (error) throw error;
            }
            setActiveTab('list');
            setEditingTask(null);
            fetchTasks();
        } catch (err) {
            console.error('Error saving task:', err);
            alert('Erro ao salvar tarefa');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (id: string | number) => {
        if (!confirm('Excluir esta tarefa?')) return;
        try {
            const { error } = await supabase
                .from('routines')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#101622] text-white">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#151A23]">
                <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">Cronograma de Treino</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{student.name}</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-rounded">close</span>
                </button>
            </div>

            {activeTab === 'list' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Calendar Strip */}
                    <div className="p-6 pb-2 overflow-x-auto hide-scrollbar flex gap-3">
                        {dates.map((d) => (
                            <button
                                key={d.date}
                                onClick={() => setSelectedDate(d.date)}
                                className={`flex flex-col items-center justify-center w-14 h-20 rounded-2xl border transition-all shrink-0 ${selectedDate === d.date
                                        ? 'bg-[#0081FF] border-[#0081FF] shadow-lg shadow-[#0081FF]/20'
                                        : 'bg-[#1A202C] border-white/5 text-gray-400'
                                    }`}
                            >
                                <span className="text-[10px] font-bold mb-1">{d.label}</span>
                                <span className="text-lg font-black">{d.date}</span>
                            </button>
                        ))}
                    </div>

                    {/* List Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
                        {loading ? (
                            <div className="flex justify-center p-10"><div className="w-6 h-6 border-2 border-[#0081FF] border-t-transparent rounded-full animate-spin"></div></div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <span className="material-symbols-rounded text-5xl mb-4">event_available</span>
                                <p className="text-sm font-bold">Nenhuma tarefa programada para este dia.</p>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className={`p-4 rounded-2xl border transition-all ${task.is_guidance ? 'bg-[#FF00BC]/5 border-[#FF00BC]/20' : 'bg-[#1A202C] border-white/5'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-[#0081FF] uppercase">{task.time}</span>
                                            <span className="text-[10px] font-bold text-gray-500">•</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{task.category}</span>
                                            {task.is_guidance && <span className="text-[8px] bg-[#FF00BC] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ml-1">Orientação</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditTask(task)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"><span className="material-symbols-rounded text-lg">edit</span></button>
                                            <button onClick={() => handleDeleteTask(task.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500"><span className="material-symbols-rounded text-lg">delete</span></button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white mb-2">{task.title}</h4>
                                    <div className="flex gap-4">
                                        {task.video_url && <span className="material-symbols-rounded text-xs text-[#0081FF]">videocam</span>}
                                        {task.audio_url && <span className="material-symbols-rounded text-xs text-[#6F4CE7]">mic</span>}
                                        {task.description && <span className="material-symbols-rounded text-xs text-green-500">description</span>}
                                    </div>
                                </div>
                            ))
                        )}

                        <button
                            onClick={handleAddTask}
                            className="w-full py-5 rounded-3xl border border-dashed border-white/10 text-gray-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
                        >
                            <span className="material-symbols-rounded">add_circle</span>
                            Nova Tarefa
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                    {/* Editor Content */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Horário</label>
                                <input
                                    type="time"
                                    value={editingTask?.time}
                                    onChange={(e) => setEditingTask({ ...editingTask, time: e.target.value })}
                                    className="w-full h-12 bg-[#1A202C] border border-white/10 rounded-xl px-4 text-sm text-white focus:border-[#0081FF] outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Duração (Ex: 15 min)</label>
                                <input
                                    type="text"
                                    value={editingTask?.duration}
                                    onChange={(e) => setEditingTask({ ...editingTask, duration: e.target.value })}
                                    className="w-full h-12 bg-[#1A202C] border border-white/10 rounded-xl px-4 text-sm text-white focus:border-[#0081FF] outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Categoria</label>
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setEditingTask({ ...editingTask, category: cat })}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shrink-0 border ${editingTask?.category === cat ? 'bg-[#0081FF] border-[#0081FF] text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Título da Tarefa</label>
                            <input
                                type="text"
                                placeholder="Ex: Treino de Alcance"
                                value={editingTask?.title}
                                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                className="w-full h-12 bg-[#1A202C] border border-white/10 rounded-xl px-4 text-sm text-white font-bold focus:border-[#0081FF] outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">Instruções Detalhadas (Markdown)</label>
                                <span className="text-[8px] text-gray-600">Suporta tabelas e listas</span>
                            </div>
                            <textarea
                                placeholder="Descreva o exercício, use # para títulos, * para listas e | para tabelas..."
                                value={editingTask?.description || ''}
                                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                className="w-full h-40 bg-[#1A202C] border border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:border-[#0081FF] outline-none leading-relaxed"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">URL do Vídeo (Exemplo)</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={editingTask?.video_url || ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, video_url: e.target.value })}
                                    className="w-full h-12 bg-[#1A202C] border border-white/10 rounded-xl px-4 text-sm text-white focus:border-[#0081FF] outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">URL do Áudio (Exemplo)</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={editingTask?.audio_url || ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, audio_url: e.target.value })}
                                    className="w-full h-12 bg-[#1A202C] border border-white/10 rounded-xl px-4 text-sm text-white focus:border-[#0081FF] outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-white">Marcar como Orientação</p>
                                <p className="text-[10px] text-gray-500">Exibe como uma caixa de destaque rosa</p>
                            </div>
                            <button
                                onClick={() => setEditingTask({ ...editingTask, is_guidance: !editingTask?.is_guidance })}
                                className={`w-12 h-6 rounded-full transition-all relative ${editingTask?.is_guidance ? 'bg-[#FF00BC]' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingTask?.is_guidance ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setActiveTab('list')} className="flex-1 py-4 text-gray-500 font-black text-xs uppercase tracking-widest">Cancelar</button>
                        <button onClick={handleSaveTask} className="flex-2 bg-[#0081FF] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#0081FF]/20 active:scale-95 transition-all">Salvar Cronograma</button>
                    </div>
                </div>
            )}
        </div>
    );
};
