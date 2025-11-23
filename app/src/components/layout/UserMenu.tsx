'use client';

import React, { useEffect, useRef } from 'react';
import { User, TrendingUp, Trophy, Settings, Wrench, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  onClose: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onClose }) => {
  const { profile, user, logout } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always redirect to login page after logout attempt
      // Use replace to prevent going back to the previous page
      router.replace('/login');
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'student':
        return 'Học sinh';
      case 'teacher':
        return 'Giáo viên';
      case 'admin':
        return 'Quản trị viên';
      case 'parent':
        return 'Phụ huynh';
      default:
        return 'Người dùng';
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-14 right-0 w-72 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-4 text-center border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{profile?.full_name || user?.username}</h3>
        <p className="text-sm text-gray-600 mt-1">{getRoleLabel(profile?.role)}</p>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <button
          onClick={() => {
            router.push('/profile');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition text-left"
        >
          <User className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-700">Hồ sơ cá nhân</span>
        </button>

        <button
          onClick={() => {
            router.push('/progress');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition text-left"
        >
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-700">Tiến độ học tập</span>
        </button>

        <button
          onClick={() => {
            router.push('/achievements');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition text-left"
        >
          <Trophy className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-700">Thành tích</span>
        </button>

        <div className="my-2 border-t border-gray-100"></div>

        <button
          onClick={() => {
            router.push('/settings');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition text-left"
        >
          <Settings className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-700">Cài đặt cá nhân</span>
        </button>

        {profile?.role === 'admin' && (
          <button
            onClick={() => {
              router.push('/admin');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition text-left"
          >
            <Wrench className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-700">Cài đặt hệ thống</span>
          </button>
        )}

        <div className="my-2 border-t border-gray-100"></div>

        <button
          onClick={() => {
            router.push('/help');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition text-left"
        >
          <HelpCircle className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-700">Trợ giúp</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition text-left text-red-600"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};
