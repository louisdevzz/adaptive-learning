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
import { courseAPI } from '@/lib/api';
import { useCourses } from '@/hooks/use-admin-data';
import type { Course, DifficultyLevel, UserStats } from '@/types';

interface CourseListItem extends Course {
  students_count?: number;
  modules_count?: number;
  completion_rate?: number;
}

interface CourseManagementProps {
  userStats: UserStats | null;
  onDataChange?: () => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  userStats,
  onDataChange,
}) => {
  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | ''>('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 10;

  // Use custom hook for courses data
  const { data: coursesData, isLoading: coursesLoading, mutate } = useCourses();

  // Derived values
  const courses = (coursesData?.items || []) as CourseListItem[];
  const totalCourses = coursesData?.total || 0;

  // Filtered courses
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter(course => {
      const matchesSearch = searchQuery === '' ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === '' || course.difficulty_level === difficultyFilter;
      const matchesStatus = statusFilter === '' || course.is_active === statusFilter;
      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [courses, searchQuery, difficultyFilter, statusFilter]);

  // Paginated courses
  const paginatedCourses = useMemo(() => {
    return filteredCourses.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredCourses, currentPage]);

  const totalPages = useMemo(() => Math.ceil(filteredCourses.length / pageSize), [filteredCourses.length]);

  // Course stats
  const courseStats = useMemo(() => ({
    totalCourses: totalCourses,
    activeCourses: courses?.filter(c => c.is_active).length || 0,
    totalStudents: userStats?.total_students || 0,
    avgCompletion: 65,
  }), [totalCourses, courses, userStats?.total_students]);

  // Handlers
  const handleCreateCourse = useCallback(async (data: {
    name: string;
    description: string;
    code: string;
    grade_level: number;
    academic_year: number;
    difficulty_level: DifficultyLevel;
    is_active: boolean;
  }) => {
    try {
      setIsCreating(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang tạo khóa học mới...',
        color: 'primary',
      });
      await courseAPI.createCourse(data);
      addToast({
        title: 'Thành công',
        description: `Đã tạo khóa học "${data.name}" thành công`,
        color: 'success',
      });
      setShowCreateModal(false);
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to create course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo khóa học';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsCreating(false);
    }
  }, [mutate, onDataChange]);

  const handleUpdateCourse = useCallback(async (data: {
    name: string;
    description: string;
    code: string;
    grade_level: number;
    academic_year: number;
    difficulty_level: DifficultyLevel;
    is_active: boolean;
  }) => {
    if (!selectedCourse) return;
    try {
      setIsUpdating(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang cập nhật khóa học...',
        color: 'primary',
      });
      await courseAPI.updateCourse(selectedCourse.id, data);
      addToast({
        title: 'Thành công',
        description: `Đã cập nhật khóa học "${data.name}" thành công`,
        color: 'success',
      });
      setShowEditModal(false);
      setSelectedCourse(null);
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to update course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật khóa học';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedCourse, mutate, onDataChange]);

  const handleDeleteCourse = useCallback(async (courseId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
    const course = courses.find(c => c.id === courseId);
    try {
      setIsDeleting(true);
      addToast({
        title: 'Đang xử lý',
        description: 'Đang xóa khóa học...',
        color: 'primary',
      });
      await courseAPI.deleteCourse(courseId);
      addToast({
        title: 'Thành công',
        description: `Đã xóa khóa học "${course?.name || ''}" thành công`,
        color: 'success',
      });
      mutate();
      onDataChange?.();
    } catch (error) {
      console.error('Failed to delete course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa khóa học';
      addToast({
        title: 'Lỗi',
        description: errorMessage,
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [courses, mutate, onDataChange]);

  const handleToggleCourseStatus = useCallback(async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        addToast({
          title: 'Đang xử lý',
          description: `Đang ${course.is_active ? 'tạm dừng' : 'kích hoạt'} khóa học...`,
          color: 'primary',
        });
        await courseAPI.updateCourse(courseId, { is_active: !course.is_active });
        addToast({
          title: 'Thành công',
          description: `Đã ${course.is_active ? 'tạm dừng' : 'kích hoạt'} khóa học "${course.name}"`,
          color: 'success',
        });
        mutate();
        onDataChange?.();
      }
    } catch (error) {
      console.error('Failed to toggle course status:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể thay đổi trạng thái khóa học',
        color: 'danger',
      });
    }
  }, [courses, mutate, onDataChange]);

  const handleViewCourse = useCallback((courseId: string) => {
    window.location.href = `/courses/${courseId}`;
  }, []);

  const handleDuplicateCourse = useCallback(async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        addToast({
          title: 'Đang xử lý',
          description: 'Đang nhân bản khóa học...',
          color: 'primary',
        });
        await courseAPI.createCourse({
          name: `${course.name} (Copy)`,
          description: course.description,
          code: `${course.code}-COPY`,
          grade_level: course.grade_level,
          academic_year: course.academic_year,
          difficulty_level: course.difficulty_level,
          is_active: false,
        });
        addToast({
          title: 'Thành công',
          description: `Đã nhân bản khóa học "${course.name}"`,
          color: 'success',
        });
        mutate();
        onDataChange?.();
      }
    } catch (error) {
      console.error('Failed to duplicate course:', error);
      addToast({
        title: 'Lỗi',
        description: 'Không thể nhân bản khóa học',
        color: 'danger',
      });
    }
  }, [courses, mutate, onDataChange]);

  const openEditModal = useCallback((course: CourseListItem) => {
    setSelectedCourse(course);
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

  const columns: ColumnDef<CourseListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Khóa học',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{row.original.name}</span>
            <span className="text-sm text-gray-500">{row.original.code}</span>
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
        accessorKey: 'modules_count',
        header: 'Modules',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.modules_count || 0}</span>
        ),
      },
      {
        accessorKey: 'students_count',
        header: 'Học sinh',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{row.original.students_count || 0}</span>
          </div>
        ),
      },
      {
        accessorKey: 'completion_rate',
        header: 'Tiến độ',
        cell: ({ row }) => (
          <div className="w-24">
            <Progress
              value={row.original.completion_rate || 0}
              size="sm"
              color="primary"
              className="max-w-md"
            />
            <span className="text-xs text-gray-500">{row.original.completion_rate || 0}%</span>
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
            <DropdownMenu aria-label="Course actions">
              <DropdownItem
                key="view"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => handleViewCourse(row.original.id)}
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
                onPress={() => handleDuplicateCourse(row.original.id)}
              >
                Nhân bản
              </DropdownItem>
              <DropdownItem
                key="toggle"
                startContent={row.original.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                onPress={() => handleToggleCourseStatus(row.original.id)}
              >
                {row.original.is_active ? 'Tạm dừng' : 'Kích hoạt'}
              </DropdownItem>
              <DropdownItem
                key="delete"
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={() => handleDeleteCourse(row.original.id)}
              >
                Xóa
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [handleViewCourse, openEditModal, handleDuplicateCourse, handleToggleCourseStatus, handleDeleteCourse]
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
              <p className="text-2xl font-bold text-gray-900">{courseStats.totalCourses}</p>
              <p className="text-gray-600 text-sm">Tổng khóa học</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{courseStats.activeCourses}</p>
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
              <p className="text-2xl font-bold text-indigo-600">{courseStats.totalStudents}</p>
              <p className="text-gray-600 text-sm">Tổng học sinh</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{courseStats.avgCompletion}%</p>
              <p className="text-gray-600 text-sm">Hoàn thành TB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              Danh sách khóa học
            </h3>
            <Button
              color="danger"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setShowCreateModal(true)}
            >
              Tạo khóa học
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              isClearable
              className="flex-1"
              placeholder="Tìm kiếm theo tên hoặc mã khóa học..."
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
          <DataTable
            data={paginatedCourses}
            columns={columns}
            isLoading={coursesLoading}
            pagination={{
              pageIndex: currentPage - 1,
              pageSize,
              pageCount: totalPages,
              total: filteredCourses.length,
              onPageChange: setCurrentPage,
            }}
            emptyContent="Không tìm thấy khóa học nào"
            removeWrapper
          />
        </div>
      </div>

      {/* Modals */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCourse}
        isLoading={isCreating}
      />

      <EditCourseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleUpdateCourse}
        course={selectedCourse}
        isLoading={isUpdating}
      />
    </div>
  );
};

