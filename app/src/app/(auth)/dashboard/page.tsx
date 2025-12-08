"use client";

import { SidebarNavigation } from "@/components/dashboards/SidebarNavigation";
import { DashboardHeader } from "@/components/dashboards/DashboardHeader";
import { MetricCard } from "@/components/dashboards/MetricCard";
import { FiltersBar } from "@/components/dashboards/FiltersBar";
import { DataTable } from "@/components/dashboards/DataTable";
import { Pagination } from "@/components/dashboards/Pagination";

export default function DashboardPage() {
  return (
    <div className="bg-white flex items-start relative min-h-screen w-full">
      <SidebarNavigation />
      <div className="bg-white flex flex-1 flex-col gap-6 h-screen items-start overflow-y-auto pb-8 pt-6 px-0 ml-[240px] relative shrink-0">
        {/* Header Section */}
        <DashboardHeader />

        {/* Metrics Section */}
        <div className="flex flex-col items-start relative shrink-0 w-full">
          <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
            <div className="flex gap-4 items-center relative shrink-0 w-full">
              <MetricCard
                title="Total customers"
                value="2,420"
                change="40%"
                changeType="up"
                changeColor="#027a48"
                chart="chart1"
              />
              <MetricCard
                title="Members"
                value="1,210"
                change="10%"
                changeType="down"
                changeColor="#b42318"
                chart="chart2"
              />
              <MetricCard
                title="Active now"
                value="316"
                change="20%"
                changeType="up"
                changeColor="#027a48"
                chart="chart1"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex flex-col items-start relative shrink-0 w-full">
          <div className="flex flex-col gap-4 items-start px-6 py-0 relative shrink-0 w-full">
            <FiltersBar />
            <DataTable />
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
}
