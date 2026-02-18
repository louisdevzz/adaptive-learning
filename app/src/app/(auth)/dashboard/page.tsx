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
function TeacherDashboardContent({ user }: { user: any }) {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    // Mock data - replace with API
    setStats({
      totalClasses: 5,
      totalStudents: 127,
      pendingAssignments: 12,
      averageProgress: 72,
    });
  }, []);

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
          value={stats.totalStudents.toString()}
          change="+5"
          changeType="up"
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
          href="/dashboard/students"
        />
        <QuickStatCard
          title="Bài cần chấm"
          value={stats.pendingAssignments.toString()}
          icon={<Clock4 className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
            Lớp học của tôi
          </h2>
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="space-y-3">
              {[
                { name: "10A1", students: 32, progress: 78 },
                { name: "10A2", students: 30, progress: 75 },
                { name: "11B1", students: 35, progress: 82 },
                { name: "11B2", students: 30, progress: 70 },
              ].map((cls) => (
                <Link key={cls.name} href={`/dashboard/classes`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <School className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#181d27] dark:text-white">
                          Lớp {cls.name}
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
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
            Học sinh cần chú ý
          </h2>
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="space-y-3">
              {[
                { name: "Nguyễn Văn A", issue: "Tiến độ thấp", score: 45 },
                { name: "Trần Thị B", issue: "Chưa nộp bài", score: 0 },
                { name: "Lê Văn C", issue: "Cần ôn tập", score: 55 },
              ].map((student) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="sm"
                      className="rounded-full"
                      fallback={student.name.charAt(0)}
                    />
                    <div>
                      <p className="font-medium text-[#181d27] dark:text-white">
                        {student.name}
                      </p>
                      <p className="text-xs text-red-500">{student.issue}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="light" className="text-primary">
                    Chi tiết
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Dashboard Content
function StudentDashboardContent({ user }: { user: any }) {
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    masteryScore: 0,
    kpMastered: 0,
    streak: 0,
  });

  useEffect(() => {
    setStats({
      coursesEnrolled: 5,
      masteryScore: 78,
      kpMastered: 142,
      streak: 7,
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <WelcomeSection user={user} />

      {/* Streak Banner */}
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
          <Button className="bg-white text-orange-600 hover:bg-white/90">
            Tiếp tục học
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Khóa học"
          value={stats.coursesEnrolled.toString()}
          icon={<BookOpen className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
          href="/dashboard/my-courses"
        />
        <QuickStatCard
          title="Điểm nắm vững"
          value={`${stats.masteryScore}%`}
          change="+5%"
          changeType="up"
          icon={<Target className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <QuickStatCard
          title="KP đã học"
          value={stats.kpMastered.toString()}
          change="+12"
          changeType="up"
          icon={<CheckCircle2 className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        <QuickStatCard
          title="Xếp hạng"
          value="#42"
          icon={<Award className="w-6 h-6 text-yellow-600" />}
          color="bg-yellow-50 dark:bg-yellow-900/20"
        />
      </div>

      {/* Continue Learning */}
      <div>
        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
          Tiếp tục học
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Đại số cơ bản",
              progress: 65,
              nextLesson: "Phương trình bậc 2",
              icon: <BookOpen className="w-5 h-5" />,
            },
            {
              title: "Hình học phẳng",
              progress: 40,
              nextLesson: "Tam giác đồng dạng",
              icon: <Target className="w-5 h-5" />,
            },
          ].map((course) => (
            <div
              key={course.title}
              className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {course.icon}
                </div>
                <span className="text-sm font-medium text-primary">
                  {course.progress}%
                </span>
              </div>
              <h3 className="font-semibold text-[#181d27] dark:text-white">
                {course.title}
              </h3>
              <p className="text-sm text-[#717680] dark:text-gray-400 mt-1">
                Bài tiếp theo: {course.nextLesson}
              </p>
              <div className="mt-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Parent Dashboard Content
function ParentDashboardContent({ user }: { user: any }) {
  const [children, setChildren] = useState([
    {
      id: "1",
      name: "Nguyễn Văn A",
      class: "10A1",
      progress: 78,
      courses: 5,
      lastActive: "2 giờ trước",
    },
    {
      id: "2",
      name: "Nguyễn Thị B",
      class: "8A2",
      progress: 85,
      courses: 6,
      lastActive: "1 giờ trước",
    },
  ]);

  return (
    <div className="flex flex-col gap-8">
      <WelcomeSection user={user} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickStatCard
          title="Số con đang học"
          value={children.length.toString()}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <QuickStatCard
          title="Tiến độ trung bình"
          value={`${Math.round(
            children.reduce((acc, c) => acc + c.progress, 0) / children.length,
          )}%`}
          change="+3%"
          changeType="up"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <QuickStatCard
          title="Tổng khóa học"
          value={children.reduce((acc, c) => acc + c.courses, 0).toString()}
          icon={<BookOpen className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* Children Progress */}
      <div>
        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
          Tiến độ học tập của con
        </h2>
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
                  <span className="text-[#717680] dark:text-gray-400">
                    {child.courses} khóa học
                  </span>
                  <Button size="sm" variant="light" className="text-primary">
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900 dark:text-amber-200">
              Thông báo quan trọng
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Nguyễn Văn A có 2 bài tập chưa hoàn thành. Hãy nhắc nhở con hoàn
              thành bài tập đúng hạn.
            </p>
          </div>
        </div>
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
