"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { CourseStats } from "@/types/course";

interface CourseMetricsProps {
  stats: CourseStats;
}

export function CourseMetrics({ stats }: CourseMetricsProps) {
  const gradeLevels = Object.keys(stats.byGradeLevel).map(Number).sort((a, b) => a - b);
  const subjects = Object.keys(stats.bySubject);
  
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng môn học"
        value={stats.total.toString()}
      />
      {gradeLevels.map((grade) => (
        <MetricCard
          key={grade}
          title={`Khối ${grade}`}
          value={stats.byGradeLevel[grade]?.toString() || "0"}
        />
      ))}
      {subjects.map((subject) => (
        <MetricCard
          key={subject}
          title={subject}
          value={stats.bySubject[subject]?.toString() || "0"}
        />
      ))}
    </div>
  );
}

