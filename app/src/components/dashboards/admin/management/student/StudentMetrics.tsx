"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { StudentStats } from "@/types/student";

interface StudentMetricsProps {
  stats: StudentStats;
}

export function StudentMetrics({ stats }: StudentMetricsProps) {
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng học sinh"
        value={stats.total.toString()}
      />
      <MetricCard
        title="Nam"
        value={stats.byGender.male.toString()}
      />
      <MetricCard
        title="Nữ"
        value={stats.byGender.female.toString()}
      />
      <MetricCard
        title="Khác"
        value={stats.byGender.other.toString()}
      />
    </div>
  );
}

