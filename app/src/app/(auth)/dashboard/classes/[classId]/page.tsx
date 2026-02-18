"use client";

import React, { useEffect, useState } from "react";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import {
  FileEdit,
  UserPlus,
  BarChart3,
  UserCheck,
  Calendar,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Layout,
  TrendingUp,
  MoreVertical,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Users,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Class, ClassEnrollment } from "@/types/class";
import { useRouter } from "next/navigation";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Progress,
} from "@heroui/react";

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  color: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.positive
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-[#181d27] dark:text-white">
          {value}
        </p>
        <p className="text-sm text-[#717680] dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-[#a4a7ae] dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// Progress Ring Component
function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-[#181d27] dark:text-white">
          {progress}%
        </span>
      </div>
    </div>
  );
}

export default function ClassPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();

  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchData = React.useCallback(async () => {
    if (!classId) return;
    try {
      setLoading(true);
      const [classRes, studentsRes] = await Promise.all([
        api.classes.getById(classId),
        api.classes.getClassStudents(classId),
      ]);
      setClassData(classRes);
      setStudents(studentsRes);
    } catch (err) {
      console.error(err);
      setError("Failed to load class data");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter students
  const filteredStudents = students.filter((enrollment) => {
    const matchesSearch = enrollment.student.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter
      ? enrollment.status === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Đang học
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Hoàn thành
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Đã nghỉ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-[#717680] dark:text-gray-400">
              Đang tải thông tin lớp học...
            </p>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  if (error || !classData) {
    return (
      <LayoutDashboard>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#181d27] dark:text-white mb-2">
              Không thể tải dữ liệu
            </h2>
            <p className="text-[#717680] dark:text-gray-400">
              {error || "Không tìm thấy lớp học"}
            </p>
          </div>
          <Button as={Link} href="/dashboard/classes" variant="bordered">
            Quay lại danh sách lớp
          </Button>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#717680] dark:text-gray-400">
          <Link
            href="/dashboard/classes"
            className="hover:text-primary transition-colors"
          >
            Lớp học
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#181d27] dark:text-white font-medium">
            {classData.className}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-[#181d27] dark:text-white">
                {classData.className}
              </h1>
            </div>
            <p className="text-[#717680] dark:text-gray-400">
              Năm học {classData.schoolYear} • Khối {classData.gradeLevel}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="bordered"
              startContent={<TrendingUp className="w-4 h-4" />}
              as={Link}
              href={`/dashboard/classes/${classId}/progress`}
              className="border-[#d5d7da]"
            >
              Tiến độ
            </Button>
            <Button
              variant="bordered"
              startContent={<Layout className="w-4 h-4" />}
              as={Link}
              href={`/dashboard/classes/${classId}/workspace`}
              className="border-[#d5d7da]"
            >
              Không gian làm việc
            </Button>
            <Button
              className="bg-primary text-white"
              startContent={<UserPlus className="w-4 h-4" />}
              onClick={() => router.push(`/dashboard/users/create`)}
            >
              Thêm học sinh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng sĩ số"
            value={students.length.toString()}
            subtitle={`${students.filter((s) => s.status === "active").length} đang học`}
            icon={Users}
            color="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
          />
          <StatCard
            title="Điểm trung bình"
            value="--"
            subtitle="Chưa có dữ liệu"
            icon={BarChart3}
            color="bg-purple-50 text-purple-600 dark:bg-purple-900/20"
          />
          <StatCard
            title="Tỷ lệ điểm danh"
            value="--"
            subtitle="Chưa có dữ liệu"
            icon={UserCheck}
            color="bg-green-50 text-green-600 dark:bg-green-900/20"
          />
          <StatCard
            title="Giáo viên chủ nhiệm"
            value={classData.homeroomTeacher?.fullName || "Chưa gán"}
            icon={GraduationCap}
            color="bg-orange-50 text-orange-600 dark:bg-orange-900/20"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-[#e9eaeb] dark:border-gray-800 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm học sinh..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white placeholder:text-[#a4a7ae] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="relative min-w-[160px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang học</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="withdrawn">Đã nghỉ</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680] pointer-events-none" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f9fafb] dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase">
                      Học sinh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase">
                      Mã học sinh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase">
                      Ngày sinh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase">
                      Giới tính
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9eaeb] dark:divide-gray-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-[#717680] dark:text-gray-400">
                            Không tìm thấy học sinh
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((enrollment) => (
                      <tr
                        key={enrollment.enrollmentId}
                        className="hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={enrollment.student.avatarUrl || undefined}
                              name={enrollment.student.fullName}
                              size="sm"
                              className="shrink-0"
                            />
                            <div>
                              <p className="font-medium text-[#181d27] dark:text-white text-sm">
                                {enrollment.student.fullName}
                              </p>
                              <p className="text-xs text-[#717680] dark:text-gray-400">
                                {enrollment.student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#535862] dark:text-gray-300 font-mono">
                            {enrollment.student.studentInfo?.studentCode ||
                              "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(enrollment.status)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#535862] dark:text-gray-300">
                            {enrollment.student.studentInfo?.dateOfBirth
                              ? new Date(
                                  enrollment.student.studentInfo.dateOfBirth,
                                ).toLocaleDateString("vi-VN")
                              : "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#535862] dark:text-gray-300">
                            {enrollment.student.studentInfo?.gender === "male"
                              ? "Nam"
                              : enrollment.student.studentInfo?.gender ===
                                  "female"
                                ? "Nữ"
                                : "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly variant="light" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key="view"
                                as={Link}
                                href={`/dashboard/users/${enrollment.student.id}`}
                                startContent={
                                  <ArrowUpRight className="w-4 h-4" />
                                }
                              >
                                Xem chi tiết
                              </DropdownItem>
                              <DropdownItem
                                key="progress"
                                as={Link}
                                href={`/dashboard/users/${enrollment.student.id}/progress`}
                                startContent={
                                  <TrendingUp className="w-4 h-4" />
                                }
                              >
                                Xem tiến độ
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredStudents.length > 0 && (
              <div className="px-4 py-3 border-t border-[#e9eaeb] dark:border-gray-800 flex items-center justify-between bg-[#f9fafb] dark:bg-gray-800/30">
                <span className="text-sm text-[#717680] dark:text-gray-400">
                  Hiển thị{" "}
                  <strong className="text-[#181d27] dark:text-white">
                    {filteredStudents.length}
                  </strong>{" "}
                  học sinh
                </span>
                <div className="flex items-center gap-1">
                  <Button isIconOnly variant="light" size="sm" isDisabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-white min-w-[32px]"
                  >
                    1
                  </Button>
                  <Button isIconOnly variant="light" size="sm" isDisabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Class Info Card */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
              <h3 className="font-bold text-[#181d27] dark:text-white mb-4">
                Thông tin lớp học
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-[#717680] dark:text-gray-400">
                      Giáo viên chủ nhiệm
                    </p>
                    <p className="text-sm font-medium text-[#181d27] dark:text-white">
                      {classData.homeroomTeacher?.fullName || "Chưa gán"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#717680] dark:text-gray-400">
                      Email GVCN
                    </p>
                    <p className="text-sm font-medium text-[#181d27] dark:text-white">
                      {classData.homeroomTeacher?.email || "--"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#717680] dark:text-gray-400">
                      Năm học
                    </p>
                    <p className="text-sm font-medium text-[#181d27] dark:text-white">
                      {classData.schoolYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#717680] dark:text-gray-400">
                      Khối lớp
                    </p>
                    <p className="text-sm font-medium text-[#181d27] dark:text-white">
                      Khối {classData.gradeLevel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
              <h3 className="font-bold text-[#181d27] dark:text-white mb-4">
                Thao tác nhanh
              </h3>
              <div className="space-y-2">
                <Button
                  variant="light"
                  className="w-full justify-start"
                  startContent={<FileEdit className="w-4 h-4" />}
                >
                  Quản lý điểm
                </Button>
                <Button
                  variant="light"
                  className="w-full justify-start"
                  startContent={<Calendar className="w-4 h-4" />}
                >
                  Lịch học
                </Button>
                <Button
                  variant="light"
                  className="w-full justify-start"
                  startContent={<BarChart3 className="w-4 h-4" />}
                  as={Link}
                  href={`/dashboard/classes/${classId}/progress`}
                >
                  Báo cáo tiến độ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
