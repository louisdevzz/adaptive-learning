'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { profileAPI } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import type { Profile } from '@/types';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    image: '',
    meta_data: {} as Record<string, any>,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        image: profile.image || '',
        meta_data: profile.meta_data || {},
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMetaDataChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      meta_data: {
        ...prev.meta_data,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await profileAPI.updateMyProfile(formData);
      await refreshProfile();
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi cập nhật profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h1>
            <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Cập nhật profile thành công!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt={formData.full_name}
                      className="w-24 h-24 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-3xl border-4 border-white">
                      {getInitials(formData.full_name || profile.full_name)}
                    </div>
                  )}
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                      📷
                    </button>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-white">
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="text-3xl font-bold bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-full max-w-md"
                      placeholder="Họ và tên"
                    />
                  ) : (
                    <h2 className="text-3xl font-bold mb-2">
                      {profile.full_name || 'Chưa có tên'}
                    </h2>
                  )}
                  <p className="text-blue-100 text-lg">
                    {user.email}
                  </p>
                  <p className="text-blue-100 text-sm mt-1">
                    Vai trò: {profile.role === 'student' ? 'Học sinh' : profile.role === 'teacher' ? 'Giáo viên' : profile.role || 'Người dùng'}
                  </p>
                </div>

                {/* Edit Button */}
                <div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            full_name: profile.full_name || '',
                            image: profile.image || '',
                            meta_data: profile.meta_data || {},
                          });
                          setError(null);
                        }}
                        className="px-6 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin tài khoản</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên đăng nhập
                      </label>
                      <input
                        type="text"
                        value={user.username}
                        disabled
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL ảnh đại diện
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={profile.image || 'Chưa có ảnh đại diện'}
                          disabled
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin bổ sung</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lớp học
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.meta_data?.grade_level || ''}
                          onChange={(e) => handleMetaDataChange('grade_level', e.target.value)}
                          placeholder="Ví dụ: 10, 11, 12"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={profile.meta_data?.grade_level ? `Lớp ${profile.meta_data.grade_level}` : 'Chưa cập nhật'}
                          disabled
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trường học
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.meta_data?.school || ''}
                          onChange={(e) => handleMetaDataChange('school', e.target.value)}
                          placeholder="Tên trường học"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={profile.meta_data?.school || 'Chưa cập nhật'}
                          disabled
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày tạo tài khoản
                      </label>
                      <input
                        type="text"
                        value={new Date(user.created_at).toLocaleDateString('vi-VN')}
                        disabled
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
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

