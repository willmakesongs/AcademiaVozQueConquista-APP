
import React, { useState } from 'react';
import { attendanceService } from '../../../services/attendanceService';
import { User, Course, AttendanceRecord } from '../../../types';

interface AttendanceTrackerProps {
    student: User;
    course?: Course;
    teacherId: string;
    record?: AttendanceRecord; // Added for editing mode
    onClose: () => void;
    onSuccess?: () => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
    student,
    course,
    teacherId,
    record,
    onClose,
    onSuccess
}) => {
    const [status, setStatus] = useState<'present' | 'absent' | 'replaced' | 'to_be_replaced'>(record?.status || 'present');
    const [notes, setNotes] = useState(record?.notes || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (record) {
                await attendanceService.updateAttendance(record.id, {
                    status,
                    notes
                });
            } else {
                await attendanceService.markAttendance({
                    student_id: student.id,
                    teacher_id: teacherId,
                    course_id: course?.id,
                    date: new Date().toISOString().split('T')[0],
                    status,
                    notes
                });
            }
            setSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(onClose, 2000);
        } catch (error) {
            alert('Erro ao registrar presença. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!record) return;
        if (!window.confirm('Deseja excluir este registro de presença?')) return;

        setLoading(true);
        try {
            await attendanceService.deleteAttendance(record.id);
            setSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(onClose, 2000);
        } catch (error) {
            alert('Erro ao excluir presença. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="p-6 bg-green-500/20 border border-green-500 rounded-lg text-center">
                <h3 className="text-xl font-bold text-green-400 mb-2">Presença Registrada!</h3>
                <p className="text-gray-300">O registro foi salvo com sucesso.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1A202C] p-6 rounded-xl border border-gray-700 w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
                {record ? 'Editar Presença' : 'Registrar Presença'}
            </h2>

            <div className="mb-6 flex items-center gap-4">
                <img
                    src={student.avatarUrl || 'https://via.placeholder.com/150'}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#0081FF]"
                />
                <div>
                    <h3 className="font-semibold text-lg text-white">{student.name}</h3>
                    <p className="text-sm text-gray-400">{course?.nome || 'Aula Avulsa'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { value: 'present', label: 'Presente', color: 'bg-green-500/20 border-green-500 text-green-400' },
                            { value: 'absent', label: 'Ausente', color: 'bg-red-500/20 border-red-500 text-red-400' },
                            { value: 'replaced', label: 'Reposto', color: 'bg-blue-500/20 border-blue-500 text-blue-400' },
                            { value: 'to_be_replaced', label: 'A Repor', color: 'bg-yellow-500/20 border-yellow-500 text-yellow-400' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setStatus(option.value as any)}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${status === option.value
                                    ? option.color
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Observações (Opcional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#0081FF] transition-colors"
                        rows={3}
                        placeholder="Ex: Chegou 10min atrasado..."
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    {record && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-12 h-12 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/20 transition-colors shrink-0 disabled:opacity-50"
                        >
                            <span className="material-symbols-rounded">delete</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-[#0081FF] hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            record ? 'Salvar Alterações' : 'Salvar Presença'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
