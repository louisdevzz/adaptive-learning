"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface TeacherClass {
  id: string;
  className: string;
  gradeLevel: number;
}

interface Outlier {
  studentId: string;
  fullName: string;
  avgMastery: number;
  engagementScore: number;
  riskKpsCount: number;
}

interface ClassOverview {
  classId: string;
  studentCount: number;
  meanMastery: number;
  averageEngagement: number;
  outlierCount: number;
  outliers: Outlier[];
}

export default function InterventionsPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [overview, setOverview] = useState<ClassOverview | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const response = await api.classes.getAll();
        const normalized = (response || []).map((item: any) => ({
          id: item.id,
          className: item.className,
          gradeLevel: item.gradeLevel,
        }));
        setClasses(normalized);

        if (normalized.length > 0) {
          setSelectedClassId(normalized[0].id);
        }
      } catch (error) {
        console.error("Failed to load classes", error);
        toast.error("Không thể tải danh sách lớp");
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;

    const loadOverview = async () => {
      try {
        const data = await api.teacherInterventions.getClassOverview(selectedClassId);
        setOverview(data);
      } catch (error) {
        console.error("Failed to load class overview", error);
        toast.error("Không thể tải overview can thiệp");
      }
    };

    loadOverview();
  }, [selectedClassId]);

  const selectedClass = useMemo(
    () => classes.find((item) => item.id === selectedClassId),
    [classes, selectedClassId],
  );

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
        <h1 className="text-2xl md:text-3xl font-bold text-[#010101] dark:text-white">
          Teacher Interventions
        </h1>
        <p className="text-[#717680] dark:text-gray-400 mt-1">
          Theo dõi outlier và can thiệp theo từng lớp.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {classes.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedClassId(item.id)}
            className={`px-4 py-2 rounded-xl border whitespace-nowrap ${
              item.id === selectedClassId
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-[#1a202c] border-[#e9eaeb] dark:border-gray-700"
            }`}
          >
            {item.className}
          </button>
        ))}
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardBody><p className="text-sm text-[#717680]">Sĩ số</p><p className="text-2xl font-bold">{overview.studentCount}</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">Mastery TB</p><p className="text-2xl font-bold">{overview.meanMastery}%</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">Engagement TB</p><p className="text-2xl font-bold">{overview.averageEngagement}%</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">Outliers</p><p className="text-2xl font-bold text-orange-600">{overview.outlierCount}</p></CardBody></Card>
          </div>

          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Học sinh cần can thiệp</h2>
                {selectedClass && (
                  <Link
                    href={`/dashboard/interventions/class/${selectedClass.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Xem heatmap lớp
                  </Link>
                )}
              </div>

              {overview.outliers.length === 0 ? (
                <p className="text-sm text-[#717680]">Không có outlier trong lớp hiện tại.</p>
              ) : (
                <div className="space-y-2">
                  {overview.outliers.map((outlier) => (
                    <Link
                      key={outlier.studentId}
                      href={`/dashboard/interventions/student/${outlier.studentId}`}
                      className="block rounded-lg border border-[#e9eaeb] p-3 hover:border-primary"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-[#181d27] dark:text-white">{outlier.fullName}</p>
                          <p className="text-sm text-[#717680]">
                            Mastery {outlier.avgMastery}% • Engagement {outlier.engagementScore}% • Risk KPs {outlier.riskKpsCount}
                          </p>
                        </div>
                        <TriangleAlert className="w-5 h-5 text-orange-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
