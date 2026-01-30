import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users } from 'lucide-react';

interface MemberData {
    name: string;
    total: number;
    completed: number;
    efficiency: number;
}

interface MemberEfficiencyChartProps {
    data: MemberData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                <div className="space-y-1 text-sm">
                    <p className="text-slate-600 flex justify-between gap-4">
                        <span>Efficiency:</span>
                        <span className="font-semibold text-slate-900">{data.efficiency}%</span>
                    </p>
                    <p className="text-slate-600 flex justify-between gap-4">
                        <span>Completed:</span>
                        <span className="font-semibold text-green-600">{data.completed}</span>
                    </p>
                    <p className="text-slate-600 flex justify-between gap-4">
                        <span>Total Assigned:</span>
                        <span className="font-semibold text-slate-900">{data.total}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const MemberEfficiencyChart: React.FC<MemberEfficiencyChartProps> = ({ data }) => {
    // Top 5 or 10 members to avoid overcrowding
    const chartData = data.sort((a, b) => b.efficiency - a.efficiency).slice(0, 10);

    if (chartData.length === 0) return null;

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8">
             <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
                <Users size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-indigo-500" />
                <span className="hidden sm:inline">Member Efficiency (Top 10)</span>
                <span className="sm:hidden">Top 10 Members</span>
            </h3>
            <div className="h-48 sm:h-60 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-45} textAnchor="end" height={60} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="efficiency" name="Completion Rate (%)" radius={[4, 4, 0, 0]} barSize={20}>
                             {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.efficiency >= 80 ? '#10b981' : entry.efficiency >= 50 ? '#8b5cf6' : '#f59e0b'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MemberEfficiencyChart;
