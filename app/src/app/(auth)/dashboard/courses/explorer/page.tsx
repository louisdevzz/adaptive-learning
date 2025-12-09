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
import { Search, Copy, BookOpen, GraduationCap, Tag, Eye } from "lucide-react";
import Image from "next/image";

export default function CoursesExplorerPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
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

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        {/* Header */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#181d27]">Khám phá khóa học</h1>
              <p className="text-sm text-[#535862] mt-1">
                Tìm kiếm và sao chép các khóa học công khai từ cộng đồng
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="w-4 h-4 text-[#bcbcbd]" />}
                className="flex-1 max-w-md"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "bg-[#fdfdfd] border border-[#eef0f3] rounded-[10px] h-10",
                }}
              />
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedGrade === null ? "solid" : "flat"}
                className={selectedGrade === null ? "bg-[#7f56d9] text-white" : ""}
                onPress={() => setSelectedGrade(null)}
              >
                Tất cả khối
              </Button>
              {grades.map((grade) => (
                <Button
                  key={grade}
                  size="sm"
                  variant={selectedGrade === grade ? "solid" : "flat"}
                  className={selectedGrade === grade ? "bg-[#7f56d9] text-white" : ""}
                  onPress={() => setSelectedGrade(grade)}
                >
                  Khối {grade}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedSubject === null ? "solid" : "flat"}
                className={selectedSubject === null ? "bg-[#7f56d9] text-white" : ""}
                onPress={() => setSelectedSubject(null)}
              >
                Tất cả môn
              </Button>
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  size="sm"
                  variant={selectedSubject === subject ? "solid" : "flat"}
                  className={selectedSubject === subject ? "bg-[#7f56d9] text-white" : ""}
                  onPress={() => setSelectedSubject(subject)}
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center w-full py-12">
            <p className="text-[#535862]">Đang tải...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
            <BookOpen className="w-16 h-16 text-[#bcbcbd]" />
            <p className="text-[#535862] text-lg">Không tìm thấy khóa học nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-[#e9eaeb] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewDetails(course)}
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-[#f0f0f0] overflow-hidden">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-[#bcbcbd]" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Public
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <h3 className="font-semibold text-lg text-[#181d27] line-clamp-2 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[#535862] line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-1 text-xs text-[#535862]">
                      <GraduationCap className="w-3 h-3" />
                      <span>Khối {course.gradeLevel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#535862]">
                      <Tag className="w-3 h-3" />
                      <span>{course.subject}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-[#7f56d9] text-white w-full"
                    startContent={<Eye className="w-4 h-4" />}
                    onPress={() => handleViewDetails(course)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
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
                      {/* Course Info */}
                      {selectedCourse && (
                        <div className="flex flex-col gap-4">
                          {selectedCourse.thumbnailUrl && (
                            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-[#f0f0f0]">
                              <Image
                                src={selectedCourse.thumbnailUrl}
                                alt={selectedCourse.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-[#535862]">{selectedCourse.description}</p>
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2 text-sm text-[#535862]">
                              <GraduationCap className="w-4 h-4" />
                              <span>Khối {selectedCourse.gradeLevel}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#535862]">
                              <Tag className="w-4 h-4" />
                              <span>{selectedCourse.subject}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Course Structure */}
                      {courseStructure && (
                        <div className="flex flex-col gap-4">
                          <h3 className="font-semibold text-lg text-[#181d27]">
                            Cấu trúc khóa học
                          </h3>
                          {courseStructure.modules && courseStructure.modules.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              {courseStructure.modules.map((module: any, idx: number) => (
                                <div
                                  key={module.id}
                                  className="border border-[#e9eaeb] rounded-lg p-4"
                                >
                                  <h4 className="font-medium text-[#181d27] mb-2">
                                    {idx + 1}. {module.title}
                                  </h4>
                                  {module.sections && module.sections.length > 0 && (
                                    <div className="flex flex-col gap-2 ml-4">
                                      {module.sections.map((section: any, sIdx: number) => (
                                        <div
                                          key={section.id}
                                          className="text-sm text-[#535862]"
                                        >
                                          • {section.title}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[#535862]">Chưa có nội dung</p>
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
                    className="bg-[#7f56d9] text-white"
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
