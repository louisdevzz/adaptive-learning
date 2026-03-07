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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

  const isLoading =
    statsLoading ||
    coursesLoading ||
    kpsLoading ||
    distributionLoading ||
    teachersLoading ||
    lowProgressLoading ||
    healthLoading;

  // Collect data for export
  useEffect(() => {
    if (
      stats &&
      topCourses &&
      difficultKPs &&
      classDistribution &&
      teacherHighlights &&
      lowProgressClasses &&
      learningHealth
    ) {
      onDataLoaded({
        stats,
        topCourses,
        difficultKPs,
        classDistribution,
        teacherHighlights,
        lowProgressClasses,
        learningHealth,
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
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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
      <Card>
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
      <Card>
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

  const isLoading = statsLoading;

  // Collect data for export
  useEffect(() => {
    if (stats) {
      onDataLoaded({
        stats,
        dateRange: { start: startDate, end: endDate },
      });
    }
  }, [stats, startDate, endDate, onDataLoaded]);

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
      <Card>
        <CardHeader>
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
      <Card>
        <CardHeader>
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
    <Card>
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
  dateRange: { start: string; end: string };
};

type TeacherReportData = {
  stats: TeacherStats;
  dateRange: { start: string; end: string };
};

async function exportToPDF(
  role: "admin" | "teacher",
  data: AdminReportData | TeacherReportData
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text(
    role === "admin" ? "BÁO CÁO TỔNG QUAN HỆ THỐNG" : "BÁO CÁO GIÁO VIÊN",
    pageWidth / 2,
    20,
    { align: "center" }
  );

  // Date range
  doc.setFontSize(12);
  doc.text(
    `Từ ngày: ${data.dateRange.start} đến ${data.dateRange.end}`,
    pageWidth / 2,
    30,
    { align: "center" }
  );

  let yPos = 45;

  if (role === "admin") {
    const adminData = data as AdminReportData;

    // Stats table
    doc.setFontSize(14);
    doc.text("1. Thống kê tổng quan", 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Chỉ số", "Giá trị"]],
      body: [
        ["Tổng học sinh", adminData.stats.totalStudents],
        ["Tổng giáo viên", adminData.stats.totalTeachers],
        ["Khóa học active", adminData.stats.activeCourses],
        ["Tiến độ trung bình", `${adminData.stats.averageProgress}%`],
        ["Tỷ lệ bỏ học", `${adminData.stats.dropoutRate}%`],
        ["Thời gian học TB", `${adminData.stats.avgStudyTimeMinutes} phút`],
      ],
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Top courses
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.text("2. Top khóa học", 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Thứ hạng", "Tên khóa học", "Môn học", "Tiến độ"]],
      body: adminData.topCourses.map((c, i) => [
        i + 1,
        c.name,
        c.subject,
        `${c.progress}%`,
      ]),
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Difficult KPs
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.text("3. Điểm kiến thức khó", 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Tên KP", "Tỷ lệ sai", "Số lần thử"]],
      body: adminData.difficultKPs.map((kp) => [
        kp.name,
        `${kp.failRate}%`,
        kp.totalAttempts,
      ]),
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Low progress classes
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.text("4. Lớp cần chú ý", 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Lớp", "Khối", "Tiến độ TB", "Vấn đề"]],
      body: adminData.lowProgressClasses.map((c) => [
        c.className,
        c.gradeLevel,
        `${c.avgMastery}%`,
        c.issue,
      ]),
    });
  } else {
    const teacherData = data as TeacherReportData;

    // Stats table
    doc.setFontSize(14);
    doc.text("1. Thống kê tổng quan", 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Chỉ số", "Giá trị"]],
      body: [
        ["Số lớp chủ nhiệm", teacherData.stats.totalClasses],
        ["Tổng học sinh", teacherData.stats.totalStudents],
        ["Số khóa học", teacherData.stats.totalCourses],
        ["Tổng bài tập", teacherData.stats.totalAssignments],
        ["Tiến độ trung bình", `${teacherData.stats.averageProgress}%`],
      ],
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Class details
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.text("2. Chi tiết các lớp", 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Lớp", "Khối", "Số học sinh", "Tiến độ"]],
      body: teacherData.stats.classes.map((c) => [
        c.name,
        c.gradeLevel || "-",
        c.students,
        `${c.progress}%`,
      ]),
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Struggling students
    if (teacherData.stats.strugglingStudents.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("3. Học sinh cần hỗ trợ", 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [["Học sinh", "Lớp", "Tiến độ", "Vấn đề"]],
        body: teacherData.stats.strugglingStudents.map((s) => [
          s.name,
          s.className,
          `${s.avgMastery}%`,
          s.issue,
        ]),
      });
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Trang ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`bao-cao-${role}-${data.dateRange.start}-${data.dateRange.end}.pdf`);
}

function exportToExcel(
  role: "admin" | "teacher",
  data: AdminReportData | TeacherReportData
) {
  const wb = XLSX.utils.book_new();

  if (role === "admin") {
    const adminData = data as AdminReportData;

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
    ]);
    XLSX.utils.book_append_sheet(wb, statsWs, "Thống kê");

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

    // Class details sheet
    const classesWs = XLSX.utils.aoa_to_sheet([
      ["CHI TIẾT CÁC LỚP"],
      ["Lớp", "Khối", "Số học sinh", "Tiến độ"],
      ...teacherData.stats.classes.map((c) => [
        c.name,
        c.gradeLevel || "-",
        c.students,
        `${c.progress}%`,
      ]),
    ]);
    XLSX.utils.book_append_sheet(wb, classesWs, "Chi tiết lớp");

    // Struggling students sheet
    if (teacherData.stats.strugglingStudents.length > 0) {
      const strugglingWs = XLSX.utils.aoa_to_sheet([
        ["HỌC SINH CẦN HỖ TRỢ"],
        ["Học sinh", "Lớp", "Tiến độ", "Vấn đề"],
        ...teacherData.stats.strugglingStudents.map((s) => [
          s.name,
          s.className,
          `${s.avgMastery}%`,
          s.issue,
        ]),
      ]);
      XLSX.utils.book_append_sheet(wb, strugglingWs, "Học sinh cần hỗ trợ");
    }
  }

  XLSX.writeFile(wb, `bao-cao-${role}-${data.dateRange.start}-${data.dateRange.end}.xlsx`);
}

async function exportToWord(
  role: "admin" | "teacher",
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
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(new Paragraph({ children: [statsTable] }), new Paragraph({ text: "" }));

    // Top courses
    docChildren.push(
      new Paragraph({ text: "2. TOP KHÓA HỌC", heading: "Heading2" }),
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
      new Paragraph({ text: "3. LỚP CẦN CHÚ Ý", heading: "Heading2" }),
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

    // Class details
    docChildren.push(
      new Paragraph({ text: "2. CHI TIẾT CÁC LỚP", heading: "Heading2" }),
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
        ...teacherData.stats.classes.map(
          (c) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(c.name)] }),
                new TableCell({ children: [new Paragraph(c.gradeLevel?.toString() || "-")] }),
                new TableCell({ children: [new Paragraph(c.students.toString())] }),
                new TableCell({ children: [new Paragraph(`${c.progress}%`)] }),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    docChildren.push(new Paragraph({ children: [classesTable] }));

    // Struggling students
    if (teacherData.stats.strugglingStudents.length > 0) {
      docChildren.push(
        new Paragraph({ text: "" }),
        new Paragraph({ text: "3. HỌC SINH CẦN HỖ TRỢ", heading: "Heading2" }),
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
          ...teacherData.stats.strugglingStudents.map(
            (s) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(s.name)] }),
                  new TableCell({ children: [new Paragraph(s.className)] }),
                  new TableCell({ children: [new Paragraph(`${s.avgMastery}%`)] }),
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
  a.download = `bao-cao-${role}-${data.dateRange.start}-${data.dateRange.end}.docx`;
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
