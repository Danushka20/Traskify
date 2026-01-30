import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, History, User, FileText, Loader2, RefreshCcw } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useToast } from '../../components/feedback/ToastProvider';
import { useEchoListener } from '../../context/RealtimeContext';
import clsx from 'clsx';

type Reassign = {
    id: number;
    task: { id: number; title?: string } | null;
    from_user: { id: number; name: string } | null;
    to_user: { id: number; name: string } | null;
    reason?: string | null;
    created_at: string;
};

export default function AdminReassignments() {
    const [items, setItems] = useState<Reassign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    const fetch = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get<Reassign[]>('/admin/reassignments');
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) {
            setItems([]);
            if (e?.response?.status === 403) {
                addToast({ title: 'Unauthorized access', tone: 'error' });
            } else {
                addToast({ title: 'Failed to load history', tone: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => { fetch(); }, [fetch]);
    useEchoListener('tasks', 'TaskUpdated', () => fetch(), [fetch]);

    // Calculate stats
    const counts = (Array.isArray(items) ? items : []).reduce((acc, curr) => {
        const name = curr.to_user?.name;
        if (name) acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topReceiver = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    return (
        <Layout>
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                {/* Header Section */}
                <section className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12 text-white shadow-[0_35px_70px_-35px_rgba(15,23,42,0.8)]">
                    <div className="absolute -top-24 left-8 h-44 w-44 rounded-full bg-indigo-500/20 blur-[120px] hidden sm:block" />
                    <div className="absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-blue-500/20 blur-[140px] hidden sm:block" />
                    
                    <div className="relative flex flex-col justify-between gap-4 sm:gap-6 lg:gap-8 md:flex-row md:items-end">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2 sm:gap-3 text-indigo-200/80">
                                <History className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em]">Audit Logs</span>
                            </div>
                            <h1 className="mt-2 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">Task Reassignments</h1>
                            <p className="mt-2 sm:mt-4 text-sm sm:text-base lg:text-lg text-indigo-100/70">
                                Track task movement between team members. Monitor ownership changes and review reasons for reassignment.
                            </p>
                        </div>
                        
                        <div className="flex gap-2 sm:gap-4">
                            <div className="rounded-xl sm:rounded-2xl bg-white/10 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 backdrop-blur-sm border border-white/10">
                                <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-200">Total Moves</p>
                                <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl lg:text-3xl font-bold">{items.length}</p>
                            </div>
                            {topReceiver && (
                                <div className="rounded-xl sm:rounded-2xl bg-white/10 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 backdrop-blur-sm border border-white/10">
                                    <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-200">Top Receiver</p>
                                    <p className="mt-0.5 sm:mt-1 text-base sm:text-lg lg:text-xl font-bold truncate max-w-[80px] sm:max-w-[120px] lg:max-w-[150px]">{topReceiver[0]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section>
                    <div className="flex items-center justify-between px-1 sm:px-2 pb-4 sm:pb-6">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Recent Movements</h2>
                        <button 
                            onClick={fetch}
                            className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <RefreshCcw size={12} className={clsx("sm:w-[14px] sm:h-[14px]", isLoading && "animate-spin")} />
                            Refresh
                        </button>
                    </div>

                    {isLoading && items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p className="mt-4 text-sm font-medium">Loading history...</p>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {items.map((log) => (
                                <div 
                                    key={log.id} 
                                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[1.5rem] border border-slate-100 bg-white p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-100"
                                >
                                    <div className="absolute left-0 top-0 h-full w-1 sm:w-1.5 bg-gradient-to-b from-indigo-500 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                                    
                                    <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 md:flex-row md:items-center md:justify-between">
                                        {/* Task & Reason Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="flex h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                                    <FileText size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                                                        {log.task?.title || <span className="italic text-slate-400">Untitled Task (#{log.task?.id})</span>}
                                                    </h3>
                                                    {log.reason ? (
                                                        <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2">
                                                            <span className="font-medium text-slate-900">Reason:</span> {log.reason}
                                                        </p>
                                                    ) : (
                                                        <p className="mt-1 text-xs sm:text-sm italic text-slate-400">No reason provided</p>
                                                    )}
                                                    <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-400 flex items-center gap-1">
                                                        <History size={10} className="sm:w-3 sm:h-3" />
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Flow Visual */}
                                        <div className="flex shrink-0 items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 px-4 sm:px-6 py-3 sm:py-4 md:bg-transparent md:border-0 md:px-0 md:py-0">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-600">
                                                    <User size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                                                </div>
                                                <span className="mt-1.5 sm:mt-2 max-w-[70px] sm:max-w-[100px] truncate text-[10px] sm:text-xs font-semibold text-slate-600 text-center">
                                                    {log.from_user?.name || 'Unknown'}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-center px-2 sm:px-4 text-slate-300">
                                                <div className="h-px w-8 sm:w-12 lg:w-16 bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
                                                <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px] lg:w-4 lg:h-4 -mt-1.5 sm:-mt-2 text-indigo-400" />
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-indigo-600 shadow-md shadow-indigo-200 text-white">
                                                    <User size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                                                </div>
                                                <span className="mt-1.5 sm:mt-2 max-w-[70px] sm:max-w-[100px] truncate text-[10px] sm:text-xs font-semibold text-indigo-700 text-center">
                                                    {log.to_user?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-slate-50/50 p-8 sm:p-12 lg:p-16 text-center border-dashed">
                            <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-900/5">
                                <RefreshCcw className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-slate-300" />
                            </div>
                            <h3 className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-slate-900">No reassignments yet</h3>
                            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">Task ownership changes will appear in this audit log.</p>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
