"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { Loader2, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ChildOverviewCard } from "@/components/parent/ChildOverviewCard";

interface ChildOverview {
  studentId: string;
  fullName: string;
  gradeLevel: number;
  schoolName: string;
  overallMastery: number;
  riskKpsCount: number;
}

interface ParentOverviewResponse {
  totalChildren: number;
  averageMastery: number;
  children: ChildOverview[];
}

export default function ParentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ParentOverviewResponse | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const response = await api.parentDashboard.getOverview();
        setOverview(response);
      } catch (error) {
        console.error("Failed to load parent overview", error);
        toast.error("Không thể tải dashboard phụ huynh");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-360 mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#010101] dark:text-white">Dashboard phụ huynh</h1>
        <p className="text-[#717680] dark:text-gray-400 mt-1">Tổng quan tiến độ học tập của các con.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#6244F4]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#6244F4]" />
            </div>
            <div>
              <p className="text-sm text-[#717680]">Tổng số con</p>
              <p className="text-2xl font-bold">{overview?.totalChildren || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#717680]">Mastery trung bình</p>
              <p className="text-2xl font-bold">{overview?.averageMastery || 0}%</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(overview?.children || []).map((child) => (
          <ChildOverviewCard key={child.studentId} child={child} />
        ))}
      </div>
    </div>
  );
}
