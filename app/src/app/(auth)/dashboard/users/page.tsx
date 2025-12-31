"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { useState, useEffect } from "react";
import { MetricCard } from "@/components/dashboards/MetricCard";
import { UserTable } from "@/components/dashboards/admin/management/user/UserTable";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserX, 
  Download,
  Plus,
  Shield,
  GraduationCap,
  User,
  UsersRound
} from "lucide-react";
import { api } from "@/lib/api";
import { Admin } from "@/types/admin";
import { Teacher } from "@/types/teacher";
import { Student } from "@/types/student";
import { Parent } from "@/types/parent";

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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

        // Convert to unified format
        const allUsers: UnifiedUser[] = [
          ...(admins as Admin[]).map((admin) => ({
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName,
            avatarUrl: admin.avatarUrl,
            role: "admin" as UserRole,
            status: "active" as UserStatus, // Default to active for now
            createdAt: new Date().toISOString(), // You may need to add this field
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

        // Calculate stats
        const total = allUsers.length;
        const active = allUsers.filter((u) => u.status === "active").length;
        const pending = allUsers.filter((u) => u.status === "pending").length;
        const byRole = {
          admin: allUsers.filter((u) => u.role === "admin").length,
          teacher: allUsers.filter((u) => u.role === "teacher").length,
          student: allUsers.filter((u) => u.role === "student").length,
          parent: allUsers.filter((u) => u.role === "parent").length,
        };

        // Calculate new registrations (last 7 days)
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
        setTotalPages(Math.ceil(allUsers.length / 10));
      } catch (error) {
        console.error("Error fetching users:", error);
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
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleEdit = (user: UnifiedUser) => {
    // Navigate to edit page - can be same as detail page with edit mode
    router.push(`/dashboard/users/${user.id}?mode=edit`);
  };

  const handleViewDetail = (user: UnifiedUser) => {
    // Navigate to detail page
    router.push(`/dashboard/users/${user.id}`);
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
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Không thể xóa người dùng. Vui lòng thử lại.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng?`))
      return;

    try {
      for (const id of selectedUsers) {
        const user = users.find((u) => u.id === id);
        if (!user) continue;

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
      }

      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error deleting users:", error);
      alert("Không thể xóa một số người dùng. Vui lòng thử lại.");
    }
  };

  return (
        <LayoutDashboard>
      <div className="flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white tracking-tight">
              Quản lý Người dùng
            </h2>
            <p className="text-[#4c669a] dark:text-gray-400 text-sm mt-1">
              Tổng quan và quản lý tất cả người dùng trong hệ thống (Người quản trị)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="bordered"
              className="hidden sm:flex border-[#e7ebf3] dark:border-gray-700 text-[#0d121b] dark:text-white"
              startContent={<Download className="size-4" />}
            >
              Export
            </Button>
            <Button
              as={Link}
              href="/dashboard/users/create"
              className="bg-[#135bec] hover:bg-[#0e4bce] text-white"
              startContent={<Plus className="size-4" />}
            >
              Tạo Người dùng
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Tổng số người dùng"
            value={stats.total.toLocaleString()}
            change="+12% Tháng trước"
            icon={<Users className="size-6" />}
            iconBg="bg-[#135bec]/10"
            iconColor="text-[#135bec]"
          />
          <MetricCard
            title="Người dùng đang hoạt động"
            value={stats.active.toLocaleString()}
            change={`${Math.round((stats.active / stats.total) * 100)}% tổng số`}
            icon={<UserCheck className="size-6" />}
            iconBg="bg-success/10"
            iconColor="text-success"
          />
          <MetricCard
            title="Đăng ký mới (7 ngày)"
            value={stats.newRegistrations.toString()}
            change={`Trung bình ${Math.round(stats.newRegistrations / 7)}/ngày`}
            icon={<UserPlus className="size-6" />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-800 dark:text-purple-300"
          />
          <MetricCard
            title="Đang chờ duyệt"
            value={stats.pending.toString()}
            change="Cần xem xét"
            icon={<UserX className="size-6" />}
            iconBg="bg-warning/10"
            iconColor="text-warning"
          />
        </div>

        {/* Role Distribution */}
        <div className="bg-white dark:bg-[#1a2231] p-5 rounded-xl border border-[#e7ebf3] dark:border-[#2a3447] shadow-sm">
          <h3 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4">
            Phân bố vai trò người dùng
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="size-16 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full flex items-center justify-center">
                <Shield className="size-7" />
              </div>
              <span className="text-sm font-medium text-[#0d121b] dark:text-white mt-2">
                Người quản trị
              </span>
              <span className="text-[#4c669a] dark:text-gray-400 text-sm">
                {stats.byRole.admin} (
                {stats.total > 0
                  ? ((stats.byRole.admin / stats.total) * 100).toFixed(1)
                  : 0}
                %)
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="size-16 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full flex items-center justify-center">
                <GraduationCap className="size-7" />
              </div>
              <span className="text-sm font-medium text-[#0d121b] dark:text-white mt-2">
                Giáo viên
              </span>
              <span className="text-[#4c669a] dark:text-gray-400 text-sm">
                {stats.byRole.teacher} (
                {stats.total > 0
                  ? ((stats.byRole.teacher / stats.total) * 100).toFixed(1)
                  : 0}
                %)
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="size-16 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full flex items-center justify-center">
                <User className="size-7" />
              </div>
              <span className="text-sm font-medium text-[#0d121b] dark:text-white mt-2">
                Học sinh
              </span>
              <span className="text-[#4c669a] dark:text-gray-400 text-sm">
                {stats.byRole.student} (
                {stats.total > 0
                  ? ((stats.byRole.student / stats.total) * 100).toFixed(1)
                  : 0}
                %)
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="size-16 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full flex items-center justify-center">
                <UsersRound className="size-7" />
              </div>
              <span className="text-sm font-medium text-[#0d121b] dark:text-white mt-2">
                Phụ huynh
              </span>
              <span className="text-[#4c669a] dark:text-gray-400 text-sm">
                {stats.byRole.parent} (
                {stats.total > 0
                  ? ((stats.byRole.parent / stats.total) * 100).toFixed(1)
                  : 0}
                %)
              </span>
            </div>
          </div>
        </div>

        {/* User Table */}
        <UserTable
          users={paginatedUsers}
          loading={loading}
          selectedUsers={selectedUsers}
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onSelectAll={handleSelectAll}
          onSelectUser={handleSelectUser}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onSearchChange={setSearchQuery}
          onRoleFilterChange={setRoleFilter}
          onStatusFilterChange={setStatusFilter}
          selectedCount={selectedUsers.length}
          onClearSelection={() => setSelectedUsers([])}
          onBulkDelete={handleBulkDelete}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredUsers.length / 10)}
          totalUsers={filteredUsers.length}
          onPageChange={setCurrentPage}
        />
            </div>
        </LayoutDashboard>
    );
}
