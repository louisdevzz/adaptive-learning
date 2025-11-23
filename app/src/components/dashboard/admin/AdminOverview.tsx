'use client';

import React, { useMemo } from 'react';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { Button } from '@heroui/button';
import { User } from '@heroui/user';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  Activity,
  TrendingUp,
  Monitor,
  Eye,
  Pencil,
  UserPlus
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import type { UserStats, UserListItem } from '@/types';

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  apiLatency: number;
  uptime: string;
  activeConnections: number;
}

interface MonthlyGrowth {
  month: string;
  users: number;
  courses: number;
}

interface AdminOverviewProps {
  userStats: UserStats | null;
  totalCourses: number;
  recentUsers: UserListItem[];
  systemHealth: SystemHealth;
  monthlyGrowth: MonthlyGrowth[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  userStats,
  totalCourses,
  recentUsers,
  systemHealth,
  monthlyGrowth,
}) => {
  const getRoleColor = (role: string): "primary" | "success" | "secondary" | "danger" | "warning" | "default" => {
    const colors: Record<string, "primary" | "success" | "secondary" | "danger" | "warning" | "default"> = {
      student: 'primary',
      teacher: 'success',
      parent: 'secondary',
      admin: 'danger',
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      student: 'Học sinh',
      teacher: 'Giáo viên',
      parent: 'Phụ huynh',
      admin: 'Quản trị',
    };
    return labels[role] || role;
  };

  const columns: ColumnDef<UserListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Người dùng',
        cell: ({ row }) => (
          <User
            name={row.original.full_name || row.original.username}
            description={row.original.email}
            avatarProps={{
              src: undefined,
              name: (row.original.full_name || row.original.username)[0].toUpperCase(),
              size: 'sm',
              classNames: {
                base: 'bg-gray-200',
              },
            }}
          />
        ),
      },
      {
        accessorKey: 'role',
        header: 'Vai trò',
        cell: ({ row }) => (
          <Chip
            color={getRoleColor(row.original.role)}
            size="sm"
            variant="flat"
          >
            {getRoleLabel(row.original.role)}
          </Chip>
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
            {row.original.is_active ? 'Hoạt động' : 'Không hoạt động'}
          </Chip>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Ngày tham gia',
        cell: ({ row }) => (
          <span className="text-gray-600">
            {new Date(row.original.created_at).toLocaleDateString('vi-VN')}
          </span>
        ),
      }
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">
              +{userStats?.new_users_this_month || 0} tháng này
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userStats?.total_users.toLocaleString() || 0}</p>
          <p className="text-gray-600">Tổng người dùng</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm text-blue-600 font-semibold">
              {userStats?.total_users ? ((userStats.total_students / userStats.total_users) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userStats?.total_students.toLocaleString() || 0}</p>
          <p className="text-gray-600">Học sinh</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">-</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userStats?.total_teachers.toLocaleString() || 0}</p>
          <p className="text-gray-600">Giáo viên</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-purple-600 font-semibold">-</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalCourses}</p>
          <p className="text-gray-600">Khóa học</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">
              {userStats?.total_users ? ((userStats.active_users / userStats.total_users) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userStats?.active_users.toLocaleString() || 0}</p>
          <p className="text-gray-600">Đang hoạt động</p>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              Tăng trưởng theo tháng
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-end justify-between h-48 gap-4">
              {monthlyGrowth.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end justify-center h-40">
                    <div
                      className="w-6 bg-blue-500 rounded-t"
                      style={{ height: `${(data.users / 1300) * 100}%` }}
                      title={`Người dùng: ${data.users}`}
                    />
                    <div
                      className="w-6 bg-green-500 rounded-t"
                      style={{ height: `${(data.courses / 100) * 100}%` }}
                      title={`Khóa học: ${data.courses}`}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm text-gray-600">Người dùng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-sm text-gray-600">Khóa học</span>
              </div>
            </div>
          </div>
        </div>        
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            Người dùng mới
          </h3>
        </div>
        <div className="">
          <DataTable
            data={recentUsers.slice(0, 5)}
            columns={columns}
            emptyContent="Chưa có người dùng mới"
            removeWrapper={true}
          />
        </div>
      </div>
    </div>
  );
};
