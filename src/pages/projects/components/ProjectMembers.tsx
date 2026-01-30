import React, { useState } from 'react';
import { Users, Trash2, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import type { Project } from '../../../api/projects';

interface UserBasic {
    id: number;
    name: string;
    email: string;
}

interface ProjectMembersProps {
    members: Project['members'];
    isOwner: boolean;
    availableUsers: UserBasic[];
    onRemoveMember: (id: number) => void;
    onInviteMember: (email: string) => Promise<void>;
    inviteLoading: boolean;
    inviteMessage: { type: 'success' | 'error', text: string } | null;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ 
    members, 
    isOwner, 
    availableUsers, 
    onRemoveMember, 
    onInviteMember,
    inviteLoading,
    inviteMessage
}) => {
    const [selectedUserEmail, setSelectedUserEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserEmail) return;
        
        try {
            await onInviteMember(selectedUserEmail);
            setSelectedUserEmail('');
        } catch (error) {
            // Error handling is done in parent via inviteMessage
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 lg:col-span-1">
            <div className="overflow-hidden bg-white border shadow-sm rounded-xl sm:rounded-2xl border-slate-200">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-800">
                        <Users size={16} className="text-slate-400 sm:w-[18px] sm:h-[18px]" />
                        Team
                    </h3>
                    <span className="bg-white border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">{members?.length || 0}</span>
                </div>
                
                <ul className="divide-y divide-slate-50 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                    {members?.map(member => (
                        <li key={member.id} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition-colors group hover:bg-slate-50">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-bold text-white rounded-full shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm sm:text-base font-medium text-slate-900">{member.name}</div>
                                    <div className="text-[10px] sm:text-xs text-slate-500">{member.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                {member.pivot.role === 'owner' && (
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-yellow-200">
                                        Owner
                                    </span>
                                )}
                                {isOwner && member.pivot.role !== 'owner' && (
                                    <button
                                        onClick={() => onRemoveMember(member.id)}
                                        className="p-1.5 sm:p-2 transition-all rounded-lg opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        title="Remove Member"
                                    >
                                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                {isOwner && (
                    <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/30">
                        <form onSubmit={handleSubmit}>
                            <label className="block mb-2 sm:mb-3 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-500">Invite New Member</label>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="relative">
                                    <UserPlus size={16} className="absolute -translate-y-1/2 left-2.5 sm:left-3 top-1/2 text-slate-400 sm:w-[18px] sm:h-[18px]" />
                                    <select 
                                        required
                                        value={selectedUserEmail}
                                        onChange={(e) => setSelectedUserEmail(e.target.value)}
                                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                                    >
                                        <option value="">Select a user to invite...</option>
                                        {availableUsers
                                            .filter(u => !members?.some(m => m.id === u.id))
                                            .map(u => (
                                                <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={inviteLoading || !selectedUserEmail}
                                    className="w-full py-2 sm:py-2.5 bg-slate-900 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {inviteLoading ? 'Sending Invite...' : 'Send Invitation'}
                                </button>
                            </div>
                            {inviteMessage && (
                                <div className={`mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs font-medium flex items-center gap-1.5 sm:gap-2 ${inviteMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {inviteMessage.type === 'success' ? <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" /> : <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" />}
                                    {inviteMessage.text}
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectMembers;
