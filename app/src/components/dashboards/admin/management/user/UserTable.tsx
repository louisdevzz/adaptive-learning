"use client";

import { Checkbox } from "@heroui/checkbox";
import { Avatar } from "@heroui/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { 
  Search, 
  Edit, 
  Trash2, 
  Info, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ban,
  UserCog,
  RefreshCw,
  Filter
} from "lucide-react";
import Link from "next/link";

type UserRole = "admin" | "teacher" | "student" | "parent";
type UserStatus = "active" | "inactive" | "pending";

interface UnifiedUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
}

interface UserTableProps {
  users: UnifiedUser[];
  loading: boolean;
  selectedUsers: string[];
  searchQuery: string;
  roleFilter: UserRole | "";
  statusFilter: UserStatus | "";
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (id: string) => void;
  onEdit: (user: UnifiedUser) => void;
  onDelete: (id: string) => void;
  onViewDetail?: (user: UnifiedUser) => void;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: UserRole | "") => void;
  onStatusFilterChange: (value: UserStatus | "") => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
  currentPage?: number;
  totalPages?: number;
  totalUsers?: number;
  onPageChange?: (page: number) => void;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Người quản trị",
  teacher: "Giáo viên",
  student: "Học sinh",
  parent: "Phụ huynh",
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  teacher: "bg-[#E8F4FF] text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  student: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  parent: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const statusLabels: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return "Chưa đăng nhập";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
};

