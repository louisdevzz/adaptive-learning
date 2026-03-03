"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/react";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  GraduationCap,
  User,
  UsersRound,
  ChevronRight,
  ChevronLeft,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { Admin } from "@/types/admin";
import { Teacher } from "@/types/teacher";
import { Student } from "@/types/student";
import { Parent } from "@/types/parent";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

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

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#717680] dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// User Card Component
function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: UnifiedUser;
  onEdit: (user: UnifiedUser) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  const roleConfig = {
    admin: { icon: Shield, label: "Quản trị viên", color: "bg-purple-50 text-purple-700 border-purple-200" },
    teacher: { icon: GraduationCap, label: "Giáo viên", color: "bg-blue-50 text-blue-700 border-blue-200" },
    student: { icon: User, label: "Học sinh", color: "bg-green-50 text-green-700 border-green-200" },
    parent: { icon: UsersRound, label: "Phụ huynh", color: "bg-orange-50 text-orange-700 border-orange-200" },
  };

  const config = roleConfig[user.role];
  const RoleIcon = config.icon;

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 hover:shadow-lg hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between">
        <Link href={`/dashboard/users/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            src={user.avatarUrl}
            size="lg"
            className="rounded-full shrink-0"
            fallback={user.fullName.charAt(0).toUpperCase()}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-[#181d27] dark:text-white truncate group-hover:text-primary transition-colors">
              {user.fullName}
            </h3>
            <p className="text-sm text-[#717680] dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </Link>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="light"
              isIconOnly
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-[#414651]" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User actions">
            <DropdownItem
              key="view"
              startContent={<User className="w-4 h-4" />}
              href={`/dashboard/users/${user.id}`}
            >
              Xem chi tiết
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={<Edit className="w-4 h-4" />}
              onPress={() => onEdit(user)}
            >
              Chỉnh sửa
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<Trash2 className="w-4 h-4 text-red-500" />}
              className="text-red-500"
              onPress={() => onDelete(user.id)}
            >
              Xóa
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="mt-4 pt-4 border-t border-[#e9eaeb] dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <RoleIcon className="w-3 h-3" />
            {config.label}
          </span>
          <span className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500" : user.status === "pending" ? "bg-yellow-500" : "bg-gray-400"}`} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[#717680] dark:text-gray-400">
        <span>ID: {user.id.slice(0, 8).toUpperCase()}</span>
        <Link
          href={`/dashboard/users/${user.id}`}
          className="text-primary hover:underline flex items-center gap-1"
        >
          Chi tiết
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// User List Row Component
function UserListRow({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  user: UnifiedUser;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (user: UnifiedUser) => void;
  onDelete: (id: string) => void;
}) {
  const roleConfig = {
    admin: { icon: Shield, label: "Admin", color: "bg-purple-50 text-purple-700" },
    teacher: { icon: GraduationCap, label: "Giáo viên", color: "bg-blue-50 text-blue-700" },
    student: { icon: User, label: "Học sinh", color: "bg-green-50 text-green-700" },
    parent: { icon: UsersRound, label: "Phụ huynh", color: "bg-orange-50 text-orange-700" },
  };

  const config = roleConfig[user.role];
  const RoleIcon = config.icon;

  return (
    <tr className="hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors border-b border-[#e9eaeb] dark:border-gray-700 last:border-0">
      <td className="py-4 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </td>
      <td className="py-4 px-4">
        <Link href={`/dashboard/users/${user.id}`} className="flex items-center gap-3 group">
          <Avatar
            src={user.avatarUrl}
            size="sm"
            className="rounded-full"
            fallback={user.fullName.charAt(0).toUpperCase()}
          />
          <div>
            <p className="font-medium text-[#181d27] dark:text-white group-hover:text-primary transition-colors">
              {user.fullName}
            </p>
            <p className="text-xs text-[#717680] dark:text-gray-400">{user.email}</p>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <RoleIcon className="w-3 h-3" />
          {config.label}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          user.status === "active"
            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : user.status === "pending"
            ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            user.status === "active" ? "bg-green-500" : user.status === "pending" ? "bg-yellow-500" : "bg-gray-400"
          }`} />
          {user.status === "active" ? "Hoạt động" : user.status === "pending" ? "Chờ duyệt" : "Khóa"}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className="text-xs text-[#717680] dark:text-gray-400 font-mono">
          {user.id.slice(0, 8).toUpperCase()}
        </span>
      </td>
      <td className="py-4 px-4">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button variant="light" isIconOnly size="sm">
              <MoreVertical className="w-4 h-4 text-[#414651]" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User actions">
            <DropdownItem
              key="view"
              startContent={<User className="w-4 h-4" />}
              href={`/dashboard/users/${user.id}`}
            >
              Xem chi tiết
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={<Edit className="w-4 h-4" />}
              onPress={() => onEdit(user)}
            >
              Chỉnh sửa
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<Trash2 className="w-4 h-4 text-red-500" />}
              className="text-red-500"
              onPress={() => onDelete(user.id)}
            >
              Xóa
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </td>
    </tr>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useUser();
  
  // Check admin access
  useEffect(() => {
    if (!userLoading && currentUser) {
      const isAdmin = currentUser.role?.toLowerCase() === "admin";
      if (!isAdmin) {
        toast.error("Bạn không có quyền truy cập trang này");
        router.push("/dashboard");
      }
    }
  }, [currentUser, userLoading, router]);
  
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newRegistrations: 0,
    pending: 0,
    byRole: {
      admin: 0,
      teacher: 0,
      student: 0,
      parent: 0,
    },
  });

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const [admins, teachers, students, parents] = await Promise.all([
          api.admins.getAll().catch(() => []),
          api.teachers.getAll().catch(() => []),
          api.students.getAll().catch(() => []),
          api.parents.getAll().catch(() => []),
        ]);

        const allUsers: UnifiedUser[] = [
          ...(admins as Admin[]).map((admin) => ({
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName,
            avatarUrl: admin.avatarUrl,
            role: "admin" as UserRole,
            status: "active" as UserStatus,
            createdAt: new Date().toISOString(),
          })),
          ...(teachers as Teacher[]).map((teacher) => ({
            id: teacher.id,
            email: teacher.email,
            fullName: teacher.fullName,
            avatarUrl: teacher.avatarUrl,
            role: "teacher" as UserRole,
            status: "active" as UserStatus,
            createdAt: new Date().toISOString(),
          })),
          ...(students as Student[]).map((student) => ({
            id: student.id,
            email: student.email,
            fullName: student.fullName,
            avatarUrl: student.avatarUrl,
            role: "student" as UserRole,
            status: "active" as UserStatus,
            createdAt: new Date().toISOString(),
          })),
          ...(parents as Parent[]).map((parent) => ({
            id: parent.id,
            email: parent.email,
            fullName: parent.fullName,
            avatarUrl: parent.avatarUrl,
            role: "parent" as UserRole,
            status: "active" as UserStatus,
            createdAt: new Date().toISOString(),
          })),
        ];

        const total = allUsers.length;
        const active = allUsers.filter((u) => u.status === "active").length;
        const pending = allUsers.filter((u) => u.status === "pending").length;
        const byRole = {
          admin: allUsers.filter((u) => u.role === "admin").length,
          teacher: allUsers.filter((u) => u.role === "teacher").length,
          student: allUsers.filter((u) => u.role === "student").length,
          parent: allUsers.filter((u) => u.role === "parent").length,
        };

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newRegistrations = allUsers.filter(
          (u) => new Date(u.createdAt) >= sevenDaysAgo
        ).length;

        setStats({
          total,
          active,
          newRegistrations,
          pending,
          byRole,
        });

        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Lỗi khi tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginate
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleEdit = (user: UnifiedUser) => {
    router.push(`/dashboard/users/${user.id}?mode=edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      switch (user.role) {
        case "admin":
          await api.admins.delete(id);
          break;
        case "teacher":
          await api.teachers.delete(id);
          break;
        case "student":
          await api.students.delete(id);
          break;
        case "parent":
          await api.parents.delete(id);
          break;
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Xóa người dùng thành công");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Không thể xóa người dùng");
    }
  };

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">
              Quản lý người dùng
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Quản lý tất cả người dùng trong hệ thống
            </p>
          </div>
          <Button
            as={Link}
            href="/dashboard/users/create"
            className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo người dùng
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng người dùng"
            value={stats.total.toLocaleString()}
            subtitle={`${stats.byRole.student} học sinh, ${stats.byRole.teacher} giáo viên`}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            title="Đang hoạt động"
            value={stats.active.toLocaleString()}
            subtitle={`${Math.round((stats.active / stats.total) * 100)}% tổng số`}
            icon={<UserCheck className="w-6 h-6 text-green-600" />}
            color="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            title="Đăng ký mới (7 ngày)"
            value={stats.newRegistrations.toString()}
            subtitle={`Trung bình ${Math.round(stats.newRegistrations / 7)}/ngày`}
            icon={<UserPlus className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard
            title="Đang chờ duyệt"
            value={stats.pending.toString()}
            subtitle="Cần xem xét"
            icon={<UserX className="w-6 h-6 text-orange-600" />}
            color="bg-orange-50 dark:bg-orange-900/20"
          />
        </div>

        {/* Role Distribution */}
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
          <h3 className="text-sm font-medium text-[#717680] dark:text-gray-400 mb-4">
            Phân bố vai trò
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { role: "admin" as UserRole, label: "Quản trị viên", count: stats.byRole.admin, icon: Shield, color: "bg-purple-50 text-purple-600" },
              { role: "teacher" as UserRole, label: "Giáo viên", count: stats.byRole.teacher, icon: GraduationCap, color: "bg-blue-50 text-blue-600" },
              { role: "student" as UserRole, label: "Học sinh", count: stats.byRole.student, icon: User, color: "bg-green-50 text-green-600" },
              { role: "parent" as UserRole, label: "Phụ huynh", count: stats.byRole.parent, icon: UsersRound, color: "bg-orange-50 text-orange-600" },
            ].map((item) => (
              <button
                key={item.role}
                onClick={() => setRoleFilter(roleFilter === item.role ? "" : item.role)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  roleFilter === item.role
                    ? "border-primary bg-primary/5"
                    : "border-[#e9eaeb] dark:border-gray-700 hover:border-primary/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-[#181d27] dark:text-white">{item.count}</p>
                  <p className="text-xs text-[#717680] dark:text-gray-400">{item.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e9eaeb] dark:border-gray-700">
          <div className="relative flex-1 md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
            <Input
              placeholder="Tìm kiếm theo tên, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNames={{
                input: "pl-10 text-sm",
                inputWrapper: "border-[#d5d7da] dark:border-gray-600 rounded-lg",
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" size="sm" className="border-[#d5d7da]">
                  <Filter className="w-4 h-4 mr-1" />
                  {statusFilter ? `Trạng thái: ${statusFilter}` : "Trạng thái"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={statusFilter ? [statusFilter] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setStatusFilter((selected || "") as UserStatus | "");
                }}
              >
                <DropdownItem key="">Tất cả</DropdownItem>
                <DropdownItem key="active">Hoạt động</DropdownItem>
                <DropdownItem key="pending">Chờ duyệt</DropdownItem>
                <DropdownItem key="inactive">Khóa</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {(roleFilter || statusFilter) && (
              <Button
                variant="light"
                size="sm"
                onPress={() => {
                  setRoleFilter("");
                  setStatusFilter("");
                }}
              >
                Xóa bộ lọc
              </Button>
            )}

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "solid" : "light"}
                size="sm"
                onPress={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-white shadow-sm" : "bg-transparent"}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "solid" : "light"}
                size="sm"
                onPress={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-white shadow-sm" : "bg-transparent"}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-[#717680] dark:text-gray-400">
            Hiển thị{" "}
            <span className="font-medium text-[#181d27] dark:text-white">
              {paginatedUsers.length}
            </span>{" "}
            /{" "}
            <span className="font-medium text-[#181d27] dark:text-white">
              {filteredUsers.length}
            </span>{" "}
            người dùng
          </p>
          {selectedUsers.length > 0 && (
            <p className="text-[#717680] dark:text-gray-400">
              Đã chọn{" "}
              <span className="font-medium text-primary">{selectedUsers.length}</span>{" "}
              người dùng
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#181d27] dark:text-white mb-1">
              {searchQuery ? "Không tìm thấy người dùng" : "Chưa có người dùng nào"}
            </h3>
            <p className="text-[#717680] dark:text-gray-400 mb-4">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Bắt đầu bằng cách thêm người dùng mới"}
            </p>
            {!searchQuery && (
              <Button
                as={Link}
                href="/dashboard/users/create"
                className="bg-primary text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tạo người dùng
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f9fafb] dark:bg-gray-800/50 border-b border-[#e9eaeb] dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        paginatedUsers.length > 0 &&
                        paginatedUsers.every((u) => selectedUsers.includes(u.id))
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Người dùng
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Vai trò
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    ID
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <UserListRow
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.includes(user.id)}
                    onSelect={handleSelectUser}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-[#717680] dark:text-gray-400">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="bordered"
                size="sm"
                isDisabled={currentPage === 1}
                onPress={() => setCurrentPage(currentPage - 1)}
                className="border-[#d5d7da]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trước
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
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
                    variant={currentPage === pageNum ? "solid" : "bordered"}
                    size="sm"
                    onPress={() => setCurrentPage(pageNum)}
                    className={
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "border-[#d5d7da]"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="bordered"
                size="sm"
                isDisabled={currentPage === totalPages}
                onPress={() => setCurrentPage(currentPage + 1)}
                className="border-[#d5d7da]"
              >
                Sau
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </LayoutDashboard>
  );
}
