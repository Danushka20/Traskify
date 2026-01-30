import React from 'react';
import { Clock, Calendar, CheckCircle } from 'lucide-react';
import type { Project } from '../../../api/projects';

interface ProjectTasksProps {
    tasks: Project['tasks'];
    selectedDate: string;
    onDateChange: (date: string) => void;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ tasks, selectedDate, onDateChange }) => {
    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    return (
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] sm:min-h-[500px]">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={16} className="text-slate-400 sm:w-[18px] sm:h-[18px]" />
                        <span>Daily Tasks</span>
                        <span className="text-[10px] sm:text-xs font-normal text-slate-500 ml-1">({isToday ? 'Today' : selectedDate})</span>
                    </h3>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200 shadow-sm self-start sm:self-auto">
                        <Calendar size={12} className="text-slate-500 sm:w-3.5 sm:h-3.5" />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="text-xs sm:text-sm text-slate-700 focus:outline-none bg-transparent border-none p-0 cursor-pointer font-medium"
                        />
                    </div>
                </div>
                
                {tasks && tasks.length > 0 ? (
                    <ul className="divide-y divide-slate-50">
                        {tasks.map(task => (
                            <li key={task.id} className="p-4 sm:p-6 hover:bg-slate-50/80 transition-colors group">
                                <div className="flex items-start gap-2 sm:gap-4">
                                    <div className={`mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.status === 'completed' ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-300'}`}>
                                        {task.status === 'completed' && <CheckCircle size={10} strokeWidth={3} className="sm:w-3 sm:h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1 sm:gap-0">
                                            <h4 className={`text-sm sm:text-base font-semibold text-slate-900 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                                                {task.title}
                                            </h4>
                                            <span className={`self-start text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border ${
                                                task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                                                task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                                            {task.user && (
                                                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 bg-slate-100 pl-0.5 sm:pl-1 pr-2 sm:pr-2.5 py-0.5 sm:py-1 rounded-full border border-slate-200/60">
                                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-300 flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-slate-600">
                                                        {task.user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium">{task.user.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
                        <div className="bg-slate-50 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                            <CheckCircle size={24} className="text-slate-300 sm:w-8 sm:h-8" />
                        </div>
                        <h4 className="text-sm sm:text-base text-slate-900 font-medium mb-1">No tasks for this day</h4>
                        <p className="text-slate-500 text-xs sm:text-sm max-w-xs px-4">
                           Tasks assigned to you or updated on this date will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectTasks;
