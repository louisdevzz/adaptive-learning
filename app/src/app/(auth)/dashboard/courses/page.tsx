"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useDisclosure } from "@heroui/react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Avatar } from "@heroui/react";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { api } from "@/lib/api";
import { Course } from "@/types/course";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  BookOpen,
  Layers,
  GraduationCap,
  Calendar,
  Eye,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

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

// Course Card Component
function CourseCard({
  course,
  onDelete,
}: {
  course: Course;
  onDelete: (id: string) => void;
}) {
  const getStatusBadge = () => {
    if (course.active) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Đang hoạt động
        </span>
      );
    }
    if (course.visibility === "private") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
          Đã lưu trữ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Bản nháp
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-purple-500/10">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                variant="solid"
                isIconOnly
                size="sm"
                className="bg-white/90 backdrop-blur-sm"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Course actions">
              <DropdownItem
                key="view"
                startContent={<Eye className="w-4 h-4" />}
                href={`/dashboard/courses/${course.id}`}
              >
                Xem chi tiết
              </DropdownItem>
              <DropdownItem
                key="edit"
                startContent={<Edit className="w-4 h-4" />}
                href={`/dashboard/courses/${course.id}/edit`}
              >
                Chỉnh sửa
              </DropdownItem>
              <DropdownItem
                key="delete"
                startContent={<Trash2 className="w-4 h-4 text-red-500" />}
                className="text-red-500"
                onPress={() => onDelete(course.id)}
              >
                Xóa
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="absolute bottom-3 left-3">
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <Link href={`/dashboard/courses/${course.id}`}>
          <h3 className="font-semibold text-lg text-[#181d27] dark:text-white group-hover:text-primary transition-colors line-clamp-1">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-[#717680] dark:text-gray-400 mt-2 line-clamp-2">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-4 text-xs text-[#717680] dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{course.moduleCount ?? 0} modules</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Khối {course.gradeLevel}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e9eaeb] dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-xs text-[#717680] dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(course.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <Link
            href={`/dashboard/courses/${course.id}/edit`}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            Chỉnh sửa
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Course List Row Component
function CourseListRow({
  course,
  onDelete,
}: {
  course: Course;
  onDelete: (id: string) => void;
}) {
  const getStatusBadge = () => {
    if (course.active) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Hoạt động
        </span>
      );
    }
    if (course.visibility === "private") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
          Lưu trữ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Nháp
      </span>
    );
  };

  return (
    <tr className="hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors border-b border-[#e9eaeb] dark:border-gray-700 last:border-0">
      <td className="py-4 px-4">
        <Link href={`/dashboard/courses/${course.id}`} className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center shrink-0">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-[#181d27] dark:text-white group-hover:text-primary transition-colors">
              {course.title}
            </p>
            <p className="text-xs text-[#717680] dark:text-gray-400">
              {course.subject} • Khối {course.gradeLevel}
            </p>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm text-[#535862] dark:text-gray-400 line-clamp-1 max-w-[300px]">
          {course.description}
        </p>
      </td>
      <td className="py-4 px-4 text-center">
        <span className="text-sm font-medium text-[#181d27] dark:text-white">
          {course.moduleCount ?? 0}
        </span>
      </td>
      <td className="py-4 px-4">{getStatusBadge()}</td>
      <td className="py-4 px-4 text-sm text-[#717680] dark:text-gray-400">
        {new Date(course.createdAt).toLocaleDateString("vi-VN")}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="light"
            isIconOnly
            size="sm"
            as={Link}
            href={`/dashboard/courses/${course.id}`}
            className="text-[#717680] hover:text-primary"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="light"
            isIconOnly
            size="sm"
            as={Link}
            href={`/dashboard/courses/${course.id}/edit`}
            className="text-[#717680] hover:text-primary"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="light"
            isIconOnly
            size="sm"
            className="text-[#717680] hover:text-red-500"
            onPress={() => onDelete(course.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useUser();

  // Check admin/teacher access
  useEffect(() => {
    if (!userLoading && currentUser) {
      const role = currentUser.role?.toLowerCase();
      const isAllowed = role === "admin" || role === "teacher";
      if (!isAllowed) {
        toast.error("Bạn không có quyền truy cập trang này");
        router.push("/dashboard");
      }
    }
  }, [currentUser, userLoading, router]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal states
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.gradeLevel.toString().includes(searchQuery) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === "active") {
        filtered = filtered.filter((c) => c.active);
      } else if (statusFilter === "draft") {
        filtered = filtered.filter((c) => !c.active && c.visibility !== "private");
      } else if (statusFilter === "archived") {
        filtered = filtered.filter((c) => c.visibility === "private");
      }
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [searchQuery, courses, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getAll();

      const coursesWithModuleCounts = await Promise.all(
        data.map(async (course: Course) => {
          try {
            const modules = await api.courses.getAllModules(course.id);
            return {
              ...course,
              moduleCount: Array.isArray(modules) ? modules.length : 0,
            };
          } catch (error) {
            console.error(
              `Error fetching modules for course ${course.id}:`,
              error
            );
            return {
              ...course,
              moduleCount: 0,
            };
          }
        })
      );

      setCourses(coursesWithModuleCounts);
      setFilteredCourses(coursesWithModuleCounts);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Lỗi khi tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.active).length,
    draft: courses.filter((c) => !c.active && c.visibility !== "private").length,
    archived: courses.filter((c) => c.visibility === "private").length,
    totalModules: courses.reduce((acc, c) => acc + (c.moduleCount ?? 0), 0),
  };

  // Get unique subjects for filter
  const subjects = [...new Set(courses.map((c) => c.subject))];

  const handleCreate = () => {
    router.push("/dashboard/courses/create");
  };

  const handleDelete = (id: string) => {
    setDeletingCourseId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingCourseId) return;

    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa khóa học...");
      await api.courses.delete(deletingCourseId);
      await fetchCourses();
      toast.success("Xóa khóa học thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingCourseId(null);
    } catch (error: any) {
      console.error("Error deleting course:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xóa khóa học";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading while checking access
  if (userLoading || !currentUser) {
    return (
              <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-[#717680] dark:text-gray-400">
              Đang tải...
            </p>
          </div>
        </div>
      
    );
  }

  return (
          <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#010101] dark:text-white">
              Quản lý khóa học
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Quản lý và tổ chức nội dung học tập
            </p>
          </div>
          <Button
            onPress={handleCreate}
            className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo khóa học
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng khóa học"
            value={stats.total.toString()}
            subtitle={`${stats.totalModules} modules`}
            icon={<BookOpen className="w-6 h-6 text-[#6244F4]" />}
            color="bg-[#6244F4/10] dark:bg-blue-900/20"
          />
          <StatCard
            title="Đang hoạt động"
            value={stats.active.toString()}
            subtitle={`${Math.round((stats.active / stats.total) * 100) || 0}% tổng số`}
            icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
            color="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            title="Bản nháp"
            value={stats.draft.toString()}
            subtitle="Chưa xuất bản"
            icon={<Clock className="w-6 h-6 text-amber-600" />}
            color="bg-amber-50 dark:bg-amber-900/20"
          />
          <StatCard
            title="Đã lưu trữ"
            value={stats.archived.toString()}
            subtitle="Không công khai"
            icon={<Layers className="w-6 h-6 text-gray-600" />}
            color="bg-gray-50 dark:bg-gray-800"
          />
        </div>

        {/* Subject Distribution */}
        {subjects.length > 0 && (
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <h3 className="text-sm font-medium text-[#717680] dark:text-gray-400 mb-4">
              Phân bố theo môn học
            </h3>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => {
                const count = courses.filter((c) => c.subject === subject).length;
                return (
                  <button
                    key={subject}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#f9fafb] dark:bg-gray-800 text-[#535862] dark:text-gray-300 border border-[#e9eaeb] dark:border-gray-700 hover:border-primary/50 transition-colors"
                  >
                    {subject} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e9eaeb] dark:border-gray-700">
          <div className="relative flex-1 md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
            <Input
              placeholder="Tìm kiếm theo tên, môn học, khối lớp..."
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
                  {statusFilter
                    ? statusFilter === "active"
                      ? "Hoạt động"
                      : statusFilter === "draft"
                      ? "Bản nháp"
                      : "Đã lưu trữ"
                    : "Trạng thái"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={statusFilter ? [statusFilter] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setStatusFilter(selected || "");
                }}
              >
                <DropdownItem key="">Tất cả</DropdownItem>
                <DropdownItem key="active">Hoạt động</DropdownItem>
                <DropdownItem key="draft">Bản nháp</DropdownItem>
                <DropdownItem key="archived">Đã lưu trữ</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {statusFilter && (
              <Button
                variant="light"
                size="sm"
                onPress={() => setStatusFilter("")}
              >
                <X className="w-4 h-4" />
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
              {paginatedCourses.length}
            </span>{" "}
            /{" "}
            <span className="font-medium text-[#181d27] dark:text-white">
              {filteredCourses.length}
            </span>{" "}
            khóa học
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#181d27] dark:text-white mb-1">
              {searchQuery ? "Không tìm thấy khóa học" : "Chưa có khóa học nào"}
            </h3>
            <p className="text-[#717680] dark:text-gray-400 mb-4">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Bắt đầu bằng cách tạo khóa học mới"}
            </p>
            {!searchQuery && (
              <Button
                onPress={handleCreate}
                className="bg-primary text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tạo khóa học
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f9fafb] dark:bg-gray-800/50 border-b border-[#e9eaeb] dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Khóa học
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Mô tả
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Modules
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Ngày tạo
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#535862] dark:text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.map((course) => (
                  <CourseListRow
                    key={course.id}
                    course={course}
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
                    Xác nhận xóa khóa học
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-[#414651] dark:text-gray-300">
                    Bạn có chắc chắn muốn xóa khóa học này? Hành động này không
                    thể hoàn tác.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    className="text-[#414651]"
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
