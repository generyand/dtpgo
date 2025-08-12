import React from 'react';
import { countStudents } from '@/lib/db/queries/students';
import { getPrograms } from '@/lib/db/queries/programs';
import { countStudentsByProgram, countStudentsByRegistrationSource } from '@/lib/db/queries/analytics';
import AnalyticsCards from '@/components/admin/AnalyticsCards';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';

export default async function AnalyticsPage() {
  const totalStudents = await countStudents({});
  const programs = await getPrograms();
  const studentsByProgram = await countStudentsByProgram();
  const studentsBySource = await countStudentsByRegistrationSource();

  const chartDataByProgram = studentsByProgram.map(p => ({ name: p.program, count: p.count }));
  const chartDataBySource = studentsBySource.map(s => ({ name: s.source, count: s.count }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <AnalyticsCards totalStudents={totalStudents} totalPrograms={programs.length} />
      <AnalyticsCharts studentsByProgram={chartDataByProgram} studentsBySource={chartDataBySource} />
    </div>
  );
} 