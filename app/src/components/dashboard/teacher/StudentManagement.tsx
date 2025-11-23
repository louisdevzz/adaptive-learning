'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';
import { Select, SelectItem } from '@heroui/select';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  MessageSquare,
  Mail,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  progress: number;
  lastActive: string;
  coursesEnrolled: number;
  status: 'active' | 'inactive' | 'at_risk';
  joinedDate: string;
}

interface StudentManagementProps {
  onViewStudent?: (studentId: string) => void;
  onMessageStudent?: (studentId: string) => void;
  onEmailStudent?: (studentId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  onViewStudent,
  onMessageStudent,
  onEmailStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');

  // Mock student data
  const students: Student[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      progress: 85,
      lastActive: '2 giờ trước',
      coursesEnrolled: 3,
      status: 'active',
      joinedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      progress: 72,
      lastActive: '5 giờ trước',
      coursesEnrolled: 2,
      status: 'active',
      joinedDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      progress: 45,
      lastActive: '1 ngày trước',
      coursesEnrolled: 4,
      status: 'at_risk',
      joinedDate: '2024-01-10',
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      email: 'phamthid@email.com',
      progress: 91,
      lastActive: '30 phút trước',
      coursesEnrolled: 2,
      status: 'active',
      joinedDate: '2024-03-05',
    },
    {
      id: '5',
      name: 'Hoàng Văn E',
      email: 'hoangvane@email.com',
      progress: 38,
      lastActive: '3 ngày trước',
      coursesEnrolled: 1,
      status: 'at_risk',
      joinedDate: '2024-02-28',
    },
    {
      id: '6',
      name: 'Vũ Thị F',
      email: 'vuthif@email.com',
      progress: 65,
      lastActive: '1 ngày trước',
      coursesEnrolled: 3,
      status: 'active',
      joinedDate: '2024-01-25',
    },
    {
      id: '7',
      name: 'Đỗ Văn G',
      email: 'dovang@email.com',
      progress: 0,
      lastActive: '2 tuần trước',
      coursesEnrolled: 2,
      status: 'inactive',
      joinedDate: '2024-02-15',
    },
    {
      id: '8',
      name: 'Bùi Thị H',
      email: 'buithih@email.com',
      progress: 78,
      lastActive: '4 giờ trước',
      coursesEnrolled: 4,
      status: 'active',
      joinedDate: '2024-03-10',
    },
  ];

  const getStatusColor = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case 'active':
        return 'success';
      case 'at_risk':
        return 'danger';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'at_risk':
        return 'Cần hỗ trợ';
      case 'inactive':
        return 'Không hoạt động';
      default:
        return status;
    }
  };

  const getProgressColor = (progress: number): "success" | "warning" | "danger" => {
    if (progress >= 70) return 'success';
    if (progress >= 50) return 'warning';
    return 'danger';
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

      let matchesProgress = true;
      if (progressFilter === 'high') matchesProgress = student.progress >= 70;
      else if (progressFilter === 'medium') matchesProgress = student.progress >= 50 && student.progress < 70;
      else if (progressFilter === 'low') matchesProgress = student.progress < 50;

      return matchesSearch && matchesStatus && matchesProgress;
    });
  }, [students, searchQuery, statusFilter, progressFilter]);

  const columns: ColumnDef<Student>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Học sinh',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              {row.original.name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{row.original.name}</p>
              <p className="text-sm text-gray-500">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'progress',
        header: 'Tiến độ',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-32">
            <Progress
              value={row.original.progress}
              color={getProgressColor(row.original.progress)}
              size="sm"
              className="flex-1"
            />
            <span className={`text-sm font-medium ${
              row.original.progress >= 70 ? 'text-green-600' :
              row.original.progress >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {row.original.progress}%
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'coursesEnrolled',
        header: 'Khóa học',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.coursesEnrolled} khóa</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <Chip
            color={getStatusColor(row.original.status)}
            size="sm"
            variant="flat"
            startContent={row.original.status === 'at_risk' ? <AlertTriangle className="w-3 h-3" /> : null}
          >
            {getStatusLabel(row.original.status)}
          </Chip>
        ),
      },
      {
        accessorKey: 'lastActive',
        header: 'Hoạt động cuối',
        cell: ({ row }) => (
          <span className="text-gray-500 text-sm">{row.original.lastActive}</span>
        ),
      },
      {
        accessorKey: 'actions',
        header: '',
        cell: ({ row }) => (
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                size="sm"
                variant="light"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Student actions">
              <DropdownItem
                key="view"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => onViewStudent?.(row.original.id)}
              >
                Xem chi tiết
              </DropdownItem>
              <DropdownItem
                key="message"
                startContent={<MessageSquare className="w-4 h-4" />}
                onPress={() => onMessageStudent?.(row.original.id)}
              >
                Nhắn tin
              </DropdownItem>
              <DropdownItem
                key="email"
                startContent={<Mail className="w-4 h-4" />}
                onPress={() => onEmailStudent?.(row.original.id)}
              >
                Gửi email
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [onViewStudent, onMessageStudent, onEmailStudent]
  );

  // Stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const atRiskStudents = students.filter(s => s.status === 'at_risk').length;
  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-sm text-gray-600">Tổng học sinh</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{atRiskStudents}</p>
              <p className="text-sm text-gray-600">Cần hỗ trợ</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
              <p className="text-sm text-gray-600">Tiến độ TB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Danh sách học sinh</h3>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Tìm kiếm học sinh..."
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
              startContent={<Filter className="w-4 h-4" />}
            >
              <SelectItem key="all">Tất cả</SelectItem>
              <SelectItem key="active">Hoạt động</SelectItem>
              <SelectItem key="at_risk">Cần hỗ trợ</SelectItem>
              <SelectItem key="inactive">Không hoạt động</SelectItem>
            </Select>
            <Select
              placeholder="Tiến độ"
              selectedKeys={[progressFilter]}
              onSelectionChange={(keys) => setProgressFilter(Array.from(keys)[0] as string)}
              className="w-40"
              size="sm"
            >
              <SelectItem key="all">Tất cả</SelectItem>
              <SelectItem key="high">Cao (&gt;70%)</SelectItem>
              <SelectItem key="medium">TB (50-70%)</SelectItem>
              <SelectItem key="low">Thấp (&lt;50%)</SelectItem>
            </Select>
          </div>
        </div>

        <div className="">
          <DataTable
            data={filteredStudents}
            columns={columns}
            emptyContent="Không tìm thấy học sinh nào"
            removeWrapper={true}
          />
        </div>
      </div>
    </div>
  );
};
