'use client';

import React, { useState, useMemo } from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import { User } from '@heroui/user';
import { Search } from 'lucide-react';
import { useUsers } from '@/hooks/use-admin-data';
import type { UserListItem } from '@/types';

interface StudentSearchSelectProps {
  selectedStudentId: string;
  onStudentSelect: (studentId: string) => void;
  isDisabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const StudentSearchSelect: React.FC<StudentSearchSelectProps> = ({
  selectedStudentId,
  onStudentSelect,
  isDisabled = false,
  label = "Chọn học sinh (con)",
  placeholder = "Tìm kiếm học sinh...",
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students with search
  const { data: studentsData, isLoading } = useUsers({
    page: 1,
    pageSize: 50,
    role: 'student',
    isActive: true,
    search: searchQuery || undefined,
  });

  const students = useMemo(() => studentsData?.items || [], [studentsData]);

  // Find selected student for display
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder}
      variant="bordered"
      isDisabled={isDisabled}
      isLoading={isLoading}
      defaultItems={students}
      selectedKey={selectedStudentId}
      onSelectionChange={(key) => {
        if (key) {
          onStudentSelect(key.toString());
        }
      }}
      onInputChange={(value) => {
        setSearchQuery(value);
      }}
      startContent={<Search className="w-4 h-4 text-gray-400" />}
      listboxProps={{
        emptyContent: searchQuery ? "Không tìm thấy học sinh" : "Nhập để tìm kiếm",
      }}
      classNames={{
        listboxWrapper: "max-h-[300px]",
      }}
    >
      {(student: UserListItem) => (
        <AutocompleteItem
          key={student.id}
          textValue={student.full_name || student.username}
        >
          <User
            name={student.full_name || student.username}
            description={
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">@{student.username}</span>
                <span className="text-xs text-gray-400">{student.email}</span>
              </div>
            }
            avatarProps={{
              name: (student.full_name || student.username)[0].toUpperCase(),
              size: 'sm',
              classNames: {
                base: 'bg-blue-100 text-blue-600',
              },
            }}
          />
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};
