"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Search } from "lucide-react";

interface TeacherFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onClearSelection: () => void;
}

export function TeacherFilters({
  searchQuery,
  onSearchChange,
  selectedCount,
  onClearSelection,
}: TeacherFiltersProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <Input
        placeholder="Tìm kiếm theo tên hoặc email..."
        size="sm"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        startContent={<Search className="size-4 text-[#717680]" />}
        className="flex-1"
        classNames={{
          input: "text-sm text-[#717680]",
          inputWrapper: "border-[#d5d7da] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] h-9",
        }}
      />
      {selectedCount > 0 && (
        <Button
          variant="bordered"
          size="sm"
          className="border-[#d5d7da] text-[#414651] font-semibold"
          onPress={onClearSelection}
        >
          Bỏ chọn ({selectedCount})
        </Button>
      )}
    </div>
  );
}

