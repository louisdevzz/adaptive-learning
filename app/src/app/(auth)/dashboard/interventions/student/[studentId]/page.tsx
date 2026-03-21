"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const statusOptions = [
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "dismissed", label: "Dismissed" },
];

const priorityOptions = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
  { key: "critical", label: "Critical" },
];

export default function InterventionStudentPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [detailData, suggestionData] = await Promise.all([
        api.teacherInterventions.getStudentDetail(studentId),
        api.teacherInterventions.getStudentSuggestions(studentId),
      ]);
      setDetail(detailData);
      setSuggestions(suggestionData.suggestions || []);
    } catch (error) {
      console.error("Failed to load student interventions data", error);
      toast.error("Không thể tải dữ liệu học sinh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;
    loadData();
  }, [studentId]);

  const handleCreateIntervention = async () => {
    if (!title.trim() || !description.trim()) return;

    try {
      setCreating(true);
      await api.teacherInterventions.createIntervention({
        studentId,
        type: "manual",
        title: title.trim(),
        description: description.trim(),
        priority: priority as "low" | "medium" | "high" | "critical",
      });
      setTitle("");
      setDescription("");
      await loadData();
      toast.success("Đã tạo intervention");
    } catch (error) {
      console.error("Failed to create intervention", error);
      toast.error("Không thể tạo intervention");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.teacherInterventions.updateIntervention(id, {
        status: status as 'pending' | 'in_progress' | 'completed' | 'dismissed',
      });
      await loadData();
      toast.success("Đã cập nhật trạng thái");
    } catch (error) {
      console.error("Failed to update intervention status", error);
      toast.error("Không thể cập nhật trạng thái");
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
        <h1 className="text-2xl md:text-3xl font-bold text-[#010101] dark:text-white">
          Interventions - {detail?.student?.fullName || "Student"}
        </h1>
        <p className="text-[#717680] dark:text-gray-400 mt-1">
          Engagement: {detail?.insight?.engagementScore || 0}% • Risk KPs: {Array.isArray(detail?.insight?.riskKps) ? detail.insight.riskKps.length : 0}
        </p>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">AI Suggestions</h2>
          {suggestions.length === 0 ? (
            <p className="text-sm text-[#717680]">Chưa có gợi ý.</p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="rounded-lg border border-[#e9eaeb] p-3">
                  <p className="font-medium text-[#181d27] dark:text-white">{suggestion.title}</p>
                  <ul className="text-sm text-[#717680] mt-1 list-disc pl-5">
                    {(suggestion.actions || []).map((action: string, actionIndex: number) => (
                      <li key={actionIndex}>{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">Tạo intervention thủ công</h2>
          <Input label="Tiêu đề" value={title} onValueChange={setTitle} />
          <Textarea
            label="Mô tả"
            value={description}
            onValueChange={setDescription}
            minRows={4}
          />
          <Select
            label="Mức ưu tiên"
            selectedKeys={[priority]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0];
              if (typeof value === "string") setPriority(value);
            }}
          >
            {priorityOptions.map((item) => (
              <SelectItem key={item.key}>{item.label}</SelectItem>
            ))}
          </Select>
          <div className="flex justify-end">
            <Button color="primary" onPress={handleCreateIntervention} isDisabled={creating}>
              {creating ? "Đang tạo..." : "Tạo intervention"}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">Danh sách interventions</h2>
          {(detail?.interventions || []).length === 0 ? (
            <p className="text-sm text-[#717680]">Chưa có intervention.</p>
          ) : (
            <div className="space-y-2">
              {detail.interventions.map((intervention: any) => (
                <div key={intervention.id} className="rounded-lg border border-[#e9eaeb] p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#181d27] dark:text-white">{intervention.title}</p>
                      <p className="text-sm text-[#717680]">{intervention.description}</p>
                    </div>
                    <div className="w-48">
                      <Select
                        selectedKeys={[intervention.status]}
                        onSelectionChange={(keys) => {
                          const next = Array.from(keys)[0];
                          if (typeof next === "string") {
                            handleUpdateStatus(intervention.id, next);
                          }
                        }}
                      >
                        {statusOptions.map((item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
