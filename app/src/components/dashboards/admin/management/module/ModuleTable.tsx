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
import { Module } from "@/types/course";

interface ModuleTableProps {
  modules: Module[];
  loading: boolean;
  selectedModules: string[];
  searchQuery: string;
  onSelectAll: (checked: boolean) => void;
  onSelectModule: (id: string) => void;
  onEdit: (module: Module) => void;
  onDelete: (id: string) => void;
  onSearchChange?: (value: string) => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ModuleTable({
  modules,
  loading,
  selectedModules,
  searchQuery,
  onSelectAll,
  onSelectModule,
  onEdit,
  onDelete,
  onSearchChange,
  selectedCount,
  onClearSelection,
  currentPage,
  totalPages,
  onPageChange,
}: ModuleTableProps) {
  // Inline Filters Component
  const renderFilters = () => {
    if (!onSearchChange) return null;

    return (
      <div className="flex items-center gap-3 w-full mb-4">
        <Input
          placeholder="Tìm kiếm theo tên chủ đề hoặc mô tả..."
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
  const renderTableRow = (module: Module, index: number) => {
    return (
      <div
        key={module.id}
        className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-16 items-center px-4 py-3 relative shrink-0 w-full ${
          index % 2 === 0 ? "bg-white" : "bg-neutral-50"
        }`}
      >
        <Checkbox
          isSelected={selectedModules.includes(module.id)}
          onValueChange={() => onSelectModule(module.id)}
          size="sm"
        />
        <div className="flex gap-3 items-center w-48 min-w-0">
          <p className="font-medium leading-4 text-[#181d27] text-sm truncate w-full">
            {module.title}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs text-[#181d27] leading-5">
            {module.description.length > 150
              ? `${module.description.substring(0, 150)}...`
              : module.description}
          </p>
        </div>
        <div className="w-56 shrink-0">
          <p className="font-medium text-xs text-[#181d27]">
            {module.course?.title || "N/A"}
          </p>
        </div>
        <div className="w-24 shrink-0">
          <p className="font-medium text-xs text-[#181d27]">
            Thứ tự: {module.orderIndex}
          </p>
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
              aria-label="Module actions"
              classNames={{
                base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[150px]",
              }}
            >
              <DropdownItem
                key="edit"
                textValue="Edit"
                startContent={<Edit className="size-4 text-[#535862]" />}
                onPress={() => onEdit(module)}
              >
                <span className="text-[#181d27]">Chỉnh sửa</span>
              </DropdownItem>
              <DropdownItem
                key="delete"
                textValue="Delete"
                startContent={<Trash2 className="size-4 text-[#b42318]" />}
                onPress={() => onDelete(module.id)}
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
            isSelected={selectedModules.length === modules.length && modules.length > 0}
            isIndeterminate={selectedModules.length > 0 && selectedModules.length < modules.length}
            onValueChange={onSelectAll}
            size="sm"
          />
          <div className="flex gap-3 items-center w-48">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Tên chủ đề</p>
          </div>
          <div className="flex-1">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Mô tả</p>
          </div>
          <div className="w-56 shrink-0">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Môn học</p>
          </div>
          <div className="w-24 shrink-0">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Thứ tự</p>
          </div>
          <div className="w-20 shrink-0"></div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#535862]">Đang tải...</p>
          </div>
        ) : modules.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#535862]">Không có chủ đề nào</p>
          </div>
        ) : (
          modules.map((module, index) => renderTableRow(module, index))
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
}

