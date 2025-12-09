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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/popover";
import { Checkbox } from "@heroui/checkbox";
import { ChevronDown, Eye, EyeOff, Search, X } from "lucide-react";
import { Parent, ParentFormData, RelationshipType } from "@/types/parent";
import { Student } from "@/types/student";
import { AvatarUpload } from "../admin/AvatarUpload";
import { api } from "@/lib/api";

interface ParentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingParent: Parent | null;
  formData: ParentFormData;
  onFormDataChange: (data: ParentFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const relationshipLabels: Record<RelationshipType, string> = {
  father: "Cha",
  mother: "Mẹ",
  guardian: "Người giám hộ",
};

export function ParentModal({
  isOpen,
  onOpenChange,
  isEditMode,
  editingParent,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: ParentModalProps) {
  const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch students when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    } else {
      setSearchQuery("");
      setShowPassword(false);
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await api.students.getAll();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.studentInfo?.studentCode.toLowerCase().includes(query)
    );
  });

  const selectedStudents = students.filter((student) =>
    formData.studentIds.includes(student.id)
  );

  const updateFormData = (updates: Partial<ParentFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const handleStudentToggle = (studentId: string) => {
    const currentIds = formData.studentIds || [];
    if (currentIds.includes(studentId)) {
      updateFormData({
        studentIds: currentIds.filter((id) => id !== studentId),
      });
    } else {
      updateFormData({
        studentIds: [...currentIds, studentId],
      });
    }
  };

  const removeStudent = (studentId: string) => {
    updateFormData({
      studentIds: formData.studentIds.filter((id) => id !== studentId),
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa phụ huynh" : "Thêm phụ huynh mới"}
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
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) => updateFormData({ phone: e.target.value })}
                  isRequired
                />

                <Input
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ"
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  isRequired
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Mối quan hệ <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isRelationshipOpen} onOpenChange={setIsRelationshipOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {relationshipLabels[formData.relationshipType]}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Relationship selection"
                      selectedKeys={[formData.relationshipType]}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFormData({
                          relationshipType: value as RelationshipType,
                        });
                        setIsRelationshipOpen(false);
                      }}
                    >
                      <DropdownItem key="father">Cha</DropdownItem>
                      <DropdownItem key="mother">Mẹ</DropdownItem>
                      <DropdownItem key="guardian">Người giám hộ</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Học sinh <span className="text-red-500">*</span>
                  </label>
                  <Popover
                    isOpen={isStudentsOpen}
                    onOpenChange={setIsStudentsOpen}
                    placement="bottom-start"
                    showArrow
                  >
                    <PopoverTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da] min-h-[40px]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {selectedStudents.length > 0
                          ? `${selectedStudents.length} học sinh đã chọn`
                          : "Chọn học sinh"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <div className="flex flex-col max-h-[400px]">
                        <div className="p-3 border-b border-[#e9eaeb] sticky top-0 bg-white z-10">
                          <Input
                            placeholder="Tìm kiếm học sinh..."
                            size="sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            startContent={<Search className="size-4 text-[#717680]" />}
                            classNames={{
                              input: "text-sm",
                              inputWrapper: "border-[#d5d7da] h-9",
                            }}
                          />
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {loadingStudents ? (
                            <div className="p-4 text-center">
                              <span className="text-sm text-[#535862]">Đang tải...</span>
                            </div>
                          ) : filteredStudents.length === 0 ? (
                            <div className="p-4 text-center">
                              <span className="text-sm text-[#535862]">Không tìm thấy học sinh</span>
                            </div>
                          ) : (
                            <div className="p-1">
                              {filteredStudents.map((student) => (
                                <div
                                  key={student.id}
                                  className="flex items-center gap-2 p-2 hover:bg-[#f5f5f5] rounded-md cursor-pointer"
                                  onClick={() => handleStudentToggle(student.id)}
                                >
                                  <Checkbox
                                    isSelected={formData.studentIds.includes(student.id)}
                                    onValueChange={() => handleStudentToggle(student.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex flex-col gap-0.5 flex-1">
                                    <span className="text-sm font-medium text-[#181d27]">
                                      {student.fullName}
                                    </span>
                                    <span className="text-xs text-[#535862]">
                                      {student.email} • {student.studentInfo?.studentCode || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {selectedStudents.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center mt-2">
                      {selectedStudents.map((student) => (
                        <div
                          key={student.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] rounded-md"
                        >
                          <span className="text-xs text-[#414651]">
                            {student.fullName}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeStudent(student.id)}
                            className="text-[#535862] hover:text-[#181d27]"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  !formData.phone ||
                  !formData.address ||
                  !formData.studentIds ||
                  formData.studentIds.length === 0 ||
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

