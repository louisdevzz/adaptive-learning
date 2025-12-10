"use client";

import { MetricCard } from "../MetricCard";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BookOpen, Target, TrendingUp, Award, Clock, CheckCircle2 } from "lucide-react";

export function StudentDashboard() {
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    masteryScore: 0,
    knowledgePointsMastered: 0,
    learningStreak: 0,
    nextLesson: "",
    strugglingAreas: 0,
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    setStats({
      coursesEnrolled: 5,
      masteryScore: 78,
      knowledgePointsMastered: 142,
      learningStreak: 7,
      nextLesson: "Nhân đa thức với đơn thức",
      strugglingAreas: 3,
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 items-start relative shrink-0 w-full">
      {/* Metrics Section */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <div className="flex gap-4 items-center relative shrink-0 w-full flex-wrap">
            <MetricCard
              title="Khóa học đang học"
              value={stats.coursesEnrolled.toString()}
              change="1 khóa mới"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Điểm nắm vững"
              value={`${stats.masteryScore}%`}
              change="8%"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Knowledge Points đã nắm vững"
              value={stats.knowledgePointsMastered.toString()}
              change="12 KP mới"
              changeType="up"
              changeColor="#027a48"
            />
            <MetricCard
              title="Chuỗi học tập"
              value={`${stats.learningStreak} ngày`}
              change="+1 ngày"
              changeType="up"
              changeColor="#027a48"
            />
          </div>
        </div>
      </div>

      {/* Learning Path Section */}
      <div className="flex flex-col gap-4 items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <h2 className="font-semibold leading-6 text-[#181d27] text-lg mb-4">
            Lộ trình học tập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <Target className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Bài học tiếp theo</p>
              </div>
              <p className="font-semibold leading-5 text-[#181d27] text-base">
                {stats.nextLesson}
              </p>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Hệ thống đã đề xuất bài học này dựa trên tiến độ của bạn
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <TrendingUp className="size-5 text-[#7f56d9]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Khu vực cần cải thiện</p>
              </div>
              <p className="font-semibold leading-5 text-[#181d27] text-base">
                {stats.strugglingAreas} khu vực
              </p>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Hệ thống đã phát hiện các knowledge points bạn cần ôn lại
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mastery Status */}
      <div className="flex flex-col gap-4 items-start relative shrink-0 w-full">
        <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
          <h2 className="font-semibold leading-6 text-[#181d27] text-lg mb-4">
            Trạng thái nắm vững
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <CheckCircle2 className="size-5 text-[#027a48]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Đã nắm vững</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Các knowledge points bạn đã hoàn thành
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <Clock className="size-5 text-[#f59e0b]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Sẵn sàng học</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Các knowledge points bạn có thể bắt đầu học
              </p>
            </div>

            <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col gap-3 items-start p-4 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              <div className="flex gap-2 items-center relative shrink-0 w-full">
                <Award className="size-5 text-[#b42318]" />
                <p className="font-semibold leading-5 text-[#181d27] text-sm">Đang gặp khó khăn</p>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Các knowledge points cần ôn lại và luyện tập thêm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

