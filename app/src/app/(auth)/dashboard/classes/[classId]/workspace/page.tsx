"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import {
  UserPlus,
  Search,
  ChevronDown,
  RefreshCw,
  Filter,
  Plus,
  MoreHorizontal,
  TrendingUp,
  MessageCircle,
  Bell,
  Paperclip,
  FolderOpen,
  Layout,
  ChevronLeft,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Users,
  BookOpen,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Avatar, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spinner } from "@heroui/react";
import { api } from "@/lib/api";

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
  status: string;
  riskLevel: string;
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

interface StatusColumn {
  id: string;
  title: string;
  students: StudentProgress[];
  color: "green" | "blue" | "orange" | "red";
  description: string;
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  link?: string;
  linkText?: string;
  icon?: "attachment" | "folder";
  author?: string;
  type?: "announcement" | "assignment" | "resource";
}

// Progress Ring Component
function ProgressRing({
  progress,
  size = 40,
  strokeWidth = 3,
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
        <span className="text-[10px] font-bold text-[#181d27] dark:text-white">{progress}%</span>
      </div>
    </div>
  );
}

function buildStatusColumns(students: StudentProgress[]): StatusColumn[] {
  const mastered = students.filter((s) => s.status === "excellent");
  const good = students.filter((s) => s.status === "good");
  const atRisk = students.filter((s) => s.status === "at-risk");
  const needsHelp = students.filter((s) => s.status === "needs-help");

  return [
    {
      id: "mastered",
      title: "Nắm vững",
      students: mastered,
      color: "green",
      description: "Hoàn thành xuất sắc",
    },
    {
      id: "good",
      title: "Đang tiến bộ",
      students: good,
      color: "blue",
      description: "Tiến độ tốt",
    },
    {
      id: "at-risk",
      title: "Cần chú ý",
      students: atRisk,
      color: "orange",
      description: "Cần thêm hỗ trợ",
    },
    {
      id: "needs-help",
      title: "Cần hỗ trợ",
      students: needsHelp,
      color: "red",
      description: "Cần can thiệp ngay",
    },
  ];
}

