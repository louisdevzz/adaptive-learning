"use client";

import { useState, useEffect, useMemo } from "react";
import { useDisclosure } from "@heroui/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { api } from "@/lib/api";
import { Course } from "@/types/course";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  TrendingUp,
  CheckCircle2,
  Play,
  Loader2,
  GraduationCap,
  Target,
  Flame,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

interface CourseWithProgress extends Course {
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  masteredKps: number;
  totalKps: number;
  lastAccessed?: string;
}

export default function MyCoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
  const [courseStructure, setCourseStructure] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.students.getMyCoursesWithProgress();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = courses.length;
    const inProgress = courses.filter((c) => c.status === "in_progress").length;
    const completed = courses.filter((c) => c.status === "completed").length;
    const notStarted = courses.filter((c) => c.status === "not_started").length;
    const avgProgress = total > 0
      ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / total)
      : 0;

    return { total, inProgress, completed, notStarted, avgProgress };
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    if (activeTab !== "all") {
      filtered = filtered.filter((c) => c.status === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.subject?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [courses, activeTab, searchQuery]);

  // Continue learning courses
  const continueLearning = useMemo(() => {
    return courses
      .filter((c) => c.status === "in_progress")
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 2);
  }, [courses]);

  const handleViewDetails = async (course: CourseWithProgress) => {
    setSelectedCourse(course);
    setLoadingDetail(true);
    onOpen();

    try {
      const structure = await api.courses.getStructure(course.id);
      setCourseStructure(structure);
    } catch (error) {
      console.error("Failed to fetch course details:", error);
      toast.error("Không thể tải chi tiết khóa học");
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang học";
      default:
        return "Chưa bắt đầu";
    }
  };

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181d27] dark:text-white">
              Khóa học của tôi
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Quản lý và theo dõi tiến độ các khóa học của bạn
            </p>
          </div>
          <Link href="/dashboard/courses/explorer">
            <Button color="primary" startContent={<BookOpen className="w-4 h-4" />}>
              Khám phá khóa học
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">Tổng khóa học</p>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#F0F8FF] text-[#0085FF] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">Đang học</p>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">Hoàn thành</p>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">Tiến độ TB</p>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">{stats.avgProgress}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        {continueLearning.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#181d27] dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Tiếp tục học
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {continueLearning.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-row gap-4 p-4">
                    <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                            {course.subject}
                          </span>
                          <h3 className="font-semibold text-lg text-[#181d27] dark:text-white line-clamp-1">
                            {course.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-1">
                        {course.description}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Tiến độ</span>
                          <span className="font-medium">{course.masteredKps}/{course.totalKps} KP</span>
                        </div>
                        <Progress value={course.progress} size="sm" color="primary" />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
                          <Button size="sm" color="primary" className="w-full" startContent={<Play className="w-4 h-4" />}>
                            Tiếp tục
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => handleViewDetails(course)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Courses Section */}
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700">
          <div className="p-4 border-b border-[#e9eaeb] dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-[#181d27] dark:text-white">
                Tất cả khóa học
              </h2>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                  className="w-64"
                  size="sm"
                />
              </div>
            </div>

            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              size="sm"
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 mt-4",
              }}
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center gap-2">
                    <span>Tất cả</span>
                    <Chip size="sm" variant="flat">{stats.total}</Chip>
                  </div>
                }
              />
              <Tab
                key="in_progress"
                title={
                  <div className="flex items-center gap-2">
                    <span>Đang học</span>
                    <Chip size="sm" color="primary" variant="flat">{stats.inProgress}</Chip>
                  </div>
                }
              />
              <Tab
                key="completed"
                title={
                  <div className="flex items-center gap-2">
                    <span>Hoàn thành</span>
                    <Chip size="sm" color="success" variant="flat">{stats.completed}</Chip>
                  </div>
                }
              />
              <Tab
                key="not_started"
                title={
                  <div className="flex items-center gap-2">
                    <span>Chưa bắt đầu</span>
                    <Chip size="sm" variant="flat">{stats.notStarted}</Chip>
                  </div>
                }
              />
            </Tabs>
          </div>

          <div className="p-4">
            {filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {searchQuery || activeTab !== "all"
                    ? "Không tìm thấy khóa học"
                    : "Bạn chưa có khóa học nào"}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {searchQuery || activeTab !== "all"
                    ? "Thử thay đổi bộ lọc hoặc tìm kiếm khác"
                    : "Khám phá các khóa học thú vị để bắt đầu hành trình học tập của bạn"}
                </p>
                {!searchQuery && activeTab === "all" && (
                  <Link href="/dashboard/courses/explorer" className="mt-4">
                    <Button color="primary" startContent={<BookOpen className="w-4 h-4" />}>
                      Khám phá khóa học
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden hover:border-primary/30 transition-all group"
                  >
                    {/* Thumbnail */}
                    <div 
                      className="relative h-40 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden cursor-pointer"
                      onClick={() => handleViewDetails(course)}
                    >
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Chip size="sm" color={getStatusColor(course.status)} variant="flat">
                          {getStatusText(course.status)}
                        </Chip>
                      </div>
                      {course.status === "in_progress" && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-primary/90 text-white text-xs px-2 py-0.5 rounded-full">
                            {course.progress}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {course.subject}
                        </span>
                        <span className="text-xs text-gray-500">
                          Khối {course.gradeLevel}
                        </span>
                      </div>

                      <h3 className="font-semibold text-[#181d27] dark:text-white line-clamp-1 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {course.description}
                      </p>

                      {/* Progress */}
                      {course.status !== "not_started" && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Tiến độ</span>
                            <span className="font-medium">{course.masteredKps}/{course.totalKps} KP</span>
                          </div>
                          <Progress
                            value={course.progress}
                            size="sm"
                            color={course.status === "completed" ? "success" : "primary"}
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/courses/${course.id}`}
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            color="primary"
                            className="w-full"
                            startContent={course.status === "not_started" ? <Play className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                          >
                            {course.status === "not_started" ? "Bắt đầu" : "Tiếp tục"}
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

        {/* Course Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h2 className="text-xl font-bold text-[#181d27]">
                    {selectedCourse?.title}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Course Image */}
                      {selectedCourse?.thumbnailUrl && (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden">
                          <Image
                            src={selectedCourse.thumbnailUrl}
                            alt={selectedCourse.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Course Info */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#F0F8FF] rounded-xl p-4 text-center">
                          <Target className="w-6 h-6 text-[#0085FF] mx-auto mb-2" />
                          <p className="text-lg font-bold">{selectedCourse?.masteredKps}/{selectedCourse?.totalKps}</p>
                          <p className="text-xs text-gray-500">Điểm kiến thức</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                          <GraduationCap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <p className="text-lg font-bold">{selectedCourse?.progress}%</p>
                          <p className="text-xs text-gray-500">Tiến độ</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                          <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-lg font-bold">{selectedCourse?.gradeLevel}</p>
                          <p className="text-xs text-gray-500">Khối lớp</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="font-semibold text-[#181d27] mb-2">Mô tả</h3>
                        <p className="text-gray-600">{selectedCourse?.description}</p>
                      </div>

                      {/* Course Structure */}
                      {courseStructure?.modules && (
                        <div>
                          <h3 className="font-semibold text-[#181d27] mb-3">Nội dung khóa học</h3>
                          <div className="space-y-3">
                            {courseStructure.modules.map((module: any, idx: number) => (
                              <div key={module.id} className="border border-[#e9eaeb] rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                    {idx + 1}
                                  </span>
                                  <h4 className="font-medium">{module.title}</h4>
                                </div>
                                {module.sections?.length > 0 && (
                                  <div className="mt-3 ml-11 space-y-2">
                                    {module.sections.map((section: any) => (
                                      <div key={section.id} className="text-sm text-gray-500 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                        {section.title}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Đóng
                  </Button>
                  <Link href={`/dashboard/courses/${selectedCourse?.id}`}>
                    <Button color="primary" startContent={<ArrowRight className="w-4 h-4" />}>
                      {selectedCourse?.status === "not_started" ? "Bắt đầu học" : "Tiếp tục học"}
                    </Button>
                  </Link>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </LayoutDashboard>
  );
}
