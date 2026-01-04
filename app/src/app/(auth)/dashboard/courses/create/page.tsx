"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Switch } from "@heroui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  ImageIcon,
  Download03Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CourseFormData } from "@/types/course";
import { GRADE_LEVELS, SUBJECTS } from "@/constants/course";
import { api } from "@/lib/api";
import { addToast } from "@heroui/toast";

const VISIBILITY_OPTIONS = [
  { value: "public" as const, label: "Công khai" },
  { value: "private" as const, label: "Riêng tư" },
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    thumbnailUrl: "",
    subject: "",
    gradeLevel: 10,
    active: true,
    visibility: "public",
  });

  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string>("");

  const updateFormData = (updates: Partial<CourseFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        title: "Định dạng không hợp lệ",
        description: "Chỉ chấp nhận file JPG hoặc PNG",
        color: "danger",
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        title: "File quá lớn",
        description: "Kích thước file không được vượt quá 5MB",
        color: "danger",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      addToast({
        title: "Đang tải ảnh lên...",
        description: "Vui lòng đợi trong giây lát",
        color: "primary",
      });

      const response = await api.upload.image(file, (progress) => {
        setUploadProgress(progress);
      });

      updateFormData({ thumbnailUrl: response.url });
      setImagePreview(response.url);

      addToast({
        title: "Tải ảnh thành công!",
        description: "Ảnh bìa đã được tải lên",
        color: "success",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      addToast({
        title: "Tải ảnh thất bại",
        description:
          error.response?.data?.message || "Đã có lỗi xảy ra khi tải ảnh",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    updateFormData({ thumbnailUrl: "" });
    setImagePreview("");
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      addToast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên khóa học",
        color: "danger",
      });
      return false;
    }

    if (!formData.subject) {
      addToast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn môn học",
        color: "danger",
      });
      return false;
    }

    if (!formData.gradeLevel) {
      addToast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn khối",
        color: "danger",
      });
      return false;
    }

    if (!formData.thumbnailUrl) {
      addToast({
        title: "Thiếu thông tin",
        description: "Vui lòng tải lên ảnh bìa",
        color: "danger",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      addToast({
        title: "Đang tạo khóa học...",
        description: "Vui lòng đợi trong giây lát",
        color: "primary",
      });

      await api.courses.create({
        title: formData.title,
        description: formData.description,
        thumbnailUrl: formData.thumbnailUrl,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        active: formData.active ?? true,
        visibility: formData.visibility,
      });

      addToast({
        title: "Tạo khóa học thành công!",
        description: "Khóa học đã được tạo và lưu vào hệ thống",
        color: "success",
      });

      setTimeout(() => {
        router.push("/dashboard/courses");
      }, 1000);
    } catch (error: any) {
      console.error("Create course error:", error);
      addToast({
        title: "Tạo khóa học thất bại",
        description:
          error.response?.data?.message || "Đã có lỗi xảy ra khi tạo khóa học",
        color: "danger",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/courses");
  };

  return (
    <LayoutDashboard>
      <div className="max-w-[1024px] mx-auto mb-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tạo Khóa học mới
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            Điền thông tin chi tiết để thiết lập khóa học mới trên hệ thống.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Course Name */}
              <div className="md:col-span-12 space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300">
                  Tên khóa học <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Nhập tên đầy đủ của khóa học..."
                  className="h-11"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  disabled={isCreating}
                />
              </div>

              {/* Duration */}
              <div className="md:col-span-6 space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300">
                  Thời lượng dự kiến (giờ)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    className="h-11 pr-12"
                    disabled={isCreating}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
                    h
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="md:col-span-6 space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300">
                  Môn học <span className="text-red-500">*</span>
                </Label>
                <Dropdown
                  isOpen={isSubjectOpen}
                  onOpenChange={setIsSubjectOpen}
                >
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-between border-slate-300 dark:border-slate-600 h-11"
                      endContent={<ChevronDown className="size-4" />}
                      isDisabled={isCreating}
                    >
                      {formData.subject || "Chọn môn học"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Subject selection"
                    selectedKeys={formData.subject ? [formData.subject] : []}
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      updateFormData({ subject: value });
                      setIsSubjectOpen(false);
                    }}
                  >
                    {SUBJECTS.map((subject) => (
                      <DropdownItem key={subject} textValue={subject}>
                        {subject}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              {/* Grade Level */}
              <div className="md:col-span-6 space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300">
                  Khối <span className="text-red-500">*</span>
                </Label>
                <Dropdown isOpen={isGradeOpen} onOpenChange={setIsGradeOpen}>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-between border-slate-300 dark:border-slate-600 h-11"
                      endContent={<ChevronDown className="size-4" />}
                      isDisabled={isCreating}
                    >
                      {formData.gradeLevel
                        ? `Khối ${formData.gradeLevel}`
                        : "Chọn khối"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Grade level selection"
                    selectedKeys={
                      formData.gradeLevel
                        ? [formData.gradeLevel.toString()]
                        : []
                    }
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      updateFormData({ gradeLevel: parseInt(value) });
                      setIsGradeOpen(false);
                    }}
                  >
                    {GRADE_LEVELS.map((grade) => (
                      <DropdownItem
                        key={grade.toString()}
                        textValue={`Khối ${grade}`}
                      >
                        Khối {grade}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              {/* Visibility */}
              <div className="md:col-span-6 space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300">
                  Hiển thị <span className="text-red-500">*</span>
                </Label>
                <Dropdown
                  isOpen={isVisibilityOpen}
                  onOpenChange={setIsVisibilityOpen}
                >
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-between border-slate-300 dark:border-slate-600 h-11"
                      endContent={<ChevronDown className="size-4" />}
                      isDisabled={isCreating}
                    >
                      {formData.visibility
                        ? VISIBILITY_OPTIONS.find(
                            (opt) => opt.value === formData.visibility
                          )?.label || "Chọn hiển thị"
                        : "Chọn hiển thị"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Visibility selection"
                    selectedKeys={
                      formData.visibility
                        ? new Set([formData.visibility])
                        : new Set()
                    }
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as "public" | "private";
                      updateFormData({ visibility: value });
                      setIsVisibilityOpen(false);
                    }}
                  >
                    {VISIBILITY_OPTIONS.map((option) => (
                      <DropdownItem key={option.value} textValue={option.label}>
                        {option.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              {/* Description */}
              <div className="md:col-span-12 space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300">
                  Mô tả chi tiết
                </Label>
                <Textarea
                  rows={5}
                  placeholder="Nhập nội dung tóm tắt, mục tiêu khóa học và các yêu cầu cần thiết..."
                  className="resize-y"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData({ description: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>

              {/* Active Switch */}
              <div className="md:col-span-12">
                <Switch
                  isSelected={formData.active ?? true}
                  onValueChange={(value) => updateFormData({ active: value })}
                  isDisabled={isCreating}
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Trạng thái hoạt động
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formData.active
                        ? "Môn học đang hoạt động"
                        : "Môn học tạm ngưng"}
                    </p>
                  </div>
                </Switch>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Cover Image */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <HugeiconsIcon
                  icon={ImageIcon}
                  className="text-primary"
                  size={20}
                />
                Thiết lập ảnh bìa <span className="text-red-500">*</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="shrink-0">
                  <div className="relative w-full sm:w-[320px] aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden group hover:border-primary dark:hover:border-primary transition-colors">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Course thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={isCreating}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          onChange={handleFileChange}
                          disabled={isUploading || isCreating}
                        />
                        <div className="relative z-10 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4 text-center">
                          {isUploading ? (
                            <>
                              <HugeiconsIcon
                                icon={Loading03Icon}
                                size={32}
                                className="mb-2 animate-spin text-primary"
                              />
                              <p className="text-xs font-medium text-primary">
                                Đang tải lên... {uploadProgress}%
                              </p>
                            </>
                          ) : (
                            <>
                              <HugeiconsIcon
                                icon={CloudUploadIcon}
                                size={32}
                                className="mb-2 group-hover:text-primary transition-colors"
                              />
                              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                                Kéo thả hoặc click để tải lên
                              </p>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4 flex-1">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Lưu ý:
                      </span>{" "}
                      Sử dụng ảnh có tỷ lệ 16:9 để hiển thị tốt nhất trên các
                      thiết bị.
                    </p>
                    <p>Định dạng hỗ trợ: JPG, PNG. Kích thước tối đa: 5MB.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="light"
                onPress={handleCancel}
                className="text-slate-600 dark:text-slate-300"
                isDisabled={isCreating}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white rounded-lg"
                startContent={
                  isCreating ? (
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <HugeiconsIcon icon={Download03Icon} size={18} />
                  )
                }
                isDisabled={isCreating || isUploading}
              >
                {isCreating ? "Đang lưu..." : "Lưu khóa học"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </LayoutDashboard>
  );
}
