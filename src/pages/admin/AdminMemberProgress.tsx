import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { useEchoListener } from '../../context/RealtimeContext';

export default function AdminMemberProgress() {
    const [rows, setRows] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState<'day'|'week'|'month'>('day');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/member-progress', { params: { period } });
            setRows(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (e) {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fast, efficient real-time listeners
    useEchoListener('tasks', 'TaskUpdated', () => fetchData(), [fetchData]);
    useEchoListener('tasks', 'TaskCreated', () => fetchData(), [fetchData]);

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">Team Progress</h1>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500 font-medium">Monitor task completion and workload distribution.</p>
                    </div>
                </div>

                <div className="overflow-hidden bg-white border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] rounded-xl sm:rounded-2xl lg:rounded-[2rem]">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-100/50 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                            <h2 className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider sm:tracking-widest text-slate-500">
                                {period === 'day' ? 'Today\'s Activity' : period === 'week' ? 'Weekly Overview' : 'Monthly Performance'}
                            </h2>
                        </div>
                        
                        <div className="flex p-0.5 sm:p-1 bg-slate-100 rounded-lg sm:rounded-xl">
                            {(['day', 'week', 'month'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`
                                        px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider rounded-md sm:rounded-lg transition-all
                                        ${period === p 
                                            ? 'bg-white text-indigo-600 shadow-sm' 
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                                        }
                                    `}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] sm:text-xs font-extrabold tracking-wider sm:tracking-widest uppercase text-slate-400 bg-slate-50/30">
                                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">Member</th>
                                    <th className="hidden sm:table-cell px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">Assigned</th>
                                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">Done</th>
                                    <th className="hidden md:table-cell px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">Pending</th>
                                    <th className="hidden lg:table-cell px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">Late</th>
                                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 sm:px-8 py-8 sm:py-12 text-center text-xs sm:text-sm text-slate-400 animate-pulse">
                                            Loading performance data...
                                        </td>
                                    </tr>
                                ) : (Array.isArray(rows) ? rows : []).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 sm:px-8 py-8 sm:py-12 text-center text-xs sm:text-sm text-slate-400">
                                            No activity recorded for this period.
                                        </td>
                                    </tr>
                                ) : (Array.isArray(rows) ? rows : []).map((r: any) => {
                                    const total = (r.assigned_count ?? r.assigned_today ?? 0);
                                    const completed = (r.completed_count ?? r.completed_today ?? 0);
                                    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                                    
                                    return (
                                        <tr key={r.id} className="group transition-colors hover:bg-slate-50/50">
                                            <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
                                                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                                    <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-xs sm:text-sm font-bold transition-transform text-white rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-md group-hover:scale-110 group-hover:shadow-lg group-hover:from-indigo-500 group-hover:to-blue-500">
                                                        {r.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-indigo-900 transition-colors truncate">{r.name}</div>
                                                        <div className="text-[10px] sm:text-xs font-medium text-slate-400 truncate">{r.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
                                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600">
                                                    {total}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
                                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    {completed}
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
                                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                                    {r.pending_count ?? r.pending ?? 0}
                                                </span>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
                                                <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${r.late_count > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    {r.late_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="flex-1 w-12 sm:w-16 lg:w-24 h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${rate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs font-bold text-slate-500">{rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
