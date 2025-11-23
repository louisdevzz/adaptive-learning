'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { User } from '@heroui/user';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Users,
  GraduationCap,
  UserCheck,
  Activity,
  Search,
  ChevronDown,
  UserPlus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  KeyRound,
} from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { DataTable } from '@/components/ui/DataTable';
import { CreateUserModal, EditUserModal, ResetPasswordModal, getInitialFormData, buildMetaData, type UserFormData } from './UserModals';
import { adminAPI } from '@/lib/api';
import { useUsers } from '@/hooks/use-admin-data';
import { addToast } from '@heroui/toast';
import type { UserStats, UserListItem, UserRole, AdminMetaData, TeacherMetaData, StudentMetaData, ParentMetaData } from '@/types';

interface UserManagementProps {
  userStats: UserStats | null;
  onDataChange?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  userStats,
  onDataChange,
}) => {
  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<UserListItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState<UserFormData>(getInitialFormData());

  const pageSize = 10;

  // Use custom hook for users data
  const { data: usersData, isLoading: usersLoading, mutate } = useUsers({
    page: currentPage,
    pageSize,
    role: roleFilter,
    isActive: statusFilter,
    search: searchQuery,
  });

  // Derived values
  const allUsers = usersData?.items || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = useMemo(() => Math.ceil(totalUsers / pageSize), [totalUsers]);

  // Handlers
  const handleToggleUserStatus = useCallback(async (userId: string) => {
    try {
      const user = allUsers.find(u => u.id === userId);
      addToast({
        title: 'Đang xử lý',
        description: `Đang ${user?.is_active ? 'vô hiệu hóa' : 'kích hoạt'} người dùng...`,
        color: 'default',
      });
      await adminAPI.toggleUserStatus(userId);
      addToast({
        title: 'Thành công',
        description: `Đã ${user?.is_active ? 'vô hiệu hóa' : 'kích hoạt'} người dùng`,
        color: 'success',
      });
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể thay đổi trạng thái người dùng',
        color: 'danger',
      });
    }
  }, [mutate, onDataChange, allUsers]);

  const openDeleteModal = useCallback((user: UserListItem) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang xóa người dùng...',
        color: 'default',
      });
      await adminAPI.deleteUser(userToDelete.id);
      addToast({
        title: 'Thành công',
        description: `Đã xóa người dùng "${userToDelete.username}"`,
        color: 'success',
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to delete user:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể xóa người dùng',
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [userToDelete, mutate, onDataChange]);

  const handleCreateUser = useCallback(async () => {
    try {
      setIsCreating(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang tạo người dùng mới...',
        color: 'default',
      });

      const createdUsername = formData.username;
      const meta_data = buildMetaData(formData);

      await adminAPI.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        meta_data,
      });

      addToast({
        title: 'Thành công',
        description: `Đã tạo người dùng "${createdUsername}" thành công`,
        color: 'success',
      });

      setShowCreateModal(false);
      setFormData(getInitialFormData());
      mutate();
      onDataChange?.();
    } catch (error: unknown) {
      console.error('Failed to create user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo người dùng';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsCreating(false);
    }
  }, [formData, mutate, onDataChange]);

  const handleUpdateUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang cập nhật thông tin người dùng...',
        color: 'default',
      });

      const meta_data = buildMetaData(formData);
      const updateData: {
        full_name?: string;
        role?: UserRole;
        email?: string;
        meta_data?: typeof meta_data;
      } = {};
      if (formData.full_name) updateData.full_name = formData.full_name;
      if (formData.role) updateData.role = formData.role;
      if (formData.email) updateData.email = formData.email;
      if (meta_data) updateData.meta_data = meta_data;

      await adminAPI.updateUser(selectedUser.id, updateData);
      addToast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin người dùng',
        color: 'success',
      });
      setShowEditModal(false);
      setSelectedUser(null);
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to update user:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin người dùng',
        color: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedUser, formData, mutate, onDataChange]);

  const openResetPasswordModal = useCallback((user: UserListItem) => {
    setUserToResetPassword(user);
    setShowResetPasswordModal(true);
  }, []);

  const handleResetPassword = useCallback(async (newPassword: string) => {
    if (!userToResetPassword) return;

    try {
      setIsResettingPassword(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang đặt lại mật khẩu...',
        color: 'default',
      });

      await adminAPI.resetUserPassword(userToResetPassword.id, newPassword);
      addToast({
        title: 'Thành công',
        description: `Đã đặt lại mật khẩu cho "${userToResetPassword.username}"`,
        color: 'success',
      });
      setShowResetPasswordModal(false);
      setUserToResetPassword(null);
    } catch (error) {
      console.error('Failed to reset password:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể đặt lại mật khẩu',
        color: 'danger',
      });
    } finally {
      setIsResettingPassword(false);
    }
  }, [userToResetPassword]);

  const openEditModal = useCallback((user: UserListItem) => {
    setSelectedUser(user);

    // Start with initial form data
    const initialData = getInitialFormData();

    // Parse meta_data based on role
    let roleSpecificData: Partial<UserFormData> = {};

    if (user.meta_data) {
      switch (user.role) {
        case 'admin': {
          const adminMeta = user.meta_data as AdminMetaData;
          roleSpecificData = {
            admin_permissions: adminMeta.permissions || [],
            admin_level: adminMeta.admin_level || 'support',
          };
          break;
        }
        case 'teacher': {
          const teacherMeta = user.meta_data as TeacherMetaData;
          roleSpecificData = {
            teacher_phone: teacherMeta.phone || '',
            teacher_address: teacherMeta.address || '',
            teacher_bio: teacherMeta.bio || '',
            teacher_specialization: teacherMeta.specialization || [],
            teacher_grades: teacherMeta.grades || [],
          };
          break;
        }
        case 'student': {
          const studentMeta = user.meta_data as StudentMetaData;
          roleSpecificData = {
            student_code: studentMeta.student_code || '',
            student_grade_level: studentMeta.grade_level || 6,
            student_class_id: studentMeta.class_id || '',
            student_learning_style: studentMeta.learning_style || '',
            student_interests: studentMeta.interests || [],
            student_notes: studentMeta.notes || '',
          };
          break;
        }
        case 'parent': {
          const parentMeta = user.meta_data as ParentMetaData;
          roleSpecificData = {
            parent_contact_number: parentMeta.contact_number || '',
            parent_occupation: parentMeta.occupation || '',
            parent_children: parentMeta.children || [],
          };
          break;
        }
      }
    }

    setFormData({
      ...initialData,
      username: user.username,
      email: user.email,
      password: '',
      full_name: user.full_name || '',
      role: user.role,
      ...roleSpecificData,
    });
    setShowEditModal(true);
  }, []);

  const getRoleColor = (role: string): "primary" | "success" | "secondary" | "danger" | "warning" | "default" => {
    const colors: Record<string, "primary" | "success" | "secondary" | "danger" | "warning" | "default"> = {
      student: 'primary',
      teacher: 'success',
      parent: 'secondary',
      admin: 'danger',
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      student: 'Học sinh',
      teacher: 'Giáo viên',
      parent: 'Phụ huynh',
      admin: 'Quản trị',
    };
    return labels[role] || role;
  };

  const columns: ColumnDef<UserListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Người dùng',
        cell: ({ row }) => (
          <User
            name={row.original.full_name || row.original.username}
            description={`@${row.original.username}`}
            avatarProps={{
              src: undefined,
              name: (row.original.full_name || row.original.username)[0].toUpperCase(),
              size: 'sm',
              classNames: {
                base: 'bg-gray-200',
              },
            }}
          />
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Vai trò',
        cell: ({ row }) => (
          <Chip
            color={getRoleColor(row.original.role)}
            size="sm"
            variant="flat"
          >
            {getRoleLabel(row.original.role)}
          </Chip>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <Chip
            color={row.original.is_active ? 'success' : 'default'}
            size="sm"
            variant="dot"
            className="cursor-pointer"
            onClick={() => handleToggleUserStatus(row.original.id)}
          >
            {row.original.is_active ? 'Hoạt động' : 'Không hoạt động'}
          </Chip>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Ngày tham gia',
        cell: ({ row }) => (
          <span className="text-gray-600">
            {new Date(row.original.created_at).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User actions">
              <DropdownItem
                key="edit"
                startContent={<Pencil className="w-4 h-4" />}
                onPress={() => openEditModal(row.original)}
              >
                Chỉnh sửa
              </DropdownItem>
              <DropdownItem
                key="reset-password"
                startContent={<KeyRound className="w-4 h-4" />}
                onPress={() => openResetPasswordModal(row.original)}
              >
                Đặt lại mật khẩu
              </DropdownItem>
              <DropdownItem
                key="toggle"
                startContent={row.original.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                onPress={() => handleToggleUserStatus(row.original.id)}
              >
                {row.original.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
              </DropdownItem>
              <DropdownItem
                key="delete"
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={() => openDeleteModal(row.original)}
              >
                Xóa
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [openEditModal, openDeleteModal, openResetPasswordModal, handleToggleUserStatus]
  );

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-gray-600 text-sm">Tổng người dùng</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{userStats?.total_students || 0}</p>
              <p className="text-gray-600 text-sm">Học sinh</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{userStats?.total_teachers || 0}</p>
              <p className="text-gray-600 text-sm">Giáo viên</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{userStats?.active_users || 0}</p>
              <p className="text-gray-600 text-sm">Đang hoạt động</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Danh sách người dùng
            </h3>
            <Button
              color="danger"
              size="sm"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={() => setShowCreateModal(true)}
            >
              Thêm người dùng
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              isClearable
              className="flex-1"
              placeholder="Tìm kiếm theo tên hoặc email..."
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              value={searchQuery}
              onValueChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              onClear={() => setSearchQuery('')}
            />
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {roleFilter ? getRoleLabel(roleFilter) : 'Tất cả vai trò'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Role filter"
                selectionMode="single"
                selectedKeys={roleFilter ? [roleFilter] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as UserRole | undefined;
                  setRoleFilter(selected || '');
                }}
              >
                <DropdownItem key="">Tất cả vai trò</DropdownItem>
                <DropdownItem key="student">Học sinh</DropdownItem>
                <DropdownItem key="teacher">Giáo viên</DropdownItem>
                <DropdownItem key="parent">Phụ huynh</DropdownItem>
                <DropdownItem key="admin">Quản trị</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {statusFilter === '' ? 'Tất cả trạng thái' : statusFilter ? 'Hoạt động' : 'Không hoạt động'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Status filter"
                selectionMode="single"
                selectedKeys={statusFilter === '' ? [] : [statusFilter.toString()]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string | undefined;
                  if (!selected || selected === '') {
                    setStatusFilter('');
                  } else {
                    setStatusFilter(selected === 'true');
                  }
                }}
              >
                <DropdownItem key="">Tất cả trạng thái</DropdownItem>
                <DropdownItem key="true">Hoạt động</DropdownItem>
                <DropdownItem key="false">Không hoạt động</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="p-4">
          <DataTable
            data={allUsers}
            columns={columns}
            isLoading={usersLoading}
            pagination={{
              pageIndex: currentPage - 1,
              pageSize,
              pageCount: totalPages,
              total: totalUsers,
              onPageChange: setCurrentPage,
            }}
            emptyContent="Không tìm thấy người dùng nào"
            removeWrapper
          />
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        show={showCreateModal}
        formData={formData}
        setFormData={setFormData}
        onClose={() => {
          if (!isCreating) {
            setShowCreateModal(false);
            setFormData(getInitialFormData());
          }
        }}
        onSubmit={handleCreateUser}
        isLoading={isCreating}
      />

      <EditUserModal
        show={showEditModal}
        user={selectedUser}
        formData={formData}
        setFormData={setFormData}
        onClose={() => {
          if (!isUpdating) {
            setShowEditModal(false);
            setSelectedUser(null);
          }
        }}
        onSubmit={handleUpdateUser}
        isLoading={isUpdating}
      />

      <ResetPasswordModal
        show={showResetPasswordModal}
        user={userToResetPassword}
        onClose={() => {
          if (!isResettingPassword) {
            setShowResetPasswordModal(false);
            setUserToResetPassword(null);
          }
        }}
        onSubmit={handleResetPassword}
        isLoading={isResettingPassword}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }
        }}
        size="sm"
        isDismissable={!isDeleting}
        hideCloseButton={isDeleting}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Xác nhận xóa người dùng
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.username}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Hành động này không thể hoàn tác.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setShowDeleteModal(false);
                setUserToDelete(null);
              }}
              isDisabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteUser}
              isLoading={isDeleting}
            >
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
