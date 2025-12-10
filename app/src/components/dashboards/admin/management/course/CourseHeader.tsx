"use client";

import { Button } from "@heroui/button";
import { Plus } from "lucide-react";

interface CourseHeaderProps {
  onCreate: () => void;
}

export function CourseHeader({ onCreate }: CourseHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold leading-7 text-[#181d27] text-xl">
          Quản lý môn học
        </h1>
        <p className="font-normal leading-5 text-[#535862] text-sm">
          Quản lý và theo dõi tất cả môn học trong hệ thống
        </p>
      </div>
      <Button
        size="sm"
        className="bg-[#7f56d9] text-white font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
        startContent={<Plus className="size-4 text-white" />}
        onPress={onCreate}
      >
        Thêm môn học
      </Button>
    </div>
  );
}

