"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import {
  Progress,
  Chip,
  Tabs,
  Tab,
  Badge,
} from "@heroui/react";
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Zap,
  Flame,
  BarChart3,
  Lightbulb,
  Loader2,
  GraduationCap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface KpProgress {
  kpId: string;
  kpTitle: string;
  masteryScore: number;
  confidence: number;
  lastUpdated: string;
  attemptCount: number;
  attemptStats?: {
    totalAttempts: number;
    correctAttempts: number;
    accuracyRate: number;
  };
}

interface CourseMastery {
  courseId: string;
  courseTitle: string;
  subject: string;
  mastery: number;
}

interface WeeklyActivity {
  date: string;
  attempts: number;
  timeSpent: number;
}

interface StudentInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function ProgressPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [kpProgress, setKpProgress] = useState<KpProgress[]>([]);
  const [courseMastery, setCourseMastery] = useState<CourseMastery[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [insights, setInsights] = useState<StudentInsights | null>(null);
  const [overallStats, setOverallStats] = useState({
    avgMastery: 0,
    totalKps: 0,
    masteredKps: 0,
    totalStudyTime: 0,
    currentStreak: 0,
    weeklyAttempts: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      const [allProgress, allMastery, dashboardStats, weeklyData] = await Promise.all([
        api.studentProgress.getAllStudentProgress(user!.id),
        api.studentProgress.getAllStudentMastery(user!.id),
        api.students.getMyDashboardStats().catch(() => null),
        api.studentProgress.getWeeklyActivity(user!.id).catch(() => null),
      ]);

      console.log("Raw progress data:", allProgress);
      console.log("Raw mastery data:", allMastery);
      console.log("Dashboard stats:", dashboardStats);

      // Map API response to KpProgress interface
      // API returns array directly with knowledgePoint nested
      const kpData: KpProgress[] = Array.isArray(allProgress) 
        ? allProgress.map((item: any) => ({
            kpId: item.kpId,
            kpTitle: item.knowledgePoint?.title || "Không có tiêu đề",
            masteryScore: item.masteryScore || 0,
            confidence: item.confidence || 0,
            lastUpdated: item.lastUpdated,
            attemptCount: item.attemptStats?.totalAttempts || 0,
            attemptStats: item.attemptStats,
          }))
        : [];
      
      setKpProgress(kpData);

      // allMastery is returned directly from getAllStudentMastery
      const masteryData: CourseMastery[] = Array.isArray(allMastery) ? allMastery : [];
      setCourseMastery(masteryData);

      const totalKps = kpData.length;
      const masteredKps = kpData.filter((kp: KpProgress) => kp.masteryScore >= 70).length;
      const avgMastery = totalKps > 0
        ? Math.round(kpData.reduce((acc: number, kp: KpProgress) => acc + kp.masteryScore, 0) / totalKps)
        : 0;

      setOverallStats({
        avgMastery,
        totalKps,
        masteredKps,
        totalStudyTime: dashboardStats?.totalStudyTimeMinutes || 0,
        currentStreak: dashboardStats?.streak || 0,
        weeklyAttempts: dashboardStats?.recentActivity || 0,
      });

      generateInsights(kpData, masteryData);
      
      // Use real weekly activity data if available
      if (weeklyData && Array.isArray(weeklyData)) {
        setWeeklyActivity(weeklyData);
      }
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
      toast.error("Không thể tải dữ liệu tiến độ");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (kpData: KpProgress[], masteryData: CourseMastery[]) => {
    const strongSubjects = masteryData
      .filter((c) => c.mastery >= 70)
      .map((c) => c.subject);

    const weakSubjects = masteryData
      .filter((c) => c.mastery < 50)
      .map((c) => c.subject);

    const recommendations: string[] = [];
    if (weakSubjects.length > 0) {
      recommendations.push(`Tập trung cải thiện các môn: ${weakSubjects.join(", ")}`);
    }
    if (overallStats.masteredKps < overallStats.totalKps * 0.3) {
      recommendations.push("Bạn cần học thêm nhiều điểm kiến thức mới");
    }
    if (overallStats.currentStreak < 3) {
      recommendations.push("Cố gắng duy trì học tập hàng ngày để tăng chuỗi ngày học");
    }
    if (recommendations.length === 0) {
      recommendations.push("Tiếp tục phát huy phong độ học tập tốt!");
    }

    setInsights({
      strengths: [...new Set(strongSubjects)],
      weaknesses: [...new Set(weakSubjects)],
      recommendations,
    });
  };

  const subjectData = courseMastery.map((c) => ({
    subject: c.subject,
    mastery: c.mastery,
    fullMark: 100,
  }));

  const weakKPs = kpProgress
    .filter((kp) => kp.masteryScore < 50)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 5);

  const strongKPs = kpProgress
    .filter((kp) => kp.masteryScore >= 80)
    .sort((a, b) => b.masteryScore - a.masteryScore)
    .slice(0, 5);

  if (loading) {
    return (
              <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      
    );
  }

  return (
          <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181d27] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              Tiến độ học tập
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Theo dõi và phân tích tiến độ học tập của bạn
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6244F4/10] text-[#6244F4] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{overallStats.avgMastery}%</p>
                <p className="text-xs text-gray-500">Nắm vững TB</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{overallStats.masteredKps}</p>
                <p className="text-xs text-gray-500">KP thành thạo</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{overallStats.totalKps}</p>
                <p className="text-xs text-gray-500">Tổng KP</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{Math.round(overallStats.totalStudyTime / 60)}h</p>
                <p className="text-xs text-gray-500">Thời gian học</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{overallStats.currentStreak}</p>
                <p className="text-xs text-gray-500">Chuỗi ngày</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{overallStats.weeklyAttempts}</p>
                <p className="text-xs text-gray-500">Hoạt động tuần</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6",
          }}
        >
          <Tab key="overview" title="Tổng quan" />
          <Tab key="subjects" title="Theo môn học" />
          <Tab key="kps" title="Điểm kiến thức" />
          <Tab key="insights" title="Phân tích & Gợi ý" />
        </Tabs>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity Chart */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                Hoạt động 7 ngày qua
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="attempts" fill="#6244F4" radius={[4, 4, 0, 0]} name="Số lần thử" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Study Time Chart */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                Thời gian học (phút)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="timeSpent"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                      name="Thời gian (phút)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 lg:col-span-2">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                Thành tích nổi bật
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Chuỗi {overallStats.currentStreak} ngày</p>
                    <p className="text-sm text-gray-500">Học liên tục</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#6244F4/10] flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-[#6244F4]" />
                  </div>
                  <div>
                    <p className="font-semibold">{overallStats.masteredKps} KP</p>
                    <p className="text-sm text-gray-500">Đã thành thạo</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{overallStats.avgMastery}%</p>
                    <p className="text-sm text-gray-500">Điểm trung bình</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Mastery Radar Chart */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
              <h3 className="text-lg font-bold mb-4">Năng lực theo môn</h3>
              <div className="h-80">
                {subjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={subjectData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Mastery"
                        dataKey="mastery"
                        stroke="#6244F4"
                        fill="#6244F4"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Chưa có dữ liệu đủ để hiển thị</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Mastery List */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
              <h3 className="text-lg font-bold mb-4">Tiến độ theo khóa học</h3>
              <div className="space-y-4">
                {courseMastery.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Chưa có dữ liệu tiến độ</p>
                  </div>
                ) : (
                  courseMastery.map((course) => (
                    <div key={course.courseId} className="border border-[#e9eaeb] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{course.courseTitle}</p>
                            <Chip size="sm" variant="flat">{course.subject}</Chip>
                          </div>
                        </div>
                        <span className="text-lg font-bold">{course.mastery}%</span>
                      </div>
                      <Progress
                        value={course.mastery}
                        size="sm"
                        color={course.mastery >= 70 ? "success" : course.mastery >= 50 ? "primary" : "warning"}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* KPs Tab */}
        {activeTab === "kps" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strong KPs */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
              <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" />
                Điểm mạnh (Nắm vững ≥80%)
              </h3>
              <div className="space-y-3">
                {strongKPs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có điểm kiến thức nào đạt 80%</p>
                  </div>
                ) : (
                  strongKPs.map((kp) => (
                    <div key={kp.kpId} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{kp.kpTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={kp.masteryScore} size="sm" color="success" className="flex-1" />
                          <span className="text-sm font-medium text-green-600">{kp.masteryScore}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weak KPs */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
              <h3 className="text-lg font-bold text-orange-700 flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5" />
                Cần cải thiện (Nắm vững &lt;50%)
              </h3>
              <div className="space-y-3">
                {weakKPs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tuyệt vời! Không có điểm kiến thức nào dưới 50%</p>
                  </div>
                ) : (
                  weakKPs.map((kp) => (
                    <div key={kp.kpId} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{kp.kpTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={kp.masteryScore} size="sm" color="warning" className="flex-1" />
                          <span className="text-sm font-medium text-orange-600">{kp.masteryScore}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* All KPs Table */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 lg:col-span-2">
              <h3 className="text-lg font-bold mb-4">Tất cả điểm kiến thức</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {kpProgress.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Chưa có dữ liệu điểm kiến thức</p>
                  </div>
                ) : (
                  kpProgress
                    .sort((a, b) => b.masteryScore - a.masteryScore)
                    .map((kp) => (
                      <div
                        key={kp.kpId}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            kp.masteryScore >= 70
                              ? "bg-green-100 text-green-600"
                              : kp.masteryScore >= 50
                              ? "bg-[#6244F4/10] text-[#6244F4]"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {kp.masteryScore >= 70 ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <BookOpen className="w-5 h-5" />
                          )}
                        </div>
                         <div className="flex-1">
                           <p className="font-medium">{kp.kpTitle}</p>
                           <p className="text-xs text-gray-500">
                             {kp.attemptStats?.totalAttempts || kp.attemptCount || 0} lần thử 
                             {kp.attemptStats && (
                               <span className="ml-1">
                                 ({kp.attemptStats.correctAttempts} đúng / {kp.attemptStats.totalAttempts - kp.attemptStats.correctAttempts} sai)
                               </span>
                             )}
                             • Cập nhật: {new Date(kp.lastUpdated).toLocaleDateString("vi-VN")}
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="font-bold">{kp.masteryScore}%</p>
                           <p className="text-xs text-gray-400">
                             {kp.attemptStats && `Tỷ lệ đúng: ${kp.attemptStats.accuracyRate}%`}
                           </p>
                           <Chip
                             size="sm"
                             color={
                               kp.masteryScore >= 70
                                 ? "success"
                                 : kp.masteryScore >= 50
                                 ? "primary"
                                 : "warning"
                             }
                             variant="flat"
                             className="mt-1"
                           >
                             {kp.masteryScore >= 70
                               ? "Thành thạo"
                               : kp.masteryScore >= 50
                               ? "Đang học"
                               : "Cần ôn tập"}
                           </Chip>
                         </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
              <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5" />
                Điểm mạnh
              </h3>
              {insights?.strengths.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có điểm mạnh nổi bật nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights?.strengths.map((subject, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{subject}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weaknesses */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
              <h3 className="text-lg font-bold text-orange-700 flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5" />
                Cần cải thiện
              </h3>
              {insights?.weaknesses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Tuyệt vời! Bạn đang làm tốt tất cả các môn
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights?.weaknesses.map((subject, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{subject}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 lg:col-span-2">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5" />
                Gợi ý cải thiện
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights?.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-[#6244F4/10] rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#6244F4/10]0 text-white flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
}
