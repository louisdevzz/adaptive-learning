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
} from "@heroui/modal";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { api } from "@/lib/api";
import { Course } from "@/types/course";
import { toast } from "sonner";
import {
  BookOpen,
  FileText,
  Route,
  CheckSquare,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  MoreVertical,
  BarChart3,
  TrendingDown,
  Clock,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type MaterialType = "course" | "quiz" | "page" | "learning-path";
type MaterialStatus = "not_started" | "in_progress" | "completed";

interface Material {
  id: string;
  type: MaterialType;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  progress?: number;
  status: MaterialStatus;
  tags?: string[];
  badge?: string;
  points?: number;
  passingPoints?: number;
  chapters?: number;
  materials?: number;
  paths?: number;
  questions?: number;
  urgent?: boolean;
  certified?: boolean;
}

interface CourseWithProgress extends Course {
  progress?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
  masteredKps?: number;
  totalKps?: number;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MaterialStatus | "all">("all");
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
  const [courseStructure, setCourseStructure] = useState<any>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const router = useRouter();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onOpenChange: onDetailOpenChange } = useDisclosure();

  // Convert courses to materials format
  const materials = useMemo<Material[]>(() => {
    return courses.map((course) => {
      const progress = course.progress ?? 0;
      const status = (course.status ?? "not_started") as MaterialStatus;

      return {
        id: course.id,
        type: "course" as MaterialType,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        progress,
        status,
        tags: [course.subject, "Không khẩn cấp"],
        badge: course.totalKps ? `${course.totalKps} Điểm kiến thức` : undefined,
        materials: course.totalKps,
      };
    });
  }, [courses]);

  // Get in-progress materials for "Continue Learning" section
  // Only show courses that are actually in progress (not completed, not not_started)
  const continueLearningMaterials = useMemo(() => {
    return materials.filter((m) => m.status === "in_progress").slice(0, 2);
  }, [materials]);

  // Filter materials based on search and status
  const filteredMaterials = useMemo(() => {
    let filtered = materials;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [materials, statusFilter, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.students.getMyCoursesWithProgress();
      setCourses(data);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (course: Course) => {
    setSelectedCourse(course);
    setLoadingDetail(true);
    setLoadingAnalytics(true);
    onDetailOpen();

    try {
      const [structure, analytics] = await Promise.all([
        api.courses.getStructure(course.id),
        api.courseAnalytics.getCourseAnalytics(course.id).catch(() => null), // Analytics may not be available for all courses
      ]);
      setCourseStructure(structure);
      setCourseAnalytics(analytics);
    } catch (error: any) {
      console.error("Failed to fetch course details:", error);
      toast.error("Không thể tải chi tiết khóa học");
    } finally {
      setLoadingDetail(false);
      setLoadingAnalytics(false);
    }
  };

  const handleStartCourse = (courseId: string) => {
    router.push(`/dashboard/courses/${courseId}`);
  };

  const getMaterialIcon = (type: MaterialType) => {
    switch (type) {
      case "course":
        return BookOpen;
      case "quiz":
        return CheckSquare;
      case "page":
        return FileText;
      case "learning-path":
        return Route;
      default:
        return BookOpen;
    }
  };

  const getMaterialTypeLabel = (type: MaterialType) => {
    switch (type) {
      case "course":
        return "Khóa học";
      case "quiz":
        return "Bài kiểm tra";
      case "page":
        return "Trang";
      case "learning-path":
        return "Lộ trình học";
      default:
        return "Tài liệu";
    }
  };

  const renderMaterialCard = (material: Material, isContinueLearning = false) => {
    const Icon = getMaterialIcon(material.type);
    const isHorizontal = isContinueLearning;

    return (
      <div
        key={material.id}
        className={`bg-white border border-[#e9eaeb] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${
          isHorizontal ? "flex flex-row" : "flex flex-col"
        }`}
        onClick={() => {
          if (material.type === "course") {
            const course = courses.find((c) => c.id === material.id);
            if (course) handleViewDetails(course as CourseWithProgress);
          }
        }}
      >
        {/* Thumbnail/Illustration */}
        <div
          className={`relative ${
            isHorizontal
              ? "w-48 h-full min-h-[200px]"
              : "w-full h-48"
          } bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden`}
        >
          {material.thumbnailUrl ? (
            <Image
              src={material.thumbnailUrl}
              alt={material.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-16 h-16 text-[#7f56d9] opacity-30" />
            </div>
          )}
          {material.badge && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-[#181d27] text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                {material.badge}
              </span>
            </div>
          )}
          {material.status === "in_progress" && material.progress !== undefined && (
            <div className="absolute top-3 right-3">
              <span className="bg-[#7f56d9]/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                {material.progress}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isHorizontal ? "flex-1 p-6" : "p-4"} gap-3`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-[#7f56d9]" />
              <span className="text-xs font-medium text-[#7f56d9]">
                {getMaterialTypeLabel(material.type)}
              </span>
            </div>
            {!isHorizontal && (
              <MoreVertical className="w-4 h-4 text-[#535862] opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>

          <div className="flex-1">
            <h3
              className={`font-semibold text-[#181d27] mb-1 ${
                isHorizontal ? "text-lg" : "text-base"
              } line-clamp-2`}
            >
              {material.title}
            </h3>
            {material.description && !isHorizontal && (
              <p className="text-sm text-[#535862] line-clamp-2">
                {material.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {material.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tag === "Urgent" || tag === "Khẩn cấp"
                      ? "bg-red-100 text-red-700"
                      : tag === "Certified" || tag === "Đã chứng nhận"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-[#535862]"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Progress or Points */}
          {material.progress !== undefined && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#535862]">
                <span>{material.progress}% Hoàn thành</span>
                {material.passingPoints && (
                  <span>Điểm đạt {material.passingPoints} điểm</span>
                )}
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10b981] transition-all duration-300"
                  style={{ width: `${material.progress}%` }}
                />
              </div>
            </div>
          )}

          {material.points !== undefined && (
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-[#181d27]">
                {material.points}pts
              </div>
              {material.passingPoints && (
                <div className="text-xs text-[#535862]">
                  Điểm đạt {material.passingPoints} điểm
                </div>
              )}
            </div>
          )}

          {material.status === "not_started" && !material.points && (
            <div className="text-sm text-[#535862]">Chưa bắt đầu</div>
          )}

          {/* Action Button */}
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              className={`${
                material.status === "not_started"
                  ? "bg-[#7f56d9] text-white"
                  : "bg-[#7f56d9] text-white"
              } w-full`}
              onPress={() => {
                if (material.type === "course") {
                  const course = courses.find((c) => c.id === material.id);
                  if (course) {
                    // Always navigate to course detail page when clicking button
                    handleStartCourse(course.id);
                  }
                }
              }}
            >
              {material.status === "not_started"
                ? "Bắt đầu"
                : material.status === "in_progress"
                ? "Tiếp tục"
                : "Tiếp tục"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-8 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        {/* Header */}
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-2xl font-bold text-[#181d27]">Khóa học của tôi</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center w-full py-12">
            <p className="text-[#535862]">Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Continue Learning Section */}
            {continueLearningMaterials.length > 0 && (
              <div className="flex flex-col gap-4 w-full">
                <h2 className="text-xl font-semibold text-[#181d27]">
                  Tiếp tục học
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {continueLearningMaterials.map((material) => (
                    <div key={material.id}>
                      {renderMaterialCard(material, true)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Materials Section */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-[#181d27]">
                    Tất cả tài liệu
                  </h2>
                  <span className="text-sm text-[#535862]">
                    {filteredMaterials.length}
                  </span>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-wrap items-center gap-3 w-full">
                {/* Status Filters */}
                <div className="flex items-center gap-2">
                  {(["all", "not_started", "in_progress", "completed"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          statusFilter === status
                            ? "bg-[#7f56d9] text-white"
                            : "bg-gray-100 text-[#535862] hover:bg-gray-200"
                        }`}
                      >
                        {status === "all"
                          ? "Tất cả"
                          : status === "not_started"
                          ? "Chưa bắt đầu"
                          : status === "in_progress"
                          ? "Đang học"
                          : "Hoàn thành"}
                      </button>
                    )
                  )}
                </div>

                {/* Search */}
                <div className="flex-1 min-w-[200px] max-w-md">
                  <Input
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<Search className="w-4 h-4 text-[#535862]" />}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "bg-white border border-[#e9eaeb]",
                    }}
                  />
                </div>

                {/* Filter Button */}
                <Button
                  variant="bordered"
                  startContent={<Filter className="w-4 h-4" />}
                  className="border-[#e9eaeb]"
                >
                  Thêm bộ lọc
                </Button>

                {/* Sort Button */}
                <Button
                  variant="bordered"
                  startContent={<ArrowUpDown className="w-4 h-4" />}
                  className="border-[#e9eaeb]"
                >
                  Sắp xếp
                </Button>
              </div>

              {/* Materials Grid */}
              {filteredMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
                  <BookOpen className="w-16 h-16 text-[#bcbcbd]" />
                  <p className="text-[#535862] text-lg">
                    {searchQuery || statusFilter !== "all"
                      ? "Không tìm thấy tài liệu"
                      : "Bạn chưa có khóa học nào"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                  {filteredMaterials.map((material) =>
                    renderMaterialCard(material, false)
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={isDetailOpen}
          onOpenChange={onDetailOpenChange}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold text-[#181d27]">
                    {selectedCourse?.title}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-[#535862]">Đang tải chi tiết...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {selectedCourse?.thumbnailUrl && (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden">
                          <Image
                            src={selectedCourse.thumbnailUrl}
                            alt={selectedCourse.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="font-semibold text-lg text-[#181d27] mb-2">
                            Mô tả
                          </h3>
                          <p className="text-sm text-[#535862]">
                            {selectedCourse?.description}
                          </p>
                        </div>

                        {/* Course Analytics */}
                        {courseAnalytics && (
                          <div>
                            <h3 className="font-semibold text-lg text-[#181d27] mb-3 flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-[#7f56d9]" />
                              Phân tích khóa học
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Completion Rate */}
                              <div className="border border-[#e9eaeb] rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckSquare className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">
                                    Tỷ lệ hoàn thành
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-green-700">
                                  {courseAnalytics.completionRate}%
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  Học sinh hoàn thành khóa học
                                </p>
                              </div>

                              {/* Average Section Time */}
                              <div className="border border-[#e9eaeb] rounded-lg p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-700">
                                    Thời gian trung bình
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-blue-700">
                                  {courseAnalytics.averageSectionTime} phút
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Mỗi section
                                </p>
                              </div>
                            </div>

                            {/* High Failure KPs */}
                            {courseAnalytics.highFailureKps &&
                              courseAnalytics.highFailureKps.length > 0 && (
                                <div className="mt-4 border border-[#e9eaeb] rounded-lg p-4 bg-red-50/50">
                                  <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-700">
                                      Điểm kiến thức có tỷ lệ sai cao
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {courseAnalytics.highFailureKps
                                      .slice(0, 5)
                                      .map((kp: any) => (
                                        <div
                                          key={kp.kpId}
                                          className="flex items-center justify-between text-sm bg-white rounded p-2"
                                        >
                                          <span className="text-[#535862]">
                                            {kp.kpTitle}
                                          </span>
                                          <span className="font-semibold text-red-600">
                                            {kp.errorRate}% sai
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                            {/* Most Difficult Modules */}
                            {courseAnalytics.mostDifficultModules &&
                              courseAnalytics.mostDifficultModules.length > 0 && (
                                <div className="mt-4 border border-[#e9eaeb] rounded-lg p-4 bg-orange-50/50">
                                  <div className="flex items-center gap-2 mb-3">
                                    <TrendingDown className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-700">
                                      Module khó nhất
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {courseAnalytics.mostDifficultModules.map(
                                      (module: any) => (
                                        <div
                                          key={module.moduleId}
                                          className="flex items-center justify-between text-sm bg-white rounded p-2"
                                        >
                                          <span className="text-[#535862]">
                                            {module.moduleTitle}
                                          </span>
                                          <span className="font-semibold text-orange-600">
                                            {module.averageMastery}% nắm vững
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}

                        {loadingAnalytics && (
                          <div className="flex items-center justify-center py-4">
                            <p className="text-sm text-[#535862]">Đang tải phân tích...</p>
                          </div>
                        )}

                        {courseStructure && (
                          <div>
                            <h3 className="font-semibold text-lg text-[#181d27] mb-3">
                              Cấu trúc khóa học
                            </h3>
                            <div className="flex flex-col gap-4">
                              {courseStructure.modules?.map(
                                (module: any, moduleIndex: number) => (
                                  <div
                                    key={module.id}
                                    className="border border-[#e9eaeb] rounded-lg p-4"
                                  >
                                    <h4 className="font-medium text-[#181d27] mb-2">
                                      {moduleIndex + 1}. {module.title}
                                    </h4>
                                    {module.description && (
                                      <p className="text-sm text-[#535862] mb-3">
                                        {module.description}
                                      </p>
                                    )}
                                    {module.sections &&
                                      module.sections.length > 0 && (
                                        <div className="flex flex-col gap-2 ml-4">
                                          {module.sections.map(
                                            (section: any) => (
                                              <div
                                                key={section.id}
                                                className="text-sm text-[#535862]"
                                              >
                                                • {section.title}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="default"
                    variant="light"
                    onPress={onClose}
                  >
                    Đóng
                  </Button>
                  {selectedCourse && (
                    <Button
                      className="bg-[#7f56d9] text-white"
                      endContent={<ArrowRight className="w-4 h-4" />}
                      onPress={() => {
                        onClose();
                        handleStartCourse(selectedCourse.id);
                      }}
                    >
                      Bắt đầu học
                    </Button>
                  )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </LayoutDashboard>
  );
}