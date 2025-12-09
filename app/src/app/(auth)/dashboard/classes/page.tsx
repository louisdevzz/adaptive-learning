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
import { ClassHeader, ClassMetrics, ClassTable, ClassModal } from "@/components/dashboards/admin/management/class";
import { Class, ClassFormData, ClassStats } from "@/types/class";
import { toast } from "sonner";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<ClassFormData>({
    className: "",
    gradeLevel: 10,
    schoolYear: "",
    homeroomTeacherId: undefined,
  });

  // Fetch classes
  useEffect(() => {
    fetchClasses();
  }, []);

  // Filter classes based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter(
        (classItem) =>
          classItem.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classItem.gradeLevel.toString().includes(searchQuery) ||
          classItem.schoolYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classItem.homeroomTeacher?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClasses(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, classes]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await api.classes.getAll();
      setClasses(data);
      setFilteredClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats: ClassStats = {
    total: classes.length,
    byGradeLevel: classes.reduce((acc, classItem) => {
      acc[classItem.gradeLevel] = (acc[classItem.gradeLevel] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number }),
  };

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingClass(null);
    const currentYear = new Date().getFullYear();
    setFormData({
      className: "",
      gradeLevel: 10,
      schoolYear: `${currentYear}-${currentYear + 1}`,
      homeroomTeacherId: undefined,
    });
    onOpen();
  };

  const handleEdit = (classItem: Class) => {
    setIsEditMode(true);
    setEditingClass(classItem);
    setFormData({
      className: classItem.className,
      gradeLevel: classItem.gradeLevel,
      schoolYear: classItem.schoolYear,
      homeroomTeacherId: classItem.homeroomTeacherId,
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingClassId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingClassId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa lớp học...");
      await api.classes.delete(deletingClassId);
      await fetchClasses();
      toast.success("Xóa lớp học thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingClassId(null);
    } catch (error: any) {
      console.error("Error deleting class:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa lớp học";
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
      if (isEditMode && editingClass) {
        toastId = toast.loading("Đang cập nhật lớp học...");
        await api.classes.update(editingClass.id, {
          className: formData.className,
          gradeLevel: formData.gradeLevel,
          schoolYear: formData.schoolYear,
          homeroomTeacherId: formData.homeroomTeacherId || undefined,
        });
        toast.success("Cập nhật lớp học thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo lớp học mới...");
        await api.classes.create({
          className: formData.className,
          gradeLevel: formData.gradeLevel,
          schoolYear: formData.schoolYear,
          homeroomTeacherId: formData.homeroomTeacherId || undefined,
        });
        toast.success("Tạo lớp học thành công", { id: toastId });
      }
      await fetchClasses();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving class:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu lớp học";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClasses(paginatedClasses.map((c) => c.id));
    } else {
      setSelectedClasses([]);
    }
  };

  const handleSelectClass = (id: string) => {
    if (selectedClasses.includes(id)) {
      setSelectedClasses(selectedClasses.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedClasses([...selectedClasses, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedClasses([]);
  };

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <ClassHeader onCreate={handleCreate} />
        <ClassMetrics stats={stats} />
        <ClassTable
          classes={paginatedClasses}
          loading={loading}
          selectedClasses={selectedClasses}
          searchQuery={searchQuery}
          onSelectAll={handleSelectAll}
          onSelectClass={handleSelectClass}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearchChange={setSearchQuery}
          selectedCount={selectedClasses.length}
          onClearSelection={handleClearSelection}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Create/Edit Modal */}
        <ClassModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isEditMode={isEditMode}
          editingClass={editingClass}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteModalOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="font-semibold text-lg text-[#181d27]">
                    Xác nhận xóa lớp học
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-[#535862]">
                    Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.
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
