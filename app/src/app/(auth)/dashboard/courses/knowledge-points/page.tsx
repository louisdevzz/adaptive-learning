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
  KnowledgePointHeader,
  KnowledgePointMetrics,
  KnowledgePointTable,
  KnowledgePointModal,
} from "@/components/dashboards/admin/management/knowledge-point";
import { KnowledgePoint, KnowledgePointFormData, KnowledgePointStats } from "@/types/knowledge-point";
import { toast } from "sonner";

export default function KnowledgePointsPage() {
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [filteredKnowledgePoints, setFilteredKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKnowledgePoints, setSelectedKnowledgePoints] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingKnowledgePoint, setEditingKnowledgePoint] = useState<KnowledgePoint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingKnowledgePointId, setDeletingKnowledgePointId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createdQuestions, setCreatedQuestions] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState<KnowledgePointFormData>({
    title: "",
    description: "",
    difficultyLevel: 1,
    tags: [],
    prerequisites: [],
    resources: [],
  });

  // Fetch knowledge points
  useEffect(() => {
    fetchKnowledgePoints();
  }, []);

  // Filter knowledge points based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredKnowledgePoints(knowledgePoints);
    } else {
      const filtered = knowledgePoints.filter(
        (kp) =>
          kp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          kp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (kp.tags && kp.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      setFilteredKnowledgePoints(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, knowledgePoints]);

  const fetchKnowledgePoints = async () => {
    try {
      setLoading(true);
      const kps = await api.knowledgePoints.getAll();

      // Fetch prerequisites and resources for each knowledge point
      const kpsWithDetails = await Promise.all(
        kps.map(async (kp: any) => {
          try {
            const details = await api.knowledgePoints.getByIdWithDetails(kp.id);
            return {
              ...kp,
              prerequisites: details.prerequisites
                ? (Array.isArray(details.prerequisites)
                    ? details.prerequisites.map((p: any) => typeof p === 'string' ? p : p.id)
                    : [])
                : [],
              resources: details.resources || [],
            };
          } catch (error) {
            console.error(`Error fetching details for KP ${kp.id}:`, error);
            return {
              ...kp,
              prerequisites: [],
              resources: [],
            };
          }
        })
      );

      setKnowledgePoints(kpsWithDetails);
      setFilteredKnowledgePoints(kpsWithDetails);
    } catch (error) {
      console.error("Error fetching knowledge points:", error);
      toast.error("Lỗi khi tải danh sách điểm kiến thức");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats: KnowledgePointStats = {
    total: knowledgePoints.length,
    byDifficulty: knowledgePoints.reduce((acc, kp) => {
      acc[kp.difficultyLevel] = (acc[kp.difficultyLevel] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number }),
  };

  // Pagination
  const totalPages = Math.ceil(filteredKnowledgePoints.length / itemsPerPage);
  const paginatedKnowledgePoints = filteredKnowledgePoints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingKnowledgePoint(null);
    setFormData({
      title: "",
      description: "",
      difficultyLevel: 1,
      tags: [],
      prerequisites: [],
      resources: [],
    });
    onOpen();
  };

  const handleEdit = async (knowledgePoint: KnowledgePoint) => {
    setIsEditMode(true);
    setEditingKnowledgePoint(knowledgePoint);

    // Fetch prerequisites and resources for this knowledge point
    try {
      const details = await api.knowledgePoints.getByIdWithDetails(knowledgePoint.id);
      // Extract prerequisite IDs from the details
      let prerequisites: string[] = [];
      if (details.prerequisites) {
        prerequisites = Array.isArray(details.prerequisites)
          ? details.prerequisites.map((p: any) => (typeof p === 'string' ? p : (p.id || p)))
          : [];
      }

      // Extract resources from the details
      let resources: any[] = [];
      if (details.resources) {
        resources = Array.isArray(details.resources) ? details.resources : [];
      }

      setFormData({
        title: knowledgePoint.title,
        description: knowledgePoint.description,
        difficultyLevel: knowledgePoint.difficultyLevel,
        tags: knowledgePoint.tags || [],
        prerequisites: prerequisites,
        resources: resources,
      });
    } catch (error) {
      console.error("Error fetching knowledge point details:", error);
      // If fetching fails, still open the modal with basic data
      setFormData({
        title: knowledgePoint.title,
        description: knowledgePoint.description,
        difficultyLevel: knowledgePoint.difficultyLevel,
        tags: knowledgePoint.tags || [],
        prerequisites: [],
        resources: [],
      });
      toast.error("Không thể tải thông tin chi tiết");
    }

    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingKnowledgePointId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingKnowledgePointId) return;

    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa điểm kiến thức...");
      await api.knowledgePoints.delete(deletingKnowledgePointId);
      await fetchKnowledgePoints();
      toast.success("Xóa điểm kiến thức thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingKnowledgePointId(null);
    } catch (error: any) {
      console.error("Error deleting knowledge point:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa điểm kiến thức";
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
      if (isEditMode && editingKnowledgePoint) {
        toastId = toast.loading("Đang cập nhật điểm kiến thức...");

        // Clean resources by removing fields that shouldn't be sent to the backend
        const cleanedResources = formData.resources?.map((resource: any) => {
          const { id, kpId, createdAt, updatedAt, ...cleanedResource } = resource;
          return cleanedResource;
        }) || [];

        // Update knowledge point
        await api.knowledgePoints.update(editingKnowledgePoint.id, {
          title: formData.title,
          description: formData.description,
          difficultyLevel: formData.difficultyLevel,
          tags: formData.tags,
          prerequisites: formData.prerequisites,
          resources: cleanedResources,
        });

        // Create new questions and assign to KP
        if (createdQuestions.length > 0) {
          for (const question of createdQuestions) {
            // Skip if question already has an ID (already exists in DB)
            if (question.id) continue;

            try {
              // Create the question
              const createdQuestion = await api.questionBank.create({
                questionText: question.questionText!,
                options: question.options || [],
                correctAnswer: question.correctAnswer!,
                questionType: question.questionType!,
                isActive: true,
                metadata: {
                  difficulty: question.difficulty || formData.difficultyLevel,
                  discrimination: 0.5,
                  skillId: editingKnowledgePoint.id,
                  tags: question.tags || [],
                  estimatedTime: question.estimatedTime || 60,
                },
              });

              // Assign to KP
              await api.questionBank.assignToKp({
                kpId: editingKnowledgePoint.id,
                questionId: createdQuestion.id,
                difficulty: question.difficulty || formData.difficultyLevel,
              });
            } catch (error) {
              console.error('Error creating question:', error);
            }
          }
        }

        toast.success("Cập nhật điểm kiến thức thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo điểm kiến thức mới...");
        const newKp = await api.knowledgePoints.create({
          title: formData.title,
          description: formData.description,
          difficultyLevel: formData.difficultyLevel,
          tags: formData.tags,
          prerequisites: formData.prerequisites,
          resources: formData.resources,
        });

        // Create questions for new KP
        if (createdQuestions.length > 0) {
          for (const question of createdQuestions) {
            try {
              // Create the question
              const createdQuestion = await api.questionBank.create({
                questionText: question.questionText!,
                options: question.options || [],
                correctAnswer: question.correctAnswer!,
                questionType: question.questionType!,
                isActive: true,
                metadata: {
                  difficulty: question.difficulty || formData.difficultyLevel,
                  discrimination: 0.5,
                  skillId: newKp.id,
                  tags: question.tags || [],
                  estimatedTime: question.estimatedTime || 60,
                },
              });

              // Assign to KP
              await api.questionBank.assignToKp({
                kpId: newKp.id,
                questionId: createdQuestion.id,
                difficulty: question.difficulty || formData.difficultyLevel,
              });
            } catch (error) {
              console.error('Error creating question:', error);
            }
          }
        }

        toast.success("Tạo điểm kiến thức thành công", { id: toastId });
      }
      await fetchKnowledgePoints();
      onOpenChange();
      // Reset created questions
      setCreatedQuestions([]);
    } catch (error: any) {
      console.error("Error saving knowledge point:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu điểm kiến thức";
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
      setSelectedKnowledgePoints(paginatedKnowledgePoints.map((kp) => kp.id));
    } else {
      setSelectedKnowledgePoints([]);
    }
  };

  const handleSelectKnowledgePoint = (id: string) => {
    if (selectedKnowledgePoints.includes(id)) {
      setSelectedKnowledgePoints(selectedKnowledgePoints.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedKnowledgePoints([...selectedKnowledgePoints, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedKnowledgePoints([]);
  };

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <KnowledgePointHeader onCreate={handleCreate} />
        <KnowledgePointMetrics stats={stats} />
        <KnowledgePointTable
          knowledgePoints={paginatedKnowledgePoints}
          loading={loading}
          selectedKnowledgePoints={selectedKnowledgePoints}
          searchQuery={searchQuery}
          onSelectAll={handleSelectAll}
          onSelectKnowledgePoint={handleSelectKnowledgePoint}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearchChange={setSearchQuery}
          selectedCount={selectedKnowledgePoints.length}
          onClearSelection={handleClearSelection}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          allKnowledgePoints={knowledgePoints}
        />

        {/* Create/Edit Modal */}
        <KnowledgePointModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isEditMode={isEditMode}
          editingKnowledgePoint={editingKnowledgePoint}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          createdQuestions={createdQuestions}
          onCreatedQuestionsChange={setCreatedQuestions}
        />

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteModalOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="font-semibold text-lg text-[#181d27]">
                    Xác nhận xóa điểm kiến thức
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-[#535862]">
                    Bạn có chắc chắn muốn xóa điểm kiến thức này? Hành động này không thể hoàn tác.
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

