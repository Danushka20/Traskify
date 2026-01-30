import { format } from 'date-fns';
import type { TaskRecord } from '../../../types';
import { Clock, CheckCircle2, AlertCircle, XCircle, BellRing } from 'lucide-react';
import clsx from 'clsx';

type TaskTableProps = {
    tasks: TaskRecord[];
    onRowClick?: (task: TaskRecord) => void;
};

const TaskStatusBadge = ({ status, display_status, reminder_sent }: { status: string, display_status?: string, reminder_sent?: boolean }) => {
    let classes = 'bg-slate-100 text-slate-600';
    let icon = <Clock size={14} />;
    let text = display_status || status;

    if (status === 'completed') {
        classes = 'bg-green-100 text-green-700';
        icon = <CheckCircle2 size={14} />;
    } else if (status === 'late') {
        classes = 'bg-red-100 text-red-700';
        icon = <AlertCircle size={14} />;
        if (text === 'late') text = 'Overdue';
    } else if (status === 'rejected') {
        classes = 'bg-gray-100 text-gray-500 line-through';
        icon = <XCircle size={14} />;
    } else if (status === 'pending') {
        classes = 'bg-blue-50 text-blue-700';
    }

    return (
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${classes}`}>
                {icon}
                <span className="capitalize">{text}</span>
            </span>
            {reminder_sent && (
                <span className="text-orange-500" title="Reminder Sent">
                    <BellRing size={14} />
                </span>
            )}
        </div>
    );
};

export default function TaskTable({ tasks, onRowClick }: TaskTableProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-8 sm:py-12 text-sm text-slate-500 bg-white rounded-lg border border-slate-200">
                <p>No tasks found for the selected criteria.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-3 sm:px-4 py-2.5 sm:py-3">Task Title</th>
                        <th className="px-3 sm:px-4 py-2.5 sm:py-3 hidden sm:table-cell">Assignee</th>
                        <th className="px-3 sm:px-4 py-2.5 sm:py-3">Schedule</th>
                        <th className="px-3 sm:px-4 py-2.5 sm:py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => {
                        const start = new Date(task.start_time);
                        const end = new Date(task.end_time);

                        return (
                            <tr 
                                key={task.id} 
                                onClick={() => onRowClick?.(task)}
                                className={clsx(
                                    "hover:bg-slate-50 transition-colors cursor-pointer",
                                    { "opacity-60": task.status === 'rejected' }
                                )}
                            >
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                                    <div className="font-medium text-slate-900 text-xs sm:text-sm">{task.title}</div>
                                    {task.description && (
                                        <div className="text-slate-500 text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-xs">{task.description}</div>
                                    )}
                                    {/* Show assignee on mobile */}
                                    <div className="sm:hidden mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                                        <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[8px] font-bold">
                                            {task.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <span>{task.user?.name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 hidden sm:table-cell">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                                            {task.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-slate-700 text-xs sm:text-sm">{task.user?.name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-500">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] sm:text-xs">{format(start, 'MMM d, yyyy')}</span>
                                        <span className="text-[9px] sm:text-xs">
                                            {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                                    <TaskStatusBadge 
                                        status={task.status} 
                                        display_status={task.display_status} 
                                        reminder_sent={task.reminder_sent}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
