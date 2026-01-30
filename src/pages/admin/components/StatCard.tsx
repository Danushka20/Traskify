import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
    icon: LucideIcon;
    label: string;
    value: string | number;
    accent: string;
    highlight: string;
    progress: number;
};

export function StatCard({ icon: Icon, label, value, accent, highlight, progress }: StatCardProps) {
    return (
        <div className="relative p-4 sm:p-6 lg:p-8 overflow-hidden bg-white border border-slate-100/80 shadow-xl shadow-slate-200/50 rounded-xl sm:rounded-2xl lg:rounded-[2rem] hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -mr-6 sm:-mr-10 -mt-6 sm:-mt-10 transition-transform group-hover:scale-110 hidden sm:block" />
            
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 mb-1">{label}</p>
                    <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3 mt-2">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">{value}</span>
                        <span className={`text-[10px] sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-opacity-10 ${accent.replace('text-', 'bg-')} ${accent}`}>{highlight}</span>
                    </div>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl ${accent.replace('text-', 'bg-').replace('600', '50')} ${accent} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
            </div>
            <div className="h-2 sm:h-2.5 mt-4 sm:mt-6 lg:mt-8 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className={`h-full rounded-full ${accent.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
                    style={{
                        width: `${(() => {
                            const clamped = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 100) : 0;
                            if (clamped === 0) return 0;
                            return Math.max(clamped, 6);
                        })()}%`
                    }}
                />
            </div>
        </div>
    );
}
