'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, TeacherStats } from '@/types';
import {
  TeacherSidebar,
  TeacherOverview,
  StudentManagement,
  TeacherCourseManagement,
  TeacherAnalytics,
  TeacherOverviewSkeleton,
  StudentsSkeleton,
  CoursesSkeleton,
  AnalyticsSkeleton,
} from './teacher';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

interface TeacherDashboardProps {
  courses?: Course[];
  onLoadCourses?: () => Promise<Course[]>;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  courses: initialCourses,
  onLoadCourses
}) => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>(initialCourses || []);
  const [loading, setLoading] = useState(!initialCourses);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'analytics'>('overview');
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('30d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Mock stats data
  const stats: TeacherStats = {
    total_students: 156,
    total_courses: 8,
    active_courses: 5,
    avg_student_progress: 72,
  };

  // Mock student data
  const recentStudents = [
    { id: '1', name: 'Nguyễn Văn A', progress: 85, lastActive: '2 giờ trước' },
    { id: '2', name: 'Trần Thị B', progress: 72, lastActive: '5 giờ trước' },
    { id: '3', name: 'Lê Văn C', progress: 45, lastActive: '1 ngày trước' },
    { id: '4', name: 'Phạm Thị D', progress: 91, lastActive: '30 phút trước' },
    { id: '5', name: 'Hoàng Văn E', progress: 38, lastActive: '3 ngày trước' },
  ];

  // Mock at-risk students
  const atRiskStudents = recentStudents.filter(s => s.progress < 50);

  // Mock analytics data
  const performanceMetrics = {
    avgStudentProgress: 72,
    avgCompletionRate: 68,
    avgTimeSpent: 24,
    activeStudentRate: 85,
  };

  const coursePerformance = [
    { name: 'Toán học nâng cao', enrolled: 120, completed: 85, avgProgress: 78 },
    { name: 'Vật lý đại cương', enrolled: 95, completed: 62, avgProgress: 65 },
    { name: 'Hóa học hữu cơ', enrolled: 88, completed: 54, avgProgress: 61 },
    { name: 'Sinh học tế bào', enrolled: 76, completed: 48, avgProgress: 58 },
    { name: 'Ngữ văn 12', enrolled: 68, completed: 42, avgProgress: 55 },
  ];

  const studentProgressDistribution = [
    { range: '80-100%', count: 25, percentage: 16 },
    { range: '60-79%', count: 52, percentage: 33 },
    { range: '40-59%', count: 48, percentage: 31 },
    { range: '20-39%', count: 21, percentage: 13 },
    { range: '0-19%', count: 10, percentage: 7 },
  ];

  const weeklyActivity = [
    { day: 'T2', activity: 120 },
    { day: 'T3', activity: 180 },
    { day: 'T4', activity: 150 },
    { day: 'T5', activity: 200 },
    { day: 'T6', activity: 170 },
    { day: 'T7', activity: 90 },
    { day: 'CN', activity: 60 },
  ];

  useEffect(() => {
    if (!initialCourses && onLoadCourses) {
      loadCourses();
    }
  }, []);

  const loadCourses = async () => {
    if (!onLoadCourses) return;
    try {
      const coursesData = await onLoadCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreateCourse = () => {
    setActiveTab('courses');
  };

  const handleViewStudent = (studentId: string) => {
    console.log('View student:', studentId);
  };

  const handleSupportStudent = (studentId: string) => {
    console.log('Support student:', studentId);
  };

  const handleRefreshAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setTimeout(() => {
      setAnalyticsLoading(false);
    }, 1000);
  }, []);

  const handleExportAnalytics = useCallback(() => {
    alert('Đang xuất báo cáo...');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-14 flex min-h-[calc(100vh-3.5rem)]">
        <SidebarProvider>
          {/* Sidebar */}
          <TeacherSidebar
            profile={profile}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            atRiskCount={atRiskStudents.length}
          />

          {/* Main Content */}
          <SidebarInset>
            <header className="flex h-12 items-center gap-2 border-b px-4 bg-white sticky top-14 z-10">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-medium">
                {activeTab === 'overview' && 'Tổng quan'}
                {activeTab === 'courses' && 'Quản lý khóa học'}
                {activeTab === 'students' && 'Quản lý học sinh'}
                {activeTab === 'analytics' && 'Phân tích'}
              </span>
            </header>
            <main className="p-6 flex-1">
              {activeTab === 'overview' && (
                loading ? (
                  <TeacherOverviewSkeleton />
                ) : (
                  <TeacherOverview
                    stats={stats}
                    courses={courses}
                    recentStudents={recentStudents}
                    atRiskStudents={atRiskStudents}
                    onCreateCourse={handleCreateCourse}
                    onViewStudent={handleViewStudent}
                    onSupportStudent={handleSupportStudent}
                  />
                )
              )}

              {activeTab === 'students' && (
                loading ? (
                  <StudentsSkeleton />
                ) : (
                  <StudentManagement
                    onViewStudent={handleViewStudent}
                    onMessageStudent={(id) => console.log('Message:', id)}
                    onEmailStudent={(id) => console.log('Email:', id)}
                  />
                )
              )}

              {activeTab === 'courses' && (
                loading ? (
                  <CoursesSkeleton />
                ) : (
                  <TeacherCourseManagement
                    courses={courses}
                    onCreateCourse={(course) => console.log('Create:', course)}
                    onEditCourse={(course) => console.log('Edit:', course)}
                    onDeleteCourse={(id) => console.log('Delete:', id)}
                    onViewCourse={(id) => console.log('View:', id)}
                  />
                )
              )}

              {activeTab === 'analytics' && (
                analyticsLoading ? (
                  <AnalyticsSkeleton />
                ) : (
                  <TeacherAnalytics
                    performanceMetrics={performanceMetrics}
                    coursePerformance={coursePerformance}
                    studentProgressDistribution={studentProgressDistribution}
                    weeklyActivity={weeklyActivity}
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
