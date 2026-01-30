export type TaskRecord = {
    id: number;
    title: string;
    description: string | null;
    user_id: number;
    start_time: string;
    end_time: string;
    status: string;
    user?: { id: number; name: string };
    subtasks?: Array<{ title: string; completed?: boolean }>;
    locked?: boolean;
    display_status?: string;
    completion_note?: string;
    reminder_sent?: boolean;
    project_id?: number | null;
    project?: { id: number; name: string };
};
