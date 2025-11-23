'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { addToast } from '@heroui/toast';
import { type ColumnDef } from '@tanstack/react-table';
import {
  FileText,
  Search,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  BookOpen,
  Clock,
  BarChart3,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { sectionAPI } from '@/lib/api';
import { useSections, useModules } from '@/hooks/use-admin-data';
import type { Section, Module, DifficultyLevel } from '@/types';

interface SectionListItem extends Section {
  knowledge_points_count?: number;
}

interface SectionManagementProps {
  onDataChange?: () => void;
}

export const SectionManagement: React.FC<SectionManagementProps> = ({
  onDataChange,
}) => {
  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | ''>('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SectionListItem | null>(null);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 10;

  // Use custom hooks for data
  const { data: modulesData, isLoading: modulesLoading } = useModules();
  const { data: sectionsData, isLoading: sectionsLoading, mutate } = useSections(selectedModuleId || undefined);

  // Derived values
  const modules = modulesData?.items || [];
  const sections = (sectionsData || []) as SectionListItem[];

  // Filtered sections
  const filteredSections = useMemo(() => {
    if (!sections) return [];
    return sections.filter(section => {
      const matchesSearch = searchQuery === '' ||
        section.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === '' || section.difficulty_level === difficultyFilter;
      const matchesStatus = statusFilter === '' || section.is_active === statusFilter;
      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [sections, searchQuery, difficultyFilter, statusFilter]);

  // Paginated sections
  const paginatedSections = useMemo(() => {
    return filteredSections.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredSections, currentPage]);

  const totalPages = useMemo(() => Math.ceil(filteredSections.length / pageSize), [filteredSections.length]);

  // Section stats
  const sectionStats = useMemo(() => ({
    totalSections: sections.length,
    activeSections: sections.filter(s => s.is_active).length || 0,
    totalEstimatedHours: sections.reduce((sum, s) => sum + (s.estimated_hours || 0), 0),
    avgDifficulty: sections.length > 0
      ? Math.round(sections.reduce((sum, s) => sum + s.difficulty_level, 0) / sections.length * 10) / 10
      : 0,
  }), [sections]);

  // Handlers
  const handleCreateSection = useCallback(async (data: {
    name: string;
    description: string;
    module_id: string;
    section_number: number;
    estimated_hours: number;
    difficulty_level: DifficultyLevel;
    is_active: boolean;
  }) => {
    try {
      setIsCreating(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang tạo bài học mới...',
        color: 'primary',
      });
      await sectionAPI.createSection(data);
      addToast({
        title: 'Thành công',
        description: `Đã tạo bài học "${data.name}" thành công`,
        color: 'success',
      });
      setShowCreateModal(false);
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to create section:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo bài học';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsCreating(false);
    }
  }, [mutate, onDataChange]);

  const handleUpdateSection = useCallback(async (data: {
    name: string;
    description: string;
    section_number: number;
    estimated_hours: number;
    difficulty_level: DifficultyLevel;
    is_active: boolean;
  }) => {
    if (!selectedSection) return;
    try {
      setIsUpdating(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang cập nhật bài học...',
        color: 'primary',
      });
      await sectionAPI.updateSection(selectedSection.id, data);
      addToast({
        title: 'Thành công',
        description: `Đã cập nhật bài học "${data.name}" thành công`,
        color: 'success',
      });
      setShowEditModal(false);
      setSelectedSection(null);
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to update section:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật bài học';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedSection, mutate, onDataChange]);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    const section = sections.find(s => s.id === sectionId);
    try {
      setIsDeleting(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang xóa bài học...',
        color: 'primary',
      });
      await sectionAPI.deleteSection(sectionId);
      addToast({
        title: 'Thành công',
        description: `Đã xóa bài học "${section?.name || ''}" thành công`,
        color: 'success',
      });
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to delete section:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa bài học';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [sections, mutate, onDataChange]);

  const handleToggleSectionStatus = useCallback(async (sectionId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        addToast({
          title: 'Đang xử lý',
          description: `Đang ${section.is_active ? 'tạm dừng' : 'kích hoạt'} bài học...`,
          color: 'primary',
        });
        await sectionAPI.updateSection(sectionId, { is_active: !section.is_active });
        addToast({
          title: 'Thành công',
          description: `Đã ${section.is_active ? 'tạm dừng' : 'kích hoạt'} bài học "${section.name}"`,
          color: 'success',
        });
        mutate();
        onDataChange?.();
      }
    } catch (error) {
      console.error('Failed to toggle section status:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể thay đổi trạng thái bài học',
        color: 'danger',
      });
    }
  }, [sections, mutate, onDataChange]);

  const handleViewSection = useCallback((sectionId: string) => {
    window.location.href = `/sections/${sectionId}`;
  }, []);

  const openEditModal = useCallback((section: SectionListItem) => {
    setSelectedSection(section);
    setShowEditModal(true);
  }, []);

  const getDifficultyColor = (level: DifficultyLevel): "primary" | "success" | "warning" | "danger" | "default" => {
    const colors: Record<DifficultyLevel, "primary" | "success" | "warning" | "danger" | "default"> = {
      1: 'success',
      2: 'primary',
      3: 'warning',
      4: 'danger',
      5: 'danger',
    };
    return colors[level] || 'default';
  };

  const getDifficultyLabel = (level: DifficultyLevel) => {
    const labels: Record<DifficultyLevel, string> = {
      1: 'Rất dễ',
      2: 'Dễ',
      3: 'Trung bình',
      4: 'Khó',
      5: 'Rất khó',
    };
    return labels[level] || 'N/A';
  };

  const columns: ColumnDef<SectionListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'section_number',
        header: 'STT',
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">{row.original.section_number}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Tên bài học',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{row.original.name}</span>
            {row.original.description && (
              <span className="text-sm text-gray-500 truncate max-w-xs">{row.original.description}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'difficulty_level',
        header: 'Độ khó',
        cell: ({ row }) => (
          <Chip
            color={getDifficultyColor(row.original.difficulty_level)}
            size="sm"
            variant="flat"
          >
            {getDifficultyLabel(row.original.difficulty_level)}
          </Chip>
        ),
      },
      {
        accessorKey: 'estimated_hours',
        header: 'Thời lượng',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{row.original.estimated_hours || 0}h</span>
          </div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <Chip
            color={row.original.is_active ? 'success' : 'default'}
            size="sm"
            variant="dot"
          >
            {row.original.is_active ? 'Hoạt động' : 'Tạm dừng'}
          </Chip>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Ngày tạo',
        cell: ({ row }) => (
          <span className="text-gray-600">
            {new Date(row.original.created_at).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Section actions">
              <DropdownItem
                key="view"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => handleViewSection(row.original.id)}
              >
                Xem chi tiết
              </DropdownItem>
              <DropdownItem
                key="edit"
                startContent={<Pencil className="w-4 h-4" />}
                onPress={() => openEditModal(row.original)}
              >
                Chỉnh sửa
              </DropdownItem>
              <DropdownItem
                key="toggle"
                startContent={row.original.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                onPress={() => handleToggleSectionStatus(row.original.id)}
              >
                {row.original.is_active ? 'Tạm dừng' : 'Kích hoạt'}
              </DropdownItem>
              <DropdownItem
                key="delete"
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={() => handleDeleteSection(row.original.id)}
              >
                Xóa
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [handleViewSection, openEditModal, handleToggleSectionStatus, handleDeleteSection]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sectionStats.totalSections}</p>
              <p className="text-gray-600 text-sm">Tổng bài học</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{sectionStats.activeSections}</p>
              <p className="text-gray-600 text-sm">Đang hoạt động</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{sectionStats.totalEstimatedHours}h</p>
              <p className="text-gray-600 text-sm">Tổng thời lượng</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{sectionStats.avgDifficulty}</p>
              <p className="text-gray-600 text-sm">Độ khó TB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Danh sách bài học
            </h3>
            <Button
              color="danger"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setShowCreateModal(true)}
              isDisabled={!selectedModuleId}
            >
              Tạo bài học
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select
              className="w-64"
              label="Chọn chương"
              placeholder="Chọn chương để xem bài học"
              selectedKeys={selectedModuleId ? [selectedModuleId] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined;
                setSelectedModuleId(selected || '');
                setCurrentPage(1);
              }}
              isLoading={modulesLoading}
            >
              {modules.map((module: Module) => (
                <SelectItem key={module.id}>
                  {module.name}
                </SelectItem>
              ))}
            </Select>
            <Input
              isClearable
              className="flex-1"
              placeholder="Tìm kiếm theo tên bài học..."
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              value={searchQuery}
              onValueChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              onClear={() => setSearchQuery('')}
            />
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {difficultyFilter ? getDifficultyLabel(difficultyFilter) : 'Tất cả độ khó'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Difficulty filter"
                selectionMode="single"
                selectedKeys={difficultyFilter ? [difficultyFilter.toString()] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string | undefined;
                  setDifficultyFilter(selected ? (parseInt(selected) as DifficultyLevel) : '');
                }}
              >
                <DropdownItem key="">Tất cả độ khó</DropdownItem>
                <DropdownItem key="1">Rất dễ</DropdownItem>
                <DropdownItem key="2">Dễ</DropdownItem>
                <DropdownItem key="3">Trung bình</DropdownItem>
                <DropdownItem key="4">Khó</DropdownItem>
                <DropdownItem key="5">Rất khó</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {statusFilter === '' ? 'Tất cả trạng thái' : statusFilter ? 'Hoạt động' : 'Tạm dừng'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Status filter"
                selectionMode="single"
                selectedKeys={statusFilter === '' ? [] : [statusFilter.toString()]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string | undefined;
                  if (!selected || selected === '') {
                    setStatusFilter('');
                  } else {
                    setStatusFilter(selected === 'true');
                  }
                }}
              >
                <DropdownItem key="">Tất cả trạng thái</DropdownItem>
                <DropdownItem key="true">Hoạt động</DropdownItem>
                <DropdownItem key="false">Tạm dừng</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="p-4">
          {!selectedModuleId ? (
            <div className="text-center py-8 text-gray-500">
              Vui lòng chọn một chương để xem danh sách bài học
            </div>
          ) : (
            <DataTable
              data={paginatedSections}
              columns={columns}
              isLoading={sectionsLoading}
              pagination={{
                pageIndex: currentPage - 1,
                pageSize,
                pageCount: totalPages,
                total: filteredSections.length,
                onPageChange: setCurrentPage,
              }}
              emptyContent="Không tìm thấy bài học nào"
              removeWrapper
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateSectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSection}
        isLoading={isCreating}
        moduleId={selectedModuleId}
        modules={modules}
      />

      <EditSectionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSection(null);
        }}
        onSubmit={handleUpdateSection}
        section={selectedSection}
        isLoading={isUpdating}
      />
    </div>
  );
};

// Section Modal Components
interface SectionFormData {
  name: string;
  description: string;
  module_id: string;
  section_number: number;
  estimated_hours: number;
  difficulty_level: DifficultyLevel;
  is_active: boolean;
}

interface CreateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SectionFormData) => void;
  isLoading?: boolean;
  moduleId: string;
  modules: Module[];
}

