"use client";

import { Button } from "@heroui/button";
import { Upload, Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col items-start relative shrink-0 w-full">
      <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
        <div className="flex flex-col items-start relative shrink-0 w-full">
          <div className="flex gap-4 items-center justify-between relative shrink-0 w-full">
            <div className="flex flex-1 flex-col gap-0.5 items-start relative shrink-0">
              <h1 className="font-semibold leading-7 text-[#181d27] text-xl w-full">
                Welcome back, Olivia
              </h1>
              <p className="font-normal leading-5 text-[#535862] text-sm w-full">
                Track, manage and forecast your customers and orders.
              </p>
            </div>
            <div className="flex gap-2 items-center relative shrink-0">
              <Button
                variant="bordered"
                size="sm"
                className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
                startContent={<Upload className="size-4 text-[#414651]" />}
              >
                Import
              </Button>
              <Button
                size="sm"
                className="bg-[#7f56d9] text-white font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
                startContent={<Plus className="size-4 text-white" />}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

