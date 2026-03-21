"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { CalendarDays, Clock3, Target, TrendingUp } from "lucide-react";

interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  overallMastery: number;
  masteryChange: number;
  studyTimeMinutes: number;
  attemptsCount: number;
  strengthsCount: number;
  weaknessesCount: number;
  riskKpsCount: number;
  aiSummary: string;
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start).toLocaleDateString("vi-VN");
  const endDate = new Date(end).toLocaleDateString("vi-VN");
  return `${startDate} - ${endDate}`;
}

export function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  const trendColor =
    report.masteryChange > 0 ? "success" : report.masteryChange < 0 ? "danger" : "default";

  return (
    <Card className="border border-[#e9eaeb]">
      <CardBody className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#717680] dark:text-gray-400 flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            {formatDateRange(report.weekStart, report.weekEnd)}
          </p>
          <Chip size="sm" color={trendColor} variant="flat" startContent={<TrendingUp className="w-3 h-3" />}>
            {report.masteryChange >= 0 ? "+" : ""}{report.masteryChange}%
          </Chip>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-[#717680] dark:text-gray-400">Mastery</p>
            <p className="font-semibold flex items-center gap-1"><Target className="w-4 h-4" />{report.overallMastery}%</p>
          </div>
          <div>
            <p className="text-[#717680] dark:text-gray-400">Thời gian học</p>
            <p className="font-semibold flex items-center gap-1"><Clock3 className="w-4 h-4" />{report.studyTimeMinutes} phút</p>
          </div>
          <div>
            <p className="text-[#717680] dark:text-gray-400">Lượt làm bài</p>
            <p className="font-semibold">{report.attemptsCount}</p>
          </div>
          <div>
            <p className="text-[#717680] dark:text-gray-400">KP nguy cơ</p>
            <p className="font-semibold text-orange-600">{report.riskKpsCount}</p>
          </div>
        </div>

        <p className="text-sm text-[#181d27] dark:text-gray-200 bg-[#f5f5f5] dark:bg-[#1f2937] rounded-lg p-3">
          {report.aiSummary}
        </p>
      </CardBody>
    </Card>
  );
}
