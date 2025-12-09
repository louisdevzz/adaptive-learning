"use client";

import { Checkbox } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { MoreVertical, Edit, Trash2, ChevronDown, Search } from "lucide-react";
import { Class } from "@/types/class";

interface ClassTableProps {
  classes: Class[];
  loading: boolean;
  selectedClasses: string[];
  searchQuery: string;
  onSelectAll: (checked: boolean) => void;
  onSelectClass: (id: string) => void;
  onEdit: (classItem: Class) => void;
  onDelete: (id: string) => void;
  // Filters props
  onSearchChange?: (value: string) => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ClassTable({
  classes,
  loading,
  selectedClasses,
  searchQuery,
  onSelectAll,
  onSelectClass,
  onEdit,
  onDelete,
  onSearchChange,
  selectedCount,
  onClearSelection,
  currentPage,
  totalPages,
  onPageChange,
}: ClassTableProps) {
  // Inline Filters Component
  const renderFilters = () => {
    if (!onSearchChange) return null;

    return (
      <div className="flex items-center gap-3 w-full mb-4">
        <Input
          placeholder="Tìm kiếm theo tên lớp, khối hoặc năm học..."
          size="sm"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          startContent={<Search className="size-4 text-[#717680]" />}
          className="flex-1"
          classNames={{
            input: "text-sm text-[#717680]",
            inputWrapper: "border-[#d5d7da] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] h-9",
          }}
        />
        {selectedCount && selectedCount > 0 && onClearSelection && (
          <Button
            variant="bordered"
            size="sm"
            className="border-[#d5d7da] text-[#414651] font-semibold"
            onPress={onClearSelection}
          >
            Bỏ chọn ({selectedCount})
          </Button>
        )}
      </div>
    );
  };

  // Inline Table Row Component
  const renderTableRow = (classItem: Class, index: number) => {
    return (
      <div
        key={classItem.id}
        className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-16 items-center px-4 py-3 relative shrink-0 w-full ${
          index % 2 === 0 ? "bg-white" : "bg-neutral-50"
        }`}
      >
        <Checkbox
          isSelected={selectedClasses.includes(classItem.id)}
          onValueChange={() => onSelectClass(classItem.id)}
          size="sm"
        />
        <div className="flex gap-3 items-center flex-1 min-w-0">
          <p className="font-medium leading-4 text-[#181d27] text-sm truncate w-full">
            {classItem.className}
          </p>
        </div>
        <div className="w-24">
          <p className="font-medium text-xs text-[#181d27]">
            Khối {classItem.gradeLevel}
          </p>
        </div>
        <div className="w-32">
          <p className="font-medium text-xs text-[#181d27]">
            {classItem.schoolYear}
          </p>
        </div>
        <div className="w-48">
          {classItem.homeroomTeacher ? (
            <div className="flex flex-col items-start">
              <p className="font-medium text-xs text-[#181d27]">
                {classItem.homeroomTeacher.fullName}
              </p>
              <p className="font-normal text-xs text-[#535862]">
                {classItem.homeroomTeacher.email}
              </p>
            </div>
          ) : (
            <p className="font-normal text-xs text-[#535862]">Chưa có</p>
          )}
        </div>
        <div className="w-20 flex justify-center">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                variant="light"
                isIconOnly
                size="sm"
                className="p-1 min-w-0 h-auto"
              >
                <MoreVertical className="size-4 text-[#414651]" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Class actions"
              classNames={{
                base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[150px]",
              }}
            >
              <DropdownItem
                key="edit"
                textValue="Edit"
                startContent={<Edit className="size-4 text-[#535862]" />}
                onPress={() => onEdit(classItem)}
              >
                <span className="text-[#181d27]">Chỉnh sửa</span>
              </DropdownItem>
              <DropdownItem
                key="delete"
                textValue="Delete"
                startContent={<Trash2 className="size-4 text-[#b42318]" />}
                onPress={() => onDelete(classItem.id)}
                className="text-[#b42318]"
              >
                <span className="text-[#b42318]">Xóa</span>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    );
  };

  // Inline Pagination Component
  const renderPagination = () => {
    if (!currentPage || !totalPages || !onPageChange || totalPages <= 1) {
      return null;
    }

    return (
      <div className="border-[#e9eaeb] border-b-0 border-l-0 border-r-0 border-solid border-t flex items-center justify-between pb-3 pt-2 px-4 relative shrink-0 w-full">
        <div className="flex gap-2 items-start relative shrink-0">
          <Button
            variant="bordered"
            size="sm"
            isDisabled={currentPage === 1}
            className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
            startContent={<ChevronDown className="size-4 text-[#414651] rotate-90" />}
            onPress={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            Trước
          </Button>
          <Button
            variant="bordered"
            size="sm"
            isDisabled={currentPage === totalPages}
            className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
            endContent={<ChevronDown className="size-4 text-[#414651] -rotate-90" />}
            onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            Sau
          </Button>
        </div>
        <p className="font-medium leading-4 text-[#414651] text-xs">
          Trang {currentPage} của {totalPages}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Filters */}
      {renderFilters()}

      {/* Table */}
      <div className="bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] flex flex-col w-full">
        {/* Table Header */}
        <div className="border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-12 items-center px-4 py-3 relative shrink-0 w-full bg-neutral-50">
          <Checkbox
            isSelected={selectedClasses.length === classes.length && classes.length > 0}
            isIndeterminate={selectedClasses.length > 0 && selectedClasses.length < classes.length}
            onValueChange={onSelectAll}
            size="sm"
          />
          <div className="flex gap-3 items-center flex-1">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Tên lớp</p>
          </div>
          <div className="w-24">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Khối</p>
          </div>
          <div className="w-32">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Năm học</p>
          </div>
          <div className="w-48">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Giáo viên chủ nhiệm</p>
          </div>
          <div className="w-20"></div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#535862]">Đang tải...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#535862]">Không có lớp học nào</p>
          </div>
        ) : (
          classes.map((classItem, index) => renderTableRow(classItem, index))
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
}

