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
import { parsePermission } from "@/utils/permissions";
import { getAllPermissionKeys } from "@/constants/permissions";
import { adminLevelLabels } from "@/constants/admin";
import { Admin, AdminFormData } from "@/types/admin";
import { AvatarUpload } from "./AvatarUpload";

interface AdminModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingAdmin: Admin | null;
  formData: AdminFormData;
  onFormDataChange: (data: AdminFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function AdminModal({
  isOpen,
  onOpenChange,
  isEditMode,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: AdminModalProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset showPassword when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
    }
  }, [isOpen]);

  const updateFormData = (updates: Partial<AdminFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa quản trị viên" : "Thêm quản trị viên mới"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {!isEditMode && (
                  <>
                    <Input
                      label="Email"
                      placeholder="email@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      isRequired
                    />
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
                  </>
                )}
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

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Cấp độ quản trị <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isSelectOpen} onOpenChange={setIsSelectOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {adminLevelLabels[formData.adminLevel]}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Admin level"
                      selectedKeys={[formData.adminLevel]}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFormData({
                          adminLevel: value as "super" | "system" | "support",
                        });
                        setIsSelectOpen(false);
                      }}
                    >
                      <DropdownItem key="super">Siêu quản trị</DropdownItem>
                      <DropdownItem key="system">Quản trị hệ thống</DropdownItem>
                      <DropdownItem key="support">Hỗ trợ</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Quyền hạn <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    isOpen={isPermissionsOpen}
                    onOpenChange={setIsPermissionsOpen}
                    placement="bottom-start"
                  >
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da] min-h-[40px]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {formData.permissions.length > 0
                          ? `${formData.permissions.length} quyền đã chọn`
                          : "Chọn quyền hạn"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Permissions selection"
                      selectedKeys={formData.permissions}
                      selectionMode="multiple"
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys) as string[];
                        updateFormData({ permissions: selected });
                      }}
                      classNames={{
                        base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[300px] max-h-[400px] overflow-y-auto",
                      }}
                    >
                      {getAllPermissionKeys().map((key) => (
                        <DropdownItem key={key} textValue={parsePermission(key)}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-[#181d27]">
                              {parsePermission(key)}
                            </span>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                  {formData.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center mt-2">
                      {formData.permissions.map((permission) => (
                        <div
                          key={permission}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] rounded-md"
                        >
                          <span className="text-xs text-[#414651]">
                            {parsePermission(permission)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateFormData({
                                permissions: formData.permissions.filter(
                                  (p) => p !== permission
                                ),
                              });
                            }}
                            className="text-[#535862] hover:text-[#181d27]"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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

