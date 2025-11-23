'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import type { Course } from '@/types';

interface ChildInfo {
  id: string;
  name: string;
  grade: string;
  school: string;
  overallProgress: number;
  masteryLevel: string;
  lastActive: string;
  weeklyStudyTime: number;
  streakDays: number;
}

interface ParentDashboardProps {
  courses?: Course[];
  onLoadCourses?: () => Promise<Course[]>;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  courses: initialCourses,
  onLoadCourses
}) => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>(initialCourses || []);
  const [loading, setLoading] = useState(!initialCourses);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'reports' | 'settings'>('overview');

  // Mock children data
  const children: ChildInfo[] = [
    {
      id: '1',
      name: 'Nguyễn Minh An',
      grade: 'Lớp 10',
      school: 'THPT Chu Văn An',
      overallProgress: 78,
      masteryLevel: 'Khá',
      lastActive: '2 giờ trước',
      weeklyStudyTime: 12,
      streakDays: 5,
    },
    {
      id: '2',
      name: 'Nguyễn Minh Anh',
      grade: 'Lớp 8',
      school: 'THCS Trưng Vương',
      overallProgress: 85,
      masteryLevel: 'Giỏi',
      lastActive: '30 phút trước',
      weeklyStudyTime: 15,
      streakDays: 12,
    },
  ];

  // Mock recent activities
  const recentActivities = [
    { id: '1', childName: 'Nguyễn Minh An', action: 'Hoàn thành bài tập Hàm số bậc nhất', time: '2 giờ trước', score: 85 },
    { id: '2', childName: 'Nguyễn Minh Anh', action: 'Học xong Pi-point Phương trình bậc hai', time: '3 giờ trước', score: 92 },
    { id: '3', childName: 'Nguyễn Minh An', action: 'Bắt đầu khóa học Toán 10', time: '1 ngày trước', score: null },
    { id: '4', childName: 'Nguyễn Minh Anh', action: 'Đạt thành tích "Học 7 ngày liên tục"', time: '2 ngày trước', score: null },
  ];

  // Mock weekly progress data
  const weeklyProgress = [
    { day: 'T2', child1: 45, child2: 60 },
    { day: 'T3', child1: 30, child2: 45 },
    { day: 'T4', child1: 60, child2: 75 },
    { day: 'T5', child1: 40, child2: 50 },
    { day: 'T6', child1: 55, child2: 65 },
    { day: 'T7', child1: 90, child2: 80 },
    { day: 'CN', child1: 75, child2: 90 },
  ];

  useEffect(() => {
    if (!initialCourses && onLoadCourses) {
      loadCourses();
    }
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
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

  const getSelectedChild = () => children.find(c => c.id === selectedChild);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const currentChild = getSelectedChild();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-14">
        {/* Sidebar */}
        <aside className="fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {profile?.full_name?.[0] || 'P'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{profile?.full_name || 'Phụ huynh'}</p>
                <p className="text-sm text-purple-600">Phụ huynh</p>
              </div>
            </div>
          </div>

          {/* Children Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">CON CỦA TÔI</h3>
            <div className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                    selectedChild === child.id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    selectedChild === child.id ? 'bg-purple-600' : 'bg-gray-400'
                  }`}>
                    {child.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{child.name}</p>
                    <p className="text-xs text-gray-500">{child.grade}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { key: 'overview', icon: '📊', label: 'Tổng quan' },
              { key: 'progress', icon: '📈', label: 'Tiến độ' },
              { key: 'reports', icon: '📋', label: 'Báo cáo' },
              { key: 'settings', icon: '⚙️', label: 'Cài đặt' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.key
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-6">
          {activeTab === 'overview' && currentChild && (
            <div className="space-y-6">
              {/* Child Info Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                      {currentChild.name[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{currentChild.name}</h2>
                      <p className="text-purple-200">{currentChild.grade} - {currentChild.school}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-200">Hoạt động gần nhất</p>
                    <p className="font-semibold">{currentChild.lastActive}</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📊</span>
                    <span className={`text-sm font-semibold ${currentChild.overallProgress >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {currentChild.masteryLevel}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{currentChild.overallProgress}%</p>
                  <p className="text-gray-600">Tiến độ tổng thể</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">⏰</span>
                    <span className="text-sm text-blue-600 font-semibold">Tuần này</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{currentChild.weeklyStudyTime}h</p>
                  <p className="text-gray-600">Thời gian học</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🔥</span>
                    <span className="text-sm text-orange-600 font-semibold">Tuyệt vời!</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{currentChild.streakDays}</p>
                  <p className="text-gray-600">Ngày liên tục</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📚</span>
                    <span className="text-sm text-green-600 font-semibold">Đang học</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{courses.length || 3}</p>
                  <p className="text-gray-600">Khóa học</p>
                </div>
              </div>

              {/* Weekly Progress Chart (Simplified) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span>📈</span>
                    Thời gian học trong tuần (phút)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-end justify-between h-40 gap-2">
                    {weeklyProgress.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-1 items-end justify-center h-32">
                          <div
                            className="w-5 bg-purple-500 rounded-t"
                            style={{ height: `${(data.child1 / 100) * 100}%` }}
                            title={`${children[0]?.name}: ${data.child1} phút`}
                          />
                          {children.length > 1 && (
                            <div
                              className="w-5 bg-blue-500 rounded-t"
                              style={{ height: `${(data.child2 / 100) * 100}%` }}
                              title={`${children[1]?.name}: ${data.child2} phút`}
                            />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{data.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded" />
                      <span className="text-sm text-gray-600">{children[0]?.name}</span>
                    </div>
                    {children.length > 1 && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded" />
                        <span className="text-sm text-gray-600">{children[1]?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span>🕐</span>
                    Hoạt động gần đây
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                          {activity.childName.split(' ').pop()?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.childName} - {activity.time}</p>
                        </div>
                      </div>
                      {activity.score !== null && (
                        <div className="text-right">
                          <p className={`font-bold ${activity.score >= 80 ? 'text-green-600' : activity.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {activity.score} điểm
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Chi tiết tiến độ học tập</h2>
              <p className="text-gray-500">Tính năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Báo cáo học tập</h2>
              <p className="text-gray-500">Tính năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cài đặt</h2>
              <p className="text-gray-500">Tính năng đang phát triển...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
