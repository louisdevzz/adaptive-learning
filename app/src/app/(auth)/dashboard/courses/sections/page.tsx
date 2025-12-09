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
import { SectionHeader, SectionMetrics, SectionTable, SectionModal } from "@/components/dashboards/admin/management/section";
import { Section, SectionFormData, SectionStats, Module, Course } from "@/types/course";
import { toast } from "sonner";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<SectionFormData>({
    moduleId: "",
    title: "",
    summary: "",
    orderIndex: 0,
    knowledgePoints: [],
  });

  // Fetch sections
  useEffect(() => {
    fetchSections();
  }, []);

  // Filter sections based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSections(sections);
    } else {
      const filtered = sections.filter(
        (section) =>
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.module?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSections(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, sections]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      // Fetch all sections by getting all courses, their modules, and their sections
      const allCourses = await api.courses.getAll();
      const allSections: Section[] = [];
      
      for (const course of allCourses) {
        try {
          const courseModules = await api.courses.getAllModules(course.id);
          for (const module of courseModules) {
            try {
              const moduleSections = await api.courses.getAllSections(module.id);
              allSections.push(...moduleSections.map((s: any) => ({
                ...s,
                module: {
                  ...module,
                  course: course,
                },
              })));
            } catch (error) {
              console.error(`Error fetching sections for module ${module.id}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error fetching modules for course ${course.id}:`, error);
        }
      }
      
      setSections(allSections);
      setFilteredSections(allSections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Lỗi khi tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats: SectionStats = {
    total: sections.length,
    byModule: sections.reduce((acc, section) => {
      const moduleId = section.moduleId;
      acc[moduleId] = (acc[moduleId] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number }),
  };

  // Pagination
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const paginatedSections = filteredSections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingSection(null);
    setFormData({
      moduleId: "",
      title: "",
      summary: "",
      orderIndex: 0,
      knowledgePoints: [],
    });
    onOpen();
  };

  const handleEdit = async (section: Section) => {
    setIsEditMode(true);
    setEditingSection(section);

    // Fetch knowledge points for this section
    try {
      const knowledgePoints = await api.courses.getSectionKnowledgePoints(section.id);

      setFormData({
        moduleId: section.moduleId,
        title: section.title,
        summary: section.summary,
        orderIndex: section.orderIndex,
        knowledgePoints: knowledgePoints.map((kp: any) => ({
          title: kp.title,
          description: kp.description,
          difficultyLevel: kp.difficultyLevel,
          tags: kp.tags || [],
        })),
      });
    } catch (error) {
      console.error("Error fetching knowledge points:", error);
      // If fetching fails, still open the modal with empty knowledge points
      setFormData({
        moduleId: section.moduleId,
        title: section.title,
        summary: section.summary,
        orderIndex: section.orderIndex,
        knowledgePoints: [],
      });
      toast.error("Không thể tải điểm kiến thức");
    }

    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingSectionId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingSectionId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa bài học...");
      await api.courses.deleteSection(deletingSectionId);
      await fetchSections();
      toast.success("Xóa bài học thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingSectionId(null);
    } catch (error: any) {
      console.error("Error deleting section:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa bài học";
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
      if (isEditMode && editingSection) {
        toastId = toast.loading("Đang cập nhật bài học...");
        await api.courses.updateSection(editingSection.id, {
          title: formData.title,
          summary: formData.summary,
          orderIndex: formData.orderIndex,
        });
        toast.success("Cập nhật bài học thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo bài học mới...");
        await api.courses.createSection({
          moduleId: formData.moduleId,
          title: formData.title,
          summary: formData.summary,
          orderIndex: formData.orderIndex,
          knowledgePoints: formData.knowledgePoints,
        });
        toast.success("Tạo bài học thành công", { id: toastId });
      }
      await fetchSections();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving section:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu bài học";
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
      setSelectedSections(paginatedSections.map((s) => s.id));
    } else {
      setSelectedSections([]);
    }
  };

  const handleSelectSection = (id: string) => {
    if (selectedSections.includes(id)) {
      setSelectedSections(selectedSections.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedSections([...selectedSections, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedSections([]);
  };

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <SectionHeader onCreate={handleCreate} />
        <SectionMetrics stats={stats} />
        <SectionTable
          sections={paginatedSections}
          loading={loading}
          selectedSections={selectedSections}
          searchQuery={searchQuery}
          onSelectAll={handleSelectAll}
          onSelectSection={handleSelectSection}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearchChange={setSearchQuery}
          selectedCount={selectedSections.length}
          onClearSelection={handleClearSelection}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Create/Edit Modal */}
        <SectionModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isEditMode={isEditMode}
          editingSection={editingSection}
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
                    Xác nhận xóa bài học
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-[#535862]">
                    Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn tác.
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
