'use client';

import React, { useMemo } from 'react';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Progress } from '@heroui/progress';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  Eye,
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import type { TeacherStats, Course } from '@/types';

interface StudentActivity {
  id: string;
  name: string;
  progress: number;
  lastActive: string;
  course?: string;
}

interface TeacherOverviewProps {
  stats: TeacherStats;
  courses: Course[];
  recentStudents: StudentActivity[];
  atRiskStudents: StudentActivity[];
  onCreateCourse?: () => void;
  onViewStudent?: (studentId: string) => void;
  onSupportStudent?: (studentId: string) => void;
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({
  stats,
  courses,
  recentStudents,
  atRiskStudents,
  onCreateCourse,
  onViewStudent,
  onSupportStudent,
}) => {
  const getProgressColor = (progress: number): "success" | "warning" | "danger" => {
    if (progress >= 70) return 'success';
    if (progress >= 50) return 'warning';
    return 'danger';
  };

  const studentColumns: ColumnDef<StudentActivity>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Học sinh',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {row.original.name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{row.original.name}</p>
              <p className="text-xs text-gray-500">{row.original.lastActive}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'progress',
        header: 'Tiến độ',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress
              value={row.original.progress}
              color={getProgressColor(row.original.progress)}
              size="sm"
              className="max-w-24"
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
        accessorKey: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onPress={() => onViewStudent?.(row.original.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    [onViewStudent]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">+12 tháng này</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total_students}</p>
          <p className="text-gray-600">Tổng học sinh</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-blue-600 font-semibold">{stats.active_courses} đang hoạt động</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total_courses}</p>
          <p className="text-gray-600">Khóa học</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">+5% tuần này</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.avg_student_progress}%</p>
          <p className="text-gray-600">Tiến độ TB</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-red-600 font-semibold">Cần chú ý</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{atRiskStudents.length}</p>
          <p className="text-gray-600">HS cần hỗ trợ</p>
        </div>
      </div>

      {/* Recent Activity & At-Risk Students */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Hoạt động gần đây
            </h3>
          </div>
          <div className="p-0">
            <DataTable
              data={recentStudents.slice(0, 5)}
              columns={studentColumns}
              emptyContent="Chưa có hoạt động nào"
              removeWrapper={true}
            />
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Học sinh cần hỗ trợ
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {atRiskStudents.length > 0 ? (
              atRiskStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-red-500">Tiến độ: {student.progress}%</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    onPress={() => onSupportStudent?.(student.id)}
                  >
                    Hỗ trợ
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Không có học sinh cần hỗ trợ</p>
            )}
          </div>
        </div>
      </div>

      {/* Courses Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-600" />
            Khóa học của tôi
          </h3>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onCreateCourse}
          >
            Tạo khóa học
          </Button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-4">
          {courses.length > 0 ? (
            courses.slice(0, 6).map((course) => (
              <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer">
                <h4 className="font-semibold text-gray-900 mb-2">{course.name}</h4>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description || 'Không có mô tả'}</p>
                <div className="flex items-center justify-between text-sm">
                  <Chip
                    color={course.is_active ? 'success' : 'default'}
                    size="sm"
                    variant="flat"
                  >
                    {course.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                  </Chip>
                  <span className="text-gray-500">Cấp độ {course.difficulty_level}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              Chưa có khóa học nào. Hãy tạo khóa học đầu tiên!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
