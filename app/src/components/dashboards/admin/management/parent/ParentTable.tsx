"use client";

import { Checkbox } from "@heroui/checkbox";
import { Avatar } from "@heroui/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { MoreVertical, Edit, Trash2, ChevronDown, Search } from "lucide-react";
import { Parent } from "@/types/parent";

interface ParentTableProps {
  parents: Parent[];
  loading: boolean;
  selectedParents: string[];
  searchQuery: string;
  onSelectAll: (checked: boolean) => void;
  onSelectParent: (id: string) => void;
  onEdit: (parent: Parent) => void;
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

const relationshipLabels: Record<string, string> = {
  father: "Cha",
  mother: "Mẹ",
  guardian: "Người giám hộ",
};

export function ParentTable({
  parents,
  loading,
  selectedParents,
  searchQuery,
  onSelectAll,
  onSelectParent,
  onEdit,
  onDelete,
  onSearchChange,
  selectedCount,
  onClearSelection,
  currentPage,
  totalPages,
  onPageChange,
}: ParentTableProps) {
  // Inline Filters Component
  const renderFilters = () => {
    if (!onSearchChange) return null;

    return (
      <div className="flex items-center gap-3 w-full mb-4">
        <Input
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
  const renderTableRow = (parent: Parent, index: number) => {
    const phone = parent.parentInfo?.phone || "N/A";
    const address = parent.parentInfo?.address || "N/A";
    const relationshipType = parent.parentInfo?.relationshipType || "guardian";

    return (
      <div
        key={parent.id}
        className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-16 items-center px-4 py-3 relative shrink-0 w-full ${
          index % 2 === 0 ? "bg-white" : "bg-neutral-50"
        }`}
      >
        <Checkbox
          isSelected={selectedParents.includes(parent.id)}
          onValueChange={() => onSelectParent(parent.id)}
          size="sm"
        />
        <div className="flex gap-3 items-center flex-1">
          <Avatar
            src={parent.avatarUrl || "/asset/4f9e135d-72bf-49d5-8313-cacb6abeb703.svg"}
            size="md"
            className="rounded-full shrink-0"
          />
          <div className="flex flex-col items-start">
            <p className="font-medium leading-4 text-[#181d27] text-sm">
              {parent.fullName}
            </p>
          </div>
        </div>
        <div className="w-48">
          <p className="font-normal leading-4 text-[#535862] text-xs">
            {parent.email}
          </p>
        </div>
        <div className="w-32">
          <p className="font-normal text-xs text-[#414651]">
            {phone}
          </p>
        </div>
        <div className="w-48">
          <p className="font-normal text-xs text-[#535862] truncate">
            {address}
          </p>
        </div>
        <div className="w-32">
          <div className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-[#e0f2fe]">
            <p className="font-medium text-xs text-[#0369a1]">
              {relationshipLabels[relationshipType]}
            </p>
          </div>
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
              aria-label="Parent actions"
              classNames={{
                base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[150px]",
              }}
            >
              <DropdownItem
                key="edit"
                textValue="Edit"
                startContent={<Edit className="size-4 text-[#535862]" />}
                onPress={() => onEdit(parent)}
              >
                <span className="text-[#181d27]">Chỉnh sửa</span>
              </DropdownItem>
              <DropdownItem
                key="delete"
                textValue="Delete"
                startContent={<Trash2 className="size-4 text-[#b42318]" />}
                onPress={() => onDelete(parent.id)}
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
                  parents.length > 0 &&
                  parents.every((parent) => selectedParents.includes(parent.id))
                }
                isIndeterminate={
                  selectedParents.length > 0 &&
                  selectedParents.length < parents.length
                }
                onValueChange={onSelectAll}
                size="sm"
              />
              <div className="flex-1 font-medium leading-4 text-[#535862] text-xs">
                Tên
              </div>
              <div className="w-48 font-medium leading-4 text-[#535862] text-xs">
                Email
              </div>
              <div className="w-32 font-medium leading-4 text-[#535862] text-xs">
                Số điện thoại
              </div>
              <div className="w-48 font-medium leading-4 text-[#535862] text-xs">
                Địa chỉ
              </div>
              <div className="w-32 font-medium leading-4 text-[#535862] text-xs">
                Mối quan hệ
              </div>
              <div className="w-20 font-medium leading-4 text-[#535862] text-xs text-center">
                Thao tác
              </div>
            </div>

            {/* Table Rows */}
            {parents.length === 0 ? (
              <div className="flex items-center justify-center p-8 w-full">
                <p className="text-[#535862] text-sm">
                  {searchQuery ? "Không tìm thấy phụ huynh nào" : "Chưa có phụ huynh nào"}
                </p>
              </div>
            ) : (
              parents.map((parent, index) => renderTableRow(parent, index))
            )}

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}

