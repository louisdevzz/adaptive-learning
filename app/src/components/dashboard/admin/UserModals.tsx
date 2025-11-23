'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import type { UserListItem, UserRole } from '@/types';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

interface CreateUserModalProps {
  show: boolean;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

interface EditUserModalProps {
  show: boolean;
  user: UserListItem | null;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const roleOptions = [
  { key: 'student', label: 'Học sinh' },
  { key: 'teacher', label: 'Giáo viên' },
  { key: 'parent', label: 'Phụ huynh' },
  { key: 'admin', label: 'Quản trị' },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  show,
  formData,
  setFormData,
  onClose,
  onSubmit,
  isLoading,
}) => {
  return (
    <Modal isOpen={show} onClose={onClose} size="md" isDismissable={!isLoading} hideCloseButton={isLoading}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Thêm người dùng mới
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onValueChange={(value) => setFormData({ ...formData, username: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Input
              label="Email"
              placeholder="Nhập email"
              type="email"
              value={formData.email}
              onValueChange={(value) => setFormData({ ...formData, email: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              type="password"
              value={formData.password}
              onValueChange={(value) => setFormData({ ...formData, password: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              value={formData.full_name}
              onValueChange={(value) => setFormData({ ...formData, full_name: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Select
              label="Vai trò"
              placeholder="Chọn vai trò"
              selectedKeys={[formData.role]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as UserRole;
                if (selected) {
                  setFormData({ ...formData, role: selected });
                }
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {roleOptions.map((role) => (
                <SelectItem key={role.key}>{role.label}</SelectItem>
              ))}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            Hủy
          </Button>
          <Button color="danger" onPress={onSubmit} isLoading={isLoading}>
            Tạo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  user,
  formData,
  setFormData,
  onClose,
  onSubmit,
  isLoading,
}) => {
  return (
    <Modal isOpen={show && !!user} onClose={onClose} size="md" isDismissable={!isLoading} hideCloseButton={isLoading}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Chỉnh sửa người dùng
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Tên đăng nhập"
              value={formData.username}
              isDisabled
              variant="bordered"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onValueChange={(value) => setFormData({ ...formData, email: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Input
              label="Họ và tên"
              value={formData.full_name}
              onValueChange={(value) => setFormData({ ...formData, full_name: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Select
              label="Vai trò"
              selectedKeys={[formData.role]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as UserRole;
                if (selected) {
                  setFormData({ ...formData, role: selected });
                }
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {roleOptions.map((role) => (
                <SelectItem key={role.key}>{role.label}</SelectItem>
              ))}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            Hủy
          </Button>
          <Button color="danger" onPress={onSubmit} isLoading={isLoading}>
            Cập nhật
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
