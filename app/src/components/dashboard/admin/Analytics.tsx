'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { Progress } from '@heroui/progress';
import { CircularProgress } from '@heroui/progress';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  Download,
  RefreshCw,
  Target,
  Clock,
  Award,
  BarChart3,
  PieChart,
  LineChart,
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

// Color mapping for mastery levels
const getMasteryColor = (name: string): "danger" | "warning" | "primary" | "success" | "secondary" => {
  const colors: Record<string, "danger" | "warning" | "primary" | "success" | "secondary"> = {
    'Chưa học': 'danger',
    'Mới bắt đầu': 'warning',
    'Đang học': 'primary',
    'Thành thạo': 'success',
    'Xuất sắc': 'secondary',
  };
  return colors[name] || 'primary';
};

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
  // Calculate max values for scaling
  const maxUserGrowth = Math.max(...userGrowth.map(d => Math.max(d['Người dùng mới'], d['Người dùng hoạt động'])));
  const maxEnrollment = Math.max(...courseEnrollment.map(d => Math.max(d['Đăng ký'], d['Hoàn thành'])));
  const maxCourseValue = Math.max(...topCourses.map(c => c.value));
  const maxActivity = Math.max(...activityByHour.map(a => a['Hoạt động']));

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
            variant="bordered"
            size="sm"
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
            size="sm"
          >
            Làm mới
          </Button>
          <Button
            color="danger"
            startContent={<Download className="w-4 h-4" />}
            onPress={onExport}
            size="sm"
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
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
            <p className="text-gray-600 text-sm mb-2">Độ thành thạo TB</p>
            <Progress
              value={performanceMetrics.avgMastery}
              color={performanceMetrics.avgMastery >= 70 ? 'success' : 'warning'}
              size="sm"
              className="mt-2"
            />
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
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
            <p className="text-gray-600 text-sm mb-2">Tỷ lệ hoàn thành</p>
            <Progress
              value={performanceMetrics.avgCompletionRate}
              color="success"
              size="sm"
              className="mt-2"
            />
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <Chip
                size="sm"
                color="secondary"
                variant="flat"
                startContent={<TrendingUp className="w-3 h-3" />}
              >
                +12%
              </Chip>
            </div>
            <p className="text-2xl font-bold text-gray-900">{performanceMetrics.avgTimeSpent}h</p>
            <p className="text-gray-600 text-sm mb-2">Thời gian học TB</p>
            <Progress
              value={Math.min((performanceMetrics.avgTimeSpent / 10) * 100, 100)}
              color="secondary"
              size="sm"
              className="mt-2"
            />
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
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
            <p className="text-gray-600 text-sm mb-2">Tỷ lệ hoạt động</p>
            <Progress
              value={performanceMetrics.activeRate}
              color="primary"
              size="sm"
              className="mt-2"
            />
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* User Growth - Bar representation */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-200 px-4 py-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Tăng trưởng người dùng
            </h3>
          </CardHeader>
          <CardBody className="p-4">
            <div className="space-y-3">
              {userGrowth.slice(-7).map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.date}</span>
                    <span className="text-gray-900 font-medium">
                      {item['Người dùng mới']} / {item['Người dùng hoạt động']}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Progress
                      value={(item['Người dùng mới'] / maxUserGrowth) * 100}
                      color="primary"
                      size="sm"
                      className="flex-1"
                    />
                    <Progress
                      value={(item['Người dùng hoạt động'] / maxUserGrowth) * 100}
                      color="success"
                      size="sm"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span className="text-gray-600">Người dùng mới</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-success"></div>
                <span className="text-gray-600">Người dùng hoạt động</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Course Enrollment */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-200 px-4 py-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              Đăng ký khóa học
            </h3>
          </CardHeader>
          <CardBody className="p-4">
            <div className="space-y-3">
              {courseEnrollment.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[150px]">{item.name}</span>
                    <span className="text-gray-900 font-medium">
                      {item['Đăng ký']} / {item['Hoàn thành']}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Progress
                      value={(item['Đăng ký'] / maxEnrollment) * 100}
                      color="primary"
                      size="sm"
                      className="flex-1"
                    />
                    <Progress
                      value={(item['Hoàn thành'] / maxEnrollment) * 100}
                      color="success"
                      size="sm"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span className="text-gray-600">Đăng ký</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-success"></div>
                <span className="text-gray-600">Hoàn thành</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Mastery Distribution - Circular Progress */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-200 px-4 py-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-600" />
              Phân bố độ thành thạo
            </h3>
          </CardHeader>
          <CardBody className="p-4">
            <div className="flex flex-wrap justify-center gap-4">
              {masteryDistribution.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <CircularProgress
                    value={item.value}
                    color={getMasteryColor(item.name)}
                    size="lg"
                    showValueLabel={true}
                    classNames={{
                      value: "text-sm font-semibold",
                    }}
                  />
                  <span className="text-xs text-gray-600 mt-1 text-center max-w-[60px]">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top Courses - Table */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-200 px-4 py-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-600" />
              Khóa học phổ biến
            </h3>
          </CardHeader>
          <CardBody className="p-4">
            <div className="space-y-3">
              {topCourses.map((course, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900 font-medium truncate max-w-[120px]">
                      {course.name}
                    </span>
                    <span className="text-gray-600">{course.value.toLocaleString()}</span>
                  </div>
                  <Progress
                    value={(course.value / maxCourseValue) * 100}
                    color="primary"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Activity by Hour */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-200 px-4 py-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Hoạt động theo giờ
            </h3>
          </CardHeader>
          <CardBody className="p-4">
            <div className="space-y-2">
              {activityByHour.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-8">{item.hour}</span>
                  <Progress
                    value={(item['Hoạt động'] / maxActivity) * 100}
                    color="primary"
                    size="sm"
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-900 w-8 text-right">
                    {item['Hoạt động']}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="shadow-sm">
        <CardBody className="p-6">
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
        </CardBody>
      </Card>
    </div>
  );
};
