'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Checkbox, CheckboxGroup } from '@heroui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import type {
  UserListItem,
  UserRole,
  AdminMetaData,
  TeacherMetaData,
  StudentMetaData,
  ParentMetaData
} from '@/types';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  // Admin meta
  admin_permissions: string[];
  admin_level: 'super' | 'system' | 'support';
  // Teacher meta
  teacher_phone: string;
  teacher_address: string;
  teacher_bio: string;
  teacher_specialization: string[];
  teacher_grades: number[];
  // Student meta
  student_code: string;
  student_grade_level: number;
  student_class_id: string;
  student_learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | '';
  student_interests: string[];
  student_notes: string;
  // Parent meta
  parent_contact_number: string;
  parent_occupation: string;
  parent_children: { student_id: string; relationship: 'father' | 'mother' | 'guardian' }[];
}

// Helper function to build meta_data from form data
export const buildMetaData = (formData: UserFormData): AdminMetaData | TeacherMetaData | StudentMetaData | ParentMetaData | undefined => {
  switch (formData.role) {
    case 'admin':
      return {
        permissions: formData.admin_permissions,
        admin_level: formData.admin_level,
      };
    case 'teacher':
      return {
        phone: formData.teacher_phone || undefined,
        address: formData.teacher_address || undefined,
        bio: formData.teacher_bio || undefined,
        specialization: formData.teacher_specialization,
        grades: formData.teacher_grades,
      };
    case 'student':
      return {
        student_code: formData.student_code || undefined,
        grade_level: formData.student_grade_level,
        class_id: formData.student_class_id || undefined,
        learning_style: formData.student_learning_style || undefined,
        interests: formData.student_interests.length > 0 ? formData.student_interests : undefined,
        notes: formData.student_notes || undefined,
      };
    case 'parent':
      return {
        children: formData.parent_children,
        contact_number: formData.parent_contact_number || undefined,
        occupation: formData.parent_occupation || undefined,
      };
    default:
      return undefined;
  }
};

// Initial form data with default values
export const getInitialFormData = (): UserFormData => ({
  username: '',
  email: '',
  password: '',
  full_name: '',
  role: 'student',
  // Admin meta
  admin_permissions: ['manage_users', 'manage_courses', 'view_reports'],
  admin_level: 'support',
  // Teacher meta
  teacher_phone: '',
  teacher_address: '',
  teacher_bio: '',
  teacher_specialization: [],
  teacher_grades: [],
  // Student meta
  student_code: '',
  student_grade_level: 6,
  student_class_id: '',
  student_learning_style: '',
  student_interests: [],
  student_notes: '',
  // Parent meta
  parent_contact_number: '',
  parent_occupation: '',
  parent_children: [],
});

export type { UserFormData };

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

interface ResetPasswordModalProps {
  show: boolean;
  user: UserListItem | null;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
  isLoading?: boolean;
}

const roleOptions = [
  { key: 'student', label: 'Học sinh' },
  { key: 'teacher', label: 'Giáo viên' },
  { key: 'parent', label: 'Phụ huynh' },
  { key: 'admin', label: 'Quản trị' },
];

const adminPermissionOptions = [
  { key: 'manage_users', label: 'Quản lý người dùng' },
  { key: 'manage_courses', label: 'Quản lý khóa học' },
  { key: 'view_reports', label: 'Xem báo cáo' },
  { key: 'manage_settings', label: 'Quản lý cài đặt' },
];

const adminLevelOptions = [
  { key: 'super', label: 'Super Admin' },
  { key: 'system', label: 'System Admin' },
  { key: 'support', label: 'Support Admin' },
];

const specializationOptions = [
  { key: 'math', label: 'Toán' },
  { key: 'physics', label: 'Vật lý' },
  { key: 'chemistry', label: 'Hóa học' },
  { key: 'biology', label: 'Sinh học' },
  { key: 'literature', label: 'Ngữ văn' },
  { key: 'english', label: 'Tiếng Anh' },
  { key: 'history', label: 'Lịch sử' },
  { key: 'geography', label: 'Địa lý' },
];

const gradeOptions = [
  { key: 1, label: 'Lớp 1' },
  { key: 2, label: 'Lớp 2' },
  { key: 3, label: 'Lớp 3' },
  { key: 4, label: 'Lớp 4' },
  { key: 5, label: 'Lớp 5' },
  { key: 6, label: 'Lớp 6' },
  { key: 7, label: 'Lớp 7' },
  { key: 8, label: 'Lớp 8' },
  { key: 9, label: 'Lớp 9' },
  { key: 10, label: 'Lớp 10' },
  { key: 11, label: 'Lớp 11' },
  { key: 12, label: 'Lớp 12' },
];

const learningStyleOptions = [
  { key: 'visual', label: 'Thị giác (Visual)' },
  { key: 'auditory', label: 'Thính giác (Auditory)' },
  { key: 'kinesthetic', label: 'Vận động (Kinesthetic)' },
  { key: 'reading_writing', label: 'Đọc/Viết (Reading/Writing)' },
];

