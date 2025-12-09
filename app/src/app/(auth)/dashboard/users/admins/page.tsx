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
import { AdminHeader, AdminMetrics, AdminTable, AdminModal } from "@/components/dashboards/admin";
import { Admin, AdminFormData, AdminStats } from "@/types/admin";
import { toast } from "sonner";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<AdminFormData>({
    email: "",
    password: "",
    fullName: "",
    adminLevel: "system",
    permissions: [],
    avatarUrl: "",
  });

  // Fetch admins
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter admins based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAdmins(admins);
    } else {
      const filtered = admins.filter(
        (admin) =>
          admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAdmins(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, admins]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await api.admins.getAll();
      setAdmins(data);
      setFilteredAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingAdmin(null);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      adminLevel: "system",
      permissions: [],
      avatarUrl: "",
    });
    onOpen();
  };

  const handleEdit = (admin: Admin) => {
    setIsEditMode(true);
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      password: "",
      fullName: admin.fullName,
      adminLevel: admin.adminInfo?.adminLevel || "system",
      permissions: admin.adminInfo?.permissions || [],
      avatarUrl: admin.avatarUrl || "",
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeletingAdminId(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!deletingAdminId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsDeleting(true);
      toastId = toast.loading("Đang xóa quản trị viên...");
      await api.admins.delete(deletingAdminId);
      await fetchAdmins();
      toast.success("Xóa quản trị viên thành công", { id: toastId });
      onDeleteModalOpenChange();
      setDeletingAdminId(null);
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa quản trị viên";
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
      if (isEditMode && editingAdmin) {
        toastId = toast.loading("Đang cập nhật quản trị viên...");
        await api.admins.update(editingAdmin.id, {
          fullName: formData.fullName,
          adminLevel: formData.adminLevel,
          permissions: formData.permissions,
          avatarUrl: formData.avatarUrl || undefined,
        });
        toast.success("Cập nhật quản trị viên thành công", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo quản trị viên mới...");
        await api.admins.create({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          adminLevel: formData.adminLevel,
          permissions: formData.permissions,
          avatarUrl: formData.avatarUrl || undefined,
        });
        toast.success("Tạo quản trị viên thành công", { id: toastId });
      }
      await fetchAdmins();
      onOpenChange();
    } catch (error: any) {
      console.error("Error saving admin:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu quản trị viên";
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
      setSelectedAdmins(paginatedAdmins.map((admin) => admin.id));
    } else {
      setSelectedAdmins([]);
    }
  };

  const toggleSelectAdmin = (id: string) => {
    setSelectedAdmins((prev) =>
      prev.includes(id) ? prev.filter((adminId) => adminId !== id) : [...prev, id]
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats: AdminStats = {
    total: admins.length,
    super: admins.filter((a) => a.adminInfo?.adminLevel === "super").length,
    system: admins.filter((a) => a.adminInfo?.adminLevel === "system").length,
    support: admins.filter((a) => a.adminInfo?.adminLevel === "support").length,
  };

  return (
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <AdminHeader onCreate={handleCreate} />

        <AdminMetrics stats={stats} />

        <AdminTable
          admins={paginatedAdmins}
          loading={loading}
          selectedAdmins={selectedAdmins}
          searchQuery={searchQuery}
          onSelectAll={toggleSelectAll}
          onSelectAdmin={toggleSelectAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearchChange={setSearchQuery}
          selectedCount={selectedAdmins.length}
          onClearSelection={() => setSelectedAdmins([])}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <AdminModal
          isOpen={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsSubmitting(false);
              onOpenChange();
            }
          }}
          isEditMode={isEditMode}
          editingAdmin={editingAdmin}
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
                    Bạn có chắc chắn muốn xóa quản trị viên này? Hành động này không thể hoàn tác.
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
