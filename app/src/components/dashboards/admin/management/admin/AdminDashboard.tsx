"use client";

import { MetricCard } from "../../../MetricCard";
import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { api } from "@/lib/api";
import {
  BookOpen01Icon,
  UserGroupIcon,
  GraduationScrollIcon,
  ChartIncreaseIcon,
  AddCircleIcon,
  Alert01Icon,
  Analytics01Icon,
  Task01Icon,
  Settings01Icon,
  Calendar01Icon,
  Book04Icon
} from "@hugeicons/core-free-icons";
import { Button } from "@heroui/button";
import Link from "next/link";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/popover";
import { ChevronDown } from "lucide-react";
import { GRADE_LEVELS } from "@/constants/course";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeCourses: 0,
    averageProgress: 0,
    dropoutRate: 0,
    avgStudyTimeMinutes: 0,
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("Tất cả thời gian");
  const [selectedGrade, setSelectedGrade] = useState<string>("Tất cả lớp");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [topCourses, setTopCourses] = useState<Array<{ name: string; progress: number; subject?: string }>>([]);
  const [difficultKPs, setDifficultKPs] = useState<Array<{ name: string; failRate: number }>>([]);
  const [gameCompletions, setGameCompletions] = useState<Array<{ name: string; completion: number; rating: number }>>([]);
  const [classDistribution, setClassDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [teacherHighlights, setTeacherHighlights] = useState<Array<{
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
    className: string;
    activityLevel: string;
  }>>([]);
  const [lowProgressClasses, setLowProgressClasses] = useState<Array<{
    id: string;
    className: string;
    issue: string;
  }>>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Parse grade level from selected grade
        const gradeLevel = selectedGrade === "Tất cả lớp"
          ? undefined
          : parseInt(selectedGrade.replace("Khối ", ""));

        // Fetch stats
        const statsData = await api.dashboard.getStats({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          gradeLevel,
        });
        setStats(statsData);

        // Fetch top courses
        const coursesData = await api.dashboard.getTopCourses(4);
        setTopCourses(coursesData);

        // Fetch difficult KPs
        const kpsData = await api.dashboard.getDifficultKPs(4);
        setDifficultKPs(kpsData);

        // Fetch game completions
        const gamesData = await api.dashboard.getGameCompletions(4);
        setGameCompletions(gamesData);

        // Fetch class distribution
        const distributionData = await api.dashboard.getClassDistribution();
        setClassDistribution(distributionData);

        // Fetch teacher highlights
        const teachersData = await api.dashboard.getTeacherHighlights(2);
        setTeacherHighlights(teachersData);

        // Fetch low progress classes
        const lowProgressData = await api.dashboard.getLowProgressClasses(1);
        setLowProgressClasses(lowProgressData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [startDate, endDate, selectedGrade]);

  // Format date range for display
  const formatDateRange = () => {
    if (!startDate || !endDate) return "Tất cả thời gian";
    const start = new Date(startDate).toLocaleDateString("vi-VN");
    const end = new Date(endDate).toLocaleDateString("vi-VN");
    return `${start} - ${end}`;
  };

  const presetRanges = [
    { key: "all", label: "Tất cả thời gian" },
    { key: "today", label: "Hôm nay" },
    { key: "week", label: "Tuần này" },
    { key: "month", label: "Tháng này" },
    { key: "custom", label: "Tùy chỉnh" },
  ];

  const handlePresetSelect = (key: string) => {
    const today = new Date();
    let start = "";
    let end = today.toISOString().split("T")[0];

    switch (key) {
      case "all":
        setStartDate("");
        setEndDate("");
        setSelectedTimeRange("Tất cả thời gian");
        setIsDateRangeOpen(false);
        return;
      case "today":
        start = today.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        start = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        break;
      case "custom":
        // Set custom state, don't close popover yet
        setSelectedTimeRange("Tùy chỉnh");
        return;
    }

    setStartDate(start);
    setEndDate(end);
    setSelectedTimeRange(formatDateRange());
    setIsDateRangeOpen(false);
  };

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      setSelectedTimeRange(formatDateRange());
      setIsDateRangeOpen(false);
    }
  };

  // Metrics configuration matching the design
  const metrics = [
    {
      title: "Tổng học sinh",
      value: stats.totalStudents.toLocaleString("vi-VN"),
      change: "+12.5%",
      changeType: "up" as const,
      icon: <HugeiconsIcon icon={UserGroupIcon} size={24} className="w-6 h-6" />,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-[#135bec]",
    },
    {
      title: "Giáo viên hoạt động",
      value: stats.totalTeachers.toLocaleString("vi-VN"),
      change: "+2.1%",
      changeType: "up" as const,
      icon: <HugeiconsIcon icon={GraduationScrollIcon} size={24} className="w-6 h-6" />,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600",
    },
    {
      title: "Khóa học Active",
      value: stats.activeCourses.toString(),
      change: "0%",
      changeType: "neutral" as const,
      icon: <HugeiconsIcon icon={BookOpen01Icon} size={24} className="w-6 h-6" />,
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: `${stats.averageProgress}%`,
      change: "+5.4%",
      changeType: "up" as const,
      icon: <HugeiconsIcon icon={Task01Icon} size={24} className="w-6 h-6" />,
      iconBg: "bg-teal-50 dark:bg-teal-900/20",
      iconColor: "text-teal-600",
    },
  ];

  const maxDistribution = classDistribution.length > 0
    ? Math.max(...classDistribution.map((c) => c.value))
    : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#135bec] mx-auto"></div>
          <p className="mt-4 text-sm text-[#4c669a]">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-start relative w-full">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
            iconBg={metric.iconBg}
            iconColor={metric.iconColor}
          />
        ))}
      </div>

      {/* Learning Health Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="lg:col-span-2 bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">
                Sức khỏe học tập
              </h3>
              <p className="text-xs text-[#4c669a] mt-1">
                Số lượng Knowledge Point (KP) hoàn thành theo ngày
              </p>
            </div>
            <Button
              variant="light"
              size="sm"
              className="text-[#135bec] text-sm font-medium hover:underline"
            >
              Chi tiết báo cáo
            </Button>
          </div>
          <div className="relative h-64 w-full pt-4">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="border-t border-dashed border-gray-100 dark:border-gray-700 w-full h-0"
                />
              ))}
            </div>
            <div className="absolute bottom-[-24px] left-0 w-full flex justify-between text-xs text-[#4c669a] px-2">
              <span>Thứ 2</span>
              <span>Thứ 3</span>
              <span>Thứ 4</span>
              <span>Thứ 5</span>
              <span>Thứ 6</span>
              <span>Thứ 7</span>
              <span>CN</span>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="flex flex-col gap-4">
          {/* Learning Density Heatmap */}
          <div className="bg-white dark:bg-[#1a202c] p-5 rounded-xl border border-[#e7ebf3] dark:border-gray-700 flex-1">
            <h4 className="text-sm font-bold text-[#0d121b] dark:text-white mb-3">
              Mật độ học tập (Heatmap)
            </h4>
            <div className="grid grid-cols-7 gap-1 h-24">
              <div className="bg-blue-100 rounded-sm"></div>
              <div className="bg-blue-200 rounded-sm"></div>
              <div className="bg-[#135bec] rounded-sm"></div>
              <div className="bg-blue-200 rounded-sm"></div>
              <div className="bg-blue-100 rounded-sm"></div>
              <div className="bg-gray-100 rounded-sm"></div>
              <div className="bg-gray-100 rounded-sm"></div>
              <div className="bg-blue-200 rounded-sm"></div>
              <div className="bg-[#135bec] rounded-sm"></div>
              <div className="bg-blue-800 rounded-sm"></div>
              <div className="bg-[#135bec] rounded-sm"></div>
              <div className="bg-blue-200 rounded-sm"></div>
              <div className="bg-gray-100 rounded-sm"></div>
              <div className="bg-gray-100 rounded-sm"></div>
              <div className="bg-blue-300 rounded-sm"></div>
              <div className="bg-blue-600 rounded-sm"></div>
              <div className="bg-blue-500 rounded-sm"></div>
              <div className="bg-blue-400 rounded-sm"></div>
              <div className="bg-blue-300 rounded-sm"></div>
              <div className="bg-blue-100 rounded-sm"></div>
              <div className="bg-gray-100 rounded-sm"></div>
            </div>
            <div className="flex justify-between text-[10px] text-[#4c669a] mt-1">
              <span>Ít</span>
              <span>Nhiều</span>
            </div>
          </div>

          {/* Warning & Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={Alert01Icon} size={16} className="text-red-500" />
                <span className="text-xs font-bold text-red-500 uppercase">Cảnh báo</span>
              </div>
              <p className="text-2xl font-bold text-[#0d121b] dark:text-white">
                {stats.dropoutRate.toFixed(1)}%
              </p>
              <p className="text-xs text-[#4c669a]">Tỷ lệ bỏ học tăng</p>
            </div>
            <div className="bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e7ebf3] dark:border-gray-700">
              <p className="text-xs text-[#4c669a] mb-1">Thời gian học TB/ngày</p>
              <p className="text-2xl font-bold text-[#0d121b] dark:text-white">
                {stats.avgStudyTimeMinutes}m
              </p>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <HugeiconsIcon icon={ChartIncreaseIcon} size={12} />
                +5m
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content & Course Performance Section */}
      <section className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
            <HugeiconsIcon icon={Analytics01Icon} size={20} className="text-[#135bec]" />
            Hiệu suất Nội dung & Khóa học
          </h2>
          <div className="flex gap-2">
            <Button
              variant="light"
              size="sm"
              className="text-xs font-medium text-[#135bec] bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20"
            >
              Cải thiện nội dung
            </Button>
            <Button
              variant="light"
              size="sm"
              className="text-xs font-medium text-[#4c669a] bg-gray-100 hover:bg-gray-200 dark:bg-gray-800"
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Top 5 Effective Courses */}
          <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#0d121b] dark:text-white mb-4">
              Top 5 Khóa học hiệu quả
            </h3>
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium truncate">{course.name}</span>
                    <span className="text-green-600 font-bold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficult KPs */}
          <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 border-b border-[#e7ebf3] dark:border-gray-700 pb-2">
              <Button
                variant="light"
                size="sm"
                className="text-sm font-bold text-[#135bec] border-b-2 border-[#135bec] -mb-2.5 pb-2 px-0"
              >
                KP Khó (Fail nhiều)
              </Button>
              <Button
                variant="light"
                size="sm"
                className="text-sm font-medium text-[#4c669a] px-2 hover:text-[#135bec] transition-colors"
              >
                Tỷ lệ bỏ cao
              </Button>
            </div>
            <div className="space-y-4">
              {difficultKPs.map((kp, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#0d121b] dark:text-white">{kp.name}</p>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-red-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${kp.failRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-500">{kp.failRate}% fail</span>
                </div>
              ))}
            </div>
          </div>

          {/* Game KP Completion */}
          <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#0d121b] dark:text-white mb-4">
              Game KP Hoàn thành cao nhất
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[#4c669a] font-medium border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="pb-2">Tên Game KP</th>
                    <th className="pb-2 text-right">Hoàn thành</th>
                    <th className="pb-2 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {gameCompletions.map((game, index) => (
                    <tr key={index}>
                      <td className="py-2 font-medium text-[#0d121b] dark:text-white">
                        {game.name}
                      </td>
                      <td className="py-2 text-right text-green-600 font-bold">
                        {game.completion}%
                      </td>
                      <td className="py-2 text-right text-[#0d121b] dark:text-white">
                        {game.rating}/5
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Student & Class Insights Section */}
      <section className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
            Insights Học sinh & Lớp học
          </h2>
          <div className="flex items-center gap-2">
            <Popover
              isOpen={isDateRangeOpen}
              onOpenChange={setIsDateRangeOpen}
              placement="bottom-start"
              showArrow={false}
              classNames={{
                content: "p-0",
              }}
            >
              <PopoverTrigger>
                <Button
                  variant="bordered"
                  size="sm"
                  className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-2 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white h-auto min-w-[180px] justify-between"
                  endContent={<ChevronDown className="size-3" />}
                >
                  <HugeiconsIcon icon={Calendar01Icon} size={16} />
                  {selectedTimeRange}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 bg-white dark:bg-[#1a202c] border border-[#e7ebf3] dark:border-gray-700 rounded-lg shadow-lg">
                <div className="p-2">
                  <div className="space-y-1 mb-2">
                    {presetRanges.map((preset) => (
                      <button
                        key={preset.key}
                        onClick={() => handlePresetSelect(preset.key)}
                        className={`w-full text-left px-3 py-2 text-xs rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          preset.key === "custom" && (!startDate || !endDate || selectedTimeRange.includes("-"))
                            ? ""
                            : preset.key !== "custom" && selectedTimeRange === preset.label
                            ? "bg-blue-50 dark:bg-blue-900/20 text-[#135bec] font-medium"
                            : "text-[#0d121b] dark:text-white"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {(selectedTimeRange === "Tùy chỉnh" || (startDate && endDate && selectedTimeRange.includes("-"))) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-xs text-[#4c669a] mb-1 block">Từ ngày</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#4c669a] mb-1 block">Đến ngày</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-[#135bec] text-white text-xs mt-1"
                          onPress={handleCustomDateApply}
                          isDisabled={!startDate || !endDate}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  size="sm"
                  className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-2 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white h-auto min-w-[120px] justify-between"
                  endContent={<ChevronDown className="size-3" />}
                >
                  {selectedGrade}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Grade selection"
                selectedKeys={[selectedGrade]}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedGrade(selected);
                }}
                classNames={{
                  base: "bg-white dark:bg-[#1a202c] border border-[#e7ebf3] dark:border-gray-700 rounded-lg shadow-lg",
                }}
                items={[
                  { key: "Tất cả lớp", label: "Tất cả lớp" },
                  ...GRADE_LEVELS.map((grade) => ({
                    key: `Khối ${grade}`,
                    label: `Khối ${grade}`,
                  })),
                ]}
              >
                {(item) => (
                  <DropdownItem key={item.key} textValue={item.label}>
                    {item.label}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Class Distribution Chart */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-[#4c669a] mb-4">
              Phân bố học sinh theo lớp
            </h3>
            <div className="h-48 flex items-end justify-between gap-2 px-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              {classDistribution.map((cls, index) => (
                <div
                  key={index}
                  className="w-full bg-[#135bec] rounded-t hover:bg-blue-600 transition-colors relative group"
                  style={{ height: `${(cls.value / maxDistribution) * 100}%` }}
                >
                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block bg-black text-white px-1 rounded">
                    {cls.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#4c669a] mt-2 px-2">
              {classDistribution.map((cls, index) => (
                <span key={index}>{cls.name}</span>
              ))}
            </div>
          </div>
          {/* Teacher Highlights */}
          <div className="border-l border-gray-100 dark:border-gray-700 pl-0 lg:pl-6">
            <h3 className="text-sm font-semibold text-[#4c669a] mb-4">Giáo viên tiêu biểu</h3>
            <div className="space-y-4">
              {teacherHighlights.length > 0 ? (
                teacherHighlights.map((teacher, index) => (
                  <div key={teacher.id} className="flex items-center gap-3">
                    {teacher.avatarUrl ? (
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`size-8 rounded-full ${index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} flex items-center justify-center font-bold text-xs`}>
                        {teacher.initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-[#0d121b] dark:text-white">
                        {teacher.name}
                      </p>
                      <p className="text-[10px] text-[#4c669a]">
                        {teacher.className} - {teacher.activityLevel}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#4c669a]">Không có dữ liệu giáo viên</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-1">
                  <HugeiconsIcon icon={Alert01Icon} size={12} />
                  Lớp tiến độ thấp
                </h3>
                {lowProgressClasses.length > 0 ? (
                  lowProgressClasses.map((cls) => (
                    <div key={cls.id} className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs text-red-800 dark:text-red-300 mb-2 last:mb-0">
                      <strong>{cls.className}</strong> - {cls.issue}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs text-[#4c669a]">
                    Tất cả các lớp đang tiến triển tốt
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Command Center */}
      <section className="space-y-4 w-full pb-12">
        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
          <HugeiconsIcon icon={Analytics01Icon} size={20} className="text-[#135bec]" />
          Admin Command Center
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/users">
            <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700 hover:border-[#135bec] transition-all flex flex-col items-center justify-center text-center h-auto cursor-pointer group">
            <div className="size-14 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center mb-4 group-hover:bg-[#135bec] group-hover:text-white transition-colors">
              <HugeiconsIcon icon={UserGroupIcon} size={32} />
            </div>
            <h3 className="text-base font-semibold text-[#0d121b] dark:text-white">
              Quản lý Học sinh
            </h3>
            <p className="text-xs text-[#4c669a] mt-1">Thêm, sửa, xóa học sinh</p>
            </div>
          </Link>
          <Link href="/dashboard/courses">
            <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700 hover:border-[#135bec] transition-all flex flex-col items-center justify-center text-center h-auto cursor-pointer group">
            <div className="size-14 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center mb-4 group-hover:bg-[#135bec] group-hover:text-white transition-colors">
              <HugeiconsIcon icon={Book04Icon} size={32} />
            </div>
            <h3 className="text-base font-semibold text-[#0d121b] dark:text-white">
              Quản lý Khoá học
            </h3>
            <p className="text-xs text-[#4c669a] mt-1">Thêm, sửa, xóa khóa học</p>
            </div>
          </Link>
          <Link href="/dashboard/courses/create">
            <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700 hover:border-[#135bec] transition-all flex flex-col items-center justify-center text-center h-auto cursor-pointer group">
            <div className="size-14 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center mb-4 group-hover:bg-[#135bec] group-hover:text-white transition-colors">
              <HugeiconsIcon icon={AddCircleIcon} size={32} />
            </div>
            <h3 className="text-base font-semibold text-[#0d121b] dark:text-white">
              Tạo Khóa học mới
            </h3>
            <p className="text-xs text-[#4c669a] mt-1">Thiết lập khóa học và nội dung</p>
            </div>
          </Link>
          <Link href="/dashboard/reports">
            <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-gray-700 hover:border-[#135bec] transition-all flex flex-col items-center justify-center text-center h-auto cursor-pointer group">
            <div className="size-14 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center mb-4 group-hover:bg-[#135bec] group-hover:text-white transition-colors">
              <HugeiconsIcon icon={Analytics01Icon} size={32} />
            </div>
            <h3 className="text-base font-semibold text-[#0d121b] dark:text-white">
              Xem tất cả Báo cáo
            </h3>
            <p className="text-xs text-[#4c669a] mt-1">Phân tích dữ liệu chi tiết</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