export default function ClassWorkspacePage() {
  const params = useParams();
  const classId = params.classId as string;
  const [activeTab, setActiveTab] = useState<"announcements" | "board">("board");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ClassProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.classes.getClassProgress(classId);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allStudents = data?.students || [];
  const summary = data?.summary || {
    totalStudents: 0,
    avgMastery: 0,
    atRiskCount: 0,
    excellentCount: 0,
    totalKpsMastered: 0,
  };

  // Filter students by search
  const filteredStudents = allStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColumns = buildStatusColumns(searchQuery ? filteredStudents : allStudents);

  // Placeholder announcements (no backend yet)
  const announcements: Announcement[] = [];

  const getColumnColors = (color: string) => {
    switch (color) {
      case "green":
        return {
          bg: "bg-green-50 dark:bg-green-900/10",
          border: "border-green-200 dark:border-green-800",
          badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          dot: "bg-green-500",
        };
      case "orange":
        return {
          bg: "bg-orange-50 dark:bg-orange-900/10",
          border: "border-orange-200 dark:border-orange-800",
          badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
          dot: "bg-orange-500",
        };
      case "red":
        return {
          bg: "bg-red-50 dark:bg-red-900/10",
          border: "border-red-200 dark:border-red-800",
          badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          dot: "bg-red-500",
        };
      case "blue":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/10",
          border: "border-blue-200 dark:border-blue-800",
          badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          dot: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800",
          border: "border-gray-200 dark:border-gray-700",
          badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
          dot: "bg-gray-500",
        };
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="w-4 h-4" />;
      case "resource":
        return <FolderOpen className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-[#717680] dark:text-gray-400">Đang tải không gian làm việc...</p>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  if (error) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <Button className="mt-4" onPress={fetchData}>
              Thử lại
            </Button>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

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
          <span className="text-[#181d27] dark:text-white font-medium">Không gian làm việc</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181d27] dark:text-white">
              Không gian làm việc
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Quản lý học sinh, thông báo và trạng thái học tập
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="bordered"
              startContent={<RefreshCw className="w-4 h-4" />}
              className="border-[#d5d7da]"
              onPress={fetchData}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusColumns.map((column) => {
            const colors = getColumnColors(column.color);
            return (
              <div
                key={column.id}
                className={`${colors.bg} ${colors.border} border rounded-xl p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                  <span className="text-sm font-medium text-[#535862] dark:text-gray-300">
                    {column.title}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white">{column.students.length}</p>
                <p className="text-xs text-[#717680] dark:text-gray-400">{column.description}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-[#e9eaeb] dark:border-gray-800 px-4">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab("board")}
                className={`py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "board"
                    ? "border-primary text-primary"
                    : "border-transparent text-[#717680] hover:text-[#181d27]"
                }`}
              >
                <Layout className="w-4 h-4" />
                Bảng trạng thái
              </button>
              <button
                onClick={() => setActiveTab("announcements")}
                className={`py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "announcements"
                    ? "border-primary text-primary"
                    : "border-transparent text-[#717680] hover:text-[#181d27]"
                }`}
              >
                <Bell className="w-4 h-4" />
                Thông báo
                {announcements.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {announcements.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "board" && (
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3">
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
                </div>

                {/* Kanban Board */}
                {allStudents.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#717680] dark:text-gray-400">Chưa có học sinh trong lớp</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-4 min-w-max">
                      {statusColumns.map((column) => {
                        const colors = getColumnColors(column.color);
                        return (
                          <div
                            key={column.id}
                            className={`w-80 flex-shrink-0 ${colors.bg} rounded-xl border ${colors.border} p-3`}
                          >
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                                <h3 className="font-semibold text-[#181d27] dark:text-white text-sm">
                                  {column.title}
                                </h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                                  {column.students.length}
                                </span>
                              </div>
                            </div>

                            {/* Students */}
                            <div className="space-y-2">
                              {column.students.length === 0 ? (
                                <div className="text-center py-6 text-xs text-[#a4a7ae] dark:text-gray-500">
                                  Không có học sinh
                                </div>
                              ) : (
                                column.students.map((student) => (
                                  <div
                                    key={student.id}
                                    className="bg-white dark:bg-[#1a202c] rounded-lg border border-[#e9eaeb] dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                  >
                                    <div className="flex items-start gap-3">
                                      <Avatar
                                        src={student.avatar || undefined}
                                        name={student.name}
                                        size="sm"
                                        className="shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[#181d27] dark:text-white text-sm truncate">
                                          {student.name}
                                        </p>
                                        <p className="text-xs text-[#717680] dark:text-gray-400 truncate">
                                          {student.email}
                                        </p>
                                      </div>
                                      <ProgressRing progress={student.progress} size={36} strokeWidth={3} />
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e9eaeb] dark:border-gray-800">
                                      <span className="text-xs text-[#717680] dark:text-gray-400">
                                        {student.masteredKps}/{student.totalKps} KP
                                      </span>
                                      <Link
                                        href={`/dashboard/classes/${classId}/progress`}
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                      >
                                        <TrendingUp className="w-3 h-3" />
                                        Tiến độ
                                      </Link>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "announcements" && (
              <div className="space-y-4">
                {/* New Announcement */}
                <div className="bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl p-4 border border-[#e9eaeb] dark:border-gray-800">
                  <div className="flex items-start gap-3">
                    <Avatar size="sm" className="shrink-0" />
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Đăng thông báo mới..."
                        rows={2}
                        className="w-full bg-white dark:bg-[#1a202c] border border-[#e9eaeb] dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-[#181d27] dark:text-white placeholder:text-[#a4a7ae] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="light" startContent={<Paperclip className="w-4 h-4" />}>
                            Đính kèm
                          </Button>
                          <Button size="sm" variant="light" startContent={<Calendar className="w-4 h-4" />}>
                            Lịch
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary text-white"
                          startContent={<Send className="w-4 h-4" />}
                          isDisabled={!newMessage.trim()}
                        >
                          Đăng
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcements List */}
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#717680] dark:text-gray-400">Chưa có thông báo nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {getTypeIcon(announcement.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-[#181d27] dark:text-white">
                                  {announcement.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-[#717680] dark:text-gray-400 mt-1">
                                  <span>{announcement.author}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {announcement.date}
                                  </span>
                                </div>
                              </div>
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button isIconOnly variant="light" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                  <DropdownItem key="edit">Chỉnh sửa</DropdownItem>
                                  <DropdownItem key="pin">Ghim lên đầu</DropdownItem>
                                  <DropdownItem key="delete" className="text-danger">
                                    Xóa
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                            <p className="text-sm text-[#535862] dark:text-gray-300 mt-2">
                              {announcement.content}
                            </p>
                            {announcement.link && (
                              <Button
                                size="sm"
                                variant="light"
                                className="mt-3 text-primary"
                                startContent={
                                  announcement.icon === "attachment" ? (
                                    <Paperclip className="w-4 h-4" />
                                  ) : (
                                    <FolderOpen className="w-4 h-4" />
                                  )
                                }
                                endContent={<ArrowUpRight className="w-3 h-3" />}
                              >
                                {announcement.linkText}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
