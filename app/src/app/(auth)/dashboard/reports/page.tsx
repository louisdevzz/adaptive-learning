"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import useSWR from "swr";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Download,
  FileText,
  ChevronDown,
  School,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DateRangePicker,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
} from "@heroui/react";
import { parseDate, today, getLocalTimeZone, DateValue } from "@internationalized/date";
import * as XLSX from "xlsx";
import { Document, Paragraph, Table, TableCell, TableRow, Packer, AlignmentType, WidthType } from "docx";

// Types
type DateRange = {
  start: DateValue;
  end: DateValue;
};

// Admin Report Data Types
type AdminStats = {
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  averageProgress: number;
  dropoutRate: number;
  avgStudyTimeMinutes: number;
};

type TopCourse = {
  name: string;
  subject: string;
  progress: number;
};

type DifficultKP = {
  name: string;
  failRate: number;
  totalAttempts: number;
};

type ClassDistribution = {
  name: string;
  gradeLevel: number;
  value: number;
};

type TeacherHighlight = {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  className: string;
  activityLevel: string;
  assignmentCount: number;
};

type LowProgressClass = {
  id: string;
  className: string;
  gradeLevel: number;
  avgMastery: number;
  issue: string;
};

type LearningHealthData = {
  date: string;
  completions: number;
};

type AdminReportInsights = {
  studentsByGrade: Array<{
    gradeLevel: number;
    studentCount: number;
    avgMastery: number;
  }>;
  masteryBands: {
    excellent: number;
    good: number;
    average: number;
    atRisk: number;
  };
  weeklyActivity: Array<{
    date: string;
    attempts: number;
    activeStudents: number;
  }>;
  summary: {
    totalStudentsWithMastery: number;
    atRiskStudents: number;
    engagementRate: number;
  };
};

type TeacherReportInsights = {
  classRanking: Array<{
    classId: string;
    className: string;
    gradeLevel: number | null;
    studentCount: number;
    avgMastery: number;
  }>;
  masteryBands: {
    excellent: number;
    good: number;
    average: number;
    atRisk: number;
  };
  weeklyActivity: Array<{
    date: string;
    attempts: number;
    activeStudents: number;
  }>;
  atRiskByClass: Array<{
    classId: string;
    className: string;
    atRiskStudents: number;
    totalStudents: number;
    atRiskRate: number;
  }>;
  summary: {
    trackedStudents: number;
    atRiskStudents: number;
    averageClassMastery: number;
  };
};

// Teacher Report Data Types
type TeacherStats = {
  totalClasses: number;
  totalStudents: number;
  totalCourses: number;
  totalAssignments: number;
  averageProgress: number;
  classes: Array<{
    id: string;
    name: string;
    gradeLevel: number | null;
    students: number;
    progress: number;
  }>;
  strugglingStudents: Array<{
    id: string;
    name: string;
    avatarUrl: string | null;
    className: string;
    avgMastery: number;
    issue: string;
  }>;
};

// Fetcher for SWR
const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response;
};

