import { Clock, Lock, CheckCircle2, Folder } from 'lucide-react';
import { clsx } from 'clsx';
import Countdown from './Countdown';

type MemberTaskCardProps = {
    task: any;
    isCurrent: boolean;
    isLocked: boolean;
    onOpenModal: (task: any) => void;
    onToggleSubtask: (task: any, index: number) => void;
    onShowToast: (msg: any) => void;
};

export function MemberTaskCard({ task, isCurrent, isLocked, onOpenModal, onToggleSubtask, onShowToast }: MemberTaskCardProps) {
    const start = new Date(task.start_time);
    const end = new Date(task.end_time);
    const isCompleted = task.status === 'completed';

    // Format date efficiently
    const today = new Date();
    const isToday = start.getDate() === today.getDate() && 
                    start.getMonth() === today.getMonth() && 
                    start.getFullYear() === today.getFullYear();
    const dateLabel = isToday ? 'Today' : start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    
    const statusStyles: any = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        late: 'bg-rose-50 text-rose-700 border-rose-200',
        reassigned: 'bg-purple-50 text-purple-700 border-purple-200',
        rejected: 'bg-red-50 text-red-700 border-red-200'
    };

    return (
        <div className={clsx(
            'group relative p-4 sm:p-6 lg:p-8 transition-all duration-300 rounded-xl sm:rounded-2xl lg:rounded-[2rem] border overflow-hidden',
            isCurrent ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100/50 sm:scale-[1.02]' : 'bg-white border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200',
            isLocked ? 'opacity-70 pointer-events-none grayscale-[0.5]' : '',
            isCompleted ? 'bg-emerald-50/10 border-emerald-100/50' : ''
        )}>
             {/* Decorative blob */}
             <div className={clsx(
                "absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 transition-colors hidden sm:block",
                isCurrent ? "bg-indigo-50/50" : "bg-slate-50/50",
                isCompleted ? "bg-emerald-50/50" : ""
            )} />

            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <span className={clsx(
                            'text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border uppercase tracking-wider', 
                            statusStyles[task.status] || 'bg-gray-100',
                            isCurrent && !isLocked ? 'border-indigo-200 text-indigo-700 bg-indigo-50 shadow-sm' : '',
                            isLocked ? 'border-slate-200 text-slate-400 bg-slate-50' : '',
                            isCompleted ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : ''
                        )}>
                            {isLocked ? 'Locked' : (isCurrent ? 'Current Focus' : (task.display_status || task.status))}
                        </span>

                        {task.project && (
                            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-indigo-100">
                                <Folder size={10} className="sm:w-3 sm:h-3 text-indigo-500" />
                                <span className="truncate max-w-[80px] sm:max-w-none">{task.project.name}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-slate-500 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                            <Clock size={12} className="sm:w-[14px] sm:h-[14px] text-slate-400" />
                            <span className="hidden sm:inline">
                                <span className="font-semibold text-slate-700 mr-1">{dateLabel}</span>
                                {start.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                            </span>
                            <span className="sm:hidden text-[10px]">
                                {start.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                            </span>
                        </div>

                        {task.status === 'pending' && isCurrent && (
                             <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                                <Countdown end={task.end_time} />
                             </div>
                        )}
                        
                        {isLocked && <Lock size={14} className="sm:w-4 sm:h-4 ml-1 text-slate-300" />}
                        {isCompleted && <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px] ml-1 text-emerald-500 drop-shadow-sm" />}
                    </div>

                    <h3 
                        onClick={() => !isLocked && onOpenModal(task)} 
                        className={clsx(
                            "mb-2 sm:mb-3 text-base sm:text-lg lg:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700",
                            !isLocked && "cursor-pointer hover:from-indigo-600 hover:to-indigo-500 transition-all"
                        )}
                    >
                        {task.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-medium max-w-2xl line-clamp-2 sm:line-clamp-none">{task.description}</p>
                    
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-100/80">
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Subtasks</p>
                            <ul className="space-y-3">
                                {task.subtasks.map((s: any, i: number) => (
                                    <li key={i} className="flex items-start gap-4 group/sub">
                                        <div className="relative flex items-center pt-0.5">
                                            <input 
                                                type="checkbox" 
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 bg-white checked:border-indigo-500 checked:bg-indigo-500 transition-all hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                checked={!!s.completed} 
                                                onChange={() => onToggleSubtask(task, i)} 
                                            />
                                            <CheckCircle2 size={12} className="pointer-events-none absolute left-1 top-1.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                        </div>
                                        <span className={clsx(
                                            'text-sm transition-all duration-300', 
                                            s.completed ? 'line-through text-slate-400 decoration-slate-300' : 'text-slate-600 group-hover/sub:text-slate-900'
                                        )}>
                                            {s.title}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {(task.status === 'pending' || task.status === 'late' || task.status === 'reassigned' || task.status === 'rejected') && (
                    <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[180px]">
                        {isCurrent && (
                            <button 
                                onClick={() => {
                                    if (isLocked) {
                                        onShowToast({ tone: 'info', title: 'Task locked', description: 'Finish your previous late tasks first.' });
                                        return;
                                    }
                                    onOpenModal(task);
                                }}
                                disabled={isLocked}
                                className={clsx(
                                    "px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-bold rounded-lg sm:rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2",
                                    isLocked 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                                        : (task.status === 'late' || task.status === 'rejected' 
                                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-200 hover:shadow-rose-300 hover:from-rose-600 hover:to-rose-700' 
                                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-blue-700')
                                )}
                            >
                                {task.status === 'rejected' ? 'Fix & Complete' : 'Mark Complete'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
