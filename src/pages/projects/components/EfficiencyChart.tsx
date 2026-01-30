import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users } from 'lucide-react';

interface MemberEfficiency {
    name: string;
    total: number;
    completed: number;
    rate: number;
}

interface EfficiencyChartProps {
    data: MemberEfficiency[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const EfficiencyChart: React.FC<EfficiencyChartProps> = ({ data }) => {
    // Filter out members with no tasks to keep chart clean
    const activeData = data.filter(m => m.total > 0);

    if (activeData.length === 0) return null;

    return (
        <div className="mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8 border-t border-slate-100">
             <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                <Users size={16} className="text-slate-400 sm:w-5 sm:h-5" />
                Member Task Distribution
            </h3>
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 items-center">
                <div className="w-full md:w-1/2 h-48 sm:h-56 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="total"
                            >
                                {activeData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                            <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                     {activeData.map((member, idx) => (
                         <div key={idx} className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start mb-1 sm:mb-2">
                                <span className="text-xs sm:text-sm font-semibold text-slate-700">{member.name}</span>
                                <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${
                                    member.rate >= 80 ? 'bg-green-100 text-green-700' :
                                    member.rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>{member.rate}% Done</span>
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-500 flex justify-between">
                                <span>Total: {member.total}</span>
                                <span>Completed: {member.completed}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1 sm:h-1.5 mt-2 sm:mt-3">
                                <div 
                                    className={`h-1 sm:h-1.5 rounded-full ${
                                        member.rate >= 80 ? 'bg-green-500' :
                                        member.rate >= 50 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${member.rate}%` }}
                                ></div>
                            </div>
                         </div>
                     ))}
                </div>
            </div>
        </div>
    );
};

export default EfficiencyChart;
