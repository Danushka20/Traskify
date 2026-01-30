import { useState, useEffect, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ClipboardList, CheckCircle2, AlertCircle, Sparkles, Users, BarChart3 } from 'lucide-react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { useEchoListener } from '../../context/RealtimeContext';
import ProjectEfficiencyChart from './components/ProjectEfficiencyChart';
import MemberEfficiencyChart from './components/MemberEfficiencyChart';
import MemberTaskBreakdownTable from './components/MemberTaskBreakdownTable';
import TaskDistributionChart from './components/TaskDistributionChart';

type TaskRecord = {
    id: number;
    title: string;
    status: 'pending' | 'completed' | 'late' | 'rejected' | 'reassigned';
    start_time: string;
    end_time: string;
    user_id: number;
    user?: { id: number; name: string } | null;
};

type DashboardStats = {
    project_efficiency: { name: string; total: number; completed: number; efficiency: number; }[];
    member_efficiency: { 
        name: string; 
        total: number; 
        completed: number; 
        efficiency: number; 
        project_efficiency: number;
        general_efficiency: number;
        project_count: number;
        general_count: number;
    }[];
    task_distribution: { name: string; value: number; }[];
};

type StatCardProps = {
    icon: LucideIcon;
    label: string;
    value: string | number;
    accent: string;
    highlight: string;
    progress: number;
};

const StatCard = ({ icon: Icon, label, value, accent, highlight, progress }: StatCardProps) => (
    <div className="relative p-4 sm:p-6 lg:p-8 overflow-hidden bg-white border shadow-lg rounded-2xl sm:rounded-3xl border-slate-200 shadow-slate-900/6">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400">{label}</p>
                <div className="flex items-baseline gap-2 sm:gap-3 mt-2 sm:mt-3">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900">{value}</span>
                    <span className={`text-xs sm:text-sm font-semibold ${accent} hidden sm:inline`}>{highlight}</span>
                </div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-600">
                <Icon size={18} className="sm:w-[22px] sm:h-[22px]" />
            </div>
        </div>
        <div className="h-1.5 sm:h-2 mt-4 sm:mt-6 rounded-full bg-slate-100">
            <div
                className={`h-full rounded-full ${accent.replace('text-', 'bg-')}`}
                style={{
                    width: `${(() => {
                        const clamped = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 100) : 0;
                        if (clamped === 0) return 0;
                        return Math.max(clamped, 6);
                    })()}%`
                }}
            />
        </div>
    </div>
);

