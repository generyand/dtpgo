import { Student } from '@prisma/client';
import { eachDayOfInterval, format, startOfDay } from 'date-fns';

export interface RegistrationTrendData {
  date: string;
  count: number;
}

export const processRegistrationTrends = (
  students: Pick<Student, 'createdAt'>[],
  startDate: Date,
  endDate: Date,
): RegistrationTrendData[] => {
  if (!students || students.length === 0) {
    return [];
  }

  const dailyCounts = new Map<string, number>();

  const interval = eachDayOfInterval({ start: startDate, end: endDate });
  interval.forEach(day => {
    const formattedDate = format(day, 'MMM d');
    dailyCounts.set(formattedDate, 0);
  });

  students.forEach(student => {
    const registrationDate = startOfDay(student.createdAt);
    const formattedDate = format(registrationDate, 'MMM d');
    if (dailyCounts.has(formattedDate)) {
      dailyCounts.set(formattedDate, (dailyCounts.get(formattedDate) ?? 0) + 1);
    }
  });

  return Array.from(dailyCounts, ([date, count]) => ({ date, count })).sort(
    (a, b) =>
      new Date(a.date + ', ' + endDate.getFullYear()).getTime() -
      new Date(b.date + ', ' + endDate.getFullYear()).getTime(),
  );
};
