import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2 } from 'lucide-react';

interface TaskTypeData {
    name: string;
    value: number;
}

interface TaskDistributionChartProps {
    data: TaskTypeData[];
}

const COLORS = ['#3b82f6', '#8b5cf6']; // Blue for Project, Purple for General

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        
        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                 <p className="font-bold text-slate-800 mb-2">{data.name}</p>
                 <div className="space-y-1 text-sm">
                    <p className="text-slate-600 flex justify-between gap-4">
                        <span>Count:</span>
                        <span className="font-semibold text-slate-900">{data.value}</span>
                    </p>
                    <p className="text-slate-600 flex justify-between gap-4">
                        <span>Share:</span>
                        <span className="font-semibold text-purple-600">{(data.payload.percent * 100).toFixed(1)}%</span>
                    </p>
                 </div>
            </div>
        );
    }
    return null;
};

const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({ data }) => {
    if (data.every(d => d.value === 0)) return null;

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8">
             <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-purple-500" />
                Task Distribution
            </h3>
            <div className="h-48 sm:h-60 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TaskDistributionChart;
