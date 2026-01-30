import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useToast } from '../../components/feedback/ToastProvider';
import { Send, Link as LinkIcon, Users, CheckCircle2, Circle } from 'lucide-react';

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function AdminMeeting() {
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { addToast } = useToast();

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get<Member[]>('/users');
            const data = Array.isArray(res.data) ? res.data : [];
            const team = data.filter(u => u.role !== 'admin');
            setMembers(team);
            setSelectedIds(team.map(m => m.id)); // Default select all
        } catch (err) {
            console.error(err);
            setMembers([]);
            setSelectedIds([]);
        }
    };

    const toggleMember = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!link || selectedIds.length === 0) return;

        setLoading(true);
        try {
            const res = await api.post('/admin/meetings/send', { 
                link,
                user_ids: selectedIds
            });
            addToast({
                tone: 'success',
                title: 'Sent!',
                description: res.data.message
            });
            setLink('');
        } catch (err) {
            addToast({
                tone: 'error',
                title: 'Error',
                description: 'Failed to send meeting invites.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
             <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Daily Meeting</h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500">Send the daily Google Meet link to all active team members.</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <form onSubmit={handleSend} className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
                                Google Meet Link
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                                </div>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://meet.google.com/..."
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm sm:text-base text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs sm:text-sm text-indigo-900">
                                <p className="font-bold">Select Recipients</p>
                                <p className="opacity-80">Choose which team members will receive the invite.</p>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {members.map(member => (
                                <div 
                                    key={member.id}
                                    onClick={() => toggleMember(member.id)}
                                    className={`
                                        flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl border cursor-pointer transition-all
                                        ${selectedIds.includes(member.id) 
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}
                                    `}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0 ${selectedIds.includes(member.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs sm:text-sm truncate">{member.name}</p>
                                            <p className="text-[10px] sm:text-xs opacity-70 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                    {selectedIds.includes(member.id) ? (
                                        <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px] text-indigo-600 flex-shrink-0" />
                                    ) : (
                                        <Circle size={16} className="sm:w-[18px] sm:h-[18px] text-slate-300 flex-shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || selectedIds.length === 0}
                            className={`
                                w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${loading 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 sm:hover:-translate-y-0.5'
                                }
                            `}
                        >
                            {loading ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send size={18} className="sm:w-5 sm:h-5" />
                                    Send Invitations
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
