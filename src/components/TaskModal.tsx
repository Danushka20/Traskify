import { useState } from 'react';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../api/axios';
import { useToast } from './feedback/ToastProvider';

export default function TaskModal({ task, onClose, onComplete }: any) {
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const [subtasks, setSubtasks] = useState<any[]>(task.subtasks || []);

    if (!task) return null;

    const start = new Date(task.start_time);
    const end = new Date(task.end_time);

    const markComplete = async () => {
        setIsSubmitting(true);
        try {
            await api.put(`/tasks/${task.id}`, { status: 'completed', completion_note: note, subtasks });
            addToast({ tone: 'success', title: 'Task completed' });
            onComplete && onComplete();
            onClose();
        } catch (e) {
            addToast({ tone: 'error', title: 'Failed to complete task' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSubtask = async (index: number) => {
        const next = subtasks.map((s, i) => i === index ? { ...s, completed: !s.completed } : s);
        setSubtasks(next);
        try {
            await api.put(`/tasks/${task.id}`, { subtasks: next });
            // if all done, notify parent to refresh
            const allDone = next.length > 0 && next.every(s => s.completed);
            if (allDone) {
                addToast({ tone: 'success', title: 'All subtasks completed' });
                onComplete && onComplete();
            }
        } catch (err) {
            addToast({ tone: 'error', title: 'Failed to update subtasks' });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold">{task.title}</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">{task.user?.name}</p>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="sm:w-4 sm:h-4" />
                            <span className="truncate">{start.toLocaleString()} - {end.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-700">
                    <p>{task.description}</p>
                    {subtasks && subtasks.length > 0 && (
                        <div className="mt-3 sm:mt-4">
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Subtasks</h4>
                            <ul className="space-y-2">
                                {subtasks.map((s, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <input type="checkbox" checked={!!s.completed} onChange={() => toggleSubtask(i)} className="w-4 h-4" />
                                        <span className={clsx('text-xs sm:text-sm', s.completed ? 'line-through text-slate-400' : '')}>{s.title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-3 sm:mt-4">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Completion note (optional)</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full p-2 sm:p-3 border rounded-lg text-sm" rows={3} />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg sm:rounded-xl bg-slate-100 text-sm font-medium">Close</button>
                    {task.status !== 'completed' && (
                        <button onClick={markComplete} disabled={isSubmitting} className="px-4 py-2 rounded-lg sm:rounded-xl bg-blue-600 text-white text-sm font-medium">
                            Mark Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
