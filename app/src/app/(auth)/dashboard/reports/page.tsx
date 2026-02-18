"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Download,
  FileText,
  PieChart,
  ArrowUpRight,
  Filter,
  Search,
  ChevronDown,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Button, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";

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
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
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

// Report Card Component
function ReportCard({
  title,
  description,
  type,
  date,
  status,
}: {
  title: string;
  description: string;
  type: "analytics" | "progress" | "attendance" | "assessment";
  date: string;
  status: "ready" | "generating" | "scheduled";
}) {
  const getTypeIcon = () => {
    switch (type) {
      case "analytics":
        return <BarChart3 className="w-5 h-5 text-blue-600" />;
      case "progress":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "attendance":
        return <Clock className="w-5 h-5 text-orange-600" />;
      case "assessment":
        return <CheckCircle2 className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "analytics":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "progress":
        return "bg-green-50 dark:bg-green-900/20";
      case "attendance":
        return "bg-orange-50 dark:bg-orange-900/20";
      case "assessment":
        return "bg-purple-50 dark:bg-purple-900/20";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "ready":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            Sẵn sàng
          </span>
        );
      case "generating":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Đang tạo
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="w-3 h-3" />
            Đã lên lịch
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${getTypeColor()} flex items-center justify-center shrink-0`}>
          {getTypeIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[#181d27] dark:text-white truncate">{title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-[#717680] dark:text-gray-400 mt-1 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[#a4a7ae] dark:text-gray-500">{date}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="light" startContent={<Download className="w-4 h-4" />}>
                Tải xuống
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="light" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="view">Xem báo cáo</DropdownItem>
                  <DropdownItem key="share">Chia sẻ</DropdownItem>
                  <DropdownItem key="schedule">Lên lịch gửi</DropdownItem>
                  <DropdownItem key="delete" className="text-danger">
                    Xóa
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("week");
  const [searchQuery, setSearchQuery] = useState("");

  const reports = [
    {
      title: "Báo cáo tiến độ học tập - Tuần 42",
      description: "Tổng quan tiến độ học tập của tất cả học sinh trong tuần",
      type: "progress" as const,
      date: "20/10/2024",
      status: "ready" as const,
    },
    {
      title: "Phân tích điểm danh tháng 10",
      description: "Thống kê tỷ lệ điểm danh theo lớp và theo ngày",
      type: "attendance" as const,
      date: "15/10/2024",
      status: "ready" as const,
    },
    {
      title: "Đánh giá năng lực học sinh",
      description: "Báo cáo đánh giá chi tiết kết quả học tập theo môn",
      type: "assessment" as const,
      date: "12/10/2024",
      status: "generating" as const,
    },
    {
      title: "Phân tích xu hướng học tập",
      description: "Phân tích dữ liệu học tập 3 tháng gần nhất",
      type: "analytics" as const,
      date: "10/10/2024",
      status: "ready" as const,
    },
    {
      title: "Báo cáo tuần 41",
      description: "Tổng hợp hoạt động học tập và kết quả đánh giá",
      type: "progress" as const,
      date: "13/10/2024",
      status: "scheduled" as const,
    },
    {
      title: "Thống kê bài tập và điểm số",
      description: "Báo cáo chi tiết về bài tập và điểm số của học sinh",
      type: "assessment" as const,
      date: "08/10/2024",
      status: "ready" as const,
    },
  ];

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181d27] dark:text-white">Báo cáo & Phân tích</h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Xem và tải xuống báo cáo về tiến độ học tập, điểm danh và đánh giá
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="bordered" startContent={<Calendar className="w-4 h-4" />} className="border-[#d5d7da]">
              Lên lịch báo cáo
            </Button>
            <Button className="bg-primary text-white" startContent={<FileText className="w-4 h-4" />}>
              Tạo báo cáo mới
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Tổng số báo cáo"
            value="24"
            subtitle="Tháng này"
            icon={FileText}
            color="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
            trend={{ value: "+12%", positive: true }}
          />
          <StatCard
            title="Báo cáo đã tải"
            value="156"
            subtitle="Lượt tải xuống"
            icon={Download}
            color="bg-green-50 text-green-600 dark:bg-green-900/20"
            trend={{ value: "+8%", positive: true }}
          />
          <StatCard
            title="Học sinh hoạt động"
            value="89%"
            subtitle="Trong 7 ngày qua"
            icon={Users}
            color="bg-purple-50 text-purple-600 dark:bg-purple-900/20"
            trend={{ value: "+5%", positive: true }}
          />
          <StatCard
            title="Tiến độ trung bình"
            value="72%"
            subtitle="Toàn hệ thống"
            icon={TrendingUp}
            color="bg-orange-50 text-orange-600 dark:bg-orange-900/20"
            trend={{ value: "+3%", positive: true }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#181d27] dark:text-white">Tổng quan học tập</h3>
                <p className="text-sm text-[#717680] dark:text-gray-400">Tiến độ và hoạt động học tập theo thời gian</p>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white"
              >
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="quarter">Quý này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
            <div className="h-64 bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl border border-dashed border-[#e9eaeb] dark:border-gray-700 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-[#717680] dark:text-gray-400 text-sm">Biểu đồ tổng quan học tập</p>
                <p className="text-xs text-[#a4a7ae] dark:text-gray-500 mt-1">Đang phát triển</p>
              </div>
            </div>
          </div>

          {/* Side Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 p-5">
              <h3 className="font-bold text-[#181d27] dark:text-white mb-4">Phân bố theo loại</h3>
              <div className="h-48 bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl border border-dashed border-[#e9eaeb] dark:border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-[#717680] dark:text-gray-400">Biểu đồ phân bố</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Tiến độ học tập", value: 40, color: "bg-green-500" },
                  { label: "Điểm danh", value: 25, color: "bg-orange-500" },
                  { label: "Đánh giá", value: 20, color: "bg-purple-500" },
                  { label: "Phân tích", value: 15, color: "bg-blue-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                      <span className="text-sm text-[#535862] dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-[#181d27] dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-[#e9eaeb] dark:border-gray-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm báo cáo..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] dark:bg-gray-800 border border-[#e9eaeb] dark:border-gray-700 rounded-lg text-sm text-[#181d27] dark:text-white placeholder:text-[#a4a7ae] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="bordered" startContent={<Filter className="w-4 h-4" />} className="border-[#d5d7da]">
                Loại báo cáo
              </Button>
              <Button variant="bordered" startContent={<Calendar className="w-4 h-4" />} className="border-[#d5d7da]">
                Thời gian
              </Button>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredReports.map((report, index) => (
                <ReportCard key={index} {...report} />
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-[#717680] dark:text-gray-400">Không tìm thấy báo cáo</p>
            </div>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
}
