import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getProject, addProjectMember, removeProjectMember, deleteProject } from '../../api/projects';
import type { Project, ProjectStats } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../components/feedback/ConfirmDialogProvider';
import { useToast } from '../../components/feedback/ToastProvider';
import { ArrowLeft } from 'lucide-react';
import getEcho from '../../realtime/echo';
import EfficiencyChart from './components/EfficiencyChart';
import ProjectHeader from './components/ProjectHeader';
import ProjectMembers from './components/ProjectMembers';
import ProjectTasks from './components/ProjectTasks';
import api from '../../api/axios';

const ProjectDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const confirm = useConfirm();
    const { addToast } = useToast();
    const [project, setProject] = useState<Project | null>(null);
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Add Member State
    const [availableUsers, setAvailableUsers] = useState<{ id: number; name: string; email: string }[]>([]);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchProjectAndUsers = async () => {
        try {
            setLoading(true);
            if (!id) return;
            const [projectData, usersData] = await Promise.all([
                getProject(id, selectedDate),
                api.get('/users').then(res => res.data)
            ]);
            
            setProject(projectData?.project);
            setStats(projectData?.stats);
            setAvailableUsers(Array.isArray(usersData) ? usersData : []);
        } catch (err: any) {
            console.error(err);
            setAvailableUsers([]);
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectAndUsers();

        // Realtime subscription
        let channel: any;
        const setupRealtime = async () => {
             if (!id) return;
             const echo = await getEcho();
             if (!echo) return;

             channel = echo.private(`projects.${id}`);
             
             channel.listen('ProjectMemberRemoved', (e: { userId: number }) => {
                 // Check if current user is the one removed
                 if (user && String(e.userId) === String(user.id)) {
                     addToast({ title: 'You have been removed from this project', tone: 'error' });
                     navigate('/projects');
                     return;
                 }

                 // Otherwise update local state
                 setProject(prev => {
                     if (!prev) return null;
                     return {
                         ...prev,
                         members: prev.members?.filter(m => m.id != e.userId)
                     };
                 });
             })
             .listen('ProjectDeleted', () => {
                 addToast({ title: 'This project has been deleted', tone: 'error' });
                 navigate('/projects');
             });
        };

        setupRealtime();

        return () => {
             if (channel) {
                 channel.stopListening('ProjectMemberRemoved');
                 channel.stopListening('ProjectDeleted');
             }
        };
    }, [id, user, selectedDate]);

    const handleInviteMember = async (email: string) => {
        if (!id || !email) return;
        
        setInviteLoading(true);
        setInviteMessage(null);

        try {
            await addProjectMember(id, email);
            setInviteMessage({ type: 'success', text: `Invitation sent to ${email}` });
            
            // Refresh project to update member list
            const updatedProject = await getProject(id, selectedDate);
            setProject(updatedProject.project);
            setStats(updatedProject.stats);
        } catch (err: any) {
             setInviteMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Failed to add member' 
            });
            throw err;
        } finally {
            setInviteLoading(false);
        }
    };

    if (loading) return <Layout><div className="p-8">Loading project...</div></Layout>;
    if (error) return <Layout><div className="p-8 text-red-600">Error: {error}</div></Layout>;
    if (!project) return <Layout><div className="p-8">Project not found</div></Layout>;

    const isOwner = user?.id === project.owner_id;

    const handleDeleteProject = async () => {
        if (!id) return;
        
        const isConfirmed = await confirm({
            title: 'Delete Project',
            message: 'Are you sure you want to delete this project? This action cannot be undone.',
            confirmText: 'Delete Project',
            tone: 'danger'
        });

        if (!isConfirmed) return;
        
        try {
            await deleteProject(id);
            addToast({ title: 'Project deleted', tone: 'success' });
            navigate('/projects');
        } catch (err: any) {
            addToast({ 
                title: 'Failed to delete project', 
                description: err.response?.data?.message || err.message,
                tone: 'error' 
            });
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!id) return;
        
        const isConfirmed = await confirm({
            title: 'Remove Member',
            message: 'Are you sure you want to remove this member? They will be notified by email.',
            confirmText: 'Remove Member',
            tone: 'danger'
        });

        if (!isConfirmed) return;

        try {
            await removeProjectMember(id, memberId);
            addToast({ title: 'Member removed', tone: 'success' });
            // Refresh
            const updatedProject = await getProject(id);
            setProject(updatedProject.project);
            setStats(updatedProject.stats);
        } catch (err: any) {
            addToast({ 
                title: 'Failed to remove member', 
                description: err.response?.data?.message || err.message, 
                tone: 'error' 
            });
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
                <Link to="/projects" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-4 sm:mb-6 lg:mb-8 transition-colors font-medium text-sm sm:text-base">
                    <ArrowLeft size={16} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Back to Projects</span>
                    <span className="sm:hidden">Back</span>
                </Link>

                <ProjectHeader 
                    project={project} 
                    stats={stats} 
                    isOwner={!!isOwner} 
                    onDeleteProject={handleDeleteProject} 
                />

                {isOwner && stats && stats.member_efficiency && (
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
                       <EfficiencyChart data={stats.member_efficiency} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <ProjectMembers 
                        members={project.members}
                        isOwner={!!isOwner}
                        availableUsers={availableUsers}
                        onRemoveMember={handleRemoveMember}
                        onInviteMember={handleInviteMember}
                        inviteLoading={inviteLoading}
                        inviteMessage={inviteMessage}
                    />

                    <ProjectTasks 
                         tasks={project.tasks}
                         selectedDate={selectedDate}
                         onDateChange={setSelectedDate}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default ProjectDashboard;
