import { Sparkles, Users, BarChart3 } from 'lucide-react';

type DashboardHeroProps = {
    totalTasks: number;
    completionRate: number;
    lastUpdatedLabel: string;
};

export function DashboardHero({ totalTasks, completionRate, lastUpdatedLabel }: DashboardHeroProps) {
    return (
        <section className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14 text-white shadow-[0_40px_80px_-40px_rgba(15,23,42,0.7)]">
            <div className="absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-indigo-500/30 blur-[120px] hidden sm:block" />
            <div className="absolute flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium right-3 sm:right-6 top-3 sm:top-6 rounded-xl sm:rounded-2xl bg-white/10 text-slate-200 border border-white/5 backdrop-blur-md">
                <Sparkles size={14} className="sm:w-[18px] sm:h-[18px] text-emerald-300" />
                <span className="hidden sm:inline">Admin Control Center</span>
                <span className="sm:hidden">Admin</span>
            </div>
            <div className="relative">
                <p className="text-[10px] sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-200/80">Team overview</p>
                <h1 className="mt-3 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-sm">Welcome, Admin</h1>
                <p className="max-w-2xl mt-2 sm:mt-4 text-xs sm:text-base font-light text-indigo-100/90">
                    Monitor workstreams, unlock blockers, and keep momentum across every team. These metrics refresh every minute.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-6 sm:mt-10 text-xs sm:text-sm text-indigo-200/90">
                    <span className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 font-medium border rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm shadow-sm"><Users size={14} className="sm:w-4 sm:h-4 text-blue-300"/> {totalTasks} tasks</span>
                    <span className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 font-medium border rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm shadow-sm"><BarChart3 size={14} className="sm:w-4 sm:h-4 text-blue-300"/> {completionRate}%</span>
                    <span className="px-3 sm:px-5 py-1.5 sm:py-2.5 font-medium border rounded-full border-white/10 bg-white/5 backdrop-blur-sm shadow-sm flex items-center gap-1.5 sm:gap-2"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse"></div> <span className="hidden sm:inline">Live:</span> {lastUpdatedLabel}</span>
                </div>
            </div>
        </section>
    );
}
