import { Clock, CheckSquare, AlertOctagon } from 'lucide-react';

interface StatsCardsProps {
    pendingCount: number;
    completedCount: number;
    lateCount: number;
}

export default function StatsCards({ pendingCount, completedCount, lateCount }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl sm:rounded-[2rem] border border-amber-100 bg-white p-4 sm:p-6 lg:p-8 shadow-xl shadow-amber-100/50 hover:shadow-2xl hover:shadow-amber-100/70 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-50 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 opacity-50 group-hover:scale-110 transition-transform"/>
                <div className="relative flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50 text-amber-600">
                                <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
                             </div>
                             <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600/80">Pending</p>
                        </div>
                        <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">{pendingCount}</p>
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-slate-400">Waiting on confirmation</p>
                    </div>
                </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl sm:rounded-[2rem] border border-emerald-100 bg-white p-4 sm:p-6 lg:p-8 shadow-xl shadow-emerald-100/50 hover:shadow-2xl hover:shadow-emerald-100/70 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-emerald-50 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 opacity-50 group-hover:scale-110 transition-transform"/>
                <div className="relative flex justify-between items-start">
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
                             </div>
                             <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600/80">Completed</p>
                        </div>
                        <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">{completedCount}</p>
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-slate-400">Wins today</p>
                    </div>
                </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl sm:rounded-[2rem] border border-rose-100 bg-white p-4 sm:p-6 lg:p-8 shadow-xl shadow-rose-100/50 hover:shadow-2xl hover:shadow-rose-100/70 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-rose-50 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 opacity-50 group-hover:scale-110 transition-transform"/>
                <div className="relative flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="p-1.5 sm:p-2 rounded-lg bg-rose-50 text-rose-600">
                                <AlertOctagon size={16} className="sm:w-[18px] sm:h-[18px]" />
                             </div>
                             <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600/80">At Risk</p>
                        </div>
                         <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">{lateCount}</p>
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-slate-400">Review first</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
