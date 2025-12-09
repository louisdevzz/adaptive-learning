"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { ClassStats } from "@/types/class";

interface ClassMetricsProps {
  stats: ClassStats;
}

export function ClassMetrics({ stats }: ClassMetricsProps) {
  const gradeLevels = Object.keys(stats.byGradeLevel).map(Number).sort((a, b) => a - b);
  
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng lớp học"
        value={stats.total.toString()}
      />
      {gradeLevels.map((grade) => (
        <MetricCard
          key={grade}
          title={`Khối ${grade}`}
          value={stats.byGradeLevel[grade]?.toString() || "0"}
        />
      ))}
    </div>
  );
}

