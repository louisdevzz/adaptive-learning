"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { 
  BookOpen, Plus, Trash2, CheckCircle2, Search, ChevronDown, Filter, 
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Course } from "@/types/course";

export interface ClassCourse {
  assignmentId: string;
  status: 'active' | 'inactive';
  assignedAt: string;
  assignedBy: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  course: Course;
}

interface CoursesTabProps {
  classId: string;
  courses: ClassCourse[];
  onCoursesChange: () => void;
}

export function CoursesTab({ classId, courses, onCoursesChange }: CoursesTabProps) {
  const [showAssignCourse, setShowAssignCourse] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseFilterGrade, setCourseFilterGrade] = useState<string>('all');
  const [courseFilterSubject, setCourseFilterSubject] = useState<string>('all');
  const [isAssigningCourse, setIsAssigningCourse] = useState(false);
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [isRemovingCourse, setIsRemovingCourse] = useState(false);

  const loadAvailableCourses = async () => {
    try {
      const allCourses = await api.courses.getAll();
      const assignedCourseIds = courses.map(c => c.course.id);
      const available = allCourses.filter((c: Course) => !assignedCourseIds.includes(c.id));
      setAvailableCourses(available);
    } catch (error) {
      console.error('Error loading available courses:', error);
    }
  };

  const uniqueCourseSubjects = useMemo(() => {
    const subjects = availableCourses
      .map(c => c.subject)
      .filter((subject): subject is string => !!subject);
    return Array.from(new Set(subjects)).sort();
  }, [availableCourses]);

  const uniqueCourseGrades = useMemo(() => {
    const grades = availableCourses
      .map(c => c.gradeLevel)
      .filter((grade): grade is number => grade !== undefined);
    return Array.from(new Set(grades)).sort((a, b) => a - b);
  }, [availableCourses]);

  const filteredCourses = useMemo(() => {
    return availableCourses.filter((course) => {
      if (courseSearchQuery.trim()) {
        const query = courseSearchQuery.toLowerCase();
        const matchesSearch = 
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.subject.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (courseFilterGrade !== 'all') {
        if (course.gradeLevel !== parseInt(courseFilterGrade)) {
          return false;
        }
      }

      if (courseFilterSubject !== 'all') {
        if (course.subject !== courseFilterSubject) {
          return false;
        }
      }

      return true;
    });
  }, [availableCourses, courseSearchQuery, courseFilterGrade, courseFilterSubject]);

  useEffect(() => {
    if (showAssignCourse) {
      loadAvailableCourses();
      setCourseSearchQuery('');
      setCourseFilterGrade('all');
      setCourseFilterSubject('all');
      setSelectedCourseId('');
    }
  }, [showAssignCourse]);

  const handleAssignCourse = async () => {
    if (!selectedCourseId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsAssigningCourse(true);
      toastId = toast.loading("Đang gán khóa học cho lớp...");
      
      await api.classes.assignCourse(classId, {
        courseId: selectedCourseId,
        status: 'active'
      });
      
      await onCoursesChange();
      setShowAssignCourse(false);
      setSelectedCourseId('');
      setCourseSearchQuery('');
      setCourseFilterGrade('all');
      setCourseFilterSubject('all');
      toast.success("Gán khóa học thành công", { id: toastId });
    } catch (error: any) {
      console.error('Error assigning course:', error);
      const errorMessage = error.response?.data?.message || "Không thể gán khóa học. Có thể khóa học đã được gán cho lớp này.";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsAssigningCourse(false);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setDeletingCourseId(courseId);
    setIsDeleteCourseModalOpen(true);
  };

  const confirmRemoveCourse = async () => {
    if (!deletingCourseId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsRemovingCourse(true);
      toastId = toast.loading("Đang xóa khóa học khỏi lớp...");
      
      await api.classes.removeCourse(classId, deletingCourseId);
      await onCoursesChange();
      
      setIsDeleteCourseModalOpen(false);
      setDeletingCourseId(null);
      toast.success("Xóa khóa học khỏi lớp thành công", { id: toastId });
    } catch (error: any) {
      console.error('Error removing course:', error);
      const errorMessage = error.response?.data?.message || "Không thể xóa khóa học khỏi lớp.";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsRemovingCourse(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#181d27]">Danh sách khóa học</h2>
          <button
            onClick={() => setShowAssignCourse(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7f56d9] text-white rounded-lg hover:bg-[#6941c6] transition-colors"
          >
            <Plus className="size-4" />
            <span>Gán khóa học</span>
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border border-[#e9eaeb] rounded-lg p-8 text-center">
            <BookOpen className="size-12 mx-auto mb-4 text-[#9ca3af]" />
            <p className="text-[#535862]">Chưa có khóa học nào được gán cho lớp</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e9eaeb] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f9fafb] border-b border-[#e9eaeb]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Tên khóa học</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Môn học</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Khối</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Trạng thái</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Gán bởi</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#181d27]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9eaeb]">
                {courses.map((classCourse) => (
                  <tr key={classCourse.assignmentId} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {classCourse.course.thumbnailUrl && (
                          <img
                            src={classCourse.course.thumbnailUrl}
                            alt={classCourse.course.title}
                            className="w-6 h-6 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#181d27] text-sm truncate max-w-[250px]">
                            {classCourse.course.title}
                          </p>
                          <p className="text-xs text-[#535862] truncate max-w-[250px] mt-0.5">
                            {classCourse.course.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-[#535862]">
                        {classCourse.course.subject}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#e0f2fe]">
                        <GraduationCap className="size-3 text-[#0369a1]" />
                        <span className="text-xs font-medium text-[#0369a1]">
                          Khối {classCourse.course.gradeLevel}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        classCourse.status === 'active'
                          ? 'bg-[#d1fae5] text-[#027a48]'
                          : 'bg-[#fee2e2] text-[#dc2626]'
                      }`}>
                        {classCourse.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-[#535862] truncate block max-w-[150px]">
                        {classCourse.assignedBy?.fullName || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleRemoveCourse(classCourse.course.id)}
                        className="p-1.5 text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-colors"
                        title="Xóa khỏi lớp"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Course Modal */}
      <Modal 
        isOpen={showAssignCourse} 
        onOpenChange={(open) => {
          setShowAssignCourse(open);
          if (!open) {
            setSelectedCourseId('');
            setCourseSearchQuery('');
            setCourseFilterGrade('all');
            setCourseFilterSubject('all');
          }
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="font-semibold text-lg text-[#181d27]">
                  Gán khóa học cho lớp
                </h2>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col gap-3">
                    <Input
                      placeholder="Tìm kiếm theo tên, mô tả, môn học..."
                      size="sm"
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      startContent={<Search className="size-4 text-[#717680]" />}
                      classNames={{
                        input: "text-sm",
                        inputWrapper: "border-[#d5d7da] h-9",
                      }}
                    />
                    <div className="flex gap-2">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            size="sm"
                            className="border-[#d5d7da] text-[#414651] font-semibold"
                            endContent={<ChevronDown className="size-4" />}
                            startContent={<Filter className="size-4" />}
                          >
                            {courseFilterGrade === 'all' ? 'Tất cả khối' : `Khối ${courseFilterGrade}`}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Grade filter"
                          selectedKeys={[courseFilterGrade]}
                          selectionMode="single"
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setCourseFilterGrade(value);
                          }}
                        >
                          {[
                            <DropdownItem key="all" textValue="Tất cả khối">Tất cả khối</DropdownItem>,
                            ...uniqueCourseGrades.map((grade) => (
                              <DropdownItem key={grade.toString()} textValue={`Khối ${grade}`}>
                                Khối {grade}
                              </DropdownItem>
                            ))
                          ]}
                        </DropdownMenu>
                      </Dropdown>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            size="sm"
                            className="border-[#d5d7da] text-[#414651] font-semibold"
                            endContent={<ChevronDown className="size-4" />}
                            startContent={<BookOpen className="size-4" />}
                          >
                            {courseFilterSubject === 'all' ? 'Tất cả môn' : courseFilterSubject}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Subject filter"
                          selectedKeys={[courseFilterSubject]}
                          selectionMode="single"
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setCourseFilterSubject(value);
                          }}
                        >
                          {[
                            <DropdownItem key="all" textValue="Tất cả môn">Tất cả môn</DropdownItem>,
                            ...uniqueCourseSubjects.map((subject) => (
                              <DropdownItem key={subject} textValue={subject}>
                                {subject}
                              </DropdownItem>
                            ))
                          ]}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>

                  {/* Course List */}
                  <div className="border border-[#e9eaeb] rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                    {filteredCourses.length === 0 ? (
                      <div className="p-8 text-center">
                        <BookOpen className="size-12 mx-auto mb-4 text-[#9ca3af]" />
                        <p className="text-sm text-[#535862]">
                          {courseSearchQuery || courseFilterGrade !== 'all' || courseFilterSubject !== 'all'
                            ? 'Không tìm thấy khóa học phù hợp'
                            : 'Không có khóa học nào có sẵn'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#e9eaeb]">
                        {filteredCourses.map((course) => (
                          <div
                            key={course.id}
                            onClick={() => setSelectedCourseId(course.id)}
                            className={`p-4 cursor-pointer transition-all duration-200 ${
                              selectedCourseId === course.id
                                ? 'bg-[#f3f0ff] border-l-4 border-l-[#7f56d9] shadow-sm'
                                : 'hover:bg-[#f9fafb] border-l-4 border-l-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {course.thumbnailUrl && (
                                <img
                                  src={course.thumbnailUrl}
                                  alt={course.title}
                                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-[#181d27] text-sm truncate">
                                    {course.title}
                                  </p>
                                  {selectedCourseId === course.id && (
                                    <CheckCircle2 className="size-4 text-[#7f56d9] shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-[#535862] line-clamp-1 mb-2">
                                  {course.description}
                                </p>
                                <div className="flex flex-wrap gap-2 items-center">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#e0f2fe]">
                                    <GraduationCap className="size-3 text-[#0369a1]" />
                                    <span className="text-xs font-medium text-[#0369a1]">
                                      Khối {course.gradeLevel}
                                    </span>
                                  </div>
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#f0f0f0]">
                                    <span className="text-xs font-medium text-[#414651]">
                                      {course.subject}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-[#414651]"
                >
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    await handleAssignCourse();
                    if (!isAssigningCourse) {
                      onClose();
                    }
                  }}
                  isDisabled={!selectedCourseId || isAssigningCourse}
                  isLoading={isAssigningCourse}
                  className="font-semibold"
                >
                  {isAssigningCourse ? 'Đang gán...' : 'Gán khóa học'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Course Confirmation Modal */}
      <Modal 
        isOpen={isDeleteCourseModalOpen} 
        onOpenChange={(open) => {
          setIsDeleteCourseModalOpen(open);
          if (!open) {
            setDeletingCourseId(null);
          }
        }}
        size="md"
      >
        <ModalContent>
          {(onClose) => {
            const courseToDelete = courses.find(c => c.course.id === deletingCourseId);
            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="font-semibold text-lg text-[#181d27]">
                    Xác nhận xóa khóa học
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-[#414651]">
                    Bạn có chắc chắn muốn xóa khóa học <span className="font-semibold text-[#181d27]">{courseToDelete?.course.title}</span> khỏi lớp này? Hành động này không thể hoàn tác.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    className="text-[#414651]"
                    isDisabled={isRemovingCourse}
                  >
                    Hủy
                  </Button>
                  <Button
                    color="danger"
                    onPress={async () => {
                      await confirmRemoveCourse();
                      if (!isRemovingCourse) {
                        onClose();
                      }
                    }}
                    isLoading={isRemovingCourse}
                    className="font-semibold"
                  >
                    {isRemovingCourse ? 'Đang xóa...' : 'Xóa khóa học'}
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
}

