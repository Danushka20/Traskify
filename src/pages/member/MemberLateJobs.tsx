import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { useEchoListener } from '../../context/RealtimeContext';

export default function MemberLateJobs() {
    const [stats, setStats] = useState<any>(null);
    const { user } = useAuth();

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/my-late-stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch late stats', err);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        // Auto-refresh every minute
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Refresh stats when tasks are updated (they might become late or be completed)
    useEchoListener('tasks', 'TaskUpdated', (e: any) => {
        if (Number(e.task.user_id) === Number(user?.id)) {
            fetchStats();
        }
    }, [user, fetchStats]);

    return (
        <Layout>
            <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Late Jobs History</h1>
                    <p className="text-slate-500 text-xs sm:text-sm">Overview of your task performance and missed deadlines.</p>
                </div>

                <div className="overflow-hidden bg-white border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] rounded-xl sm:rounded-2xl lg:rounded-[2rem]">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-100/50 bg-rose-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                                <span className="font-bold text-base sm:text-lg">!</span>
                            </div>
                            <div>
                                <h2 className="font-bold text-sm sm:text-base text-slate-800">Late Performance Stats</h2>
                                <p className="text-[10px] sm:text-xs text-rose-600 font-semibold uppercase tracking-wider">System Log</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 border-b border-slate-100 italic">Member</th>
                                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 border-b border-slate-100 italic">Weekly</th>
                                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 border-b border-slate-100 italic hidden sm:table-cell">Lifetime</th>
                                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 border-b border-slate-100 italic">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats && (
                                    <tr className="group transition-colors hover:bg-rose-50/20">
                                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 font-bold text-xs sm:text-sm text-slate-700">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 font-bold text-white rounded-md sm:rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 shadow-md text-[10px] sm:text-xs">
                                                    {stats.name ? stats.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <span className="truncate max-w-[60px] sm:max-w-none">{stats.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
                                            <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${stats.weekly_late > 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                {stats.weekly_late} tasks
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
                                            <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${stats.monthly_late > 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                {stats.monthly_late} tasks
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
                                            {stats.weekly_late === 0 && stats.monthly_late === 0 ? (
                                                <span className="text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-wide sm:tracking-wider">Perfect</span>
                                            ) : stats.weekly_late > 2 ? (
                                                <span className="text-[10px] sm:text-xs font-bold text-rose-500 uppercase tracking-wide sm:tracking-wider">Critical</span>
                                            ) : (
                                                <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-wide sm:tracking-wider">Attention</span>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
