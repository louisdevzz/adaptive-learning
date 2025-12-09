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
import { TeacherHeader, TeacherMetrics, TeacherFilters, TeacherTable, TeacherPagination, TeacherModal } from "@/components/dashboards/admin/management/teacher";
import { Teacher, TeacherFormData, TeacherStats } from "@/types/teacher";
import { toast } from "sonner";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<TeacherFormData>({
    email: "",
    password: "",
    fullName: "",
    specialization: [],
    experienceYears: 0,
    certifications: [],
    phone: "",
    bio: "",
    avatarUrl: "",
  });

  // Fetch teachers
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Filter teachers based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(
        (teacher) =>
          teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await api.teachers.getAll();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingTeacher(null);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      specialization: [],
      experienceYears: 0,
      certifications: [],
      phone: "",
      bio: "",
      avatarUrl: "",
    });
    onOpen();
  };

  const handleEdit = (teacher: Teacher) => {
    setIsEditMode(true);
    setEditingTeacher(teacher);
    setFormData({
      email: teacher.email,
      password: "",
      fullName: teacher.fullName,
      specialization: teacher.teacherInfo?.specialization || [],
      experienceYears: teacher.teacherInfo?.experienceYears || 0,
      certifications: teacher.teacherInfo?.certifications || [],
      phone: teacher.teacherInfo?.phone || "",
      bio: teacher.teacherInfo?.bio || "",
      avatarUrl: teacher.avatarUrl || "",
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingTeacherId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingTeacherId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa giáo viên...");
      await api.teachers.delete(deletingTeacherId);
      await fetchTeachers();
      toast.success("Xóa giáo viên thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingTeacherId(null);
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa giáo viên";
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
      if (isEditMode && editingTeacher) {
        toastId = toast.loading("Đang cập nhật giáo viên...");
        await api.teachers.update(editingTeacher.id, {
          fullName: formData.fullName,
          specialization: formData.specialization,
          experienceYears: formData.experienceYears,
          certifications: formData.certifications,
          phone: formData.phone,
          bio: formData.bio || undefined,
          avatarUrl: formData.avatarUrl || undefined,
        });
        toast.success("Cập nhật giáo viên thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo giáo viên mới...");
        await api.teachers.create({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          specialization: formData.specialization,
          experienceYears: formData.experienceYears,
          certifications: formData.certifications,
          phone: formData.phone,
          bio: formData.bio || undefined,
          avatarUrl: formData.avatarUrl || undefined,
        });
        toast.success("Tạo giáo viên thành công", { id: toastId });
      }
      await fetchTeachers();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving teacher:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu giáo viên";
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
      setSelectedTeachers(paginatedTeachers.map((teacher) => teacher.id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const toggleSelectTeacher = (id: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((teacherId) => teacherId !== id) : [...prev, id]
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats: TeacherStats = {
    total: teachers.length,
    experienced: teachers.filter((t) => (t.teacherInfo?.experienceYears || 0) >= 5).length,
    certified: teachers.filter((t) => (t.teacherInfo?.certifications?.length || 0) > 0).length,
    active: teachers.length, // Assuming all teachers are active for now
  };

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <TeacherHeader onCreate={handleCreate} />

        <TeacherMetrics stats={stats} />

        <TeacherFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedTeachers.length}
          onClearSelection={() => setSelectedTeachers([])}
        />

        <TeacherTable
          teachers={paginatedTeachers}
          loading={loading}
          selectedTeachers={selectedTeachers}
          searchQuery={searchQuery}
          onSelectAll={toggleSelectAll}
          onSelectTeacher={toggleSelectTeacher}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <TeacherPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <TeacherModal
          isOpen={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsSubmitting(false);
              onOpenChange();
            }
          }}
          isEditMode={isEditMode}
          editingTeacher={editingTeacher}
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
                    Bạn có chắc chắn muốn xóa giáo viên này? Hành động này không thể hoàn tác.
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
