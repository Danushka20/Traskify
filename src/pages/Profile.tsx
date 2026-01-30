import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Mail, Shield, Calendar, CheckCircle2, AlertCircle, Clock, Loader2, UserCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

type TaskRecord = {
    id: number;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    status: 'pending' | 'completed' | 'late';
};

export default function Profile() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const response = await api.get('/tasks', { params: { include_overdue: 1 } });
                setTasks(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to load tasks for profile', error);
                setTasks([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadTasks();
    }, []);

    const { pending, completed, late, upcomingTask, recentTasks } = useMemo(() => {
        if (!Array.isArray(tasks)) {
            return { pending: 0, completed: 0, late: 0, upcomingTask: null, recentTasks: [] };
        }
        const pendingTasks = tasks.filter(task => task.status === 'pending');
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const lateTasks = tasks.filter(task => task.status === 'late');

        const nextTask = [...pendingTasks, ...lateTasks]
            .map(task => ({ task, deadline: new Date(task.end_time) }))
            .filter(item => !Number.isNaN(item.deadline.getTime()))
            .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())[0]?.task ?? null;

        const latestTasks = [...tasks]
            .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())
            .slice(0, 5);

        return {
            pending: pendingTasks.length,
            completed: completedTasks.length,
            late: lateTasks.length,
            upcomingTask: nextTask,
            recentTasks: latestTasks,
        };
    }, [tasks]);

    const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member';

    return (
        <Layout>
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-12 text-white shadow-[0_35px_70px_-35px_rgba(15,23,42,0.8)]">
                    <div className="absolute -top-20 left-10 h-32 sm:h-44 w-32 sm:w-44 rounded-full bg-blue-500/30 blur-[120px]" />
                    <div className="absolute bottom-0 right-0 h-40 sm:h-60 w-40 sm:w-60 rounded-full bg-indigo-500/30 blur-[140px]" />
                    <div className="relative flex flex-col gap-6 lg:gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-indigo-200/80">Account profile</p>
                            <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">{user?.name ?? 'Your profile'}</h1>
                            <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm text-indigo-100/80">
                                Review your account details and track your task momentum.
                            </p>
                            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-indigo-100/60">
                                <span className="rounded-full border border-white/20 px-2 sm:px-3 py-1 sm:py-1.5">{roleLabel}</span>
                                <span className="rounded-full border border-white/20 px-2 sm:px-3 py-1 sm:py-1.5">{pending} pending</span>
                                <span className="rounded-full border border-white/20 px-2 sm:px-3 py-1 sm:py-1.5">{completed} done</span>
                            </div>
                        </div>
                        <div className="rounded-xl sm:rounded-3xl border border-white/10 bg-white/10 p-4 sm:p-6 backdrop-blur">
                            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-100/80">Next deadline</p>
                            <p className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold text-white">
                                {upcomingTask ? upcomingTask.title : 'Nothing urgent'}
                            </p>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-indigo-200/80">
                                {upcomingTask
                                    ? new Date(upcomingTask.end_time).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                                    : 'All tasks are up to date.'}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.3fr,1fr]">
                    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-900/5">
                        <div className="flex items-center gap-3 text-slate-500">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-100 text-blue-600">
                                <UserCircle2 size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Personal details</h2>
                                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Update this information with your administrator if anything changes.</p>
                            </div>
                        </div>
                        <dl className="mt-4 sm:mt-6 lg:mt-8 grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2">
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 lg:p-5">
                                <dt className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                                    <Mail size={12} className="sm:w-[14px] sm:h-[14px]" /> Email
                                </dt>
                                <dd className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-800 truncate">{user?.email ?? 'Not available'}</dd>
                            </div>
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 lg:p-5">
                                <dt className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                                    <Shield size={12} className="sm:w-[14px] sm:h-[14px]" /> Role
                                </dt>
                                <dd className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-800">{roleLabel}</dd>
                            </div>
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 lg:p-5">
                                <dt className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                                    <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" /> Today
                                </dt>
                                <dd className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-800">{new Date().toLocaleDateString()}</dd>
                            </div>
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 lg:p-5">
                                <dt className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                                    <CheckCircle2 size={12} className="sm:w-[14px] sm:h-[14px]" /> Completed
                                </dt>
                                <dd className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-800">{completed}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-900/5">
                        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">Status breakdown</h3>
                        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                            {[{ label: 'Pending', value: pending, color: 'text-amber-600', bar: 'from-amber-400 via-amber-500 to-orange-500' },
                              { label: 'Completed', value: completed, color: 'text-emerald-600', bar: 'from-emerald-400 via-emerald-500 to-green-500' },
                              { label: 'Late', value: late, color: 'text-rose-600', bar: 'from-rose-400 via-rose-500 to-red-500' }].map(item => (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
                                        <span className={item.color}>{item.label}</span>
                                        <span>{item.value}</span>
                                    </div>
                                    <div className="mt-1.5 sm:mt-2 h-2 sm:h-2.5 overflow-hidden rounded-full bg-slate-100">
                                        <div className={clsx('h-full rounded-full bg-gradient-to-r', item.bar)} style={{ width: tasks.length ? `${Math.min(100, (item.value / tasks.length) * 100)}%` : '0%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-5 text-[10px] sm:text-xs leading-relaxed text-slate-500">
                            Tip: Check in with the admin team if you need to reassign work that is trending late.
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-900/5">
                    <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Recent activity</h2>
                        <span className="rounded-full border border-slate-200 bg-white px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-slate-500 self-start sm:self-auto">
                            {tasks.length} tasks synced
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 text-slate-500">
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Loading your activity…
                        </div>
                    ) : recentTasks.length > 0 ? (
                        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                            {recentTasks.map(task => {
                                const start = new Date(task.start_time);
                                const end = new Date(task.end_time);
                                const statusStyles: Record<TaskRecord['status'], string> = {
                                    pending: 'border-amber-200 bg-amber-50 text-amber-700',
                                    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                                    late: 'border-rose-200 bg-rose-50 text-rose-700',
                                };
                                const StatusIcon = task.status === 'completed' ? CheckCircle2 : task.status === 'late' ? AlertCircle : Clock;

                                return (
                                    <div key={task.id} className="rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5 lg:p-6 shadow-inner">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <span className={clsx('inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide', statusStyles[task.status])}>
                                                    {task.status}
                                                </span>
                                                <h3 className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg font-semibold text-slate-900">{task.title}</h3>
                                                {task.description && (
                                                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2">{task.description}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-start gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <Calendar size={14} className="sm:w-4 sm:h-4" />
                                                    {start.toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <Clock size={14} className="sm:w-4 sm:h-4" />
                                                    <span className="hidden sm:inline">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="sm:hidden">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                                                    <StatusIcon size={14} className="sm:w-4 sm:h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-100 bg-slate-50/80 p-8 sm:p-10 lg:p-12 text-center text-xs sm:text-sm text-slate-500">
                            No task activity yet. Once you start working on tasks, they will appear here.
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
