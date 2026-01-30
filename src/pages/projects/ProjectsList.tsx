import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getProjects, deleteProject } from '../../api/projects';
import type { Project } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../components/feedback/ConfirmDialogProvider';
import { useToast } from '../../components/feedback/ToastProvider';
import { Plus, Trash2, FolderOpen, Users, ListTodo, Calendar } from 'lucide-react';
import { ProjectCreateModal } from './ProjectCreateModal';

const ProjectsList: React.FC = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const confirm = useConfirm();
    const { addToast } = useToast();

    const loadProjects = async () => {
         try {
             // Keep loading true only on initial load if needed, but for refresh we might want silent update or subtle loading
             const data = await getProjects();
             setProjects(Array.isArray(data) ? data : []);
         } catch (err: any) {
             console.error(err);
             setProjects([]);
             setError(err.response?.data?.message || 'Failed to load projects');
         } finally {
             setLoading(false);
         }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleDeleteProject = async (e: React.MouseEvent, projectId: number, projectName: string) => {
        e.preventDefault();
        e.stopPropagation();

        const isConfirmed = await confirm({
            title: 'Delete Project',
            message: `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
            confirmText: 'Delete Project',
            tone: 'danger'
        });

        if (!isConfirmed) return;

        try {
            await deleteProject(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            addToast({ title: 'Project deleted', tone: 'success' });
        } catch (err: any) {
            addToast({ 
                title: 'Failed to delete project', 
                description: err.response?.data?.message || 'Unknown error', 
                tone: 'error' 
            });
        }
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-10 px-2 sm:px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-10 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
                        <p className="text-sm sm:text-base text-slate-500 mt-1">Manage your team projects and track progress</p>
                    </div>
                    
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center justify-center bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95"
                        >
                            <Plus size={18} className="mr-1.5 sm:mr-2" /> New Project
                        </button>
                    )}
                </div>

                {isCreateModalOpen && (
                    <ProjectCreateModal 
                        onClose={() => setIsCreateModalOpen(false)} 
                        onProjectCreated={loadProjects} 
                    />
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
                        <span className="font-medium mr-2">Error:</span> {error}
                    </div>
                )}

                {projects.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 lg:py-20 bg-slate-50/50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="bg-white p-3 sm:p-4 rounded-full shadow-sm inline-block mb-3 sm:mb-4">
                            <FolderOpen size={36} className="sm:w-12 sm:h-12 text-slate-300" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">No projects found</h3>
                        <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto mb-4 sm:mb-6 px-4">You haven't been added to any projects yet. {user?.role === 'admin' && 'Create one to get started!'}</p>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-blue-600 font-medium hover:text-blue-700 hover:underline text-sm sm:text-base"
                            >
                                Create your first project &rarr;
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {projects.map(project => (
                            <Link 
                                key={project.id} 
                                to={`/projects/${project.id}`}
                                className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-3 sm:mb-4">
                                    <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 text-blue-600">
                                        <FolderOpen size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 sm:p-2 rounded-lg transition-colors z-10"
                                            title="Delete Project"
                                        >
                                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        </button>
                                    )}
                                </div>

                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{project.name}</h3>
                                <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 h-8 sm:h-10">{project.description || 'No description provided'}</p>

                                <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-500">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="flex items-center gap-1 sm:gap-1.5" title="Tasks">
                                            <ListTodo size={14} className="sm:w-4 sm:h-4" />
                                            <span>{project.tasks_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-1.5" title="Members">
                                            <Users size={14} className="sm:w-4 sm:h-4" />
                                            <span>{project.members_count || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                                        <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
                                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProjectsList;
