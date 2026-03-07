"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  Bell,
  Clock,
  Target,
  Award,
  ArrowUpRight,
  Sparkles,
  School,
  ChevronRight,
  BarChart3,
  Flame,
  Zap,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock4,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/react";
import Link from "next/link";
// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

// Types
interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  averageProgress: number;
  totalClasses: number;
  completionRate: number;
}

interface Activity {
  id: string;
  type:
    | "student_joined"
    | "course_completed"
    | "assignment_submitted"
    | "achievement_earned";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

// Welcome Section Component
function WelcomeSection({ user }: { user: any }) {
  const currentHour = new Date().getHours();
  let greeting = "Chào buổi sáng";
  if (currentHour >= 12 && currentHour < 18) greeting = "Chào buổi chiều";
  else if (currentHour >= 18) greeting = "Chào buổi tối";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white">
            {greeting}, {user?.fullName?.split(" ")[0] || "Admin"}!
          </h1>
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-[#717680] dark:text-gray-400 mt-1">
          Đây là tình hình hoạt động của hệ thống hôm nay.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="bordered"
          size="sm"
          className="border-[#d5d7da] dark:border-gray-600"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Button>
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
          className="border-[#d5d7da] dark:border-gray-600 relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </div>
  );
}

// Quick Stat Card
function QuickStatCard({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  href,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`text-xs font-medium ${
                  changeType === "up"
                    ? "text-green-600"
                    : changeType === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                }`}
              >
                {changeType === "up" && "↑"}
                {changeType === "down" && "↓"}
                {change}
              </span>
              <span className="text-xs text-[#717680] dark:text-gray-400">
                so với tuần trước
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
      {href && (
        <div className="mt-4 pt-4 border-t border-[#e9eaeb] dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-primary font-medium group-hover:underline">
            Xem chi tiết
          </span>
          <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

// Activity Item Component
function ActivityItem({ activity }: { activity: Activity }) {
  const icons = {
    student_joined: <Users className="w-4 h-4 text-blue-600" />,
    course_completed: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    assignment_submitted: <BookOpen className="w-4 h-4 text-purple-600" />,
    achievement_earned: <Award className="w-4 h-4 text-yellow-600" />,
  };

  const bgColors = {
    student_joined: "bg-blue-50 dark:bg-blue-900/20",
    course_completed: "bg-green-50 dark:bg-green-900/20",
    assignment_submitted: "bg-purple-50 dark:bg-purple-900/20",
    achievement_earned: "bg-yellow-50 dark:bg-yellow-900/20",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgColors[activity.type]}`}
      >
        {icons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#181d27] dark:text-white">
          {activity.title}
        </p>
        <p className="text-xs text-[#717680] dark:text-gray-400 mt-0.5">
          {activity.description}
        </p>
        <p className="text-xs text-[#717680] dark:text-gray-500 mt-1">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({
  title,
  description,
  icon,
  color,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 hover:shadow-lg hover:border-primary/30 transition-all group h-full">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-[#181d27] dark:text-white group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#717680] dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
    </Link>
  );
}

// Admin Dashboard Content
function AdminDashboardContent({ user }: { user: any }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    activeCourses: 0,
    averageProgress: 0,
    totalClasses: 0,
    completionRate: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats from API
        const statsData = await api.dashboard.getStats({});
        setStats({
          totalStudents: statsData.totalStudents || 0,
          totalTeachers: statsData.totalTeachers || 0,
          activeCourses: statsData.activeCourses || 0,
          averageProgress: statsData.averageProgress || 0,
          totalClasses: statsData.totalClasses || 0,
          completionRate: statsData.completionRate || 0,
        });

        // Mock activities - replace with real API
        setActivities([
          {
            id: "1",
            type: "student_joined",
            title: "Học sinh mới đã tham gia",
            description: "Nguyễn Văn A vừa đăng ký vào lớp 10A1",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: "2",
            type: "course_completed",
            title: "Khóa học hoàn thành",
            description: "Trần Thị B đã hoàn thành khóa Đại số cơ bản",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: "3",
            type: "assignment_submitted",
            title: "Bài tập được nộp",
            description: "5 học sinh vừa nộp bài tập về nhà",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          },
          {
            id: "4",
            type: "achievement_earned",
            title: "Thành tích mới",
            description: "Lê Văn C đạt danh hiệu 'Học sinh xuất sắc'",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <WelcomeSection user={user} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Tổng học sinh"
          value={stats.totalStudents.toLocaleString()}
          change="+12"
          changeType="up"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
          href="/dashboard/students"
        />
        <QuickStatCard
          title="Giáo viên"
          value={stats.totalTeachers.toLocaleString()}
          change="+3"
          changeType="up"
          icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
          href="/dashboard/users"
        />
        <QuickStatCard
          title="Lớp học"
          value={stats.totalClasses.toLocaleString()}
          change="+2"
          changeType="up"
          icon={<School className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50 dark:bg-orange-900/20"
          href="/dashboard/classes"
        />
        <QuickStatCard
          title="Khóa học"
          value={stats.activeCourses.toLocaleString()}
          change="0"
          changeType="neutral"
          icon={<BookOpen className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
          href="/dashboard/courses"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
              Truy cập nhanh
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              title="Quản lý học sinh"
              description="Thêm, sửa, xóa và xem thông tin học sinh"
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="bg-blue-50 dark:bg-blue-900/20"
              href="/dashboard/students"
            />
            <QuickActionCard
              title="Quản lý lớp học"
              description="Quản lý lớp học và phân công giáo viên"
              icon={<School className="w-6 h-6 text-orange-600" />}
              color="bg-orange-50 dark:bg-orange-900/20"
              href="/dashboard/classes"
            />
            <QuickActionCard
              title="Quản lý khóa học"
              description="Tạo và quản lý nội dung khóa học"
              icon={<BookOpen className="w-6 h-6 text-green-600" />}
              color="bg-green-50 dark:bg-green-900/20"
              href="/dashboard/courses"
            />
            <QuickActionCard
              title="Báo cáo & Thống kê"
              description="Xem báo cáo chi tiết và phân tích dữ liệu"
              icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
              color="bg-purple-50 dark:bg-purple-900/20"
              href="/dashboard/reports"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
              Hoạt động gần đây
            </h2>
            <Button variant="light" size="sm" className="text-primary">
              Xem tất cả
            </Button>
          </div>
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="space-y-2">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
            Tổng quan tiến độ học tập
          </h2>
          <Button variant="bordered" size="sm" className="border-[#d5d7da]">
            <Clock className="w-4 h-4 mr-2" />7 ngày qua
          </Button>
        </div>
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 mb-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-[#181d27] dark:text-white">
                {stats.averageProgress}%
              </p>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Tiến độ trung bình
              </p>
            </div>
            <div className="text-center border-x border-[#e9eaeb] dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-3">
                <Flame className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-[#181d27] dark:text-white">
                85%
              </p>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Tỷ lệ tham gia
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 mb-3">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-[#181d27] dark:text-white">
                {stats.completionRate}%
              </p>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Tỷ lệ hoàn thành
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Teacher Dashboard Content
interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  totalCourses: number;
  totalAssignments: number;
  averageProgress: number;
  classes: {
    id: string;
    name: string;
    gradeLevel: number | null;
    students: number;
    progress: number;
  }[];
  strugglingStudents: {
    id: string;
    name: string;
    avatarUrl: string | null;
    className: string;
    avgMastery: number;
    issue: string;
  }[];
}

function TeacherDashboardContent({ user }: { user: any }) {
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    averageProgress: 0,
    classes: [],
    strugglingStudents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const data = await api.dashboard.getTeacherStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <WelcomeSection user={user} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Lớp đang dạy"
          value={stats.totalClasses.toString()}
          icon={<School className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
          href="/dashboard/classes"
        />
        <QuickStatCard
          title="Học sinh"
          value={stats.totalStudents.toLocaleString()}
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
          href="/dashboard/students"
        />
        <QuickStatCard
          title="Khóa học"
          value={stats.totalCourses.toString()}
          icon={<BookOpen className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
          href="/dashboard/courses"
        />
        <QuickStatCard
          title="Bài tập đã tạo"
          value={stats.totalAssignments.toString()}
          icon={<Clock4 className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Average Progress Overview */}
      {stats.totalClasses > 0 && (
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#717680] dark:text-gray-400">
              Tiến độ trung bình tất cả lớp
            </span>
            <span className="text-2xl font-bold text-[#181d27] dark:text-white">
              {stats.averageProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${stats.averageProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
            Lớp học của tôi
          </h2>
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="space-y-3">
              {stats.classes.length === 0 ? (
                <p className="text-sm text-[#717680] dark:text-gray-400 text-center py-4">
                  Chưa có lớp học nào được phân công
                </p>
              ) : (
                stats.classes.map((cls) => (
                  <Link key={cls.id} href={`/dashboard/classes`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <School className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[#181d27] dark:text-white">
                            {cls.name}
                          </p>
                          <p className="text-xs text-[#717680] dark:text-gray-400">
                            {cls.students} học sinh
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#181d27] dark:text-white">
                          {cls.progress}%
                        </p>
                        <p className="text-xs text-[#717680] dark:text-gray-400">
                          tiến độ
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
            Học sinh cần chú ý
          </h2>
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="space-y-3">
              {stats.strugglingStudents.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-[#717680] dark:text-gray-400">
                    Tất cả học sinh đều có tiến độ tốt!
                  </p>
                </div>
              ) : (
                stats.strugglingStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/dashboard/students/${student.id}`}
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          className="rounded-full"
                          src={student.avatarUrl || undefined}
                          fallback={student.name?.charAt(0) || "?"}
                        />
                        <div>
                          <p className="font-medium text-[#181d27] dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-xs text-red-500">
                            {student.issue} - {student.className}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${student.avgMastery < 30 ? 'text-red-500' : 'text-orange-500'}`}>
                          {student.avgMastery}%
                        </p>
                        <p className="text-xs text-[#717680] dark:text-gray-400">
                          mastery
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Dashboard Content
interface StudentStats {
  totalCourses: number;
  coursesInProgress: number;
  coursesCompleted: number;
  masteryScore: number;
  kpMastered: number;
  totalKpsCount: number;
  streak: number;
  pendingAssignments: number;
  recentActivity: number;
  totalStudyTimeMinutes: number;
  classInfo: {
    className: string;
    gradeLevel: number;
  } | null;
}

interface CourseWithProgress {
  id: string;
  title: string;
  subject: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  masteredKps: number;
  totalKps: number;
}

function StudentDashboardContent({ user }: { user: any }) {
  const [stats, setStats] = useState<StudentStats>({
    totalCourses: 0,
    coursesInProgress: 0,
    coursesCompleted: 0,
    masteryScore: 0,
    kpMastered: 0,
    totalKpsCount: 0,
    streak: 0,
    pendingAssignments: 0,
    recentActivity: 0,
    totalStudyTimeMinutes: 0,
    classInfo: null,
  });
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard stats
        const statsData = await api.students.getMyDashboardStats();
        setStats(statsData);

        // Fetch courses with progress
        const coursesData = await api.students.getMyCoursesWithProgress();
        // Sort by progress (in progress first, then by progress desc)
        const sortedCourses = coursesData.sort((a: CourseWithProgress, b: CourseWithProgress) => {
          if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
          if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
          return b.progress - a.progress;
        });
        setCourses(sortedCourses.slice(0, 4)); // Get top 4 courses
      } catch (error) {
        console.error("Error fetching student dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getCourseStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getCourseStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'in_progress':
        return 'Đang học';
      default:
        return 'Chưa bắt đầu';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <WelcomeSection user={user} />

      {/* Streak Banner */}
      {stats.streak > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.streak} ngày</p>
                <p className="text-white/80">Chuỗi học tập của bạn</p>
              </div>
            </div>
            <Link href="/dashboard/my-courses">
              <Button className="bg-white text-orange-600 hover:bg-white/90">
                Tiếp tục học
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Class Info */}
      {stats.classInfo && (
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <School className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-[#181d27] dark:text-white">
              {stats.classInfo.className}
            </p>
            <p className="text-sm text-[#717680] dark:text-gray-400">
              Khối {stats.classInfo.gradeLevel}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Khóa học"
          value={stats.totalCourses.toString()}
          change={`${stats.coursesInProgress} đang học`}
          changeType="neutral"
          icon={<BookOpen className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
          href="/dashboard/my-courses"
        />
        <QuickStatCard
          title="Điểm nắm vững"
          value={`${stats.masteryScore}%`}
          icon={<Target className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <QuickStatCard
          title="KP đã thành thạo"
          value={stats.kpMastered.toString()}
          change={`/${stats.totalKpsCount}`}
          changeType="neutral"
          icon={<CheckCircle2 className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        <QuickStatCard
          title="Bài tập chờ"
          value={stats.pendingAssignments.toString()}
          icon={<Clock4 className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50 dark:bg-orange-900/20"
          href="/dashboard/assignments"
        />
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round(stats.totalStudyTimeMinutes / 60)}h</p>
              <p className="text-sm text-[#717680] dark:text-gray-400">Thời gian học (30 ngày)</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.recentActivity}</p>
              <p className="text-sm text-[#717680] dark:text-gray-400">Hoạt động (7 ngày)</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.coursesCompleted}</p>
              <p className="text-sm text-[#717680] dark:text-gray-400">Khóa học hoàn thành</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      {courses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
              Tiếp tục học
            </h2>
            <Link href="/dashboard/my-courses">
              <Button variant="light" size="sm" className="text-primary">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
                <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCourseStatusColor(course.status)}`}>
                      {getCourseStatusText(course.status)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#181d27] dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-sm text-[#717680] dark:text-gray-400 mt-1">
                    Môn: {course.subject} • {course.masteredKps}/{course.totalKps} KP
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#717680] dark:text-gray-400">Tiến độ</span>
                      <span className="font-medium text-[#181d27] dark:text-white">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Khóa học của tôi"
            description="Xem tất cả khóa học đang học"
            icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50 dark:bg-blue-900/20"
            href="/dashboard/my-courses"
          />
          <QuickActionCard
            title="Lộ trình học tập"
            description="Xem lộ trình học tập cá nhân"
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            color="bg-green-50 dark:bg-green-900/20"
            href="/dashboard/learning-path"
          />
          <QuickActionCard
            title="Tiến độ học tập"
            description="Xem chi tiết tiến độ của bạn"
            icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50 dark:bg-purple-900/20"
            href="/dashboard/progress"
          />
          <QuickActionCard
            title="Khám phá khóa học"
            description="Tìm kiếm khóa học mới"
            icon={<Sparkles className="w-6 h-6 text-orange-600" />}
            color="bg-orange-50 dark:bg-orange-900/20"
            href="/dashboard/courses/explorer"
          />
        </div>
      </div>
    </div>
  );
}

// Parent Dashboard Content
function ParentDashboardContent({ user }: { user: any }) {
  const [children, setChildren] = useState<Array<{
    id: string;
    name: string;
    class: string;
    progress: number;
    courses: number;
    completedCourses: number;
    lastActive: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        setLoading(true);
        // Fetch parent's children
        const childrenData = await api.students.getMyChildren();
        
        if (!childrenData || childrenData.length === 0) {
          setChildren([]);
          return;
        }

        // Fetch progress data for each child
        const childrenWithProgress = await Promise.all(
          childrenData.map(async (child: any) => {
            try {
              console.log("Fetching progress for child:", child.id, child.fullName);
              const progressData = await api.students.getCoursesWithProgress(child.id);
              console.log("Progress data received:", progressData);
              
              // API might return array directly or object with courses property
              const courses = Array.isArray(progressData) 
                ? progressData 
                : (progressData?.courses || []);
              
              console.log("Courses extracted:", courses.length, courses);
              
              // Calculate average progress
              const totalProgress = courses.reduce((acc: number, course: any) => acc + (course.progress || 0), 0);
              const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;
              
              // Count completed courses (status === 'completed' or progress === 100)
              const completedCourses = courses.filter((c: any) => c.status === 'completed' || c.progress === 100).length;
              
              // Get class info from the first course or default
              const classInfo = courses[0]?.classInfo?.className || "Chưa có lớp";
              
              // Calculate last active based on last accessed course
              const lastAccessed = courses
                .filter((c: any) => c.lastAccessed)
                .sort((a: any, b: any) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())[0];
              
              const lastActive = lastAccessed?.lastAccessed 
                ? formatRelativeTime(lastAccessed.lastAccessed)
                : "Chưa hoạt động";

              return {
                id: child.id,
                name: child.fullName || "Không có tên",
                class: classInfo,
                progress: avgProgress,
                courses: courses.length,
                completedCourses: completedCourses,
                lastActive: lastActive,
              };
            } catch (error) {
              console.error(`Error fetching progress for child ${child.id}:`, error);
              return {
                id: child.id,
                name: child.fullName || "Không có tên",
                class: "Chưa có lớp",
                progress: 0,
                courses: 0,
                lastActive: "Không xác định",
              };
            }
          })
        );

        setChildren(childrenWithProgress);
      } catch (error) {
        console.error("Error fetching children data:", error);
        toast.error("Không thể tải dữ liệu con cái");
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <WelcomeSection user={user} />
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <WelcomeSection user={user} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/children-progress">
          <QuickStatCard
            title="Số con đang học"
            value={children.length.toString()}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50 dark:bg-blue-900/20"
          />
        </Link>
        <Link href="/dashboard/children-progress">
          <QuickStatCard
            title="Tiến độ trung bình"
            value={children.length > 0 ? `${Math.round(
              children.reduce((acc, c) => acc + c.progress, 0) / children.length,
            )}%` : "0%"}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            color="bg-green-50 dark:bg-green-900/20"
          />
        </Link>
        <Link href="/dashboard/children-progress">
          <QuickStatCard
            title="Khóa học đã hoàn thành"
            value={children.reduce((acc, c) => acc + c.completedCourses, 0).toString()}
            icon={<BookOpen className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50 dark:bg-purple-900/20"
          />
        </Link>
      </div>

      {/* Children Progress */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
            Tiến độ học tập của con
          </h2>
          <Link href="/dashboard/children-progress">
            <Button size="sm" variant="light" className="text-primary">
              Xem tất cả
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {children.length === 0 ? (
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-[#181d27] dark:text-white mb-1">
              Chưa có học sinh nào được liên kết
            </h3>
            <p className="text-sm text-[#717680] dark:text-gray-400">
              Vui lòng liên hệ quản trị viên để liên kết tài khoản với học sinh
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    size="md"
                    className="rounded-full"
                    fallback={child.name.charAt(0)}
                  />
                  <div>
                    <h3 className="font-semibold text-[#181d27] dark:text-white">
                      {child.name}
                    </h3>
                    <p className="text-sm text-[#717680] dark:text-gray-400">
                      Lớp {child.class}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#717680] dark:text-gray-400">
                  {child.lastActive}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#717680] dark:text-gray-400">
                    Tiến độ
                  </span>
                  <span className="text-sm font-medium text-[#181d27] dark:text-white">
                    {child.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${child.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#717680] dark:text-gray-400">
                      {child.courses} khóa học
                    </span>
                    {child.completedCourses > 0 && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        ({child.completedCourses} đã hoàn thành)
                      </span>
                    )}
                  </div>
                  <Link href="/dashboard/children-progress">
                    <Button size="sm" variant="light" className="text-primary">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useUser();

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    const role = user?.role?.toLowerCase() || "";

    switch (role) {
      case "admin":
        return <AdminDashboardContent user={user} />;
      case "teacher":
        return <TeacherDashboardContent user={user} />;
      case "student":
        return <StudentDashboardContent user={user} />;
      case "parent":
        return <ParentDashboardContent user={user} />;
      default:
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-[#717680] dark:text-gray-400">
                Vui lòng đăng nhập để xem bảng điều khiển của bạn.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {renderDashboard()}
      </div>
    </LayoutDashboard>
  );
}
