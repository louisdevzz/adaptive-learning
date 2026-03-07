"use client";

import { useState, useEffect } from "react";
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
  Search, 
  Copy, 
  BookOpen, 
  GraduationCap, 
  Tag, 
  Eye,
  Grid3X3,
  List,
  Layers,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Globe
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#717680] dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ 
  course, 
  onViewDetails 
}: { 
  course: Course; 
  onViewDetails: (course: Course) => void;
}) {
  return (
    <div 
      className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer"
      onClick={() => onViewDetails(course)}
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-primary/10 to-blue-500/10">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-14 h-14 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400">
            <Globe className="w-3 h-3" />
            Công khai
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-[#181d27] dark:text-white group-hover:text-primary transition-colors line-clamp-1">
          {course.title}
        </h3>
        <p className="text-sm text-[#717680] dark:text-gray-400 mt-2 line-clamp-2">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-4 text-xs text-[#717680] dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Khối {course.gradeLevel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>{course.subject}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e9eaeb] dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-xs text-[#717680] dark:text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Vừa cập nhật</span>
          </div>
          <span className="text-sm text-primary font-medium group-hover:underline flex items-center gap-1">
            Xem chi tiết
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// Course List Row Component
function CourseListRow({ 
  course, 
  onViewDetails 
}: { 
  course: Course; 
  onViewDetails: (course: Course) => void;
}) {
  return (
    <tr 
      className="hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors border-b border-[#e9eaeb] dark:border-gray-700 last:border-0 cursor-pointer"
      onClick={() => onViewDetails(course)}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center shrink-0">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-[#181d27] dark:text-white hover:text-primary transition-colors">
              {course.title}
            </p>
            <p className="text-xs text-[#717680] dark:text-gray-400">
              {course.subject} • Khối {course.gradeLevel}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm text-[#535862] dark:text-gray-400 line-clamp-1 max-w-[300px]">
          {course.description}
        </p>
      </td>
      <td className="py-4 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Globe className="w-3 h-3" />
          Công khai
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1.5 text-sm text-[#535862] dark:text-gray-400">
          <GraduationCap className="w-4 h-4" />
          <span>Khối {course.gradeLevel}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1.5 text-sm text-[#535862] dark:text-gray-400">
          <Tag className="w-4 h-4" />
          <span>{course.subject}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <Button
          variant="light"
          size="sm"
          className="text-primary hover:bg-primary/10"
          onPress={() => onViewDetails(course)}
        >
          <Eye className="w-4 h-4 mr-1" />
          Xem
        </Button>
      </td>
    </tr>
  );
}

export default function CoursesExplorerPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Detail modal
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onOpenChange: onDetailOpenChange } = useDisclosure();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStructure, setCourseStructure] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cloning, setCloning] = useState(false);

  // Fetch public courses
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses
  useEffect(() => {
    let filtered = courses;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGrade) {
      filtered = filtered.filter((course) => course.gradeLevel === selectedGrade);
    }

    if (selectedSubject) {
      filtered = filtered.filter((course) => course.subject === selectedSubject);
    }

    setFilteredCourses(filtered);
  }, [searchQuery, selectedGrade, selectedSubject, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.explorer.getPublicCourses();
      setCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Lỗi khi tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (course: Course) => {
    setSelectedCourse(course);
    setLoadingDetail(true);
    onDetailOpen();
    
    try {
      const structure = await api.explorer.getPublicCourseDetails(course.id);
      setCourseStructure(structure);
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Lỗi khi tải chi tiết khóa học");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleClone = async () => {
    if (!selectedCourse) return;

    let toastId: string | number | undefined;
    try {
      setCloning(true);
      toastId = toast.loading("Đang sao chép khóa học...");
      await api.explorer.cloneCourse(selectedCourse.id);
      toast.success("Sao chép khóa học thành công! Bạn có thể chỉnh sửa trong phần Quản lý khóa học.", { id: toastId });
      onDetailOpenChange();
    } catch (error: any) {
      console.error("Error cloning course:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi sao chép khóa học";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setCloning(false);
    }
  };

  // Get unique subjects and grades
  const subjects = Array.from(new Set(courses.map((c) => c.subject))).sort();
  const grades = Array.from(new Set(courses.map((c) => c.gradeLevel))).sort((a, b) => a - b);

  // Stats
  const stats = {
    total: courses.length,
    subjects: subjects.length,
    grades: grades.length,
  };

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">
              Khám phá khóa học
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Tìm kiếm và sao chép các khóa học công khai từ cộng đồng
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Tổng khóa học"
            value={stats.total.toString()}
            subtitle="Khóa học công khai"
            icon={<BookOpen className="w-6 h-6 text-primary" />}
            color="bg-primary/10"
          />
          <StatCard
            title="Môn học"
            value={stats.subjects.toString()}
            subtitle="Đa dạng lĩnh vực"
            icon={<Tag className="w-6 h-6 text-[#0085FF]" />}
            color="bg-[#F0F8FF]"
          />
          <StatCard
            title="Khối lớp"
            value={stats.grades.toString()}
            subtitle="Từ cơ bản đến nâng cao"
            icon={<GraduationCap className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md w-full">
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="w-4 h-4 text-[#717680]" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "bg-white dark:bg-[#1a202c] border border-[#e9eaeb] dark:border-gray-700 rounded-xl h-11",
                }}
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white dark:bg-[#1a202c] border border-[#e9eaeb] dark:border-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-primary text-white" 
                    : "text-[#717680] hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-primary text-white" 
                    : "text-[#717680] hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Badges */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGrade(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGrade === null
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-[#1a202c] text-[#535862] border border-[#e9eaeb] dark:border-gray-700 hover:border-primary/50"
              }`}
            >
              Tất cả khối
            </button>
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGrade === grade
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-[#1a202c] text-[#535862] border border-[#e9eaeb] dark:border-gray-700 hover:border-primary/50"
                }`}
              >
                Khối {grade}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSubject === null
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-[#1a202c] text-[#535862] border border-[#e9eaeb] dark:border-gray-700 hover:border-primary/50"
              }`}
            >
              Tất cả môn
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSubject === subject
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-[#1a202c] text-[#535862] border border-[#e9eaeb] dark:border-gray-700 hover:border-primary/50"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Display */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-[#535862] text-lg">Không tìm thấy khóa học nào</p>
            <p className="text-[#717680] text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f9fafb] dark:bg-gray-800/50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase tracking-wider">
                    Khóa học
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase tracking-wider">
                    Khối
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-[#717680] dark:text-gray-400 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <CourseListRow 
                    key={course.id} 
                    course={course} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </tbody>
            </table>
          </div>
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
                  <h2 className="text-xl font-semibold text-[#181d27] dark:text-white">
                    {selectedCourse?.title}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {/* Course Info */}
                      {selectedCourse && (
                        <div className="flex flex-col gap-4">
                          {selectedCourse.thumbnailUrl && (
                            <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/10">
                              <img
                                src={selectedCourse.thumbnailUrl}
                                alt={selectedCourse.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-[#535862] dark:text-gray-300 leading-relaxed">{selectedCourse.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400">
                              <Globe className="w-3 h-3" />
                              Công khai
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F0F8FF] text-[#0066CC] border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                              <GraduationCap className="w-3 h-3" />
                              Khối {selectedCourse.gradeLevel}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                              <Tag className="w-3 h-3" />
                              {selectedCourse.subject}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Course Structure */}
                      {courseStructure && (
                        <div className="flex flex-col gap-4">
                          <h3 className="font-semibold text-lg text-[#181d27] dark:text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Cấu trúc khóa học
                          </h3>
                          {courseStructure.modules && courseStructure.modules.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              {courseStructure.modules.map((module: any, idx: number) => (
                                <div
                                  key={module.id}
                                  className="bg-[#f9fafb] dark:bg-gray-800/50 border border-[#e9eaeb] dark:border-gray-700 rounded-xl p-4"
                                >
                                  <h4 className="font-medium text-[#181d27] dark:text-white mb-2 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                                      {idx + 1}
                                    </span>
                                    {module.title}
                                  </h4>
                                  {module.sections && module.sections.length > 0 && (
                                    <div className="flex flex-col gap-2 ml-8">
                                      {module.sections.map((section: any, sIdx: number) => (
                                        <div
                                          key={section.id}
                                          className="text-sm text-[#535862] dark:text-gray-400 flex items-center gap-2"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 text-primary/50" />
                                          {section.title}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl">
                              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-[#535862] dark:text-gray-400">Chưa có nội dung chi tiết</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    isDisabled={cloning}
                  >
                    Đóng
                  </Button>
                  <Button
                    className="bg-primary text-white"
                    startContent={<Copy className="w-4 h-4" />}
                    onPress={handleClone}
                    isLoading={cloning}
                  >
                    Sao chép khóa học
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </LayoutDashboard>
  );
}
