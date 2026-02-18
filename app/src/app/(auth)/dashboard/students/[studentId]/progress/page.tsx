"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { MetricCard } from "@/components/dashboards/MetricCard";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Brain,
  FileText,
  BarChart3,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  subject: string;
  gradeLevel: number;
  thumbnailUrl?: string;
  progress: number;
  masteryScore: number;
  completedKps: number;
  totalKps: number;
  timeSpent: number;
  lastAccessed: string;
  status: "not_started" | "in_progress" | "completed";
  modules: ModuleProgress[];
}

interface ModuleProgress {
  moduleId: string;
  title: string;
  completedSections: number;
  totalSections: number;
  sections: SectionProgress[];
}

interface SectionProgress {
  sectionId: string;
  title: string;
  completedKps: number;
  totalKps: number;
  kps: KpProgress[];
}

interface KpProgress {
  kpId: string;
  title: string;
  masteryScore: number;
  status: "not_started" | "learning" | "mastered";
  attempts: number;
  lastAttempt?: string;
}

interface MasteryTrend {
  date: string;
  score: number;
}

interface SkillBreakdown {
  skill: string;
  mastery: number;
  totalKps: number;
  completedKps: number;
}

export default function StudentProgressPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [studentName, setStudentName] = useState("");
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [masteryTrend, setMasteryTrend] = useState<MasteryTrend[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<SkillBreakdown[]>([]);

  // Stats
  const [stats, setStats] = useState({
    overallMastery: 0,
    coursesCompleted: 0,
    coursesInProgress: 0,
    totalKpsMastered: 0,
    averageTimePerDay: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    if (studentId) {
      fetchProgressData();
    }
  }, [studentId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch student info
      const student = await api.students.getById(studentId);
      setStudentName(student.fullName);

      // Fetch all progress (includes courses)
      const progressData = await api.studentProgress.getAllStudentProgress(studentId);
      
      // Fetch insights
      const insights = await api.studentProgress.getStudentInsights(studentId);

      // Process courses data
      const coursesData: CourseProgress[] = progressData?.courses?.map((c: any) => ({
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        subject: c.subject,
        gradeLevel: c.gradeLevel,
        thumbnailUrl: c.thumbnailUrl,
        progress: c.progress || 0,
        masteryScore: c.masteryScore || 0,
        completedKps: c.completedKps || 0,
        totalKps: c.totalKps || 0,
        timeSpent: c.timeSpent || 0,
        lastAccessed: c.lastAccessed,
        status: c.progress === 100 ? "completed" : c.progress > 0 ? "in_progress" : "not_started",
        modules: c.modules || [],
      })) || [];

      setCourses(coursesData);

      // Calculate stats
      setStats({
        overallMastery: insights?.overallMastery || 0,
        coursesCompleted: coursesData.filter((c) => c.status === "completed").length,
        coursesInProgress: coursesData.filter((c) => c.status === "in_progress").length,
        totalKpsMastered: insights?.totalKpsMastered || 0,
        averageTimePerDay: insights?.averageTimePerDay || 0,
        currentStreak: insights?.streakDays || 0,
      });

      // Mock mastery trend data (will be replaced with real API)
      setMasteryTrend([
        { date: "T1", score: 45 },
        { date: "T2", score: 52 },
        { date: "T3", score: 58 },
        { date: "T4", score: 65 },
        { date: "T5", score: 72 },
        { date: "T6", score: 78 },
        { date: "T7", score: 82 },
      ]);

      // Mock skill breakdown
      setSkillBreakdown([
        { skill: "Đại số", mastery: 85, totalKps: 24, completedKps: 20 },
        { skill: "Hình học", mastery: 72, totalKps: 18, completedKps: 13 },
        { skill: "Giải tích", mastery: 60, totalKps: 15, completedKps: 9 },
        { skill: "Xác suất", mastery: 45, totalKps: 12, completedKps: 5 },
        { skill: "Số học", mastery: 90, totalKps: 20, completedKps: 18 },
      ]);

      // Select first course by default
      if (coursesData.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesData[0].courseId);
      }
    } catch (error: any) {
      console.error("Error fetching progress data:", error);
      toast.error(error.response?.data?.message || "Không thể tải tiến độ học sinh");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã hoàn thành";
      case "in_progress":
        return "Đang học";
      default:
        return "Chưa bắt đầu";
    }
  };

  const getKpStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-500";
      case "learning":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getKpStatusLabel = (status: string) => {
    switch (status) {
      case "mastered":
        return "Đã nắm vững";
      case "learning":
        return "Đang học";
      default:
        return "Chưa bắt đầu";
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const selectedCourseData = courses.find((c) => c.courseId === selectedCourse);

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải tiến độ học sinh...</p>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/students/${studentId}`}
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
              <Link href={`/dashboard/students/${studentId}`} className="text-gray-500 hover:text-primary">
                {studentName}
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-primary font-medium">Tiến độ</span>
            </nav>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a202c] border border-[#e7ebf3] dark:border-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">
            Tiến độ học tập - {studentName}
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi chi tiết quá trình học tập và nắm vững kiến thức
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Mastery tổng thể"
            value={`${stats.overallMastery}%`}
            change={stats.overallMastery >= 70 ? "Xuất sắc" : stats.overallMastery >= 50 ? "Khá" : "Cần cải thiện"}
            changeType={stats.overallMastery >= 70 ? "up" : stats.overallMastery >= 50 ? "neutral" : "down"}
            icon={<Brain className="w-5 h-5" />}
            iconBg="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-600"
          />
          <MetricCard
            title="Khóa học hoàn thành"
            value={`${stats.coursesCompleted}/${courses.length}`}
            change={`${stats.coursesInProgress} đang học`}
            changeType="up"
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBg="bg-green-50 dark:bg-green-900/20"
            iconColor="text-green-600"
          />
          <MetricCard
            title="KP đã nắm vững"
            value={stats.totalKpsMastered.toString()}
            change="Tổng số"
            changeType="up"
            icon={<Award className="w-5 h-5" />}
            iconBg="bg-yellow-50 dark:bg-yellow-900/20"
            iconColor="text-yellow-600"
          />
          <MetricCard
            title="Thời gian học TB/ngày"
            value={formatTime(stats.averageTimePerDay)}
            change={`${stats.currentStreak} ngày liên tục`}
            changeType="up"
            icon={<Clock className="w-5 h-5" />}
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Course List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white">
                Khóa học
              </h2>
              <span className="text-sm text-gray-500">{courses.length} khóa</span>
            </div>

            <div className="space-y-3">
              {courses.map((course) => (
                <button
                  key={course.courseId}
                  onClick={() => setSelectedCourse(course.courseId)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedCourse === course.courseId
                      ? "bg-primary/5 border-primary dark:bg-primary/10 dark:border-primary"
                      : "bg-white dark:bg-[#1a202c] border-[#e7ebf3] dark:border-gray-700 hover:shadow-md"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
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
                      <h3 className="font-semibold text-sm text-[#0d121b] dark:text-white truncate">
                        {course.courseTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lớp {course.gradeLevel} • {course.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-primary">
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        course.status === "completed"
                          ? "bg-green-50 text-green-600"
                          : course.status === "in_progress"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {getStatusLabel(course.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.completedKps}/{course.totalKps} KP
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Middle Column - Detailed Progress */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCourseData ? (
              <>
                {/* Course Overview */}
                <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white">
                        {selectedCourseData.courseTitle}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Chi tiết tiến độ từng module và knowledge point
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {selectedCourseData.masteryScore}%
                      </div>
                      <p className="text-xs text-gray-500">Điểm mastery</p>
                    </div>
                  </div>

                  {/* Progress Overview */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-[#0d121b] dark:text-white">
                        {selectedCourseData.progress}%
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Tiến độ</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-[#0d121b] dark:text-white">
                        {selectedCourseData.completedKps}/{selectedCourseData.totalKps}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">KP hoàn thành</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-[#0d121b] dark:text-white">
                        {formatTime(selectedCourseData.timeSpent)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Thời gian</p>
                    </div>
                  </div>
                </div>

                {/* Modules & Sections */}
                <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-semibold text-[#0d121b] dark:text-white">
                      Chi tiết theo module
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {selectedCourseData.modules?.map((module) => (
                      <div key={module.moduleId}>
                        <button
                          onClick={() => toggleModule(module.moduleId)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {expandedModules.has(module.moduleId) ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium text-sm text-[#0d121b] dark:text-white">
                              {module.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{
                                    width: `${(module.completedSections / module.totalSections) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {module.completedSections}/{module.totalSections}
                              </span>
                            </div>
                          </div>
                        </button>

                        {expandedModules.has(module.moduleId) && (
                          <div className="bg-gray-50/50 dark:bg-gray-800/30 px-4 py-2">
                            {module.sections?.map((section) => (
                              <div
                                key={section.sectionId}
                                className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {section.title}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {section.completedKps}/{section.totalKps} KP
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {section.kps?.map((kp) => (
                                    <div
                                      key={kp.kpId}
                                      className="flex items-center justify-between py-2 px-3 bg-white dark:bg-[#1a202c] rounded-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`w-2 h-2 rounded-full ${getKpStatusColor(
                                            kp.status
                                          )}`}
                                        />
                                        <span className="text-sm text-[#0d121b] dark:text-white">
                                          {kp.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-primary rounded-full"
                                              style={{ width: `${kp.masteryScore}%` }}
                                            />
                                          </div>
                                          <span className="text-xs font-medium text-primary w-8 text-right">
                                            {kp.masteryScore}%
                                          </span>
                                        </div>
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${
                                            kp.status === "mastered"
                                              ? "bg-green-50 text-green-600"
                                              : kp.status === "learning"
                                              ? "bg-yellow-50 text-yellow-600"
                                              : "bg-gray-100 text-gray-500"
                                          }`}
                                        >
                                          {getKpStatusLabel(kp.status)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-gray-700">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chọn một khóa học để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Charts & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mastery Trend */}
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-[#0d121b] dark:text-white">
                  Xu hướng Mastery
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Điểm mastery theo thời gian
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="h-48 flex items-end justify-between gap-2">
              {masteryTrend.map((point, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative">
                    <div
                      className="bg-primary/20 rounded-t-lg transition-all duration-500"
                      style={{ height: `${point.score * 1.5}px` }}
                    />
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500"
                      style={{ height: `${point.score * 1.5}px` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{point.date}</span>
                  <span className="text-xs font-medium text-primary">{point.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-[#0d121b] dark:text-white">
                  Phân tích kỹ năng
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mức độ nắm vững theo từng kỹ năng
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {skillBreakdown.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                      {skill.skill}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {skill.completedKps}/{skill.totalKps} KP
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          skill.mastery >= 80
                            ? "text-green-600"
                            : skill.mastery >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {skill.mastery}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        skill.mastery >= 80
                          ? "bg-green-500"
                          : skill.mastery >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${skill.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