// Course Modal Components
interface CourseFormData {
  name: string;
  description: string;
  code: string;
  grade_level: number;
  academic_year: number;
  difficulty_level: DifficultyLevel;
  is_active: boolean;
}

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => void;
  isLoading?: boolean;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = React.useState<CourseFormData>({
    name: '',
    description: '',
    code: '',
    grade_level: 10,
    academic_year: new Date().getFullYear(),
    difficulty_level: 3,
    is_active: true,
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof CourseFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên khóa học là bắt buộc';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên khóa học phải có ít nhất 3 ký tự';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã khóa học là bắt buộc';
    } else if (!/^[A-Za-z0-9-_]+$/.test(formData.code)) {
      newErrors.code = 'Mã khóa học chỉ được chứa chữ cái, số, gạch ngang và gạch dưới';
    }

    if (formData.grade_level < 1 || formData.grade_level > 12) {
      newErrors.grade_level = 'Khối lớp phải từ 1 đến 12';
    }

    if (formData.academic_year < 2000 || formData.academic_year > 2100) {
      newErrors.academic_year = 'Năm học không hợp lệ';
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
        code: '',
        grade_level: 10,
        academic_year: new Date().getFullYear(),
        difficulty_level: 3,
        is_active: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Tạo khóa học mới</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Tên khóa học"
              placeholder="Nhập tên khóa học"
              value={formData.name}
              onValueChange={(value) => {
                setFormData({ ...formData, name: value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name}
            />
            <Input
              label="Mã khóa học"
              placeholder="VD: MATH-10-2024"
              value={formData.code}
              onValueChange={(value) => {
                setFormData({ ...formData, code: value });
                if (errors.code) setErrors({ ...errors, code: undefined });
              }}
              isRequired
              isInvalid={!!errors.code}
              errorMessage={errors.code}
            />
            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả khóa học"
              value={formData.description}
              onValueChange={(value) => setFormData({ ...formData, description: value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Khối lớp"
                placeholder="10"
                value={formData.grade_level.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, grade_level: parseInt(value) || 10 });
                  if (errors.grade_level) setErrors({ ...errors, grade_level: undefined });
                }}
                isInvalid={!!errors.grade_level}
                errorMessage={errors.grade_level}
              />
              <Input
                type="number"
                label="Năm học"
                placeholder="2024"
                value={formData.academic_year.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, academic_year: parseInt(value) || new Date().getFullYear() });
                  if (errors.academic_year) setErrors({ ...errors, academic_year: undefined });
                }}
                isInvalid={!!errors.academic_year}
                errorMessage={errors.academic_year}
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
            Tạo khóa học
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => void;
  course: CourseListItem | null;
  isLoading?: boolean;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  course,
  isLoading,
}) => {
  const [formData, setFormData] = React.useState<CourseFormData>({
    name: '',
    description: '',
    code: '',
    grade_level: 10,
    academic_year: new Date().getFullYear(),
    difficulty_level: 3,
    is_active: true,
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof CourseFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên khóa học là bắt buộc';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên khóa học phải có ít nhất 3 ký tự';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã khóa học là bắt buộc';
    } else if (!/^[A-Za-z0-9-_]+$/.test(formData.code)) {
      newErrors.code = 'Mã khóa học chỉ được chứa chữ cái, số, gạch ngang và gạch dưới';
    }

    if (formData.grade_level < 1 || formData.grade_level > 12) {
      newErrors.grade_level = 'Khối lớp phải từ 1 đến 12';
    }

    if (formData.academic_year < 2000 || formData.academic_year > 2100) {
      newErrors.academic_year = 'Năm học không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description || '',
        code: course.code,
        grade_level: course.grade_level || 10,
        academic_year: course.academic_year || new Date().getFullYear(),
        difficulty_level: course.difficulty_level,
        is_active: course.is_active,
      });
      setErrors({});
    }
  }, [course]);

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Chỉnh sửa khóa học</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Tên khóa học"
              placeholder="Nhập tên khóa học"
              value={formData.name}
              onValueChange={(value) => {
                setFormData({ ...formData, name: value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name}
            />
            <Input
              label="Mã khóa học"
              placeholder="VD: MATH-10-2024"
              value={formData.code}
              onValueChange={(value) => {
                setFormData({ ...formData, code: value });
                if (errors.code) setErrors({ ...errors, code: undefined });
              }}
              isRequired
              isInvalid={!!errors.code}
              errorMessage={errors.code}
            />
            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả khóa học"
              value={formData.description}
              onValueChange={(value) => setFormData({ ...formData, description: value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Khối lớp"
                placeholder="10"
                value={formData.grade_level.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, grade_level: parseInt(value) || 10 });
                  if (errors.grade_level) setErrors({ ...errors, grade_level: undefined });
                }}
                isInvalid={!!errors.grade_level}
                errorMessage={errors.grade_level}
              />
              <Input
                type="number"
                label="Năm học"
                placeholder="2024"
                value={formData.academic_year.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, academic_year: parseInt(value) || new Date().getFullYear() });
                  if (errors.academic_year) setErrors({ ...errors, academic_year: undefined });
                }}
                isInvalid={!!errors.academic_year}
                errorMessage={errors.academic_year}
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
