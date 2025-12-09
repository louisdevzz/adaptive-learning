"use client";

import { Checkbox } from "@heroui/checkbox";
import { TeacherTableRow } from "./TeacherTableRow";
import { Teacher } from "@/types/teacher";

interface TeacherTableProps {
  teachers: Teacher[];
  loading: boolean;
  selectedTeachers: string[];
  searchQuery: string;
  onSelectAll: (checked: boolean) => void;
  onSelectTeacher: (id: string) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
}

export function TeacherTable({
  teachers,
  loading,
  selectedTeachers,
  searchQuery,
  onSelectAll,
  onSelectTeacher,
  onEdit,
  onDelete,
}: TeacherTableProps) {
  return (
    <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col items-start overflow-clip relative rounded-xl shadow-[0px_1px_3px_0px_rgba(10,13,18,0.1),0px_1px_2px_0px_rgba(10,13,18,0.06)] w-full">
      {loading ? (
        <div className="flex items-center justify-center p-8 w-full">
          <p className="text-[#535862] text-sm">Đang tải...</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="bg-white border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-12 items-center px-4 py-2 relative shrink-0 w-full">
            <Checkbox
              isSelected={
                teachers.length > 0 &&
                teachers.every((teacher) => selectedTeachers.includes(teacher.id))
              }
              isIndeterminate={
                selectedTeachers.length > 0 &&
                selectedTeachers.length < teachers.length
              }
              onValueChange={onSelectAll}
              size="sm"
            />
            <div className="flex-1 font-medium leading-4 text-[#535862] text-xs">
              Tên / Email
            </div>
            <div className="w-40 font-medium leading-4 text-[#535862] text-xs">
              Kinh nghiệm
            </div>
            <div className="w-48 font-medium leading-4 text-[#535862] text-xs">
              Chuyên môn
            </div>
            <div className="w-20 font-medium leading-4 text-[#535862] text-xs text-center">
              Thao tác
            </div>
          </div>

          {/* Table Rows */}
          {teachers.length === 0 ? (
            <div className="flex items-center justify-center p-8 w-full">
              <p className="text-[#535862] text-sm">
                {searchQuery ? "Không tìm thấy giáo viên nào" : "Chưa có giáo viên nào"}
              </p>
            </div>
          ) : (
            teachers.map((teacher, index) => (
              <TeacherTableRow
                key={teacher.id}
                teacher={teacher}
                index={index}
                isSelected={selectedTeachers.includes(teacher.id)}
                onSelect={onSelectTeacher}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}

