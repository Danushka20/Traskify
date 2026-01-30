import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useToast } from '../../components/feedback/ToastProvider';
import { Send, Users, CheckCircle2, Circle, Type, AlignLeft } from 'lucide-react';
import { clsx } from 'clsx';

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function AdminCustomMail() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
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

    const toggleAll = () => {
        if (selectedIds.length === members.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(members.map(m => m.id));
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message || selectedIds.length === 0) return;

        setLoading(true);
        try {
            const res = await api.post('/admin/mail/send-custom', { 
                subject,
                message,
                user_ids: selectedIds
            });
            addToast({
                tone: 'success',
                title: 'Sent!',
                description: res.data.message
            });
            setSubject('');
            setMessage('');
        } catch (err) {
            addToast({
                tone: 'error',
                title: 'Error',
                description: 'Failed to send messages.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
             <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Custom Email</h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500">Send custom updates, news, or notifications to your team.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {/* Message Form */}
                    <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-fit">
                        <form onSubmit={handleSend} className="space-y-4 sm:space-y-6">
                            <div>
                                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
                                    <Type size={14} className="text-indigo-500 sm:w-4 sm:h-4" />
                                    Email Subject
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter subject line..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
                                    <AlignLeft size={14} className="text-indigo-500 sm:w-4 sm:h-4" />
                                    Message Content
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    placeholder="Write your update here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || selectedIds.length === 0}
                                className={clsx(
                                    "w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base text-white shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2",
                                    loading || selectedIds.length === 0
                                        ? 'bg-slate-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5'
                                )}
                            >
                                {loading ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        <Send size={18} className="sm:w-5 sm:h-5" />
                                        Send to {selectedIds.length} {selectedIds.length === 1 ? 'Member' : 'Members'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Member Selection */}
                    <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col h-[400px] sm:h-[500px] lg:h-[600px]">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-800">Recipients</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-500">{selectedIds.length} selected</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleAll}
                                className="text-[10px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
                            >
                                {selectedIds.length === members.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="flex-1 space-y-1.5 sm:space-y-2 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                            {members.map(member => (
                                <div 
                                    key={member.id}
                                    onClick={() => toggleMember(member.id)}
                                    className={clsx(
                                        "flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl border cursor-pointer transition-all",
                                        selectedIds.includes(member.id) 
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                    )}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className={clsx(
                                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors",
                                            selectedIds.includes(member.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                        )}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs sm:text-sm tracking-tight">{member.name}</p>
                                            <p className="text-[10px] sm:text-xs opacity-70 truncate max-w-[120px] sm:max-w-none">{member.email}</p>
                                        </div>
                                    </div>
                                    {selectedIds.includes(member.id) ? (
                                        <CheckCircle2 size={16} className="text-indigo-600 sm:w-[18px] sm:h-[18px]" />
                                    ) : (
                                        <Circle size={16} className="text-slate-300 sm:w-[18px] sm:h-[18px]" />
                                    )}
                                </div>
                            ))}

                            {members.length === 0 && (
                                <div className="text-center py-8 sm:py-12 text-slate-400">
                                    <Users className="mx-auto mb-2 opacity-20" size={40} />
                                    <p className="text-sm">No team members found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
