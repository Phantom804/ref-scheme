"use client";

import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

type Dataset = {
    key: string;
    color: string;
    label: string;
};

type BarChartProps = {
    data: any[];
    datasets: Dataset[];
};

const BarChart = ({ data, datasets }: BarChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                    dataKey="name"
                    tick={{ fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#4B5563' }}
                />
                <YAxis
                    tick={{ fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#4B5563' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        color: '#F9FAFB',
                        borderRadius: '8px',
                    }}
                />
                <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                {datasets.map((dataset) => (
                    <Bar
                        key={dataset.key}
                        dataKey={dataset.key}
                        fill={dataset.color}
                        name={dataset.label}
                    />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};

export default BarChart; 