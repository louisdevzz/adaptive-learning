"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { ModuleStats } from "@/types/course";

interface ModuleMetricsProps {
  stats: ModuleStats;
}

export function ModuleMetrics({ stats }: ModuleMetricsProps) {
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng chủ đề"
        value={stats.total.toString()}
      />
    </div>
  );
}

