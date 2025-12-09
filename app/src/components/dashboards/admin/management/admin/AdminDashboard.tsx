"use client";

import { MetricCard } from "../../../MetricCard";
import { useState, useEffect } from "react";
import { BookOpen, Users, Activity } from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    activeUsers: 0,
    systemGrowth: 0,
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    // For now, using mock data
    setStats({
      totalUsers: 2420,
      totalStudents: 1800,
      totalTeachers: 120,
      totalCourses: 45,
      activeUsers: 316,
      systemGrowth: 40,
    });
  }, []);

  // System overview cards data
  const overviewCards = [
    {
      icon: BookOpen,
      title: "Khóa học",
      description: "Quản lý và theo dõi tất cả các khóa học trong hệ thống",
    },
    {
      icon: Users,
      title: "Người dùng",
      description: "Quản lý tất cả người dùng: học sinh, giáo viên, phụ huynh",
    },
    {
      icon: Activity,
      title: "Hoạt động hệ thống",
      description: "Theo dõi hiệu suất và hoạt động của hệ thống",
    },
  ];

  // Metrics configuration
  const metrics = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers.toLocaleString("vi-VN"),
      change: `${stats.systemGrowth}%`,
    },
    {
      title: "Tổng học sinh",
      value: stats.totalStudents.toLocaleString("vi-VN"),
      change: "25%",
    },
    {
      title: "Tổng giáo viên",
      value: stats.totalTeachers.toLocaleString("vi-VN"),
      change: "15%",
    },
    {
      title: "Tổng khóa học",
      value: stats.totalCourses.toLocaleString("vi-VN"),
      change: "30%",
    },
    {
      title: "Người dùng đang hoạt động",
      value: stats.activeUsers.toLocaleString("vi-VN"),
      change: "20%",
    },
    {
      title: "Tăng trưởng hệ thống",
      value: `${stats.systemGrowth}%`,
      change: "5%",
    },
  ];

  return (
    <div className="flex flex-col gap-6 items-start relative shrink-0 w-full">
      {/* Metrics Section */}
      <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
        <div className="flex gap-4 items-center relative shrink-0 w-full flex-wrap">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType="up"
              changeColor="#027a48"
            />
          ))}
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="flex flex-col gap-4 items-start px-6 py-0 relative shrink-0 w-full">
        <h2 className="font-semibold leading-6 text-[#181d27] text-lg mb-4">
          Tổng quan hệ thống
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {overviewCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
              >
                <div className="flex gap-2 items-center relative shrink-0 w-full">
                  <IconComponent className="size-5 text-[#7f56d9]" />
                  <p className="font-semibold leading-5 text-[#181d27] text-sm">{card.title}</p>
                </div>
                <p className="font-normal leading-5 text-[#535862] text-sm">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

