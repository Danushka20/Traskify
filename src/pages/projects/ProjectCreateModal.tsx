import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../api/axios';
import { createProject } from '../../api/projects';
import { useToast } from '../../components/feedback/ToastProvider';

interface User {
    id: number;
    name: string;
    email: string;
}

interface ProjectCreateModalProps {
    onClose: () => void;
    onProjectCreated: () => void;
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({ onClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/users');
                setUsers(data);
            } catch (error) {
                console.error('Failed to load users');
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleMember = (userId: number) => {
        setSelectedMembers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createProject({
                name,
                description,
                members: selectedMembers
            });
            addToast({ title: 'Project created successfully', tone: 'success' });
            onProjectCreated();
            onClose();
        } catch (err: any) {
            addToast({ 
                title: 'Failed to create project', 
                description: err.response?.data?.message || 'Unknown error',
                tone: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg sm:max-w-xl lg:max-w-2xl rounded-xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800">Create New Project</h2>
                    <button onClick={onClose} className="p-1.5 sm:p-2 transition-colors rounded-full hover:bg-slate-200 text-slate-500">
                        <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                    <div>
                        <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-semibold text-slate-700">Project Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg sm:rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="e.g. Website Redesign"
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-semibold text-slate-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg sm:rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="Briefly describe the project goals..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Add Team Members</label>
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full text-slate-500 bg-slate-100">
                                {selectedMembers.length} selected
                            </span>
                        </div>
                        
                        <div className="overflow-hidden border border-slate-200 rounded-lg sm:rounded-xl">
                            <div className="p-1.5 sm:p-2 space-y-1 overflow-y-auto max-h-48 sm:max-h-60 bg-slate-50/30">
                                {usersLoading ? (
                                    <div className="p-3 sm:p-4 text-xs sm:text-sm text-center text-slate-500">Loading users...</div>
                                ) : users.length === 0 ? (
                                    <div className="p-3 sm:p-4 text-xs sm:text-sm text-center text-slate-500">No other users found.</div>
                                ) : (
                                    users.map(user => (
                                        <div 
                                            key={user.id}
                                            onClick={() => toggleMember(user.id)}
                                            className={clsx(
                                                "flex items-center p-2.5 sm:p-3 rounded-md sm:rounded-lg cursor-pointer transition-all border",
                                                selectedMembers.includes(user.id)
                                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                                    : "hover:bg-white border-transparent hover:border-slate-200 hover:shadow-sm"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-4 h-4 sm:w-5 sm:h-5 rounded-md border flex items-center justify-center mr-2 sm:mr-3 transition-colors",
                                                selectedMembers.includes(user.id)
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "border-slate-300 bg-white"
                                            )}>
                                                {selectedMembers.includes(user.id) && <Check size={10} className="sm:w-3 sm:h-3" strokeWidth={3} />}
                                            </div>
                                            <div>
                                                <div className={clsx(
                                                    "text-xs sm:text-sm font-medium",
                                                    selectedMembers.includes(user.id) ? "text-blue-700" : "text-slate-700"
                                                )}>{user.name}</div>
                                                <div className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[150px] sm:max-w-none">{user.email}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};
