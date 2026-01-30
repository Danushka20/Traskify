import { Calendar, Clock, User, History, Trash2, CheckCircle2, Circle, Mail, Folder } from 'lucide-react';
import { clsx } from 'clsx';
import type { TaskRecord } from '../../../types/task';

type AdminTaskCardProps = {
    task: TaskRecord;
    onToggleSubtask: (task: TaskRecord, index: number) => void;
    onDelete: (id: number) => void;
    onSetStatus: (task: TaskRecord, status: string) => void;
    onReassign: (id: number) => void;
};

export function AdminTaskCard({ task, onToggleSubtask, onDelete, onSetStatus, onReassign }: AdminTaskCardProps) {
    const start = new Date(task.start_time);
    const end = new Date(task.end_time);
    const statusColors: any = {
        pending: 'text-amber-600 bg-amber-50 border-amber-200/60 shadow-amber-100/50',
        completed: 'text-emerald-600 bg-emerald-50 border-emerald-200/60 shadow-emerald-100/50',
        late: 'text-rose-600 bg-rose-50 border-rose-200/60 shadow-rose-100/50',
        rejected: 'text-slate-500 bg-slate-100 border-slate-200 shadow-slate-200/50'
    };

    return (
        <div className={clsx(
            "p-4 sm:p-6 lg:p-8 transition-all bg-white border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-2xl lg:rounded-[2rem] hover:shadow-[0_40px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 group relative overflow-hidden",
            task.project ? "border-indigo-200 shadow-indigo-100/50 ring-2 sm:ring-4 ring-indigo-50/50" : "border-slate-100"
        )}>
            {/* Decorative background blob */}
            <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-bl from-indigo-50/50 to-transparent -mr-6 sm:-mr-10 -mt-6 sm:-mt-10 rounded-bl-[3rem] sm:rounded-bl-[4rem] transition-colors group-hover:from-indigo-100/50 hidden sm:block" />
            
            <div className="relative flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className={clsx('px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border shadow-sm transition-all', statusColors[task.status])}>
                            {task.status}
                        </span>
                        {task.reminder_sent && (
                            <div className="p-1 sm:p-1.5 bg-indigo-50 text-indigo-600 rounded-full" title="Reminder Sent">
                                <Mail size={14} className="sm:w-4 sm:h-4" />
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-4 border-l border-slate-100">
                            <div className="p-1 sm:p-1.5 bg-indigo-50 rounded-full text-indigo-600">
                                <User size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-700 truncate max-w-[100px] sm:max-w-none">
                                {task.user?.name || 'Unassigned'}
                            </span>
                        </div>
                    </div>
                    
                    {task.project && (
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-50 text-indigo-700 rounded-lg w-fit">
                            <Folder size={12} className="sm:w-[14px] sm:h-[14px]" />
                            <span className="text-[10px] sm:text-xs font-bold truncate max-w-[120px] sm:max-w-none">{task.project.name}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-x-2 sm:group-hover:translate-x-0 self-end sm:self-auto">
                    {task.status === 'completed' && (
                        <button
                            onClick={() => onSetStatus(task, 'rejected')}
                            title="Mark as Not Complete"
                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-50 rounded-lg sm:rounded-xl border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-colors mr-1 sm:mr-2"
                        >
                            Refuse
                        </button>
                    )}
                    <button
                        onClick={() => onReassign(task.id)}
                        title="Reassign task"
                        className="p-1.5 sm:p-2.5 transition-all rounded-lg sm:rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                        <History size={16} className="sm:w-5 sm:h-5" />
                    </button>
                    <button 
                        onClick={() => onDelete(task.id)}
                        className="p-1.5 sm:p-2.5 transition-all rounded-lg sm:rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            <div className="mb-4 sm:mb-6">
                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-900 transition-colors">
                    {task.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-500/90 whitespace-pre-wrap line-clamp-2 sm:line-clamp-none">{task.description}</p>
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
                <div className="mb-4 sm:mb-6 overflow-hidden border bg-slate-50/50 border-slate-200/60 rounded-xl sm:rounded-2xl">
                    <div className="px-3 sm:px-5 py-2 sm:py-3 border-b bg-slate-50 border-slate-200/60">
                         <h4 className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Subtasks Progress</h4>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {task.subtasks.map((s, i) => (
                            <li key={i} 
                                onClick={() => onToggleSubtask(task, i)}
                                className="flex items-center gap-3 p-4 text-sm transition-colors cursor-pointer hover:bg-white group/item"
                            >
                                <div className={clsx(
                                    "transition-colors",
                                    s.completed ? "text-emerald-500" : "text-slate-300 group-hover/item:text-indigo-400"
                                )}>
                                    {s.completed ? <CheckCircle2 size={20} className="fill-emerald-50" /> : <Circle size={20} />}
                                </div>
                                <span className={clsx(
                                    'font-medium transition-colors select-none', 
                                    s.completed ? 'line-through text-slate-400' : 'text-slate-700'
                                )}>{s.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-4 sm:pt-6 mt-auto border-t border-slate-100">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Calendar size={14} className="sm:w-4 sm:h-4 text-indigo-400" />
                    {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Clock size={14} className="sm:w-4 sm:h-4 text-indigo-400" />
                    {start.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                </div>
            </div>
        </div>
    );
}
