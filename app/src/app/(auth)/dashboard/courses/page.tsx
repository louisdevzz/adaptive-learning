"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@heroui/react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { api } from "@/lib/api";
import {
  CourseHeader,
  CourseTable,
} from "@/components/dashboards/admin/management/course";
import { Course } from "@/types/course";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.gradeLevel.toString().includes(searchQuery) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getAll();

      // Fetch module counts for each course
      const coursesWithModuleCounts = await Promise.all(
        data.map(async (course: Course) => {
          try {
            const modules = await api.courses.getAllModules(course.id);
            return {
              ...course,
              moduleCount: Array.isArray(modules) ? modules.length : 0,
            };
          } catch (error) {
            console.error(
              `Error fetching modules for course ${course.id}:`,
              error
            );
            return {
              ...course,
              moduleCount: 0,
            };
          }
        })
      );

      setCourses(coursesWithModuleCounts);
      setFilteredCourses(coursesWithModuleCounts);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Lỗi khi tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };
  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    router.push("/dashboard/courses/create");
  };

  const handleDelete = (id: string) => {
    setDeletingCourseId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingCourseId) return;

    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa môn học...");
      await api.courses.delete(deletingCourseId);
      await fetchCourses();
      toast.success("Xóa môn học thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingCourseId(null);
    } catch (error: any) {
      console.error("Error deleting course:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xóa môn học";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(paginatedCourses.map((c) => c.id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleSelectCourse = (id: string) => {
    if (selectedCourses.includes(id)) {
      setSelectedCourses(
        selectedCourses.filter((selectedId) => selectedId !== id)
      );
    } else {
      setSelectedCourses([...selectedCourses, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedCourses([]);
  };

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 w-full">
        <CourseHeader onCreate={handleCreate} />
        <CourseTable
          courses={paginatedCourses}
          loading={loading}
          searchQuery={searchQuery}
          onDelete={handleDelete}
          onSearchChange={setSearchQuery}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onOpenChange={onDeleteModalOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="font-semibold text-lg text-[#181d27]">
                    Xác nhận xóa môn học
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-[#535862]">
                    Bạn có chắc chắn muốn xóa môn học này? Hành động này không
                    thể hoàn tác.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    className="text-[#414651]"
                    isDisabled={isDeleting}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="bg-[#b42318] text-white font-semibold"
                    onPress={confirmDelete}
                    isDisabled={isDeleting}
                    isLoading={isDeleting}
                  >
                    Xóa
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
