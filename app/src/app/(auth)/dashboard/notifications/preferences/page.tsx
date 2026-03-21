"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, Checkbox, Select, SelectItem } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const digestOptions = [
  { key: "realtime", label: "Realtime" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
];

const allTypes = [
  { key: "progress_alert", label: "Cảnh báo tiến độ" },
  { key: "child_progress_alert", label: "Cảnh báo tiến độ của con" },
  { key: "progress_update", label: "Cập nhật tiến độ" },
  { key: "child_progress_update", label: "Cập nhật tiến độ của con" },
  { key: "assignment_assigned", label: "Bài tập được giao" },
  { key: "child_assignment_assigned", label: "Con được giao bài tập" },
  { key: "assignment_graded", label: "Bài tập đã chấm" },
  { key: "child_assignment_graded", label: "Bài tập của con đã chấm" },
  { key: "study_inactivity", label: "Nhắc nhở không học" },
  { key: "failure_streak", label: "Chuỗi làm sai" },
  { key: "mastery_celebration", label: "Chúc mừng tiến bộ" },
  { key: "parent_risk_escalation", label: "Cảnh báo rủi ro học tập" },
  { key: "weekly_report_ready", label: "Báo cáo tuần sẵn sàng" },
  { key: "teacher_outlier_detected", label: "Lớp có outlier" },
  { key: "teacher_intervention_overdue", label: "Intervention quá hạn" },
  { key: "digest_ready", label: "Digest sẵn sàng" },
  { key: "system", label: "Hệ thống" },
];

export default function NotificationPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("realtime");
  const [quietHoursStart, setQuietHoursStart] = useState("");
  const [quietHoursEnd, setQuietHoursEnd] = useState("");
  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const preference = await api.smartAlerts.getPreferences();

        setDigestFrequency(preference?.digestFrequency || "realtime");
        setQuietHoursStart(preference?.quietHoursStart || "");
        setQuietHoursEnd(preference?.quietHoursEnd || "");
        setEnabledTypes(preference?.enabledTypes || {});
      } catch (error) {
        console.error("Failed to load notification preferences", error);
        toast.error("Không thể tải tùy chọn thông báo");
      } finally {
        setLoading(false);
      }
    };

    void loadPreferences();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.smartAlerts.updatePreferences({
        digestFrequency: digestFrequency as "realtime" | "daily" | "weekly",
        quietHoursStart: quietHoursStart.trim() ? quietHoursStart.trim() : null,
        quietHoursEnd: quietHoursEnd.trim() ? quietHoursEnd.trim() : null,
        enabledTypes,
      });
      toast.success("Đã lưu tùy chọn thông báo");
    } catch (error) {
      console.error("Failed to save preferences", error);
      toast.error("Không thể lưu tùy chọn");
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-[#010101] dark:text-white">Notification Preferences</h1>
        <p className="text-[#717680] dark:text-gray-400 mt-1">Tùy chỉnh loại thông báo, tần suất digest và quiet hours.</p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <Select
            label="Digest frequency"
            selectedKeys={[digestFrequency]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0];
              if (typeof value === "string") setDigestFrequency(value);
            }}
          >
            {digestOptions.map((option) => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            ))}
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="rounded-lg border border-[#e9eaeb] px-3 py-2"
              placeholder="Quiet start (HH:mm)"
              value={quietHoursStart}
              onChange={(e) => setQuietHoursStart(e.target.value)}
            />
            <input
              className="rounded-lg border border-[#e9eaeb] px-3 py-2"
              placeholder="Quiet end (HH:mm)"
              value={quietHoursEnd}
              onChange={(e) => setQuietHoursEnd(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">Enabled types</h2>
          {allTypes.map((item) => (
            <Checkbox
              key={item.key}
              isSelected={enabledTypes[item.key] !== false}
              onValueChange={(value) =>
                setEnabledTypes((prev) => ({ ...prev, [item.key]: value }))
              }
            >
              {item.label}
            </Checkbox>
          ))}
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button color="primary" onPress={handleSave} isDisabled={saving}>
          {saving ? "Đang lưu..." : "Lưu tùy chọn"}
        </Button>
      </div>
    </div>
  );
}
