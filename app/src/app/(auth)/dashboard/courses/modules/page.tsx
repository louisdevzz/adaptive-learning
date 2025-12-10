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
import { ModuleHeader, ModuleMetrics, ModuleTable, ModuleModal } from "@/components/dashboards/admin/management/module";
import { Module, ModuleFormData, ModuleStats, Course } from "@/types/course";
import { toast } from "sonner";

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [courses, setCourses] = useState<Course[]>([]);

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<ModuleFormData>({
    courseId: "",
    title: "",
    description: "",
    orderIndex: 0,
  });

  // Fetch courses and modules
  useEffect(() => {
    fetchCourses();
    fetchModules();
  }, []);

  // Filter modules based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredModules(modules);
    } else {
      const filtered = modules.filter(
        (module) =>
          module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.course?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredModules(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, modules]);

  const fetchCourses = async () => {
    try {
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      // Fetch all modules by getting all courses and their modules
      const allCourses = await api.courses.getAll();
      const allModules: Module[] = [];
      
      for (const course of allCourses) {
        try {
          const courseModules = await api.courses.getAllModules(course.id);
          allModules.push(...courseModules.map((m: any) => ({
            ...m,
            course: course,
          })));
        } catch (error) {
          console.error(`Error fetching modules for course ${course.id}:`, error);
        }
      }
      
      setModules(allModules);
      setFilteredModules(allModules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast.error("Lỗi khi tải danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats: ModuleStats = {
    total: modules.length,
    byCourse: modules.reduce((acc, module) => {
      const courseId = module.courseId;
      acc[courseId] = (acc[courseId] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number }),
  };

  // Pagination
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const paginatedModules = filteredModules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingModule(null);
    setFormData({
      courseId: "",
      title: "",
      description: "",
      orderIndex: 0,
    });
    onOpen();
  };

  const handleEdit = (module: Module) => {
    setIsEditMode(true);
    setEditingModule(module);
    setFormData({
      courseId: module.courseId,
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingModuleId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingModuleId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa chủ đề...");
      await api.courses.deleteModule(deletingModuleId);
      await fetchModules();
      toast.success("Xóa chủ đề thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingModuleId(null);
    } catch (error: any) {
      console.error("Error deleting module:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa chủ đề";
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
      if (isEditMode && editingModule) {
        toastId = toast.loading("Đang cập nhật chủ đề...");
        await api.courses.updateModule(editingModule.id, {
          title: formData.title,
          description: formData.description,
          orderIndex: formData.orderIndex,
        });
        toast.success("Cập nhật chủ đề thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo chủ đề mới...");
        await api.courses.createModule({
          courseId: formData.courseId,
          title: formData.title,
          description: formData.description,
          orderIndex: formData.orderIndex,
        });
        toast.success("Tạo chủ đề thành công", { id: toastId });
      }
      await fetchModules();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving module:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu chủ đề";
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
      setSelectedModules(paginatedModules.map((m) => m.id));
    } else {
      setSelectedModules([]);
    }
  };

  const handleSelectModule = (id: string) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedModules([]);
  };

  return (
        <LayoutDashboard>
            <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <ModuleHeader onCreate={handleCreate} />
        <ModuleMetrics stats={stats} />
        <ModuleTable
          modules={paginatedModules}
          loading={loading}
          selectedModules={selectedModules}
          searchQuery={searchQuery}
          onSelectAll={handleSelectAll}
          onSelectModule={handleSelectModule}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearchChange={setSearchQuery}
          selectedCount={selectedModules.length}
          onClearSelection={handleClearSelection}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Create/Edit Modal */}
        <ModuleModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isEditMode={isEditMode}
          editingModule={editingModule}
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
                    Xác nhận xóa chủ đề
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-[#535862]">
                    Bạn có chắc chắn muốn xóa chủ đề này? Hành động này không thể hoàn tác.
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
