"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ResourceCard, RecommendedResource } from "./ResourceCard";

interface ResourceListProps {
  studentId: string;
  kpId: string;
  kpTitle: string;
  masteryScore: number;
}

export function ResourceList({ studentId, kpId, kpTitle, masteryScore }: ResourceListProps) {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<RecommendedResource[]>([]);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const response = await api.resourceRecommendations.getForKp(studentId, kpId);
        setResources(response.recommendations || []);
      } catch (error) {
        console.error("Failed to load resource recommendations", error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [studentId, kpId]);

  const recordInteraction = async (
    resourceId: string,
    action: "viewed" | "completed" | "helpful" | "not_helpful",
  ) => {
    try {
      await api.resourceRecommendations.recordInteraction({
        studentId,
        resourceId,
        kpId,
        action,
        masteryBefore: masteryScore,
      });

      if (action === "helpful") {
        toast.success("Đã ghi nhận phản hồi hữu ích");
      }

      if (action === "not_helpful") {
        toast("Đã ghi nhận phản hồi để cải thiện gợi ý");
      }
    } catch (error) {
      console.error("Failed to record interaction", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="font-semibold text-sm">{kpTitle}</p>
        <p className="text-xs text-gray-500">Mức nắm vững hiện tại: {masteryScore}%</p>
      </div>

      {resources.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có gợi ý tài liệu cho điểm kiến thức này.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onOpenResource={() => {
                window.open(resource.url, "_blank", "noopener,noreferrer");
                recordInteraction(resource.id, "viewed");
              }}
              onMarkHelpful={() => recordInteraction(resource.id, "helpful")}
              onMarkNotHelpful={() => recordInteraction(resource.id, "not_helpful")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
