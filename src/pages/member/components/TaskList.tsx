import { CheckCircle2, Lock, Clock, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskListProps {
    tasks: any[];
    currentTaskId?: number;
}

export default function TaskList({ tasks, currentTaskId }: TaskListProps) {
    // We assume tasks are already sorted by time
    
    return (
         <section className="rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-7 shadow-lg shadow-slate-900/5">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-500">
                    <MoreHorizontal size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Mission Timeline</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Your sequential roadmap for the day.</p>
                </div>
            </div>

            <div className="mt-6 sm:mt-8 relative space-y-0">
                {/* Connecting Line */}
                <div className="absolute left-4 sm:left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>

                {tasks.length > 0 ? (
                    tasks.map((task) => {
                        const isCompleted = task.status === 'completed';
                        const isCurrent = task.id === currentTaskId;
                        const isLocked = !isCompleted && !isCurrent;
                        
                        // If it's the current task, we might want to just show a "You are here" indicator or repeating it. 
                        // To keep it clean, let's show all, but style them nicely.
                        
                        return (
                            <div key={task.id} className="relative pl-10 sm:pl-16 py-3 sm:py-4 first:pt-0 last:pb-0">
                                {/* Timeline Node */}
                                <div className={clsx(
                                    "absolute left-1 sm:left-3 top-5 sm:top-6 -ml-2 sm:-ml-3 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 bg-white transition-colors",
                                    isCompleted ? "border-emerald-500 text-emerald-500" :
                                    isCurrent ? "border-indigo-500 text-indigo-500 scale-110" :
                                    "border-slate-200 text-slate-300"
                                )}>
                                    {isCompleted ? <CheckCircle2 size={10} fill="currentColor" className="sm:w-3 sm:h-3 text-white" /> : 
                                     isLocked ? <Lock size={8} className="sm:w-[10px] sm:h-[10px]" /> :
                                     <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-indigo-500" />
                                    }
                                </div>

                                {/* Content Card */}
                                <div className={clsx(
                                    "group rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all",
                                    isCurrent ? "border-indigo-200 bg-indigo-50/30 shadow-sm" :
                                    isLocked ? "border-slate-100 bg-slate-50/50 opacity-60" :
                                    "border-slate-200 bg-white"
                                )}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-col min-w-0">
                                            <span className={clsx(
                                                "text-xs sm:text-sm font-semibold truncate",
                                                isLocked ? "text-slate-400" : "text-slate-900"
                                            )}>
                                                {task.title}
                                            </span>
                                            <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
                                                <Clock size={10} className="sm:w-3 sm:h-3" />
                                                {new Date(task.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        
                                        {isLocked && (
                                            <span className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
                                                <Lock size={8} className="sm:w-[10px] sm:h-[10px]" /> Locked
                                            </span>
                                        )}
                                        {isCurrent && (
                                            <span className="rounded-full bg-indigo-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex-shrink-0">
                                                Active
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="rounded-full bg-emerald-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex-shrink-0">
                                                Done
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-slate-500 py-6 sm:py-8 text-sm">
                        No targets scheduled for today.
                    </div>
                )}
            </div>
        </section>
    );
}
