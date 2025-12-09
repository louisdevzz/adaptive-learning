"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
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
import { Class, ClassFormData } from "@/types/class";
import { Teacher } from "@/types/teacher";
import { api } from "@/lib/api";

interface ClassModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingClass: Class | null;
  formData: ClassFormData;
  onFormDataChange: (data: ClassFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ClassModal({
  isOpen,
  onOpenChange,
  isEditMode,
  editingClass,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: ClassModalProps) {
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isSchoolYearOpen, setIsSchoolYearOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Fetch teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const data = await api.teachers.getAll();
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const selectedTeacher = teachers.find((t) => t.id === formData.homeroomTeacherId);

  const updateFormData = (updates: Partial<ClassFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const teacherItems = [
    { key: "none", label: "Không có", email: "" },
    ...teachers.map((t) => ({ key: t.id, label: t.fullName, email: t.email })),
  ];

  // Generate school year options (current year and next 2 years)
  const currentYear = new Date().getFullYear();
  const schoolYearOptions = [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
    `${currentYear + 2}-${currentYear + 3}`,
  ];

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Tên lớp"
                  placeholder="Ví dụ: 10A1, 11B2"
                  value={formData.className}
                  onChange={(e) => updateFormData({ className: e.target.value })}
                  isRequired
                  maxLength={20}
                />

                <Input
                  label="Khối"
                  placeholder="Nhập khối (ví dụ: 10, 11, 12)"
                  type="number"
                  value={formData.gradeLevel.toString()}
                  onChange={(e) => updateFormData({ gradeLevel: parseInt(e.target.value) || 0 })}
                  isRequired
                  min={1}
                  max={12}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Năm học <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isSchoolYearOpen} onOpenChange={setIsSchoolYearOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {formData.schoolYear || "Chọn năm học"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="School year selection"
                      selectedKeys={formData.schoolYear ? [formData.schoolYear] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFormData({ schoolYear: value });
                        setIsSchoolYearOpen(false);
                      }}
                    >
                      {schoolYearOptions.map((year) => (
                        <DropdownItem key={year} textValue={year}>
                          {year}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Giáo viên chủ nhiệm (tùy chọn)
                  </label>
                  <Dropdown isOpen={isTeacherOpen} onOpenChange={setIsTeacherOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                        isDisabled={loadingTeachers}
                      >
                        {selectedTeacher
                          ? selectedTeacher.fullName
                          : loadingTeachers
                          ? "Đang tải..."
                          : "Chọn giáo viên"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Teacher selection"
                      selectedKeys={formData.homeroomTeacherId ? [formData.homeroomTeacherId] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        if (value === "none") {
                          updateFormData({ homeroomTeacherId: undefined });
                        } else {
                          updateFormData({ homeroomTeacherId: value || undefined });
                        }
                        setIsTeacherOpen(false);
                      }}
                    >
                      {teacherItems.map((item) => (
                        <DropdownItem key={item.key} textValue={item.label}>
                          {item.key === "none" ? (
                            item.label
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-[#181d27]">
                                {item.label}
                              </span>
                              <span className="text-xs text-[#535862]">{item.email}</span>
                            </div>
                          )}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
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
                  !formData.className ||
                  !formData.gradeLevel ||
                  !formData.schoolYear
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

