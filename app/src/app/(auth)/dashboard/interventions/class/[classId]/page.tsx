"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ClassHeatmap } from "@/components/teacher/ClassHeatmap";

interface ClassOverview {
  classId: string;
  studentCount: number;
  meanMastery: number;
  averageEngagement: number;
  outlierCount: number;
  students: Array<{
    studentId: string;
    fullName: string;
    avgMastery: number;
    engagementScore: number;
    riskKpsCount: number;
  }>;
}

export default function InterventionClassPage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId;

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ClassOverview | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const data = await api.teacherInterventions.getClassOverview(classId);
        setOverview(data);
      } catch (error) {
        console.error("Failed to load class intervention overview", error);
        toast.error("Không thể tải heatmap lớp");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-360 mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#010101] dark:text-white">Class Intervention Heatmap</h1>
          <p className="text-[#717680] dark:text-gray-400 mt-1">Lớp {classId}</p>
        </div>
        <Link href="/dashboard/interventions" className="text-sm text-primary hover:underline">
          Quay lại interventions
        </Link>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardBody><p className="text-sm text-[#717680]">Sĩ số</p><p className="text-2xl font-bold">{overview.studentCount}</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">Mastery TB</p><p className="text-2xl font-bold">{overview.meanMastery}%</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">Engagement TB</p><p className="text-2xl font-bold">{overview.averageEngagement}%</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">Outliers</p><p className="text-2xl font-bold text-orange-600">{overview.outlierCount}</p></CardBody></Card>
          </div>

          <ClassHeatmap students={overview.students} />
        </>
      )}
    </div>
  );
}
