'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, TeacherStats } from '@/types';

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

      <div className="pt-14">
        {/* Sidebar */}
        <aside className="fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {profile?.full_name?.[0] || 'T'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{profile?.full_name || 'Giáo viên'}</p>
                <p className="text-sm text-blue-600">Giáo viên</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { key: 'overview', icon: '📊', label: 'Tổng quan' },
              { key: 'courses', icon: '📚', label: 'Khóa học' },
              { key: 'students', icon: '👥', label: 'Học sinh' },
              { key: 'analytics', icon: '📈', label: 'Phân tích' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
              <span>⚠️</span>
              <span>Cảnh báo</span>
            </div>
            <p className="text-sm text-orange-600">
              {atRiskStudents.length} học sinh cần hỗ trợ
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">👥</span>
                    <span className="text-sm text-green-600 font-semibold">+12 tháng này</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_students}</p>
                  <p className="text-gray-600">Tổng học sinh</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📚</span>
                    <span className="text-sm text-blue-600 font-semibold">{stats.active_courses} đang hoạt động</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_courses}</p>
                  <p className="text-gray-600">Khóa học</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📈</span>
                    <span className="text-sm text-green-600 font-semibold">+5% tuần này</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.avg_student_progress}%</p>
                  <p className="text-gray-600">Tiến độ TB</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">⚠️</span>
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
                      <span>👥</span>
                      Hoạt động gần đây
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {recentStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {student.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.lastActive}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${student.progress >= 70 ? 'text-green-600' : student.progress >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {student.progress}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* At-Risk Students */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-red-600 flex items-center gap-2">
                      <span>⚠️</span>
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
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition">
                            Hỗ trợ
                          </button>
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
                    <span>📚</span>
                    Khóa học của tôi
                  </h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                    + Tạo khóa học
                  </button>
                </div>
                <div className="p-4 grid grid-cols-3 gap-4">
                  {courses.length > 0 ? (
                    courses.slice(0, 6).map((course) => (
                      <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer">
                        <h4 className="font-semibold text-gray-900 mb-2">{course.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">{course.description || 'Không có mô tả'}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`px-2 py-1 rounded-full ${course.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {course.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                          </span>
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
          )}

          {activeTab === 'courses' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quản lý khóa học</h2>
              <p className="text-gray-500">Tính năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quản lý học sinh</h2>
              <p className="text-gray-500">Tính năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Phân tích dữ liệu</h2>
              <p className="text-gray-500">Tính năng đang phát triển...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
