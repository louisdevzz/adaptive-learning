'use client';

import React from 'react';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { Progress } from '@heroui/progress';
import {
  TrendingUp,
  RefreshCw,
  Download,
  Users,
  BookOpen,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface PerformanceMetrics {
  avgStudentProgress: number;
  avgCompletionRate: number;
  avgTimeSpent: number;
  activeStudentRate: number;
}

interface CoursePerformance {
  name: string;
  enrolled: number;
  completed: number;
  avgProgress: number;
}

interface StudentProgress {
  range: string;
  count: number;
  percentage: number;
}

interface ActivityData {
  day: string;
  activity: number;
}

interface TeacherAnalyticsProps {
  performanceMetrics: PerformanceMetrics;
  coursePerformance: CoursePerformance[];
  studentProgressDistribution: StudentProgress[];
  weeklyActivity: ActivityData[];
  timeRange: string;
  setTimeRange: (range: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading?: boolean;
}

export const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({
  performanceMetrics,
  coursePerformance,
  studentProgressDistribution,
  weeklyActivity,
  timeRange,
  setTimeRange,
  onRefresh,
  onExport,
  isLoading,
}) => {
  const getProgressColor = (value: number): "success" | "warning" | "danger" => {
    if (value >= 70) return 'success';
    if (value >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900">Phân tích dữ liệu</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select
            selectedKeys={[timeRange]}
            onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as string)}
            className="w-36"
            size="sm"
          >
            <SelectItem key="7d">7 ngày qua</SelectItem>
            <SelectItem key="30d">30 ngày qua</SelectItem>
            <SelectItem key="90d">90 ngày qua</SelectItem>
            <SelectItem key="1y">1 năm qua</SelectItem>
          </Select>
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onPress={onRefresh}
            isLoading={isLoading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="flat"
            startContent={<Download className="w-4 h-4" />}
            onPress={onExport}
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Tiến độ TB</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{performanceMetrics.avgStudentProgress}%</p>
          <Progress
            value={performanceMetrics.avgStudentProgress}
            color={getProgressColor(performanceMetrics.avgStudentProgress)}
            size="sm"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{performanceMetrics.avgCompletionRate}%</p>
          <Progress
            value={performanceMetrics.avgCompletionRate}
            color={getProgressColor(performanceMetrics.avgCompletionRate)}
            size="sm"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Thời gian học TB</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{performanceMetrics.avgTimeSpent}h</p>
          <p className="text-xs text-gray-500">mỗi tuần</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-600">HS hoạt động</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{performanceMetrics.activeStudentRate}%</p>
          <Progress
            value={performanceMetrics.activeStudentRate}
            color="success"
            size="sm"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Course Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              Hiệu suất khóa học
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {coursePerformance.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{course.name}</span>
                  <span className="text-gray-500">{course.enrolled} học sinh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={course.avgProgress}
                    color={getProgressColor(course.avgProgress)}
                    size="sm"
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {course.avgProgress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Progress Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-600" />
              Phân bố tiến độ học sinh
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {studentProgressDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600">{item.range}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.range.includes('80') ? 'bg-green-500' :
                          item.range.includes('60') ? 'bg-blue-500' :
                          item.range.includes('40') ? 'bg-yellow-500' :
                          item.range.includes('20') ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    <span className="text-xs text-gray-500"> ({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            Hoạt động trong tuần
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-end justify-between h-48 gap-4">
            {weeklyActivity.map((data, index) => {
              const maxActivity = Math.max(...weeklyActivity.map(d => d.activity));
              const height = (data.activity / maxActivity) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-40">
                    <div
                      className="w-full max-w-12 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${data.activity} hoạt động`}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6" />
            <span className="font-semibold">Học sinh tích cực nhất</span>
          </div>
          <p className="text-2xl font-bold">Phạm Thị D</p>
          <p className="text-blue-100 text-sm">91% tiến độ - 32 giờ học</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6" />
            <span className="font-semibold">Khóa học phổ biến</span>
          </div>
          <p className="text-2xl font-bold">Toán học nâng cao</p>
          <p className="text-green-100 text-sm">120 học sinh - 85% hoàn thành</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6" />
            <span className="font-semibold">Tăng trưởng</span>
          </div>
          <p className="text-2xl font-bold">+15%</p>
          <p className="text-purple-100 text-sm">so với tháng trước</p>
        </div>
      </div>
    </div>
  );
};
