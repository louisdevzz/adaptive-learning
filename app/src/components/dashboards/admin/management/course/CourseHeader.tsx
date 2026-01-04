"use client";

import { Plus } from "lucide-react";

interface CourseHeaderProps {
  onCreate: () => void;
}

export function CourseHeader({ onCreate }: CourseHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 pb-6 border-b border-card-border dark:border-gray-800 mb-6">
      <div>
        <h1 className="text-text-main dark:text-white text-3xl font-bold leading-tight tracking-tight">
          Danh sách Khóa học
        </h1>
        <p className="text-text-muted dark:text-gray-400 text-sm mt-1">
          Quản lý và theo dõi tất cả các khóa học trong hệ thống.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-blue-700 text-white text-sm font-bold leading-normal transition-all shadow-sm hover:shadow-md cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span className="truncate">Tạo khóa học</span>
      </button>
    </div>
  );
}
