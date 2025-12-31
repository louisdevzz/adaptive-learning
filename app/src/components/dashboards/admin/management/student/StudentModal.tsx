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
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { Student, StudentFormData, Gender } from "@/types/student";
import { AvatarUpload } from "../admin/AvatarUpload";
import { SCHOOLS } from "@/constants/schools";

interface StudentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingStudent: Student | null;
  formData: StudentFormData;
  onFormDataChange: (data: StudentFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const genderLabels: Record<Gender, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

export function StudentModal({
  isOpen,
  onOpenChange,
  isEditMode,
  editingStudent,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: StudentModalProps) {
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset showPassword when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
    }
  }, [isOpen]);

  // Auto-generate student code when modal opens in create mode
  useEffect(() => {
    if (isOpen && !isEditMode && !formData.studentCode) {
      // Generate student code with format: ADL+TIMESTAMP
      const timestamp = Date.now();
      const studentCode = `ADL${timestamp}`;
      updateFormData({ studentCode });
    }
  }, [isOpen, isEditMode]);

  const updateFormData = (updates: Partial<StudentFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="border-b border-[#e9eaeb] pb-4 mb-2">
                  <h3 className="font-semibold text-sm text-[#181d27] mb-3">Thông tin tài khoản</h3>
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Email"
                      placeholder="email@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      isRequired
                    />
                    {!isEditMode && (
                      <Input
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateFormData({ password: e.target.value })}
                        isRequired
                        endContent={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none"
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                          >
                            {showPassword ? (
                              <EyeOff className="text-[#535862] size-5" />
                            ) : (
                              <Eye className="text-[#535862] size-5" />
                            )}
                          </button>
                        }
                      />
                    )}
                    {isEditMode && (
                      <Input
                        label="Mật khẩu mới (để trống nếu không đổi)"
                        placeholder="Nhập mật khẩu mới"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateFormData({ password: e.target.value })}
                        endContent={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none"
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                          >
                            {showPassword ? (
                              <EyeOff className="text-[#535862] size-5" />
                            ) : (
                              <Eye className="text-[#535862] size-5" />
                            )}
                          </button>
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="border-b border-[#e9eaeb] pb-4 mb-2">
                  <h3 className="font-semibold text-sm text-[#181d27] mb-3">Thông tin cá nhân</h3>
                  <Input
                    label="Họ và tên"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={(e) => updateFormData({ fullName: e.target.value })}
                    isRequired
                  />

                <Input
                  label="Lớp"
                  placeholder="Nhập lớp (ví dụ: 10, 11, 12)"
                  type="number"
                  value={formData.gradeLevel.toString()}
                  onChange={(e) => updateFormData({ gradeLevel: parseInt(e.target.value) || 0 })}
                  isRequired
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Tên trường <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isSchoolOpen} onOpenChange={setIsSchoolOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {formData.schoolName || "Chọn trường"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="School selection"
                      selectedKeys={formData.schoolName ? [formData.schoolName] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        if (value) {
                          updateFormData({
                            schoolName: value,
                          });
                          setIsSchoolOpen(false);
                        }
                      }}
                      classNames={{
                        base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[300px] max-h-[400px] overflow-y-auto",
                      }}
                    >
                      {SCHOOLS.map((school) => (
                        <DropdownItem key={school} textValue={school}>
                          <span className="text-sm font-medium text-[#181d27]">{school}</span>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <Input
                  label="Ngày sinh"
                  placeholder="YYYY-MM-DD"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                  isRequired
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isGenderOpen} onOpenChange={setIsGenderOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {genderLabels[formData.gender]}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Gender selection"
                      selectedKeys={[formData.gender]}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFormData({
                          gender: value as Gender,
                        });
                        setIsGenderOpen(false);
                      }}
                    >
                      <DropdownItem key="male">Nam</DropdownItem>
                      <DropdownItem key="female">Nữ</DropdownItem>
                      <DropdownItem key="other">Khác</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                  <AvatarUpload
                    value={formData.avatarUrl}
                    onChange={(url) => updateFormData({ avatarUrl: url })}
                    label="Avatar (tùy chọn)"
                  />
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
                  !formData.fullName ||
                  !formData.gradeLevel ||
                  !formData.schoolName ||
                  !formData.dateOfBirth ||
                  (!isEditMode && (!formData.email || !formData.password || !formData.studentCode))
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

