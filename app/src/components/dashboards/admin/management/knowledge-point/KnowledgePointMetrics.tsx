"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { KnowledgePointStats } from "@/types/knowledge-point";

interface KnowledgePointMetricsProps {
  stats: KnowledgePointStats;
}

export function KnowledgePointMetrics({ stats }: KnowledgePointMetricsProps) {
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng điểm kiến thức"
        value={stats.total.toString()}
      />
      {Object.entries(stats.byDifficulty).map(([level, count]) => (
        <MetricCard
          key={level}
          title={`Độ khó ${level}`}
          value={count.toString()}
        />
      ))}
    </div>
  );
}

