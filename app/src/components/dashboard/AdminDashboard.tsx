'use client';

import React, { useState, useCallback } from 'react';
import { Header } from '../layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import {
  AdminSidebar,
  AdminOverview,
  UserManagement,
  CourseManagement,
  Analytics,
} from './admin';
import { OverviewSkeleton, AnalyticsSkeleton } from './admin/AdminDashboardSkeleton';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useAdminOverview } from '@/hooks/use-admin-data';
import { ModuleManagement } from './admin/ModuleManagement';
import { SectionManagement } from './admin/SectionManagement';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'modules' | 'sections' | 'analytics'>('overview');
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('30d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Use custom hook for admin overview data
  const {
    userStats,
    recentUsers,
    totalCourses,
    isLoading: loading,
    mutateAll: handleDataChange,
  } = useAdminOverview();

  // Mock analytics data
  const userGrowthData = [
    { date: '01/11', 'Người dùng mới': 45, 'Người dùng hoạt động': 320 },
    { date: '05/11', 'Người dùng mới': 52, 'Người dùng hoạt động': 345 },
    { date: '10/11', 'Người dùng mới': 38, 'Người dùng hoạt động': 360 },
    { date: '15/11', 'Người dùng mới': 65, 'Người dùng hoạt động': 385 },
    { date: '20/11', 'Người dùng mới': 48, 'Người dùng hoạt động': 410 },
    { date: '25/11', 'Người dùng mới': 72, 'Người dùng hoạt động': 435 },
  ];

  const courseEnrollmentData = [
    { name: 'Toán 10', 'Đăng ký': 120, 'Hoàn thành': 85 },
    { name: 'Lý 11', 'Đăng ký': 95, 'Hoàn thành': 62 },
    { name: 'Hóa 12', 'Đăng ký': 88, 'Hoàn thành': 54 },
    { name: 'Sinh 10', 'Đăng ký': 76, 'Hoàn thành': 48 },
    { name: 'Văn 11', 'Đăng ký': 68, 'Hoàn thành': 42 },
  ];

  const masteryDistribution = [
    { name: 'Yếu', value: 8 },
    { name: 'Trung bình', value: 15 },
    { name: 'Khá', value: 32 },
    { name: 'Giỏi', value: 35 },
    { name: 'Xuất sắc', value: 10 },
  ];

  const topCourses = [
    { name: 'Toán học nâng cao', value: 1250 },
    { name: 'Vật lý đại cương', value: 980 },
    { name: 'Hóa học hữu cơ', value: 875 },
    { name: 'Sinh học tế bào', value: 720 },
    { name: 'Ngữ văn 12', value: 650 },
  ];

  const activityByHour = [
    { hour: '6h', 'Hoạt động': 120 },
    { hour: '8h', 'Hoạt động': 350 },
    { hour: '10h', 'Hoạt động': 480 },
    { hour: '12h', 'Hoạt động': 280 },
    { hour: '14h', 'Hoạt động': 520 },
    { hour: '16h', 'Hoạt động': 680 },
    { hour: '18h', 'Hoạt động': 750 },
    { hour: '20h', 'Hoạt động': 890 },
    { hour: '22h', 'Hoạt động': 420 },
  ];

  const performanceMetrics = {
    avgMastery: 72,
    avgCompletionRate: 68,
    avgTimeSpent: 24,
    activeRate: 85,
  };

  const systemHealth = {
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    apiLatency: 120,
    uptime: '99.9%',
    activeConnections: 156,
  };

  const monthlyGrowth = [
    { month: 'T1', users: 850, courses: 65 },
    { month: 'T2', users: 920, courses: 70 },
    { month: 'T3', users: 1050, courses: 75 },
    { month: 'T4', users: 1100, courses: 80 },
    { month: 'T5', users: 1200, courses: 82 },
    { month: 'T6', users: 1250, courses: 85 },
  ];

  // Analytics handlers
  const handleRefreshAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setTimeout(() => {
      setAnalyticsLoading(false);
    }, 1000);
  }, []);

  const handleExportAnalytics = useCallback(() => {
    alert('Đang xuất báo cáo...');
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-14 flex min-h-[calc(100vh-3.5rem)]">
        <SidebarProvider>
          {/* Sidebar */}
          <AdminSidebar
            profile={profile}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            systemHealth={systemHealth}
          />

          {/* Main Content */}
          <SidebarInset>
            <header className="flex h-12 items-center gap-2 border-b px-4 bg-white sticky top-14 z-10">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-medium">
                {activeTab === 'overview' && 'Tổng quan'}
                {activeTab === 'users' && 'Quản lý người dùng'}
                {activeTab === 'courses' && 'Quản lý khóa học'}
                {activeTab === 'analytics' && 'Phân tích'}
                {activeTab === 'modules' && 'Quản lý chương'}
                {activeTab === 'sections' && 'Quản lý bài học'}
              </span>
            </header>
            <main className="p-6 flex-1">
              {activeTab === 'overview' && (
                loading ? (
                  <OverviewSkeleton />
                ) : (
                  <AdminOverview
                    userStats={userStats || null}
                    totalCourses={totalCourses}
                    recentUsers={recentUsers}
                    systemHealth={systemHealth}
                    monthlyGrowth={monthlyGrowth}
                  />
                )
              )}

              {activeTab === 'users' && (
                <UserManagement
                  userStats={userStats || null}
                  onDataChange={handleDataChange}
                />
              )}

              {activeTab === 'courses' && (
                <CourseManagement
                  userStats={userStats || null}
                  onDataChange={handleDataChange}
                />
              )}

              {activeTab === 'modules' && (
                <ModuleManagement
                  userStats={userStats || null}
                  onDataChange={handleDataChange}
                />
              )}

              {activeTab === 'sections' && (
                <SectionManagement
                  onDataChange={handleDataChange}
                />
              )}

              {activeTab === 'analytics' && (
                analyticsLoading ? (
                  <AnalyticsSkeleton />
                ) : (
                  <Analytics
                    userGrowth={userGrowthData}
                    courseEnrollment={courseEnrollmentData}
                    masteryDistribution={masteryDistribution}
                    topCourses={topCourses}
                    activityByHour={activityByHour}
                    performanceMetrics={performanceMetrics}
                    timeRange={analyticsTimeRange}
                    setTimeRange={setAnalyticsTimeRange}
                    onRefresh={handleRefreshAnalytics}
                    onExport={handleExportAnalytics}
                    isLoading={analyticsLoading}
                  />
                )
              )}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};
