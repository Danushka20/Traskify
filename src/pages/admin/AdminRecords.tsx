import { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Calendar, Download, FileSpreadsheet, FileBox, CheckCircle2, Clock, AlertCircle, Loader2, CloudDownload } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

type TaskRecord = {
    id: number;
    title: string;
    status: 'pending' | 'completed' | 'late';
    start_time?: string | null;
    end_time?: string | null;
    user?: { id: number; name: string } | null;
};

export default function AdminRecords() {
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks', { params: { include_users: 1, date } });
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Failed to load tasks', e);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const selectedDayRange = useMemo(() => {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }, [date]);

    const completedToday = useMemo(() => (Array.isArray(tasks) ? tasks : []).filter((t) => t.status === 'completed' && t.end_time && new Date(t.end_time) >= selectedDayRange.start && new Date(t.end_time) <= selectedDayRange.end), [tasks, selectedDayRange]);
    const pendingToday = useMemo(() => (Array.isArray(tasks) ? tasks : []).filter((t) => {
        if (t.status !== 'pending') return false;
        if (!t.start_time) return false;
        const dt = new Date(t.start_time);
        return dt >= selectedDayRange.start && dt <= selectedDayRange.end;
    }), [tasks, selectedDayRange]);
    const lateToday = useMemo(() => (Array.isArray(tasks) ? tasks : []).filter((t) => {
        if (t.status !== 'late') return false;
        if (!t.start_time) return false;
        const dt = new Date(t.start_time);
        return dt >= selectedDayRange.start && dt <= selectedDayRange.end;
    }), [tasks, selectedDayRange]);

    const groupedCompleted = useMemo(() => {
        const map = new Map<string, TaskRecord[]>();
        completedToday.forEach((t) => {
            const name = t.user?.name ?? 'Unassigned';
            if (!map.has(name)) map.set(name, []);
            map.get(name)!.push(t);
        });
        return map;
    }, [completedToday]);

    const escapeHtml = (unsafe: string) =>
        unsafe
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');

    const downloadPdf = () => {
        const win = window.open('', '_blank', 'noopener,noreferrer');
        if (!win) return;
        const style = `
            <style>
                body{font-family: Inter, ui-sans-serif, system-ui, Arial; padding:24px; color:#0f172a}
                h1{font-size:18px;margin-bottom:6px}
                h2{font-size:14px;margin:10px 0}
                table{width:100%;border-collapse:collapse;margin-top:8px}
                th,td{padding:8px;border:1px solid #e6e9ee;text-align:left;font-size:12px}
                .meta{color:#6b7280;font-size:12px;margin-bottom:12px}
            </style>
        `;

        let html = `<!doctype html><html><head><title>Daily Records ${date}</title>${style}</head><body>`;
        html += `<h1>Daily Task Records — ${date}</h1><div class="meta">Generated: ${new Date().toLocaleString()}</div>`;

        groupedCompleted.forEach((list, name) => {
            html += `<div><h2>${escapeHtml(name)} — ${list.length} completed</h2>`;
            html += `<table><thead><tr><th>Task</th><th>Completed At</th></tr></thead><tbody>`;
            list.forEach((t) => {
                const dt = t.end_time ? new Date(t.end_time).toLocaleString() : 'N/A';
                html += `<tr><td>${escapeHtml(t.title)}</td><td>${escapeHtml(dt)}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        });

        html += `</body></html>`;
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 300);
    };

    const downloadCsvClient = () => {
        // Build CSV from groupedCompleted
        const rows: string[] = [];
        rows.push(['Member', 'Task', 'Completed At'].join(','));
        groupedCompleted.forEach((list, name) => {
            list.forEach((t) => {
                const dt = t.end_time
                    ? new Date(t.end_time).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                    : '';
                // Basic CSV escaping
                const safe = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
                rows.push([safe(name), safe(t.title), safe(dt)].join(','));
            });
        });
        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `task_records_${date}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const downloadCsvServer = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `/api/exports/tasks?date=${date}&format=csv`;
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;

            // Use api.get to match axios usage elsewhere
            const response = await api.get(url, {
                headers,
                responseType: 'blob',
                withCredentials: !token, // allow cookies if no token
            });
            const blob = response.data;
            const u = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = u;
            a.download = `task_records_${date}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(u);
        } catch (err) {
            console.error('Export failed', err);
        }
    };

    return (
        <Layout>
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <section className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12 text-white shadow-[0_35px_70px_-35px_rgba(15,23,42,0.8)]">
                    <div className="absolute -top-24 left-8 h-44 w-44 rounded-full bg-indigo-500/20 blur-[120px] hidden sm:block" />
                    <div className="absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-blue-500/20 blur-[140px] hidden sm:block" />
                    
                    <div className="relative flex flex-col gap-4 sm:gap-6 lg:gap-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 sm:gap-3 text-indigo-200/80">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em]">Archive</span>
                            </div>
                            <h1 className="mt-2 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">Daily Records</h1>
                            <p className="mt-2 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-indigo-100/70">
                                Historical view of daily task performance. Generate reports and audit completion times.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none text-slate-500 group-hover:text-indigo-500 transition-colors">
                                    <Calendar size={14} className="sm:w-4 sm:h-4" />
                                </div>
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={(e) => setDate(e.target.value)} 
                                    className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all w-full sm:w-auto [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                            
                            <div className="flex gap-1.5 sm:gap-2">
                                <button 
                                    onClick={downloadPdf} 
                                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white text-slate-900 rounded-lg sm:rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-lg shadow-black/5"
                                    title="Download PDF Report"
                                >
                                    <Download size={14} className="sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">PDF</span>
                                </button>
                                <button 
                                    onClick={downloadCsvClient} 
                                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm bg-indigo-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20 border border-indigo-500/50"
                                    title="Download CSV"
                                >
                                    <FileSpreadsheet size={14} className="sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">CSV</span>
                                </button>
                                <button 
                                    onClick={downloadCsvServer} 
                                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm bg-slate-700 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-slate-600 transition-colors shadow-lg shadow-black/20"
                                    title="Download Full CSV from Server"
                                >
                                    <CloudDownload size={14} className="sm:w-4 sm:h-4" />
                                    <span className="hidden lg:inline">Server CSV</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
                    <div className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm hover:translate-y-[-2px] transition-transform duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest text-slate-500">Completed</p>
                                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900">{loading ? '-' : completedToday.length}</p>
                            </div>
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-600">
                                <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm hover:translate-y-[-2px] transition-transform duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest text-slate-500">Pending</p>
                                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900">{loading ? '-' : pendingToday.length}</p>
                            </div>
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-100 text-amber-600">
                                <Clock size={20} className="sm:w-6 sm:h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm hover:translate-y-[-2px] transition-transform duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest text-slate-500">Late</p>
                                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900">{loading ? '-' : lateToday.length}</p>
                            </div>
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-100 text-rose-600">
                                <AlertCircle size={20} className="sm:w-6 sm:h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2">
                        <FileBox className="text-slate-400" size={18} />
                        <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Completion Reports</h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-slate-400">
                            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-indigo-500" />
                            <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium">Fetching records...</p>
                        </div>
                    ) : groupedCompleted.size > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {Array.from(groupedCompleted.entries()).map(([name, list]) => (
                                <div key={name} className="flex flex-col overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[1.5rem] border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="border-b border-slate-100 bg-slate-50/50 px-4 sm:px-6 py-3 sm:py-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm sm:text-base font-semibold text-slate-900">{name}</span>
                                            <span className="rounded-full bg-emerald-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-emerald-700">
                                                {list.length} tasks
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto max-h-[250px] sm:max-h-[300px] p-0">
                                        <table className="w-full text-left text-xs sm:text-sm">
                                            <thead className="bg-white sticky top-0 z-10 shadow-sm">
                                                <tr className="border-b border-slate-100 text-[10px] sm:text-xs font-medium text-slate-500">
                                                    <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium">Task</th>
                                                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-right font-medium">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {list.map((t) => (
                                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-4 sm:px-6 py-2 sm:py-3 text-slate-700 font-medium">
                                                            <div className="line-clamp-1 text-xs sm:text-sm" title={t.title}>{t.title}</div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-2 sm:py-3 text-right text-slate-500 whitespace-nowrap text-xs sm:text-sm">
                                                            {t.end_time ? new Date(t.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-slate-50/50 p-10 sm:p-16 text-center border-dashed">
                            <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-900/5">
                                <FileBox className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300" />
                            </div>
                            <h3 className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-slate-900">No records found</h3>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">No completed tasks were found for {new Date(date).toLocaleDateString()}.</p>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
