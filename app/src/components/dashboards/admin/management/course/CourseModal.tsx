"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Switch } from "@heroui/switch";
import { ChevronDown } from "lucide-react";
import { Course, CourseFormData } from "@/types/course";
import { ThumbnailUpload } from "./ThumbnailUpload";

interface CourseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingCourse: Course | null;
  formData: CourseFormData;
  onFormDataChange: (data: CourseFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const GRADE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SUBJECTS = [
  "Toán học",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Ngữ văn",
  "Lịch sử",
  "Địa lý",
  "Tiếng Anh",
  "GDCD",
  "Tin học",
  "Công nghệ",
  "Thể dục",
  "Mỹ thuật",
  "Âm nhạc",
];

export function CourseModal({
  isOpen,
  onOpenChange,
  isEditMode,
  editingCourse,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: CourseModalProps) {
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);

  const updateFormData = (updates: Partial<CourseFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Tên môn học"
                  placeholder="Ví dụ: Toán học lớp 10"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  isRequired
                />

                <Textarea
                  label="Mô tả"
                  placeholder="Mô tả về môn học..."
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  isRequired
                  minRows={3}
                />

                <ThumbnailUpload
                  value={formData.thumbnailUrl}
                  onChange={(url) => updateFormData({ thumbnailUrl: url })}
                  label="Hình ảnh thumbnail"
                  disabled={isSubmitting}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isSubjectOpen} onOpenChange={setIsSubjectOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
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

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Khối <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isGradeOpen} onOpenChange={setIsGradeOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {formData.gradeLevel ? `Khối ${formData.gradeLevel}` : "Chọn khối"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Grade level selection"
                      selectedKeys={formData.gradeLevel ? [formData.gradeLevel.toString()] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFormData({ gradeLevel: parseInt(value) });
                        setIsGradeOpen(false);
                      }}
                    >
                      {GRADE_LEVELS.map((grade) => (
                        <DropdownItem key={grade.toString()} textValue={`Khối ${grade}`}>
                          Khối {grade}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <Switch
                  isSelected={formData.active ?? true}
                  onValueChange={(value) => updateFormData({ active: value })}
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-[#181d27]">Trạng thái hoạt động</p>
                    <p className="text-xs text-[#535862]">
                      {formData.active ? "Môn học đang hoạt động" : "Môn học tạm ngưng"}
                    </p>
                  </div>
                </Switch>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                className="text-[#414651]"
                isDisabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                className="bg-[#7f56d9] text-white font-semibold"
                onPress={onSubmit}
                isDisabled={
                  isSubmitting ||
                  !formData.title ||
                  !formData.description ||
                  !formData.thumbnailUrl ||
                  !formData.subject ||
                  !formData.gradeLevel
                }
                isLoading={isSubmitting}
              >
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

