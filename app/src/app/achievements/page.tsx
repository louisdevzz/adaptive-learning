'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { courseAPI, masteryAPI } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import type { Course, StudentMastery, MasteryLevel } from '@/types';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'time' | 'streak' | 'mastery' | 'course';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export default function AchievementsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [masteries, setMasteries] = useState<StudentMastery[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      loadAchievementsData();
    }
  }, [user, loading]);

  const loadAchievementsData = async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      // Load courses
      const coursesResponse = await courseAPI.listCourses({ page: 1, page_size: 100 });
      const coursesData = coursesResponse.items || [];
      setCourses(coursesData);

      // Load masteries
      const masteriesData = await masteryAPI.listStudentMasteries(user.id);
      setMasteries(masteriesData);

      // Calculate achievements
      const calculatedAchievements = calculateAchievements(masteriesData, coursesData);
      setAchievements(calculatedAchievements);
    } catch (error) {
      console.error('Failed to load achievements data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const calculateAchievements = (
    masteries: StudentMastery[],
    courses: Course[]
  ): Achievement[] => {
    const allAchievements: Achievement[] = [];

    // Learning Achievements
    const kpCompleted = masteries.filter(
      (m) => m.mastery_level === 'excellent' || m.mastery_level === 'good'
    ).length;
    const kpTotal = masteries.length;

    allAchievements.push({
      id: 'first_steps',
      title: 'Bước đầu tiên',
      description: 'Hoàn thành Pi-Point đầu tiên',
      icon: '🎯',
      category: 'learning',
      unlocked: kpCompleted >= 1,
      progress: Math.min(kpCompleted, 1),
      maxProgress: 1,
      rarity: 'common',
      unlockedAt: kpCompleted >= 1 ? new Date().toISOString() : undefined,
    });

    allAchievements.push({
      id: 'century',
      title: 'Thế kỷ tri thức',
      description: 'Hoàn thành 100 Pi-Points',
      icon: '💯',
      category: 'learning',
      unlocked: kpCompleted >= 100,
      progress: Math.min(kpCompleted, 100),
      maxProgress: 100,
      rarity: 'legendary',
      unlockedAt: kpCompleted >= 100 ? new Date().toISOString() : undefined,
    });

    allAchievements.push({
      id: 'perfectionist',
      title: 'Người hoàn hảo',
      description: 'Đạt mức xuất sắc cho 50 Pi-Points',
      icon: '⭐',
      category: 'mastery',
      unlocked: masteries.filter((m) => m.mastery_level === 'excellent').length >= 50,
      progress: Math.min(
        masteries.filter((m) => m.mastery_level === 'excellent').length,
        50
      ),
      maxProgress: 50,
      rarity: 'epic',
      unlockedAt:
        masteries.filter((m) => m.mastery_level === 'excellent').length >= 50
          ? new Date().toISOString()
          : undefined,
    });

    // Time Achievements
    const totalTimeMinutes = masteries.reduce((sum, m) => sum + m.time_spent_minutes, 0);
    const totalHours = Math.floor(totalTimeMinutes / 60);

    allAchievements.push({
      id: 'hour_warrior',
      title: 'Chiến binh giờ',
      description: 'Học tập 10 giờ',
      icon: '⏰',
      category: 'time',
      unlocked: totalHours >= 10,
      progress: Math.min(totalHours, 10),
      maxProgress: 10,
      rarity: 'common',
      unlockedAt: totalHours >= 10 ? new Date().toISOString() : undefined,
    });

    allAchievements.push({
      id: 'time_master',
      title: 'Bậc thầy thời gian',
      description: 'Học tập 100 giờ',
      icon: '⏳',
      category: 'time',
      unlocked: totalHours >= 100,
      progress: Math.min(totalHours, 100),
      maxProgress: 100,
      rarity: 'epic',
      unlockedAt: totalHours >= 100 ? new Date().toISOString() : undefined,
    });

    // Streak Achievements (mock data - would need practice session data)
    const streakDays = 7; // TODO: Calculate from practice sessions

    allAchievements.push({
      id: 'week_warrior',
      title: 'Chiến binh tuần',
      description: 'Học tập 7 ngày liên tục',
      icon: '🔥',
      category: 'streak',
      unlocked: streakDays >= 7,
      progress: Math.min(streakDays, 7),
      maxProgress: 7,
      rarity: 'rare',
      unlockedAt: streakDays >= 7 ? new Date().toISOString() : undefined,
    });

    allAchievements.push({
      id: 'month_master',
      title: 'Bậc thầy tháng',
      description: 'Học tập 30 ngày liên tục',
      icon: '💪',
      category: 'streak',
      unlocked: streakDays >= 30,
      progress: Math.min(streakDays, 30),
      maxProgress: 30,
      rarity: 'legendary',
      unlockedAt: streakDays >= 30 ? new Date().toISOString() : undefined,
    });

    // Practice Achievements
    const totalPractice = masteries.reduce((sum, m) => sum + m.practice_count, 0);

    allAchievements.push({
      id: 'practice_makes_perfect',
      title: 'Luyện tập tạo nên hoàn hảo',
      description: 'Luyện tập 100 lần',
      icon: '📚',
      category: 'learning',
      unlocked: totalPractice >= 100,
      progress: Math.min(totalPractice, 100),
      maxProgress: 100,
      rarity: 'rare',
      unlockedAt: totalPractice >= 100 ? new Date().toISOString() : undefined,
    });

    // Course Achievements
    allAchievements.push({
      id: 'course_explorer',
      title: 'Nhà thám hiểm khóa học',
      description: 'Tham gia 5 khóa học',
      icon: '🗺️',
      category: 'course',
      unlocked: courses.length >= 5,
      progress: Math.min(courses.length, 5),
      maxProgress: 5,
      rarity: 'rare',
      unlockedAt: courses.length >= 5 ? new Date().toISOString() : undefined,
    });

    // Accuracy Achievements
    const highAccuracyCount = masteries.filter((m) => m.accuracy >= 90).length;

    allAchievements.push({
      id: 'sharp_shooter',
      title: 'Xạ thủ bắn tỉa',
      description: 'Đạt ≥90% độ chính xác cho 20 Pi-Points',
      icon: '🎯',
      category: 'mastery',
      unlocked: highAccuracyCount >= 20,
      progress: Math.min(highAccuracyCount, 20),
      maxProgress: 20,
      rarity: 'epic',
      unlockedAt: highAccuracyCount >= 20 ? new Date().toISOString() : undefined,
    });

    return allAchievements;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-400 bg-gray-50';
      case 'rare':
        return 'border-blue-400 bg-blue-50';
      case 'epic':
        return 'border-purple-400 bg-purple-50';
      case 'legendary':
        return 'border-yellow-400 bg-yellow-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '';
      case 'rare':
        return 'shadow-blue-200';
      case 'epic':
        return 'shadow-purple-200';
      case 'legendary':
        return 'shadow-yellow-200';
      default:
        return '';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'learning':
        return 'Học tập';
      case 'time':
        return 'Thời gian';
      case 'streak':
        return 'Chuỗi ngày';
      case 'mastery':
        return 'Thành thạo';
      case 'course':
        return 'Khóa học';
      default:
        return category;
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thành tích</h1>
            <p className="text-gray-600">Khám phá và mở khóa các thành tích của bạn</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-3xl font-bold mb-1">{unlockedCount}</div>
              <div className="text-blue-100">Thành tích đã mở khóa</div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold mb-1">
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
              </div>
              <div className="text-purple-100">Tỷ lệ hoàn thành</div>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold mb-1">
                {achievements.filter((a) => a.rarity === 'legendary' && a.unlocked).length}
              </div>
              <div className="text-green-100">Thành tích huyền thoại</div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tất cả
              </button>
              {['learning', 'time', 'streak', 'mastery', 'course'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all hover:scale-105 ${
                  achievement.unlocked
                    ? `${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)} shadow-lg`
                    : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Achievement Icon */}
                <div className="text-center mb-4">
                  <div
                    className={`text-6xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}
                  >
                    {achievement.icon}
                  </div>
                  {achievement.unlocked && (
                    <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Đã mở khóa
                    </div>
                  )}
                </div>

                {/* Achievement Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Tiến độ</span>
                        <span>
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Unlocked Date */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-3 text-xs text-gray-500">
                      Mở khóa: {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </div>
                  )}

                  {/* Rarity Badge */}
                  <div className="mt-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        achievement.rarity === 'common'
                          ? 'bg-gray-200 text-gray-700'
                          : achievement.rarity === 'rare'
                          ? 'bg-blue-200 text-blue-700'
                          : achievement.rarity === 'epic'
                          ? 'bg-purple-200 text-purple-700'
                          : 'bg-yellow-200 text-yellow-700'
                      }`}
                    >
                      {achievement.rarity === 'common'
                        ? 'Phổ biến'
                        : achievement.rarity === 'rare'
                        ? 'Hiếm'
                        : achievement.rarity === 'epic'
                        ? 'Huyền thoại'
                        : 'Cực hiếm'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAchievements.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600">Không có thành tích nào trong danh mục này</p>
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

