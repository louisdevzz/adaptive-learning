"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { ArrowLeft, Save, Users, Upload, X } from "lucide-react";

type AssignmentType =
  | "practice"
  | "quiz"
  | "exam"
  | "homework"
  | "test"
  | "adaptive";

interface ClassItem {
  id: string;
  className: string;
  gradeLevel: number;
  schoolYear: string;
}

const ASSIGNMENT_TYPES: Array<{ value: AssignmentType; label: string }> = [
  { value: "practice", label: "Luyện tập" },
  { value: "quiz", label: "Quiz" },
  { value: "exam", label: "Kiểm tra" },
  { value: "homework", label: "Bài tập về nhà" },
  { value: "test", label: "Test" },
  { value: "adaptive", label: "Adaptive" },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignmentType, setAssignmentType] = useState<AssignmentType>("homework");
  const [dueDate, setDueDate] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [aiGradingEnabled, setAiGradingEnabled] = useState(false);
  const [gradingRubric, setGradingRubric] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentMimeType, setAttachmentMimeType] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const role = user?.role?.toLowerCase() || "";
  const isTeacher = role === "teacher";

  const fetchData = useCallback(async () => {
    if (!user || !isTeacher) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const classesData = await api.classes.getAll();

      setClasses(Array.isArray(classesData) ? (classesData as ClassItem[]) : []);
    } catch (error) {
      console.error("Failed to load create-assignment data:", error);
      toast.error("Không thể tải dữ liệu tạo bài tập");
    } finally {
      setLoading(false);
    }
  }, [user, isTeacher]);

  useEffect(() => {
    if (!userLoading) {
      fetchData();
    }
  }, [userLoading, fetchData]);

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAttachment = async (file: File | null) => {
    if (!file) return;

    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "doc", "docx"];

    if (
      !allowedMimeTypes.includes(file.type) &&
      !allowedExtensions.includes(extension || "")
    ) {
      toast.error("Chỉ hỗ trợ PDF, DOC, DOCX");
      return;
    }

    try {
      setUploadingAttachment(true);
      setUploadProgress(0);
      const uploaded = await api.upload.document(file, setUploadProgress);
      setAttachmentUrl(uploaded.url);
      setAttachmentName(file.name);
      setAttachmentMimeType(file.type || "application/octet-stream");
      toast.success("Đã tải file bài tập");
    } catch (error) {
      console.error("Failed to upload assignment attachment:", error);
      toast.error("Không thể tải file bài tập");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const clearAttachment = () => {
    setAttachmentUrl("");
    setAttachmentName("");
    setAttachmentMimeType("");
    setUploadProgress(0);
  };

  const handleCreate = async () => {
    if (!user || !isTeacher) return;
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    if (uploadingAttachment) {
      toast.error("Đang tải file, vui lòng đợi");
      return;
    }

    try {
      setSaving(true);

      const created = await api.assignments.create({
        teacherId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        assignmentType,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        isPublished,
        aiGradingEnabled,
        gradingRubric: aiGradingEnabled ? gradingRubric.trim() || undefined : undefined,
        attachmentUrl: attachmentUrl || undefined,
        attachmentName: attachmentName || undefined,
        attachmentMimeType: attachmentMimeType || undefined,
      });

      if (selectedClassIds.length > 0) {
        await Promise.all(
          selectedClassIds.map((classId) =>
            api.assignments.createTarget({
              assignmentId: created.id,
              targetType: "class",
              targetId: classId,
              assignedBy: user.id,
            })
          )
        );
      }

      toast.success("Đã tạo bài tập thành công");
      router.push(`/dashboard/assignments/${created.id}`);
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error("Tạo bài tập thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <p className="text-sm text-[#717680]">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="bg-white rounded-xl border border-[#e9eaeb] p-6">
        <p className="text-sm text-[#717680]">
          Chỉ giáo viên mới có thể tạo bài tập.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/assignments"
            className="inline-flex items-center gap-1 text-sm text-[#717680] hover:text-[#181d27]"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          <h1 className="text-2xl font-bold text-[#181d27] mt-2">Tạo bài tập mới</h1>
          <p className="text-sm text-[#717680] mt-1">
            Cấu hình nội dung và giao bài tập cho lớp học
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Save className="w-4 h-4" />}
          isLoading={saving}
          isDisabled={uploadingAttachment}
          onPress={handleCreate}
        >
          Lưu bài tập
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-5 space-y-4">
          <h2 className="font-semibold text-[#181d27]">Thông tin cơ bản</h2>
          <Input
            label="Tiêu đề"
            placeholder="VD: Bài tập đại số tuần 3"
            value={title}
            onValueChange={setTitle}
          />
          <div>
            <label className="text-sm font-medium text-[#414651]">
              Mô tả (tuỳ chọn)
            </label>
            <textarea
              className="mt-1 w-full border border-[#d5d7da] rounded-xl px-3 py-2 text-sm min-h-[140px]"
              placeholder="Nhập mô tả bài tập (có thể bỏ trống)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#414651]">
              File bài tập (PDF/DOC/DOCX)
            </label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 h-10 rounded-xl border border-[#d5d7da] text-sm text-[#414651] cursor-pointer hover:bg-[#f8f9fc]">
                <Upload className="w-4 h-4" />
                Tải file
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    void handleSelectAttachment(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {uploadingAttachment ? (
                <span className="text-xs text-[#717680]">
                  Đang tải {uploadProgress}%
                </span>
              ) : null}
            </div>
            {attachmentUrl ? (
              <div className="mt-2 flex items-center justify-between gap-2 border border-[#ececec] rounded-lg px-3 py-2">
                <span className="text-sm text-[#414651] truncate">
                  {attachmentName || "Tệp đã tải lên"}
                </span>
                <button
                  type="button"
                  onClick={clearAttachment}
                  className="inline-flex items-center gap-1 text-xs text-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                  Gỡ file
                </button>
              </div>
            ) : (
              <p className="mt-1 text-xs text-[#717680]">
                Không bắt buộc. Dùng khi giáo viên muốn đính kèm đề bài dạng tài liệu.
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm font-medium text-[#414651]">
                Loại bài tập
              </label>
              <select
                className="mt-1 w-full border border-[#d5d7da] rounded-xl px-3 py-2 text-sm"
                value={assignmentType}
                onChange={(e) =>
                  setAssignmentType(e.target.value as AssignmentType)
                }
              >
                {ASSIGNMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="due-date"
                className="text-sm font-medium text-[#414651]"
              >
                Hạn nộp
              </label>
              <input
                id="due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 h-10 w-full border border-[#d5d7da] rounded-xl px-3 text-sm bg-white"
              />
            </div>
            <div className="h-10 flex items-center">
              <label className="inline-flex items-center gap-2 text-sm text-[#414651] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Xuất bản ngay
              </label>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-[#e9eaeb] p-4 bg-[#fafafa]">
            <label className="inline-flex items-center gap-2 text-sm text-[#414651] cursor-pointer">
              <input
                type="checkbox"
                checked={aiGradingEnabled}
                onChange={(e) => setAiGradingEnabled(e.target.checked)}
              />
              Bật chấm AI cho file bài nộp
            </label>
            <p className="text-xs text-[#717680]">
              AI sẽ gợi ý điểm và nhận xét, giáo viên vẫn là người chấm điểm cuối.
            </p>
            {aiGradingEnabled ? (
              <div>
                <label className="text-sm font-medium text-[#414651]">
                  Tiêu chí chấm điểm cho AI (tuỳ chọn)
                </label>
                <p className="mt-1 text-xs text-[#717680]">
                  Đây là hướng dẫn để AI chấm bài. Bạn có thể mô tả cách cho điểm theo từng tiêu chí.
                  Nếu để trống, hệ thống sẽ dùng tiêu chí mặc định.
                </p>
                <textarea
                  className="mt-1 w-full border border-[#d5d7da] rounded-xl px-3 py-2 text-sm min-h-[120px]"
                  placeholder={`Ví dụ:
- Hiểu đúng kiến thức: 0-3 điểm
- Lập luận và cách giải: 0-4 điểm
- Kết quả đúng và trình bày rõ: 0-2 điểm
- Diễn đạt, dùng thuật ngữ: 0-1 điểm`}
                  value={gradingRubric}
                  onChange={(e) => setGradingRubric(e.target.value)}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e9eaeb] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6244F4]" />
            <h2 className="font-semibold text-[#181d27]">Giao cho lớp</h2>
          </div>
          <p className="text-sm text-[#717680]">
            Bài tập được tạo độc lập. Bạn có thể chọn lớp để giao ngay hoặc giao sau
            trong trang chi tiết.
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {classes.map((classItem) => (
              <label
                key={classItem.id}
                className="flex items-start gap-2 border border-[#ececec] rounded-lg p-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedClassIds.includes(classItem.id)}
                  onChange={() => toggleClass(classItem.id)}
                  className="mt-1"
                />
                <span className="text-sm text-[#414651]">
                  {classItem.className} - Khối {classItem.gradeLevel} (
                  {classItem.schoolYear})
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-[#717680]">
            Đã chọn {selectedClassIds.length} lớp
          </p>
        </div>
      </div>
    </div>
  );
}