// Helper to format date
const formatDate = (date: DateValue): string => {
  const year = date.year;
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ==================== ADMIN REPORTS VIEW ====================
function AdminReportsView({
  dateRange,
  onDataLoaded,
}: {
  dateRange: DateRange;
  onDataLoaded: (data: AdminReportData) => void;
}) {
  const startDate = formatDate(dateRange.start);
  const endDate = formatDate(dateRange.end);

  // Fetch admin data
  const { data: stats, isLoading: statsLoading } = useSWR<AdminStats>(
    `/dashboard/stats?startDate=${startDate}&endDate=${endDate}`,
    fetcher
  );
  const { data: topCourses, isLoading: coursesLoading } = useSWR<TopCourse[]>(
    "/dashboard/top-courses?limit=5",
    fetcher
  );
  const { data: difficultKPs, isLoading: kpsLoading } = useSWR<DifficultKP[]>(
    "/dashboard/difficult-kps?limit=5",
    fetcher
  );
  const { data: classDistribution, isLoading: distributionLoading } = useSWR<
    ClassDistribution[]
  >("/dashboard/class-distribution", fetcher);
  const { data: teacherHighlights, isLoading: teachersLoading } = useSWR<
    TeacherHighlight[]
  >("/dashboard/teacher-highlights?limit=5", fetcher);
  const { data: lowProgressClasses, isLoading: lowProgressLoading } = useSWR<
    LowProgressClass[]
  >("/dashboard/low-progress-classes?limit=5", fetcher);
  const { data: learningHealth, isLoading: healthLoading } = useSWR<
    LearningHealthData[]
  >(
    `/dashboard/learning-health?startDate=${startDate}&endDate=${endDate}`,
    fetcher
  );
  const { data: adminInsights, isLoading: insightsLoading } =
    useSWR<AdminReportInsights>(
      `/dashboard/admin-report-insights?startDate=${startDate}&endDate=${endDate}`,
      fetcher
    );

  const isLoading =
    statsLoading ||
    coursesLoading ||
    kpsLoading ||
    distributionLoading ||
    teachersLoading ||
    lowProgressLoading ||
    healthLoading ||
    insightsLoading;

  // Collect data for export
  useEffect(() => {
    if (
      stats &&
      topCourses &&
      difficultKPs &&
      classDistribution &&
      teacherHighlights &&
      lowProgressClasses &&
      learningHealth &&
      adminInsights
    ) {
      onDataLoaded({
        stats,
        topCourses,
        difficultKPs,
        classDistribution,
        teacherHighlights,
        lowProgressClasses,
        learningHealth,
        insights: adminInsights,
        dateRange: { start: startDate, end: endDate },
      });
    }
  }, [
    stats,
    topCourses,
    difficultKPs,
    classDistribution,
    teacherHighlights,
    lowProgressClasses,
    learningHealth,
    adminInsights,
    startDate,
    endDate,
    onDataLoaded,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Tổng học sinh"
          value={stats?.totalStudents?.toString() || "0"}
          icon={Users}
          color="bg-[#6244F4/10] text-[#6244F4]"
        />
        <StatCard
          title="Tổng giáo viên"
          value={stats?.totalTeachers?.toString() || "0"}
          icon={School}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Khóa học active"
          value={stats?.activeCourses?.toString() || "0"}
          icon={BookOpen}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Tiến độ TB"
          value={`${stats?.averageProgress || 0}%`}
          icon={TrendingUp}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Tỷ lệ bỏ học"
          value={`${stats?.dropoutRate || 0}%`}
          icon={AlertCircle}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          title="Thời gian TB"
          value={`${stats?.avgStudyTimeMinutes || 0} phút`}
          icon={Clock}
          color="bg-cyan-50 text-cyan-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-bold">Top khóa học</h3>
            <p className="text-sm text-gray-500">
              Khóa học có tiến độ cao nhất
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {topCourses?.map((course, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-sm text-gray-500">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} size="sm" color="primary" />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Difficult Knowledge Points */}
        <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-bold">Điểm kiến thức khó</h3>
            <p className="text-sm text-gray-500">
              Các KP có tỷ lệ sai cao nhất
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {difficultKPs?.map((kp, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{kp.name}</span>
                      <Chip size="sm" color="danger" variant="flat">
                        {kp.failRate}% sai
                      </Chip>
                    </div>
                    <p className="text-xs text-gray-500">
                      {kp.totalAttempts} lần thử
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-bold">Phân bố lớp học</h3>
            <p className="text-sm text-gray-500">Số học sinh theo lớp</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {classDistribution?.map((cls) => (
                <div
                  key={cls.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{cls.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      (Khối {cls.gradeLevel})
                    </span>
                  </div>
                  <Chip size="sm" color="primary" variant="flat">
                    {cls.value} học sinh
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Teacher Highlights */}
        <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-bold">Giáo viên tiêu biểu</h3>
            <p className="text-sm text-gray-500">Hoạt động tích cực nhất</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {teacherHighlights?.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {teacher.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-xs text-gray-500">{teacher.className}</p>
                  </div>
                  <div className="text-right">
                    <Chip size="sm" color="success" variant="flat">
                      {teacher.activityLevel}
                    </Chip>
                    <p className="text-xs text-gray-500 mt-1">
                      {teacher.assignmentCount} bài tập
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Low Progress Classes */}
      <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <h3 className="text-lg font-bold">Lớp cần chú ý</h3>
          <p className="text-sm text-gray-500">Các lớp có tiến độ thấp</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowProgressClasses?.map((cls) => (
              <div
                key={cls.id}
                className="p-4 border border-red-200 rounded-lg bg-red-50/50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{cls.className}</p>
                    <p className="text-sm text-gray-500">
                      Khối {cls.gradeLevel}
                    </p>
                  </div>
                  <Chip size="sm" color="danger">
                    {cls.avgMastery}%
                  </Chip>
                </div>
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {cls.issue}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Learning Health Chart */}
      <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <h3 className="text-lg font-bold">Sức khỏe học tập</h3>
          <p className="text-sm text-gray-500">
            Số KP hoàn thành theo ngày ({startDate} đến {endDate})
          </p>
        </CardHeader>
        <CardBody>
          <div className="h-64 flex items-end gap-2">
            {learningHealth?.map((day, idx) => {
              const maxValue = Math.max(
                ...(learningHealth?.map((d) => d.completions) || [1])
              );
              const height = maxValue > 0 ? (day.completions / maxValue) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all duration-500"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.date}: ${day.completions} completions`}
                  />
                  <span className="text-xs text-gray-500 rotate-0">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Advanced Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-bold">Phân tầng năng lực học sinh</h3>
            <p className="text-sm text-gray-500">
              Theo mức mastery tổng hợp toàn hệ thống
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {[
                { label: "Xuất sắc (>=85)", value: adminInsights?.masteryBands.excellent || 0, color: "bg-emerald-500" },
                { label: "Tốt (70-84)", value: adminInsights?.masteryBands.good || 0, color: "bg-blue-500" },
                { label: "Trung bình (50-69)", value: adminInsights?.masteryBands.average || 0, color: "bg-amber-500" },
                { label: "Cần hỗ trợ (<50)", value: adminInsights?.masteryBands.atRisk || 0, color: "bg-red-500" },
              ].map((band) => {
                const total =
                  (adminInsights?.summary.totalStudentsWithMastery || 0) || 1;
                const percent = Math.round((band.value / total) * 100);

                return (
                  <div key={band.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{band.label}</span>
                      <span className="font-semibold">
                        {band.value} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${band.color}`}
                        style={{ width: `${Math.max(percent, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">HS có dữ liệu mastery</p>
                <p className="text-xl font-bold">
                  {adminInsights?.summary.totalStudentsWithMastery || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-gray-500">HS cần hỗ trợ</p>
                <p className="text-xl font-bold text-red-600">
                  {adminInsights?.summary.atRiskStudents || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-bold">Hoạt động học tập theo tuần</h3>
            <p className="text-sm text-gray-500">
              Lượt làm bài và số học sinh hoạt động mỗi ngày
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {(adminInsights?.weeklyActivity || []).length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có dữ liệu hoạt động.</p>
              ) : (
                (adminInsights?.weeklyActivity || []).map((item) => {
                  const maxAttempts = Math.max(
                    ...((adminInsights?.weeklyActivity || []).map((entry) => entry.attempts) || [1])
                  );
                  const attemptPercent =
                    maxAttempts > 0
                      ? Math.round((item.attempts / maxAttempts) * 100)
                      : 0;

                  return (
                    <div
                      key={item.date}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.date}</span>
                        <span className="font-semibold">{item.attempts} lượt</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.max(attemptPercent, 4)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.activeStudents} học sinh hoạt động
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <h3 className="text-lg font-bold">Mastery trung bình theo khối</h3>
          <p className="text-sm text-gray-500">
            So sánh quy mô và chất lượng học theo từng khối
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(adminInsights?.studentsByGrade || []).map((grade) => (
              <div
                key={grade.gradeLevel}
                className="p-4 rounded-lg border border-gray-200 bg-white"
              >
                <p className="text-sm text-gray-500">Khối {grade.gradeLevel}</p>
                <p className="text-2xl font-bold mt-1">{grade.studentCount}</p>
                <p className="text-xs text-gray-500">học sinh</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Mastery TB</span>
                    <span className="font-semibold">{grade.avgMastery}%</span>
                  </div>
                  <Progress
                    value={grade.avgMastery}
                    size="sm"
                    color={grade.avgMastery >= 70 ? "success" : grade.avgMastery >= 50 ? "warning" : "danger"}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ==================== TEACHER REPORTS VIEW ====================
function TeacherReportsView({
  dateRange,
  onDataLoaded,
}: {
  dateRange: DateRange;
  onDataLoaded: (data: TeacherReportData) => void;
}) {
  const startDate = formatDate(dateRange.start);
  const endDate = formatDate(dateRange.end);

  // Fetch teacher data
  const { data: stats, isLoading: statsLoading } = useSWR<TeacherStats>(
    "/dashboard/teacher-stats",
    fetcher
  );
  const { data: insights, isLoading: insightsLoading } = useSWR<TeacherReportInsights>(
    `/dashboard/teacher-report-insights?startDate=${startDate}&endDate=${endDate}`,
    fetcher
  );

  const isLoading = statsLoading || insightsLoading;

  // Collect data for export
  useEffect(() => {
    if (stats && insights) {
      onDataLoaded({
        stats,
        insights,
        dateRange: { start: startDate, end: endDate },
      });
    }
  }, [stats, insights, startDate, endDate, onDataLoaded]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Lớp chủ nhiệm"
          value={stats?.totalClasses?.toString() || "0"}
          icon={School}
          color="bg-[#6244F4/10] text-[#6244F4]"
        />
        <StatCard
          title="Tổng học sinh"
          value={stats?.totalStudents?.toString() || "0"}
          icon={Users}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Khóa học"
          value={stats?.totalCourses?.toString() || "0"}
          icon={BookOpen}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Bài tập"
          value={stats?.totalAssignments?.toString() || "0"}
          icon={FileText}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Tiến độ TB"
          value={`${stats?.averageProgress || 0}%`}
          icon={TrendingUp}
          color="bg-cyan-50 text-cyan-600"
        />
      </div>

      {/* Class Details */}
      <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row gap-2">
          <h3 className="text-lg font-bold">Tiến độ các lớp</h3>
          <p className="text-sm text-gray-500">
            Chi tiết tiến độ học tập theo lớp
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.classes?.map((cls) => (
              <div
                key={cls.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">{cls.name}</p>
                    <p className="text-sm text-gray-500">
                      {cls.gradeLevel ? `Khối ${cls.gradeLevel}` : "Chưa phân khối"} •{" "}
                      {cls.students} học sinh
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    color={cls.progress >= 70 ? "success" : cls.progress >= 50 ? "warning" : "danger"}
                  >
                    {cls.progress}%
                  </Chip>
                </div>
                <Progress
                  value={cls.progress}
                  size="md"
                  color={cls.progress >= 70 ? "success" : cls.progress >= 50 ? "warning" : "danger"}
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Struggling Students */}
      <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row gap-2">
          <h3 className="text-lg font-bold">Học sinh cần hỗ trợ</h3>
          <p className="text-sm text-gray-500">
            Học sinh có tiến độ thấp (dưới 50%)
          </p>
        </CardHeader>
        <CardBody>
          {stats?.strugglingStudents?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>Tất cả học sinh đang có tiến độ tốt!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.strugglingStudents?.map((student) => (
                <div
                  key={student.id}
                  className="p-4 border border-red-200 rounded-lg bg-red-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-gray-600">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.className}</p>
                    </div>
                    <div className="text-right">
                      <Chip size="sm" color="danger" variant="flat">
                        {student.avgMastery}%
                      </Chip>
                    </div>
                  </div>
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {student.issue}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-bold">Phân tầng mastery lớp phụ trách</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {[
                { label: "Xuất sắc (>=85)", value: insights?.masteryBands.excellent || 0, color: "bg-emerald-500" },
                { label: "Tốt (70-84)", value: insights?.masteryBands.good || 0, color: "bg-blue-500" },
                { label: "Trung bình (50-69)", value: insights?.masteryBands.average || 0, color: "bg-amber-500" },
                { label: "Cần hỗ trợ (<50)", value: insights?.masteryBands.atRisk || 0, color: "bg-red-500" },
              ].map((band) => {
                const total = (insights?.summary.trackedStudents || 0) || 1;
                const percent = Math.round((band.value / total) * 100);

                return (
                  <div key={band.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{band.label}</span>
                      <span className="font-semibold">{band.value} ({percent}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${band.color}`}
                        style={{ width: `${Math.max(percent, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-gray-500">HS theo dõi</p>
                <p className="font-bold text-lg">{insights?.summary.trackedStudents || 0}</p>
              </div>
              <div className="p-2 rounded-lg border border-red-100 bg-red-50">
                <p className="text-gray-500">HS rủi ro</p>
                <p className="font-bold text-lg text-red-600">{insights?.summary.atRiskStudents || 0}</p>
              </div>
              <div className="p-2 rounded-lg border border-cyan-100 bg-cyan-50">
                <p className="text-gray-500">Mastery lớp</p>
                <p className="font-bold text-lg text-cyan-700">{insights?.summary.averageClassMastery || 0}%</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-bold">Xu hướng hoạt động theo ngày</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {(insights?.weeklyActivity || []).length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có dữ liệu hoạt động.</p>
              ) : (
                (insights?.weeklyActivity || []).map((item) => {
                  const maxAttempts = Math.max(
                    ...((insights?.weeklyActivity || []).map((entry) => entry.attempts) || [1])
                  );
                  const attemptPercent =
                    maxAttempts > 0
                      ? Math.round((item.attempts / maxAttempts) * 100)
                      : 0;

                  return (
                    <div
                      key={item.date}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.date}</span>
                        <span className="font-semibold">{item.attempts} lượt</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.max(attemptPercent, 4)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.activeStudents} học sinh hoạt động
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
        <CardHeader className='flex flex-row gap-2'>
          <h3 className="text-lg font-bold">Lớp có tỷ lệ học sinh rủi ro cao</h3>
          <p className="text-sm text-gray-500">
            Ưu tiên can thiệp theo tỷ lệ học sinh dưới ngưỡng 50%
          </p>
        </CardHeader>
        <CardBody>
          {(insights?.atRiskByClass || []).length === 0 ? (
            <p className="text-sm text-gray-500">Không có dữ liệu lớp rủi ro.</p>
          ) : (
            <div className="space-y-3">
              {(insights?.atRiskByClass || []).map((item) => (
                <div
                  key={item.classId}
                  className="p-3 rounded-lg border border-gray-200 bg-white"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">{item.className}</p>
                    <Chip
                      size="sm"
                      color={item.atRiskRate >= 40 ? "danger" : item.atRiskRate >= 20 ? "warning" : "success"}
                      variant="flat"
                    >
                      {item.atRiskRate}%
                    </Chip>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.atRiskStudents}/{item.totalStudents} học sinh cần hỗ trợ
                  </p>
                  <Progress
                    value={item.atRiskRate}
                    size="sm"
                    color={item.atRiskRate >= 40 ? "danger" : item.atRiskRate >= 20 ? "warning" : "success"}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// ==================== STAT CARD COMPONENT ====================
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card shadow="none" className="border border-gray-200 dark:border-gray-700">
      <CardBody className="flex flex-row items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </CardBody>
    </Card>
  );
}

// ==================== EXPORT FUNCTIONS ====================
type AdminReportData = {
  stats: AdminStats;
  topCourses: TopCourse[];
  difficultKPs: DifficultKP[];
  classDistribution: ClassDistribution[];
  teacherHighlights: TeacherHighlight[];
  lowProgressClasses: LowProgressClass[];
  learningHealth: LearningHealthData[];
  insights: AdminReportInsights;
  dateRange: { start: string; end: string };
};

type TeacherReportData = {
  stats: TeacherStats;
  insights: TeacherReportInsights;
  dateRange: { start: string; end: string };
};

type TeacherAnalysis = {
  totalStudentsFromClasses: number;
  averageClassSize: number;
  bestClass: TeacherStats["classes"][number] | null;
  lowestClass: TeacherStats["classes"][number] | null;
  classesAtOrAbove70: number;
  classesBelow50: number;
  strugglingStudentsCount: number;
  strugglingStudentsRate: number;
  progressDistribution: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
};

type ReportRole = "admin" | "teacher";
type ReportExportExtension = "pdf" | "xlsx" | "docx";

const getReportRoleLabel = (role: ReportRole): string =>
  role === "admin" ? "tong-quan-he-thong" : "giao-vien";

const buildReportFileName = (
  role: ReportRole,
  dateRange: { start: string; end: string },
  extension: ReportExportExtension
): string =>
  `bao-cao-${getReportRoleLabel(role)}-${dateRange.start}-den-${dateRange.end}.${extension}`;

const buildPdfTable = (
  headers: string[],
  rows: Array<Array<string | number>>
) => ({
  table: {
    headerRows: 1,
    widths: headers.map(() => "*"),
    body: [headers, ...rows.map((row) => row.map((cell) => String(cell ?? "")))],
  },
  layout: "lightHorizontalLines" as const,
  margin: [0, 6, 0, 12] as [number, number, number, number],
  fontSize: 10,
});

const getClassPerformanceLabel = (progress: number): string => {
  if (progress >= 85) return "Xuất sắc";
  if (progress >= 70) return "Tốt";
  if (progress >= 50) return "Trung bình";
  return "Cần cải thiện";
};

const getSupportPriority = (avgMastery: number): string => {
  if (avgMastery < 30) return "Ưu tiên cao";
  if (avgMastery < 50) return "Ưu tiên vừa";
  return "Theo dõi";
};

const buildTeacherAnalysis = (stats: TeacherStats): TeacherAnalysis => {
  const classes = stats.classes ?? [];
  const strugglingStudents = stats.strugglingStudents ?? [];

  const totalStudentsFromClasses = classes.reduce(
    (accumulator, classItem) => accumulator + classItem.students,
    0
  );

  const averageClassSize =
    classes.length > 0
      ? Math.round((totalStudentsFromClasses / classes.length) * 10) / 10
      : 0;

  const sortedByProgress = [...classes].sort((a, b) => b.progress - a.progress);
  const bestClass = sortedByProgress[0] ?? null;
  const lowestClass =
    sortedByProgress.length > 0 ? sortedByProgress[sortedByProgress.length - 1] : null;

  const classesAtOrAbove70 = classes.filter((classItem) => classItem.progress >= 70).length;
  const classesBelow50 = classes.filter((classItem) => classItem.progress < 50).length;

  const strugglingStudentsCount = strugglingStudents.length;
  const strugglingStudentsRate =
    totalStudentsFromClasses > 0
      ? Math.round((strugglingStudentsCount / totalStudentsFromClasses) * 1000) / 10
      : 0;

  const distributionBase = [
    {
      label: ">= 85% (Xuất sắc)",
      count: classes.filter((classItem) => classItem.progress >= 85).length,
    },
    {
      label: "70% - 84% (Tốt)",
      count: classes.filter((classItem) => classItem.progress >= 70 && classItem.progress < 85).length,
    },
    {
      label: "50% - 69% (Trung bình)",
      count: classes.filter((classItem) => classItem.progress >= 50 && classItem.progress < 70).length,
    },
    {
      label: "< 50% (Cần cải thiện)",
      count: classes.filter((classItem) => classItem.progress < 50).length,
    },
  ];

  const progressDistribution = distributionBase.map((item) => ({
    ...item,
    percentage:
      classes.length > 0
        ? Math.round((item.count / classes.length) * 1000) / 10
        : 0,
  }));

  return {
    totalStudentsFromClasses,
    averageClassSize,
    bestClass,
    lowestClass,
    classesAtOrAbove70,
    classesBelow50,
    strugglingStudentsCount,
    strugglingStudentsRate,
    progressDistribution,
  };
};

async function exportToPDF(
  role: ReportRole,
  data: AdminReportData | TeacherReportData
) {
  const [pdfMakeModule, pdfFontsModule] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);

  const pdfMakeCandidate = (
    (pdfMakeModule as Record<string, unknown>).default ??
    (pdfMakeModule as Record<string, unknown>)["module.exports"] ??
    pdfMakeModule
  ) as {
    createPdf?: (docDefinition: unknown) => {
      download: (fileName?: string, cb?: () => void) => void;
    };
    addVirtualFileSystem?: (vfs: Record<string, string>) => void;
    vfs?: Record<string, string>;
  };

  const fontContainer = (
    (pdfFontsModule as Record<string, unknown>).default ??
    (pdfFontsModule as Record<string, unknown>)["module.exports"] ??
    pdfFontsModule
  ) as {
    pdfMake?: { vfs?: Record<string, string> };
    vfs?: Record<string, string>;
    [fontFile: string]: unknown;
  };

  const vfsFromContainer =
    fontContainer.pdfMake?.vfs ??
    fontContainer.vfs ??
    (fontContainer["Roboto-Regular.ttf"]
      ? (fontContainer as Record<string, string>)
      : undefined);

  if (!vfsFromContainer) {
    throw new Error("Không thể tải bộ font PDF Unicode");
  }

  if (typeof pdfMakeCandidate.addVirtualFileSystem === "function") {
    pdfMakeCandidate.addVirtualFileSystem(vfsFromContainer);
  } else {
    pdfMakeCandidate.vfs = vfsFromContainer;
  }

  if (typeof pdfMakeCandidate.createPdf !== "function") {
    throw new Error("Không thể khởi tạo trình xuất PDF");
  }

  const title =
    role === "admin" ? "BÁO CÁO TỔNG QUAN HỆ THỐNG" : "BÁO CÁO GIÁO VIÊN";

  const content: Array<Record<string, unknown>> = [
    { text: title, style: "title", alignment: "center" },
    {
      text: `Từ ngày: ${data.dateRange.start} đến ${data.dateRange.end}`,
      style: "subtitle",
      alignment: "center",
      margin: [0, 0, 0, 10],
    },
    {
      text: `Thời điểm xuất: ${new Date().toLocaleString("vi-VN")}`,
      style: "subtitle",
      alignment: "center",
      margin: [0, 0, 0, 10],
    },
  ];

  if (role === "admin") {
    const adminData = data as AdminReportData;
    const masteryBands = [
      {
        label: "Xuất sắc (>=85)",
        count: adminData.insights.masteryBands.excellent,
      },
      {
        label: "Tốt (70-84)",
        count: adminData.insights.masteryBands.good,
      },
      {
        label: "Trung bình (50-69)",
        count: adminData.insights.masteryBands.average,
      },
      {
        label: "Cần hỗ trợ (<50)",
        count: adminData.insights.masteryBands.atRisk,
      },
    ];
    const totalStudentsWithMastery =
      adminData.insights.summary.totalStudentsWithMastery || 1;

    content.push(
      { text: "1. Thống kê tổng quan", style: "sectionHeader" },
      buildPdfTable(
        ["Chỉ số", "Giá trị"],
        [
          ["Tổng học sinh", adminData.stats.totalStudents],
          ["Tổng giáo viên", adminData.stats.totalTeachers],
          ["Khóa học active", adminData.stats.activeCourses],
          ["Tiến độ trung bình", `${adminData.stats.averageProgress}%`],
          ["Tỷ lệ bỏ học", `${adminData.stats.dropoutRate}%`],
          ["Thời gian học TB", `${adminData.stats.avgStudyTimeMinutes} phút`],
          [
            "Tỷ lệ tương tác",
            `${adminData.insights.summary.engagementRate}%`,
          ],
        ]
      ),
      { text: "2. Phân tầng năng lực học sinh", style: "sectionHeader" },
      buildPdfTable(
        ["Nhóm năng lực", "Số học sinh", "Tỷ lệ"],
        masteryBands.map((item) => [
          item.label,
          item.count,
          `${Math.round((item.count / totalStudentsWithMastery) * 100)}%`,
        ])
      ),
      { text: "3. Mastery trung bình theo khối", style: "sectionHeader" },
      buildPdfTable(
        ["Khối", "Số học sinh", "Mastery TB"],
        adminData.insights.studentsByGrade.map((grade) => [
          `Khối ${grade.gradeLevel}`,
          grade.studentCount,
          `${grade.avgMastery}%`,
        ])
      ),
      { text: "4. Hoạt động học tập theo ngày", style: "sectionHeader" },
      buildPdfTable(
        ["Ngày", "Lượt làm bài", "HS hoạt động"],
        adminData.insights.weeklyActivity.map((item) => [
          item.date,
          item.attempts,
          item.activeStudents,
        ])
      ),
      { text: "5. Top khóa học", style: "sectionHeader" },
      buildPdfTable(
        ["Thứ hạng", "Tên khóa học", "Môn học", "Tiến độ"],
        adminData.topCourses.map((c, i) => [i + 1, c.name, c.subject, `${c.progress}%`])
      ),
      { text: "6. Điểm kiến thức khó", style: "sectionHeader" },
      buildPdfTable(
        ["Tên KP", "Tỷ lệ sai", "Số lần thử"],
        adminData.difficultKPs.map((kp) => [kp.name, `${kp.failRate}%`, kp.totalAttempts])
      ),
      { text: "7. Lớp cần chú ý", style: "sectionHeader" },
      buildPdfTable(
        ["Lớp", "Khối", "Tiến độ TB", "Vấn đề"],
        adminData.lowProgressClasses.map((c) => [
          c.className,
          c.gradeLevel,
          `${c.avgMastery}%`,
          c.issue,
        ])
      )
    );
  } else {
    const teacherData = data as TeacherReportData;
    const analysis = buildTeacherAnalysis(teacherData.stats);
    const classRanking = [...teacherData.stats.classes].sort(
      (a, b) => b.progress - a.progress
    );
    const strugglingStudentsSorted = [...teacherData.stats.strugglingStudents].sort(
      (a, b) => a.avgMastery - b.avgMastery
    );

    content.push(
      { text: "1. Thống kê tổng quan", style: "sectionHeader" },
      buildPdfTable(
        ["Chỉ số", "Giá trị"],
        [
          ["Số lớp chủ nhiệm", teacherData.stats.totalClasses],
          ["Tổng học sinh", teacherData.stats.totalStudents],
          ["Số khóa học", teacherData.stats.totalCourses],
          ["Tổng bài tập", teacherData.stats.totalAssignments],
          ["Tiến độ trung bình", `${teacherData.stats.averageProgress}%`],
        ]
      ),
      { text: "2. Phân tích tổng hợp", style: "sectionHeader" },
      buildPdfTable(
        ["Chỉ số phân tích", "Giá trị"],
        [
          ["Tổng học sinh từ dữ liệu lớp", analysis.totalStudentsFromClasses],
          ["Sĩ số trung bình/lớp", analysis.averageClassSize],
          [
            "Lớp có tiến độ cao nhất",
            analysis.bestClass
              ? `${analysis.bestClass.name} (${analysis.bestClass.progress}%)`
              : "Không có dữ liệu",
          ],
          [
            "Lớp cần ưu tiên nhất",
            analysis.lowestClass
              ? `${analysis.lowestClass.name} (${analysis.lowestClass.progress}%)`
              : "Không có dữ liệu",
          ],
          ["Số lớp đạt từ 70%", analysis.classesAtOrAbove70],
          ["Số lớp dưới 50%", analysis.classesBelow50],
          [
            "Học sinh cần hỗ trợ",
            `${analysis.strugglingStudentsCount} (${analysis.strugglingStudentsRate}%)`,
          ],
        ]
      ),
      { text: "3. Phân bố chất lượng lớp", style: "sectionHeader" },
      buildPdfTable(
        ["Nhóm tiến độ", "Số lớp", "Tỷ lệ"],
        analysis.progressDistribution.map((item) => [
          item.label,
          item.count,
          `${item.percentage}%`,
        ])
      ),
      { text: "4. Chi tiết lớp (xếp hạng)", style: "sectionHeader" },
      buildPdfTable(
        ["#", "Lớp", "Khối", "Sĩ số", "Tiến độ", "Đánh giá"],
        classRanking.map((c, index) => [
          index + 1,
          c.name,
          c.gradeLevel || "-",
          c.students,
          `${c.progress}%`,
          getClassPerformanceLabel(c.progress),
        ])
      )
    );

    if (strugglingStudentsSorted.length > 0) {
      content.push(
        { text: "5. Học sinh cần hỗ trợ (ưu tiên)", style: "sectionHeader" },
        buildPdfTable(
          ["#", "Học sinh", "Lớp", "Mastery", "Mức ưu tiên", "Vấn đề"],
          strugglingStudentsSorted.map((s, index) => [
            index + 1,
            s.name,
            s.className,
            `${s.avgMastery}%`,
            getSupportPriority(s.avgMastery),
            s.issue,
          ])
        )
      );
    } else {
      content.push({
        text: "5. Học sinh cần hỗ trợ: Không có học sinh nào dưới ngưỡng cảnh báo trong giai đoạn đã chọn.",
        style: "subtitle",
        margin: [0, 6, 0, 0],
      });
    }
  }

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [32, 40, 32, 40] as [number, number, number, number],
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
    },
    styles: {
      title: {
        fontSize: 18,
        bold: true,
      },
      subtitle: {
        fontSize: 11,
      },
      sectionHeader: {
        fontSize: 13,
        bold: true,
        margin: [0, 8, 0, 4] as [number, number, number, number],
      },
    },
    footer: (currentPage: number, pageCount: number) => ({
      text: `Trang ${currentPage} / ${pageCount}`,
      alignment: "center",
      fontSize: 9,
      margin: [0, 0, 0, 10] as [number, number, number, number],
    }),
    content,
  };

  const fileName = buildReportFileName(role, data.dateRange, "pdf");

  await new Promise<void>((resolve) => {
    pdfMakeCandidate.createPdf!(docDefinition).download(fileName, () =>
      resolve()
    );
  });
}

function exportToExcel(
  role: ReportRole,
  data: AdminReportData | TeacherReportData
) {
  const wb = XLSX.utils.book_new();

  if (role === "admin") {
    const adminData = data as AdminReportData;
    const masteryBandRows = [
      ["Xuất sắc (>=85)", adminData.insights.masteryBands.excellent],
      ["Tốt (70-84)", adminData.insights.masteryBands.good],
      ["Trung bình (50-69)", adminData.insights.masteryBands.average],
      ["Cần hỗ trợ (<50)", adminData.insights.masteryBands.atRisk],
    ];

    // Stats sheet
    const statsWs = XLSX.utils.aoa_to_sheet([
      ["BÁO CÁO TỔNG QUAN HỆ THỐNG"],
      [`Từ ngày: ${data.dateRange.start} đến ${data.dateRange.end}`],
      [],
      ["THỐNG KÊ TỔNG QUAN"],
      ["Chỉ số", "Giá trị"],
      ["Tổng học sinh", adminData.stats.totalStudents],
      ["Tổng giáo viên", adminData.stats.totalTeachers],
      ["Khóa học active", adminData.stats.activeCourses],
      ["Tiến độ trung bình", `${adminData.stats.averageProgress}%`],
      ["Tỷ lệ bỏ học", `${adminData.stats.dropoutRate}%`],
      ["Thời gian học TB", `${adminData.stats.avgStudyTimeMinutes} phút`],
      ["Tỷ lệ tương tác", `${adminData.insights.summary.engagementRate}%`],
    ]);
    XLSX.utils.book_append_sheet(wb, statsWs, "Thống kê");

    const masteryWs = XLSX.utils.aoa_to_sheet([
      ["PHÂN TẦNG NĂNG LỰC HỌC SINH"],
      ["Nhóm năng lực", "Số học sinh"],
      ...masteryBandRows,
      [],
      ["Tổng HS có dữ liệu mastery", adminData.insights.summary.totalStudentsWithMastery],
      ["HS cần hỗ trợ", adminData.insights.summary.atRiskStudents],
    ]);
    XLSX.utils.book_append_sheet(wb, masteryWs, "Phân tầng HS");

    const gradeMasteryWs = XLSX.utils.aoa_to_sheet([
      ["MASTERY TRUNG BÌNH THEO KHỐI"],
      ["Khối", "Số học sinh", "Mastery TB"],
      ...adminData.insights.studentsByGrade.map((grade) => [
        `Khối ${grade.gradeLevel}`,
        grade.studentCount,
        `${grade.avgMastery}%`,
      ]),
    ]);
    XLSX.utils.book_append_sheet(wb, gradeMasteryWs, "Mastery theo khối");

    const weeklyActivityWs = XLSX.utils.aoa_to_sheet([
      ["HOẠT ĐỘNG HỌC TẬP THEO NGÀY"],
      ["Ngày", "Lượt làm bài", "HS hoạt động"],
      ...adminData.insights.weeklyActivity.map((item) => [
        item.date,
        item.attempts,
        item.activeStudents,
      ]),
    ]);
    XLSX.utils.book_append_sheet(wb, weeklyActivityWs, "Hoạt động");

    // Top courses sheet
    const coursesWs = XLSX.utils.aoa_to_sheet([
      ["TOP KHÓA HỌC"],
      ["Thứ hạng", "Tên khóa học", "Môn học", "Tiến độ"],
      ...adminData.topCourses.map((c, i) => [i + 1, c.name, c.subject, `${c.progress}%`]),
    ]);
    XLSX.utils.book_append_sheet(wb, coursesWs, "Top khóa học");

    // Difficult KPs sheet
    const kpsWs = XLSX.utils.aoa_to_sheet([
      ["ĐIỂM KIẾN THỨC KHÓ"],
      ["Tên KP", "Tỷ lệ sai", "Số lần thử"],
      ...adminData.difficultKPs.map((kp) => [kp.name, `${kp.failRate}%`, kp.totalAttempts]),
    ]);
    XLSX.utils.book_append_sheet(wb, kpsWs, "KP khó");

    // Class distribution sheet
    const distWs = XLSX.utils.aoa_to_sheet([
      ["PHÂN BỐ LỚP HỌC"],
      ["Lớp", "Khối", "Số học sinh"],
      ...adminData.classDistribution.map((c) => [c.name, c.gradeLevel, c.value]),
    ]);
    XLSX.utils.book_append_sheet(wb, distWs, "Phân bố lớp");

    // Low progress classes sheet
    const lowWs = XLSX.utils.aoa_to_sheet([
      ["LỚP CẦN CHÚ Ý"],
      ["Lớp", "Khối", "Tiến độ TB", "Vấn đề"],
      ...adminData.lowProgressClasses.map((c) => [
        c.className,
        c.gradeLevel,
        `${c.avgMastery}%`,
        c.issue,
      ]),
    ]);
    XLSX.utils.book_append_sheet(wb, lowWs, "Lớp cần chú ý");

    // Learning health sheet
    const healthWs = XLSX.utils.aoa_to_sheet([
      ["SỨC KHỎE HỌC TẬP"],
      ["Ngày", "Số KP hoàn thành"],
      ...adminData.learningHealth.map((h) => [h.date, h.completions]),
    ]);
    XLSX.utils.book_append_sheet(wb, healthWs, "Sức khỏe học tập");
  } else {
    const teacherData = data as TeacherReportData;
    const analysis = buildTeacherAnalysis(teacherData.stats);
    const classRanking = [...teacherData.stats.classes].sort(
      (a, b) => b.progress - a.progress
    );
    const strugglingStudentsSorted = [...teacherData.stats.strugglingStudents].sort(
      (a, b) => a.avgMastery - b.avgMastery
    );

    // Stats sheet
    const statsWs = XLSX.utils.aoa_to_sheet([
      ["BÁO CÁO GIÁO VIÊN"],
      [`Từ ngày: ${data.dateRange.start} đến ${data.dateRange.end}`],
      [],
      ["THỐNG KÊ TỔNG QUAN"],
      ["Chỉ số", "Giá trị"],
      ["Số lớp chủ nhiệm", teacherData.stats.totalClasses],
      ["Tổng học sinh", teacherData.stats.totalStudents],
      ["Số khóa học", teacherData.stats.totalCourses],
      ["Tổng bài tập", teacherData.stats.totalAssignments],
      ["Tiến độ trung bình", `${teacherData.stats.averageProgress}%`],
    ]);
    XLSX.utils.book_append_sheet(wb, statsWs, "Thống kê");

    const analysisWs = XLSX.utils.aoa_to_sheet([
      ["PHÂN TÍCH TỔNG HỢP"],
      ["Chỉ số phân tích", "Giá trị"],
      ["Tổng học sinh từ dữ liệu lớp", analysis.totalStudentsFromClasses],
      ["Sĩ số trung bình/lớp", analysis.averageClassSize],
      [
        "Lớp có tiến độ cao nhất",
        analysis.bestClass
          ? `${analysis.bestClass.name} (${analysis.bestClass.progress}%)`
          : "Không có dữ liệu",
      ],
      [
        "Lớp cần ưu tiên nhất",
        analysis.lowestClass
          ? `${analysis.lowestClass.name} (${analysis.lowestClass.progress}%)`
          : "Không có dữ liệu",
      ],
      ["Số lớp đạt từ 70%", analysis.classesAtOrAbove70],
      ["Số lớp dưới 50%", analysis.classesBelow50],
      [
        "Học sinh cần hỗ trợ",
        `${analysis.strugglingStudentsCount} (${analysis.strugglingStudentsRate}%)`,
      ],
      [],
      ["PHÂN BỐ CHẤT LƯỢNG LỚP"],
      ["Nhóm tiến độ", "Số lớp", "Tỷ lệ"],
      ...analysis.progressDistribution.map((item) => [
        item.label,
        item.count,
        `${item.percentage}%`,
      ]),
    ]);
    XLSX.utils.book_append_sheet(wb, analysisWs, "Phân tích");

    // Class details sheet
    const classesWs = XLSX.utils.aoa_to_sheet([
      ["CHI TIẾT CÁC LỚP (XẾP HẠNG)"],
      ["#", "Lớp", "Khối", "Số học sinh", "Tiến độ", "Đánh giá"],
      ...classRanking.map((c, index) => [
        index + 1,
        c.name,
        c.gradeLevel || "-",
        c.students,
        `${c.progress}%`,
        getClassPerformanceLabel(c.progress),
      ]),
    ]);
    XLSX.utils.book_append_sheet(wb, classesWs, "Chi tiết lớp");

    // Struggling students sheet
    if (strugglingStudentsSorted.length > 0) {
      const strugglingWs = XLSX.utils.aoa_to_sheet([
        ["HỌC SINH CẦN HỖ TRỢ (ƯU TIÊN)"],
        ["#", "Học sinh", "Lớp", "Tiến độ", "Mức ưu tiên", "Vấn đề"],
        ...strugglingStudentsSorted.map((s, index) => [
          index + 1,
          s.name,
          s.className,
          `${s.avgMastery}%`,
          getSupportPriority(s.avgMastery),
          s.issue,
        ]),
      ]);
      XLSX.utils.book_append_sheet(wb, strugglingWs, "Học sinh cần hỗ trợ");
    }
  }

  XLSX.writeFile(wb, buildReportFileName(role, data.dateRange, "xlsx"));
}

async function exportToWord(
  role: ReportRole,
  data: AdminReportData | TeacherReportData
) {
  const docChildren: Paragraph[] = [];

  // Title
  docChildren.push(
    new Paragraph({
      text: role === "admin" ? "BÁO CÁO TỔNG QUAN HỆ THỐNG" : "BÁO CÁO GIÁO VIÊN",
      heading: "Heading1",
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Từ ngày: ${data.dateRange.start} đến ${data.dateRange.end}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" })
  );

  if (role === "admin") {
    const adminData = data as AdminReportData;
    const masteryBands = [
      ["Xuất sắc (>=85)", adminData.insights.masteryBands.excellent],
      ["Tốt (70-84)", adminData.insights.masteryBands.good],
      ["Trung bình (50-69)", adminData.insights.masteryBands.average],
      ["Cần hỗ trợ (<50)", adminData.insights.masteryBands.atRisk],
    ];

    // Stats section
    docChildren.push(
      new Paragraph({ text: "1. THỐNG KÊ TỔNG QUAN", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const statsTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Chỉ số")] }),
            new TableCell({ children: [new Paragraph("Giá trị")] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tổng học sinh")] }),
            new TableCell({
              children: [new Paragraph(adminData.stats.totalStudents.toString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tổng giáo viên")] }),
            new TableCell({
              children: [new Paragraph(adminData.stats.totalTeachers.toString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Khóa học active")] }),
            new TableCell({
              children: [new Paragraph(adminData.stats.activeCourses.toString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tiến độ trung bình")] }),
            new TableCell({
              children: [new Paragraph(`${adminData.stats.averageProgress}%`)],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tỷ lệ bỏ học")] }),
            new TableCell({
              children: [new Paragraph(`${adminData.stats.dropoutRate}%`)],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Thời gian học trung bình")] }),
            new TableCell({
              children: [new Paragraph(`${adminData.stats.avgStudyTimeMinutes} phút`)],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tỷ lệ tương tác")] }),
            new TableCell({
              children: [new Paragraph(`${adminData.insights.summary.engagementRate}%`)],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(new Paragraph({ children: [statsTable] }), new Paragraph({ text: "" }));

    docChildren.push(
      new Paragraph({ text: "2. PHÂN TẦNG NĂNG LỰC HỌC SINH", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const masteryTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Nhóm năng lực")] }),
            new TableCell({ children: [new Paragraph("Số học sinh")] }),
          ],
        }),
        ...masteryBands.map(
          (item) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(String(item[0]))] }),
                new TableCell({ children: [new Paragraph(String(item[1]))] }),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(new Paragraph({ children: [masteryTable] }), new Paragraph({ text: "" }));

    docChildren.push(
      new Paragraph({ text: "3. MASTERY TRUNG BÌNH THEO KHỐI", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const gradeMasteryTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Khối")] }),
            new TableCell({ children: [new Paragraph("Số học sinh")] }),
            new TableCell({ children: [new Paragraph("Mastery TB")] }),
          ],
        }),
        ...adminData.insights.studentsByGrade.map(
          (grade) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(`Khối ${grade.gradeLevel}`)] }),
                new TableCell({ children: [new Paragraph(grade.studentCount.toString())] }),
                new TableCell({ children: [new Paragraph(`${grade.avgMastery}%`)] }),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(
      new Paragraph({ children: [gradeMasteryTable] }),
      new Paragraph({ text: "" })
    );

    docChildren.push(
      new Paragraph({ text: "4. HOẠT ĐỘNG HỌC TẬP THEO NGÀY", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const weeklyActivityTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Ngày")] }),
            new TableCell({ children: [new Paragraph("Lượt làm bài")] }),
            new TableCell({ children: [new Paragraph("HS hoạt động")] }),
          ],
        }),
        ...adminData.insights.weeklyActivity.map(
          (item) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(item.date)] }),
                new TableCell({ children: [new Paragraph(item.attempts.toString())] }),
                new TableCell({ children: [new Paragraph(item.activeStudents.toString())] }),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(
      new Paragraph({ children: [weeklyActivityTable] }),
      new Paragraph({ text: "" })
    );

    // Top courses
    docChildren.push(
      new Paragraph({ text: "5. TOP KHÓA HỌC", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const coursesTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Thứ hạng")] }),
            new TableCell({ children: [new Paragraph("Tên khóa học")] }),
            new TableCell({ children: [new Paragraph("Môn học")] }),
            new TableCell({ children: [new Paragraph("Tiến độ")] }),
          ],
        }),
        ...adminData.topCourses.map(
          (c, i) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph((i + 1).toString())] }),
                new TableCell({ children: [new Paragraph(c.name)] }),
                new TableCell({ children: [new Paragraph(c.subject)] }),
                new TableCell({ children: [new Paragraph(`${c.progress}%`)] }),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(new Paragraph({ children: [coursesTable] }), new Paragraph({ text: "" }));

    // Low progress classes
    docChildren.push(
      new Paragraph({ text: "6. LỚP CẦN CHÚ Ý", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const lowTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Lớp")] }),
            new TableCell({ children: [new Paragraph("Khối")] }),
            new TableCell({ children: [new Paragraph("Tiến độ TB")] }),
            new TableCell({ children: [new Paragraph("Vấn đề")] }),
          ],
        }),
        ...adminData.lowProgressClasses.map(
          (c) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(c.className)] }),
                new TableCell({ children: [new Paragraph(c.gradeLevel.toString())] }),
                new TableCell({ children: [new Paragraph(`${c.avgMastery}%`)] }),
                new TableCell({ children: [new Paragraph(c.issue)] }),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(new Paragraph({ children: [lowTable] }));
  } else {
    const teacherData = data as TeacherReportData;
    const analysis = buildTeacherAnalysis(teacherData.stats);
    const classRanking = [...teacherData.stats.classes].sort(
      (a, b) => b.progress - a.progress
    );
    const strugglingStudentsSorted = [...teacherData.stats.strugglingStudents].sort(
      (a, b) => a.avgMastery - b.avgMastery
    );

    // Stats section
    docChildren.push(
      new Paragraph({ text: "1. THỐNG KÊ TỔNG QUAN", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const statsTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Chỉ số")] }),
            new TableCell({ children: [new Paragraph("Giá trị")] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Số lớp chủ nhiệm")] }),
            new TableCell({
              children: [new Paragraph(teacherData.stats.totalClasses.toString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tổng học sinh")] }),
            new TableCell({
              children: [new Paragraph(teacherData.stats.totalStudents.toString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Số khóa học")] }),
            new TableCell({
              children: [new Paragraph(teacherData.stats.totalCourses.toString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tiến độ trung bình")] }),
            new TableCell({
              children: [new Paragraph(`${teacherData.stats.averageProgress}%`)],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(new Paragraph({ children: [statsTable] }), new Paragraph({ text: "" }));

    docChildren.push(
      new Paragraph({ text: "2. PHÂN TÍCH TỔNG HỢP", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const analysisTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Chỉ số phân tích")] }),
            new TableCell({ children: [new Paragraph("Giá trị")] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tổng học sinh từ dữ liệu lớp")] }),
            new TableCell({
              children: [new Paragraph(analysis.totalStudentsFromClasses.toString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Sĩ số trung bình/lớp")] }),
            new TableCell({
              children: [new Paragraph(analysis.averageClassSize.toString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Lớp có tiến độ cao nhất")] }),
            new TableCell({
              children: [
                new Paragraph(
                  analysis.bestClass
                    ? `${analysis.bestClass.name} (${analysis.bestClass.progress}%)`
                    : "Không có dữ liệu"
                ),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Lớp cần ưu tiên nhất")] }),
            new TableCell({
              children: [
                new Paragraph(
                  analysis.lowestClass
                    ? `${analysis.lowestClass.name} (${analysis.lowestClass.progress}%)`
                    : "Không có dữ liệu"
                ),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Học sinh cần hỗ trợ")] }),
            new TableCell({
              children: [
                new Paragraph(
                  `${analysis.strugglingStudentsCount} (${analysis.strugglingStudentsRate}%)`
                ),
              ],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    docChildren.push(new Paragraph({ children: [analysisTable] }), new Paragraph({ text: "" }));

    // Class details
    docChildren.push(
      new Paragraph({ text: "3. CHI TIẾT CÁC LỚP", heading: "Heading2" }),
      new Paragraph({ text: "" })
    );

    const classesTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Lớp")] }),
            new TableCell({ children: [new Paragraph("Khối")] }),
            new TableCell({ children: [new Paragraph("Số học sinh")] }),
            new TableCell({ children: [new Paragraph("Tiến độ")] }),
          ],
        }),
        ...classRanking.map(
          (c) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(c.name)] }),
                new TableCell({ children: [new Paragraph(c.gradeLevel?.toString() || "-")] }),
                new TableCell({ children: [new Paragraph(c.students.toString())] }),
                new TableCell({
                  children: [
                    new Paragraph(
                      `${c.progress}% (${getClassPerformanceLabel(c.progress)})`
                    ),
                  ],
                }),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(new Paragraph({ children: [classesTable] }));

    // Struggling students
    if (strugglingStudentsSorted.length > 0) {
      docChildren.push(
        new Paragraph({ text: "" }),
        new Paragraph({ text: "4. HỌC SINH CẦN HỖ TRỢ", heading: "Heading2" }),
        new Paragraph({ text: "" })
      );

      const strugglingTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Học sinh")] }),
              new TableCell({ children: [new Paragraph("Lớp")] }),
              new TableCell({ children: [new Paragraph("Tiến độ")] }),
              new TableCell({ children: [new Paragraph("Vấn đề")] }),
            ],
          }),
          ...strugglingStudentsSorted.map(
            (s) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(s.name)] }),
                  new TableCell({ children: [new Paragraph(s.className)] }),
                  new TableCell({
                    children: [
                      new Paragraph(
                        `${s.avgMastery}% (${getSupportPriority(s.avgMastery)})`
                      ),
                    ],
                  }),
                  new TableCell({ children: [new Paragraph(s.issue)] }),
                ],
              })
          ),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
      docChildren.push(new Paragraph({ children: [strugglingTable] }));
    }
  }

  const doc = new Document({
    sections: [{ children: docChildren }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = buildReportFileName(role, data.dateRange, "docx");
  a.click();
  URL.revokeObjectURL(url);
}

// ==================== MAIN PAGE COMPONENT ====================
export default function ReportsPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useUser();
  const [dateRange, setDateRange] = useState<DateRange>({
    start: today(getLocalTimeZone()).subtract({ weeks: 1 }),
    end: today(getLocalTimeZone()),
  });
  const [reportData, setReportData] = useState<
    AdminReportData | TeacherReportData | null
  >(null);

  // Check role and redirect if not admin or teacher
  useEffect(() => {
    if (!userLoading && currentUser) {
      const role = currentUser.role?.toLowerCase();
      if (role !== "admin" && role !== "teacher") {
        router.replace("/dashboard");
      }
    }
  }, [currentUser, userLoading, router]);

  const userRole = currentUser?.role?.toLowerCase() as "admin" | "teacher" | undefined;

  const handleExport = async (format: "pdf" | "excel" | "docx") => {
    if (!reportData || !userRole) return;

    switch (format) {
      case "pdf":
        await exportToPDF(userRole, reportData);
        break;
      case "excel":
        exportToExcel(userRole, reportData);
        break;
      case "docx":
        await exportToWord(userRole, reportData);
        break;
    }
  };

  if (userLoading) {
    return (
              <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      
    );
  }

  // Check if user has access
  if (currentUser && userRole !== "admin" && userRole !== "teacher") {
    return (
              <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Không có quyền truy cập</h2>
            <p className="text-gray-500 mt-2">Bạn không có quyền xem báo cáo này.</p>
          </div>
        </div>
      
    );
  }

  return (
          <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181d27] dark:text-white">
              Báo cáo & Phân tích
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              {userRole === "admin"
                ? "Xem và xuất báo cáo tổng quan hệ thống"
                : "Xem và xuất báo cáo về lớp học và học sinh của bạn"}
            </p>
          </div>

          {/* Date Range Picker + Export Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <DateRangePicker
              label="Khoảng thờI gian"
              value={dateRange as any}
              onChange={(range) => {
                if (range?.start && range?.end) {
                  setDateRange({ start: range.start, end: range.end });
                }
              }}
              className="w-[280px]"
              size="sm"
            />

            <Dropdown>
              <DropdownTrigger>
                <Button
                  color="primary"
                  startContent={<Download className="w-4 h-4" />}
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  Xuất báo cáo
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Export options">
                <DropdownItem
                  key="pdf"
                  startContent={<FileText className="w-4 h-4 text-red-500" />}
                  onPress={() => handleExport("pdf")}
                  description="Xuất báo cáo định dạng PDF"
                >
                  PDF
                </DropdownItem>
                <DropdownItem
                  key="excel"
                  startContent={<BarChart3 className="w-4 h-4 text-green-500" />}
                  onPress={() => handleExport("excel")}
                  description="Xuất báo cáo định dạng Excel"
                >
                  Excel
                </DropdownItem>
                <DropdownItem
                  key="docx"
                  startContent={<FileText className="w-4 h-4 text-blue-500" />}
                  onPress={() => handleExport("docx")}
                  description="Xuất báo cáo định dạng Word"
                >
                  Word (DOCX)
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Role-specific content */}
        {userRole === "admin" ? (
          <AdminReportsView
            dateRange={dateRange}
            onDataLoaded={(data) => setReportData(data)}
          />
        ) : (
          <TeacherReportsView
            dateRange={dateRange}
            onDataLoaded={(data) => setReportData(data)}
          />
        )}
      </div>
    
  );
}
