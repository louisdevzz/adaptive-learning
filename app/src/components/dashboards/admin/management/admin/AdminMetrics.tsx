"use client";

import { MetricCard } from "@/components/dashboards/MetricCard";
import { AdminStats } from "@/types/admin";

interface AdminMetricsProps {
  stats: AdminStats;
}

export function AdminMetrics({ stats }: AdminMetricsProps) {
  return (
    <div className="flex gap-4 items-center w-full flex-wrap">
      <MetricCard
        title="Tổng quản trị viên"
        value={stats.total.toString()}
      />
      <MetricCard
        title="Siêu quản trị"
        value={stats.super.toString()}
      />
      <MetricCard
        title="Quản trị hệ thống"
        value={stats.system.toString()}
      />
      <MetricCard
        title="Hỗ trợ"
        value={stats.support.toString()}
      />
    </div>
  );
}

