
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface PracticeLogEntry {
    exercise_name: string;
    duration_minutes: number;
    bpm_reached?: number;
    difficulty_rating?: 1 | 2 | 3 | 4 | 5;
    notes?: string;
}

export const usePracticeLog = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const logPractice = async (entry: PracticeLogEntry) => {
        if (!user) {
            setError('Usuário não autenticado');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: err } = await supabase
                .from('practice_logs')
                .insert({
                    student_id: user.id,
                    exercise_name: entry.exercise_name,
                    duration_minutes: entry.duration_minutes,
                    bpm_reached: entry.bpm_reached,
                    difficulty_rating: entry.difficulty_rating,
                    notes: entry.notes
                })
                .select()
                .single();

            if (err) throw err;
            return data;
        } catch (err: any) {
            console.error('Erro ao salvar log de treino:', err);
            setError(err.message || 'Erro desconhecido');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        logPractice,
        loading,
        error
    };
};
