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
import { ParentHeader, ParentMetrics, ParentTable, ParentModal } from "@/components/dashboards/admin/management/parent";
import { Parent, ParentFormData, ParentStats } from "@/types/parent";
import { toast } from "sonner";

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingParentId, setDeletingParentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<ParentFormData>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    relationshipType: "father",
    avatarUrl: "",
    studentIds: [],
  });

  // Fetch parents
  useEffect(() => {
    fetchParents();
  }, []);

  // Filter parents based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredParents(parents);
    } else {
      const filtered = parents.filter(
        (parent) =>
          parent.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.parentInfo?.phone.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredParents(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, parents]);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const data = await api.parents.getAll();
      setParents(data);
      setFilteredParents(data);
    } catch (error) {
      console.error("Error fetching parents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingParent(null);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      address: "",
      relationshipType: "father",
      avatarUrl: "",
      studentIds: [],
    });
    onOpen();
  };

  const handleEdit = async (parent: Parent) => {
    setIsEditMode(true);
    setEditingParent(parent);
    
    // Fetch students linked to this parent
    let linkedStudentIds: string[] = [];
    try {
      const linkedStudents = await api.parents.getStudents(parent.id);
      linkedStudentIds = linkedStudents.map((s: any) => s.id);
    } catch (error) {
      console.error("Error fetching parent students:", error);
    }

    setFormData({
      email: parent.email,
      password: "",
      fullName: parent.fullName,
      phone: parent.parentInfo?.phone || "",
      address: parent.parentInfo?.address || "",
      relationshipType: parent.parentInfo?.relationshipType || "father",
      avatarUrl: parent.avatarUrl || "",
      studentIds: linkedStudentIds,
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingParentId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingParentId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa phụ huynh...");
      await api.parents.delete(deletingParentId);
      await fetchParents();
      toast.success("Xóa phụ huynh thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingParentId(null);
    } catch (error: any) {
      console.error("Error deleting parent:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa phụ huynh";
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
      if (isEditMode && editingParent) {
        toastId = toast.loading("Đang cập nhật phụ huynh...");
        await api.parents.update(editingParent.id, {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          relationshipType: formData.relationshipType,
          avatarUrl: formData.avatarUrl || undefined,
          studentIds: formData.studentIds,
        });
        toast.success("Cập nhật phụ huynh thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo phụ huynh mới...");
        await api.parents.create({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          relationshipType: formData.relationshipType,
          avatarUrl: formData.avatarUrl || undefined,
          studentIds: formData.studentIds,
        });
        toast.success("Tạo phụ huynh thành công", { id: toastId });
      }
      await fetchParents();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving parent:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu phụ huynh";
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
      setSelectedParents(paginatedParents.map((parent) => parent.id));
    } else {
      setSelectedParents([]);
    }
  };

  const toggleSelectParent = (id: string) => {
    setSelectedParents((prev) =>
      prev.includes(id) ? prev.filter((parentId) => parentId !== id) : [...prev, id]
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const paginatedParents = filteredParents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats: ParentStats = {
    total: parents.length,
    byRelationship: {
      father: parents.filter((p) => p.parentInfo?.relationshipType === "father").length,
      mother: parents.filter((p) => p.parentInfo?.relationshipType === "mother").length,
      guardian: parents.filter((p) => p.parentInfo?.relationshipType === "guardian").length,
    },
  };

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <ParentHeader onCreate={handleCreate} />

        <ParentMetrics stats={stats} />

        <ParentTable
          parents={paginatedParents}
          loading={loading}
          selectedParents={selectedParents}
          searchQuery={searchQuery}
          onSelectAll={toggleSelectAll}
          onSelectParent={toggleSelectParent}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearchChange={setSearchQuery}
          selectedCount={selectedParents.length}
          onClearSelection={() => setSelectedParents([])}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <ParentModal
          isOpen={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsSubmitting(false);
              onOpenChange();
            }
          }}
          isEditMode={isEditMode}
          editingParent={editingParent}
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
                    Bạn có chắc chắn muốn xóa phụ huynh này? Hành động này không thể hoàn tác.
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
