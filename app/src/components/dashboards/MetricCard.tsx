"use client";

import Image from "next/image";
import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";

// Chart images from Figma (keeping as images since they're actual chart graphics)
const imgChart = "https://www.figma.com/api/mcp/asset/0fa57720-628a-46d4-b09d-d5ebcab30a98";
const imgChart1 = "https://www.figma.com/api/mcp/asset/f43881b7-de05-4cd3-bb91-5f0afe19162a";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  changeColor: string;
  chart: "chart1" | "chart2";
}

export function MetricCard({ title, value, change, changeType, changeColor, chart }: MetricCardProps) {
  return (
    <div className="bg-white border border-[#e9eaeb] border-solid flex flex-1 flex-col gap-4 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
      <div className="flex gap-2 items-start relative shrink-0 w-full">
        <p className="flex-1 font-semibold leading-5 text-[#181d27] text-sm w-full">{title}</p>
        <MoreVertical className="size-4 text-[#414651]" />
      </div>
      <div className="flex gap-3 items-end relative shrink-0 w-full">
        <div className="flex flex-1 flex-col gap-2 items-start relative shrink-0">
          <p className="font-semibold leading-8 text-[#181d27] text-2xl tracking-[-0.5px] w-full">
            {value}
          </p>
          <div className="flex gap-1.5 items-center relative shrink-0 w-full">
            <div className="flex gap-1 items-center justify-center relative shrink-0">
              {changeType === "up" ? (
                <ArrowUp className="size-4" style={{ color: changeColor }} />
              ) : (
                <ArrowDown className="size-4" style={{ color: changeColor }} />
              )}
              <p className="font-medium leading-4 text-center text-xs" style={{ color: changeColor }}>
                {change}
              </p>
            </div>
            <p className="flex-1 font-medium leading-4 text-[#535862] text-xs w-full">vs last month</p>
          </div>
        </div>
        <div className="h-10 relative shrink-0 w-20">
          <Image
            src={chart === "chart1" ? imgChart : imgChart1}
            alt="chart"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

