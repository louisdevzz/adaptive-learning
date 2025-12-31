"use client";

import { useState } from "react";
import { Search, ChevronDown, Calendar, List, Grid, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Course } from "@/types/course";
import Link from "next/link";

interface CourseTableProps {
  courses: Course[];
  loading: boolean;
  onDelete: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Legacy props for backward compatibility (not used)
  selectedCourses?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectCourse?: (id: string) => void;
  selectedCount?: number;
  onClearSelection?: () => void;
}

export function CourseTable({
  courses,
  loading,
  onDelete,
  onSearchChange,
  searchQuery = "",
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: CourseTableProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (course: Course) => {
    if (course.active) {
    return (
        <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
          <span className="size-1.5 rounded-full bg-green-600 mr-1.5"></span>
          Active
          </span>
      );
    }
    
    // Check if it's archived based on visibility or other criteria
    if (course.visibility === 'private') {
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10">
          <span className="size-1.5 rounded-full bg-red-600 mr-1.5"></span>
          Archived
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10">
        <span className="size-1.5 rounded-full bg-gray-500 mr-1.5"></span>
        Draft
      </span>
    );
  };

  // Calculate module count - in production this would come from API
  const getModuleCount = (course: Course) => {
    // Placeholder - in production, fetch from API or add to Course type
    return Math.floor(Math.random() * 20) + 5;
  };

  const filteredCourses = courses.filter((course) => {
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "active" && !course.active) return false;
      if (statusFilter === "draft" && course.active) return false;
      if (statusFilter === "archived" && course.visibility !== "private") return false;
    }
    return true;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (dateFilter === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (dateFilter === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });

  const paginatedCourses = sortedCourses.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const actualTotalPages = Math.ceil(sortedCourses.length / 10);

  return (
    <div className="flex flex-col w-full">
      {/* Toolbar */}
      {onSearchChange && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500 w-5 h-5 pointer-events-none" />
            <input
              className="w-full h-11 pl-11 pr-4 rounded-lg border border-card-border dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
              placeholder="Tìm kiếm theo tên, ID hoặc từ khóa..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
            <div className="relative min-w-[160px]">
              <select
                className="w-full h-11 pl-4 pr-10 appearance-none rounded-lg border border-card-border dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="" disabled>Trạng thái</option>
                <option value="all">Tất cả</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500 w-5 h-5 pointer-events-none" />
          </div>
            <div className="relative min-w-[160px]">
              <select
                className="w-full h-11 pl-4 pr-10 appearance-none rounded-lg border border-card-border dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="" disabled>Ngày tạo</option>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500 w-5 h-5 pointer-events-none" />
          </div>
            <div className="flex items-center border border-card-border dark:border-gray-700 rounded-lg bg-white dark:bg-background-dark p-1 h-11">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "text-primary bg-primary/10"
                    : "text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "text-primary bg-primary/10"
                    : "text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
          </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="w-full">
        <div className="flex flex-col overflow-hidden rounded-xl border border-card-border dark:border-gray-700 bg-white dark:bg-background-dark shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-background-soft dark:bg-gray-800/50 border-b border-card-border dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider w-[25%]">
                    Tên khóa học
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider w-[25%] hidden md:table-cell">
                    Mô tả ngắn
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider text-center w-24">
                    Modules
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider w-32">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider text-right w-32 sticky right-0 bg-background-soft dark:bg-gray-800/50">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border dark:divide-gray-700">
        {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-text-muted dark:text-gray-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : paginatedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-text-muted dark:text-gray-400">
                      Không có khóa học nào
                    </td>
                  </tr>
                ) : (
                  paginatedCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="group hover:bg-background-soft/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-10 rounded-lg bg-gray-100 dark:bg-gray-700 bg-cover bg-center shrink-0"
                            style={{
                              backgroundImage: course.thumbnailUrl
                                ? `url('${course.thumbnailUrl}')`
                                : "none",
                            }}
                          ></div>
                          <div>
                            <div className="text-text-main dark:text-white text-sm font-semibold group-hover:text-primary transition-colors cursor-pointer">
                              {course.title}
                            </div>
                            <div className="text-text-muted dark:text-gray-400 text-xs mt-0.5 md:hidden">
                              {course.description.substring(0, 30)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted dark:text-gray-400 hidden md:table-cell">
                        {course.description.length > 50
                          ? `${course.description.substring(0, 50)}...`
                          : course.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-main dark:text-white text-center font-medium">
                        {getModuleCount(course)}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(course)}</td>
                      <td className="px-6 py-4 text-sm text-text-muted dark:text-gray-400 hidden lg:table-cell">
                        {formatDate(course.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right sticky right-0 bg-white dark:bg-background-dark group-hover:bg-background-soft/50 dark:group-hover:bg-gray-800/30">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/courses/${course.id}`}
                            className="p-1.5 text-text-muted dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/dashboard/courses/${course.id}/edit`}
                            className="p-1.5 text-text-muted dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => onDelete(course.id)}
                            className="p-1.5 text-text-muted dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
          </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        {/* Pagination */}
          {actualTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-card-border dark:border-gray-700 bg-background-soft dark:bg-gray-800/50 px-6 py-3">
              <div className="hidden sm:flex flex-1 items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted dark:text-gray-400">
                    Showing{" "}
                    <span className="font-medium text-text-main dark:text-white">1</span> to{" "}
                    <span className="font-medium text-text-main dark:text-white">
                      {Math.min(10, sortedCourses.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-text-main dark:text-white">
                      {sortedCourses.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {[...Array(Math.min(actualTotalPages, 3))].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => onPageChange && onPageChange(pageNum)}
                          className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                            currentPage === pageNum
                              ? "bg-primary text-white"
                              : "text-text-main dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {actualTotalPages > 3 && (
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-text-muted dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-offset-0">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => onPageChange && onPageChange(Math.min(actualTotalPages, currentPage + 1))}
                      disabled={currentPage === actualTotalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              </div>
              {/* Mobile Pagination */}
              <div className="flex sm:hidden w-full justify-between">
                <button
                  onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange && onPageChange(Math.min(actualTotalPages, currentPage + 1))}
                  disabled={currentPage === actualTotalPages}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
