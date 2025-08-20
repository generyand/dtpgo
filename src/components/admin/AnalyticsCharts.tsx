'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  count: number;
}

interface AnalyticsChartsProps {
  studentsByProgram: ChartData[];
  studentsBySource: ChartData[];
}

export function AnalyticsCharts({ studentsByProgram, studentsBySource }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Students by Program</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={studentsByProgram} barCategoryGap={24}>
              <XAxis dataKey="name" tickMargin={8} />
              <YAxis width={36} />
              <Tooltip cursor={{ fill: 'rgba(250, 204, 21, 0.12)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#facc15" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Students by Registration Source</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={studentsBySource} barCategoryGap={24}>
              <XAxis dataKey="name" tickMargin={8} />
              <YAxis width={36} />
              <Tooltip cursor={{ fill: 'rgba(250, 204, 21, 0.12)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#86efac" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsCharts; 