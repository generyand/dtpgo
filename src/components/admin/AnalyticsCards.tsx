'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3 } from 'lucide-react';

interface AnalyticsCardsProps {
  totalStudents: number;
  totalPrograms: number;
}

export function AnalyticsCards({ totalStudents, totalPrograms }: AnalyticsCardsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-800">
              <Users className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold tracking-tight">{totalStudents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-800">
              <BarChart3 className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-medium">Academic Programs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold tracking-tight">{totalPrograms}</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsCards; 