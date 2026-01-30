import { useEffect, useState } from 'react';
import DailyNoteTable from '../../components/DailyNoteTable';
import api from '../../api/axios';
// import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { User, Send, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../components/feedback/ToastProvider';

type Member = {
    id: number;
    name: string;
};

export default function AdminDailyNotes() {
    const [filterDate, setFilterDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [filterMember, setFilterMember] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState('');
    // const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        const loadMembers = async () => {
            try {
                const response = await api.get<Member[]>('/users');
                setMembers(Array.isArray(response.data) ? response.data : []);
                setLoadError('');
            } catch (error: any) {
                setMembers([]);
                setLoadError('Failed to load members');
            }
        };
        loadMembers();
    }, []);

    // Helper functions for member selection
    const toggleMember = (id: string, isSelected: boolean) => {
        setSelectedMembers(prev =>
            isSelected ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(members.map(m => String(m.id)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/daily-note', {
                title,
                content,
                member_ids: selectedMembers,
            });
            setTitle('');
            setContent('');
            setSelectedMembers([]);
            setRefreshTrigger(prev => prev + 1);
            addToast({ type: 'success', message: 'Daily note assigned successfully!' } as any);
        } catch (error: any) {
            addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to assign daily note.' } as any);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Assign Daily Note</h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-slate-500 font-medium">Create and distribute daily notes to team members.</p>
                </div>

                <div className="overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-xl sm:rounded-[2rem]">
                    <div className="relative px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-950 text-white overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-bl-[80px] sm:rounded-bl-[100px] -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 blur-2xl"/>
                        <div className="relative flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-sm shadow-inner border border-white/10">
                                <Send className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold">New Daily Assignment</h2>
                                <p className="text-indigo-200 text-xs sm:text-sm font-medium">Draft and send notes to your team</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                        {/* Note Details */}
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
                                <FileText size={14} className="sm:w-4 sm:h-4" />
                                Note Details
                            </h2>
                            <div className="grid gap-4 sm:gap-6">
                                <div>
                                    <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 sm:px-5 py-3 sm:py-4 text-sm font-semibold text-slate-800 transition-all bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
                                        placeholder="e.g., Project Kickoff Notes"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Content</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full px-3 sm:px-5 py-3 sm:py-4 font-medium transition-all bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-[120px] sm:min-h-[200px] resize-none placeholder:text-slate-400 text-sm"
                                        placeholder="Write your note here..."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recipients */}
                        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
                                    <User size={14} className="sm:w-4 sm:h-4" />
                                    Recipients
                                </h2>
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors self-start sm:self-auto"
                                >
                                    {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            {loadError ? (
                                <div className="p-4 sm:p-6 text-center font-medium text-red-600 bg-red-50 rounded-xl sm:rounded-2xl border border-red-100 text-sm">
                                    {loadError}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {members.map(member => {
                                        const isSelected = selectedMembers.includes(String(member.id));
                                        return (
                                            <div
                                                key={member.id}
                                                onClick={() => toggleMember(String(member.id), isSelected)}
                                                className={clsx(
                                                    'cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group relative overflow-hidden',
                                                    isSelected 
                                                        ? 'bg-indigo-50/50 border-indigo-500 shadow-lg shadow-indigo-100' 
                                                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
                                                )}
                                            >
                                                <div className={clsx(
                                                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold text-lg',
                                                    isSelected 
                                                        ? 'bg-indigo-500 text-white shadow-md scale-110' 
                                                        : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
                                                )}>
                                                    {isSelected ? (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        member.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span className={clsx(
                                                    "font-bold transition-colors",
                                                    isSelected ? "text-indigo-900" : "text-slate-600 group-hover:text-slate-900"
                                                )}>{member.name}</span>
                                                
                                                {/* Selection indicator glow */}
                                                {isSelected && <div className="absolute inset-0 border-2 border-indigo-500 rounded-2xl pointer-events-none" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end pt-4 sm:pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isSubmitting || selectedMembers.length === 0}
                                className={clsx(
                                    "px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold text-white transition-all shadow-lg rounded-lg sm:rounded-xl flex items-center justify-center gap-2 sm:gap-3",
                                    (isSubmitting || selectedMembers.length === 0)
                                        ? "bg-slate-300 shadow-none cursor-not-allowed opacity-70"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                                )}
                            >
                                <Send size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                                <span>{isSubmitting ? 'Assigning...' : 'Assign Note'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* History Section - Enhanced */}
                <section className="relative overflow-hidden bg-white border border-slate-200 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-10">
                    <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    
                    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:flex-row lg:items-end lg:justify-between mb-6 sm:mb-8 lg:mb-10">
                        <div className="relative">
                             <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 mb-2 sm:mb-3 text-[10px] sm:text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
                                <FileText size={10} className="sm:w-3 sm:h-3" />
                                Archives
                             </div>
                             <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">History & Logs</h3>
                             <p className="text-slate-500 text-sm sm:text-base lg:text-lg mt-1.5 sm:mt-2 max-w-xl">
                                Comprehensive audit log of all assigned daily notes. Track active assignments and expired records.
                             </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 bg-slate-50 p-2 rounded-xl sm:rounded-2xl border border-slate-100">
                            <div className="px-1 sm:px-2">
                                <label className="block mb-1 text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 tracking-wider">Filter Date</label>
                                <input 
                                    type="date" 
                                    value={filterDate} 
                                    onChange={e => setFilterDate(e.target.value)} 
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none text-slate-700 shadow-sm" 
                                />
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                            <div className="px-1 sm:px-2">
                                <label className="block mb-1 text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 tracking-wider">Filter Member</label>
                                <select 
                                    value={filterMember} 
                                    onChange={e => setFilterMember(e.target.value)} 
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none text-slate-700 min-w-[140px] sm:min-w-[180px] shadow-sm"
                                >
                                    <option value="">All Members</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                         <DailyNoteTable date={filterDate} memberId={filterMember} refreshTrigger={refreshTrigger} />
                    </div>
                </section>
            </div>
        </Layout>
    );
}
