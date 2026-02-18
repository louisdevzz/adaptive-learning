"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import {
  Download,
  StickyNote,
  Search,
  ChevronDown,
  RefreshCw,
  Filter,
  TrendingUp,
  Flag,
  User,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  BookOpen,
  Award,
  ArrowUpRight,
  MoreVertical,
  BarChart3,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button, Avatar, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  progress: number;
  masteryScore: number;
  attendance: number;
  lastActive: string;
  status: "excellent" | "good" | "at-risk" | "needs-help";
  riskLevel?: "high" | "medium" | "low";
  completedLessons: number;
  totalLessons: number;
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
        <span className="text-xs font-bold text-[#181d27] dark:text-white">{progress}%</span>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: { value: string; positive: boolean };
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
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
        <p className="text-2xl font-bold text-[#181d27] dark:text-white">{value}</p>
        <p className="text-sm text-[#717680] dark:text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-[#a4a7ae] dark:text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ClassProgressPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [timeRange, setTimeRange] = useState("week");

  const students: Student[] = [
    {
      id: "1",
      name: "Trần Thị B",
      email: "btran@adapt.edu.vn",
      progress: 85,
      masteryScore: 88,
      attendance: 95,
      lastActive: "2 giờ trước",
      status: "excellent",
      riskLevel: "low",
      completedLessons: 42,
      totalLessons: 50,
    },
    {
      id: "2",
      name: "Hoàng Văn E",
      email: "ehoang@adapt.edu.vn",
      initials: "HE",
      progress: 72,
      masteryScore: 75,
      attendance: 88,
      lastActive: "5 giờ trước",
      status: "good",
      riskLevel: "low",
      completedLessons: 36,
      totalLessons: 50,
    },
    {
      id: "3",
      name: "Nguyễn Thị G",
      email: "gnguyen@adapt.edu.vn",
      progress: 58,
      masteryScore: 62,
      attendance: 75,
      lastActive: "1 ngày trước",
      status: "at-risk",
      riskLevel: "medium",
      completedLessons: 29,
      totalLessons: 50,
    },
    {
      id: "4",
      name: "Phạm Hoàng H",
      email: "hpham@adapt.edu.vn",
      initials: "PH",
      progress: 35,
      masteryScore: 40,
      attendance: 60,
      lastActive: "3 ngày trước",
      status: "needs-help",
      riskLevel: "high",
      completedLessons: 17,
      totalLessons: 50,
    },
    {
      id: "5",
      name: "Lê Kim L",
      email: "lle@adapt.edu.vn",
      progress: 92,
      masteryScore: 94,
      attendance: 98,
      lastActive: "1 giờ trước",
      status: "excellent",
      riskLevel: "low",
      completedLessons: 46,
      totalLessons: 50,
    },
    {
      id: "6",
      name: "Mai Anh T",
      email: "tmai@adapt.edu.vn",
      initials: "MT",
      progress: 45,
      masteryScore: 48,
      attendance: 70,
      lastActive: "2 ngày trước",
      status: "at-risk",
      riskLevel: "high",
      completedLessons: 22,
      totalLessons: 50,
    },
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
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

  // Calculate averages
  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length);
  const avgAttendance = Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length);
  const atRiskCount = students.filter((s) => s.status === "at-risk" || s.status === "needs-help").length;

  return (
    <LayoutDashboard>
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
            value={`${avgProgress}%`}
            subtitle="Toàn lớp"
            icon={TrendingUp}
            color="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
            trend={{ value: "+5%", positive: true }}
          />
          <StatCard
            title="Điểm danh trung bình"
            value={`${avgAttendance}%`}
            subtitle="Tuần này"
            icon={Clock}
            color="bg-green-50 text-green-600 dark:bg-green-900/20"
            trend={{ value: "+2%", positive: true }}
          />
          <StatCard
            title="Học sinh cần chú ý"
            value={atRiskCount.toString()}
            subtitle="Cần can thiệp"
            icon={AlertTriangle}
            color="bg-orange-50 text-orange-600 dark:bg-orange-900/20"
          />
          <StatCard
            title="Bài học đã hoàn thành"
            value="245"
            subtitle="Tổng số 300 bài"
            icon={BookOpen}
            color="bg-purple-50 text-purple-600 dark:bg-purple-900/20"
            trend={{ value: "+12", positive: true }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#181d27] dark:text-white">Tiến độ học tập</h3>
                <p className="text-sm text-[#717680] dark:text-gray-400">Biểu đồ tiến độ trung bình theo tuần</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white"
                >
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                  <option value="semester">Học kỳ</option>
                </select>
              </div>
            </div>
            <div className="h-64 bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl border border-dashed border-[#e9eaeb] dark:border-gray-700 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-[#717680] dark:text-gray-400 text-sm">Biểu đồ tiến độ học tập</p>
                <p className="text-xs text-[#a4a7ae] dark:text-gray-500 mt-1">Đang phát triển</p>
              </div>
            </div>
          </div>

          {/* Side Charts */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
              <h3 className="font-bold text-[#181d27] dark:text-white mb-4">Phân bố trạng thái</h3>
              <div className="h-48 bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl border border-dashed border-[#e9eaeb] dark:border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-xs text-[#717680] dark:text-gray-400">Biểu đồ phân bố</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
              <h3 className="font-bold text-[#181d27] dark:text-white mb-4">Hoạt động gần đây</h3>
              <div className="space-y-3">
                {[
                  { text: "Trần Thị B hoàn thành bài tập", time: "2 giờ trước", icon: CheckCircle2 },
                  { text: "Hoàng Văn E đạt 90% bài kiểm tra", time: "5 giờ trước", icon: Award },
                  { text: "Cảnh báo: Phạm Hoàng H chưa học 3 ngày", time: "1 ngày trước", icon: AlertTriangle },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#535862] dark:text-gray-300">{item.text}</p>
                      <p className="text-xs text-[#a4a7ae] dark:text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <Button variant="bordered" startContent={<Filter className="w-4 h-4" />} className="border-[#d5d7da]">
                Lọc nâng cao
              </Button>
            </div>
          </div>

          {/* Students Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={student.avatar}
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
                        <DropdownItem key="view">Xem chi tiết</DropdownItem>
                        <DropdownItem key="progress">Tiến độ chi tiết</DropdownItem>
                        <DropdownItem key="contact">Liên hệ phụ huynh</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getStatusBadge(student.status)}
                    {getRiskBadge(student.riskLevel)}
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
                        <span className="text-[#717680] dark:text-gray-400">Điểm nắm vững</span>
                        <span className="font-medium text-[#181d27] dark:text-white">{student.masteryScore}%</span>
                      </div>
                      <Progress value={student.masteryScore} size="sm" className="h-1.5" color="success" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#717680] dark:text-gray-400">Điểm danh</span>
                        <span className="font-medium text-[#181d27] dark:text-white">{student.attendance}%</span>
                      </div>
                      <Progress value={student.attendance} size="sm" className="h-1.5" color="warning" />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e9eaeb] dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-[#717680] dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {student.lastActive}
                    </div>
                    <div className="text-xs text-[#717680] dark:text-gray-400">
                      {student.completedLessons}/{student.totalLessons} bài
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[#e9eaeb] dark:border-gray-800 flex items-center justify-between bg-[#f9fafb] dark:bg-gray-800/30">
            <span className="text-sm text-[#717680] dark:text-gray-400">
              Hiển thị <strong className="text-[#181d27] dark:text-white">{filteredStudents.length}</strong> học sinh
            </span>
            <div className="flex items-center gap-1">
              <Button isIconOnly variant="light" size="sm" isDisabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-primary text-white min-w-[32px]">
                1
              </Button>
              <Button isIconOnly variant="light" size="sm" isDisabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
