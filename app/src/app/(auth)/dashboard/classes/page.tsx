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
import { Class, ClassFormData, ClassEnrollment } from "@/types/class";
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
  Users,
  GraduationCap,
  Calendar,
  UserCircle,
  ArrowUpRight,
  BookOpen,
  School,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Mail,
} from "lucide-react";
import { Avatar } from "@heroui/react";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClassModal } from "@/components/dashboards/admin/management/class/ClassModal";
import { useUser } from "@/hooks/useUser";

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

// Class Card Component
function ClassCard({
  classItem,
  students,
  onEdit,
  onDelete,
  isAdmin,
}: {
  classItem: Class;
  students: ClassEnrollment[];
  onEdit: (classItem: Class) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const activeStudents = students.filter((s) => s.status === "active");
  const topStudents = activeStudents.slice(0, 4);

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group">
      {/* Header */}
      <div className="p-5 border-b border-[#e9eaeb] dark:border-gray-700">
        <div className="flex items-start justify-between">
          <Link
            href={`/dashboard/classes/${classItem.id}`}
            className="flex-1 min-w-0"
          >
            <h3 className="font-semibold text-lg text-[#181d27] dark:text-white group-hover:text-primary transition-colors truncate">
              {classItem.className}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200">
                Khối {classItem.gradeLevel}
              </span>
              <span className="text-xs text-[#717680] dark:text-gray-400">
                {classItem.schoolYear}
              </span>
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
            <DropdownMenu aria-label="Class actions">
              <DropdownItem
                key="view"
                startContent={<BookOpen className="w-4 h-4" />}
                href={`/dashboard/classes/${classItem.id}`}
              >
                Xem chi tiết
              </DropdownItem>
              <DropdownItem
                key="workspace"
                startContent={<GraduationCap className="w-4 h-4" />}
                href={`/dashboard/classes/${classItem.id}/workspace`}
              >
                Workspace
              </DropdownItem>
              <DropdownItem
                key="progress"
                startContent={<TrendingUp className="w-4 h-4" />}
                href={`/dashboard/classes/${classItem.id}/progress`}
              >
                Tiến độ lớp
              </DropdownItem>
              {isAdmin ? (
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={() => onEdit(classItem)}
                >
                  Chỉnh sửa
                </DropdownItem>
              ) : null}
              {isAdmin ? (
                <DropdownItem
                  key="delete"
                  startContent={<Trash2 className="w-4 h-4 text-red-500" />}
                  className="text-red-500"
                  onPress={() => onDelete(classItem.id)}
                >
                  Xóa lớp
                </DropdownItem>
              ) : null}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Teacher Info */}
        <div className="flex items-center gap-3 mt-4 p-3 bg-[#f9fafb] dark:bg-gray-800/50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#717680] dark:text-gray-400">Giáo viên chủ nhiệm</p>
            <p className="text-sm font-medium text-[#181d27] dark:text-white truncate">
              {classItem.homeroomTeacher?.fullName || "Chưa phân công"}
            </p>
          </div>
        </div>
      </div>

      {/* Students Section */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#717680]" />
            <span className="text-sm font-medium text-[#181d27] dark:text-white">
              {activeStudents.length} học sinh
            </span>
          </div>
          <Link
            href={`/dashboard/classes/${classItem.id}`}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Xem tất cả
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Student Avatars */}
        {topStudents.length > 0 ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {topStudents.map((enrollment) => (
                <Avatar
                  key={enrollment.enrollmentId}
                  src={enrollment.student.avatarUrl}
                  size="sm"
                  className="rounded-full border-2 border-white dark:border-gray-700"
                  fallback={enrollment.student.fullName.charAt(0).toUpperCase()}
                  title={enrollment.student.fullName}
                />
              ))}
            </div>
            {activeStudents.length > 4 && (
              <span className="text-xs text-[#717680] dark:text-gray-400">
                +{activeStudents.length - 4}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#717680] dark:text-gray-400 italic">
            Chưa có học sinh
          </p>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#e9eaeb] dark:border-gray-700">
          <Button
            variant="bordered"
            size="sm"
            className="flex-1 border-[#d5d7da] text-[#414651] dark:text-gray-300"
            onPress={() => router.push(`/dashboard/classes/${classItem.id}/workspace`)}
          >
            <GraduationCap className="w-4 h-4 mr-1" />
            Workspace
          </Button>
          <Button
            variant="bordered"
            size="sm"
            className="flex-1 border-[#d5d7da] text-[#414651] dark:text-gray-300"
            onPress={() => router.push(`/dashboard/classes/${classItem.id}/progress`)}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Tiến độ
          </Button>
        </div>
      </div>
    </div>
  );
}

// Class List Row Component
function ClassListRow({
  classItem,
  students,
  onEdit,
  onDelete,
  isAdmin,
}: {
  classItem: Class;
  students: ClassEnrollment[];
  onEdit: (classItem: Class) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const activeStudents = students.filter((s) => s.status === "active");
  const topStudents = activeStudents.slice(0, 3);

  return (
    <tr className="hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors border-b border-[#e9eaeb] dark:border-gray-700 last:border-0">
      <td className="py-4 px-4">
        <Link
          href={`/dashboard/classes/${classItem.id}`}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <School className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-[#181d27] dark:text-white group-hover:text-primary transition-colors">
              {classItem.className}
            </p>
            <p className="text-xs text-[#717680] dark:text-gray-400">
              Khối {classItem.gradeLevel} • {classItem.schoolYear}
            </p>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <UserCircle className="w-4 h-4 text-[#717680]" />
          <span className="text-sm text-[#535862] dark:text-gray-400">
            {classItem.homeroomTeacher?.fullName || "Chưa phân công"}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#717680]" />
          <span className="text-sm text-[#535862] dark:text-gray-400">
            {activeStudents.length} học sinh
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex -space-x-2">
          {topStudents.map((enrollment) => (
            <Avatar
              key={enrollment.enrollmentId}
              src={enrollment.student.avatarUrl}
              size="sm"
              className="rounded-full border-2 border-white dark:border-gray-700"
              fallback={enrollment.student.fullName.charAt(0).toUpperCase()}
            />
          ))}
          {activeStudents.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-700 flex items-center justify-center text-xs text-[#717680] dark:text-gray-400">
              +{activeStudents.length - 3}
            </div>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button variant="light" isIconOnly size="sm">
              <MoreVertical className="w-4 h-4 text-[#414651]" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Class actions">
            <DropdownItem
              key="view"
              startContent={<BookOpen className="w-4 h-4" />}
              href={`/dashboard/classes/${classItem.id}`}
            >
              Xem chi tiết
            </DropdownItem>
            <DropdownItem
              key="workspace"
              startContent={<GraduationCap className="w-4 h-4" />}
              href={`/dashboard/classes/${classItem.id}/workspace`}
            >
              Workspace
            </DropdownItem>
            <DropdownItem
              key="progress"
              startContent={<TrendingUp className="w-4 h-4" />}
              href={`/dashboard/classes/${classItem.id}/progress`}
            >
              Tiến độ lớp
            </DropdownItem>
            {isAdmin ? (
              <DropdownItem
                key="edit"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => onEdit(classItem)}
              >
                Chỉnh sửa
              </DropdownItem>
            ) : null}
            {isAdmin ? (
              <DropdownItem
                key="delete"
                startContent={<Trash2 className="w-4 h-4 text-red-500" />}
                className="text-red-500"
                onPress={() => onDelete(classItem.id)}
              >
                Xóa lớp
              </DropdownItem>
            ) : null}
          </DropdownMenu>
        </Dropdown>
      </td>
    </tr>
  );
}

interface ClassWithStudents extends Class {
  students: ClassEnrollment[];
}

export default function ClassesPage() {
  const router = useRouter();
  const { user } = useUser();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [classes, setClasses] = useState<Class[]>([]);
  const [classesWithStudents, setClassesWithStudents] = useState<
    ClassWithStudents[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<ClassFormData>({
    className: "",
    gradeLevel: 10,
    schoolYear: "",
    homeroomTeacherId: undefined,
  });

  // Fetch classes
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await api.classes.getAll();
      setClasses(data);
      // Fetch students for each class
      await fetchStudentsForClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Lỗi khi tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForClasses = async (classesData: Class[]) => {
    try {
      setLoadingStudents(true);
      const promises = classesData.map(async (classItem) => {
        try {
          const students = await api.classes.getClassStudents(classItem.id);
          return { ...classItem, students };
        } catch (error) {
          console.error(
            `Error fetching students for class ${classItem.id}:`,
            error
          );
          return { ...classItem, students: [] };
        }
      });
      const results = await Promise.all(promises);
      setClassesWithStudents(results);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filter classes
  const filteredClasses = classesWithStudents.filter((classItem) => {
    const matchesSearch =
      classItem.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.gradeLevel.toString().includes(searchQuery) ||
      classItem.schoolYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.homeroomTeacher?.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Paginate
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingClass(null);
    const currentYear = new Date().getFullYear();
    setFormData({
      className: "",
      gradeLevel: 10,
      schoolYear: `${currentYear}-${currentYear + 1}`,
      homeroomTeacherId: undefined,
    });
    onOpen();
  };

  const handleEdit = (classItem: Class) => {
    setIsEditMode(true);
    setEditingClass(classItem);
    setFormData({
      className: classItem.className,
      gradeLevel: classItem.gradeLevel,
      schoolYear: classItem.schoolYear,
      homeroomTeacherId: classItem.homeroomTeacherId,
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingClassId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingClassId) return;

    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa lớp học...");
      await api.classes.delete(deletingClassId);
      await fetchClasses();
      toast.success("Xóa lớp học thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingClassId(null);
    } catch (error: any) {
      console.error("Error deleting class:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xóa lớp học";
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
      if (isEditMode && editingClass) {
        toastId = toast.loading("Đang cập nhật lớp học...");
        await api.classes.update(editingClass.id, {
          className: formData.className,
          gradeLevel: formData.gradeLevel,
          schoolYear: formData.schoolYear,
          homeroomTeacherId: formData.homeroomTeacherId || undefined,
        });
        toast.success("Cập nhật lớp học thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo lớp học mới...");
        await api.classes.create({
          className: formData.className,
          gradeLevel: formData.gradeLevel,
          schoolYear: formData.schoolYear,
          homeroomTeacherId: formData.homeroomTeacherId || undefined,
        });
        toast.success("Tạo lớp học thành công", { id: toastId });
      }
      await fetchClasses();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving class:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi lưu lớp học";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats
  const totalStudents = classesWithStudents.reduce(
    (acc, c) => acc + c.students.filter((s) => s.status === "active").length,
    0
  );
  const gradeDistribution = classesWithStudents.reduce((acc, c) => {
    acc[c.gradeLevel] = (acc[c.gradeLevel] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const topGrade = Object.entries(gradeDistribution).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
          <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#010101] dark:text-white">
              Quản lý lớp học
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Quản lý lớp học, theo dõi tiến độ và phân công giáo viên
            </p>
          </div>
          {isAdmin && (
            <Button
              onPress={handleCreate}
              className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm lớp học
            </Button>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng lớp học"
            value={classes.length.toString()}
            subtitle="Lớp đang hoạt động"
            icon={<School className="w-6 h-6 text-[#6244F4]" />}
            color="bg-[#6244F4/10] dark:bg-blue-900/20"
          />
          <StatCard
            title="Tổng học sinh"
            value={totalStudents.toString()}
            subtitle="Học sinh đang theo học"
            icon={<Users className="w-6 h-6 text-green-600" />}
            color="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            title="Khối phổ biến nhất"
            value={topGrade ? `Khối ${topGrade[0]}` : "0"}
            subtitle={topGrade ? `${topGrade[1]} lớp` : "Chưa có lớp học"}
            icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard
            title="Năm học"
            value={
              classes[0]?.schoolYear ||
              `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
            }
            subtitle="Năm học hiện tại"
            icon={<Calendar className="w-6 h-6 text-orange-600" />}
            color="bg-orange-50 dark:bg-orange-900/20"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e9eaeb] dark:border-gray-700">
          <div className="relative flex-1 md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
            <Input
              placeholder="Tìm kiếm theo tên lớp, khối, năm học, giáo viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNames={{
                input: "pl-10 text-sm",
                inputWrapper:
                  "border-[#d5d7da] dark:border-gray-600 rounded-lg",
              }}
            />
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
              {paginatedClasses.length}
            </span>{" "}
            /{" "}
            <span className="font-medium text-[#181d27] dark:text-white">
              {filteredClasses.length}
            </span>{" "}
            lớp học
          </p>
        </div>

        {/* Content */}
        {loading || loadingStudents ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#181d27] dark:text-white mb-1">
              {searchQuery ? "Không tìm thấy lớp học" : "Chưa có lớp học nào"}
            </h3>
            <p className="text-[#717680] dark:text-gray-400 mb-4">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Bắt đầu bằng cách thêm lớp học mới"}
            </p>
            {!searchQuery && isAdmin && (
              <Button
                onPress={handleCreate}
                className="bg-primary text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm lớp học
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                students={classItem.students}
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
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Lớp học
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Giáo viên chủ nhiệm
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Số học sinh
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Học sinh tiêu biểu
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedClasses.map((classItem) => (
                  <ClassListRow
                    key={classItem.id}
                    classItem={classItem}
                    students={classItem.students}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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

        {/* Class Modal */}
        <ClassModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isEditMode={isEditMode}
          editingClass={editingClass}
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
                  <h2 className="font-semibold text-lg text-[#181d27] dark:text-white">
                    Xác nhận xóa
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-[#414651] dark:text-gray-300">
                    Bạn có chắc chắn muốn xóa lớp học này? Hành động này không
                    thể hoàn tác.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    isDisabled={isDeleting}
                    className="dark:text-gray-300"
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
