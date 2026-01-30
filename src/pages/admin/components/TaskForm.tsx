import { useState, useEffect } from 'react';
import { Plus, User, Calendar, Clock, CheckSquare, Folder } from 'lucide-react';
import { hours, minutes, periods, to24Hour } from '../../../utils/time';
import { clsx } from 'clsx';
import { getProjects } from '../../../api/projects';
import type { Project } from '../../../api/projects';

type TaskFormProps = {
    users: { id: number; name: string }[];
    isSubmitting: boolean;
    onSubmit: (data: any) => Promise<void>;
};

export function TaskForm({ users, isSubmitting, onSubmit }: TaskFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subtasks, setSubtasks] = useState<Array<{ title: string }>>([]);
    const [assignedUser, setAssignedUser] = useState('');
    const [assignedProject, setAssignedProject] = useState('');
    const [date, setDate] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error('Failed to load projects', error);
            }
        };
        loadProjects();
    }, []);
    
    // Time Selection State
    const [startHour, setStartHour] = useState('09');
    const [startMinute, setStartMinute] = useState('00');
    const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
    
    const [endHour, setEndHour] = useState('05');
    const [endMinute, setEndMinute] = useState('00');
    const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('PM');

    // Filter users based on selected project
    const selectedProject = assignedProject ? projects.find(p => p.id === parseInt(assignedProject)) : null;

    const filteredUsers = selectedProject 
        ? (selectedProject.members || []).filter(member => member.id !== selectedProject.owner_id)
        : users;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const startTimeStr = `${date}T${to24Hour(startHour, startPeriod)}:${startMinute}:00`;
        const endTimeStr = `${date}T${to24Hour(endHour, endPeriod)}:${endMinute}:00`;

        await onSubmit({
            title,
            description,
            subtasks: subtasks.length ? subtasks.map(s => ({ title: s.title, completed: false })) : undefined,
            user_id: parseInt(assignedUser),
            project_id: assignedProject ? parseInt(assignedProject) : null,
            start_time: startTimeStr,
            end_time: endTimeStr,
        });

        // Reset form
        setTitle('');
        setDescription('');
        setSubtasks([]);
        setAssignedUser('');
        setAssignedProject('');
        setDate('');
    };

    const addSubtaskField = () => setSubtasks(prev => [...prev, { title: '' }]);
    const updateSubtaskField = (index: number, value: string) => setSubtasks(prev => prev.map((s, i) => i === index ? { title: value } : s));
    const removeSubtaskField = (index: number) => setSubtasks(prev => prev.filter((_, i) => i !== index));

    return (
        <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-xl sm:rounded-2xl lg:rounded-[2rem]">
                <div className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-white/5 rounded-bl-full -mr-4 sm:-mr-8 -mt-4 sm:-mt-8 hidden sm:block"/>
                    <h2 className="relative flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold">
                        <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg sm:rounded-xl">
                            <Plus className="text-white" size={16} />
                        </div>
                        New Assignment
                    </h2>
                </div>
                
                <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Task Details</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-slate-800 transition-all bg-slate-50 border-2 border-transparent rounded-lg sm:rounded-xl focus:bg-white focus:border-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
                                placeholder="Enter task title"
                                required 
                            />
                        </div>
                        
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all bg-slate-50 border-2 border-transparent rounded-lg sm:rounded-xl focus:bg-white focus:border-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-[80px] sm:min-h-[100px] resize-none placeholder:text-slate-400"
                            placeholder="Add description and requirements..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                             <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Subtasks</label>
                             <button type="button" onClick={addSubtaskField} className="text-[10px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">+ Add Item</button>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            {subtasks.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                    <div className="flex-1 relative">
                                        <CheckSquare size={14} className="sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input 
                                            value={s.title} 
                                            onChange={e => updateSubtaskField(idx, e.target.value)} 
                                            placeholder="Subtask item" 
                                            className="w-full pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all" 
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeSubtaskField(idx)} className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Plus size={14} className="sm:w-4 sm:h-4 rotate-45" />
                                    </button>
                                </div>
                            ))}
                            {subtasks.length === 0 && (
                                <div className="text-center py-3 sm:py-4 border-2 border-dashed border-slate-100 rounded-lg sm:rounded-xl text-slate-400 text-[10px] sm:text-xs cursor-pointer hover:border-indigo-100 hover:text-indigo-400 transition-colors" onClick={addSubtaskField}>
                                    No subtasks added
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <div>
                             <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Assignment</label>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="relative group">
                                    <Folder className="absolute -translate-y-1/2 left-3 sm:left-4 top-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                                    <select 
                                        value={assignedProject} 
                                        onChange={e => {
                                            setAssignedProject(e.target.value);
                                            setAssignedUser('');
                                        }}
                                        className="w-full py-2.5 sm:py-3 pl-9 sm:pl-12 pr-3 sm:pr-4 text-xs sm:text-sm font-semibold transition-all bg-white border border-slate-200 appearance-none rounded-lg sm:rounded-xl hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 cursor-pointer"
                                    >
                                        <option value="">No Project (General Task)</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <div className="w-0 h-0 border-l-[4px] sm:border-l-[5px] border-l-transparent border-r-[4px] sm:border-r-[5px] border-r-transparent border-t-[4px] sm:border-t-[5px] border-t-slate-400" />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <User className="absolute -translate-y-1/2 left-3 sm:left-4 top-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                                    <select 
                                        value={assignedUser} 
                                        onChange={e => setAssignedUser(e.target.value)} 
                                        className="w-full py-2.5 sm:py-3 pl-9 sm:pl-12 pr-3 sm:pr-4 text-xs sm:text-sm font-semibold transition-all bg-white border border-slate-200 appearance-none rounded-lg sm:rounded-xl hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 cursor-pointer"
                                        required
                                    >
                                        <option value="">Select Team Member</option>
                                        {filteredUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <div className="w-0 h-0 border-l-[4px] sm:border-l-[5px] border-l-transparent border-r-[4px] sm:border-r-[5px] border-r-transparent border-t-[4px] sm:border-t-[5px] border-t-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                             <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Schedule</label>
                            <div className="relative group mb-3 sm:mb-4">
                                <Calendar className="absolute -translate-y-1/2 left-3 sm:left-4 top-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={e => setDate(e.target.value)} 
                                    className="w-full py-2.5 sm:py-3 pl-9 sm:pl-12 pr-3 sm:pr-4 text-xs sm:text-sm font-semibold transition-all bg-white border border-slate-200 rounded-lg sm:rounded-xl hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 cursor-pointer"
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <div className="p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-100">
                                    <label className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">
                                        <Clock size={10} className="sm:w-3 sm:h-3" /> Start Time
                                    </label>
                                    <div className="flex gap-0.5 sm:gap-1">
                                        <select value={startHour} onChange={e => setStartHour(e.target.value)} className="bg-white flex-1 p-1 text-[10px] sm:text-xs font-bold border border-slate-200 rounded-md sm:rounded-lg focus:border-indigo-500 focus:outline-none">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                        <select value={startMinute} onChange={e => setStartMinute(e.target.value)} className="bg-white flex-1 p-1 text-[10px] sm:text-xs font-bold border border-slate-200 rounded-md sm:rounded-lg focus:border-indigo-500 focus:outline-none">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                        <select value={startPeriod} onChange={e => setStartPeriod(e.target.value as any)} className="bg-white flex-1 p-1 text-[10px] sm:text-xs font-bold border border-slate-200 rounded-md sm:rounded-lg focus:border-indigo-500 focus:outline-none">{periods.map(p => <option key={p} value={p}>{p}</option>)}</select>
                                    </div>
                                </div>

                                <div className="p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-100">
                                    <label className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">
                                        <Clock size={10} className="sm:w-3 sm:h-3" /> End Time
                                    </label>
                                    <div className="flex gap-0.5 sm:gap-1">
                                        <select value={endHour} onChange={e => setEndHour(e.target.value)} className="bg-white flex-1 p-1 text-[10px] sm:text-xs font-bold border border-slate-200 rounded-md sm:rounded-lg focus:border-indigo-500 focus:outline-none">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                        <select value={endMinute} onChange={e => setEndMinute(e.target.value)} className="bg-white flex-1 p-1 text-[10px] sm:text-xs font-bold border border-slate-200 rounded-md sm:rounded-lg focus:border-indigo-500 focus:outline-none">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                        <select value={endPeriod} onChange={e => setEndPeriod(e.target.value as any)} className="bg-white flex-1 p-1 text-[10px] sm:text-xs font-bold border border-slate-200 rounded-md sm:rounded-lg focus:border-indigo-500 focus:outline-none">{periods.map(p => <option key={p} value={p}>{p}</option>)}</select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={clsx(
                            "w-full py-3 sm:py-4 mt-2 sm:mt-4 text-sm sm:text-base font-bold text-white transition-all shadow-lg rounded-lg sm:rounded-xl flex items-center justify-center gap-2",
                            isSubmitting 
                                ? "bg-slate-400 shadow-none cursor-not-allowed" 
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98]"
                        )}
                    >
                        {isSubmitting ? (
                            <>Creating...</> 
                        ) : (
                            <>
                                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={3} />
                                Create Assignment
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
