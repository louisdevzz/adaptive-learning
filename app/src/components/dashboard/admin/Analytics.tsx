'use client';

import React from 'react';
import { Card } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import {
  AreaChart,
  BarChart,
  DonutChart,
  LineChart,
  BarList,
} from '@tremor/react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Clock,
  Award,
} from 'lucide-react';

interface UserGrowthData {
  date: string;
  'Người dùng mới': number;
  'Người dùng hoạt động': number;
}

interface CourseEnrollmentData {
  name: string;
  'Đăng ký': number;
  'Hoàn thành': number;
}

interface MasteryDistribution {
  name: string;
  value: number;
}

interface TopCourse {
  name: string;
  value: number;
}

interface ActivityByHour {
  hour: string;
  'Hoạt động': number;
}

interface PerformanceMetrics {
  avgMastery: number;
  avgCompletionRate: number;
  avgTimeSpent: number;
  activeRate: number;
}

interface AnalyticsProps {
  userGrowth: UserGrowthData[];
  courseEnrollment: CourseEnrollmentData[];
  masteryDistribution: MasteryDistribution[];
  topCourses: TopCourse[];
  activityByHour: ActivityByHour[];
  performanceMetrics: PerformanceMetrics;
  timeRange: string;
  setTimeRange: (range: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading?: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  userGrowth,
  courseEnrollment,
  masteryDistribution,
  topCourses,
  activityByHour,
  performanceMetrics,
  timeRange,
  setTimeRange,
  onRefresh,
  onExport,
  isLoading,
}) => {
  const valueFormatter = (value: number) => `${value.toLocaleString()}`;
  const percentFormatter = (value: number) => `${value}%`;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phân tích dữ liệu</h2>
          <p className="text-gray-600">Thống kê và báo cáo chi tiết về hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            className="w-40"
            selectedKeys={[timeRange]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              setTimeRange(value);
            }}
          >
            <SelectItem key="7d">7 ngày qua</SelectItem>
            <SelectItem key="30d">30 ngày qua</SelectItem>
            <SelectItem key="90d">90 ngày qua</SelectItem>
            <SelectItem key="1y">1 năm qua</SelectItem>
          </Select>
          <Button
            variant="flat"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={onRefresh}
            isLoading={isLoading}
          >
            Làm mới
          </Button>
          <Button
            color="danger"
            startContent={<Download className="w-4 h-4" />}
            onPress={onExport}
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <Chip
              size="sm"
              color={performanceMetrics.avgMastery >= 70 ? 'success' : 'warning'}
              variant="flat"
              startContent={performanceMetrics.avgMastery >= 70 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            >
              {performanceMetrics.avgMastery >= 70 ? '+5%' : '-2%'}
            </Chip>
          </div>
          <p className="text-2xl font-bold text-gray-900">{performanceMetrics.avgMastery}%</p>
          <p className="text-gray-600 text-sm">Độ thành thạo TB</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <Chip
              size="sm"
              color="success"
              variant="flat"
              startContent={<TrendingUp className="w-3 h-3" />}
            >
              +8%
            </Chip>
          </div>
          <p className="text-2xl font-bold text-gray-900">{performanceMetrics.avgCompletionRate}%</p>
          <p className="text-gray-600 text-sm">Tỷ lệ hoàn thành</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <Chip
              size="sm"
              color="primary"
              variant="flat"
              startContent={<TrendingUp className="w-3 h-3" />}
            >
              +12%
            </Chip>
          </div>
          <p className="text-2xl font-bold text-gray-900">{performanceMetrics.avgTimeSpent}h</p>
          <p className="text-gray-600 text-sm">Thời gian học TB</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <Chip
              size="sm"
              color="success"
              variant="flat"
              startContent={<TrendingUp className="w-3 h-3" />}
            >
              +3%
            </Chip>
          </div>
          <p className="text-2xl font-bold text-gray-900">{performanceMetrics.activeRate}%</p>
          <p className="text-gray-600 text-sm">Tỷ lệ hoạt động</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Tăng trưởng người dùng
            </h3>
          </div>
          <div className="p-4">
            <AreaChart
              className="h-72"
              data={userGrowth}
              index="date"
              categories={['Người dùng mới', 'Người dùng hoạt động']}
              colors={['blue', 'emerald']}
              valueFormatter={valueFormatter}
              showLegend={true}
              showGridLines={false}
              curveType="monotone"
            />
          </div>
        </div>

        {/* Course Enrollment Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              Đăng ký khóa học
            </h3>
          </div>
          <div className="p-4">
            <BarChart
              className="h-72"
              data={courseEnrollment}
              index="name"
              categories={['Đăng ký', 'Hoàn thành']}
              colors={['blue', 'emerald']}
              valueFormatter={valueFormatter}
              showLegend={true}
              showGridLines={false}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Mastery Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-600" />
              Phân bố độ thành thạo
            </h3>
          </div>
          <div className="p-4">
            <DonutChart
              className="h-52"
              data={masteryDistribution}
              category="value"
              index="name"
              colors={['red', 'orange', 'yellow', 'emerald', 'blue']}
              valueFormatter={percentFormatter}
              showLabel={true}
              showAnimation={true}
            />
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-600" />
              Khóa học phổ biến
            </h3>
          </div>
          <div className="p-4">
            <BarList
              data={topCourses}
              valueFormatter={valueFormatter}
              color="blue"
              className="mt-2"
            />
          </div>
        </div>

        {/* Activity by Hour */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Hoạt động theo giờ
            </h3>
          </div>
          <div className="p-4">
            <LineChart
              className="h-52"
              data={activityByHour}
              index="hour"
              categories={['Hoạt động']}
              colors={['blue']}
              valueFormatter={valueFormatter}
              showLegend={false}
              showGridLines={false}
              curveType="monotone"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Tóm tắt hiệu suất</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">1,234</p>
            <p className="text-gray-600 text-sm">Lượt truy cập</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">567</p>
            <p className="text-gray-600 text-sm">Bài tập hoàn thành</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">89</p>
            <p className="text-gray-600 text-sm">KP mới học</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">45h</p>
            <p className="text-gray-600 text-sm">Tổng thời gian</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">92%</p>
            <p className="text-gray-600 text-sm">Độ hài lòng</p>
          </div>
        </div>
      </div>
    </div>
  );
};
