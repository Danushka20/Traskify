import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useToast } from '../../components/feedback/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { useEchoListener } from '../../context/RealtimeContext';
import { hours, minutes, periods, to24Hour, from24Hour } from '../../utils/time';

type User = { id: number; name: string; email: string; role: string };

export default function Reassign() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useAuth();

    const [members, setMembers] = useState<User[]>([]);
    const [toUserId, setToUserId] = useState<number | null>(null);
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [startHour, setStartHour] = useState('09');
    const [startMinute, setStartMinute] = useState('00');
    const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
    
    const [endHour, setEndHour] = useState('10');
    const [endMinute, setEndMinute] = useState('00');
    const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMembers = useCallback(async () => {
        try {
            // Fetch all users we can assign to
            const [usersRes, taskRes] = await Promise.all([
                api.get<User[]>('/users'),
                // Specific task fetch to avoid dependency on current filtered list
                api.get(`/tasks/${id}`)
            ]);
            
            setMembers(Array.isArray(usersRes.data) ? usersRes.data.filter(m => m.id !== user?.id) : []);
            
            const task = taskRes.data;
            if (task) {
                const s = new Date(task.start_time);
                const e = new Date(task.end_time);
                
                setDate(s.toISOString().split('T')[0]);
                
                const sTime = from24Hour(s.toTimeString().split(' ')[0]);
                setStartHour(sTime.hour);
                setStartMinute(sTime.minute);
                setStartPeriod(sTime.period);
                
                const eTime = from24Hour(e.toTimeString().split(' ')[0]);
                setEndHour(eTime.hour);
                setEndMinute(eTime.minute);
                setEndPeriod(eTime.period);
            }
        } catch (e) {
            addToast({ tone: 'error', title: 'Failed to load details' });
        }
    }, [user, id, addToast]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    useEchoListener('users', 'UserCreated', () => {
        fetchMembers();
    }, [fetchMembers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !toUserId) return;

        const startTime = `${date} ${to24Hour(startHour, startPeriod)}:${startMinute}:00`;
        const endTime = `${date} ${to24Hour(endHour, endPeriod)}:${endMinute}:00`;

        setIsSubmitting(true);
        try {
            await api.post(`/tasks/${id}/reassign`, { 
                to_user_id: toUserId, 
                reason,
                start_time: startTime,
                end_time: endTime
            });
            addToast({ tone: 'success', title: 'Task reassigned' });
            navigate('/tasks');
        } catch (err: any) {
            addToast({ tone: 'error', title: 'Failed to reassign', description: err?.response?.data?.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-3 sm:px-0">
                <h1 className="text-xl sm:text-2xl font-bold">Reassign Task</h1>
                <p className="mt-1 text-sm sm:text-base text-slate-500">Choose a member to reassign this task to.</p>

                <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200">
                    <div>
                        <label className="block mb-1 text-xs sm:text-sm font-medium text-slate-700">Assign to</label>
                        <select required value={toUserId ?? ''} onChange={e => setToUserId(Number(e.target.value))} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg sm:rounded-xl">
                            <option value="">Select member</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name} — {m.email}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-xs sm:text-sm font-medium text-slate-700">Date</label>
                        <input 
                            type="date" 
                            required 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg sm:rounded-xl" 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block mb-1 text-xs sm:text-sm font-medium text-slate-700">New Start Time</label>
                            <div className="flex gap-1">
                                <select value={startHour} onChange={e => setStartHour(e.target.value)} className="w-full px-2 sm:px-3 py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                <select value={startMinute} onChange={e => setStartMinute(e.target.value)} className="w-full px-2 sm:px-3 py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                <select value={startPeriod} onChange={e => setStartPeriod(e.target.value as any)} className="w-full px-2 sm:px-3 py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm">{periods.map(p => <option key={p} value={p}>{p}</option>)}</select>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs sm:text-sm font-medium text-slate-700">New End Time</label>
                            <div className="flex gap-1">
                                <select value={endHour} onChange={e => setEndHour(e.target.value)} className="w-full px-2 sm:px-3 py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                <select value={endMinute} onChange={e => setEndMinute(e.target.value)} className="w-full px-2 sm:px-3 py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                <select value={endPeriod} onChange={e => setEndPeriod(e.target.value as any)} className="w-full px-2 sm:px-3 py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm">{periods.map(p => <option key={p} value={p}>{p}</option>)}</select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 text-xs sm:text-sm font-medium text-slate-700">Reason (optional)</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg sm:rounded-xl" rows={3} />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3 pt-2">
                        <button type="button" onClick={() => navigate(-1)} className="py-2 px-4 text-sm sm:text-base rounded-lg sm:rounded-xl border text-center">Cancel</button>
                        <button disabled={isSubmitting} className="py-2 px-4 text-sm sm:text-base bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold">{isSubmitting ? 'Reassigning...' : 'Reassign Task'}</button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