const interestOptions = [
  { key: 'math', label: 'Toán học' },
  { key: 'science', label: 'Khoa học' },
  { key: 'robotics', label: 'Robot' },
  { key: 'programming', label: 'Lập trình' },
  { key: 'arts', label: 'Nghệ thuật' },
  { key: 'music', label: 'Âm nhạc' },
  { key: 'sports', label: 'Thể thao' },
  { key: 'literature', label: 'Văn học' },
];

const relationshipOptions = [
  { key: 'father', label: 'Bố' },
  { key: 'mother', label: 'Mẹ' },
  { key: 'guardian', label: 'Người giám hộ' },
];

// Role-specific form fields component
const RoleSpecificFields: React.FC<{
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  isLoading?: boolean;
}> = ({ formData, setFormData, isLoading }) => {
  switch (formData.role) {
    case 'admin':
      return (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Thông tin Admin</p>
          <div className="grid grid-cols-2 gap-4">
            <CheckboxGroup
              label="Quyền hạn"
              value={formData.admin_permissions}
              onValueChange={(value) => setFormData({ ...formData, admin_permissions: value })}
              isDisabled={isLoading}
              orientation="horizontal"
              classNames={{ wrapper: "gap-4" }}
            >
              {adminPermissionOptions.map((perm) => (
                <Checkbox key={perm.key} value={perm.key}>
                  {perm.label}
                </Checkbox>
              ))}
            </CheckboxGroup>
            <Select
              label="Cấp độ Admin"
              selectedKeys={[formData.admin_level]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as 'super' | 'system' | 'support';
                if (selected) {
                  setFormData({ ...formData, admin_level: selected });
                }
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {adminLevelOptions.map((level) => (
                <SelectItem key={level.key}>{level.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      );

    case 'teacher':
      return (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Thông tin Giáo viên</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              placeholder="+84-0901234567"
              value={formData.teacher_phone}
              onValueChange={(value) => setFormData({ ...formData, teacher_phone: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Input
              label="Địa chỉ"
              placeholder="Nhập địa chỉ"
              value={formData.teacher_address}
              onValueChange={(value) => setFormData({ ...formData, teacher_address: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
          </div>
          <Textarea
            label="Giới thiệu"
            placeholder="Giới thiệu về bản thân..."
            value={formData.teacher_bio}
            onValueChange={(value) => setFormData({ ...formData, teacher_bio: value })}
            variant="bordered"
            isDisabled={isLoading}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Chuyên môn"
              placeholder="Chọn chuyên môn"
              selectionMode="multiple"
              selectedKeys={formData.teacher_specialization}
              onSelectionChange={(keys) => {
                setFormData({ ...formData, teacher_specialization: Array.from(keys) as string[] });
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {specializationOptions.map((spec) => (
                <SelectItem key={spec.key}>{spec.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Khối lớp giảng dạy"
              placeholder="Chọn khối lớp"
              selectionMode="multiple"
              selectedKeys={formData.teacher_grades.map(String)}
              onSelectionChange={(keys) => {
                setFormData({ ...formData, teacher_grades: Array.from(keys).map(Number) });
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {gradeOptions.map((grade) => (
                <SelectItem key={grade.key}>{grade.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      );

    case 'student':
      return (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Thông tin Học sinh</p>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Mã học sinh"
              placeholder="HS2025-XXXX"
              value={formData.student_code}
              onValueChange={(value) => setFormData({ ...formData, student_code: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Select
              label="Khối lớp"
              selectedKeys={[String(formData.student_grade_level)]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected) {
                  setFormData({ ...formData, student_grade_level: Number(selected) });
                }
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {gradeOptions.map((grade) => (
                <SelectItem key={grade.key}>{grade.label}</SelectItem>
              ))}
            </Select>
            <Input
              label="Mã lớp"
              placeholder="Nhập mã lớp"
              value={formData.student_class_id}
              onValueChange={(value) => setFormData({ ...formData, student_class_id: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Phong cách học"
              placeholder="Chọn phong cách học"
              selectedKeys={formData.student_learning_style ? [formData.student_learning_style] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | undefined;
                setFormData({ ...formData, student_learning_style: selected || '' });
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {learningStyleOptions.map((style) => (
                <SelectItem key={style.key}>{style.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Sở thích"
              placeholder="Chọn sở thích"
              selectionMode="multiple"
              selectedKeys={formData.student_interests}
              onSelectionChange={(keys) => {
                setFormData({ ...formData, student_interests: Array.from(keys) as string[] });
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {interestOptions.map((interest) => (
                <SelectItem key={interest.key}>{interest.label}</SelectItem>
              ))}
            </Select>
          </div>
          <Textarea
            label="Ghi chú"
            placeholder="Ghi chú về học sinh..."
            value={formData.student_notes}
            onValueChange={(value) => setFormData({ ...formData, student_notes: value })}
            variant="bordered"
            isDisabled={isLoading}
          />
        </div>
      );

    case 'parent':
      return (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Thông tin Phụ huynh</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              placeholder="+84-0900000000"
              value={formData.parent_contact_number}
              onValueChange={(value) => setFormData({ ...formData, parent_contact_number: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
            <Input
              label="Nghề nghiệp"
              placeholder="Nhập nghề nghiệp"
              value={formData.parent_occupation}
              onValueChange={(value) => setFormData({ ...formData, parent_occupation: value })}
              variant="bordered"
              isDisabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Quan hệ với học sinh"
              placeholder="Chọn quan hệ"
              selectedKeys={formData.parent_children[0]?.relationship ? [formData.parent_children[0].relationship] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as 'father' | 'mother' | 'guardian' | undefined;
                if (selected) {
                  setFormData({
                    ...formData,
                    parent_children: [{
                      student_id: formData.parent_children[0]?.student_id || '',
                      relationship: selected
                    }]
                  });
                }
              }}
              variant="bordered"
              isDisabled={isLoading}
            >
              {relationshipOptions.map((rel) => (
                <SelectItem key={rel.key}>{rel.label}</SelectItem>
              ))}
            </Select>
            <Input
              label="ID học sinh (con)"
              placeholder="Nhập ID học sinh"
              value={formData.parent_children[0]?.student_id || ''}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  parent_children: [{
                    student_id: value,
                    relationship: formData.parent_children[0]?.relationship || 'father'
                  }]
                });
              }}
              variant="bordered"
              isDisabled={isLoading}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  show,
  formData,
  setFormData,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <Modal isOpen={show} onClose={onClose} size="3xl" isDismissable={!isLoading} hideCloseButton={isLoading} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Thêm người dùng mới
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Basic info - 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onValueChange={(value) => setFormData({ ...formData, username: value })}
                variant="bordered"
                isDisabled={isLoading}
                isRequired
              />
              <Input
                label="Email"
                placeholder="Nhập email"
                type="email"
                value={formData.email}
                onValueChange={(value) => setFormData({ ...formData, email: value })}
                variant="bordered"
                isDisabled={isLoading}
                isRequired
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                type={isPasswordVisible ? "text" : "password"}
                value={formData.password}
                onValueChange={(value) => setFormData({ ...formData, password: value })}
                variant="bordered"
                isDisabled={isLoading}
                isRequired
                endContent={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="focus:outline-none"
                    disabled={isLoading}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                }
              />
              <Input
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={formData.full_name}
                onValueChange={(value) => setFormData({ ...formData, full_name: value })}
                variant="bordered"
                isDisabled={isLoading}
              />
            </div>
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
              isRequired
              className="max-w-xs"
            >
              {roleOptions.map((role) => (
                <SelectItem key={role.key}>{role.label}</SelectItem>
              ))}
            </Select>

            {/* Role-specific fields */}
            <RoleSpecificFields
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
            />
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
    <Modal isOpen={show && !!user} onClose={onClose} size="3xl" isDismissable={!isLoading} hideCloseButton={isLoading} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Chỉnh sửa người dùng
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Basic info - 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tên đăng nhập"
                value={formData.username}
                isDisabled
                variant="bordered"
              />
              <Input
                label="Email"
                placeholder="Nhập email"
                type="email"
                value={formData.email}
                onValueChange={(value) => setFormData({ ...formData, email: value })}
                variant="bordered"
                isDisabled={isLoading}
                isRequired
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                isRequired
              >
                {roleOptions.map((role) => (
                  <SelectItem key={role.key}>{role.label}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Role-specific fields */}
            <RoleSpecificFields
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
            />
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

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  show,
  user,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordVisible(false);
    setIsConfirmVisible(false);
    onClose();
  };

  const handleSubmit = () => {
    if (newPassword && newPassword === confirmPassword) {
      onSubmit(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const isPasswordMatch = newPassword === confirmPassword;
  const canSubmit = newPassword.length >= 6 && isPasswordMatch;

  return (
    <Modal isOpen={show && !!user} onClose={handleClose} size="md" isDismissable={!isLoading} hideCloseButton={isLoading}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Đặt lại mật khẩu
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Đặt lại mật khẩu cho người dùng: <strong>{user?.username}</strong>
            </p>
            <Input
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              type={isPasswordVisible ? "text" : "password"}
              value={newPassword}
              onValueChange={setNewPassword}
              variant="bordered"
              isDisabled={isLoading}
              isRequired
              endContent={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="focus:outline-none"
                  disabled={isLoading}
                >
                  {isPasswordVisible ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              }
            />
            <Input
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu mới"
              type={isConfirmVisible ? "text" : "password"}
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              variant="bordered"
              isDisabled={isLoading}
              isRequired
              isInvalid={confirmPassword.length > 0 && !isPasswordMatch}
              errorMessage={confirmPassword.length > 0 && !isPasswordMatch ? "Mật khẩu không khớp" : undefined}
              endContent={
                <button
                  type="button"
                  onClick={toggleConfirmVisibility}
                  className="focus:outline-none"
                  disabled={isLoading}
                >
                  {isConfirmVisible ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose} isDisabled={isLoading}>
            Hủy
          </Button>
          <Button
            color="danger"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!canSubmit}
          >
            Đặt lại mật khẩu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
