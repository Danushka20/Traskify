import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { Loader2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/feedback/ToastProvider';
import { useConfirm } from '../../components/feedback/ConfirmDialogProvider';
import { useEchoListener } from '../../context/RealtimeContext';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { AdminTaskCard } from './components/AdminTaskCard';
import type { TaskRecord } from '../../types/task';

export default function AdminTasks() {
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
    
    // Use local timezone YYYY-MM-DD for default filter
    const getLocalISODate = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    
    const [filterDate, setFilterDate] = useState(getLocalISODate());
    const [showPrevious, setShowPrevious] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'late' | 'rejected'>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [userFilter, setUserFilter] = useState<string>('');

    const { addToast } = useToast();
    const confirm = useConfirm();
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get('/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error(error);
            setUsers([]);
            addToast({
                tone: 'error',
                title: 'Unable to load members',
                description: 'Please refresh the page or try again later.',
            });
        }
    }, [addToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {
                include_users: 1,
                date: filterDate,
                include_overdue: showPrevious ? 1 : 0,
            };
            if (userFilter) params.user_id = parseInt(userFilter, 10);

            const res = await api.get('/tasks', { params });
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error(error);
            setTasks([]);
            addToast({
                tone: 'error',
                title: 'Failed to load tasks',
                description: 'Something went wrong while syncing tasks.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [addToast, filterDate, showPrevious, userFilter]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Fast, efficient real-time listeners
    useEchoListener('tasks', 'TaskCreated', (e: any) => {
        // Direct string comparison (YYYY-MM-DD) avoids timezone shifting issues
        const taskDateStr = e.task.start_time.substring(0, 10);
        const matchesDate = taskDateStr === filterDate;

        if (matchesDate) {
            setTasks(prev => {
                const exists = prev.some(t => t.id === e.task.id);
                if (exists) return prev;
                return [...prev, e.task].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
            });
        }
    }, [filterDate]);

    useEchoListener('tasks', 'TaskUpdated', (e: any) => {
        const taskDateStr = e.task.start_time.substring(0, 10);
        const matchesDate = taskDateStr === filterDate;

        setTasks(prev => {
            const exists = prev.some(t => t.id === e.task.id);
            
            if (matchesDate) {
                // If the task belongs to the current view
                if (exists) {
                     // Update existing in place
                     return prev.map(t => t.id === e.task.id ? e.task : t);
                } else {
                     // Or add it if it was missing (rare, but possible if filters changed)
                     return [...prev, e.task].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
                }
            } else {
                // Task no longer matches current date filter (e.g. rescheduled) -> Remove it
                if (exists) {
                    return prev.filter(t => t.id !== e.task.id);
                }
            }
            return prev;
        });
    }, [filterDate]);

    useEchoListener('tasks', 'TaskDeleted', (e: any) => {
        setTasks(prev => prev.filter(t => t.id !== e.id));
        fetchTasks();
    }, [fetchTasks]);

    useEchoListener('users', 'UserCreated', () => fetchUsers(), [fetchUsers]);

    const createTask = async (data: any) => {
        try {
            await api.post('/tasks', data);
            addToast({
                tone: 'success',
                title: 'Task created',
                description: 'Your task is now tracking on the board.',
            });
            fetchTasks();
        } catch (error) {
            console.error(error);
            addToast({
                tone: 'error',
                title: 'Task creation failed',
                description: 'Double-check the form and try again.',
            });
        }
    };

    const toggleTaskSubtask = async (task: any, index: number) => {
        const next = (task.subtasks || []).map((s: any, i: number) => i === index ? { ...s, completed: !s.completed } : s);
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, subtasks: next } : t));
        try {
            await api.put(`/tasks/${task.id}`, { subtasks: next });
            addToast({ tone: 'success', title: 'Subtask updated' });
        } catch (err) {
            fetchTasks();
            addToast({ tone: 'error', title: 'Failed to update subtask' });
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: 'Delete task',
            message: 'This task will be removed for everyone. This action cannot be undone.',
            confirmText: 'Delete task',
            cancelText: 'Keep task',
            tone: 'danger',
        });
        if (!confirmed) return;

        setTasks(prev => prev.filter(t => t.id !== id));
        try {
            await api.delete(`/tasks/${id}`);
            addToast({ tone: 'success', title: 'Task deleted' });
        } catch (error) {
            fetchTasks();
            addToast({ tone: 'error', title: 'Failed to delete task' });
        }
    };

    const handleSetStatus = async (task: TaskRecord, status: string) => {
        const confirmed = await confirm({
            title: status === 'rejected' ? 'Mark as Not Complete' : 'Update Status',
            message: `Are you sure you want to mark this task as ${status}?`,
            confirmText: 'Confirm',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;

        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
        try {
            await api.put(`/tasks/${task.id}`, { status });
            addToast({ tone: 'success', title: 'Status updated' });
        } catch (e) {
            fetchTasks();
            addToast({ tone: 'error', title: 'Update failed' });
        }
    };

    const filteredTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];
        if (statusFilter === 'all') return tasks;
        return tasks.filter((task) => task.status === statusFilter);
    }, [tasks, statusFilter]);

    return (
        <Layout>
            <div className="flex flex-col h-auto lg:h-[calc(100vh-8.5rem)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-none mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Task Management</h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-500">Assign and monitor tasks for your team members.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/meeting')}
                        className="p-2 sm:p-3 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors self-start sm:self-auto"
                        title="Send Meeting Reminder"
                    >
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3 flex-1 min-h-0">
                    <div className="h-auto lg:h-full lg:overflow-y-auto lg:pr-2">
                        <TaskForm users={users} isSubmitting={isLoading} onSubmit={createTask} />
                    </div>

                    <div className="flex flex-col h-auto lg:h-full lg:col-span-2 min-h-0">
                        <div className="flex-none pb-4">
                            <TaskFilters 
                                filterDate={filterDate}
                                setFilterDate={setFilterDate}
                                showPrevious={showPrevious}
                                setShowPrevious={setShowPrevious}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                userFilter={userFilter}
                                setUserFilter={setUserFilter}
                                users={users}
                            />
                        </div>

                        <div className="flex-1 lg:overflow-y-auto lg:pr-2 space-y-4 pb-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12 sm:py-16 bg-white border rounded-xl sm:rounded-2xl border-slate-200 text-slate-500">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    <span className="text-sm sm:text-base">Refreshing tasks…</span>
                                </div>
                            ) : filteredTasks.length > 0 ? filteredTasks.map(task => (
                                <AdminTaskCard 
                                    key={task.id}
                                    task={task}
                                    onToggleSubtask={toggleTaskSubtask}
                                    onDelete={handleDelete}
                                    onSetStatus={handleSetStatus}
                                    onReassign={(id) => navigate(`/tasks/${id}/reassign`)}
                                />
                            )) : (
                                <div className="p-8 sm:p-12 text-center bg-white border border-dashed rounded-xl sm:rounded-2xl border-slate-200">
                                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-slate-50 text-slate-400">
                                        <ClipboardList size={24} />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-medium text-slate-900">No tasks match your filters</h3>
                                    <p className="text-sm sm:text-base text-slate-500">Adjust the date, status, or previous toggle to explore more tasks.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Helper for empty state icon
function ClipboardList({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
    )
}
