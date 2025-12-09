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
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { ChevronDown, X, Plus, Trash2, Search, Link as LinkIcon, Video, FileText, Gamepad2, ClipboardCheck, Paperclip, Edit } from "lucide-react";
import { KnowledgePoint, KnowledgePointFormData, KnowledgePointResource } from "@/types/knowledge-point";
import { api } from "@/lib/api";

interface KnowledgePointModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  editingKnowledgePoint: KnowledgePoint | null;
  formData: KnowledgePointFormData;
  onFormDataChange: (data: KnowledgePointFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function KnowledgePointModal({
  isOpen,
  onOpenChange,
  isEditMode,
  editingKnowledgePoint,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting = false,
}: KnowledgePointModalProps) {
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isPrerequisiteOpen, setIsPrerequisiteOpen] = useState(false);
  const [isResourceTypeOpen, setIsResourceTypeOpen] = useState(false);
  const [allKnowledgePoints, setAllKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [loadingKnowledgePoints, setLoadingKnowledgePoints] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [prerequisiteSearch, setPrerequisiteSearch] = useState("");

  // Resource form state
  const [resourceForm, setResourceForm] = useState<{
    resourceType: 'video' | 'article' | 'interactive' | 'quiz' | 'other';
    url: string;
    title: string;
    description: string;
  }>({
    resourceType: 'article',
    url: '',
    title: '',
    description: '',
  });
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);

  const difficultyOptions = [
    { value: 1, label: "Rất dễ" },
    { value: 2, label: "Dễ" },
    { value: 3, label: "Trung bình" },
    { value: 4, label: "Khó" },
    { value: 5, label: "Rất khó" },
  ];

  const resourceTypeOptions = [
    { value: 'video' as const, label: 'Video', icon: Video },
    { value: 'article' as const, label: 'Bài viết', icon: FileText },
    { value: 'interactive' as const, label: 'Tương tác', icon: Gamepad2 },
    { value: 'quiz' as const, label: 'Bài kiểm tra', icon: ClipboardCheck },
    { value: 'other' as const, label: 'Khác', icon: Paperclip },
  ];

  // Fetch all knowledge points for prerequisites when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllKnowledgePoints();
    }
  }, [isOpen]);

  const fetchAllKnowledgePoints = async () => {
    try {
      setLoadingKnowledgePoints(true);
      const kps = await api.knowledgePoints.getAll();
      // Exclude current KP if editing
      const filtered = isEditMode && editingKnowledgePoint
        ? kps.filter((kp: KnowledgePoint) => kp.id !== editingKnowledgePoint.id)
        : kps;
      setAllKnowledgePoints(filtered);
    } catch (error) {
      console.error("Error fetching knowledge points:", error);
    } finally {
      setLoadingKnowledgePoints(false);
    }
  };

  const selectedDifficulty = difficultyOptions.find(
    (opt) => opt.value === formData.difficultyLevel
  );

  const updateFormData = (updates: Partial<KnowledgePointFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      const currentTags = formData.tags || [];
      updateFormData({ tags: [...currentTags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = formData.tags || [];
    updateFormData({ tags: currentTags.filter((tag) => tag !== tagToRemove) });
  };

  const handleTogglePrerequisite = (kpId: string) => {
    const currentPrereqs = formData.prerequisites || [];
    if (currentPrereqs.includes(kpId)) {
      updateFormData({ prerequisites: currentPrereqs.filter((id) => id !== kpId) });
    } else {
      updateFormData({ prerequisites: [...currentPrereqs, kpId] });
    }
  };

  const handleRemovePrerequisite = (kpId: string) => {
    const currentPrereqs = formData.prerequisites || [];
    updateFormData({ prerequisites: currentPrereqs.filter((id) => id !== kpId) });
  };

  const handleAddResource = () => {
    if (resourceForm.url && resourceForm.title) {
      const currentResources = formData.resources || [];

      // Prepare resource data, omitting empty description
      const resourceData: any = {
        resourceType: resourceForm.resourceType,
        url: resourceForm.url,
        title: resourceForm.title,
        orderIndex: editingResourceIndex !== null ? editingResourceIndex : currentResources.length,
      };

      // Only include description if it's not empty
      if (resourceForm.description && resourceForm.description.trim() !== '') {
        resourceData.description = resourceForm.description.trim();
      }

      if (editingResourceIndex !== null) {
        // Update existing resource
        const updatedResources = currentResources.map((res, idx) =>
          idx === editingResourceIndex ? resourceData : res
        );
        updateFormData({ resources: updatedResources });
      } else {
        // Add new resource
        updateFormData({ resources: [...currentResources, resourceData] });
      }

      // Reset form
      setResourceForm({
        resourceType: 'article',
        url: '',
        title: '',
        description: '',
      });
      setShowResourceForm(false);
      setEditingResourceIndex(null);
    }
  };

  const handleEditResource = (index: number) => {
    const resource = formData.resources?.[index];
    if (resource) {
      setResourceForm({
        resourceType: resource.resourceType,
        url: resource.url,
        title: resource.title,
        description: resource.description || '',
      });
      setEditingResourceIndex(index);
      setShowResourceForm(true);
    }
  };

  const handleRemoveResource = (index: number) => {
    const currentResources = formData.resources || [];
    const updatedResources = currentResources.filter((_, i) => i !== index);
    // Reorder indices
    const reorderedResources = updatedResources.map((res, idx) => ({
      ...res,
      orderIndex: idx,
    }));
    updateFormData({ resources: reorderedResources });
  };

  const handleCancelResourceForm = () => {
    setShowResourceForm(false);
    setEditingResourceIndex(null);
    setResourceForm({
      resourceType: 'article',
      url: '',
      title: '',
      description: '',
    });
  };

  // Filter knowledge points based on search, excluding already selected ones
  const filteredPrerequisites = allKnowledgePoints.filter((kp) =>
    kp.title.toLowerCase().includes(prerequisiteSearch.toLowerCase())
  );

  const selectedPrerequisites = allKnowledgePoints.filter((kp) =>
    formData.prerequisites?.includes(kp.id)
  );

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-semibold text-lg text-[#181d27]">
                {isEditMode ? "Chỉnh sửa điểm kiến thức" : "Thêm điểm kiến thức mới"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Tên điểm kiến thức"
                  placeholder="Ví dụ: Khái niệm giới hạn"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  isRequired
                />

                <Textarea
                  label="Mô tả"
                  placeholder="Mô tả chi tiết về điểm kiến thức..."
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  isRequired
                  minRows={4}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Độ khó <span className="text-red-500">*</span>
                  </label>
                  <Dropdown isOpen={isDifficultyOpen} onOpenChange={setIsDifficultyOpen}>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da]"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {selectedDifficulty
                          ? selectedDifficulty.label
                          : "Chọn độ khó"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Difficulty selection"
                      selectedKeys={formData.difficultyLevel ? [formData.difficultyLevel.toString()] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFormData({ difficultyLevel: parseInt(value) || 1 });
                        setIsDifficultyOpen(false);
                      }}
                    >
                      {difficultyOptions.map((option) => (
                        <DropdownItem key={option.value.toString()} textValue={option.label}>
                          <span className="text-sm text-[#181d27]">{option.label}</span>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                {/* Tags Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tag và nhấn Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      size="sm"
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-[#7f56d9] text-white"
                      startContent={<Plus className="size-4" />}
                      onPress={handleAddTag}
                    >
                      Thêm
                    </Button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-500"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prerequisites Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181d27]">
                    Điểm kiến thức tiên quyết
                  </label>
                  <Popover 
                    isOpen={isPrerequisiteOpen} 
                    onOpenChange={setIsPrerequisiteOpen}
                    placement="bottom-start"
                    showArrow={false}
                    classNames={{
                      content: "p-0",
                    }}
                  >
                    <PopoverTrigger>
                      <Button
                        variant="bordered"
                        className="justify-between border-[#d5d7da] w-full"
                        endContent={<ChevronDown className="size-4" />}
                      >
                        {selectedPrerequisites.length > 0
                          ? `${selectedPrerequisites.length} điểm kiến thức đã chọn`
                          : "Chọn điểm kiến thức tiên quyết"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <div className="flex flex-col max-h-[400px]">
                        {/* Search Input */}
                        <div className="p-3 border-b border-[#e9eaeb] sticky top-0 bg-white z-10">
                          <Input
                            placeholder="Tìm kiếm điểm kiến thức..."
                            value={prerequisiteSearch}
                            onChange={(e) => setPrerequisiteSearch(e.target.value)}
                            size="sm"
                            startContent={<Search className="size-4 text-[#717680]" />}
                            classNames={{
                              input: "text-sm",
                              inputWrapper: "border-[#d5d7da] h-9",
                            }}
                          />
                        </div>
                        
                        {/* Options List */}
                        <div className="overflow-y-auto flex-1">
                          {loadingKnowledgePoints ? (
                            <div className="p-4 text-center">
                              <span className="text-sm text-[#535862]">Đang tải...</span>
                            </div>
                          ) : filteredPrerequisites.length === 0 ? (
                            <div className="p-4 text-center">
                              <span className="text-sm text-[#535862]">
                                {prerequisiteSearch ? "Không tìm thấy điểm kiến thức nào" : "Không có điểm kiến thức nào"}
                              </span>
                            </div>
                          ) : (
                            <div className="p-1">
                              {filteredPrerequisites.map((kp) => {
                                const isSelected = formData.prerequisites?.includes(kp.id) || false;
                                return (
                                  <div
                                    key={kp.id}
                                    className="flex items-center gap-2 p-2 hover:bg-[#f5f5f5] rounded-md cursor-pointer"
                                    onClick={() => handleTogglePrerequisite(kp.id)}
                                  >
                                    <div
                                      className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? "bg-[#7f56d9] border-[#7f56d9]"
                                          : "border-[#d5d7da]"
                                      }`}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-0.5 flex-1">
                                      <span className="text-sm font-medium text-[#181d27]">
                                        {kp.title}
                                      </span>
                                      <span className="text-xs text-[#535862]">
                                        Độ khó: {difficultyOptions.find((opt) => opt.value === kp.difficultyLevel)?.label || kp.difficultyLevel}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {selectedPrerequisites.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedPrerequisites.map((kp) => (
                        <div
                          key={kp.id}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          <span>{kp.title}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePrerequisite(kp.id)}
                            className="hover:text-red-500"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resources Section */}
                <div className="flex flex-col gap-2 border-t border-[#e9eaeb] pt-4 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#181d27]">
                      Tài nguyên học tập
                    </label>
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-[#7f56d9] text-white"
                      startContent={<Plus className="size-4" />}
                      onPress={() => setShowResourceForm(!showResourceForm)}
                    >
                      Thêm tài nguyên
                    </Button>
                  </div>

                  {/* Resource Form */}
                  {showResourceForm && (
                    <div className="flex flex-col gap-3 p-3 bg-[#f9fafb] rounded-lg border border-[#e9eaeb]">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-[#181d27]">
                          {editingResourceIndex !== null ? 'Chỉnh sửa tài nguyên' : 'Thêm tài nguyên mới'}
                        </h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[#535862]">
                          Loại tài nguyên
                        </label>
                        <Dropdown isOpen={isResourceTypeOpen} onOpenChange={setIsResourceTypeOpen}>
                          <DropdownTrigger>
                            <div
                              className="flex items-center justify-between gap-2 px-3 py-2 h-8 rounded-lg border border-[#d5d7da] bg-white cursor-pointer hover:bg-neutral-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const selectedOption = resourceTypeOptions.find(
                                    (opt) => opt.value === resourceForm.resourceType
                                  );
                                  const IconComponent = selectedOption?.icon;
                                  return IconComponent ? <IconComponent className="size-4 shrink-0 text-[#535862]" /> : null;
                                })()}
                                <span className="text-sm text-[#181d27]">
                                  {resourceTypeOptions.find(
                                    (opt) => opt.value === resourceForm.resourceType
                                  )?.label}
                                </span>
                              </div>
                              <ChevronDown className="size-4 text-[#535862] shrink-0" />
                            </div>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Resource type selection"
                            selectedKeys={[resourceForm.resourceType]}
                            selectionMode="single"
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0] as typeof resourceForm.resourceType;
                              setResourceForm({ ...resourceForm, resourceType: value });
                              setIsResourceTypeOpen(false);
                            }}
                          >
                            {resourceTypeOptions.map((option) => {
                              const IconComponent = option.icon;
                              return (
                                <DropdownItem 
                                  key={option.value} 
                                  textValue={option.label}
                                  startContent={<IconComponent className="size-4 text-[#535862] shrink-0" />}
                                  classNames={{
                                    base: "gap-2",
                                  }}
                                >
                                  <span className="text-sm text-[#181d27]">
                                    {option.label}
                                  </span>
                                </DropdownItem>
                              );
                            })}
                          </DropdownMenu>
                        </Dropdown>
                      </div>

                      <Input
                        label="Tiêu đề"
                        placeholder="Ví dụ: Video giảng bài về giới hạn"
                        value={resourceForm.title}
                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                        size="sm"
                        isRequired
                      />

                      <Input
                        label="URL"
                        placeholder="https://..."
                        value={resourceForm.url}
                        onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                        size="sm"
                        startContent={<LinkIcon className="size-4 text-[#717680]" />}
                        isRequired
                      />

                      <Textarea
                        label="Mô tả (Tùy chọn)"
                        placeholder="Mô tả ngắn về tài nguyên này..."
                        value={resourceForm.description}
                        onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                        size="sm"
                        minRows={2}
                      />

                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={handleCancelResourceForm}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#7f56d9] text-white"
                          onPress={handleAddResource}
                          isDisabled={!resourceForm.url || !resourceForm.title}
                        >
                          {editingResourceIndex !== null ? 'Cập nhật' : 'Thêm'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Resources List */}
                  {formData.resources && formData.resources.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {formData.resources.map((resource, index) => {
                        // Hide resource being edited
                        if (editingResourceIndex === index) {
                          return null;
                        }

                        const typeOption = resourceTypeOptions.find(
                          (opt) => opt.value === resource.resourceType
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-white border border-[#e9eaeb] rounded-lg hover:border-[#7f56d9] transition-colors"
                          >
                            {typeOption && (() => {
                              const IconComponent = typeOption.icon;
                              return (
                                <div className="shrink-0">
                                  <IconComponent className="size-5 text-[#535862]" />
                                </div>
                              );
                            })()}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-[#181d27] truncate">
                                    {resource.title}
                                  </h4>
                                  <p className="text-xs text-[#535862] mt-0.5">
                                    {typeOption?.label}
                                  </p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleEditResource(index)}
                                    className="p-1 hover:bg-blue-50 rounded transition-colors"
                                    title="Chỉnh sửa"
                                  >
                                    <Edit className="size-4 text-blue-600" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveResource(index)}
                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                    title="Xóa"
                                  >
                                    <Trash2 className="size-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                              {resource.description && (
                                <p className="text-xs text-[#717680] mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                              )}
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#7f56d9] hover:underline mt-1 inline-flex items-center gap-1"
                              >
                                <LinkIcon className="size-3" />
                                {resource.url}
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(!formData.resources || formData.resources.length === 0) && !showResourceForm && (
                    <p className="text-xs text-[#717680] italic text-center py-2">
                      Chưa có tài nguyên nào. Nhấn "Thêm tài nguyên" để bắt đầu.
                    </p>
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
                isDisabled={isSubmitting || !formData.title || !formData.description}
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