export default function AdminDashboard() {
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchTasks = useCallback(async () => {
        try {
            const [tasksRes, statsRes] = await Promise.all([
                api.get('/tasks', { params: { include_overdue: 1, include_users: 1 } }),
                api.get('/admin/dashboard-stats')
            ]);
            setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
            setDashboardStats(statsRes.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to load dashboard stats', error);
            setTasks([]);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Compute stats from current tasks
    const stats = useMemo(() => {
        if (!Array.isArray(tasks)) {
            return { pending: 0, completed: 0, late: 0 };
        }
        const pending = tasks.filter((t) => t.status === 'pending').length;
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const late = tasks.filter((t) => t.status === 'late' || t.status === 'rejected').length;
        return { pending, completed, late };
    }, [tasks]);

    // Fast, efficient real-time listeners for instant dashboard updates
    useEchoListener('tasks', 'TaskCreated', (e: any) => {
        // Use local timezone Safe comparison
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        const todayStr = new Date(d.getTime() - offset).toISOString().split('T')[0];
        
        const taskDateStr = e.task.start_time.substring(0, 10);
        
        // Add if it matches today (or if user wants to see everything, logic can be adjusted)
        if (taskDateStr === todayStr) {
            setTasks(prev => {
                const exists = prev.some(t => t.id === e.task.id);
                if (exists) return prev;
                return [...prev, e.task];
            });
            setLastUpdated(new Date());
        }
    }, []);

    useEchoListener('tasks', 'TaskUpdated', (e: any) => {
        setTasks(prev => {
            const index = prev.findIndex(t => t.id === e.task.id);
            if (index !== -1) {
                // Update existing
                const next = [...prev];
                next[index] = e.task;
                return next;
            } else {
                // If it's today and not in list (e.g. status changed to late by cron or other means)
                const d = new Date();
                const offset = d.getTimezoneOffset() * 60000;
                const todayStr = new Date(d.getTime() - offset).toISOString().split('T')[0];
                const taskDateStr = e.task.start_time.substring(0, 10);

                if (taskDateStr === todayStr) {
                    return [...prev, e.task];
                }
                return prev;
            }
        });
        setLastUpdated(new Date());
    }, []);

    useEchoListener('tasks', 'TaskDeleted', (e: any) => {
        setTasks(prev => prev.filter(t => t.id !== e.id));
        setLastUpdated(new Date());
    }, []);

    const refreshNow = () => fetchTasks();

    const totalTasks = stats.pending + stats.completed + stats.late;
    const completionRate = totalTasks ? Math.round((stats.completed / totalTasks) * 100) : 0;
    const pendingRate = totalTasks ? Math.round((stats.pending / totalTasks) * 100) : 0;
    const lateRate = totalTasks ? Math.round((stats.late / totalTasks) * 100) : 0;
    const lastUpdatedLabel = lastUpdated
        ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'Syncing real-time insights...';

    return (
        <Layout>
            <div className="flex items-center justify-end mb-2">
                <span className="px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">Live updates</span>
                <button className="px-3 py-1 ml-2 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full" onClick={refreshNow}>Refresh now</button>
            </div>
            <div className="w-full px-2 sm:px-4 lg:px-6 mx-auto space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl">
                {/* Modern Hero Section */}
                <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14 text-white shadow-[0_40px_80px_-40px_rgba(15,23,42,0.7)]">
                    <div className="absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-indigo-500/30 blur-[120px] hidden sm:block" />
                    <div className="absolute flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium right-4 sm:right-6 top-4 sm:top-6 rounded-xl sm:rounded-2xl bg-white/10 text-slate-200">
                        <Sparkles size={18} className="text-emerald-300 hidden sm:block" />
                        <span className="hidden sm:inline">Admin Control Center</span>
                        <span className="sm:hidden">Admin</span>
                    </div>
                    <div className="relative">
                        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-200/80">Team overview</p>
                        <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">Welcome, Admin</h1>
                        <p className="max-w-2xl mt-3 sm:mt-4 text-sm sm:text-base text-indigo-100/90">
                            Monitor workstreams, unlock blockers, and keep momentum across every team.
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-4 mt-6 sm:mt-10 text-xs sm:text-sm text-indigo-200/70">
                            <span className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 font-medium border rounded-full border-white/20"><Users size={14} className="sm:w-4 sm:h-4"/> {totalTasks} tasks</span>
                            <span className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 font-medium border rounded-full border-white/20"><BarChart3 size={14} className="sm:w-4 sm:h-4"/> {completionRate}%</span>
                            <span className="px-3 sm:px-4 py-1.5 sm:py-2 font-medium border rounded-full border-white/20 hidden sm:block">{lastUpdatedLabel}</span>
                        </div>
                    </div>
                </section>

                {/* Modern Stat Cards */}
                <section className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <StatCard
                        icon={ClipboardList}
                        label="Pending tasks"
                        value={stats.pending}
                        accent="text-amber-500"
                        highlight={`${pendingRate}% of workload`}
                        progress={pendingRate}
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Completed tasks"
                        value={stats.completed}
                        accent="text-emerald-500"
                        highlight={`${completionRate}% completed`}
                        progress={completionRate}
                    />
                    <StatCard
                        icon={AlertCircle}
                        label="Late tasks"
                        value={stats.late}
                        accent="text-rose-500"
                        highlight={`${lateRate}% at risk`}
                        progress={lateRate}
                    />
                </section>

                {/* Team Momentum & Focus Areas */}
                <section className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[2fr,1fr] w-full">
                    <div className="p-4 sm:p-6 lg:p-8 bg-white border shadow-lg rounded-2xl sm:rounded-3xl border-slate-200 shadow-slate-900/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Team momentum</h2>
                                <p className="text-xs sm:text-sm text-slate-500">Track how work is distributed across the pipeline.</p>
                            </div>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-500 self-start sm:self-auto">Auto-refreshing</span>
                        </div>
                        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                            <div>
                                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                    <span>Completion rate</span>
                                    <span>{completionRate}%</span>
                                </div>
                                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500" style={{ width: `${completionRate}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                    <span>Pending load</span>
                                    <span>{pendingRate}%</span>
                                </div>
                                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" style={{ width: `${pendingRate}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                    <span>At-risk work</span>
                                    <span>{lateRate}%</span>
                                </div>
                                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-red-500" style={{ width: `${lateRate}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="p-6 bg-white border shadow-lg rounded-3xl border-slate-200 shadow-slate-900/5">
                            <h3 className="text-sm font-semibold text-slate-900">Immediate focus areas</h3>
                            <ul className="mt-4 space-y-4 text-sm text-slate-600">
                                <li className="p-4 border rounded-2xl border-amber-200 bg-amber-50/70 text-amber-700">
                                    {stats.pending ? `${stats.pending} tasks are waiting on assignment. Prioritize owners to keep delivery on track.` : 'All tasks are assigned. Great job keeping the team responsive.'}
                                </li>
                                <li className="p-4 border rounded-2xl border-emerald-200 bg-emerald-50/70 text-emerald-700">
                                    {completionRate > 70 ? 'Completion rate is trending positively. Celebrate the wins with the team.' : 'Completion rate can improve—consider stand-ups to unblock progress.'}
                                </li>
                                <li className="p-4 border rounded-2xl border-rose-200 bg-rose-50/70 text-rose-700">
                                    {stats.late ? (
                                        <>
                                            <span className="block font-bold mb-1">{stats.late} tasks are overdue:</span>
                                            <ul className="list-disc list-inside space-y-1">
                                                {Array.from(new Set((Array.isArray(tasks) ? tasks : []).filter(t => t.status === 'late' || t.status === 'rejected').map(t => t.user?.name))).map(name => (
                                                    <li key={name ?? 'Unknown'}>{name ?? 'Unknown User'}</li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : 'No overdue tasks detected. Momentum is steady.'}
                                </li>
                            </ul>
                        </div>
                        <div className="p-6 text-sm bg-white border shadow-lg rounded-3xl border-slate-200 text-slate-600 shadow-slate-900/5">
                            <p className="font-semibold text-slate-900">What’s next</p>
                            <p className="mt-2 leading-relaxed">
                                Use the navigation to drill into members, tasks, or notes. This dashboard keeps your pulse metrics front and center so you can take swift action.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Analytics Charts */}
                {dashboardStats && (
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full pb-6 sm:pb-10">
                        <ProjectEfficiencyChart data={dashboardStats.project_efficiency} />
                        <MemberEfficiencyChart data={dashboardStats.member_efficiency} />
                        <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            <div className="xl:col-span-1">
                                <TaskDistributionChart data={dashboardStats.task_distribution} />
                            </div>
                            <div className="xl:col-span-2">
                                <MemberTaskBreakdownTable data={dashboardStats.member_efficiency} />
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
}
