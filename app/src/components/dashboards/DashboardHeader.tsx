"use client";

import { Button } from "@heroui/button";
import { Calendar } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

const dateFilters = [
  { label: "Hôm nay", value: "today" },
  { label: "Tuần này", value: "week" },
  { label: "Tháng này", value: "month" },
];

export function DashboardHeader() {
  const { user, loading } = useUser();
  const [selectedFilter, setSelectedFilter] = useState("today");

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white tracking-tight mb-2">
          Tổng quan hệ thống
        </h1>
        <p className="text-[#4c669a] dark:text-gray-400">
          {loading
            ? "Đang tải thông tin..."
            : user
            ? `Chào mừng trở lại, ${user.fullName}. Đây là tình hình hoạt động hôm nay.`
            : "Chào mừng bạn đến với nền tảng học tập thông minh."}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-white dark:bg-[#1a202c] border border-[#e7ebf3] rounded-lg p-1 shadow-sm">
        {dateFilters.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={selectedFilter === filter.value ? "solid" : "light"}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              selectedFilter === filter.value
                ? "bg-gray-100 dark:bg-gray-700 text-[#0d121b] dark:text-white"
                : "text-[#4c669a] hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onPress={() => setSelectedFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="light"
          isIconOnly
          className="p-1.5 text-[#4c669a] hover:text-[#135bec]"
        >
          <Calendar className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

