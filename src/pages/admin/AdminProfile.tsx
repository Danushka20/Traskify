import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Users, ShieldCheck, ClipboardList, CheckCircle2, Clock, Loader2, BarChart3, Mail } from 'lucide-react';
import { clsx } from 'clsx';

type TaskRecord = {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'completed' | 'late';
    user?: {
        id: number;
        name: string;
    };
};

type TeamMember = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function AdminProfile() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [taskResponse, memberResponse] = await Promise.all([
                    api.get('/tasks', { params: { include_overdue: 1, include_users: 1 } }),
                    api.get('/users'),
                ]);
                setTasks(Array.isArray(taskResponse.data) ? taskResponse.data : []);
                setMembers(Array.isArray(memberResponse.data) ? memberResponse.data : []);
            } catch (error) {
                console.error('Failed to load admin profile data', error);
                setTasks([]);
                setMembers([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const stats = useMemo(() => {
        const pending = tasks.filter(task => task.status === 'pending').length;
        const completed = tasks.filter(task => task.status === 'completed').length;
        const late = tasks.filter(task => task.status === 'late').length;
        const total = tasks.length || 1;
        const completionRate = Math.round((completed / total) * 100);

        const perMember = tasks.reduce<Record<number, { name: string; completed: number; pending: number; late: number }>>((acc, task) => {
            if (!task.user) {
                return acc;
            }
            if (!acc[task.user.id]) {
                acc[task.user.id] = { name: task.user.name, completed: 0, pending: 0, late: 0 };
            }
            acc[task.user.id][task.status] += 1;
            return acc;
        }, {});

        const leaderboard = Object.values(perMember)
            .map(entry => ({
                name: entry.name,
                completed: entry.completed,
                total: entry.completed + entry.pending + entry.late,
                health: entry.pending + entry.late === 0 ? 'On track' : entry.late ? 'Needs support' : 'Monitoring',
            }))
            .sort((a, b) => b.completed - a.completed)
            .slice(0, 5);

        return {
            pending,
            completed,
            late,
            completionRate,
            totalMembers: members.filter(member => member.role !== 'admin').length,
            leaderboard,
        };
    }, [tasks, members]);

    return (
        <Layout>
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <section className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12 text-white shadow-[0_35px_70px_-35px_rgba(15,23,42,0.8)]">
                    <div className="absolute -top-24 left-8 h-44 w-44 rounded-full bg-blue-500/30 blur-[120px] hidden sm:block" />
                    <div className="absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-indigo-500/30 blur-[140px] hidden sm:block" />
                    <div className="relative flex flex-col gap-4 sm:gap-6 lg:gap-8 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-indigo-200/80">Admin profile</p>
                            <h1 className="mt-2 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">{user?.name ?? 'Administrator'}</h1>
                            <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm text-indigo-100/80">
                                Monitor team performance, keep member profiles aligned, and stay ahead of delivery risks from your command center.
                            </p>
                        </div>
                        <div className="rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/10 bg-white/10 p-4 sm:p-5 lg:p-6 backdrop-blur self-start md:self-auto">
                            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-100/80">Completion rate</p>
                            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">{stats.completionRate}%</p>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-indigo-200/80">Across all tracked tasks</p>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 lg:grid-cols-3">
                    {[{
                        label: 'Total members',
                        value: stats.totalMembers,
                        icon: Users,
                        tone: 'from-blue-500 via-sky-500 to-indigo-500',
                    }, {
                        label: 'Tasks completed',
                        value: stats.completed,
                        icon: CheckCircle2,
                        tone: 'from-emerald-500 via-emerald-400 to-lime-400',
                    }, {
                        label: 'Active watchers',
                        value: stats.pending,
                        icon: Clock,
                        tone: 'from-amber-400 via-orange-400 to-rose-400',
                    }].map(card => (
                        <div key={card.label} className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-900/5 hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500">{card.label}</p>
                                    <p className="mt-2 sm:mt-3 lg:mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900">{card.value}</p>
                                </div>
                                <div className={clsx('flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-md', 'bg-gradient-to-br', card.tone)}>
                                    <card.icon size={20} className="sm:w-6 sm:h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.3fr,1fr]">
                    <div className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-900/5">
                        <div className="flex items-center gap-2 sm:gap-3 text-slate-500">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-100 text-indigo-600">
                                <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Administrator details</h2>
                                <p className="text-xs sm:text-sm text-slate-500">Keep your contact information visible to the team.</p>
                            </div>
                        </div>
                        <dl className="mt-4 sm:mt-6 lg:mt-8 grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 md:grid-cols-2">
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 lg:p-5">
                                <dt className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                                    <Mail size={12} className="sm:w-3.5 sm:h-3.5" /> Email address
                                </dt>
                                <dd className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-800 break-all">{user?.email ?? 'Not provided'}</dd>
                            </div>
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 lg:p-5">
                                <dt className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                                    <ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5" /> Role
                                </dt>
                                <dd className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-800">Admin</dd>
                            </div>
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 lg:p-5">
                                <dt className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                                    <ClipboardList size={12} className="sm:w-3.5 sm:h-3.5" /> Tasks monitored
                                </dt>
                                <dd className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-800">{tasks.length}</dd>
                            </div>
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 lg:p-5">
                                <dt className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                                    <BarChart3 size={12} className="sm:w-3.5 sm:h-3.5" /> Completion rate
                                </dt>
                                <dd className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-800">{stats.completionRate}%</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-900/5">
                        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">Task distribution</h3>
                        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                            {[{ label: 'Pending', value: stats.pending, color: 'text-amber-600', bar: 'from-amber-400 via-amber-500 to-orange-500' },
                              { label: 'Completed', value: stats.completed, color: 'text-emerald-600', bar: 'from-emerald-400 via-emerald-500 to-green-500' },
                              { label: 'Late', value: stats.late, color: 'text-rose-600', bar: 'from-rose-400 via-rose-500 to-red-500' }].map(item => (
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
                        <div className="mt-4 sm:mt-6 lg:mt-8 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4 lg:p-5 text-[10px] sm:text-xs leading-relaxed text-slate-500">
                            Keep an eye on members with late work and provide coaching or redistribute assignments ahead of upcoming deadlines.
                        </div>
                    </div>
                </section>

                <section className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-900/5">
                    <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between">
                        <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Team leaderboard</h2>
                        <span className="self-start md:self-auto rounded-full border border-slate-200 bg-white px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-slate-500">
                            Tracking top 5 performers
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 sm:py-16 text-slate-500 text-sm">
                            <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            Gathering insights…
                        </div>
                    ) : stats.leaderboard.length > 0 ? (
                        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                            {stats.leaderboard.map(member => (
                                <div key={member.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5 lg:p-6 shadow-sm hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="text-sm sm:text-base font-semibold text-slate-900">{member.name}</p>
                                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500">{member.health}</p>
                                    </div>
                                    <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">Completed</span>
                                            <span className="mt-0.5 sm:mt-1 text-base sm:text-lg font-semibold text-emerald-600">{member.completed}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">Total</span>
                                            <span className="mt-0.5 sm:mt-1 text-base sm:text-lg font-semibold text-slate-700">{member.total}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-100 bg-slate-50/80 p-8 sm:p-12 text-center text-xs sm:text-sm text-slate-500">
                            Once members start completing tasks, performance trends will appear here.
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
