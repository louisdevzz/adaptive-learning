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
  X,
  Check,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Class, ClassEnrollment } from "@/types/class";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
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
  const { user } = useUser();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isTeacher = user?.role?.toLowerCase() === "teacher";
  const canAddStudent = isAdmin || isTeacher;

  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"students" | "courses">("students");

  // Courses state
  const [classCourses, setClassCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const { isOpen: isAddCourseOpen, onOpen: onAddCourseOpen, onOpenChange: onAddCourseOpenChange } = useDisclosure();
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [addCourseSearch, setAddCourseSearch] = useState("");
  const [loadingAllCourses, setLoadingAllCourses] = useState(false);
  const [assigningCourseId, setAssigningCourseId] = useState<string | null>(null);

  // Add student modal states
  const { isOpen: isAddStudentOpen, onOpen: onAddStudentOpen, onOpenChange: onAddStudentOpenChange } = useDisclosure();
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [addStudentSearch, setAddStudentSearch] = useState("");
  const [loadingAllStudents, setLoadingAllStudents] = useState(false);
  const [enrollingStudentId, setEnrollingStudentId] = useState<string | null>(null);

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
    fetchClassCourses();
  }, [fetchData]);

  const fetchClassCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await api.classes.getClassCourses(classId);
      setClassCourses(data);
    } catch (err) {
      console.error("Error fetching class courses:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      setLoadingAllCourses(true);
      const data = await api.courses.getAll();
      setAllCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoadingAllCourses(false);
    }
  };

  const handleOpenAddCourse = () => {
    fetchAllCourses();
    setAddCourseSearch("");
    onAddCourseOpen();
  };

  const handleAssignCourse = async (courseId: string, onCloseModal?: () => void) => {
    try {
      setAssigningCourseId(courseId);
      await api.classes.assignCourse(classId, { courseId, status: "active" });
      toast.success("Đã thêm khóa học vào lớp");
      await fetchClassCourses();
      onCloseModal?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Lỗi khi thêm khóa học";
      toast.error(msg);
    } finally {
      setAssigningCourseId(null);
    }
  };

  const handleUpdateCourseStatus = async (courseId: string, status: "active" | "inactive") => {
    try {
      await api.classes.updateClassCourseStatus(classId, courseId, status);
      toast.success("Cập nhật trạng thái thành công");
      await fetchClassCourses();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!confirm("Bạn có chắc muốn xóa khóa học này khỏi lớp?")) return;
    try {
      await api.classes.removeCourse(classId, courseId);
      toast.success("Đã xóa khóa học khỏi lớp");
      await fetchClassCourses();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa khóa học");
    }
  };

  // Fetch available students for the add student modal (not enrolled in this class)
  const fetchAllStudents = async () => {
    try {
      setLoadingAllStudents(true);
      const data = await api.classes.getAvailableStudents(classId);
      setAllStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoadingAllStudents(false);
    }
  };

  const handleOpenAddStudent = () => {
    fetchAllStudents();
    setAddStudentSearch("");
    onAddStudentOpen();
  };

  const handleEnrollStudent = async (studentId: string) => {
    try {
      setEnrollingStudentId(studentId);
      await api.classes.enrollStudent(classId, { studentId, status: "active" });
      toast.success("Đã thêm học sinh vào lớp");
      await fetchData();
      // Update allStudents list to reflect the change
      setAllStudents((prev) => prev);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Lỗi khi thêm học sinh";
      toast.error(msg);
    } finally {
      setEnrollingStudentId(null);
    }
  };

  // Filter students in the add modal (exclude already enrolled)
  const enrolledStudentIds = new Set(students.map((s) => s.student.id));
  const availableStudents = allStudents.filter((s) => {
    if (enrolledStudentIds.has(s.id)) return false;
    if (!addStudentSearch.trim()) return true;
    const q = addStudentSearch.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.studentInfo?.studentCode?.toLowerCase().includes(q)
    );
  });

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#6244F4/10] text-[#0066CC] dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6244F4/10]0"></span>
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
            {canAddStudent && (
              <Button
                className="bg-primary text-white"
                startContent={<UserPlus className="w-4 h-4" />}
                onPress={handleOpenAddStudent}
              >
                Thêm học sinh
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng sĩ số"
            value={students.length.toString()}
            subtitle={`${students.filter((s) => s.status === "active").length} đang học`}
            icon={Users}
            color="bg-[#6244F4/10] text-[#6244F4] dark:bg-blue-900/20"
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

        {/* Tabs */}
        <div className="border-b border-[#e9eaeb] dark:border-gray-800">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "students"
                  ? "border-primary text-primary"
                  : "border-transparent text-[#414651] dark:text-gray-400 hover:text-[#181d27] dark:hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Học sinh
              <span className="ml-1 px-2 py-0.5 bg-[#f4f4f5] dark:bg-gray-800 rounded-full text-xs">
                {filteredStudents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "courses"
                  ? "border-primary text-primary"
                  : "border-transparent text-[#414651] dark:text-gray-400 hover:text-[#181d27] dark:hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              Khóa học
              <span className="ml-1 px-2 py-0.5 bg-[#f4f4f5] dark:bg-gray-800 rounded-full text-xs">
                {classCourses.length}
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Panel - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 overflow-hidden flex flex-col h-[600px]">
            {activeTab === "students" ? (
            <>
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
            <div className="flex-1 overflow-auto">
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
              <div className="px-4 py-3 border-t border-[#e9eaeb] dark:border-gray-800 flex items-center justify-between bg-[#f9fafb] dark:bg-gray-800/30 shrink-0">
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
          </>
        ) : (
          /* Courses Tab Content */
          <>
            {/* Toolbar */}
            <div className="p-4 border-b border-[#e9eaeb] dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-[#181d27] dark:text-white">
                Danh sách khóa học
              </h2>
              {canAddStudent && (
                <Button
                  className="bg-primary text-white"
                  size="sm"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={handleOpenAddCourse}
                >
                  Thêm khóa học
                </Button>
              )}
            </div>

            {/* Courses List */}
            <div className="flex-1 overflow-auto p-4">
              {loadingCourses ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : classCourses.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-[#717680] dark:text-gray-400 mb-2">
                    Chưa có khóa học nào
                  </p>
                  {canAddStudent && (
                    <Button
                      variant="light"
                      className="text-primary"
                      startContent={<Plus className="w-4 h-4" />}
                      onPress={handleOpenAddCourse}
                    >
                      Thêm khóa học đầu tiên
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {classCourses.map((courseAssignment) => (
                    <div
                      key={courseAssignment.assignmentId || courseAssignment.course?.id}
                      className="flex items-center justify-between p-4 border border-[#e9eaeb] dark:border-gray-800 rounded-lg hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {courseAssignment.course?.thumbnailUrl ? (
                          <img
                            src={courseAssignment.course.thumbnailUrl}
                            alt={courseAssignment.course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {courseAssignment.course?.title?.charAt(0) || "C"}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-[#181d27] dark:text-white">
                            {courseAssignment.course?.title}
                          </h3>
                          <p className="text-sm text-[#717680] dark:text-gray-400">
                            {courseAssignment.course?.description?.slice(0, 60) || "Chưa có mô tả"}
                            {courseAssignment.course?.description?.length > 60 ? "..." : ""}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-[#a4a7ae]">
                              Đã thêm: {new Date(courseAssignment.assignedAt).toLocaleDateString("vi-VN")}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              courseAssignment.status === "active"
                                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}>
                              {courseAssignment.status === "active" ? "Đang hoạt động" : "Tạm dừng"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canAddStudent && (
                          <>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              onPress={() => handleUpdateCourseStatus(
                                courseAssignment.course?.id,
                                courseAssignment.status === "active" ? "inactive" : "active"
                              )}
                              title={courseAssignment.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                            >
                              {courseAssignment.status === "active" ? (
                                <ToggleRight className="w-5 h-5 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              className="text-red-500"
                              onPress={() => handleRemoveCourse(courseAssignment.course?.id)}
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
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
                  <div className="w-10 h-10 rounded-lg bg-[#6244F4/10] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#6244F4]" />
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

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddStudentOpen}
        onOpenChange={onAddStudentOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-[#181d27] dark:text-white">
                  Thêm học sinh vào lớp {classData?.className}
                </h2>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-normal">
                  Chọn học sinh có sẵn trong hệ thống để thêm vào lớp
                </p>
              </ModalHeader>
              <ModalBody>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
                  <input
                    type="text"
                    value={addStudentSearch}
                    onChange={(e) => setAddStudentSearch(e.target.value)}
                    placeholder="Tìm theo tên, email, mã học sinh..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white placeholder:text-[#a4a7ae] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {loadingAllStudents ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#717680] dark:text-gray-400">
                      {addStudentSearch
                        ? "Không tìm thấy học sinh phù hợp"
                        : "Tất cả học sinh đã được thêm vào lớp"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px]">
                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#e9eaeb] dark:border-gray-700 hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.avatarUrl || undefined}
                            size="sm"
                            className="shrink-0"
                            fallback={student.fullName?.charAt(0)?.toUpperCase() || "?"}
                          />
                          <div>
                            <p className="font-medium text-sm text-[#181d27] dark:text-white">
                              {student.fullName}
                            </p>
                            <p className="text-xs text-[#717680] dark:text-gray-400">
                              {student.email}
                              {student.studentInfo?.studentCode && (
                                <span className="ml-2 font-mono">
                                  • {student.studentInfo.studentCode}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary text-white"
                          startContent={<UserPlus className="w-3.5 h-3.5" />}
                          isLoading={enrollingStudentId === student.id}
                          onPress={() => handleEnrollStudent(student.id)}
                        >
                          Thêm
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Course Modal */}
      <Modal
        isOpen={isAddCourseOpen}
        onOpenChange={onAddCourseOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-[#181d27] dark:text-white">
                  Thêm khóa học vào lớp {classData?.className}
                </h2>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-normal">
                  Chọn khóa học để gán cho lớp
                </p>
              </ModalHeader>
              <ModalBody>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
                  <input
                    type="text"
                    value={addCourseSearch}
                    onChange={(e) => setAddCourseSearch(e.target.value)}
                    placeholder="Tìm kiếm khóa học..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white placeholder:text-[#a4a7ae] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {loadingAllCourses ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  (() => {
                    const assignedCourseIds = new Set(classCourses.map(c => c.course?.id));
                    const filteredCourses = allCourses.filter(c => 
                      addCourseSearch === "" ||
                      c.title?.toLowerCase().includes(addCourseSearch.toLowerCase()) ||
                      c.description?.toLowerCase().includes(addCourseSearch.toLowerCase())
                    );
                    
                    return filteredCourses.length === 0 ? (
                      <div className="text-center py-12">
                        <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-[#717680] dark:text-gray-400">
                          {addCourseSearch
                            ? "Không tìm thấy khóa học phù hợp"
                            : "Chưa có khóa học nào trong hệ thống"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px]">
                        {filteredCourses.map((course) => {
                          const isAssigned = assignedCourseIds.has(course.id);
                          return (
                            <div
                              key={course.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                isAssigned 
                                  ? "border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10" 
                                  : "border-[#e9eaeb] dark:border-gray-700 hover:bg-[#f9fafb] dark:hover:bg-gray-800/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {course.thumbnailUrl ? (
                                  <img
                                    src={course.thumbnailUrl}
                                    alt={course.title}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                                    {course.title?.charAt(0) || "C"}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm truncate ${
                                    isAssigned ? "text-green-700 dark:text-green-400" : "text-[#181d27] dark:text-white"
                                  }`}>
                                    {course.title}
                                  </p>
                                  <p className="text-xs text-[#717680] dark:text-gray-400 truncate">
                                    {course.description?.slice(0, 50) || "Chưa có mô tả"}
                                    {course.description?.length > 50 ? "..." : ""}
                                  </p>
                                </div>
                              </div>
                              {isAssigned ? (
                                <Button
                                  size="sm"
                                  isDisabled
                                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                                  startContent={<Check className="w-3.5 h-3.5" />}
                                >
                                  Đã thêm
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-primary text-white"
                                  startContent={<Plus className="w-3.5 h-3.5" />}
                                  isLoading={assigningCourseId === course.id}
                                  onPress={() => handleAssignCourse(course.id, onClose)}
                                >
                                  Thêm
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </LayoutDashboard>
  );
}
