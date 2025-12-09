"use client";

import { Class } from "@/types/class";
import { GraduationCap, Calendar, User, Users, BookOpen } from "lucide-react";

interface ClassDetailHeaderProps {
  classData: Class;
  activeTab: 'students' | 'courses';
  studentsCount: number;
  coursesCount: number;
  onTabChange: (tab: 'students' | 'courses') => void;
}

export function ClassDetailHeader({
  classData,
  activeTab,
  studentsCount,
  coursesCount,
  onTabChange,
}: ClassDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#181d27]">{classData.className}</h1>
          <div className="flex gap-4 items-center text-sm text-[#535862]">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4" />
              <span>Khối {classData.gradeLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>{classData.schoolYear}</span>
            </div>
            {classData.homeroomTeacher && (
              <div className="flex items-center gap-2">
                <User className="size-4" />
                <span>GVCN: {classData.homeroomTeacher.fullName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e9eaeb] w-full">
        <button
          onClick={() => onTabChange('students')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'students'
              ? 'border-[#7f56d9] text-[#7f56d9]'
              : 'border-transparent text-[#535862] hover:text-[#181d27]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            <span>Học sinh ({studentsCount})</span>
          </div>
        </button>
        <button
          onClick={() => onTabChange('courses')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'courses'
              ? 'border-[#7f56d9] text-[#7f56d9]'
              : 'border-transparent text-[#535862] hover:text-[#181d27]'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="size-4" />
            <span>Khóa học ({coursesCount})</span>
          </div>
        </button>
      </div>
    </div>
  );
}

