import api from './axios';

export interface Project {
    id: number;
    name: string;
    description?: string;
    owner_id: number;
    created_at: string;
    updated_at: string;
    members_count?: number;
    tasks_count?: number;
    owner?: {
        id: number;
        name: string;
        email: string;
    };
    members?: Array<{
        id: number;
        name: string;
        email: string;
        pivot: {
            role: string;
        };
    }>;
    tasks?: Array<{
        id: number;
        title: string;
        status: string;
        user_id?: number;
        user?: {
            id: number;
            name: string;
            email: string;
        };
    }>;
}

export interface ProjectStats {
    total_tasks: number;
    completed_tasks: number;
    progress: number;
    member_efficiency?: Array<{
        name: string;
        total: number;
        completed: number;
        rate: number;
    }>;
}

export const getProjects = async () => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
};

export const getProject = async (id: number | string, date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get<{ project: Project; stats: ProjectStats }>(`/projects/${id}`, { params });
    return response.data;
};

export const createProject = async (data: { name: string; description?: string; members?: number[] }) => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
};

export const addProjectMember = async (projectId: number | string, email: string) => {
    const response = await api.post(`/projects/${projectId}/members`, { email });
    return response.data;
};

export const removeProjectMember = async (projectId: number | string, userId: number | string) => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
};

export const deleteProject = async (projectId: number | string) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
};
