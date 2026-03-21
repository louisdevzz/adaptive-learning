"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Chip, Spinner } from "@heroui/react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { BookOpenCheck, Clock3, Sparkles } from "lucide-react";

type LearningMemoryEntry = {
  timestamp: string;
  type: "mastery_delta" | "mastery_threshold" | "failure_streak";
  kpId: string;
  kpTitle: string;
  content: string;
};

type LearningProfile = {
  studentId: string;
  visualScore: number;
  auditoryScore: number;
  readingScore: number;
  kinestheticScore: number;
  pacePreference: "slow" | "moderate" | "fast";
  dominantStyle: "visual" | "auditory" | "reading" | "kinesthetic";
  profileSource: "default" | "assessment" | "ai_inferred";
  learningMemory: LearningMemoryEntry[];
};

const paceLabels: Record<LearningProfile["pacePreference"], string> = {
  slow: "Chậm",
  moderate: "Vừa phải",
  fast: "Nhanh",
};

const dominantLabels: Record<LearningProfile["dominantStyle"], string> = {
  visual: "Thị giác",
  auditory: "Thính giác",
  reading: "Đọc/Viết",
  kinesthetic: "Vận động",
};

const sourceLabels: Record<LearningProfile["profileSource"], string> = {
  default: "Mặc định",
  assessment: "Từ bài đánh giá",
  ai_inferred: "AI suy luận",
};

export default function LearningProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPace, setUpdatingPace] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.learningProfile.getMyProfile();
        setProfile(data);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "student") {
      load();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const chartData = useMemo(() => {
    if (!profile) return [];
    return [
      { name: "Visual", value: profile.visualScore },
      { name: "Auditory", value: profile.auditoryScore },
      { name: "Reading", value: profile.readingScore },
      { name: "Kinesthetic", value: profile.kinestheticScore },
    ];
  }, [profile]);

  const updatePace = async (pacePreference: "slow" | "moderate" | "fast") => {
    if (!profile) return;

    setUpdatingPace(true);
    try {
      const updated = await api.learningProfile.updateMyPace({ pacePreference });
      setProfile(updated);
    } finally {
      setUpdatingPace(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== "student") {
    return (
      <Card>
        <CardBody className="py-10 text-center text-default-500">
          Chỉ học sinh mới có thể xem hồ sơ học tập cá nhân.
        </CardBody>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-default-500">
          Không thể tải hồ sơ học tập.
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Chip color="secondary" variant="flat" startContent={<Sparkles className="w-3.5 h-3.5" />}>
          Phong cách chính: {dominantLabels[profile.dominantStyle]}
        </Chip>
        <Chip variant="flat" startContent={<Clock3 className="w-3.5 h-3.5" />}>
          Tốc độ học: {paceLabels[profile.pacePreference]}
        </Chip>
        <Chip variant="flat" startContent={<BookOpenCheck className="w-3.5 h-3.5" />}>
          Nguồn profile: {sourceLabels[profile.profileSource]}
        </Chip>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader className="text-base font-semibold">Biểu đồ VARK</CardHeader>
          <CardBody className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="VARK"
                  dataKey="value"
                  stroke="#6244F4"
                  fill="#6244F4"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="text-base font-semibold">Điều chỉnh tốc độ học</CardHeader>
          <CardBody className="space-y-3">
            <Button
              variant={profile.pacePreference === "slow" ? "solid" : "flat"}
              color={profile.pacePreference === "slow" ? "secondary" : "default"}
              onPress={() => updatePace("slow")}
              isLoading={updatingPace}
            >
              Chậm
            </Button>
            <Button
              variant={profile.pacePreference === "moderate" ? "solid" : "flat"}
              color={profile.pacePreference === "moderate" ? "secondary" : "default"}
              onPress={() => updatePace("moderate")}
              isLoading={updatingPace}
            >
              Vừa phải
            </Button>
            <Button
              variant={profile.pacePreference === "fast" ? "solid" : "flat"}
              color={profile.pacePreference === "fast" ? "secondary" : "default"}
              onPress={() => updatePace("fast")}
              isLoading={updatingPace}
            >
              Nhanh
            </Button>

            <Button
              color="secondary"
              variant="bordered"
              onPress={() => router.push("/dashboard/learning-profile/assessment")}
            >
              Làm lại bài đánh giá VARK
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="text-base font-semibold">Learning Memory Timeline</CardHeader>
        <CardBody className="space-y-3">
          {profile.learningMemory.length === 0 ? (
            <p className="text-default-500 text-sm">
              Chưa có memory nào. Hệ thống sẽ tự động ghi lại các cột mốc học tập quan trọng.
            </p>
          ) : (
            [...profile.learningMemory]
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
              )
              .map((entry, index) => (
                <div
                  key={`${entry.timestamp}-${index}`}
                  className="rounded-xl border border-default-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-medium text-sm">{entry.kpTitle}</p>
                    <p className="text-xs text-default-500">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <p className="text-sm text-default-600">{entry.content}</p>
                </div>
              ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
