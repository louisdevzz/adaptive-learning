'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, KnowledgePoint, MasteryLevel } from '@/types';

interface StudentSidebarProps {
  courses: Course[];
  selectedKP?: KnowledgePoint;
  onSelectKP: (kp: KnowledgePoint) => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  courses,
  selectedKP,
  onSelectKP,
}) => {
  const { profile } = useAuth();

  const getMasteryColor = (level: MasteryLevel) => {
    switch (level) {
      case 'excellent':
        return 'from-[#1B5E20] to-[#2E7D32]';
      case 'good':
        return 'from-[#2E7D32] to-[#388E3C]';
      case 'fair':
        return 'from-[#F57C00] to-[#FF9800]';
      case 'poor':
        return 'from-[#D32F2F] to-[#F44336]';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getMasteryBorderColor = (level: MasteryLevel) => {
    switch (level) {
      case 'excellent':
        return 'border-[#1B5E20]';
      case 'good':
        return 'border-[#2E7D32]';
      case 'fair':
        return 'border-[#F57C00]';
      case 'poor':
        return 'border-[#D32F2F]';
      default:
        return 'border-gray-500';
    }
  };

  const getMasteryBgColor = (level: MasteryLevel) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-50';
      case 'good':
        return 'bg-green-50';
      case 'fair':
        return 'bg-orange-50';
      case 'poor':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
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

  // Mock data for demonstration - In real app, fetch from API
  const mockMastery: Record<string, { score: number; level: MasteryLevel }> = {
    kp1: { score: 95, level: 'excellent' },
    kp2: { score: 87, level: 'good' },
    kp3: { score: 73, level: 'fair' },
    kp4: { score: 45, level: 'poor' },
  };

  return (
    <aside className="w-96 bg-white border-r-2 border-gray-200 overflow-y-auto h-full p-7">
      {/* Learner Profile Card */}
      <div className="m-2 p-4 bg-green-50 rounded-xl border-l-4 border-green-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
            {getInitials(profile?.full_name)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{profile?.full_name || 'Học sinh'}</h3>
            <p className="text-sm text-gray-600">
              {profile?.meta_data?.grade_level ? `Lớp ${profile.meta_data.grade_level}` : 'Học sinh'}
            </p>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-lg font-bold text-blue-600">82%</div>
            <div className="text-xs text-gray-600">Thành thạo</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-lg font-bold text-blue-600">2.5h</div>
            <div className="text-xs text-gray-600">Tuần này</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-lg font-bold text-blue-600">7</div>
            <div className="text-xs text-gray-600">Ngày liên tục</div>
          </div>
        </div>
      </div>

      {/* Courses and Modules */}
      {courses.map((course) => (
        <div key={course.id} className="mb-4">
          {/* Chapter Header */}
          <div className="mx-2 mb-2 p-3 bg-blue-50 rounded-xl border-l-4 border-blue-600">
            <div className="font-bold text-blue-600 text-sm mb-1">
              {course.name}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>73%</span>
              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '73%' }}></div>
              </div>
            </div>
          </div>

          {/* Knowledge Points */}
          {course.modules?.map((module) =>
            module.sections?.map((section) =>
              section.knowledge_points?.map((kp, kpIdx) => {
                const masteryData = mockMastery[`kp${kpIdx + 1}`] || { score: 0, level: 'none' as MasteryLevel };
                const isSelected = selectedKP?.id === kp.id;

                return (
                  <button
                    key={kp.id}
                    onClick={() => onSelectKP(kp)}
                    className={`
                      w-full mx-2 mb-2 h-15 rounded-lg border-2 transition-all hover:-translate-y-0.5 hover:shadow-md
                      ${isSelected ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-transparent bg-white'}
                      border-l-4 ${getMasteryBorderColor(masteryData.level)} shadow-sm
                    `}
                  >
                    <div className="flex items-center p-2 gap-2">
                      {/* Mastery Score Badge */}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getMasteryColor(masteryData.level)} text-white flex flex-col items-center justify-center text-xs font-bold flex-shrink-0 relative`}>
                        <div>{masteryData.score}</div>
                        <div className="absolute bottom-0.5 left-0.5 right-0.5 h-0.5 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full bg-white" style={{ width: `${masteryData.score}%` }}></div>
                        </div>
                      </div>

                      {/* KP Name */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {kp.name}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>
      ))}
    </aside>
  );
};
