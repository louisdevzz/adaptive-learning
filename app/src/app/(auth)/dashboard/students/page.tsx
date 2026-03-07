"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@heroui/react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { api } from "@/lib/api";
import { Student, StudentFormData, StudentStats } from "@/types/student";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  GraduationCap,
  UserCheck,
  ArrowUpRight,
} from "lucide-react";
import { StudentModal } from "@/components/dashboards/admin/management/student/StudentModal";
import { Avatar } from "@heroui/react";
import { useUser } from "@/hooks/useUser";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Link from "next/link";

// Student Card Component
function StudentCard({
  student,
  onEdit,
  onDelete,
  isAdmin,
}: {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const studentCode = student.studentInfo?.studentCode || "N/A";
  const gradeLevel = student.studentInfo?.gradeLevel || 0;
  const schoolName = student.studentInfo?.schoolName || "N/A";
  const gender = student.studentInfo?.gender || "other";
  const genderLabels: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };
  const genderColors: Record<string, string> = {
    male: "bg-[#6244F4/10] text-[#0066CC] border-blue-200",
    female: "bg-pink-50 text-pink-700 border-pink-200",
    other: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 hover:shadow-lg hover:border-primary/30 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link
          href={`/dashboard/students/${student.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <Avatar
            src={student.avatarUrl}
            size="lg"
            className="rounded-full shrink-0 border-2 border-white dark:border-gray-700 shadow-sm"
            fallback={student.fullName.charAt(0).toUpperCase()}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-[#181d27] dark:text-white text-base truncate group-hover:text-primary transition-colors">
              {student.fullName}
            </h3>
            <p className="text-sm text-[#717680] dark:text-gray-400 truncate">
              {student.email}
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
          <DropdownMenu aria-label="Student actions">
            <DropdownItem
              key="view"
              startContent={<TrendingUp className="w-4 h-4" />}
              href={`/dashboard/students/${student.id}`}
            >
              Xem chi tiết
            </DropdownItem>
            {isAdmin ? (
              <DropdownItem
                key="edit"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => onEdit(student)}
              >
                Chỉnh sửa
              </DropdownItem>
            ) : null}
            {isAdmin ? (
              <DropdownItem
                key="delete"
                startContent={<Trash2 className="w-4 h-4 text-red-500" />}
                className="text-red-500"
                onPress={() => onDelete(student.id)}
              >
                Xóa
              </DropdownItem>
            ) : null}
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Student Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-xs">ID</span>
          </div>
          <span className="text-[#535862] dark:text-gray-400 font-medium">
            {studentCode}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-[#535862] dark:text-gray-400">
            Lớp {gradeLevel} • {schoolName}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-green-600" />
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              genderColors[gender]
            }`}
          >
            {genderLabels[gender]}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[#e9eaeb] dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-[#717680] dark:text-gray-400">
          <span
            className={`w-2 h-2 rounded-full ${
              student.status ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          {student.status ? "Đang hoạt động" : "Đã khóa"}
        </div>
        <Link
          href={`/dashboard/students/${student.id}`}
          className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
        >
          Xem chi tiết
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// Stats Card Component
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

// Student List Row Component
function StudentListRow({
  student,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  isAdmin,
}: {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isAdmin: boolean;
}) {
  const studentCode = student.studentInfo?.studentCode || "N/A";
  const gradeLevel = student.studentInfo?.gradeLevel || 0;
  const schoolName = student.studentInfo?.schoolName || "N/A";
  const gender = student.studentInfo?.gender || "other";
  const genderLabels: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };

  return (
    <tr className="hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors border-b border-[#e9eaeb] dark:border-gray-700 last:border-0">
      <td className="py-4 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(student.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </td>
      <td className="py-4 px-4">
        <Link
          href={`/dashboard/students/${student.id}`}
          className="flex items-center gap-3 group"
        >
          <Avatar
            src={student.avatarUrl}
            size="sm"
            className="rounded-full"
            fallback={student.fullName.charAt(0).toUpperCase()}
          />
          <div>
            <p className="font-medium text-[#181d27] dark:text-white group-hover:text-primary transition-colors">
              {student.fullName}
            </p>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4 text-sm text-[#535862] dark:text-gray-400">
        {student.email}
      </td>
      <td className="py-4 px-4">
        <span className="font-mono text-sm text-[#414651] dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
          {studentCode}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-[#535862] dark:text-gray-400">
        Lớp {gradeLevel}
      </td>
      <td className="py-4 px-4 text-sm text-[#535862] dark:text-gray-400 max-w-[200px] truncate">
        {schoolName}
      </td>
      <td className="py-4 px-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#e0f2fe] text-[#0369a1] dark:bg-blue-900/30 dark:text-blue-400">
          {genderLabels[gender]}
        </span>
      </td>
      <td className="py-4 px-4">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button variant="light" isIconOnly size="sm">
              <MoreVertical className="w-4 h-4 text-[#414651]" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Student actions">
            <DropdownItem
              key="view"
              startContent={<TrendingUp className="w-4 h-4" />}
              href={`/dashboard/students/${student.id}`}
            >
              Xem chi tiết
            </DropdownItem>
            {isAdmin ? (
              <DropdownItem
                key="edit"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => onEdit(student)}
              >
                Chỉnh sửa
              </DropdownItem>
            ) : null}
            {isAdmin ? (
              <DropdownItem
                key="delete"
                startContent={<Trash2 className="w-4 h-4 text-red-500" />}
                className="text-red-500"
                onPress={() => onDelete(student.id)}
              >
                Xóa
              </DropdownItem>
            ) : null}
          </DropdownMenu>
        </Dropdown>
      </td>
    </tr>
  );
}

export default function StudentsPage() {
  const { user } = useUser();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<StudentFormData>({
    email: "",
    password: "",
    fullName: "",
    studentCode: "",
    gradeLevel: 10,
    schoolName: "",
    dateOfBirth: "",
    gender: "male",
    avatarUrl: "",
  });

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentInfo?.studentCode
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.students.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Lỗi khi tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingStudent(null);
    const unixTimestamp = Math.floor(Date.now() / 1000);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      studentCode: unixTimestamp.toString(),
      gradeLevel: 10,
      schoolName: "",
      dateOfBirth: "",
      gender: "male",
      avatarUrl: "",
    });
    onOpen();
  };

  const handleEdit = (student: Student) => {
    setIsEditMode(true);
    setEditingStudent(student);
    setFormData({
      email: student.email,
      password: "",
      fullName: student.fullName,
      studentCode: student.studentInfo?.studentCode || "",
      gradeLevel: student.studentInfo?.gradeLevel || 10,
      schoolName: student.studentInfo?.schoolName || "",
      dateOfBirth: student.studentInfo?.dateOfBirth || "",
      gender: student.studentInfo?.gender || "male",
      avatarUrl: student.avatarUrl || "",
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingStudentId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingStudentId) return;

    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa học sinh...");
      await api.students.delete(deletingStudentId);
      await fetchStudents();
      toast.success("Xóa học sinh thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingStudentId(null);
    } catch (error: any) {
      console.error("Error deleting student:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xóa học sinh";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    let toastId: string | number | undefined;
    try {
      setIsSubmitting(true);
      if (isEditMode && editingStudent) {
        toastId = toast.loading("Đang cập nhật học sinh...");
        await api.students.update(editingStudent.id, {
          email: formData.email,
          password: formData.password || undefined,
          fullName: formData.fullName,
          studentCode: formData.studentCode,
          gradeLevel: formData.gradeLevel,
          schoolName: formData.schoolName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          avatarUrl: formData.avatarUrl || undefined,
        });
        toast.success("Cập nhật học sinh thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo học sinh mới...");
        await api.students.create({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          studentCode: formData.studentCode,
          gradeLevel: formData.gradeLevel,
          schoolName: formData.schoolName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          avatarUrl: formData.avatarUrl || undefined,
        });
        toast.success("Tạo học sinh thành công", { id: toastId });
      }
      await fetchStudents();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving student:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi lưu học sinh";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map((s) => s.id));
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats: StudentStats = {
    total: students.length,
    byGrade: students.reduce((acc, student) => {
      const grade = student.studentInfo?.gradeLevel || 0;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    byGender: {
      male: students.filter((s) => s.studentInfo?.gender === "male").length,
      female: students.filter((s) => s.studentInfo?.gender === "female").length,
      other: students.filter((s) => s.studentInfo?.gender === "other").length,
    },
  };

  // Get top 3 grades
  const topGrades = Object.entries(stats.byGrade)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
          <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#010101] dark:text-white">
              Quản lý học sinh
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Quản lý và theo dõi thông tin học sinh trong hệ thống
            </p>
          </div>
          {isAdmin && (
            <Button
              onPress={handleCreate}
              className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm học sinh
            </Button>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng học sinh"
            value={stats.total.toString()}
            subtitle="Học sinh đang hoạt động"
            icon={<Users className="w-6 h-6 text-[#6244F4]" />}
            color="bg-[#6244F4/10] dark:bg-blue-900/20"
          />
          <StatCard
            title="Nam"
            value={stats.byGender.male.toString()}
            subtitle={`${Math.round(
              (stats.byGender.male / stats.total) * 100
            )}% tổng số`}
            icon={<UserCheck className="w-6 h-6 text-indigo-600" />}
            color="bg-indigo-50 dark:bg-indigo-900/20"
          />
          <StatCard
            title="Nữ"
            value={stats.byGender.female.toString()}
            subtitle={`${Math.round(
              (stats.byGender.female / stats.total) * 100
            )}% tổng số`}
            icon={<UserCheck className="w-6 h-6 text-pink-600" />}
            color="bg-pink-50 dark:bg-pink-900/20"
          />
          <StatCard
            title="Lớp phổ biến nhất"
            value={topGrades[0] ? `Lớp ${topGrades[0][0]}` : "0"}
            subtitle={topGrades[0] ? `${topGrades[0][1]} học sinh` : "Chưa có học sinh"}
            icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50 dark:bg-purple-900/20"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e9eaeb] dark:border-gray-700">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
              <Input
                placeholder="Tìm kiếm theo tên, email, mã học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                classNames={{
                  input: "pl-10 text-sm",
                  inputWrapper:
                    "border-[#d5d7da] dark:border-gray-600 rounded-lg",
                }}
              />
            </div>
            {selectedStudents.length > 0 && (
              <Button
                variant="bordered"
                size="sm"
                className="border-[#d5d7da] text-[#414651] dark:text-gray-300"
                onPress={() => setSelectedStudents([])}
              >
                Bỏ chọn ({selectedStudents.length})
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "solid" : "light"}
                size="sm"
                onPress={() => setViewMode("grid")}
                className={
                  viewMode === "grid" ? "bg-white shadow-sm" : "bg-transparent"
                }
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "solid" : "light"}
                size="sm"
                onPress={() => setViewMode("list")}
                className={
                  viewMode === "list" ? "bg-white shadow-sm" : "bg-transparent"
                }
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="bordered" size="sm" className="border-[#d5d7da]">
              <Filter className="w-4 h-4 mr-1" />
              Lọc
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-[#717680] dark:text-gray-400">
            Hiển thị{" "}
            <span className="font-medium text-[#181d27] dark:text-white">
              {paginatedStudents.length}
            </span>{" "}
            /{" "}
            <span className="font-medium text-[#181d27] dark:text-white">
              {filteredStudents.length}
            </span>{" "}
            học sinh
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#181d27] dark:text-white mb-1">
              {searchQuery ? "Không tìm thấy học sinh" : "Chưa có học sinh nào"}
            </h3>
            <p className="text-[#717680] dark:text-gray-400 mb-4">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Bắt đầu bằng cách thêm học sinh mới"}
            </p>
            {!searchQuery && isAdmin && (
              <Button
                onPress={handleCreate}
                className="bg-primary text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm học sinh
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f9fafb] dark:bg-gray-800/50 border-b border-[#e9eaeb] dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        paginatedStudents.length > 0 &&
                        paginatedStudents.every((s) =>
                          selectedStudents.includes(s.id)
                        )
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Học sinh
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Mã HS
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Lớp
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Trường
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Giới tính
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <StudentListRow
                    key={student.id}
                    student={student}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSelected={selectedStudents.includes(student.id)}
                    onSelect={toggleSelectStudent}
                    isAdmin={isAdmin}
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
                Trước
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "solid" : "bordered"}
                    size="sm"
                    onPress={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? "bg-primary text-white"
                        : "border-[#d5d7da]"
                    }
                  >
                    {page}
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
              </Button>
            </div>
          </div>
        )}

        {/* Student Modal */}
        <StudentModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isEditMode={isEditMode}
          editingStudent={editingStudent}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onOpenChange={onDeleteModalOpenChange}
          size="md"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h2 className="font-semibold text-lg text-[#181d27]">
                    Xác nhận xóa
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-[#414651]">
                    Bạn có chắc chắn muốn xóa học sinh này? Hành động này không
                    thể hoàn tác.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    isDisabled={isDeleting}
                  >
                    Hủy
                  </Button>
                  <Button
                    color="danger"
                    onPress={confirmDelete}
                    isLoading={isDeleting}
                  >
                    Xóa
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    
  );
}
