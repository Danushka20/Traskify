import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEchoListener } from '../../context/RealtimeContext';
import TaskModal from '../../components/TaskModal';
import { useToast } from '../../components/feedback/ToastProvider';
import { MemberTaskCard } from './components/MemberTaskCard';

export default function MemberTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [modalTask, setModalTask] = useState<any | null>(null);
    const { addToast } = useToast();

    const fetchTasks = useCallback(() => {
         api.get('/tasks').then(res => {
            // Backend handles the logic: Today's tasks + Late/Incomplete from history
            // We just need to display what the backend sends us
            const fetchedTasks = Array.isArray(res.data) ? res.data : [];
            
            // Sort by upload order (ID) using numeric comparison
            fetchedTasks.sort((a: any, b: any) => Number(a.id) - Number(b.id));
            setTasks(fetchedTasks);
         }).catch(err => {
             console.error('Failed to fetch tasks:', err);
             setTasks([]);
         });
    }, []);

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 60000);
        return () => clearInterval(interval);
    }, [fetchTasks]);

    // Fast, efficient real-time listeners for zero-latency updates
    useEchoListener('tasks', 'TaskCreated', (e: any) => {
        const isMyTask = Number(e.task.user_id) === Number(user?.id);

        // Allow today's tasks OR if it's a late task being re-pushed/updated
        // Generally for "created", it's usually today, but let's be permissive if backend sends it
        if (isMyTask) {
            setTasks(prev => {
                const exists = prev.some(t => t.id === e.task.id);
                if (exists) return prev;
                return [...prev, e.task].sort((a, b) => Number(a.id) - Number(b.id));
            });
            addToast({ tone: 'info', title: 'New task assigned', description: e.task.title });
        }
    }, [user, addToast]);

    useEchoListener('tasks', 'TaskUpdated', (e: any) => {
        const isMyTask = Number(e.task.user_id) === Number(user?.id);
        
        setTasks(prev => {
            const hasTask = prev.some(t => t.id === e.task.id);
            
            if (isMyTask) {
                if (hasTask) {
                    return prev.map(t => t.id === e.task.id ? e.task : t);
                } else {
                    return [...prev, e.task].sort((a, b) => Number(a.id) - Number(b.id));
                }
            } else if (hasTask) {
                return prev.filter(t => t.id !== e.task.id);
            }
            return prev;
        });
    }, [user]);

    useEchoListener('tasks', 'TaskDeleted', (e: any) => {
        setTasks(prev => prev.filter(t => t.id !== e.id));
    }, []);

    const openModal = (task: any) => setModalTask(task);
    const closeModal = () => setModalTask(null);

    const toggleSubtask = async (task: any, index: number) => {
        const next = (task.subtasks || []).map((s: any, i: number) => i === index ? { ...s, completed: !s.completed } : s);
        
        // Optimistic update for subtasks
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, subtasks: next } : t));

        try {
            await api.put(`/tasks/${task.id}`, { subtasks: next });
        } catch (err) {
            console.error('Failed to update subtask', err);
            fetchTasks(); // Rollback
        }
    };

    // Sequential logic: find first non-completed task
    const activeTaskIndex = tasks.findIndex(task => task.status !== 'completed');
    const currentTaskId = activeTaskIndex !== -1 ? tasks[activeTaskIndex].id : undefined;

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">My Daily Targets</h1>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base font-medium text-slate-500">Complete each target in order to unlock the next.</p>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    {tasks.length > 0 ? tasks.map((task) => {
                        const isCompleted = task.status === 'completed';
                        const isCurrent = task.id === currentTaskId;
                        
                        // Sequential Logic: 
                        // 1. Explicit Administrative Lock (backend 'locked' property) 
                        // 2. Sequential Flow: Lock if not completed AND not the current active task
                        const isLocked = Boolean(task.locked) || (!isCompleted && !isCurrent);
                        
                        return (
                            <MemberTaskCard 
                                key={task.id} 
                                task={task} 
                                isCurrent={isCurrent}
                                isLocked={isLocked}
                                onOpenModal={openModal} 
                                onToggleSubtask={toggleSubtask}
                                onShowToast={addToast}
                            />
                        );
                    }) : (
                        <div className="relative p-8 sm:p-12 text-center rounded-2xl sm:rounded-[2.5rem] bg-white shadow-xl shadow-indigo-100/40 border border-slate-100 overflow-hidden group">
                           <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 -mt-12 sm:-mt-16 -mr-12 sm:-mr-16 transition-transform duration-700 rounded-bl-full bg-emerald-50/50 group-hover:scale-110"/>
                            
                            <div className="relative flex flex-col items-center">
                                <div className="flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-6 shadow-sm rounded-2xl sm:rounded-3xl bg-emerald-50 text-emerald-500">
                                    <CheckCircle2 size={28} className="sm:w-10 sm:h-10" />
                                </div>
                                <h3 className="mb-1 sm:mb-2 text-xl sm:text-2xl font-bold text-slate-900">All targets cleared!</h3>
                                <p className="text-sm sm:text-base font-medium text-slate-500">No targets assigned for today. Go enjoy your day!</p>
                            </div>
                        </div>
                    )}
                </div>

                        {modalTask && (
                            <TaskModal task={modalTask} onClose={closeModal} onComplete={fetchTasks} />
                        )}
            </div>
        </Layout>
    );
}
