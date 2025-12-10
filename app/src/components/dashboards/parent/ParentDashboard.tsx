"use client";

import { MetricCard } from "../MetricCard";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Users, TrendingUp, Award, BookOpen, Clock, AlertCircle } from "lucide-react";

export function ParentDashboard() {
  const [stats, setStats] = useState({
    childrenCount: 0,
    averageProgress: 0,
    coursesEnrolled: 0,
    masteryScore: 0,
    learningStreak: 0,
    strugglingAreas: 0,
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    setStats({
      childrenCount: 2,
      averageProgress: 75,
      coursesEnrolled: 8,
      masteryScore: 72,
      learningStreak: 5,
      strugglingAreas: 4,
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 items-start relative shrink-0 w-full">
      {/* Metrics Section */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <div className="flex gap-4 items-center relative shrink-0 w-full flex-wrap">
            <MetricCard
              title="Số con đang học"
              value={stats.childrenCount.toString()}
            />
            <MetricCard
              title="Tiến độ trung bình"
              value={`${stats.averageProgress}%`}
              change="8%"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Tổng khóa học"
              value={stats.coursesEnrolled.toString()}
              change="2 khóa mới"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Điểm nắm vững trung bình"
              value={`${stats.masteryScore}%`}
              change="5%"
              changeType="up"
              changeColor="#027a48"
            />
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <div className="flex gap-4 items-center relative shrink-0 w-full flex-wrap">
            <MetricCard
              title="Chuỗi học tập"
              value={`${stats.learningStreak} ngày`}
              change="+2 ngày"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Khu vực cần hỗ trợ"
              value={stats.strugglingAreas.toString()}
              change="1 khu vực"
              changeType="down"
              changeColor="#b42318"
            />
          </div>
        </div>
      </div>

      {/* Children Overview */}
      <div className="flex flex-col gap-4 items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <h2 className="font-semibold leading-6 text-[#181d27] text-lg mb-4">
            Theo dõi tiến độ con
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <BookOpen className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Khóa học</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Xem các khóa học con đang tham gia và tiến độ học tập
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <TrendingUp className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Tiến độ học tập</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Theo dõi mức độ nắm vững kiến thức và tiến độ của con
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <Award className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Thành tích</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Xem các thành tích và điểm số của con
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="flex flex-col gap-4 items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <h2 className="font-semibold leading-6 text-[#181d27] text-lg mb-4">
            Thông báo quan trọng
          </h2>
          <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full">
            <div className="flex gap-2 items-center relative shrink-0 w-full">
              <AlertCircle className="size-5 text-[#f59e0b]" />
              <p className="font-semibold leading-5 text-[#181d27] text-sm">
                Khu vực cần hỗ trợ
              </p>
            </div>
            <p className="font-normal leading-5 text-[#535862] text-sm">
              Con bạn đang gặp khó khăn với {stats.strugglingAreas} knowledge points. 
              Hãy khuyến khích con ôn lại và luyện tập thêm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

