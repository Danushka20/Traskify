import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { useEchoListener } from '../../context/RealtimeContext';

export default function MemberProgress() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks');
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setTasks([]);
        }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Fast, efficient real-time listeners
    useEchoListener('tasks', 'TaskCreated', () => fetchTasks(), [fetchTasks]);
    useEchoListener('tasks', 'TaskUpdated', () => fetchTasks(), [fetchTasks]);

    const pending = Array.isArray(tasks) ? tasks.filter(t => t.status === 'pending').length : 0;
    const completed = Array.isArray(tasks) ? tasks.filter(t => t.status === 'completed').length : 0;
    const late = Array.isArray(tasks) ? tasks.filter(t => t.status === 'late').length : 0;
    const total = Array.isArray(tasks) ? tasks.length : 0;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    return (
        <Layout>
            <div className="space-y-6 sm:space-y-8">
                <div>
                     <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">My Progress</h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500 font-medium tracking-wide">Track your daily performance metrics.</p>
                </div>
                
                {loading && <div className="text-xs sm:text-sm font-semibold text-slate-400 animate-pulse">Syncing data...</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="relative group overflow-hidden p-4 sm:p-6 lg:p-8 bg-white border border-amber-100 rounded-xl sm:rounded-2xl lg:rounded-[2rem] shadow-xl shadow-amber-100/40">
                         <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-amber-50 rounded-bl-full -mr-4 sm:-mr-8 -mt-4 sm:-mt-8 opacity-50 transition-transform group-hover:scale-110 hidden sm:block"/>
                        <div className="relative">
                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-600/80 mb-1 sm:mb-2">Pending</div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">{pending}</div>
                            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400 font-medium">Tasks remaining</div>
                        </div>
                    </div>
                    
                    <div className="relative group overflow-hidden p-4 sm:p-6 lg:p-8 bg-white border border-emerald-100 rounded-xl sm:rounded-2xl lg:rounded-[2rem] shadow-xl shadow-emerald-100/40">
                         <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-emerald-50 rounded-bl-full -mr-4 sm:-mr-8 -mt-4 sm:-mt-8 opacity-50 transition-transform group-hover:scale-110 hidden sm:block"/>
                        <div className="relative">
                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600/80 mb-1 sm:mb-2">Completed</div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">{completed}</div>
                            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400 font-medium">Tasks finished</div>
                        </div>
                    </div>
                    
                    <div className="relative group overflow-hidden p-4 sm:p-6 lg:p-8 bg-white border border-rose-100 rounded-xl sm:rounded-2xl lg:rounded-[2rem] shadow-xl shadow-rose-100/40 sm:col-span-2 lg:col-span-1">
                         <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-rose-50 rounded-bl-full -mr-4 sm:-mr-8 -mt-4 sm:-mt-8 opacity-50 transition-transform group-hover:scale-110 hidden sm:block"/>
                        <div className="relative">
                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-rose-600/80 mb-1 sm:mb-2">Late</div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">{late}</div>
                             <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400 font-medium">Tasks overdue</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-10 bg-white border border-slate-100 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 lg:gap-8 relative z-10">
                        <div>
                            <div className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Daily Completion Rate</div>
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">{completionRate}%</div>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500 font-medium">Keep pushing to reach 100%!</p>
                        </div>
                        <div className="flex-1 w-full max-w-xl">
                             <div className="h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200 transition-all duration-1000 ease-out" 
                                    style={{ width: `${completionRate}%` }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
