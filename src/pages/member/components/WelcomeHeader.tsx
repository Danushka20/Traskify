import { Sparkles } from 'lucide-react';

interface WelcomeHeaderProps {
    userName?: string;
    totalTasks: number;
    completedCount: number;
    lateCount: number;
}

export default function WelcomeHeader({ userName, totalTasks, completedCount, lateCount }: WelcomeHeaderProps) {
    return (
        <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14 text-white shadow-2xl shadow-indigo-900/40">
            <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-500/20 blur-[130px] rounded-full -mt-32 -mr-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-blue-500/10 blur-[100px] rounded-full -mb-32 -ml-32 pointer-events-none" />
            
            <div className="relative">
                <div className="flex items-center gap-2 sm:gap-3 text-indigo-200/90 mb-4 sm:mb-6">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Sparkles size={16} className="sm:w-[18px] sm:h-[18px] text-amber-300" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-200">Daily Dashboard</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">{userName?.split(' ')[0] || 'Member'}</span>
                </h1>
                
                <p className="mt-3 sm:mt-4 lg:mt-6 max-w-xl text-sm sm:text-base lg:text-lg font-light leading-relaxed text-indigo-100/80">
                    Snapshot of everything waiting for you today. Stay focused and keep projects moving.
                </p>
                
                <div className="mt-6 sm:mt-8 lg:mt-12 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
                    <div className="glass-panel px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-sm flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default">
                        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-400"></span>
                        {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                    </div>
                    <div className="glass-panel px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-sm flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default">
                        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400"></span>
                        {completedCount} done
                    </div>
                    {lateCount > 0 && (
                        <div className="glass-panel px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-200 backdrop-blur-md shadow-sm flex items-center gap-2 hover:bg-rose-500/20 transition-colors cursor-default animate-pulse">
                            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-rose-400"></span>
                            {lateCount} at-risk
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
