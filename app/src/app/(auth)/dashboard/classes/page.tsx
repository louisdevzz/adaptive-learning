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
import { ClassHeader, ClassesOverview, ClassModal } from "@/components/dashboards/admin/management/class";
import { Class, ClassFormData } from "@/types/class";
import { toast } from "sonner";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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


  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await api.classes.getAll();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <LayoutDashboard>
      <div className="flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        <ClassHeader onCreate={handleCreate} />
        <ClassesOverview classes={classes} loading={loading} />

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

      </div>
    </LayoutDashboard>
  );
}
