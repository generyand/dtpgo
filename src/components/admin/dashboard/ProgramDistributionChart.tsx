'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, Sector, ResponsiveContainer } from 'recharts';
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
  // Casting helper to avoid generic type mismatch across Recharts versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PieAny = Pie as unknown as React.ComponentType<Record<string, any>>;
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  type ActiveShapeProps = {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload: ProgramDistributionData;
    value: number;
  };

  const renderActiveShape = (props: unknown) => {
    const {
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, value
    } = props as ActiveShapeProps;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 6) * cos;
    const sy = cy + (outerRadius + 6) * sin;
    const mx = cx + (outerRadius + 14) * cos;
    const my = cy + (outerRadius + 14) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy - 8} dy={8} textAnchor="middle" className="fill-gray-900 text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 12} dy={8} textAnchor="middle" className="fill-muted-foreground text-xs">
          {`${value} (${payload.percentage}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 6 : -6)} y={ey} textAnchor={textAnchor} className="fill-gray-700 text-xs">
          {`${payload.name}: ${value} (${payload.percentage}%)`}
        </text>
      </g>
    );
  };

  return (
    <BaseChart title={title} description={description}>
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
        {/* Hide default tooltip since we render active labels */}
        <Tooltip content={() => null} />
        <Legend />
        <PieAny
          activeIndex={activeIndex}
          activeShape={renderActiveShape as unknown as React.ComponentType<unknown>}
          data={data}
          cx="50%"
          cy="55%"
          innerRadius={70}
          outerRadius={90}
          fill="#8884d8"
          paddingAngle={4}
          dataKey="count"
          nameKey="name"
          onMouseEnter={onPieEnter}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </PieAny>
      </PieChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default ProgramDistributionChart;
