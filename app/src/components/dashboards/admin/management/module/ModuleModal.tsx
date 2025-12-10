"use client";

import { useState, useEffect } from "react";
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
import { ChevronDown } from "lucide-react";
import { Module, ModuleFormData } from "@/types/course";
import { Course } from "@/types/course";
import { api } from "@/lib/api";

interface ModuleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingModule: Module | null;
  formData: ModuleFormData;
  onFormDataChange: (data: ModuleFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ModuleModal({
  isOpen,
  onOpenChange,
  isEditMode,
  editingModule,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: ModuleModalProps) {
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch courses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === formData.courseId);

  const updateFormData = (updates: Partial<ModuleFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa chủ đề" : "Thêm chủ đề mới"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isCourseOpen} onOpenChange={setIsCourseOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                        isDisabled={loadingCourses}
                      >
                        {selectedCourse
                          ? selectedCourse.title
                          : loadingCourses
                          ? "Đang tải..."
                          : "Chọn môn học"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Course selection"
                      selectedKeys={formData.courseId ? [formData.courseId] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFormData({ courseId: value });
                        setIsCourseOpen(false);
                      }}
                    >
                      {courses.map((course) => (
                        <DropdownItem key={course.id} textValue={course.title}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-[#181d27]">
                              {course.title}
                            </span>
                            <span className="text-xs text-[#535862]">
                              {course.subject} - Khối {course.gradeLevel}
                            </span>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <Input
                  label="Tên chủ đề"
                  placeholder="Ví dụ: Đại số và giải tích"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  isRequired
                />

                <Textarea
                  label="Mô tả"
                  placeholder="Mô tả về chủ đề..."
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  isRequired
                  minRows={3}
                />

                <Input
                  label="Thứ tự"
                  placeholder="0"
                  type="number"
                  value={formData.orderIndex.toString()}
                  onChange={(e) => updateFormData({ orderIndex: parseInt(e.target.value) || 0 })}
                  isRequired
                  min={0}
                  description="Thứ tự hiển thị của chủ đề trong môn học"
                />
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
                  !formData.courseId ||
                  !formData.title ||
                  !formData.description ||
                  formData.orderIndex < 0
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

