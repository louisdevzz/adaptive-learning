"use client";

import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination() {
  return (
    <div className="border-[#e9eaeb] border-b-0 border-l-0 border-r-0 border-solid border-t flex items-center justify-between pb-3 pt-2 px-4 relative shrink-0 w-full">
      <div className="flex gap-2 items-start relative shrink-0">
        <Button
          variant="bordered"
          size="sm"
          className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
          startContent={<ChevronLeft className="size-4 text-[#414651]" />}
        >
          Previous
        </Button>
        <Button
          variant="bordered"
          size="sm"
          className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
          endContent={<ChevronRight className="size-4 text-[#414651]" />}
        >
          Next
        </Button>
      </div>
      <p className="font-medium leading-4 text-[#414651] text-xs">Page 1 of 10</p>
    </div>
  );
}

