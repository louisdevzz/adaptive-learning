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
import { StudentHeader, StudentMetrics, StudentTable, StudentModal } from "@/components/dashboards/admin/management/student";
import { Student, StudentFormData, StudentStats } from "@/types/student";
import { toast } from "sonner";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<StudentFormData>({
    email: "",
    password: "",
    fullName: "",
    studentCode: "",
    gradeLevel: 10,
    schoolName: "",
    dateOfBirth: "",
    gender: "male",
    avatarUrl: "",
  });

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentInfo?.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.students.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Lỗi khi tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingStudent(null);
    // Generate Unix Timestamp (Seconds) as student code
    const unixTimestamp = Math.floor(Date.now() / 1000);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      studentCode: unixTimestamp.toString(),
      gradeLevel: 10,
      schoolName: "",
      dateOfBirth: "",
      gender: "male",
      avatarUrl: "",
    });
    onOpen();
  };

  const handleEdit = (student: Student) => {
    setIsEditMode(true);
    setEditingStudent(student);
    setFormData({
      email: student.email,
      password: "",
      fullName: student.fullName,
      studentCode: student.studentInfo?.studentCode || "",
      gradeLevel: student.studentInfo?.gradeLevel || 10,
      schoolName: student.studentInfo?.schoolName || "",
      dateOfBirth: student.studentInfo?.dateOfBirth || "",
      gender: student.studentInfo?.gender || "male",
      avatarUrl: student.avatarUrl || "",
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingStudentId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingStudentId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa học sinh...");
      await api.students.delete(deletingStudentId);
      await fetchStudents();
      toast.success("Xóa học sinh thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingStudentId(null);
    } catch (error: any) {
      console.error("Error deleting student:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa học sinh";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    let toastId: string | number | undefined;
    try {
      setIsSubmitting(true);
      if (isEditMode && editingStudent) {
        toastId = toast.loading("Đang cập nhật học sinh...");
        await api.students.update(editingStudent.id, {
          email: formData.email,
          password: formData.password || undefined,
          fullName: formData.fullName,
          studentCode: formData.studentCode,
          gradeLevel: formData.gradeLevel,
          schoolName: formData.schoolName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          avatarUrl: formData.avatarUrl || undefined,
        });
        toast.success("Cập nhật học sinh thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo học sinh mới...");
        await api.students.create({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          studentCode: formData.studentCode,
          gradeLevel: formData.gradeLevel,
          schoolName: formData.schoolName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          avatarUrl: formData.avatarUrl || undefined,
        });
        toast.success("Tạo học sinh thành công", { id: toastId });
      }
      await fetchStudents();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving student:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu học sinh";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(paginatedStudents.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((studentId) => studentId !== id) : [...prev, id]
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats: StudentStats = {
    total: students.length,
    byGrade: students.reduce((acc, student) => {
      const grade = student.studentInfo?.gradeLevel || 0;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    byGender: {
      male: students.filter((s) => s.studentInfo?.gender === "male").length,
      female: students.filter((s) => s.studentInfo?.gender === "female").length,
      other: students.filter((s) => s.studentInfo?.gender === "other").length,
    },
  };

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <StudentHeader onCreate={handleCreate} />

        <StudentMetrics stats={stats} />

        <StudentTable
          students={paginatedStudents}
          loading={loading}
          selectedStudents={selectedStudents}
          searchQuery={searchQuery}
          onSelectAll={toggleSelectAll}
          onSelectStudent={toggleSelectStudent}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearchChange={setSearchQuery}
          selectedCount={selectedStudents.length}
          onClearSelection={() => setSelectedStudents([])}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <StudentModal
          isOpen={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsSubmitting(false);
              onOpenChange();
            }
          }}
          isEditMode={isEditMode}
          editingStudent={editingStudent}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={isDeleteModalOpen} 
          onOpenChange={onDeleteModalOpenChange}
          size="md"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="font-semibold text-lg text-[#181d27]">
                    Xác nhận xóa
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-[#414651]">
                    Bạn có chắc chắn muốn xóa học sinh này? Hành động này không thể hoàn tác.
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
                    color="danger"
                    onPress={confirmDelete}
                    isLoading={isDeleting}
                    className="font-semibold"
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

