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
import { Eye, EyeOff, X, ChevronDown } from "lucide-react";
import { Teacher, TeacherFormData } from "@/types/teacher";
import { AvatarUpload } from "../admin/AvatarUpload";

interface TeacherModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingTeacher: Teacher | null;
  formData: TeacherFormData;
  onFormDataChange: (data: TeacherFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const SUBJECTS = [
  "Toán học",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Ngữ văn",
  "Lịch sử",
  "Địa lý",
  "Tiếng Anh",
  "Giáo dục công dân",
  "Tin học",
  "Thể dục",
  "Mỹ thuật",
  "Âm nhạc",
];

export function TeacherModal({
  isOpen,
  onOpenChange,
  isEditMode,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: TeacherModalProps) {
  const [isSpecializationOpen, setIsSpecializationOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newCertification, setNewCertification] = useState("");

  // Reset showPassword when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
      setNewCertification("");
    }
  }, [isOpen]);

  const updateFormData = (updates: Partial<TeacherFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const removeSpecialization = (subject: string) => {
    updateFormData({
      specialization: formData.specialization.filter((s) => s !== subject),
    });
  };

  const addCertification = () => {
    if (newCertification && !formData.certifications.includes(newCertification)) {
      updateFormData({
        certifications: [...formData.certifications, newCertification],
      });
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    updateFormData({
      certifications: formData.certifications.filter((c) => c !== cert),
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa giáo viên" : "Thêm giáo viên mới"}
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
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Họ và tên"
                      placeholder="Nhập họ và tên"
                      value={formData.fullName}
                      onChange={(e) => updateFormData({ fullName: e.target.value })}
                      isRequired
                    />

                    <AvatarUpload
                      value={formData.avatarUrl}
                      onChange={(url) => updateFormData({ avatarUrl: url })}
                      label="Avatar (tùy chọn)"
                    />

                  <Input
                    label="Số điện thoại"
                    placeholder="+84999999999"
                    value={formData.phone}
                    onChange={(e) => updateFormData({ phone: e.target.value })}
                    isRequired
                  />

                  <Input
                    label="Số năm kinh nghiệm"
                    type="number"
                    min="0"
                    value={formData.experienceYears.toString()}
                    onChange={(e) =>
                      updateFormData({ experienceYears: parseInt(e.target.value) || 0 })
                    }
                    isRequired
                  />

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#181d27]">
                      Chuyên môn <span className="text-red-500">*</span>
                    </label>
                    <Dropdown isOpen={isSpecializationOpen} onOpenChange={setIsSpecializationOpen}>
                      <DropdownTrigger>
                        <Button
                          variant="bordered"
                          className="justify-between border-[#d5d7da]"
                          endContent={<ChevronDown className="size-4" />}
                        >
                          {formData.specialization.length > 0
                            ? `${formData.specialization.length} môn học đã chọn`
                            : "Chọn môn học"}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Specialization selection"
                        selectedKeys={formData.specialization}
                        selectionMode="multiple"
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys) as string[];
                          updateFormData({ specialization: selected });
                        }}
                        classNames={{
                          base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[300px] max-h-[400px] overflow-y-auto",
                        }}
                      >
                        {SUBJECTS.map((subject) => (
                          <DropdownItem key={subject} textValue={subject}>
                            <span className="text-sm font-medium text-[#181d27]">{subject}</span>
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                    {formData.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center mt-2">
                        {formData.specialization.map((subject) => (
                          <div
                            key={subject}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] rounded-md"
                          >
                            <span className="text-xs text-[#414651]">{subject}</span>
                            <button
                              type="button"
                              onClick={() => removeSpecialization(subject)}
                              className="text-[#535862] hover:text-[#181d27]"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#181d27]">
                      Chứng chỉ (tùy chọn)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập chứng chỉ"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCertification();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="bordered"
                        onPress={addCertification}
                        className="border-[#d5d7da]"
                      >
                        Thêm
                      </Button>
                    </div>
                    {formData.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center mt-2">
                        {formData.certifications.map((cert) => (
                          <div
                            key={cert}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] rounded-md"
                          >
                            <span className="text-xs text-[#414651]">{cert}</span>
                            <button
                              type="button"
                              onClick={() => removeCertification(cert)}
                              className="text-[#535862] hover:text-[#181d27]"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#181d27]">
                        Tiểu sử (tùy chọn)
                      </label>
                      <textarea
                        placeholder="Nhập tiểu sử giáo viên"
                        value={formData.bio}
                        onChange={(e) => updateFormData({ bio: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#d5d7da] rounded-lg text-sm text-[#181d27] focus:outline-none focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
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
                  !formData.phone ||
                  formData.specialization.length === 0 ||
                  (!isEditMode && (!formData.email || !formData.password))
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

