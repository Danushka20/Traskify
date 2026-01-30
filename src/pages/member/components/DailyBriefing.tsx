import { Calendar, AlarmClockOff, Quote, Sparkles } from 'lucide-react';

interface DailyBriefingProps {
    notes: {
        id: number;
        title: string;
        content: string;
    }[];
}

export default function DailyBriefing({ notes }: DailyBriefingProps) {
    // If notes is undefined/null, treat as empty
    const safeNotes = notes || [];

    return (
        <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] bg-white p-4 sm:p-6 lg:p-10 shadow-xl shadow-indigo-100/40 border border-slate-100 mb-4 sm:mb-6 lg:mb-8">
            <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-indigo-50/50 rounded-bl-full -mr-8 sm:-mr-12 lg:-mr-16 -mt-8 sm:-mt-12 lg:-mt-16 transition-transform group-hover:scale-110 duration-700 hidden sm:block"/>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
                <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
                    <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200">
                        <Calendar size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1">
                             <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-indigo-400"></span>
                            </span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Daily Briefing</h2>
                        <p className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                            <Sparkles size={12} className="sm:w-[14px] sm:h-[14px] text-indigo-400" />
                            <span className="hidden sm:inline">Latest updates from the team</span>
                            <span className="sm:hidden">Team updates</span>
                            {safeNotes.length > 1 && <span className="text-[10px] sm:text-xs bg-indigo-100 text-indigo-700 px-1.5 sm:px-2 py-0.5 rounded-full ml-1 sm:ml-2">{safeNotes.length} notes</span>}
                        </p>
                    </div>
                </div>
            </div>

            {safeNotes.length > 0 ? (
                <div className="grid gap-4 sm:gap-6">
                    {safeNotes.map((note) => (
                        <div key={note.id} className="relative rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-indigo-50 bg-indigo-50/30 p-4 sm:p-6 lg:p-8 hover:bg-indigo-50/50 transition-colors">
                            <div className="relative">
                                <div className="absolute -left-2 sm:-left-4 -top-2 sm:-top-4 text-indigo-200/50 select-none hidden sm:block">
                                    <Quote size={60} className="lg:w-20 lg:h-20 rotate-180" />
                                </div>
                                <div className="relative sm:pl-4 space-y-2 sm:space-y-4">
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">{note.title}</h3>
                                    <div className="prose prose-indigo prose-sm max-w-none">
                                        <p className="text-sm sm:text-base leading-relaxed text-slate-600 whitespace-pre-wrap line-clamp-4 sm:line-clamp-none">{note.content}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-100 bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 sm:py-8 text-center">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white shadow-sm rounded-full flex items-center justify-center">
                            <AlarmClockOff size={24} className="sm:w-8 sm:h-8 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-base sm:text-lg font-bold text-slate-700">No active briefing</p>
                            <p className="text-xs sm:text-sm text-slate-500">You're all caught up for today!</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
