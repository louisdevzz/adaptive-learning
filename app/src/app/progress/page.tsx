'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { courseAPI, masteryAPI } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import type { Course, StudentMastery, MasteryLevel } from '@/types';

export default function ProgressPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [masteries, setMasteries] = useState<StudentMastery[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    overall_mastery: 0,
    total_time_minutes: 0,
    active_streak_days: 0,
    kp_completed: 0,
    kp_in_progress: 0,
    kp_total: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      loadProgressData();
    }
  }, [user, loading, selectedCourse]);

  const loadProgressData = async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      // Load courses
      const coursesResponse = await courseAPI.listCourses({ page: 1, page_size: 100 });
      const coursesData = coursesResponse.items || [];
      setCourses(coursesData);

      // Load masteries
      const masteriesData = await masteryAPI.listStudentMasteries(user.id, {
        course_id: selectedCourse || undefined,
      });
      setMasteries(masteriesData);

      // Calculate stats
      const totalMastery = masteriesData.reduce((sum, m) => sum + m.mastery_score, 0);
      const avgMastery = masteriesData.length > 0 ? totalMastery / masteriesData.length : 0;
      const totalTime = masteriesData.reduce((sum, m) => sum + m.time_spent_minutes, 0);
      const completed = masteriesData.filter((m) => m.mastery_level === 'excellent' || m.mastery_level === 'good').length;
      const inProgress = masteriesData.filter((m) => m.mastery_level === 'fair' || m.mastery_level === 'poor').length;

      setStats({
        overall_mastery: Math.round(avgMastery),
        total_time_minutes: totalTime,
        active_streak_days: 7, // TODO: Calculate from practice sessions
        kp_completed: completed,
        kp_in_progress: inProgress,
        kp_total: masteriesData.length,
      });
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getMasteryColor = (level: MasteryLevel) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-orange-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getMasteryLabel = (level: MasteryLevel) => {
    switch (level) {
      case 'excellent':
        return 'Xuất sắc';
      case 'good':
        return 'Tốt';
      case 'fair':
        return 'Khá';
      case 'poor':
        return 'Yếu';
      default:
        return 'Chưa học';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-14">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiến độ học tập</h1>
            <p className="text-gray-600">Theo dõi và phân tích tiến độ học tập của bạn</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Overall Mastery */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📊</div>
                <div className="text-sm text-gray-600">Tổng thể</div>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.overall_mastery}%</div>
              <div className="text-sm text-gray-600">Mức độ thành thạo</div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.overall_mastery}%` }}
                ></div>
              </div>
            </div>

            {/* Total Time */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">⏱️</div>
                <div className="text-sm text-gray-600">Thời gian</div>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {formatTime(stats.total_time_minutes)}
              </div>
              <div className="text-sm text-gray-600">Tổng thời gian học</div>
            </div>

            {/* Active Streak */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🔥</div>
                <div className="text-sm text-gray-600">Chuỗi</div>
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-2">{stats.active_streak_days}</div>
              <div className="text-sm text-gray-600">Ngày học liên tục</div>
            </div>

            {/* Knowledge Points */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🎯</div>
                <div className="text-sm text-gray-600">Pi-Points</div>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.kp_completed}/{stats.kp_total}
              </div>
              <div className="text-sm text-gray-600">
                {stats.kp_total > 0
                  ? Math.round((stats.kp_completed / stats.kp_total) * 100)
                  : 0}% hoàn thành
              </div>
            </div>
          </div>

          {/* Course Filter */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Lọc theo khóa học:</label>
                <select
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả khóa học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Progress by Course */}
          {courses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tiến độ theo khóa học</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const courseMasteries = masteries.filter((m) => {
                    // Note: This assumes mastery has course_id, may need to adjust based on API
                    return true; // Placeholder - adjust based on actual data structure
                  });
                  const courseAvg =
                    courseMasteries.length > 0
                      ? courseMasteries.reduce((sum, m) => sum + m.mastery_score, 0) /
                        courseMasteries.length
                      : 0;

                  return (
                    <div key={course.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{course.name}</h3>
                        <div className="text-2xl font-bold text-blue-600">{Math.round(courseAvg)}%</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{course.description || 'Không có mô tả'}</p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${courseAvg}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Mức độ: {course.difficulty_level}/5</span>
                        <span>{courseMasteries.length} Pi-Points</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mastery Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chi tiết thành thạo</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {masteries.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-4">📚</div>
                  <p>Chưa có dữ liệu tiến độ. Hãy bắt đầu học để xem tiến độ của bạn!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pi-Point
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mức độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm số
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Độ chính xác
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lần luyện tập
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lần cuối
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {masteries.map((mastery) => (
                        <tr key={mastery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">KP-{mastery.kp_id.slice(0, 8)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getMasteryColor(
                                mastery.mastery_level
                              )}`}
                            >
                              {getMasteryLabel(mastery.mastery_level)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-semibold">{mastery.mastery_score}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{mastery.accuracy.toFixed(1)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{mastery.practice_count}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatTime(mastery.time_spent_minutes)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {mastery.last_practiced_at
                              ? new Date(mastery.last_practiced_at).toLocaleDateString('vi-VN')
                              : 'Chưa có'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Mastery Distribution */}
          {masteries.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Phân bố mức độ thành thạo</h2>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(['excellent', 'good', 'fair', 'poor'] as MasteryLevel[]).map((level) => {
                    const count = masteries.filter((m) => m.mastery_level === level).length;
                    const percentage = masteries.length > 0 ? (count / masteries.length) * 100 : 0;
                    return (
                      <div key={level} className="text-center">
                        <div className={`w-20 h-20 rounded-full ${getMasteryColor(level)} mx-auto mb-2 flex items-center justify-center text-white text-2xl font-bold`}>
                          {count}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{getMasteryLabel(level)}</div>
                        <div className="text-xs text-gray-600">{percentage.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              ← Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

