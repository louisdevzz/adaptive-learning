"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartIncreaseIcon,
  ChartDecreaseIcon,
  Remove01Icon,
} from "@hugeicons/core-free-icons";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  changeColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "up",
  icon,
  iconBg = "bg-blue-50 dark:bg-blue-900/20",
  iconColor = "text-[#135bec]",
  changeColor,
}: MetricCardProps) {
  const showChange = change && changeType;

  const getChangeStyles = () => {
    switch (changeType) {
      case "up":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "down":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      case "neutral":
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
      default:
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "up":
        return (
          <HugeiconsIcon
            icon={ChartIncreaseIcon}
            size={14}
            className="w-3.5 h-3.5"
          />
        );
      case "down":
        return (
          <HugeiconsIcon
            icon={ChartDecreaseIcon}
            size={14}
            className="w-3.5 h-3.5"
          />
        );
      case "neutral":
        return (
          <HugeiconsIcon
            icon={Remove01Icon}
            size={14}
            className="w-3.5 h-3.5"
          />
        );
      default:
        return (
          <HugeiconsIcon
            icon={ChartIncreaseIcon}
            size={14}
            className="w-3.5 h-3.5"
          />
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a202c] p-5 rounded-xl border border-[#e7ebf3] dark:border-gray-700 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        {icon && (
          <div
            className={`${iconBg} p-2 rounded-lg ${iconColor} transition-colors`}
          >
            {icon}
          </div>
        )}
        {showChange && (
          <span
            className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${getChangeStyles()}`}
            style={changeColor ? { color: changeColor } : undefined}
          >
            <span className="mr-0.5">{getChangeIcon()}</span>
            {change}
          </span>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-3xl font-bold text-[#0d121b] dark:text-white">
          {value}
        </h3>
        <p className="text-[#4c669a] dark:text-gray-400 text-sm font-medium flex items-center gap-1">
          {title}
        </p>
      </div>
    </div>
  );
}
