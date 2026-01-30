import React from 'react';
import { Users, Briefcase, FileText } from 'lucide-react';

interface MemberStats {
    name: string;
    total: number;
    completed: number;
    efficiency: number;
    project_efficiency: number;
    general_efficiency: number;
    project_count: number;
    general_count: number;
}

interface MemberTaskBreakdownTableProps {
    data: MemberStats[];
}

const MemberTaskBreakdownTable: React.FC<MemberTaskBreakdownTableProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    // Helper for efficiency color
    const getEfficiencyColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (rate >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
        return 'text-amber-600 bg-amber-50 border-amber-200';
    };

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 flex items-center gap-1.5 sm:gap-2">
                    <Users size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-indigo-500" />
                    <span className="hidden sm:inline">Member Efficiency Breakdown</span>
                    <span className="sm:hidden">Efficiency</span>
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">Member</th>
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">
                                <div className="flex items-center justify-center gap-1">
                                    <Briefcase size={12} className="sm:w-[14px] sm:h-[14px]" />
                                    <span className="hidden md:inline">Project Tasks</span>
                                    <span className="md:hidden">Project</span>
                                </div>
                            </th>
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                                <div className="flex items-center justify-center gap-1">
                                    <FileText size={12} className="sm:w-[14px] sm:h-[14px]" />
                                    General Tasks
                                </div>
                            </th>
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center">Efficiency</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((member, index) => (
                            <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-slate-900 max-w-[100px] sm:max-w-none truncate">
                                    {member.name}
                                </td>
                                
                                {/* Project Tasks */}
                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border mb-0.5 sm:mb-1 ${getEfficiencyColor(member.project_efficiency)}`}>
                                            {member.project_efficiency}%
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                                            {member.project_count} tasks
                                        </span>
                                    </div>
                                </td>

                                {/* General Tasks */}
                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border mb-0.5 sm:mb-1 ${getEfficiencyColor(member.general_efficiency)}`}>
                                            {member.general_efficiency}%
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                                            {member.general_count} tasks
                                        </span>
                                    </div>
                                </td>

                                {/* Overall */}
                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center">
                                     <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                        <div className="w-full max-w-[50px] sm:max-w-[80px] bg-slate-100 rounded-full h-1.5 sm:h-2">
                                            <div 
                                                className={`h-1.5 sm:h-2 rounded-full ${member.efficiency >= 80 ? 'bg-green-500' : member.efficiency >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                                                style={{ width: `${member.efficiency}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-slate-700">{member.efficiency}%</span>
                                     </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberTaskBreakdownTable;
