"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  TrendingUp,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Clock,
  Target,
  Award,
  ArrowUpRight,
  Loader2,
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  BookMarked,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Avatar, Chip, Progress, Card, CardBody, CardHeader } from "@heroui/react";
import Link from "next/link";
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
} from "recharts";

interface Child {
  id: string;
  name: string;
  class: string;
  gradeLevel: number;
  progress: number;
  courses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  totalKps: number;
  masteredKps: number;
  lastActive: string;
  weeklyActivity: Array<{
    date: string;
    attempts: number;
    timeSpent: number;
  }>;
  coursesDetail: Array<{
    id: string;
    title: string;
    subject: string;
    progress: number;
    status: string;
    masteredKps: number;
    totalKps: number;
    lastAccessed?: string;
  }>;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function ChildrenProgressPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    fetchChildrenData();
  }, []);

  const fetchChildrenData = async () => {
    try {
      setLoading(true);
      const childrenData = await api.students.getMyChildren();

      if (!childrenData || childrenData.length === 0) {
        setChildren([]);
        return;
      }

      const childrenWithDetails = await Promise.all(
        childrenData.map(async (child: any) => {
          try {
            // Fetch courses with progress
            const progressData = await api.students.getCoursesWithProgress(child.id);
            const courses = Array.isArray(progressData) ? progressData : (progressData?.courses || []);

            // Calculate statistics
            const totalProgress = courses.reduce((acc: number, course: any) => acc + (course.progress || 0), 0);
            const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

            const completedCourses = courses.filter((c: any) => c.status === 'completed' || c.progress === 100).length;
            const inProgressCourses = courses.filter((c: any) => c.status === 'in_progress').length;
            const notStartedCourses = courses.filter((c: any) => c.status === 'not_started').length;

            const totalKps = courses.reduce((acc: number, c: any) => acc + (c.totalKps || 0), 0);
            const masteredKps = courses.reduce((acc: number, c: any) => acc + (c.masteredKps || 0), 0);

            // Get last active
            const lastAccessed = courses
              .filter((c: any) => c.lastAccessed)
              .sort((a: any, b: any) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())[0];

            // Fetch weekly activity
            let weeklyActivity = [];
            try {
              const activityData = await api.studentProgress.getWeeklyActivity(child.id);
              weeklyActivity = activityData || [];
            } catch (e) {
              console.log("No weekly activity data");
            }

            return {
              id: child.id,
              name: child.fullName || "Không có tên",
              class: child.studentInfo?.className || courses[0]?.classInfo?.className || "Chưa có lớp",
              gradeLevel: child.studentInfo?.gradeLevel || 10,
              progress: avgProgress,
              courses: courses.length,
              completedCourses,
              inProgressCourses,
              notStartedCourses,
              totalKps,
              masteredKps,
              lastActive: lastAccessed?.lastAccessed ? formatRelativeTime(lastAccessed.lastAccessed) : "Chưa hoạt động",
              weeklyActivity,
              coursesDetail: courses.map((c: any) => ({
                id: c.id,
                title: c.title,
                subject: c.subject,
                progress: c.progress,
                status: c.status,
                masteredKps: c.masteredKps,
                totalKps: c.totalKps,
                lastAccessed: c.lastAccessed,
              })),
            };
          } catch (error) {
            console.error(`Error fetching details for child ${child.id}:`, error);
            return null;
          }
        })
      );

      const validChildren = childrenWithDetails.filter(Boolean) as Child[];
      setChildren(validChildren);
      
      if (validChildren.length > 0 && !selectedChild) {
        setSelectedChild(validChildren[0].id);
      }
    } catch (error) {
      console.error("Error fetching children data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const selectedChildData = children.find(c => c.id === selectedChild);

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutDashboard>
    );
  }

  if (children.length === 0) {
    return (
      <LayoutDashboard>
        <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#181d27] dark:text-white mb-2">
              Chưa có học sinh nào được liên kết
            </h2>
            <p className="text-gray-500 mb-4">
              Vui lòng liên hệ quản trị viên để liên kết tài khoản với học sinh
            </p>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              Tiến độ học tập của con
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Theo dõi chi tiết tiến độ học tập của các con
            </p>
          </div>
        </div>

        {/* Children Selector */}
        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
                  selectedChild === child.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-[#1a202c] border-[#e9eaeb] dark:border-gray-700 hover:border-primary"
                }`}
              >
                <Avatar
                  size="sm"
                  className="rounded-full"
                  fallback={child.name.charAt(0)}
                />
                <span className="font-medium">{child.name}</span>
              </button>
            ))}
          </div>
        )}

        {selectedChildData && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng khóa học</p>
                    <p className="text-2xl font-bold">{selectedChildData.courses}</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Đã hoàn thành</p>
                    <p className="text-2xl font-bold">{selectedChildData.completedCourses}</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Đang học</p>
                    <p className="text-2xl font-bold">{selectedChildData.inProgressCourses}</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tiến độ TB</p>
                    <p className="text-2xl font-bold">{selectedChildData.progress}%</p>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Overview */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Tổng quan tiến độ</h3>
                    <Chip color="primary" variant="flat">
                      Lớp {selectedChildData.class}
                    </Chip>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tiến độ tổng thể</span>
                        <span className="font-semibold">{selectedChildData.progress}%</span>
                      </div>
                      <Progress 
                        value={selectedChildData.progress} 
                        className="h-3"
                        color={selectedChildData.progress >= 70 ? "success" : selectedChildData.progress >= 40 ? "warning" : "danger"}
                      />
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Điểm kiến thức</p>
                          <p className="text-xl font-bold">
                            {selectedChildData.masteredKps}/{selectedChildData.totalKps}
                          </p>
                          <p className="text-xs text-gray-400">
                            {selectedChildData.totalKps > 0 
                              ? Math.round((selectedChildData.masteredKps / selectedChildData.totalKps) * 100)
                              : 0}% đã nắm vững
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Hoạt động gần nhất</p>
                          <p className="text-xl font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                          </p>
                          <p className="text-xs text-gray-400">
                            {selectedChildData.lastActive}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Weekly Activity Chart */}
                {selectedChildData.weeklyActivity && selectedChildData.weeklyActivity.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Hoạt động 7 ngày qua</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={selectedChildData.weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="attempts" fill="#3b82f6" name="Số lần làm bài" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Courses List */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Chi tiết khóa học</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {selectedChildData.coursesDetail.map((course) => (
                        <Link 
                          key={course.id} 
                          href={`/dashboard/courses/${course.id}`}
                          className="block"
                        >
                          <div className="flex items-center gap-4 p-4 rounded-xl border border-[#e9eaeb] dark:border-gray-700 hover:border-primary transition-colors">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              course.status === 'completed' 
                                ? 'bg-green-100 text-green-600' 
                                : course.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <BookMarked className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{course.title}</h4>
                              <p className="text-sm text-gray-500">{course.subject}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                <span>{course.masteredKps}/{course.totalKps} KP</span>
                                {course.lastAccessed && (
                                  <span>Truy cập: {formatRelativeTime(course.lastAccessed)}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-lg font-bold ${
                                course.progress >= 70 ? 'text-green-600' : 
                                course.progress >= 40 ? 'text-blue-600' : 'text-orange-600'
                              }`}>
                                {course.progress}%
                              </span>
                              <ChevronRight className="w-5 h-5 text-gray-400 mt-1 ml-auto" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Thao tác nhanh</h3>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <Link href={`/dashboard/students/${selectedChildData.id}/progress`}>
                      <Button className="w-full bg-primary text-white" startContent={<TrendingUp className="w-4 h-4" />}>
                        Xem chi tiết tiến độ
                      </Button>
                    </Link>
                    <Link href={`/dashboard/students/${selectedChildData.id}`}>
                      <Button className="w-full" variant="bordered" startContent={<Award className="w-4 h-4" />}>
                        Hồ sơ học sinh
                      </Button>
                    </Link>
                  </CardBody>
                </Card>

                {/* Status Summary */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Trạng thái học tập</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Đã hoàn thành</span>
                      </div>
                      <span className="font-semibold">{selectedChildData.completedCourses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm">Đang học</span>
                      </div>
                      <span className="font-semibold">{selectedChildData.inProgressCourses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className="text-sm">Chưa bắt đầu</span>
                      </div>
                      <span className="font-semibold">{selectedChildData.notStartedCourses}</span>
                    </div>
                  </CardBody>
                </Card>

                {/* Tips for Parents */}
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-200">
                          Lờ khuyên cho phụ huynh
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {selectedChildData.progress < 50 
                            ? "Con bạn đang cần thêm sự hỗ trợ. Hãy khuyến khích con dành thờ gian ôn tập mỗi ngày."
                            : selectedChildData.progress < 80
                            ? "Tiến độ của con đang khá tốt! Hãy tiếp tục động viên con duy trì thói quen học tập."
                            : "Xuất sắc! Con bạn đang có tiến độ học tập rất tốt. Hãy khen ngợi con nhé!"}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </LayoutDashboard>
  );
}