export function UserTable({
  users,
  loading,
  selectedUsers,
  searchQuery,
  roleFilter,
  statusFilter,
  onSelectAll,
  onSelectUser,
  onEdit,
  onDelete,
  onViewDetail,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
  currentPage = 1,
  totalPages = 1,
  totalUsers = 0,
  onPageChange,
}: UserTableProps) {
  const renderFilters = () => {
    return (
      <div className="bg-white dark:bg-[#1a2231] p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2a3447] shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3 items-center w-full">
          <div className="relative flex-1 w-full md:max-w-xs">
            <Input
              placeholder="Tìm kiếm theo tên, email, ID..."
              value={searchQuery}
              onValueChange={onSearchChange}
              startContent={<Search className="size-5 text-[#4c669a]" />}
              className="w-full"
              classNames={{
                input: "text-sm",
                inputWrapper: "border-[#e7ebf3] dark:border-[#2a3447]",
              }}
            />
          </div>
          <div className="relative w-full md:w-auto min-w-[160px]">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="w-full justify-between border-[#e7ebf3] dark:border-[#2a3447]"
                  endContent={<ChevronDown className="size-4" />}
                >
                  {roleFilter ? roleLabels[roleFilter] : "Tất cả vai trò"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={roleFilter ? [roleFilter] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  onRoleFilterChange((selected as UserRole) || "");
                }}
              >
                <DropdownItem key="">Tất cả vai trò</DropdownItem>
                <DropdownItem key="admin">Người quản trị</DropdownItem>
                <DropdownItem key="teacher">Giáo viên</DropdownItem>
                <DropdownItem key="student">Học sinh</DropdownItem>
                <DropdownItem key="parent">Phụ huynh</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="relative w-full md:w-auto min-w-[160px]">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="w-full justify-between border-[#e7ebf3] dark:border-[#2a3447]"
                  endContent={<ChevronDown className="size-4" />}
                >
                  {statusFilter ? statusLabels[statusFilter] : "Tất cả trạng thái"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={statusFilter ? [statusFilter] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  onStatusFilterChange((selected as UserStatus) || "");
                }}
              >
                <DropdownItem key="">Tất cả trạng thái</DropdownItem>
                <DropdownItem key="active">Active</DropdownItem>
                <DropdownItem key="inactive">Inactive</DropdownItem>
                <DropdownItem key="pending">Pending</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <Button
            variant="bordered"
            className="border-[#e7ebf3] dark:border-[#2a3447] text-[#4c669a] dark:text-gray-400 w-full md:w-auto"
            startContent={<Filter className="size-4" />}
          >
            Bộ lọc khác
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 w-full justify-between md:justify-start pt-2 border-t border-[#e7ebf3] dark:border-[#2a3447]">
            <span className="text-sm font-medium text-[#0d121b] dark:text-white">
              Đã chọn {selectedCount} người dùng
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="light"
                size="sm"
                className="text-[#4c669a] dark:text-gray-400"
                startContent={<Ban className="size-4" />}
              >
                Vô hiệu hóa
              </Button>
              <Button
                variant="light"
                size="sm"
                className="text-[#4c669a] dark:text-gray-400"
                startContent={<UserCog className="size-4" />}
              >
                Chỉnh sửa vai trò
              </Button>
              <Button
                variant="light"
                size="sm"
                className="text-danger"
                startContent={<Trash2 className="size-4" />}
                onPress={onBulkDelete}
              >
                Xóa
              </Button>
              <div className="h-8 w-px bg-[#e7ebf3] dark:bg-[#2a3447] mx-2 hidden md:block" />
              <Button
                variant="light"
                size="sm"
                className="text-[#4c669a] dark:text-gray-400"
                startContent={<RefreshCw className="size-4" />}
                onPress={onClearSelection}
              >
                Làm mới
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTableRow = (user: UnifiedUser, index: number) => {
    const isSelected = selectedUsers.includes(user.id);
    const isActive = user.status === "active";

    return (
      <tr
        key={user.id}
        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <td className="px-6 py-4">
          <Checkbox
            isSelected={isSelected}
            onValueChange={() => onSelectUser(user.id)}
            size="sm"
          />
        </td>
        <td className="px-6 py-4 min-w-[250px]">
          <Link
            href={`/dashboard/users/${user.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {user.avatarUrl ? (
              <Avatar
                src={user.avatarUrl}
                size="md"
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="size-10 rounded-full bg-[#0085FF]/10 text-[#0085FF] flex items-center justify-center font-bold text-sm shrink-0 border border-transparent dark:border-[#0085FF]/20">
                {getInitials(user.fullName)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-[#0d121b] dark:text-white">
                {user.fullName}
              </span>
              <span className="text-[#4c669a] dark:text-gray-500 text-xs">
                {user.email}
              </span>
            </div>
          </Link>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}
          >
            {roleLabels[user.role]}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${
                isActive ? "bg-success" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
            <span className="text-[#0d121b] dark:text-gray-300">
              {statusLabels[user.status]}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-[#4c669a] dark:text-gray-400">
          {formatRelativeTime(user.lastLogin)}
        </td>
        <td className="px-6 py-4 text-[#4c669a] dark:text-gray-400">
          {formatDate(user.createdAt)}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-[#4c669a] hover:text-[#0085FF] hover:bg-[#F0F8FF] dark:hover:bg-blue-900/20"
              onPress={() => onEdit(user)}
            >
              <Edit className="size-4" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-[#4c669a] hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20"
              onPress={() => onDelete(user.id)}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-[#4c669a] hover:text-[#0d121b] hover:bg-gray-50 dark:hover:bg-gray-700"
              as={Link}
              href={`/dashboard/users/${user.id}`}
            >
              <Info className="size-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  const renderPagination = () => {
    if (!onPageChange || totalPages <= 1) return null;

    const start = (currentPage - 1) * 10 + 1;
    const end = Math.min(currentPage * 10, totalUsers);

    return (
      <div className="px-6 py-4 border-t border-[#e7ebf3] dark:border-[#2a3447] flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30">
        <span className="text-sm text-[#4c669a] dark:text-gray-400">
          Hiển thị{" "}
          <span className="font-semibold text-[#0d121b] dark:text-white">
            {start}-{end}
          </span>{" "}
          trong{" "}
          <span className="font-semibold text-[#0d121b] dark:text-white">
            {totalUsers}
          </span>{" "}
          kết quả
        </span>
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            isDisabled={currentPage === 1}
            onPress={() => onPageChange(currentPage - 1)}
            className="border border-[#e7ebf3] dark:border-[#2a3447]"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "solid" : "light"}
                size="sm"
                className={`min-w-[32px] h-8 ${
                  currentPage === pageNum
                    ? "bg-[#0085FF] text-white"
                    : "text-[#4c669a] dark:text-gray-400"
                }`}
                onPress={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="text-[#4c669a] px-1">...</span>
          )}
          {totalPages > 5 && (
            <Button
              variant="light"
              size="sm"
              className="min-w-[32px] h-8 text-[#4c669a] dark:text-gray-400"
              onPress={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          )}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            isDisabled={currentPage === totalPages}
            onPress={() => onPageChange(currentPage + 1)}
            className="border border-[#e7ebf3] dark:border-[#2a3447]"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Filters */}
      {renderFilters()}

      {/* Table */}
      <div className="bg-white dark:bg-[#1a2231] border border-[#e7ebf3] dark:border-[#2a3447] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-[#4c669a] dark:text-gray-400 font-semibold border-b border-[#e7ebf3] dark:border-[#2a3447]">
              <tr>
                <th className="px-6 py-4 w-12">
                  <Checkbox
                    isSelected={
                      users.length > 0 &&
                      users.every((u) => selectedUsers.includes(u.id))
                    }
                    isIndeterminate={
                      selectedUsers.length > 0 &&
                      selectedUsers.length < users.length
                    }
                    onValueChange={onSelectAll}
                    size="sm"
                  />
                </th>
                <th className="px-6 py-4 min-w-[250px]">Tên / Email</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Lần đăng nhập cuối</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3] dark:divide-[#2a3447] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <p className="text-[#4c669a] dark:text-gray-400">
                      Đang tải...
                    </p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <p className="text-[#4c669a] dark:text-gray-400">
                      Không tìm thấy người dùng nào
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => renderTableRow(user, index))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
}

