import { Calendar, History, Filter, User } from 'lucide-react';
import { clsx } from 'clsx';

type TaskFiltersProps = {
    filterDate: string;
    setFilterDate: (date: string) => void;
    showPrevious: boolean;
    setShowPrevious: (show: boolean | ((p: boolean) => boolean)) => void;
    statusFilter: string;
    setStatusFilter: (status: any) => void;
    userFilter: string;
    setUserFilter: (user: string) => void;
    users: { id: number; name: string }[];
};

export function TaskFilters({
    filterDate,
    setFilterDate,
    showPrevious,
    setShowPrevious,
    statusFilter,
    setStatusFilter,
    userFilter,
    setUserFilter,
    users
}: TaskFiltersProps) {
    return (
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between p-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">Task Overview</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-indigo-100/50 transition-all">
                    <Calendar size={14} className="sm:w-4 sm:h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="text-xs sm:text-sm font-medium bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer w-[110px] sm:w-auto"
                    />
                </div>
                
                <div className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-indigo-100/50 transition-all relative">
                    <Filter size={14} className="sm:w-4 sm:h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs sm:text-sm font-semibold bg-transparent border-none text-slate-700 focus:outline-none appearance-none pr-5 sm:pr-8 cursor-pointer relative z-10"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="late">Late</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-0 h-0 border-l-[3px] sm:border-l-[4px] border-l-transparent border-r-[3px] sm:border-r-[4px] border-r-transparent border-t-[3px] sm:border-t-[4px] border-t-slate-400" />
                    </div>
                </div>

                <div className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-indigo-100/50 transition-all relative">
                    <User size={14} className="sm:w-4 sm:h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="text-xs sm:text-sm font-semibold bg-transparent border-none text-slate-700 focus:outline-none appearance-none pr-5 sm:pr-8 cursor-pointer relative z-10 max-w-[80px] sm:max-w-none truncate"
                    >
                        <option value="">All Members</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-0 h-0 border-l-[3px] sm:border-l-[4px] border-l-transparent border-r-[3px] sm:border-r-[4px] border-r-transparent border-t-[3px] sm:border-t-[4px] border-t-slate-400" />
                    </div>
                </div>

                <button
                    onClick={() => setShowPrevious((prev: boolean) => !prev)}
                    className={clsx(
                        'flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all shadow-sm',
                        showPrevious
                            ? 'border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-indigo-100'
                            : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    )}
                >
                    <History size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{showPrevious ? 'Showing History' : 'Show History'}</span>
                    <span className="sm:hidden">History</span>
                </button>
            </div>
        </div>
    );
}
