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
  Download03Icon
} from "@hugeicons/core-free-icons";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { CourseFormData } from "@/types/course";
import { GRADE_LEVELS, SUBJECTS } from "@/constants/course";

const VISIBILITY_OPTIONS = [
  { value: "public" as const, label: "Công khai" },
  { value: "private" as const, label: "Riêng tư" },
];

export default function CreateCoursePage() {
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

  const updateFormData = (updates: Partial<CourseFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
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
          <form className="p-6 md:p-8 space-y-8">
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
                <Dropdown isOpen={isSubjectOpen} onOpenChange={setIsSubjectOpen}>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-between border-slate-300 dark:border-slate-600 h-11"
                      endContent={<ChevronDown className="size-4" />}
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
                      const value = Array.from(keys)[0] as
                        | "public"
                        | "private";
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
                />
              </div>

              {/* Active Switch */}
              <div className="md:col-span-12">
                <Switch
                  isSelected={formData.active ?? true}
                  onValueChange={(value) => updateFormData({ active: value })}
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
                Thiết lập ảnh bìa
              </h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="shrink-0">
                  <div className="relative w-full sm:w-[320px] aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden group hover:border-primary dark:hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateFormData({
                              thumbnailUrl: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4 text-center">
                      <HugeiconsIcon
                        icon={CloudUploadIcon}
                        size={32}
                        className="mb-2 group-hover:text-primary transition-colors"
                      />
                      <p className="text-xs font-medium group-hover:text-primary transition-colors">
                        Kéo thả hoặc click để tải lên
                      </p>
                    </div>
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
                variant="light"
                onPress={() => {}}
                className="text-slate-600 dark:text-slate-300"
              >
                Hủy bỏ
              </Button>
              <Button
                onPress={() => {}}
                className="bg-blue-600 text-white rounded-lg"
                startContent={<HugeiconsIcon icon={Download03Icon} size={18} />}
              >
                Lưu khóa học
              </Button>
            </div>
          </form>
        </div>
      </div>
    </LayoutDashboard>
  );
}
