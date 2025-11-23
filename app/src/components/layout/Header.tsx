'use client';

import React, { useState } from 'react';
import { GraduationCap, Search, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { profile } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm z-50">
      {/* Logo */}
      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <GraduationCap className="w-6 h-6" />
        <span>PiStudy - AI Tutoring System</span>
      </h1>

      {/* Header Controls */}
      <div className="ml-auto flex items-center gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm Pi-point..."
            className="w-72 px-3 py-2 pr-10 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* AI Status Indicator */}
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>AI Tutor Active</span>
        </div>

        {/* Notification Icon */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
            3
          </span>
        </button>

        {/* User Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white hover:ring-2 hover:ring-blue-300 transition cursor-pointer"
          >
            {getInitials(profile?.full_name)}
          </button>

          {showUserMenu && (
            <UserMenu onClose={() => setShowUserMenu(false)} />
          )}
        </div>
      </div>
    </header>
  );
};
