"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { ChevronDown, X, Plus, Trash2 } from "lucide-react";
import { Section, SectionFormData, Module, Course, CreateKnowledgePointData, KnowledgePoint } from "@/types/course";
import { api } from "@/lib/api";

interface SectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingSection: Section | null;
  formData: SectionFormData;
  onFormDataChange: (data: SectionFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function SectionModal({
  isOpen,
  onOpenChange,
  isEditMode,
  editingSection,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: SectionModalProps) {
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [allKnowledgePoints, setAllKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [loadingKnowledgePoints, setLoadingKnowledgePoints] = useState(false);

  // Fetch modules and knowledge points when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchModules();
      fetchAllKnowledgePoints();
    }
  }, [isOpen]);

  const fetchModules = async () => {
    try {
      setLoadingModules(true);
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
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoadingModules(false);
    }
  };

  const fetchAllKnowledgePoints = async () => {
    try {
      setLoadingKnowledgePoints(true);
      const kps = await api.knowledgePoints.getAll();
      setAllKnowledgePoints(kps);
    } catch (error) {
      console.error("Error fetching knowledge points:", error);
    } finally {
      setLoadingKnowledgePoints(false);
    }
  };

  const selectedModule = modules.find((m) => m.id === formData.moduleId);

  const updateFormData = (updates: Partial<SectionFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  // Debug: Log formData when it changes
  useEffect(() => {
    if (formData.knowledgePoints && formData.knowledgePoints.length > 0) {
      console.log('Knowledge Points in form:', formData.knowledgePoints);
    }
  }, [formData]);

  const handleAddKnowledgePoint = () => {
    const currentKps = formData.knowledgePoints || [];
    const newKp: CreateKnowledgePointData = {
      title: "",
      description: "",
      difficultyLevel: 1,
      tags: [],
      prerequisites: [],
    };
    updateFormData({ knowledgePoints: [...currentKps, newKp] });
  };

  const handleRemoveKnowledgePoint = (index: number) => {
    const currentKps = formData.knowledgePoints || [];
    updateFormData({
      knowledgePoints: currentKps.filter((_, i) => i !== index)
    });
  };

  const handleUpdateKnowledgePoint = (index: number, updates: Partial<CreateKnowledgePointData>) => {
    const currentKps = formData.knowledgePoints || [];
    const updatedKps = currentKps.map((kp, i) =>
      i === index ? { ...kp, ...updates } : kp
    );
    updateFormData({ knowledgePoints: updatedKps });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Chủ đề <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isModuleOpen} onOpenChange={setIsModuleOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                        isDisabled={loadingModules}
                      >
                        {selectedModule
                          ? selectedModule.title
                          : loadingModules
                          ? "Đang tải..."
                          : "Chọn chủ đề"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Module selection"
                      selectedKeys={formData.moduleId ? [formData.moduleId] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFormData({ moduleId: value });
                        setIsModuleOpen(false);
                      }}
                    >
                      {modules.map((module) => (
                        <DropdownItem key={module.id} textValue={module.title}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-[#181d27]">
                              {module.title}
                            </span>
                            <span className="text-xs text-[#535862]">
                              {module.course?.title || "N/A"}
                            </span>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <Input
                  label="Tên bài học"
                  placeholder="Ví dụ: Giới hạn của dãy số"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  isRequired
                />

                <Textarea
                  label="Tóm tắt"
                  placeholder="Tóm tắt về bài học..."
                  value={formData.summary}
                  onChange={(e) => updateFormData({ summary: e.target.value })}
                  isRequired
                  minRows={3}
                />

                <Input
                  label="Thứ tự"
                  placeholder="0"
                  type="number"
                  value={formData.orderIndex.toString()}
                  onChange={(e) => updateFormData({ orderIndex: parseInt(e.target.value) || 0 })}
                  isRequired
                  min={0}
                  description="Thứ tự hiển thị của bài học trong chủ đề"
                />

                {/* Knowledge Points Section */}
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#181d27]">
                      Điểm kiến thức
                    </label>
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-[#7f56d9] text-white"
                      startContent={<Plus className="size-4" />}
                      onPress={handleAddKnowledgePoint}
                    >
                      Thêm điểm kiến thức
                    </Button>
                  </div>

                  {formData.knowledgePoints && formData.knowledgePoints.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {formData.knowledgePoints.map((kp, index) => (
                        <div
                          key={index}
                          className="p-4 border border-[#d5d7da] rounded-lg bg-[#f9fafb] relative"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveKnowledgePoint(index)}
                            className="absolute top-3 right-3 text-[#b42318] hover:text-[#912018]"
                          >
                            <Trash2 className="size-4" />
                          </button>

                          <div className="flex flex-col gap-3 pr-8">
                            <Input
                              label={`Tên điểm kiến thức ${index + 1}`}
                              placeholder="Ví dụ: Định nghĩa giới hạn"
                              value={kp.title}
                              onChange={(e) =>
                                handleUpdateKnowledgePoint(index, { title: e.target.value })
                              }
                              isRequired
                              size="sm"
                            />

                            <Textarea
                              label="Mô tả"
                              placeholder="Mô tả chi tiết về điểm kiến thức..."
                              value={kp.description}
                              onChange={(e) =>
                                handleUpdateKnowledgePoint(index, { description: e.target.value })
                              }
                              isRequired
                              minRows={2}
                              size="sm"
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                label="Độ khó"
                                placeholder="1"
                                type="number"
                                value={kp.difficultyLevel.toString()}
                                onChange={(e) =>
                                  handleUpdateKnowledgePoint(index, {
                                    difficultyLevel: parseInt(e.target.value) || 1,
                                  })
                                }
                                isRequired
                                min={1}
                                max={5}
                                size="sm"
                                description="Từ 1 (dễ) đến 5 (khó)"
                              />

                              <Input
                                label="Tags"
                                placeholder="tag1, tag2, tag3"
                                value={kp.tags?.join(", ") || ""}
                                onChange={(e) =>
                                  handleUpdateKnowledgePoint(index, {
                                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                  })
                                }
                                size="sm"
                                description="Phân cách bằng dấu phẩy"
                              />
                            </div>

                            {/* Prerequisites Selection */}
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-medium text-[#181d27]">
                                Kiến thức tiên quyết
                              </label>
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button
                                    variant="bordered"
                                    size="sm"
                                    className="justify-between border-[#d5d7da]"
                                    endContent={<ChevronDown className="size-3" />}
                                    isDisabled={loadingKnowledgePoints}
                                  >
                                    {loadingKnowledgePoints
                                      ? "Đang tải..."
                                      : kp.prerequisites && kp.prerequisites.length > 0
                                      ? `Đã chọn ${kp.prerequisites.length} điểm kiến thức`
                                      : "Chọn kiến thức tiên quyết"}
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  aria-label="Prerequisites selection"
                                  selectionMode="multiple"
                                  selectedKeys={kp.prerequisites ? new Set(kp.prerequisites) : new Set()}
                                  onSelectionChange={(keys) => {
                                    const selectedIds = Array.from(keys) as string[];
                                    handleUpdateKnowledgePoint(index, {
                                      prerequisites: selectedIds,
                                    });
                                  }}
                                  closeOnSelect={false}
                                >
                                  {allKnowledgePoints
                                    .filter((prereqKp) => prereqKp.id !== kp.id) // Don't allow selecting self
                                    .map((prereqKp) => (
                                      <DropdownItem key={prereqKp.id} textValue={prereqKp.title}>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-xs font-medium text-[#181d27]">
                                            {prereqKp.title}
                                          </span>
                                          <span className="text-[10px] text-[#535862]">
                                            Độ khó: {prereqKp.difficultyLevel}
                                          </span>
                                        </div>
                                      </DropdownItem>
                                    ))}
                                </DropdownMenu>
                              </Dropdown>
                              {kp.prerequisites && kp.prerequisites.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {kp.prerequisites.map((prereqId) => {
                                    const prereqKp = allKnowledgePoints.find(
                                      (p) => p.id === prereqId
                                    );
                                    if (!prereqKp) return null;
                                    return (
                                      <div
                                        key={prereqId}
                                        className="flex items-center gap-1 px-2 py-0.5 bg-[#f2f4f7] rounded text-[10px] text-[#535862]"
                                      >
                                        <span>{prereqKp.title}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newPrereqs = (kp.prerequisites || []).filter(
                                              (id) => id !== prereqId
                                            );
                                            handleUpdateKnowledgePoint(index, {
                                              prerequisites: newPrereqs,
                                            });
                                          }}
                                          className="hover:text-[#b42318]"
                                        >
                                          <X className="size-2.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              <p className="text-[10px] text-[#667085]">
                                Chọn các điểm kiến thức cần học trước
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!formData.knowledgePoints || formData.knowledgePoints.length === 0) && (
                    <div className="text-center py-8 border border-dashed border-[#d5d7da] rounded-lg">
                      <p className="text-sm text-[#535862]">
                        Chưa có điểm kiến thức nào. Nhấn "Thêm điểm kiến thức" để bắt đầu.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                className="text-[#414651]"
                isDisabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                className="bg-[#7f56d9] text-white font-semibold"
                onPress={onSubmit}
                isDisabled={
                  isSubmitting ||
                  !formData.moduleId ||
                  !formData.title ||
                  !formData.summary ||
                  formData.orderIndex < 0 ||
                  (formData.knowledgePoints && formData.knowledgePoints.some(
                    kp => !kp.title || !kp.description || kp.difficultyLevel < 1 || kp.difficultyLevel > 5
                  ))
                }
                isLoading={isSubmitting}
              >
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

