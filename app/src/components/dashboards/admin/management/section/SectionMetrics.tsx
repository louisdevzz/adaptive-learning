"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { SectionStats } from "@/types/course";

interface SectionMetricsProps {
  stats: SectionStats;
}

export function SectionMetrics({ stats }: SectionMetricsProps) {
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng bài học"
        value={stats.total.toString()}
      />
    </div>
  );
}

