"use client";

import {
  Download,
  StickyNote,
  Search,
  ChevronDown,
  Filter,
  TrendingUp,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  MoreVertical,
  BarChart3,
  Loader2,
  Zap,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Avatar, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spinner } from "@heroui/react";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

interface StudentProgress {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  progress: number;
  masteryScore: number;
  totalKps: number;
  masteredKps: number;
  engagementScore: number;
  lastActive: string | null;
  status: "excellent" | "good" | "at-risk" | "needs-help";
  riskLevel: "high" | "medium" | "low";
  courseMastery: { courseId: string; score: number }[];
}

interface ClassProgressData {
  students: StudentProgress[];
  summary: {
    totalStudents: number;
    avgMastery: number;
    atRiskCount: number;
    excellentCount: number;
    totalKpsMastered: number;
  };
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-[#181d27] dark:text-white">{value}</p>
        <p className="text-sm text-[#717680] dark:text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-[#a4a7ae] dark:text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function formatLastActive(dateStr: string | null): string {
  if (!dateStr) return "Chưa hoạt động";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

interface OutlierStudent {
  studentId: string;
  fullName: string;
  avgMastery: number;
  engagementScore: number;
  riskKpsCount: number;
}

interface ClassOverviewData {
  classId: string;
  studentCount: number;
  meanMastery: number;
  averageEngagement: number;
  outlierCount: number;
  outliers: OutlierStudent[];
}

export default function ClassProgressPage() {
  const params = useParams();
  const classId = params.classId as string;
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ClassProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [classOverview, setClassOverview] = useState<ClassOverviewData | null>(null);

  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.classes.getClassProgress(classId);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải dữ liệu tiến độ");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  // Fetch outlier detection data for teachers
  useEffect(() => {
    if (!isTeacher || !classId) return;
    api.teacherInterventions.getClassOverview(classId)
      .then(setClassOverview)
      .catch(() => {/* silently ignore — non-critical */});
  }, [classId, isTeacher]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const students = data?.students || [];
  const summary = data?.summary || {
    totalStudents: 0,
    avgMastery: 0,
    atRiskCount: 0,
    excellentCount: 0,
    totalKpsMastered: 0,
  };

  const outlierIds = new Set(
    classOverview?.outliers?.map((o) => o.studentId) ?? []
  );

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? student.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            <Award className="w-3 h-3" />
            Xuất sắc
          </span>
        );
      case "good":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#6244F4/10] text-[#0066CC] dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="w-3 h-3" />
            Tốt
          </span>
        );
      case "at-risk":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="w-3 h-3" />
            Cần chú ý
          </span>
        );
      case "needs-help":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            <Flag className="w-3 h-3" />
            Cần hỗ trợ
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Cao
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Trung bình
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Thấp
          </span>
        );
      default:
        return null;
    }
  };

  // Status distribution for chart placeholder
  const statusCounts = {
    excellent: students.filter((s) => s.status === "excellent").length,
    good: students.filter((s) => s.status === "good").length,
    atRisk: students.filter((s) => s.status === "at-risk").length,
    needsHelp: students.filter((s) => s.status === "needs-help").length,
  };

  if (loading) {
    return (
              <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-[#717680] dark:text-gray-400">Đang tải tiến độ lớp học...</p>
          </div>
        </div>
      
    );
  }

  if (error) {
    return (
              <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <Button className="mt-4" onPress={fetchProgress}>
              Thử lại
            </Button>
          </div>
        </div>
      
    );
  }

  return (
          <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#717680] dark:text-gray-400">
          <Link href="/dashboard/classes" className="hover:text-primary transition-colors">
            Lớp học
          </Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <Link href={`/dashboard/classes/${classId}`} className="hover:text-primary transition-colors">
            Chi tiết lớp
          </Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-[#181d27] dark:text-white font-medium">Tiến độ & Can thiệp</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181d27] dark:text-white">
              Tiến độ & Can thiệp
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Theo dõi tiến độ học tập và các biện pháp can thiệp
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="bordered" startContent={<Download className="w-4 h-4" />} className="border-[#d5d7da]">
              Xuất báo cáo
            </Button>
            <Button className="bg-primary text-white" startContent={<StickyNote className="w-4 h-4" />}>
              Thêm ghi chú
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Tiến độ trung bình"
            value={`${summary.avgMastery}%`}
            subtitle="Toàn lớp"
            icon={TrendingUp}
            color="bg-[#6244F4/10] text-[#6244F4] dark:bg-blue-900/20"
          />
          <StatCard
            title="Tổng học sinh"
            value={summary.totalStudents.toString()}
            subtitle="Đang học"
            icon={BookOpen}
            color="bg-green-50 text-green-600 dark:bg-green-900/20"
          />
          <StatCard
            title="Học sinh cần chú ý"
            value={summary.atRiskCount.toString()}
            subtitle="Cần can thiệp"
            icon={AlertTriangle}
            color="bg-orange-50 text-orange-600 dark:bg-orange-900/20"
          />
          <StatCard
            title="KP đã nắm vững"
            value={summary.totalKpsMastered.toString()}
            subtitle={`${summary.excellentCount} học sinh xuất sắc`}
            icon={Award}
            color="bg-purple-50 text-purple-600 dark:bg-purple-900/20"
          />
        </div>

        {/* Outlier Detection Alert (teachers only) */}
        {isTeacher && classOverview && classOverview.outlierCount > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                  Phát hiện {classOverview.outlierCount} học sinh ngoại lai
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  Các học sinh dưới đây có điểm mastery thấp hơn đáng kể so với trung bình lớp ({classOverview.meanMastery}%), tương tác thấp, hoặc nhiều KP rủi ro. Hãy xem xét can thiệp sớm.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {classOverview.outliers.map((outlier) => (
                    <Link
                      key={outlier.studentId}
                      href={`/dashboard/students/${outlier.studentId}/progress`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-lg text-sm hover:shadow-md transition-shadow"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                      <span className="font-medium text-orange-800 dark:text-orange-300">{outlier.fullName}</span>
                      <span className="text-orange-600 dark:text-orange-400 text-xs">({outlier.avgMastery}%)</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#181d27] dark:text-white">Phân bố trạng thái học sinh</h3>
                <p className="text-sm text-[#717680] dark:text-gray-400">Tổng quan trạng thái học tập</p>
              </div>
            </div>
            {summary.totalStudents > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-24 text-sm text-[#717680] dark:text-gray-400">Xuất sắc</div>
                  <div className="flex-1">
                    <Progress
                      value={summary.totalStudents > 0 ? (statusCounts.excellent / summary.totalStudents) * 100 : 0}
                      size="md"
                      color="success"
                      className="h-3"
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-semibold text-[#181d27] dark:text-white">{statusCounts.excellent}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 text-sm text-[#717680] dark:text-gray-400">Tốt</div>
                  <div className="flex-1">
                    <Progress
                      value={summary.totalStudents > 0 ? (statusCounts.good / summary.totalStudents) * 100 : 0}
                      size="md"
                      color="primary"
                      className="h-3"
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-semibold text-[#181d27] dark:text-white">{statusCounts.good}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 text-sm text-[#717680] dark:text-gray-400">Cần chú ý</div>
                  <div className="flex-1">
                    <Progress
                      value={summary.totalStudents > 0 ? (statusCounts.atRisk / summary.totalStudents) * 100 : 0}
                      size="md"
                      color="warning"
                      className="h-3"
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-semibold text-[#181d27] dark:text-white">{statusCounts.atRisk}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 text-sm text-[#717680] dark:text-gray-400">Cần hỗ trợ</div>
                  <div className="flex-1">
                    <Progress
                      value={summary.totalStudents > 0 ? (statusCounts.needsHelp / summary.totalStudents) * 100 : 0}
                      size="md"
                      color="danger"
                      className="h-3"
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-semibold text-[#181d27] dark:text-white">{statusCounts.needsHelp}</div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-[#717680] dark:text-gray-400 text-sm">Chưa có học sinh trong lớp</p>
              </div>
            )}
          </div>

          {/* Top Students */}
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
            <h3 className="font-bold text-[#181d27] dark:text-white mb-4">Học sinh cần chú ý</h3>
            <div className="space-y-3">
              {students
                .filter((s) => s.status === "at-risk" || s.status === "needs-help")
                .slice(0, 5)
                .map((student) => (
                  <div key={student.id} className="flex items-start gap-3">
                    <Avatar
                      src={student.avatar || undefined}
                      name={student.name}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#181d27] dark:text-white truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-[#a4a7ae] dark:text-gray-500">
                        Mastery: {student.masteryScore}% · {student.masteredKps}/{student.totalKps} KP
                      </p>
                    </div>
                    {getRiskBadge(student.riskLevel)}
                  </div>
                ))}
              {students.filter((s) => s.status === "at-risk" || s.status === "needs-help").length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-[#717680] dark:text-gray-400">
                    Không có học sinh cần can thiệp
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-[#e9eaeb] dark:border-gray-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm học sinh..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white placeholder:text-[#a4a7ae] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-3 pr-10 py-2.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="excellent">Xuất sắc</option>
                  <option value="good">Tốt</option>
                  <option value="at-risk">Cần chú ý</option>
                  <option value="needs-help">Cần hỗ trợ</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="p-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-[#717680] dark:text-gray-400">
                  {students.length === 0
                    ? "Chưa có học sinh trong lớp"
                    : "Không tìm thấy học sinh phù hợp"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={student.avatar || undefined}
                          name={student.name}
                          className="shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-[#181d27] dark:text-white">{student.name}</p>
                          <p className="text-xs text-[#717680] dark:text-gray-400">{student.email}</p>
                        </div>
                      </div>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly variant="light" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem key="view" as={Link} href={`/dashboard/students/${student.id}`}>Xem chi tiết</DropdownItem>
                          <DropdownItem key="progress" as={Link} href={`/dashboard/students/${student.id}/progress`}>Tiến độ chi tiết</DropdownItem>
                          <DropdownItem key="contact">Liên hệ phụ huynh</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getStatusBadge(student.status)}
                      {getRiskBadge(student.riskLevel)}
                      {isTeacher && outlierIds.has(student.id) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                          <Zap className="w-3 h-3" />
                          Ngoại lai
                        </span>
                      )}
                    </div>

                    {/* Progress Stats */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#717680] dark:text-gray-400">Tiến độ</span>
                          <span className="font-medium text-[#181d27] dark:text-white">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} size="sm" className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#717680] dark:text-gray-400">Điểm nắm vững KP</span>
                          <span className="font-medium text-[#181d27] dark:text-white">{student.masteryScore}%</span>
                        </div>
                        <Progress value={student.masteryScore} size="sm" className="h-1.5" color="success" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#717680] dark:text-gray-400">Mức độ tham gia</span>
                          <span className="font-medium text-[#181d27] dark:text-white">{student.engagementScore}%</span>
                        </div>
                        <Progress value={student.engagementScore} size="sm" className="h-1.5" color="warning" />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e9eaeb] dark:border-gray-700">
                      <div className="flex items-center gap-1 text-xs text-[#717680] dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatLastActive(student.lastActive)}
                      </div>
                      <div className="text-xs text-[#717680] dark:text-gray-400">
                        {student.masteredKps}/{student.totalKps} KP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[#e9eaeb] dark:border-gray-800 flex items-center justify-between bg-[#f9fafb] dark:bg-gray-800/30">
            <span className="text-sm text-[#717680] dark:text-gray-400">
              Hiển thị <strong className="text-[#181d27] dark:text-white">{filteredStudents.length}</strong> / {students.length} học sinh
            </span>
          </div>
        </div>
      </div>
    
  );
}
