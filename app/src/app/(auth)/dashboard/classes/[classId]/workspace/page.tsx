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
import { useState } from "react";
import Link from "next/link";
import { Button, Avatar, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  progress?: number;
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

interface StatusColumn {
  id: string;
  title: string;
  count: number;
  students: Student[];
  color: "green" | "orange" | "red" | "blue";
  description?: string;
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

export default function ClassWorkspacePage() {
  const params = useParams();
  const classId = params.classId as string;
  const [activeTab, setActiveTab] = useState<"announcements" | "board" | "chat">("board");
  const [newMessage, setNewMessage] = useState("");

  const announcements: Announcement[] = [
    {
      id: "1",
      title: "Kiểm tra Giữa kỳ môn Toán",
      date: "15/10/2023",
      content: "Bài kiểm tra giữa kỳ môn Toán sẽ diễn ra vào thứ Sáu tới. Tài liệu ôn tập đã được tải lên.",
      link: "#",
      linkText: "Xem tài liệu",
      icon: "attachment",
      author: "Cô Nguyễn Thị A",
      type: "announcement",
    },
    {
      id: "2",
      title: "Bài tập nhóm: Dự án Khoa học",
      date: "10/10/2023",
      content: "Các nhóm dự án Khoa học, hãy xem lại hướng dẫn chi tiết và các mốc thời gian đã được cập nhật.",
      link: "#",
      linkText: "Xem hướng dẫn",
      icon: "folder",
      author: "Thầy Trần Văn B",
      type: "assignment",
    },
    {
      id: "3",
      title: "Tài liệu bổ sung Chương 3",
      date: "08/10/2023",
      content: "Đã upload thêm video bài giảng và bài tập thực hành cho chương 3.",
      link: "#",
      linkText: "Truy cập tài liệu",
      icon: "folder",
      author: "Cô Nguyễn Thị A",
      type: "resource",
    },
  ];

  const statusColumns: StatusColumn[] = [
    {
      id: "mastered",
      title: "Nắm vững",
      count: 8,
      color: "green",
      description: "Hoàn thành xuất sắc",
      students: [
        { id: "1", name: "Trần Thị B", email: "btran@adapt.edu.vn", progress: 95, initials: "TB" },
        { id: "2", name: "Hoàng Văn E", email: "ehoang@adapt.edu.vn", progress: 88, initials: "HE" },
        { id: "3", name: "Lê Thị C", email: "cle@adapt.edu.vn", progress: 92, initials: "LC" },
      ],
    },
    {
      id: "in-progress",
      title: "Đang tiến bộ",
      count: 12,
      color: "orange",
      description: "Cần thêm thời gian",
      students: [
        { id: "4", name: "Nguyễn Thị G", email: "gnguyen@adapt.edu.vn", progress: 65, initials: "NG" },
        { id: "5", name: "Mai Anh T", email: "tmai@adapt.edu.vn", progress: 58, initials: "MT" },
        { id: "6", name: "Phạm Văn K", email: "kpham@adapt.edu.vn", progress: 72, initials: "PK" },
      ],
    },
    {
      id: "needs-help",
      title: "Cần hỗ trợ",
      count: 4,
      color: "red",
      description: "Cần can thiệp ngay",
      students: [
        { id: "7", name: "Phạm Hoàng H", email: "hpham@adapt.edu.vn", progress: 35, initials: "PH" },
        { id: "8", name: "Lê Kim L", email: "lle@adapt.edu.vn", progress: 28, initials: "KL" },
      ],
    },
    {
      id: "not-started",
      title: "Chưa bắt đầu",
      count: 2,
      color: "blue",
      description: "Mới tham gia",
      students: [
        { id: "9", name: "Nguyễn Văn M", email: "mnguyen@adapt.edu.vn", progress: 0, initials: "NM" },
      ],
    },
  ];

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
            <Button variant="bordered" startContent={<RefreshCw className="w-4 h-4" />} className="border-[#d5d7da]">
              Làm mới
            </Button>
            <Button className="bg-primary text-white" startContent={<UserPlus className="w-4 h-4" />}>
              Thêm học sinh
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
                <p className="text-2xl font-bold text-[#181d27] dark:text-white">{column.count}</p>
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
                <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {announcements.length}
                </span>
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
                      placeholder="Tìm kiếm học sinh..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white placeholder:text-[#a4a7ae] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button variant="bordered" startContent={<Filter className="w-4 h-4" />} className="border-[#d5d7da]">
                    Lọc
                  </Button>
                  <Button variant="bordered" startContent={<Plus className="w-4 h-4" />} className="border-[#d5d7da]">
                    Thêm cột
                  </Button>
                </div>

                {/* Kanban Board */}
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
                                {column.count}
                              </span>
                            </div>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly variant="light" size="sm">
                                  <MoreHorizontal className="w-4 h-4 text-[#717680]" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu>
                                <DropdownItem key="edit">Chỉnh sửa cột</DropdownItem>
                                <DropdownItem key="sort" className="text-danger">
                                  Xóa cột
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>

                          {/* Students */}
                          <div className="space-y-2">
                            {column.students.map((student) => (
                              <div
                                key={student.id}
                                className="bg-white dark:bg-[#1a202c] rounded-lg border border-[#e9eaeb] dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                              >
                                <div className="flex items-start gap-3">
                                  <Avatar
                                    src={student.avatar}
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
                                  <ProgressRing progress={student.progress || 0} size={36} strokeWidth={3} />
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#e9eaeb] dark:border-gray-800">
                                  <Button
                                    size="sm"
                                    variant="light"
                                    className="h-7 text-xs"
                                    startContent={<TrendingUp className="w-3 h-3" />}
                                  >
                                    Tiến độ
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    className="h-7 text-xs"
                                    startContent={<MessageCircle className="w-3 h-3" />}
                                  >
                                    Nhắn tin
                                  </Button>
                                </div>
                              </div>
                            ))}

                            {/* Add Student Button */}
                            <button className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#e9eaeb] dark:border-gray-700 rounded-lg text-[#717680] dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors">
                              <Plus className="w-4 h-4" />
                              <span className="text-sm">Thêm học sinh</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add New Column */}
                    <button className="w-80 flex-shrink-0 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#e9eaeb] dark:border-gray-700 rounded-xl text-[#717680] dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors">
                      <Plus className="w-8 h-8" />
                      <span className="font-medium">Thêm trạng thái mới</span>
                    </button>
                  </div>
                </div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
