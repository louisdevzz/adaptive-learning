"use client";

import { MetricCard } from "../MetricCard";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BookOpen, Users, ClipboardCheck, TrendingUp, FileText, Award } from "lucide-react";

export function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalCourses: 0,
    assignmentsGraded: 0,
    averageProgress: 0,
    strugglingStudents: 0,
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    setStats({
      totalClasses: 8,
      totalStudents: 240,
      totalCourses: 12,
      assignmentsGraded: 156,
      averageProgress: 72,
      strugglingStudents: 15,
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 items-start relative shrink-0 w-full">
      {/* Metrics Section */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <div className="flex gap-4 items-center relative shrink-0 w-full flex-wrap">
            <MetricCard
              title="Tổng lớp học"
              value={stats.totalClasses.toString()}
              change="2 lớp mới"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Tổng học sinh"
              value={stats.totalStudents.toString()}
              change="15 học sinh mới"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Khóa học đang dạy"
              value={stats.totalCourses.toString()}
              change="3 khóa mới"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Bài tập đã chấm"
              value={stats.assignmentsGraded.toString()}
              change="12 bài hôm nay"
              changeType="up"
              changeColor="#027a48"
            />
          </div>
        </div>
      </div>

      {/* Progress Metrics */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <div className="flex gap-4 items-center relative shrink-0 w-full flex-wrap">
            <MetricCard
              title="Tiến độ trung bình"
              value={`${stats.averageProgress}%`}
              change="5%"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Học sinh cần hỗ trợ"
              value={stats.strugglingStudents.toString()}
              change="3 học sinh"
              changeType="down"
              changeColor="#b42318"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-4 items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <h2 className="font-semibold leading-6 text-[#181d27] text-lg mb-4">
            Quản lý nội dung và tiến độ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <BookOpen className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Tạo nội dung</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Tạo và quản lý khóa học, module, section và knowledge points
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <Users className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Theo dõi học sinh</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Xem tiến độ và mức độ nắm vững kiến thức của học sinh
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <ClipboardCheck className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Đánh giá</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Tạo bài tập, bài kiểm tra và chấm điểm tự động
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

