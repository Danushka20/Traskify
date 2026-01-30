import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import WelcomeHeader from './components/WelcomeHeader';
import DailyBriefing from './components/DailyBriefing';
import StatsCards from './components/StatsCards';
import { useEchoListener } from '../../context/RealtimeContext';

export default function MemberDashboard() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);

    const fetchTasks = useCallback(() => {
        api.get('/tasks')
            .then(res => {
                const data = res.data;
                setTasks(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error('Dashboard tasks fetch failed', err);
                setTasks([]);
            });
    }, []);

    const fetchNotes = useCallback(() => {
        // Since backend now returns array of notes
        api.get('/daily-note')
            .then(res => {
                const data = res.data;
                setNotes(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error('Dashboard notes fetch failed', err);
                setNotes([]);
            });
    }, []);

    const fetchAll = useCallback(() => {
        fetchNotes();
        fetchTasks();
    }, [fetchNotes, fetchTasks]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Fast, efficient real-time listeners using the unified context hook
    useEchoListener('tasks', 'TaskCreated', (e: any) => {
        const isMyTask = Number(e.task.user_id) === Number(user?.id);
        if (isMyTask) {
            setTasks(prev => {
                const exists = prev.some(t => t.id === e.task.id);
                if (exists) return prev;
                return [...prev, e.task];
            });
            fetchTasks();
        }
    }, [user, fetchTasks]);

    useEchoListener('tasks', 'TaskUpdated', (e: any) => {
        const isMyTask = Number(e.task.user_id) === Number(user?.id);
        setTasks(prev => {
            const hasTask = prev.some(t => t.id === e.task.id);
            if (isMyTask) {
                if (hasTask) return prev.map(t => t.id === e.task.id ? e.task : t);
                else return [...prev, e.task];
            } else if (hasTask) {
                return prev.filter(t => t.id !== e.task.id);
            }
            return prev;
        });
        if (isMyTask) {
            fetchTasks();
        }
    }, [user, fetchTasks]);

    useEchoListener('tasks', 'TaskDeleted', (e: any) => {
        setTasks(prev => prev.filter(t => t.id !== e.id));
        fetchTasks();
    }, [fetchTasks]);

    const handleRealtimeNote = useCallback((incoming: any) => {
        if (!incoming) return;

        const noteId = String(incoming.id);
        const recipients = incoming.recipients || [];
        const currentUserId = user?.id ? String(user.id) : null;
        const isGlobal = recipients.length === 0;
        const isAssignedToMe = currentUserId && recipients.some((r: any) => String(r.id) === currentUserId);
        const shouldShow = isGlobal || isAssignedToMe;

        setNotes(prev => {
            const exists = prev.some(n => String(n.id) === noteId);

            if (shouldShow) {
                if (exists) {
                    return prev.map(n => String(n.id) === noteId ? incoming : n);
                }
                return [incoming, ...prev];
            }

            if (exists) {
                return prev.filter(n => String(n.id) !== noteId);
            }

            return prev;
        });

        fetchNotes();
    }, [user, fetchNotes]);

    useEchoListener('daily-notes', 'DailyNoteCreated', (e: any) => {
        handleRealtimeNote(e?.note);
    }, [handleRealtimeNote]);

    useEchoListener('daily-notes', 'DailyNoteUpdated', (e: any) => {
        handleRealtimeNote(e?.note);
    }, [handleRealtimeNote]);

    useEchoListener('daily-notes', 'DailyNoteDeleted', (e: any) => {
        const deletedId = String(e.id);
        setNotes(prev => prev.filter(n => String(n.id) !== deletedId));
        fetchNotes();
    }, [fetchNotes]);

    // Expose refreshNow for instant updates after CRUD actions
    const refreshNow = () => fetchAll();

    const pendingCount = useMemo(() => Array.isArray(tasks) ? tasks.filter((task) => task.status === 'pending').length : 0, [tasks]);
    const completedCount = useMemo(() => Array.isArray(tasks) ? tasks.filter((task) => task.status === 'completed').length : 0, [tasks]);
    const lateCount = useMemo(() => Array.isArray(tasks) ? tasks.filter((task) => task.status === 'late' || task.status === 'rejected').length : 0, [tasks]);
    const totalTasks = Array.isArray(tasks) ? tasks.length : 0;

    return (
        <Layout>
            <div className="flex items-center justify-end mb-2">
                <span className="px-2 sm:px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">Live updates</span>
                <button className="px-2 sm:px-3 py-1 ml-2 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full" onClick={refreshNow}>Refresh now</button>
            </div>
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <WelcomeHeader 
                    userName={user?.name} 
                    totalTasks={totalTasks} 
                    completedCount={completedCount} 
                    lateCount={lateCount} 
                />

                <StatsCards 
                    pendingCount={pendingCount} 
                    completedCount={completedCount} 
                    lateCount={lateCount} 
                />

                <DailyBriefing notes={notes} />
            </div>
        </Layout>
    );
}
