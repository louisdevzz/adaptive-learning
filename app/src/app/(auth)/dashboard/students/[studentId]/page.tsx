"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MetricCard } from "@/components/dashboards/MetricCard";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  School,
  Calendar,
  User,
  GraduationCap,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Award,
} from "lucide-react";
import Link from "next/link";

interface StudentDetail {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  status: boolean;
  studentInfo?: {
    studentCode: string;
    gradeLevel: number;
    schoolName: string;
    dateOfBirth: string;
    gender: string;
  };
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  thumbnailUrl?: string;
  progress: number;
  masteryScore: number;
  completedKps: number;
  totalKps: number;
  lastAccessed: string;
}

interface StudentStats {
  totalCourses: number;
  averageMastery: number;
  totalLearningTime: number; // in minutes
  completedKps: number;
  streakDays: number;
}

interface RecentActivity {
  id: string;
  type: "completed" | "started" | "practice" | "mastery";
  title: string;
  description: string;
  timestamp: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    totalCourses: 0,
    averageMastery: 0,
    totalLearningTime: 0,
    completedKps: 0,
    streakDays: 0,
  });
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student details
      const studentData = await api.students.getById(studentId);
      setStudent(studentData);

      // Fetch student progress stats
      const progressData = await api.studentProgress.getAllStudentProgress(studentId);
      
      // Fetch student insights
      const insights = await api.studentProgress.getStudentInsights(studentId);

      // Calculate stats from data
      setStats({
        totalCourses: progressData?.courses?.length || 0,
        averageMastery: insights?.overallMastery || 0,
        totalLearningTime: progressData?.totalTimeSpent || 0,
        completedKps: insights?.completedKps || 0,
        streakDays: insights?.streakDays || 0,
      });

      // Fetch courses with progress
      const coursesData = await api.students.getCoursesWithProgress(studentId);
      setCourses(coursesData || []);

      // Mock activities (will be replaced with real API)
      setActivities([
        {
          id: "1",
          type: "completed",
          title: "Hoàn thành bài học",
          description: "Đã hoàn thành 'Nhân đa thức với đơn thức'",
          timestamp: "2 giờ trước",
        },
        {
          id: "2",
          type: "mastery",
          title: "Đạt mastery",
          description: "Đã nắm vững Knowledge Point 'Phân phối'",
          timestamp: "5 giờ trước",
        },
        {
          id: "3",
          type: "practice",
          title: "Luyện tập",
          description: "Đã hoàn thành 10 câu hỏi luyện tập",
          timestamp: "1 ngày trước",
        },
      ]);
    } catch (error: any) {
      console.error("Error fetching student data:", error);
      toast.error(error.response?.data?.message || "Không thể tải thông tin học sinh");
    } finally {
      setLoading(false);
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      default:
        return "Khác";
    }
  };

  const getGradeLabel = (grade: number) => {
    return `Lớp ${grade}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
              <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải thông tin học sinh...</p>
          </div>
        </div>
      
    );
  }

  if (!student) {
    return (
              <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Không tìm thấy học sinh</p>
            <button
              onClick={() => router.push("/dashboard/students")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      
    );
  }

  return (
          <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/students"
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Quay lại</span>
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/dashboard" className="text-gray-500 hover:text-primary">
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link href="/dashboard/students" className="text-gray-500 hover:text-primary">
                Học sinh
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-primary font-medium">{student.fullName}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/students/${studentId}/progress`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
            >
              <TrendingUp className="w-4 h-4" />
              Xem tiến độ
            </Link>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#E5E5E5] dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-3xl font-bold text-primary">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  student.fullName.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#010101] dark:text-white">
                    {student.fullName}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {student.studentInfo?.studentCode || "Chưa có mã học sinh"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    student.status
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {student.status ? "Đang hoạt động" : "Đã khóa"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#6244F4/10] dark:bg-blue-900/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <School className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trường</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.studentInfo?.schoolName || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lớp</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.studentInfo?.gradeLevel
                        ? getGradeLabel(student.studentInfo.gradeLevel)
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ngày sinh</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(student.studentInfo?.dateOfBirth)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Khóa học đang học"
            value={stats.totalCourses.toString()}
            change="Đang học"
            changeType="up"
            icon={<BookOpen className="w-5 h-5" />}
            iconBg="bg-[#6244F4/10] dark:bg-blue-900/20"
            iconColor="text-[#6244F4]"
          />
          <MetricCard
            title="Điểm nắm vững TB"
            value={`${stats.averageMastery}%`}
            change={stats.averageMastery >= 70 ? "Tốt" : "Cần cải thiện"}
            changeType={stats.averageMastery >= 70 ? "up" : "neutral"}
            icon={<Target className="w-5 h-5" />}
            iconBg="bg-green-50 dark:bg-green-900/20"
            iconColor="text-green-600"
          />
          <MetricCard
            title="Thời gian học"
            value={formatTime(stats.totalLearningTime)}
            change="Tổng"
            changeType="neutral"
            icon={<Clock className="w-5 h-5" />}
            iconBg="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-600"
          />
          <MetricCard
            title="KP đã nắm vững"
            value={stats.completedKps.toString()}
            change="Hoàn thành"
            changeType="up"
            icon={<Award className="w-5 h-5" />}
            iconBg="bg-yellow-50 dark:bg-yellow-900/20"
            iconColor="text-yellow-600"
          />
          <MetricCard
            title="Chuỗi học tập"
            value={`${stats.streakDays} ngày`}
            change="Liên tục"
            changeType="up"
            icon={<TrendingUp className="w-5 h-5" />}
            iconBg="bg-red-50 dark:bg-red-900/20"
            iconColor="text-red-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#010101] dark:text-white">
                Khóa học đang học
              </h2>
              <Link
                href={`/dashboard/students/${studentId}/progress`}
                className="text-sm text-primary hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <div
                    key={course.courseId || `course-${index}`}
                    className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#E5E5E5] dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.courseTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#010101] dark:text-white truncate">
                          {course.courseTitle}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Tiến độ</span>
                              <span className="font-medium text-primary">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" />
                            Mastery: {course.masteryScore}%
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {course.completedKps}/{course.totalKps} KP
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {course.lastAccessed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-[#1a202c] rounded-xl border border-[#E5E5E5] dark:border-gray-700">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Học sinh chưa tham gia khóa học nào</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#010101] dark:text-white">
              Hoạt động gần đây
            </h2>

            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#E5E5E5] dark:border-gray-700 p-4">
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === "completed"
                            ? "bg-green-50 text-green-600"
                            : activity.type === "mastery"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-[#6244F4/10] text-[#6244F4]"
                        }`}
                      >
                        {activity.type === "completed" ? (
                          <Award className="w-5 h-5" />
                        ) : activity.type === "mastery" ? (
                          <Target className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#010101] dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                      {index !== activities.length - 1 && (
                        <div className="absolute left-5 mt-10 w-px h-8 bg-gray-100 dark:bg-gray-700" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Chưa có hoạt động nào
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}
