'use client';

import React from 'react';
import { LayoutDashboard, Users, BookOpen, TrendingUp } from 'lucide-react';
import type { Profile } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarRail,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  apiLatency: number;
  uptime: string;
  activeConnections: number;
}

interface AdminSidebarProps {
  profile: Profile | null;
  activeTab: 'overview' | 'users' | 'courses' | 'analytics';
  onTabChange: (tab: 'overview' | 'users' | 'courses' | 'analytics') => void;
  systemHealth: SystemHealth;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  profile,
  activeTab,
  onTabChange,
}) => {
  const navItems = [
    { key: 'overview' as const, icon: LayoutDashboard, label: 'Tổng quan' },
    { key: 'users' as const, icon: Users, label: 'Người dùng' },
    { key: 'courses' as const, icon: BookOpen, label: 'Khóa học' },
    { key: 'analytics' as const, icon: TrendingUp, label: 'Phân tích' }
  ];

  return (
    <Sidebar collapsible="icon" className="!top-14 !h-[calc(100vh-3.5rem)]">
      <SidebarHeader className="p-4">
        {/* Profile Section */}
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {profile?.full_name?.[0] || 'A'}
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">Quản trị viên</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.key)}
                      isActive={activeTab === item.key}
                      tooltip={item.label}
                      className={`${cn(
                        activeTab === item.key && 'bg-red-600 text-white hover:bg-red-700 hover:text-white'
                      )} cursor-pointer`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
