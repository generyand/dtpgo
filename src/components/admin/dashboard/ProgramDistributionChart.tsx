'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import BaseChart from './BaseChart';
import { ProgramDistributionData } from '@/lib/db/queries/analytics';

interface ProgramDistributionChartProps {
  data: ProgramDistributionData[];
  title?: string;
  description?: string;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF1943',
];

const ProgramDistributionChart: React.FC<ProgramDistributionChartProps> = ({
  data,
  title = 'Program Distribution',
  description = 'Distribution of students across different programs.',
}) => {
  return (
    <BaseChart title={title} description={description}>
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
          formatter={(value: number, name: string, props) => [
            `${value} (${props.payload.percentage}%)`,
            name,
          ]}
        />
        <Legend />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="count"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </BaseChart>
  );
};

export default ProgramDistributionChart;
