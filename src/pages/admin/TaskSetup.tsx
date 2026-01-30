import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Upload, 
    Users, 
    Plus, 
    Trash2, 
    Save, 
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { clsx } from 'clsx';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, setWeek, setYear } from 'date-fns';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
};

type TaskInput = {
    title: string;
    start_time: string;
    end_time: string;
    subtasks: { title: string; completed: boolean }[];
};

type DayPlan = {
    date: string;
    tasks: TaskInput[];
};

export default function TaskSetup() {
    const [members, setMembers] = useState<User[]>([]);
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        generateWeekPlan();
    }, [selectedWeek]);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/users');
            setMembers(res.data.filter((u: User) => u.role === 'member'));
        } catch (error) {
            console.error('Failed to fetch members', error);
        }
    };

    const generateWeekPlan = () => {
        const start = startOfWeek(new Date(selectedWeek), { weekStartsOn: 1 });
        const end = endOfWeek(new Date(selectedWeek), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });
        
        const plan: DayPlan[] = days.map(day => ({
            date: format(day, 'yyyy-MM-dd'),
            tasks: []
        }));
        setWeeklyPlan(plan);
    };

    const addTaskToDay = (date: string) => {
        setWeeklyPlan(prev => prev.map(day => {
            if (day.date === date) {
                return {
                    ...day,
                    tasks: [...day.tasks, { title: '', start_time: '09:00', end_time: '17:00', subtasks: [] }]
                };
            }
            return day;
        }));
    };

    const removeTaskFromDay = (date: string, index: number) => {
        setWeeklyPlan(prev => prev.map(day => {
            if (day.date === date) {
                const newTasks = [...day.tasks];
                newTasks.splice(index, 1);
                return { ...day, tasks: newTasks };
            }
            return day;
        }));
    };

    const updateTask = (date: string, index: number, field: keyof TaskInput, value: any) => {
        setWeeklyPlan(prev => prev.map(day => {
            if (day.date === date) {
                const newTasks = [...day.tasks];
                newTasks[index] = { ...newTasks[index], [field]: value };
                return { ...day, tasks: newTasks };
            }
            return day;
        }));
    };

    const handleSavePlan = async () => {
        if (!selectedMember) {
            setStatus({ type: 'error', message: 'Please select a member' });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            const allTasksToCreate = weeklyPlan.flatMap(day => 
                day.tasks.filter(t => t.title.trim() !== '').map(t => ({
                    ...t,
                    user_id: selectedMember,
                    date: day.date
                }))
            );

            if (allTasksToCreate.length === 0) {
                setStatus({ type: 'error', message: 'No tasks to save' });
                setIsLoading(false);
                return;
            }

            await api.post('/tasks/import', { tasks: allTasksToCreate });
            setStatus({ type: 'success', message: 'Weekly plan saved successfully!' });
            // Optionally clear or keep?
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to save weekly plan' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newTasks: any[] = [];
            
            // Expected CSV: Date,Title,Start,End,MemberEmail
            // 2026-01-26,Morning Standup,09:00,09:30,member@example.com
            
            lines.slice(1).forEach(line => {
                const parts = line.split(',');
                const date = parts[0];
                const title = parts[1];
                const start = parts[2];
                const end = parts[3];
                
                if (date && title && start && end) {
                    newTasks.push({ date: date.trim(), title: title.trim(), start_time: start.trim(), end_time: end.trim() });
                }
            });

            // Update weekly plan with CSV data
            setWeeklyPlan(prev => prev.map(day => {
                const tasksForDay = newTasks.filter(t => t.date === day.date);
                return {
                    ...day,
                    tasks: [...day.tasks, ...tasksForDay]
                };
            }));
        };
        reader.readAsText(file);
    };

    const handleDownloadTemplate = () => {
        const headers = 'Date,Title,Start,End\n';
        const sampleLine = `${format(new Date(), 'yyyy-MM-dd')},Sample Task,09:00,10:00\n`;
        const blob = new Blob([headers + sampleLine], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task_template.csv';
        a.click();
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                <header className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Task Setup & Weekly Planning</h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-500">Configure targets and bulk upload tasks for members</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <label className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors bg-white border cursor-pointer rounded-lg sm:rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                            <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <span className="hidden sm:inline">Bulk CSV Import</span>
                            <span className="sm:hidden">Import CSV</span>
                            <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                        </label>
                        <button
                            onClick={handleSavePlan}
                            disabled={isLoading || !selectedMember}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-all bg-sky-600 rounded-lg sm:rounded-xl hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-900/20"
                        >
                            <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                            {isLoading ? 'Saving...' : 'Deploy Plan'}
                        </button>
                    </div>
                </header>

                {status && (
                    <div className={clsx(
                        "p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 border text-sm",
                        status.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                    )}>
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <p className="font-medium">{status.message}</p>
                    </div>
                )}

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
                    <div className="p-4 sm:p-6 bg-white border shadow-sm rounded-xl sm:rounded-2xl border-slate-200">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Users size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800">1. Select Member</h2>
                        </div>
                        <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base transition-shadow border-slate-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-sky-500/10"
                        >
                            <option value="">Choose a team member...</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 sm:p-6 bg-white border shadow-sm rounded-xl sm:rounded-2xl border-slate-200">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <Calendar size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800">2. Select Week</h2>
                        </div>
                        <input
                            type="week"
                            value={format(new Date(selectedWeek), "yyyy-'W'II")}
                            onChange={(e) => {
                                if (!e.target.value) return;
                                const [year, week] = e.target.value.split('-W');
                                let date = new Date(parseInt(year), 0, 1);
                                date = setYear(date, parseInt(year));
                                date = setWeek(date, parseInt(week), { weekStartsOn: 1 });
                                const monday = startOfWeek(date, { weekStartsOn: 1 });
                                setSelectedWeek(format(monday, 'yyyy-MM-dd'));
                            }}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base transition-shadow border-slate-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-sky-500/10"
                        />
                    </div>

                    <div className="p-4 sm:p-6 bg-white border shadow-sm rounded-xl sm:rounded-2xl border-slate-200 sm:col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FileSpreadsheet size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800">3. Quick Config</h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">You can also import a CSV for bulk setup across different members.</p>
                        <button 
                            onClick={handleDownloadTemplate}
                            className="w-full py-2 text-xs sm:text-sm font-medium text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors"
                        >
                            Download Template
                        </button>
                    </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Plus className="text-sky-500" size={18} />
                        Daily Targets Setup
                    </h2>
                    
                    <div className="overflow-x-auto pb-4">
                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-7 min-w-[900px] lg:min-w-0">
                            {weeklyPlan.map((day) => (
                                <div key={day.date} className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 border bg-slate-50/50 rounded-xl sm:rounded-2xl border-slate-200 min-h-[300px] sm:min-h-[400px] min-w-[120px]">
                                    <div className="text-center">
                                        <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-wide sm:tracking-wider">{format(new Date(day.date), 'EEE')}</p>
                                        <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-800">{format(new Date(day.date), 'MMM d')}</p>
                                    </div>
                                    
                                    <div className="flex-1 space-y-2 sm:space-y-3">
                                        {day.tasks.map((task, tIdx) => (
                                            <div key={tIdx} className="p-2 sm:p-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm space-y-1.5 sm:space-y-2 group">
                                                <div className="flex justify-between">
                                                     <input 
                                                        placeholder="Task title..."
                                                        className="w-full text-xs sm:text-sm font-semibold border-none p-0 focus:ring-0 placeholder:text-slate-300"
                                                        value={task.title}
                                                        onChange={(e) => updateTask(day.date, tIdx, 'title', e.target.value)}
                                                    />
                                                    <button 
                                                        onClick={() => removeTaskFromDay(day.date, tIdx)}
                                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[9px] sm:text-[10px]">
                                                    <input 
                                                        type="time" 
                                                        value={task.start_time}
                                                        onChange={(e) => updateTask(day.date, tIdx, 'start_time', e.target.value)}
                                                        className="p-0.5 sm:p-1 border-slate-100 rounded focus:ring-sky-500/10"
                                                    />
                                                    <input 
                                                        type="time" 
                                                        value={task.end_time}
                                                        onChange={(e) => updateTask(day.date, tIdx, 'end_time', e.target.value)}
                                                        className="p-0.5 sm:p-1 border-slate-100 rounded focus:ring-sky-500/10"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <button 
                                            onClick={() => addTaskToDay(day.date)}
                                            className="w-full py-1.5 sm:py-2 border-2 border-dashed border-slate-200 rounded-lg sm:rounded-xl text-slate-400 hover:border-sky-300 hover:text-sky-500 hover:bg-white transition-all text-[10px] sm:text-xs lg:text-sm flex items-center justify-center gap-1"
                                        >
                                            <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                                            Add Target
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

