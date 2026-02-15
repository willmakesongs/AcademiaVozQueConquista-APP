import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationHistoryItem {
    id: string;
    created_at: string;
    title: string;
    body: string;
    status: 'sent' | 'failed' | 'scheduled' | 'pending';
    metadata: any;
}

interface NotificationHistoryProps {
    userId: string;
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({ userId }) => {
    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notification_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setHistory(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistory();
    }, [userId]);

    if (loading) return <div className="text-gray-400 text-sm py-4">Carregando histórico...</div>;

    if (history.length === 0) {
        return (
            <div className="text-center py-8 bg-[#1A202C]/50 rounded-2xl border border-white/5">
                <span className="material-symbols-rounded text-gray-600 text-4xl mb-2">history</span>
                <p className="text-gray-500 text-sm">Nenhuma notificação enviada ainda.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {history.map((item) => (
                <div key={item.id} className="bg-[#1A202C] border border-white/5 p-4 rounded-2xl flex gap-4 items-start hover:border-[#0081FF]/30 transition-all">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.status === 'sent' ? 'bg-green-500/10 text-green-500' :
                        item.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                        <span className="material-symbols-rounded">
                            {item.status === 'sent' ? 'check_circle' : item.status === 'failed' ? 'error' : 'schedule'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                {format(new Date(item.created_at), "dd MMM 'às' HH:mm", { locale: ptBR })}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs line-clamp-2">{item.body}</p>
                        {item.status === 'failed' && item.metadata?.error && (
                            <p className="text-red-400 text-[10px] mt-2 bg-red-500/10 p-2 rounded-lg">
                                Erro: {item.metadata.error}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
