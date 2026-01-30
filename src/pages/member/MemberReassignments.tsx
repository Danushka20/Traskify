import { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useToast } from '../../components/feedback/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { useEchoListener } from '../../context/RealtimeContext';

type Reassign = {
    id: number;
    task: { id: number; title?: string } | null;
    from_user: { id: number; name: string } | null;
    to_user: { id: number; name: string } | null;
    reason?: string | null;
    created_at: string;
};

export default function MemberReassignments() {
    const { user } = useAuth();
    const [items, setItems] = useState<Reassign[]>([]);
    const { addToast } = useToast();

    const fetch = useCallback(async () => {
        try {
            if (!user) return;
            const res = await api.get<Reassign[]>(`/users/${user.id}/reassignments`);
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) {
            setItems([]);
            if (e?.response?.status === 403) {
                addToast({ tone: 'error', title: 'Unauthorized', description: 'You are not allowed to view this user\'s reassignments.' });
            } else {
                addToast({ tone: 'error', title: 'Failed to load reassignments' });
            }
        }
    }, [user, addToast]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    // Fast, efficient real-time listener
    useEchoListener('tasks', 'TaskUpdated', () => fetch(), [fetch]);

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div>
                     <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Reassignment History</h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base font-medium text-slate-500">Track tasks that have been moved between team members.</p>
                </div>

                <div className="overflow-hidden bg-white border shadow-xl shadow-slate-200/50 rounded-xl sm:rounded-2xl lg:rounded-[2rem] border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-400">Date</th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-400">Task</th>
                                    <th className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-400">From</th>
                                    <th className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-400">To</th>
                                    <th className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-400">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(Array.isArray(items) ? items : []).map(i => (
                                    <tr key={i.id} className="transition-colors hover:bg-slate-50/80 group">
                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-500">
                                            <span className="hidden sm:inline">{new Date(i.created_at).toLocaleString()}</span>
                                            <span className="sm:hidden">{new Date(i.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                            <div className="text-sm sm:text-base font-semibold text-slate-700">{i.task?.title ?? `#${i.task?.id}`}</div>
                                            <div className="sm:hidden mt-1 flex flex-wrap gap-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700">
                                                    {i.from_user?.name}
                                                </span>
                                                <span className="text-slate-400">→</span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                                                    {i.to_user?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-50 text-indigo-700">
                                                {i.from_user?.name}
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-700">
                                                {i.to_user?.name}
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm italic text-slate-500">"{i.reason}"</td>
                                    </tr>
                                ))}
                                {(Array.isArray(items) ? items : []).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 sm:px-6 py-12 sm:py-20 text-center">
                                            <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-300">No reassignments recorded</p>
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
