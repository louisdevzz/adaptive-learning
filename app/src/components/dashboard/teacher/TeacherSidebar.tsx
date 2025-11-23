'use client';

import React from 'react';
import { LayoutDashboard, Users, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface TeacherSidebarProps {
  profile: Profile | null;
  activeTab: 'overview' | 'courses' | 'students' | 'analytics';
  onTabChange: (tab: 'overview' | 'courses' | 'students' | 'analytics') => void;
  atRiskCount?: number;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  profile,
  activeTab,
  onTabChange,
  atRiskCount = 0,
}) => {
  const navItems = [
    { key: 'overview' as const, icon: LayoutDashboard, label: 'Tổng quan' },
    { key: 'courses' as const, icon: BookOpen, label: 'Khóa học' },
    { key: 'students' as const, icon: Users, label: 'Học sinh' },
    { key: 'analytics' as const, icon: TrendingUp, label: 'Phân tích' },
  ];

  return (
    <Sidebar collapsible="icon" className="!top-14 !h-[calc(100vh-3.5rem)]">
      <SidebarHeader className="p-4">
        {/* Profile Section */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {profile?.full_name?.[0] || 'T'}
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
              {profile?.full_name || 'Giáo viên'}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Giáo viên</p>
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
                        activeTab === item.key && 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
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

      {/* At-risk students warning */}
      {atRiskCount > 0 && (
        <SidebarFooter className="p-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-semibold mb-1 group-data-[collapsible=icon]:justify-center">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">Cảnh báo</span>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-500 group-data-[collapsible=icon]:hidden">
              {atRiskCount} học sinh cần hỗ trợ
            </p>
          </div>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
};
