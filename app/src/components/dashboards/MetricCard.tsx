"use client";

import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";


interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down";
  changeColor?: string;
}

export function MetricCard({ title, value, change, changeType, changeColor }: MetricCardProps) {
  const showChange = change && changeType && changeColor;

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
          {showChange && (
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
              <p className="flex-1 font-medium leading-4 text-[#535862] text-xs w-full">so với tháng trước</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

