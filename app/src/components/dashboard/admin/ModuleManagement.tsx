'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Progress } from '@heroui/progress';
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
  BookOpen,
  Search,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  GraduationCap,
  Users,
  BarChart3,
  Copy,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { moduleAPI } from '@/lib/api';
import { useModules, useCourses } from '@/hooks/use-admin-data';
import type { Module, Course, DifficultyLevel, UserStats } from '@/types';

interface ModuleListItem extends Module {
  sections_count?: number;
  course_name?: string;
}

interface ModuleManagementProps {
  userStats: UserStats | null;
  onDataChange?: () => void;
}

export const ModuleManagement: React.FC<ModuleManagementProps> = ({
  userStats,
  onDataChange,
}) => {
  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | ''>('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleListItem | null>(null);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 10;

  // Use custom hooks for data
  const { data: modulesData, isLoading: modulesLoading, mutate } = useModules();
  const { data: coursesData } = useCourses();

  // Derived values
  const modules = (modulesData?.items || []) as ModuleListItem[];
  const totalModules = modulesData?.total || 0;
  const courses = (coursesData?.items || []) as Course[];

  // Filtered modules
  const filteredModules = useMemo(() => {
    if (!modules) return [];
    return modules.filter(module => {
      const matchesSearch = searchQuery === '' ||
        module.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === '' || module.difficulty_level === difficultyFilter;
      const matchesStatus = statusFilter === '' || module.is_active === statusFilter;
      const matchesCourse = courseFilter === '' || module.course_id === courseFilter;
      return matchesSearch && matchesDifficulty && matchesStatus && matchesCourse;
    });
  }, [modules, searchQuery, difficultyFilter, statusFilter, courseFilter]);

  // Paginated modules
  const paginatedModules = useMemo(() => {
    return filteredModules.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredModules, currentPage]);

  const totalPages = useMemo(() => Math.ceil(filteredModules.length / pageSize), [filteredModules.length]);

  // Module stats
  const moduleStats = useMemo(() => ({
    totalModules: totalModules,
    activeModules: modules?.filter(m => m.is_active).length || 0,
    totalCourses: courses?.length || 0,
    avgEstimatedHours: modules?.length > 0
      ? Math.round(modules.reduce((sum, m) => sum + (m.estimated_hours || 0), 0) / modules.length)
      : 0,
  }), [totalModules, modules, courses]);

  // Handlers
  const handleCreateModule = useCallback(async (data: {
    name: string;
    description: string;
    course_id: string;
    module_number: number;
    estimated_hours: number;
    difficulty_level: DifficultyLevel;
    is_active: boolean;
  }) => {
    try {
      setIsCreating(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang tạo chương mới...',
        color: 'primary',
      });
      await moduleAPI.createModule(data);
      addToast({
        title: 'Thành công',
        description: `Đã tạo chương "${data.name}" thành công`,
        color: 'success',
      });
      setShowCreateModal(false);
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to create module:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo chương';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsCreating(false);
    }
  }, [mutate, onDataChange]);

  const handleUpdateModule = useCallback(async (data: {
    name: string;
    description: string;
    course_id: string;
    module_number: number;
    estimated_hours: number;
    difficulty_level: DifficultyLevel;
    is_active: boolean;
  }) => {
    if (!selectedModule) return;
    try {
      setIsUpdating(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang cập nhật chương...',
        color: 'primary',
      });
      await moduleAPI.updateModule(selectedModule.id, data);
      addToast({
        title: 'Thành công',
        description: `Đã cập nhật chương "${data.name}" thành công`,
        color: 'success',
      });
      setShowEditModal(false);
      setSelectedModule(null);
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to update module:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật chương';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedModule, mutate, onDataChange]);

  const handleDeleteModule = useCallback(async (moduleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chương này?')) return;
    const module = modules.find(m => m.id === moduleId);
    try {
      setIsDeleting(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang xóa chương...',
        color: 'primary',
      });
      await moduleAPI.deleteModule(moduleId);
      addToast({
        title: 'Thành công',
        description: `Đã xóa chương "${module?.name || ''}" thành công`,
        color: 'success',
      });
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to delete module:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa chương';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [modules, mutate, onDataChange]);

  const handleToggleModuleStatus = useCallback(async (moduleId: string) => {
    try {
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        addToast({
          title: 'Đang xử lý',
          description: `Đang ${module.is_active ? 'tạm dừng' : 'kích hoạt'} chương...`,
          color: 'primary',
        });
        await moduleAPI.updateModule(moduleId, { is_active: !module.is_active });
        addToast({
          title: 'Thành công',
          description: `Đã ${module.is_active ? 'tạm dừng' : 'kích hoạt'} chương "${module.name}"`,
          color: 'success',
        });
        mutate();
        onDataChange?.();
      }
    } catch (error) {
      console.error('Failed to toggle module status:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể thay đổi trạng thái chương',
        color: 'danger',
      });
    }
  }, [modules, mutate, onDataChange]);

  const handleViewModule = useCallback((moduleId: string) => {
    window.location.href = `/modules/${moduleId}`;
  }, []);

  const handleDuplicateModule = useCallback(async (moduleId: string) => {
    try {
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        addToast({
          title: 'Đang xử lý',
          description: 'Đang nhân bản chương...',
          color: 'primary',
        });
        await moduleAPI.createModule({
          name: `${module.name} (Copy)`,
          description: module.description,
          course_id: module.course_id,
          module_number: module.module_number + 100,
          estimated_hours: module.estimated_hours,
          difficulty_level: module.difficulty_level,
          is_active: false,
        });
        addToast({
          title: 'Thành công',
          description: `Đã nhân bản chương "${module.name}"`,
          color: 'success',
        });
        mutate();
        onDataChange?.();
      }
    } catch (error) {
      console.error('Failed to duplicate module:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể nhân bản chương',
        color: 'danger',
      });
    }
  }, [modules, mutate, onDataChange]);

  const openEditModal = useCallback((module: ModuleListItem) => {
    setSelectedModule(module);
    setShowEditModal(true);
  }, []);

  const getCourseName = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'N/A';
  }, [courses]);

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

  const columns: ColumnDef<ModuleListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Chương',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{row.original.name}</span>
            <span className="text-sm text-gray-500">#{row.original.module_number}</span>
          </div>
        ),
      },
      {
        accessorKey: 'course_id',
        header: 'Khóa học',
        cell: ({ row }) => (
          <span className="text-gray-600">{getCourseName(row.original.course_id)}</span>
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
          <span className="text-gray-600">{row.original.estimated_hours || 0}h</span>
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
            <DropdownMenu aria-label="Module actions">
              <DropdownItem
                key="view"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => handleViewModule(row.original.id)}
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
                key="duplicate"
                startContent={<Copy className="w-4 h-4" />}
                onPress={() => handleDuplicateModule(row.original.id)}
              >
                Nhân bản
              </DropdownItem>
              <DropdownItem
                key="toggle"
                startContent={row.original.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                onPress={() => handleToggleModuleStatus(row.original.id)}
              >
                {row.original.is_active ? 'Tạm dừng' : 'Kích hoạt'}
              </DropdownItem>
              <DropdownItem
                key="delete"
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={() => handleDeleteModule(row.original.id)}
              >
                Xóa
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [handleViewModule, openEditModal, handleDuplicateModule, handleToggleModuleStatus, handleDeleteModule, getCourseName]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{moduleStats.totalModules}</p>
              <p className="text-gray-600 text-sm">Tổng chương</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{moduleStats.activeModules}</p>
              <p className="text-gray-600 text-sm">Đang hoạt động</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{moduleStats.totalCourses}</p>
              <p className="text-gray-600 text-sm">Tổng khóa học</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{moduleStats.avgEstimatedHours}h</p>
              <p className="text-gray-600 text-sm">Thời lượng TB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              Danh sách chương
            </h3>
            <Button
              color="danger"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setShowCreateModal(true)}
            >
              Tạo chương
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              isClearable
              className="flex-1"
              placeholder="Tìm kiếm theo tên chương..."
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
                  {courseFilter ? getCourseName(courseFilter) : 'Tất cả khóa học'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Course filter"
                selectionMode="single"
                selectedKeys={courseFilter ? [courseFilter] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string | undefined;
                  setCourseFilter(selected || '');
                  setCurrentPage(1);
                }}
                items={[{ id: '', name: 'Tất cả khóa học' }, ...courses]}
              >
                {(item) => (
                  <DropdownItem key={item.id}>{item.name}</DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
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
                  setCurrentPage(1);
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
                  setCurrentPage(1);
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
          <DataTable
            data={paginatedModules}
            columns={columns}
            isLoading={modulesLoading}
            pagination={{
              pageIndex: currentPage - 1,
              pageSize,
              pageCount: totalPages,
              total: filteredModules.length,
              onPageChange: setCurrentPage,
            }}
            emptyContent="Không tìm thấy chương nào"
            removeWrapper
          />
        </div>
      </div>

      {/* Modals */}
      <CreateModuleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateModule}
        isLoading={isCreating}
        courses={courses}
      />

      <EditModuleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedModule(null);
        }}
        onSubmit={handleUpdateModule}
        module={selectedModule}
        isLoading={isUpdating}
        courses={courses}
      />
    </div>
  );
};

