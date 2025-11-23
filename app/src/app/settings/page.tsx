'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    achievements: boolean;
    progress: boolean;
  };
  learning: {
    difficulty: 'auto' | 'easy' | 'medium' | 'hard';
    practiceMode: 'adaptive' | 'sequential';
    showHints: boolean;
    autoAdvance: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'vi' | 'en';
    fontSize: 'small' | 'medium' | 'large';
  };
  privacy: {
    showProgress: boolean;
    showAchievements: boolean;
    allowAnalytics: boolean;
  };
}

export default function SettingsPage() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      achievements: true,
      progress: true,
    },
    learning: {
      difficulty: 'auto',
      practiceMode: 'adaptive',
      showHints: true,
      autoAdvance: false,
    },
    appearance: {
      theme: 'light',
      language: 'vi',
      fontSize: 'medium',
    },
    privacy: {
      showProgress: true,
      showAchievements: true,
      allowAnalytics: true,
    },
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'learning' | 'appearance' | 'privacy' | 'account'>(
    'notifications'
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSettingChange = (category: keyof SettingsData, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Save to localStorage
      localStorage.setItem('user_settings', JSON.stringify(settings));
      
      // TODO: Save to backend API if available
      // await settingsAPI.updateSettings(settings);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    // TODO: Implement change password
    alert('Tính năng đổi mật khẩu sẽ được triển khai sớm');
  };

  const handleDeleteAccount = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      // TODO: Implement delete account
      alert('Tính năng xóa tài khoản sẽ được triển khai sớm');
    }
  };

  if (loading) {
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt cá nhân</h1>
            <p className="text-gray-600">Tùy chỉnh trải nghiệm học tập của bạn</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Đã lưu cài đặt thành công!
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-4 sticky top-20">
                <nav className="space-y-2">
                  {[
                    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
                    { id: 'learning', label: 'Học tập', icon: '📚' },
                    { id: 'appearance', label: 'Giao diện', icon: '🎨' },
                    { id: 'privacy', label: 'Quyền riêng tư', icon: '🔒' },
                    { id: 'account', label: 'Tài khoản', icon: '👤' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-8">
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông báo</h2>
                      <p className="text-gray-600">Quản lý cách bạn nhận thông báo</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Thông báo qua email</h3>
                          <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) =>
                              handleSettingChange('notifications', 'email', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Thông báo đẩy</h3>
                          <p className="text-sm text-gray-600">Nhận thông báo trên trình duyệt</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) =>
                              handleSettingChange('notifications', 'push', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Thông báo thành tích</h3>
                          <p className="text-sm text-gray-600">Thông báo khi mở khóa thành tích mới</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.achievements}
                            onChange={(e) =>
                              handleSettingChange('notifications', 'achievements', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Thông báo tiến độ</h3>
                          <p className="text-sm text-gray-600">Thông báo về tiến độ học tập</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.progress}
                            onChange={(e) =>
                              handleSettingChange('notifications', 'progress', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Learning Tab */}
                {activeTab === 'learning' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Cài đặt học tập</h2>
                      <p className="text-gray-600">Tùy chỉnh cách bạn học</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block font-semibold text-gray-900 mb-2">
                          Mức độ khó
                        </label>
                        <select
                          value={settings.learning.difficulty}
                          onChange={(e) =>
                            handleSettingChange('learning', 'difficulty', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="auto">Tự động (theo AI)</option>
                          <option value="easy">Dễ</option>
                          <option value="medium">Trung bình</option>
                          <option value="hard">Khó</option>
                        </select>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block font-semibold text-gray-900 mb-2">
                          Chế độ luyện tập
                        </label>
                        <select
                          value={settings.learning.practiceMode}
                          onChange={(e) =>
                            handleSettingChange('learning', 'practiceMode', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="adaptive">Thích ứng (AI đề xuất)</option>
                          <option value="sequential">Tuần tự</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Hiển thị gợi ý</h3>
                          <p className="text-sm text-gray-600">Hiển thị gợi ý khi làm bài tập</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.learning.showHints}
                            onChange={(e) =>
                              handleSettingChange('learning', 'showHints', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Tự động chuyển tiếp</h3>
                          <p className="text-sm text-gray-600">Tự động chuyển sang Pi-Point tiếp theo khi hoàn thành</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.learning.autoAdvance}
                            onChange={(e) =>
                              handleSettingChange('learning', 'autoAdvance', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Giao diện</h2>
                      <p className="text-gray-600">Tùy chỉnh giao diện ứng dụng</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block font-semibold text-gray-900 mb-2">Giao diện</label>
                        <select
                          value={settings.appearance.theme}
                          onChange={(e) =>
                            handleSettingChange('appearance', 'theme', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="light">Sáng</option>
                          <option value="dark">Tối</option>
                          <option value="auto">Theo hệ thống</option>
                        </select>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block font-semibold text-gray-900 mb-2">Ngôn ngữ</label>
                        <select
                          value={settings.appearance.language}
                          onChange={(e) =>
                            handleSettingChange('appearance', 'language', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="vi">Tiếng Việt</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block font-semibold text-gray-900 mb-2">Cỡ chữ</label>
                        <select
                          value={settings.appearance.fontSize}
                          onChange={(e) =>
                            handleSettingChange('appearance', 'fontSize', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="small">Nhỏ</option>
                          <option value="medium">Trung bình</option>
                          <option value="large">Lớn</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Quyền riêng tư</h2>
                      <p className="text-gray-600">Quản lý quyền riêng tư và dữ liệu của bạn</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Hiển thị tiến độ</h3>
                          <p className="text-sm text-gray-600">Cho phép người khác xem tiến độ học tập của bạn</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showProgress}
                            onChange={(e) =>
                              handleSettingChange('privacy', 'showProgress', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Hiển thị thành tích</h3>
                          <p className="text-sm text-gray-600">Cho phép người khác xem thành tích của bạn</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showAchievements}
                            onChange={(e) =>
                              handleSettingChange('privacy', 'showAchievements', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">Cho phép phân tích</h3>
                          <p className="text-sm text-gray-600">Cho phép thu thập dữ liệu để cải thiện trải nghiệm</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.allowAnalytics}
                            onChange={(e) =>
                              handleSettingChange('privacy', 'allowAnalytics', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tài khoản</h2>
                      <p className="text-gray-600">Quản lý tài khoản của bạn</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Thông tin tài khoản</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>Email: {user.email}</p>
                          <p>Tên đăng nhập: {user.username}</p>
                          <p>Vai trò: {profile.role === 'student' ? 'Học sinh' : profile.role || 'Người dùng'}</p>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Đổi mật khẩu</h3>
                        <button
                          onClick={handleChangePassword}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Đổi mật khẩu
                        </button>
                      </div>

                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <h3 className="font-semibold text-red-900 mb-2">Vùng nguy hiểm</h3>
                        <p className="text-sm text-red-700 mb-4">
                          Xóa tài khoản của bạn sẽ xóa vĩnh viễn tất cả dữ liệu. Hành động này không thể hoàn tác.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                          Xóa tài khoản
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                {activeTab !== 'account' && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

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

