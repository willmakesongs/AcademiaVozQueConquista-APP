import React, { useState, useEffect } from 'react';
import { Screen, Task } from '../types';
import { INITIAL_TASKS } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { MediaRecorder } from '../components/features/study/MediaRecorder';

interface Props {
  onNavigate: (screen: Screen) => void;
}

// Jan 2, 2026 is Friday.
// Helper to generate current week starting from Monday
const getWeekDays = () => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekDays = [];
  const today = new Date();

  // Find current Monday
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dayName = days[date.getDay()];
    const dateStr = date.getDate().toString().padStart(2, '0');
    weekDays.push({
      day: dayName === 'Seg' ? 'Seg' : dayName, // Just for consistency
      date: dateStr,
      fullDate: date.toISOString().split('T')[0] // Useful for storage if needed
    });
  }
  return weekDays;
};

const CATEGORIES = ['Aquecimento', 'Técnica', 'Repertório', 'Saúde Vocal'];

export const RoutineScreen: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const weekDaysSnapshot = React.useMemo(() => getWeekDays(), []);
  const todayStr = new Date().getDate().toString().padStart(2, '0');

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO Title
  useEffect(() => {
    document.title = "Minha Rotina | Academia VQC";
  }, []);

  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null); // State para modal de exclusão
  const [recordingTask, setRecordingTask] = useState<Task | null>(null);
  const [recordingMode, setRecordingMode] = useState<'audio' | 'video'>('audio');

  // Form States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Técnica');
  const [newTaskTime, setNewTaskTime] = useState('10:00');
  const [newTaskDuration, setNewTaskDuration] = useState('15');
  const [newTaskDate, setNewTaskDate] = useState(todayStr);

  useEffect(() => {
    document.title = "Minha Rotina - Academia VQC";
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id, selectedDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', selectedDate)
        .order('time', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks Supabase:', err);
      // Fallback para localStorage se der erro (mantém compatibilidade local)
      const savedTasks = localStorage.getItem('vocalizes_routine_tasks');
      if (savedTasks) {
        const local = JSON.parse(savedTasks);
        setTasks(local.filter((t: any) => t.date === selectedDate));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fecha o menu se clicar fora (simples)
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', closeMenu);
    }
    return () => document.removeEventListener('click', closeMenu);
  }, [openMenuId]);

  // Filter tasks for the selected date
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

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskCategory(task.category);
    setNewTaskTime(task.time);
    setNewTaskDuration(task.duration.replace(' min', ''));
    setNewTaskDate(task.date);
    setIsAddModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveTask = async () => {
    if (!newTaskTitle.trim()) return;

    const taskData: any = {
      user_id: user?.id,
      title: newTaskTitle,
      category: newTaskCategory,
      time: newTaskTime,
      duration: `${newTaskDuration} min`,
      date: newTaskDate,
      status: 'pending'
    };

    try {
      if (editingTask) {
        const { error } = await supabase
          .from('routines')
          .update(taskData)
          .eq('id', editingTask.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('routines')
          .insert([taskData]);
        if (error) throw error;
      }
      fetchTasks();
    } catch (err) {
      console.error('Error saving task to Supabase:', err);
    }

    resetForm();
    setIsAddModalOpen(false);
  };

  // Solicita exclusão (abre modal)
  const handleDeleteRequest = (task: Task) => {
    setOpenMenuId(null);
    setTaskToDelete(task);
  };

  // Confirma exclusão (executa ação)
  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        const { error } = await supabase
          .from('routines')
          .delete()
          .eq('id', taskToDelete.id);
        if (error) throw error;
        fetchTasks();
      } catch (err) {
        console.error('Error deleting task:', err);
      }
      setTaskToDelete(null);
    }
  };

  const toggleTaskStatus = async (taskId: string | number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'locked') return;

    const newStatus = task.status === 'pending' ? 'completed' : 'pending';

    try {
      // Atualização otimista
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      const { error } = await supabase
        .from('routines')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error toggling status:', err);
      // Reverte se der erro
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t));
    }
  };

  const toggleMenu = (e: React.MouseEvent, taskId: string | number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  return (
    <div className="min-h-screen bg-[#101622] pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[80%] h-[40%] bg-[#0081FF] blur-[120px] opacity-10 pointer-events-none"></div>

      {/* Header */}
      <header className="pt-8 pb-4 px-6 relative z-10">
        <h1 className="text-2xl font-bold text-white mb-1">Minha Rotina</h1>
        <p className="text-sm text-gray-400">Organize seus estudos diários</p>
      </header>

      {/* Calendar Strip */}
      <div className="pl-6 mb-8 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 min-w-max pr-6">
          {weekDaysSnapshot.map((item) => (
            <button
              key={item.date}
              onClick={() => setSelectedDate(item.date)}
              className={`flex flex-col items-center justify-center w-14 h-20 rounded-2xl border transition-all ${selectedDate === item.date
                ? 'bg-[#FF00BC] border-[#FF00BC] text-white shadow-[0_4px_20px_rgba(255,0,188,0.4)] transform scale-105'
                : 'bg-[#1A202C] border-white/5 text-gray-400 hover:bg-white/5'
                }`}
            >
              <span className="text-xs font-medium mb-1">{item.day}</span>
              <span className="text-lg font-bold">{item.date}</span>
              {/* Dot indicator if tasks exist for this day */}
              {tasks.some(t => t.date === item.date) && selectedDate !== item.date && (
                <span className="w-1 h-1 rounded-full bg-[#0081FF] mt-1"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Progress Card */}
        <div className="bg-gradient-to-br from-[#1A202C] to-[#161b26] p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#6F4CE7] blur-[50px] opacity-20"></div>

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-white">Metas de Hoje</h3>
              <p className="text-xs text-gray-400">
                {filteredTasks.length === 0
                  ? "Nenhuma tarefa agendada"
                  : `Você completou ${completedCount} de ${filteredTasks.length} tarefas`
                }
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
              <span className="material-symbols-rounded">emoji_events</span>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between text-xs font-medium mb-2">
              <span className="text-white">Progresso</span>
              <span className="text-[#6F4CE7]">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 w-full bg-[#101622] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0081FF] to-[#6F4CE7] rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="pb-20">
          <h3 className="text-lg font-bold text-white mb-4">Cronograma</h3>

          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <span className="material-symbols-rounded text-4xl mb-2">calendar_today</span>
              <p className="text-sm">Dia livre de estudos.</p>
            </div>
          ) : (
            <div className="space-y-0 relative">
              {/* Vertical Line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#6F4CE7] via-[#FF00BC] to-transparent opacity-20"></div>

              {filteredTasks.map((task, index) => {
                const isLast = index === filteredTasks.length - 1;
                const isGuidance = task.is_guidance;

                return (
                  <div key={task.id} className={`relative pl-12 ${!isLast ? 'mb-8' : ''}`}>
                    {/* Status Indicator Dot */}
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-[#101622] flex items-center justify-center z-10 transition-all ${task.status === 'completed' ? 'bg-[#0081FF] text-white' :
                        task.status === 'pending' ? (isGuidance ? 'bg-[#FF00BC] text-white' : 'bg-[#6F4CE7] text-white') :
                          'bg-[#1A202C] text-gray-600 border-white/5'
                        }`}
                    >
                      <span className="material-symbols-rounded text-lg">
                        {task.status === 'completed' ? 'check' :
                          task.status === 'pending' ? 'play_arrow' : 'lock'}
                      </span>
                    </button>

                    {/* Card */}
                    <div
                      className={`p-5 rounded-2xl border transition-all relative ${isGuidance
                        ? 'bg-[#FF00BC]/5 border-[#FF00BC]/20 shadow-[0_0_25px_rgba(255,0,188,0.1)]'
                        : task.status === 'pending'
                          ? 'bg-[#1A202C] border-white/10 shadow-lg'
                          : 'bg-[#1A202C]/40 border-white/5 opacity-80'
                        }`}
                    >
                      {/* MORE OPTIONS BUTTON */}
                      <div className="absolute top-3 right-3 z-20">
                        <button
                          onClick={(e) => toggleMenu(e, task.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/5"
                        >
                          <span className="material-symbols-rounded text-xl">more_vert</span>
                        </button>

                        {openMenuId === task.id && (
                          <div className="absolute right-0 top-8 w-32 bg-[#1A202C] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenEditModal(task); }}
                              className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2"
                            >
                              <span className="material-symbols-rounded text-sm">edit</span> Editar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteRequest(task); }}
                              className="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-400/5 flex items-center gap-2"
                            >
                              <span className="material-symbols-rounded text-sm">delete</span> Excluir
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-start mb-3 pr-8">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${isGuidance ? 'bg-[#FF00BC] text-white' : 'bg-[#0081FF]/10 text-[#0081FF]'}`}>
                            {task.time}
                          </span>
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{task.category}</span>
                        </div>
                      </div>

                      <h4 className={`text-base font-bold text-white mb-2 pr-6 ${isGuidance ? 'text-[#FF00BC]' : ''}`}>{task.title}</h4>

                      {/* Rich Description */}
                      {task.description && (
                        <div className="mb-4 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap opacity-90 border-l-2 border-white/5 pl-3 py-1">
                          {task.description}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 mt-6">
                        {/* Example Media (Teacher side) */}
                        {task.video_url && (
                          <button
                            className="flex items-center gap-2 px-3 py-2 bg-[#0081FF]/10 rounded-xl border border-[#0081FF]/20 text-[#0081FF]"
                            onClick={() => window.open(task.video_url, '_blank')}
                          >
                            <span className="material-symbols-rounded text-lg">videocam</span>
                            <span className="text-[10px] font-black uppercase">Exemplo</span>
                          </button>
                        )}
                        {task.audio_url && (
                          <button
                            className="flex items-center gap-2 px-3 py-2 bg-[#6F4CE7]/10 rounded-xl border border-[#6F4CE7]/20 text-[#6F4CE7]"
                            onClick={() => window.open(task.audio_url, '_blank')}
                          >
                            <span className="material-symbols-rounded text-lg">mic</span>
                            <span className="text-[10px] font-black uppercase">Exemplo</span>
                          </button>
                        )}

                        {/* Student Registration */}
                        {task.registration_url ? (
                          <button
                            className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-xl border border-green-500/20 text-green-500"
                            onClick={() => window.open(task.registration_url, '_blank')}
                          >
                            <span className="material-symbols-rounded text-lg">check_circle</span>
                            <span className="text-[10px] font-black uppercase">Meu Estudo</span>
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setRecordingTask(task); setRecordingMode('audio'); }}
                              className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                            >
                              <span className="material-symbols-rounded text-lg">mic</span>
                              <span className="text-[10px] font-black uppercase">Gravar Áudio</span>
                            </button>
                            <button
                              onClick={() => { setRecordingTask(task); setRecordingMode('video'); }}
                              className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                            >
                              <span className="material-symbols-rounded text-lg">videocam</span>
                              <span className="text-[10px] font-black uppercase">Gravar Vídeo</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <span className="material-symbols-rounded text-sm">schedule</span>
                        Foco: {task.duration}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Recorder */}
      {recordingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <MediaRecorder
            mode={recordingMode}
            onCancel={() => setRecordingTask(null)}
            onComplete={async (url) => {
              try {
                const { error } = await supabase
                  .from('routines')
                  .update({
                    registration_url: url,
                    registration_date: new Date().toISOString(),
                    status: 'completed'
                  })
                  .eq('id', recordingTask.id);

                if (error) throw error;
                setRecordingTask(null);
                fetchTasks();
              } catch (err) {
                console.error('Error saving registration:', err);
                alert('Erro ao salvar registro de estudo.');
              }
            }}
          />
        </div>
      )}

      {/* FAB for Add */}
      <button
        onClick={handleOpenAddModal}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#6F4CE7] text-white shadow-lg shadow-vibe-900/40 flex items-center justify-center hover:scale-110 transition-transform z-20"
      >
        <span className="material-symbols-rounded text-2xl">add</span>
      </button>

      {/* MODAL: Add/Edit Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1A202C] rounded-2xl border border-white/10 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#151A23] rounded-t-2xl">
              <h3 className="font-bold text-white">{editingTask ? 'Editar Tarefa' : 'Programar Estudo'}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-rounded text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase ml-1">O que vamos treinar?</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Escalas de Agilidade"
                  className="w-full h-12 bg-[#101622] rounded-xl border border-white/10 px-4 text-white text-sm focus:outline-none focus:border-[#6F4CE7]"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase ml-1">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewTaskCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newTaskCategory === cat
                        ? 'bg-[#6F4CE7] border-[#6F4CE7] text-white'
                        : 'bg-[#101622] border-white/10 text-gray-400 hover:text-white'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase ml-1">Dia</label>
                  <select
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full h-10 bg-[#101622] rounded-xl border border-white/10 px-3 text-white text-sm focus:outline-none focus:border-[#6F4CE7]"
                  >
                    {weekDaysSnapshot.map(d => (
                      <option key={d.date} value={d.date}>{d.day} - dia {d.date}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase ml-1">Horário</label>
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full h-10 bg-[#101622] rounded-xl border border-white/10 px-3 text-white text-sm focus:outline-none focus:border-[#6F4CE7]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase ml-1">Duração (minutos)</label>
                <div className="flex items-center gap-4 bg-[#101622] rounded-xl border border-white/10 px-4 h-12">
                  <input
                    type="range"
                    min="5" max="60" step="5"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    className="flex-1 accent-[#6F4CE7]"
                  />
                  <span className="text-white text-sm font-bold w-12 text-right">{newTaskDuration}m</span>
                </div>
              </div>

              <button
                onClick={handleSaveTask}
                disabled={!newTaskTitle.trim()}
                className="w-full h-12 bg-[#6F4CE7] hover:bg-[#5b3dc4] text-white font-bold rounded-xl shadow-lg shadow-vibe-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-rounded">{editingTask ? 'save' : 'add_task'}</span>
                {editingTask ? 'Salvar Alterações' : 'Adicionar à Rotina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1A202C] rounded-2xl border border-white/10 shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-[#FF00BC]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FF00BC]/20">
              <span className="material-symbols-rounded text-3xl text-[#FF00BC]">delete</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Excluir Tarefa?</h3>
            <p className="text-sm text-gray-400 mb-6">
              Você tem certeza que deseja remover <strong>"{taskToDelete.title}"</strong> da sua rotina? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors border border-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-[#FF00BC] text-white font-bold hover:bg-[#FF00BC] transition-colors shadow-lg shadow-red-900/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
