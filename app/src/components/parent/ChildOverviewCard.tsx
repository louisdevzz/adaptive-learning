"use client";

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import { Progress } from "@heroui/progress";
import { AlertTriangle, ChevronRight, GraduationCap } from "lucide-react";

interface ChildOverview {
  studentId: string;
  fullName: string;
  gradeLevel: number;
  schoolName: string;
  overallMastery: number;
  riskKpsCount: number;
}

export function ChildOverviewCard({ child }: { child: ChildOverview }) {
  return (
    <Link href={`/dashboard/parent/${child.studentId}`}>
      <Card className="border border-[#e9eaeb] hover:border-primary transition-colors">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[#181d27] dark:text-white">{child.fullName}</p>
              <p className="text-sm text-[#717680] dark:text-gray-400 flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                Lớp {child.gradeLevel} • {child.schoolName}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#717680]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#717680] dark:text-gray-400">Nắm vững trung bình</span>
              <span className="font-medium">{child.overallMastery}%</span>
            </div>
            <Progress value={child.overallMastery} color="primary" className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-[#717680] dark:text-gray-400">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              KP nguy cơ
            </span>
            <span className="font-medium text-orange-600">{child.riskKpsCount}</span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