// Module Modal Components
interface ModuleFormData {
  name: string;
  description: string;
  course_id: string;
  module_number: number;
  estimated_hours: number;
  difficulty_level: DifficultyLevel;
  is_active: boolean;
}

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormData) => void;
  isLoading?: boolean;
  courses: Course[];
}

export const CreateModuleModal: React.FC<CreateModuleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  courses,
}) => {
  const [formData, setFormData] = React.useState<ModuleFormData>({
    name: '',
    description: '',
    course_id: '',
    module_number: 1,
    estimated_hours: 1,
    difficulty_level: 3,
    is_active: true,
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof ModuleFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ModuleFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên chương là bắt buộc';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên chương phải có ít nhất 3 ký tự';
    }

    if (!formData.course_id) {
      newErrors.course_id = 'Vui lòng chọn khóa học';
    }

    if (formData.module_number < 1) {
      newErrors.module_number = 'Số thứ tự phải lớn hơn 0';
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
        course_id: '',
        module_number: 1,
        estimated_hours: 1,
        difficulty_level: 3,
        is_active: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Tạo chương mới</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Tên chương"
              placeholder="Nhập tên chương"
              value={formData.name}
              onValueChange={(value) => {
                setFormData({ ...formData, name: value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name}
            />
            <Select
              label="Khóa học"
              placeholder="Chọn khóa học"
              selectedKeys={formData.course_id ? [formData.course_id] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, course_id: value });
                if (errors.course_id) setErrors({ ...errors, course_id: undefined });
              }}
              isRequired
              isInvalid={!!errors.course_id}
              errorMessage={errors.course_id}
            >
              {courses.map(course => (
                <SelectItem key={course.id}>{course.name}</SelectItem>
              ))}
            </Select>
            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả chương"
              value={formData.description}
              onValueChange={(value) => setFormData({ ...formData, description: value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Số thứ tự"
                placeholder="1"
                value={formData.module_number.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, module_number: parseInt(value) || 1 });
                  if (errors.module_number) setErrors({ ...errors, module_number: undefined });
                }}
                isInvalid={!!errors.module_number}
                errorMessage={errors.module_number}
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
            Tạo chương
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface EditModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormData) => void;
  module: ModuleListItem | null;
  isLoading?: boolean;
  courses: Course[];
}

export const EditModuleModal: React.FC<EditModuleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  module,
  isLoading,
  courses,
}) => {
  const [formData, setFormData] = React.useState<ModuleFormData>({
    name: '',
    description: '',
    course_id: '',
    module_number: 1,
    estimated_hours: 1,
    difficulty_level: 3,
    is_active: true,
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof ModuleFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ModuleFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên chương là bắt buộc';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên chương phải có ít nhất 3 ký tự';
    }

    if (!formData.course_id) {
      newErrors.course_id = 'Vui lòng chọn khóa học';
    }

    if (formData.module_number < 1) {
      newErrors.module_number = 'Số thứ tự phải lớn hơn 0';
    }

    if (formData.estimated_hours < 0) {
      newErrors.estimated_hours = 'Thời lượng không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    if (module) {
      setFormData({
        name: module.name,
        description: module.description || '',
        course_id: module.course_id,
        module_number: module.module_number || 1,
        estimated_hours: module.estimated_hours || 0,
        difficulty_level: module.difficulty_level,
        is_active: module.is_active,
      });
      setErrors({});
    }
  }, [module]);

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Chỉnh sửa chương</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Tên chương"
              placeholder="Nhập tên chương"
              value={formData.name}
              onValueChange={(value) => {
                setFormData({ ...formData, name: value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name}
            />
            <Select
              label="Khóa học"
              placeholder="Chọn khóa học"
              selectedKeys={formData.course_id ? [formData.course_id] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, course_id: value });
                if (errors.course_id) setErrors({ ...errors, course_id: undefined });
              }}
              isRequired
              isInvalid={!!errors.course_id}
              errorMessage={errors.course_id}
            >
              {courses.map(course => (
                <SelectItem key={course.id}>{course.name}</SelectItem>
              ))}
            </Select>
            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả chương"
              value={formData.description}
              onValueChange={(value) => setFormData({ ...formData, description: value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Số thứ tự"
                placeholder="1"
                value={formData.module_number.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, module_number: parseInt(value) || 1 });
                  if (errors.module_number) setErrors({ ...errors, module_number: undefined });
                }}
                isInvalid={!!errors.module_number}
                errorMessage={errors.module_number}
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
