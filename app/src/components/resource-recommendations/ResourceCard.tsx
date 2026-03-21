"use client";

import { Button, Chip } from "@heroui/react";
import { BookOpen, CirclePlay, ExternalLink, HandHelping, ThumbsDown } from "lucide-react";

export interface RecommendedResource {
  id: string;
  kpId: string;
  resourceType: "video" | "article" | "interactive" | "quiz" | "other";
  url: string;
  title: string;
  source: string;
  finalScore: number;
}

interface ResourceCardProps {
  resource: RecommendedResource;
  onMarkHelpful: () => void;
  onMarkNotHelpful: () => void;
  onOpenResource: () => void;
}

export function ResourceCard({
  resource,
  onMarkHelpful,
  onMarkNotHelpful,
  onOpenResource,
}: ResourceCardProps) {
  const isVideo = resource.resourceType === "video";

  return (
    <div className="rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-3 bg-white dark:bg-[#1a202c]">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {isVideo ? <CirclePlay className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{resource.title}</p>
            <p className="text-xs text-gray-500 truncate">{resource.source}</p>
          </div>
        </div>

        <Chip size="sm" variant="flat" color="secondary">
          {Math.round(resource.finalScore * 100)}
        </Chip>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          color="secondary"
          variant="flat"
          onPress={onOpenResource}
          startContent={<ExternalLink className="w-3.5 h-3.5" />}
        >
          Mở tài liệu
        </Button>

        <Button
          size="sm"
          variant="light"
          onPress={onMarkHelpful}
          isIconOnly
          aria-label="Hữu ích"
        >
          <HandHelping className="w-4 h-4 text-green-600" />
        </Button>

        <Button
          size="sm"
          variant="light"
          onPress={onMarkNotHelpful}
          isIconOnly
          aria-label="Không hữu ích"
        >
          <ThumbsDown className="w-4 h-4 text-orange-600" />
        </Button>
      </div>
    </div>
  );
}
