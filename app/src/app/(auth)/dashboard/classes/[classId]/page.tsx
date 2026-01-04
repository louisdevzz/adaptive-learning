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
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Class, ClassEnrollment } from "@/types/class";
import { useRouter } from "next/navigation";

export default function ClassPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();

  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </LayoutDashboard>
    );
  }

  if (error || !classData) {
    return (
      <LayoutDashboard>
        <div className="p-6 text-center text-red-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Error</h2>
          <p>{error || "Class not found"}</p>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-tight">
              Tổng quan Lớp {classData.className}
            </h2>
            <p className="text-text-muted dark:text-gray-400 text-sm mt-1">
              Thông tin chi tiết và quản lý học sinh cho Lớp{" "}
              {classData.className} (Năm học {classData.schoolYear}).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/classes/${classId}/progress`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <TrendingUp className="w-[18px] h-[18px]" />
              Tiến độ & Can thiệp
            </Link>
            <Link
              href={`/dashboard/classes/${classId}/workspace`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Layout className="w-[18px] h-[18px]" />
              Không gian làm việc
            </Link>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <FileEdit className="w-[18px] h-[18px]" />
              Quản lý điểm
            </button>
            <button
              onClick={() => router.push(`/dashboard/users/create`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg text-sm font-bold transition-colors shadow-blue-200 dark:shadow-none"
            >
              <UserPlus className="w-5 h-5" />
              Thêm Học sinh
            </button>
          </div>
        </div>

        {/* Metric Cards - Static for now as API doesn't return these stats yet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Average Score Card */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-primary/10 text-primary dark:bg-primary/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  Điểm trung bình
                </p>
                <p className="text-2xl font-bold text-text-main dark:text-white">
                  --
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-medium">
              N/A
            </span>
          </div>

          {/* Attendance Rate Card */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  Sĩ số
                </p>
                <p className="text-2xl font-bold text-text-main dark:text-white">
                  {students.length}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
              Học sinh
            </span>
          </div>

          {/* Upcoming Deadlines Card */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  Giáo viên CN
                </p>
                <p className="text-lg font-bold text-text-main dark:text-white truncate max-w-[150px]">
                  {classData.homeroomTeacher?.fullName || "Chưa gán"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List Table */}
        <div className="bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-xl shadow-sm flex flex-col flex-1">
          {/* Search and Filter Bar */}
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 w-full md:w-auto gap-3 items-center">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500 pointer-events-none">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Tìm kiếm theo tên học sinh..."
                  type="text"
                />
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[160px]">
                <select className="w-full pl-3 pr-10 py-2.5 bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer">
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Active</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="completed">Completed</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-card-border dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-background-dark/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                    Học sinh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                    Ngày sinh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                    Giới tính
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Hành động</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-light dark:bg-background-dark divide-y divide-card-border dark:divide-gray-700">
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-text-muted dark:text-gray-400"
                    >
                      Chưa có học sinh nào trong lớp này.
                    </td>
                  </tr>
                ) : (
                  students.map((enrollment) => (
                    <tr key={enrollment.enrollmentId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {enrollment.student.avatarUrl ? (
                            <div
                              className="shrink-0 size-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700"
                              style={{
                                backgroundImage: `url('${enrollment.student.avatarUrl}')`,
                              }}
                            ></div>
                          ) : (
                            <div className="shrink-0 size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                              {enrollment.student.fullName
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text-main dark:text-white">
                              {enrollment.student.fullName}
                            </div>
                            <div className="text-xs text-text-muted">
                              {enrollment.student.studentInfo?.studentCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400">
                        {enrollment.student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${
                              enrollment.status === "active"
                                ? "bg-green-500"
                                : enrollment.status === "completed"
                                ? "bg-blue-500"
                                : "bg-red-500"
                            }`}
                          ></span>
                          <span className="text-sm text-text-muted dark:text-gray-300 capitalize">
                            {enrollment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main dark:text-white font-medium">
                        {enrollment.student.studentInfo?.dateOfBirth
                          ? new Date(
                              enrollment.student.studentInfo.dateOfBirth
                            ).toLocaleDateString("vi-VN")
                          : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400">
                        {enrollment.student.studentInfo?.gender === "male"
                          ? "Nam"
                          : enrollment.student.studentInfo?.gender === "female"
                          ? "Nữ"
                          : "Khác"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/users/${enrollment.student.id}`} // Assuming this route exists or similar
                          className="text-primary hover:text-primary-dark dark:hover:text-blue-400 flex items-center justify-end gap-1"
                        >
                          Xem
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {students.length > 0 && (
            <div className="px-6 py-4 border-t border-card-border dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl">
              <span className="text-sm text-text-muted dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-text-main dark:text-white">
                  1-{students.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-text-main dark:text-white">
                  {students.length}
                </span>{" "}
                students
              </span>
              <div className="flex items-center gap-1 opacity-50 pointer-events-none">
                <button className="p-2 rounded-lg border border-card-border dark:border-gray-700 text-text-muted dark:text-gray-400">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="min-w-[32px] h-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-medium">
                  1
                </button>
                <button className="p-2 rounded-lg border border-card-border dark:border-gray-700 text-text-muted dark:text-gray-400">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
}
