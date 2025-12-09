"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { TeacherStats } from "@/types/teacher";

interface TeacherMetricsProps {
  stats: TeacherStats;
}

export function TeacherMetrics({ stats }: TeacherMetricsProps) {
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng giáo viên"
        value={stats.total.toString()}
      />
      <MetricCard
        title="Kinh nghiệm"
        value={stats.experienced.toString()}
      />
      <MetricCard
        title="Có chứng chỉ"
        value={stats.certified.toString()}
      />
      <MetricCard
        title="Đang hoạt động"
        value={stats.active.toString()}
      />
    </div>
  );
}

