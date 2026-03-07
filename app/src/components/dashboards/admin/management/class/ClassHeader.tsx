"use client";

import { Button } from "@heroui/button";
import { UserPlus, Download } from "lucide-react";

interface ClassHeaderProps {
  onCreate: () => void;
}

export function ClassHeader({ onCreate }: ClassHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#010101] dark:text-white tracking-tight">
          Danh sách Lớp học
        </h2>
        <p className="text-[#666666] dark:text-gray-400 text-sm mt-1">
          Quản lý học sinh, xem tiến độ và liên lạc.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="bordered"
          className="hidden sm:flex border-[#E5E5E5] dark:border-[#2a3447] text-[#010101] dark:text-white"
          startContent={<Download className="size-4" />}
        >
          Export
        </Button>
        <Button
          className="bg-[#6244F4] hover:bg-[#0e4bce] text-white"
          startContent={<UserPlus className="size-5" />}
          onPress={onCreate}
        >
          Thêm Lớp Học
        </Button>
      </div>
    </div>
  );
}