export const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  moduleId,
  modules,
}) => {
  const [formData, setFormData] = React.useState<SectionFormData>({
    name: '',
    description: '',
    module_id: moduleId,
    section_number: 1,
    estimated_hours: 1,
    difficulty_level: 3,
    is_active: true,
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof SectionFormData, string>>>({});

  // Update module_id when moduleId prop changes
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, module_id: moduleId }));
  }, [moduleId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SectionFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên bài học là bắt buộc';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên bài học phải có ít nhất 3 ký tự';
    }

    if (!formData.module_id) {
      newErrors.module_id = 'Vui lòng chọn chương';
    }

    if (formData.section_number < 1) {
      newErrors.section_number = 'Số thứ tự phải lớn hơn 0';
    }

    if (formData.estimated_hours < 0) {
      newErrors.estimated_hours = 'Thời lượng không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        module_id: moduleId,
        section_number: 1,
        estimated_hours: 1,
        difficulty_level: 3,
        is_active: true,
      });
      setErrors({});
    }
  }, [isOpen, moduleId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Tạo bài học mới</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Select
              label="Chương"
              placeholder="Chọn chương"
              selectedKeys={formData.module_id ? [formData.module_id] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, module_id: value });
                if (errors.module_id) setErrors({ ...errors, module_id: undefined });
              }}
              isRequired
              isInvalid={!!errors.module_id}
              errorMessage={errors.module_id}
            >
              {modules.map((module) => (
                <SelectItem key={module.id}>
                  {module.name}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Tên bài học"
              placeholder="Nhập tên bài học"
              value={formData.name}
              onValueChange={(value) => {
                setFormData({ ...formData, name: value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name}
            />
            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả bài học"
              value={formData.description}
              onValueChange={(value) => setFormData({ ...formData, description: value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Số thứ tự"
                placeholder="1"
                value={formData.section_number.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, section_number: parseInt(value) || 1 });
                  if (errors.section_number) setErrors({ ...errors, section_number: undefined });
                }}
                isInvalid={!!errors.section_number}
                errorMessage={errors.section_number}
              />
              <Input
                type="number"
                label="Thời lượng (giờ)"
                placeholder="1"
                value={formData.estimated_hours.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, estimated_hours: parseInt(value) || 0 });
                  if (errors.estimated_hours) setErrors({ ...errors, estimated_hours: undefined });
                }}
                isInvalid={!!errors.estimated_hours}
                errorMessage={errors.estimated_hours}
              />
            </div>
            <Select
              label="Độ khó"
              selectedKeys={[formData.difficulty_level.toString()]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, difficulty_level: parseInt(value) as DifficultyLevel });
              }}
            >
              <SelectItem key="1">Rất dễ</SelectItem>
              <SelectItem key="2">Dễ</SelectItem>
              <SelectItem key="3">Trung bình</SelectItem>
              <SelectItem key="4">Khó</SelectItem>
              <SelectItem key="5">Rất khó</SelectItem>
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
            Hủy
          </Button>
          <Button color="danger" onPress={handleSubmit} isLoading={isLoading}>
            Tạo bài học
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SectionFormData, 'module_id'>) => void;
  section: SectionListItem | null;
  isLoading?: boolean;
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  section,
  isLoading,
}) => {
  const [formData, setFormData] = React.useState<Omit<SectionFormData, 'module_id'>>({
    name: '',
    description: '',
    section_number: 1,
    estimated_hours: 1,
    difficulty_level: 3,
    is_active: true,
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof SectionFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SectionFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên bài học là bắt buộc';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên bài học phải có ít nhất 3 ký tự';
    }

    if (formData.section_number < 1) {
      newErrors.section_number = 'Số thứ tự phải lớn hơn 0';
    }

    if (formData.estimated_hours < 0) {
      newErrors.estimated_hours = 'Thời lượng không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        description: section.description || '',
        section_number: section.section_number || 1,
        estimated_hours: section.estimated_hours || 0,
        difficulty_level: section.difficulty_level,
        is_active: section.is_active,
      });
      setErrors({});
    }
  }, [section]);

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Chỉnh sửa bài học</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Tên bài học"
              placeholder="Nhập tên bài học"
              value={formData.name}
              onValueChange={(value) => {
                setFormData({ ...formData, name: value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name}
            />
            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả bài học"
              value={formData.description}
              onValueChange={(value) => setFormData({ ...formData, description: value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Số thứ tự"
                placeholder="1"
                value={formData.section_number.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, section_number: parseInt(value) || 1 });
                  if (errors.section_number) setErrors({ ...errors, section_number: undefined });
                }}
                isInvalid={!!errors.section_number}
                errorMessage={errors.section_number}
              />
              <Input
                type="number"
                label="Thời lượng (giờ)"
                placeholder="1"
                value={formData.estimated_hours.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, estimated_hours: parseInt(value) || 0 });
                  if (errors.estimated_hours) setErrors({ ...errors, estimated_hours: undefined });
                }}
                isInvalid={!!errors.estimated_hours}
                errorMessage={errors.estimated_hours}
              />
            </div>
            <Select
              label="Độ khó"
              selectedKeys={[formData.difficulty_level.toString()]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, difficulty_level: parseInt(value) as DifficultyLevel });
              }}
            >
              <SelectItem key="1">Rất dễ</SelectItem>
              <SelectItem key="2">Dễ</SelectItem>
              <SelectItem key="3">Trung bình</SelectItem>
              <SelectItem key="4">Khó</SelectItem>
              <SelectItem key="5">Rất khó</SelectItem>
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
            Hủy
          </Button>
          <Button color="danger" onPress={handleSubmit} isLoading={isLoading}>
            Lưu thay đổi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
