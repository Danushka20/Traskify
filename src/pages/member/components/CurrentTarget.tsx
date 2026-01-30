import { Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

function Timer({ end }: { end: string }) {
    const calculateTimeLeft = () => {
        const diff = new Date(end).getTime() - new Date().getTime();
        if (diff <= 0) return "Time's up";
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const hrs = Math.floor((diff / (1000 * 60 * 60)));
        return `${hrs}h ${mins}m`;
    };

    const [left, setLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const interval = setInterval(() => {
            setLeft(calculateTimeLeft());
        }, 60000);
        return () => clearInterval(interval);
    }, [end]);

    return <span>{left} remaining</span>;
}

interface CurrentTargetProps {
    task?: any; // strict typing can be added later
    onMarkComplete: (taskId: number) => void;
}

export default function CurrentTarget({ task, onMarkComplete }: CurrentTargetProps) {
    if (!task) {
        return (
            <div className="rounded-xl sm:rounded-2xl lg:rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 sm:p-8 lg:p-10 text-center">
                <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold text-slate-900">All targets cleared</h3>
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-slate-500">You've completed the sequence for today. Great work!</p>
            </div>
        );
    }

    const start = new Date(task.start_time);
    const end = new Date(task.end_time);

    return (
        <section className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-indigo-100 bg-white p-4 sm:p-6 lg:p-8 shadow-xl shadow-indigo-100/50">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 h-32 sm:h-40 w-32 sm:w-40 rounded-full bg-indigo-50 blur-3xl hidden sm:block"></div>
            
            <div className="relative">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600">
                    <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    Current Locked Target
                </div>
                
                <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{task.title}</h2>
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-slate-100 px-2 sm:px-3 py-1 sm:py-1.5">
                        <Clock size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        <span className="sm:hidden">{start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    {task.status === 'pending' && (
                        <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 text-amber-700">
                            <Timer end={task.end_time} />
                        </div>
                    )}
                </div>

                <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600 line-clamp-3 sm:line-clamp-none">
                    {task.description || "No specific briefing for this target. Focus on completion."}
                </p>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:pt-8">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400">
                        <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Completing this unlocks the next target</span>
                        <span className="sm:hidden">Unlocks next target</span>
                    </div>
                    <button
                        onClick={() => onMarkComplete(task.id)}
                        className="group w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-slate-900 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-indigo-600 hover:shadow-indigo-600/30 sm:hover:-translate-y-1"
                    >
                        Mark Complete
                        <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </section>
    );
}

