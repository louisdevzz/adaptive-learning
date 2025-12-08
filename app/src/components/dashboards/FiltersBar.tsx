"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { X, SlidersHorizontal, Search } from "lucide-react";

export function FiltersBar() {
  return (
    <div className="flex items-start relative rounded-lg shrink-0 w-full">
      <div className="flex flex-1 gap-3 items-center relative shrink-0">
        <div className="flex flex-1 gap-2 items-start relative shrink-0">
          {/* Filter buttons */}
          <Button
            variant="bordered"
            size="sm"
            className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
            endContent={<X className="size-4 text-[#414651]" />}
          >
            All time
          </Button>
          <Button
            variant="bordered"
            size="sm"
            className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
            endContent={<X className="size-4 text-[#414651]" />}
          >
            US, AU, +4
          </Button>
          <Button
            variant="bordered"
            size="sm"
            className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
            startContent={<SlidersHorizontal className="size-4 text-[#414651]" />}
          >
            More filters
          </Button>
        </div>
        <Input
          placeholder="Search"
          size="sm"
          startContent={<Search className="size-4 text-[#717680]" />}
          className="w-64"
          classNames={{
            input: "text-sm text-[#717680]",
            inputWrapper: "border-[#d5d7da] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] h-9",
          }}
        />
      </div>
    </div>
  );
}

