import React from 'react';
import type { Project, ProjectStats } from '../../../api/projects';
import { LayoutDashboard, Users, Trash2, CheckCircle } from 'lucide-react';

interface ProjectHeaderProps {
    project: Project;
    stats: ProjectStats | null;
    isOwner: boolean;
    onDeleteProject: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, stats, isOwner, onDeleteProject }) => {
    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
                <LayoutDashboard size={200} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6">
                <div className="max-w-3xl">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-2 sm:mb-3">{project.name}</h1>
                    <p className="text-sm sm:text-base lg:text-lg text-slate-500 leading-relaxed">{project.description || "No description provided."}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 text-slate-600">
                            <div className="bg-slate-100 p-1.5 sm:p-2 rounded-lg">
                                <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </div>
                            <span className="text-sm sm:text-base font-medium">{project.members?.length || 0} Members</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <div className="bg-slate-100 p-1.5 sm:p-2 rounded-lg">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-400"></div> 
                            </div>
                            <span className="text-sm sm:text-base font-medium">Owner: {project.owner?.name}</span>
                        </div>
                    </div>
                </div>

                {isOwner && (
                    <button 
                        onClick={onDeleteProject}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-red-50 text-red-600 rounded-lg sm:rounded-xl hover:bg-red-100 transition-colors font-medium"
                    >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">Delete Project</span>
                        <span className="sm:hidden">Delete</span>
                    </button>
                )}
            </div>

            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8 lg:mt-10">
                    <div className="bg-blue-50/50 border border-blue-100 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="text-blue-600 text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide">Total Tasks</div>
                            <LayoutDashboard size={16} className="text-blue-400 sm:w-5 sm:h-5" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total_tasks}</div>
                    </div>
                    <div className="bg-green-50/50 border border-green-100 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="text-green-600 text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide">Completed</div>
                            <CheckCircle size={16} className="text-green-500 sm:w-5 sm:h-5" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.completed_tasks}</div>
                    </div>
                    <div className="bg-purple-50/50 border border-purple-100 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="text-purple-600 text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide">Progress</div>
                            <span className="text-xs sm:text-sm font-bold text-purple-700">{stats.progress}%</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2 sm:h-2.5 mt-1 sm:mt-2">
                            <div 
                                className="bg-purple-600 h-2 sm:h-2.5 rounded-full transition-all duration-500" 
                                style={{ width: `${stats.progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectHeader;
