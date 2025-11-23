'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Select, SelectItem } from '@heroui/select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/modal';
import { Textarea } from '@heroui/input';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import {
  BookOpen,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Users,
  Clock,
  BarChart3,
} from 'lucide-react';
import type { Course } from '@/types';

interface TeacherCourseManagementProps {
  courses?: Course[];
  onCreateCourse?: (course: Partial<Course>) => void;
  onEditCourse?: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onViewCourse?: (courseId: string) => void;
}

export const TeacherCourseManagement: React.FC<TeacherCourseManagementProps> = ({
  courses: initialCourses,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onViewCourse,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty_level: 1,
    is_active: true,
  });

  // Mock course data
  const [courses] = useState<Course[]>(initialCourses || [
    {
      id: '1',
      name: 'Toán học nâng cao',
      description: 'Khóa học toán học dành cho học sinh lớp 10-12',
      difficulty_level: 3,
      is_active: true,
      created_at: '2024-01-15',
      updated_at: '2024-03-20',
    },
    {
      id: '2',
      name: 'Vật lý đại cương',
      description: 'Kiến thức vật lý cơ bản và nâng cao',
      difficulty_level: 2,
      is_active: true,
      created_at: '2024-02-01',
      updated_at: '2024-03-18',
    },
    {
      id: '3',
      name: 'Hóa học hữu cơ',
      description: 'Chuyên sâu về hóa học hữu cơ',
      difficulty_level: 4,
      is_active: false,
      created_at: '2024-01-20',
      updated_at: '2024-02-28',
    },
    {
      id: '4',
      name: 'Sinh học tế bào',
      description: 'Tìm hiểu về cấu trúc và chức năng tế bào',
      difficulty_level: 2,
      is_active: true,
      created_at: '2024-03-01',
      updated_at: '2024-03-15',
    },
    {
      id: '5',
      name: 'Ngữ văn 12',
      description: 'Ôn tập và nâng cao kỹ năng văn học',
      difficulty_level: 3,
      is_active: true,
      created_at: '2024-02-15',
      updated_at: '2024-03-10',
    },
  ]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && course.is_active) ||
        (statusFilter === 'inactive' && !course.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [courses, searchQuery, statusFilter]);

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        description: course.description || '',
        difficulty_level: course.difficulty_level,
        is_active: course.is_active,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        description: '',
        difficulty_level: 1,
        is_active: true,
      });
    }
    onOpen();
  };

  const handleSubmit = () => {
    if (editingCourse) {
      onEditCourse?.({ ...editingCourse, ...formData });
    } else {
      onCreateCourse?.(formData);
    }
    onOpenChange();
  };

  // Stats
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.is_active).length;
  const avgDifficulty = Math.round(courses.reduce((acc, c) => acc + c.difficulty_level, 0) / courses.length * 10) / 10;

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Cơ bản';
      case 2:
        return 'Trung bình';
      case 3:
        return 'Nâng cao';
      case 4:
        return 'Chuyên sâu';
      case 5:
        return 'Expert';
      default:
        return `Cấp ${level}`;
    }
  };

  const getDifficultyColor = (level: number): "success" | "primary" | "warning" | "danger" | "secondary" => {
    if (level <= 1) return 'success';
    if (level <= 2) return 'primary';
    if (level <= 3) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
              <p className="text-sm text-gray-600">Tổng khóa học</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCourses}</p>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgDifficulty}</p>
              <p className="text-sm text-gray-600">Độ khó TB</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-600">Tổng học sinh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Quản lý khóa học</h3>
            </div>
            <Button
              size="sm"
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => handleOpenModal()}
            >
              Tạo khóa học
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="flex-1"
              size="sm"
            />
            <Select
              placeholder="Trạng thái"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
              className="w-40"
              size="sm"
            >
              <SelectItem key="all">Tất cả</SelectItem>
              <SelectItem key="active">Đang hoạt động</SelectItem>
              <SelectItem key="inactive">Tạm dừng</SelectItem>
            </Select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="p-4 grid grid-cols-3 gap-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">{course.name}</h4>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Course actions">
                      <DropdownItem
                        key="view"
                        startContent={<Eye className="w-4 h-4" />}
                        onPress={() => onViewCourse?.(course.id)}
                      >
                        Xem chi tiết
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        startContent={<Pencil className="w-4 h-4" />}
                        onPress={() => handleOpenModal(course)}
                      >
                        Chỉnh sửa
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        startContent={<Trash2 className="w-4 h-4" />}
                        className="text-danger"
                        color="danger"
                        onPress={() => onDeleteCourse?.(course.id)}
                      >
                        Xóa
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description || 'Không có mô tả'}</p>
                <div className="flex items-center justify-between">
                  <Chip
                    color={course.is_active ? 'success' : 'default'}
                    size="sm"
                    variant="flat"
                  >
                    {course.is_active ? 'Hoạt động' : 'Tạm dừng'}
                  </Chip>
                  <Chip
                    color={getDifficultyColor(course.difficulty_level)}
                    size="sm"
                    variant="dot"
                  >
                    {getDifficultyLabel(course.difficulty_level)}
                  </Chip>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(course.updated_at).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    -- học sinh
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              Không tìm thấy khóa học nào
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Tên khóa học"
                    placeholder="Nhập tên khóa học"
                    value={formData.name}
                    onValueChange={(value) => setFormData({ ...formData, name: value })}
                    isRequired
                  />
                  <Textarea
                    label="Mô tả"
                    placeholder="Nhập mô tả khóa học"
                    value={formData.description}
                    onValueChange={(value) => setFormData({ ...formData, description: value })}
                  />
                  <Select
                    label="Độ khó"
                    selectedKeys={[formData.difficulty_level.toString()]}
                    onSelectionChange={(keys) =>
                      setFormData({ ...formData, difficulty_level: parseInt(Array.from(keys)[0] as string) })
                    }
                  >
                    <SelectItem key="1">Cơ bản</SelectItem>
                    <SelectItem key="2">Trung bình</SelectItem>
                    <SelectItem key="3">Nâng cao</SelectItem>
                    <SelectItem key="4">Chuyên sâu</SelectItem>
                    <SelectItem key="5">Expert</SelectItem>
                  </Select>
                  <Select
                    label="Trạng thái"
                    selectedKeys={[formData.is_active ? 'active' : 'inactive']}
                    onSelectionChange={(keys) =>
                      setFormData({ ...formData, is_active: Array.from(keys)[0] === 'active' })
                    }
                  >
                    <SelectItem key="active">Hoạt động</SelectItem>
                    <SelectItem key="inactive">Tạm dừng</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {editingCourse ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
