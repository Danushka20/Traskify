import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard } from 'lucide-react';

interface ProjectData {
    name: string;
    total: number;
    completed: number;
    efficiency: number;
}

interface ProjectEfficiencyChartProps {
    data: ProjectData[];
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
                        <span className="font-semibold text-green-600">{data.completed} tasks</span>
                    </p>
                    <p className="text-slate-600 flex justify-between gap-4">
                        <span>Total:</span>
                        <span className="font-semibold text-slate-900">{data.total} tasks</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const ProjectEfficiencyChart: React.FC<ProjectEfficiencyChartProps> = ({ data }) => {
    if (data.length === 0) return null;

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8">
             <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
                <LayoutDashboard size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-blue-500" />
                Project Efficiency
            </h3>
            <div className="h-48 sm:h-60 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                        layout="vertical"
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="efficiency" name="Completion Rate (%)" radius={[0, 4, 4, 0]} barSize={16}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.efficiency >= 80 ? '#10b981' : entry.efficiency >= 50 ? '#6366f1' : '#f59e0b'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProjectEfficiencyChart;
