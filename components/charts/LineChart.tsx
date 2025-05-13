"use client";

import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type Dataset = {
    key: string;
    color: string;
    label: string;
};

type LineChartProps = {
    data: any[];
    datasets: Dataset[];
};

// Custom tooltip component to display both price and date
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        // Format the date string to a more readable format
        const dateStr = payload[0].payload.date;
        let formattedDate = "";

        if (dateStr) {
            const date = new Date(dateStr);
            formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        return (
            <div className="custom-tooltip" style={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                padding: '10px',
                borderRadius: '8px',
            }}>
                <p className="date" style={{ color: '#9CA3AF', margin: '0 0 5px 0', fontSize: '12px' }}>
                    {formattedDate}
                </p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color, margin: '0', fontWeight: 'bold' }}>
                        {entry.name}: ${entry.value}
                    </p>
                ))}
            </div>
        );
    }

    return null;
};

const LineChart = ({ data, datasets }: LineChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
                data={data}
                margin={{
                    top: 5,
                    right: 10,
                    left: 0,
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
                    content={<CustomTooltip />}
                />
                <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                {datasets.map((dataset) => (
                    <Line
                        key={dataset.key}
                        type="monotone"
                        dataKey={dataset.key}
                        stroke={dataset.color}
                        activeDot={{ r: 8 }}
                        name={dataset.label}
                    />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
};

export default LineChart;