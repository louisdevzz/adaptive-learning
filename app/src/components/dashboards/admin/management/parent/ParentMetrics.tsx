"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { ParentStats } from "@/types/parent";

interface ParentMetricsProps {
  stats: ParentStats;
}

export function ParentMetrics({ stats }: ParentMetricsProps) {
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng phụ huynh"
        value={stats.total.toString()}
      />
      <MetricCard
        title="Cha"
        value={stats.byRelationship.father.toString()}
      />
      <MetricCard
        title="Mẹ"
        value={stats.byRelationship.mother.toString()}
      />
      <MetricCard
        title="Người giám hộ"
        value={stats.byRelationship.guardian.toString()}
      />
    </div>
  );
}

