"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/react";
import {
  Mail,
  Phone,
  Calendar,
  Lock,
  Ban,
  Edit,
  CheckCircle2,
  Shield,
  History,
  Camera,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import { Admin } from "@/types/admin";
import { Teacher } from "@/types/teacher";
import { Student } from "@/types/student";
import { Parent } from "@/types/parent";
import Link from "next/link";

type UserRole = "admin" | "teacher" | "student" | "parent";
type UnifiedUser = (Admin | Teacher | Student | Parent) & {
  role: UserRole;
  status?: boolean;
  createdAt?: string;
  lastLogin?: string;
};

const roleLabels: Record<UserRole, string> = {
  admin: "Người quản trị",
  teacher: "Giáo viên",
  student: "Học sinh",
  parent: "Phụ huynh",
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  teacher: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  student: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  parent: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Chưa có";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const isEditMode = searchParams.get("mode") === "edit";
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    coursesCount: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Try to fetch from all role endpoints
        const endpoints = [
          api.admins.getById(userId).then((data) => ({ ...data, role: "admin" as UserRole })),
          api.teachers.getById(userId).then((data) => ({ ...data, role: "teacher" as UserRole })),
          api.students.getById(userId).then((data) => ({ ...data, role: "student" as UserRole })),
          api.parents.getById(userId).then((data) => ({ ...data, role: "parent" as UserRole })),
        ];

        const results = await Promise.allSettled(endpoints);
        const successfulResult = results.find((r) => r.status === "fulfilled");

        if (successfulResult && successfulResult.status === "fulfilled") {
          setUser(successfulResult.value as UnifiedUser);
          // TODO: Fetch actual stats based on user role
          setStats({
            coursesCount: 12,
            completionRate: 98,
          });
        } else {
          console.error("User not found");
          router.push("/dashboard/users");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/dashboard/users");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, router]);

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-[#4c669a] dark:text-gray-400">Đang tải...</p>
        </div>
      </LayoutDashboard>
    );
  }

  if (!user) {
    return (
      <LayoutDashboard>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-[#4c669a] dark:text-gray-400">Không tìm thấy người dùng</p>
          <Button as={Link} href="/dashboard/users" startContent={<ArrowLeft className="size-4" />}>
            Quay lại danh sách
          </Button>
        </div>
      </LayoutDashboard>
    );
  }

  const userRole = user.role;
  const userStatus = user.status !== false; // Default to active if not set
  const userInfo = (user as any).adminInfo || (user as any).teacherInfo || (user as any).studentInfo || (user as any).parentInfo;

  // Get phone number based on role
  const phoneNumber =
    (user as Teacher).teacherInfo?.phone ||
    (user as Parent).parentInfo?.phone ||
    "Chưa có";

  // Get department/school based on role
  const department =
    (user as Student).studentInfo?.schoolName ||
    (user as Teacher).teacherInfo?.specialization?.[0] ||
    (user as Admin).adminInfo?.adminLevel ||
    "Chưa có";

  return (
        <LayoutDashboard>
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
        {/* Page Heading & Actions */}
        <div className="flex flex-wrap justify-between items-start gap-4 p-4 border-b border-[#e7ebf3] dark:border-gray-800">
          <div className="flex min-w-72 flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black text-[#0d121b] dark:text-white leading-tight">
                {user.fullName}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                  userStatus
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 ring-gray-600/20"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    userStatus ? "bg-emerald-600 dark:bg-emerald-400" : "bg-gray-600"
                  }`}
                />
                {userStatus ? "Đang hoạt động" : "Đã khóa"}
              </span>
            </div>
            <p className="text-[#4c669a] dark:text-gray-400 text-base flex items-center gap-2">
              <Shield className="size-4" />
              ID: {user.id.slice(0, 8).toUpperCase()} • {roleLabels[userRole]}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="bordered"
              className="border-[#e7ebf3] dark:border-gray-700 text-[#0d121b] dark:text-white"
              startContent={<Lock className="size-4" />}
            >
              Đặt lại mật khẩu
            </Button>
            <Button
              variant="bordered"
              className="border-[#e7ebf3] dark:border-gray-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              startContent={<Ban className="size-4" />}
            >
              Khóa tài khoản
            </Button>
            <Button
              className="bg-[#135bec] hover:bg-blue-600 text-white"
              startContent={<Edit className="size-4" />}
              onPress={() => {
                if (isEditMode) {
                  router.push(`/dashboard/users/${userId}`);
                } else {
                  router.push(`/dashboard/users/${userId}?mode=edit`);
                }
              }}
            >
              {isEditMode ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
          {/* Left Column: User Profile (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-[#1a2230] rounded-xl border border-[#e7ebf3] dark:border-gray-800 p-6 shadow-sm">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4 group cursor-pointer">
                  {user.avatarUrl ? (
                    <Avatar
                      src={user.avatarUrl}
                      className="size-32 border-4 border-[#f6f6f8] dark:border-gray-700"
                    />
                  ) : (
                    <div className="size-32 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center font-bold text-2xl border-4 border-[#f6f6f8] dark:border-gray-700">
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 p-1.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm text-[#4c669a] hover:text-[#135bec] transition-colors">
                    <Camera className="size-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">{user.fullName}</h3>
                <p className="text-[#4c669a] dark:text-gray-400 text-sm">
                  {userRole === "student" && (user as Student).studentInfo?.gradeLevel
                    ? `Học sinh lớp ${(user as Student).studentInfo?.gradeLevel}`
                    : userRole === "teacher" && (user as Teacher).teacherInfo?.specialization
                    ? (user as Teacher).teacherInfo?.specialization?.join(", ") || ""
                    : roleLabels[userRole]}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-3 text-[#4c669a] dark:text-gray-400">
                    <div className="flex items-center justify-center size-8 rounded bg-[#f6f6f8] dark:bg-gray-800">
                      <Mail className="size-4" />
                    </div>
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <span className="text-sm font-medium text-[#0d121b] dark:text-gray-200 text-right">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-start justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-3 text-[#4c669a] dark:text-gray-400">
                    <div className="flex items-center justify-center size-8 rounded bg-[#f6f6f8] dark:bg-gray-800">
                      <Phone className="size-4" />
                    </div>
                    <span className="text-sm font-medium">Số điện thoại</span>
                  </div>
                  <span className="text-sm font-medium text-[#0d121b] dark:text-gray-200 text-right">
                    {phoneNumber}
                  </span>
                </div>
                <div className="flex items-start justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-3 text-[#4c669a] dark:text-gray-400">
                    <div className="flex items-center justify-center size-8 rounded bg-[#f6f6f8] dark:bg-gray-800">
                      <Calendar className="size-4" />
                    </div>
                    <span className="text-sm font-medium">Ngày tham gia</span>
                  </div>
                  <span className="text-sm font-medium text-[#0d121b] dark:text-gray-200 text-right">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Logs (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Roles Section */}
            <div className="bg-white dark:bg-[#1a2230] rounded-xl border border-[#e7ebf3] dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
                  <Shield className="size-5 text-[#135bec]" />
                  Vai trò & Quyền hạn
                </h3>
                <button className="text-sm text-[#135bec] font-semibold hover:underline">
                  Quản lý
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${roleColors[userRole]}`}
                >
                  {roleLabels[userRole]}
                </span>
                {userRole === "admin" && (user as Admin).adminInfo?.adminLevel && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {(user as Admin).adminInfo?.adminLevel === "super"
                      ? "Super Admin"
                      : (user as Admin).adminInfo?.adminLevel === "system"
                      ? "System Admin"
                      : "Support"}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 border-dashed">
                  <Plus className="size-4" />
                  Thêm vai trò
                </span>
              </div>

              {/* Permissions Section (for admin) */}
              {userRole === "admin" && (user as Admin).adminInfo?.permissions && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-semibold text-[#0d121b] dark:text-gray-300 mb-3">
                    Quyền truy cập đặc biệt
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(user as Admin).adminInfo?.permissions?.map((permission, index) => (
                      <label
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-[#f6f6f8] dark:bg-gray-800/50"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {permission}
                        </span>
                        <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                          <input
                            checked
                            disabled
                            className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1 translate-x-4 border-[#135bec]"
                            type="checkbox"
                          />
                          <div className="toggle-label block overflow-hidden h-6 rounded-full bg-[#135bec] cursor-pointer"></div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Activity Log */}
            <div className="bg-white dark:bg-[#1a2230] rounded-xl border border-[#e7ebf3] dark:border-gray-800 shadow-sm flex-1 flex flex-col">
              <div className="px-6 pt-5 pb-3 border-b border-[#e7ebf3] dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
                  <History className="size-5 text-[#135bec]" />
                  Hoạt động gần đây
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-semibold rounded bg-[#135bec]/10 text-[#135bec] dark:bg-[#135bec]/20 dark:text-blue-300">
                    Tất cả
                  </button>
                  <button className="px-3 py-1 text-xs font-semibold rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-[#4c669a] dark:text-gray-400">
                    Đăng nhập
                  </button>
                  <button className="px-3 py-1 text-xs font-semibold rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-[#4c669a] dark:text-gray-400">
                    Hệ thống
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-[#4c669a] dark:text-gray-400 border-b border-[#e7ebf3] dark:border-gray-800">
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Thời gian</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Hành động</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Chi tiết</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-[#0d121b] dark:text-gray-300 divide-y divide-[#e7ebf3] dark:divide-gray-800">
                    {/* Sample activity log data - TODO: Replace with actual API data */}
                    <tr className="group hover:bg-[#f6f6f8] dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-[#4c669a] dark:text-gray-400">
                        {new Date().toLocaleDateString("vi-VN")} {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle2 className="size-3" />
                          Hoàn thành
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">Đăng nhập thành công vào hệ thống</td>
                      <td className="px-6 py-4 text-[#4c669a] dark:text-gray-400 font-mono text-xs">
                        192.168.1.15
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-[#e7ebf3] dark:border-gray-800 text-center">
                <button className="text-sm font-medium text-[#135bec] hover:text-blue-700 transition-colors">
                  Xem toàn bộ lịch sử
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
        </LayoutDashboard>
  );
}
