import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ScheduleItem {
    id: string;
    created_at: string;
    title: string;
    body: string;
    type: 'payment_reminder' | 'general';
    recurrence: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
    next_run_at: string;
    is_active: boolean;
}

interface ScheduleManagerProps {
    userId: string;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ userId }) => {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState<'payment_reminder' | 'general'>('general');
    const [recurrence, setRecurrence] = useState<'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly'>('once');
    const [nextRunDate, setNextRunDate] = useState('');
    const [nextRunTime, setNextRunTime] = useState('');

    const fetchSchedules = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('scheduled_notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('next_run_at', { ascending: true });

        if (!error && data) {
            setSchedules(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSchedules();
    }, [userId]);

    const handleCreate = async () => {
        if (!title || !body || !nextRunDate || !nextRunTime) return;

        const nextRunAt = new Date(`${nextRunDate}T${nextRunTime}:00`).toISOString();

        const { error } = await supabase
            .from('scheduled_notifications')
            .insert([{
                user_id: userId,
                title,
                body,
                type,
                recurrence,
                next_run_at: nextRunAt,
                is_active: true
            }]);

        if (error) {
            alert('Erro ao criar agendamento: ' + error.message);
        } else {
            setIsCreating(false);
            setTitle('');
            setBody('');
            fetchSchedules();
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

        const { error } = await supabase
            .from('scheduled_notifications')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            alert('Erro ao cancelar: ' + error.message);
        } else {
            fetchSchedules();
        }
    };

    if (loading) return <div className="text-gray-400 text-sm py-4">Carregando agendamentos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Agendamentos Ativos</h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-[#0081FF] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#0081FF]/80 transition-colors"
                >
                    {isCreating ? 'Cancelar' : 'Novo Agendamento'}
                </button>
            </div>

            {isCreating && (
                <div className="bg-[#1A202C] border border-white/10 p-4 rounded-2xl space-y-4 animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tipo</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full bg-[#101622] text-white border border-white/10 rounded-lg p-2 text-xs"
                            >
                                <option value="general">Aviso Geral</option>
                                <option value="payment_reminder">Lembrete de Pagamento</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Recorrência</label>
                            <select
                                value={recurrence}
                                onChange={(e) => setRecurrence(e.target.value as any)}
                                className="w-full bg-[#101622] text-white border border-white/10 rounded-lg p-2 text-xs"
                            >
                                <option value="once">Uma vez</option>
                                <option value="daily">Diário</option>
                                <option value="weekly">Semanal</option>
                                <option value="biweekly">Quinzenal</option>
                                <option value="monthly">Mensal</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#101622] text-white border border-white/10 rounded-lg p-2 text-sm"
                            placeholder="Título da notificação"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Mensagem</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full bg-[#101622] text-white border border-white/10 rounded-lg p-2 text-sm h-20"
                            placeholder="Conteúdo da mensagem..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Data Início</label>
                            <input
                                type="date"
                                value={nextRunDate}
                                onChange={(e) => setNextRunDate(e.target.value)}
                                className="w-full bg-[#101622] text-white border border-white/10 rounded-lg p-2 text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Hora</label>
                            <input
                                type="time"
                                value={nextRunTime}
                                onChange={(e) => setNextRunTime(e.target.value)}
                                className="w-full bg-[#101622] text-white border border-white/10 rounded-lg p-2 text-xs"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCreate}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        Salvar Agendamento
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {schedules.length === 0 && !isCreating ? (
                    <p className="text-gray-500 text-center text-sm py-4">Nenhum agendamento ativo.</p>
                ) : (
                    schedules.map((item) => (
                        <div key={item.id} className="bg-[#1A202C] border border-white/5 p-4 rounded-xl flex justify-between items-center group">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.type === 'payment_reminder' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {item.type === 'payment_reminder' ? 'Financeiro' : 'Geral'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase">
                                        • {item.recurrence === 'once' ? 'Uma vez' :
                                            item.recurrence === 'daily' ? 'Diário' :
                                                item.recurrence === 'weekly' ? 'Semanal' :
                                                    item.recurrence === 'biweekly' ? 'Quinzenal' : 'Mensal'}
                                    </span>
                                </div>
                                <h4 className="text-white font-bold text-sm">{item.title}</h4>
                                <p className="text-gray-400 text-xs mt-1">
                                    Próximo: {format(new Date(item.next_run_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                            <button
                                onClick={() => handleCancel(item.id)}
                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Cancelar Agendamento"
                            >
                                <span className="material-symbols-rounded">delete</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
