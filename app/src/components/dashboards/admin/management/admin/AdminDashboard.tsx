"use client";

import { MetricCard } from "../../../MetricCard";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BookOpen, Users, GraduationCap, UserCheck, TrendingUp, Activity } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-6 items-start relative shrink-0 w-full">
      {/* Metrics Section */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <div className="flex gap-4 items-center relative shrink-0 w-full flex-wrap">
            <MetricCard
              title="Tổng người dùng"
              value={stats.totalUsers.toLocaleString("vi-VN")}
              change={`${stats.systemGrowth}%`}
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Tổng học sinh"
              value={stats.totalStudents.toLocaleString("vi-VN")}
              change="25%"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Tổng giáo viên"
              value={stats.totalTeachers.toLocaleString("vi-VN")}
              change="15%"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Tổng khóa học"
              value={stats.totalCourses.toLocaleString("vi-VN")}
              change="30%"
              changeType="up"
              changeColor="#027a48"
            />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <div className="flex gap-4 items-center relative shrink-0 w-full flex-wrap">
            <MetricCard
              title="Người dùng đang hoạt động"
              value={stats.activeUsers.toLocaleString("vi-VN")}
              change="20%"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Tăng trưởng hệ thống"
              value={`${stats.systemGrowth}%`}
              change="5%"
              changeType="up"
              changeColor="#027a48"
            />
          </div>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="flex flex-col gap-4 items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <h2 className="font-semibold leading-6 text-[#181d27] text-lg mb-4">
            Tổng quan hệ thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <BookOpen className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Khóa học</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Quản lý và theo dõi tất cả các khóa học trong hệ thống
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <Users className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Người dùng</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Quản lý tất cả người dùng: học sinh, giáo viên, phụ huynh
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <Activity className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Hoạt động hệ thống</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Theo dõi hiệu suất và hoạt động của hệ thống
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

