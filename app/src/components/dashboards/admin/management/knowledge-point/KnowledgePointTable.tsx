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
import { MoreVertical, Edit, Trash2, ChevronDown, Search, ExternalLink, Video, FileText, Gamepad2, ClipboardCheck, Paperclip } from "lucide-react";
import { KnowledgePoint } from "@/types/knowledge-point";

interface KnowledgePointTableProps {
  knowledgePoints: KnowledgePoint[];
  loading: boolean;
  selectedKnowledgePoints: string[];
  searchQuery: string;
  onSelectAll: (checked: boolean) => void;
  onSelectKnowledgePoint: (id: string) => void;
  onEdit: (knowledgePoint: KnowledgePoint) => void;
  onDelete: (id: string) => void;
  onSearchChange?: (value: string) => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  allKnowledgePoints?: KnowledgePoint[]; // For looking up prerequisite names
}

export function KnowledgePointTable({
  knowledgePoints,
  loading,
  selectedKnowledgePoints,
  searchQuery,
  onSelectAll,
  onSelectKnowledgePoint,
  onEdit,
  onDelete,
  onSearchChange,
  selectedCount,
  onClearSelection,
  currentPage,
  totalPages,
  onPageChange,
  allKnowledgePoints = [],
}: KnowledgePointTableProps) {
  // Inline Filters Component
  const renderFilters = () => {
    if (!onSearchChange) return null;

    return (
      <div className="flex items-center gap-3 w-full mb-4">
        <Input
          placeholder="Tìm kiếm theo tên hoặc mô tả điểm kiến thức..."
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
  const renderTableRow = (kp: KnowledgePoint, index: number) => {
    const getDifficultyLabel = (level: number) => {
      const labels: { [key: number]: string } = {
        1: "Rất dễ",
        2: "Dễ",
        3: "Trung bình",
        4: "Khó",
        5: "Rất khó",
      };
      return labels[level] || `Cấp độ ${level}`;
    };

    // Get prerequisite knowledge point names
    const getPrerequisiteNames = (prerequisiteIds?: string[]) => {
      if (!prerequisiteIds || prerequisiteIds.length === 0) return [];
      return prerequisiteIds
        .map((id) => {
          const prereq = allKnowledgePoints.find((kpItem) => kpItem.id === id);
          return prereq ? prereq.title : null;
        })
        .filter(Boolean) as string[];
    };

    const prerequisiteNames = getPrerequisiteNames(kp.prerequisites);

    // Resource type icons
    const getResourceIcon = (type: string) => {
      const icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
        video: Video,
        article: FileText,
        interactive: Gamepad2,
        quiz: ClipboardCheck,
        other: Paperclip,
      };
      const IconComponent = icons[type] || Paperclip;
      return <IconComponent className="size-4 text-[#535862]" />;
    };

    return (
      <div
        key={kp.id}
        className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-16 items-center px-4 py-3 relative shrink-0 w-full ${
          index % 2 === 0 ? "bg-white" : "bg-neutral-50"
        }`}
      >
        <Checkbox
          isSelected={selectedKnowledgePoints.includes(kp.id)}
          onValueChange={() => onSelectKnowledgePoint(kp.id)}
          size="sm"
        />
        <div className="flex gap-3 items-center w-48 min-w-0">
          <p className="font-medium leading-4 text-[#181d27] text-sm truncate w-full">
            {kp.title}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs text-[#181d27] leading-5">
            {kp.description.length > 100
              ? `${kp.description.substring(0, 100)}...`
              : kp.description}
          </p>
        </div>
        <div className="w-28 shrink-0">
          <p className="font-medium text-xs text-[#181d27]">
            {getDifficultyLabel(kp.difficultyLevel)}
          </p>
        </div>

        {/* Prerequisites Column */}
        <div className="w-40 shrink-0">
          {prerequisiteNames.length > 0 ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#181d27] font-medium truncate">
                {prerequisiteNames[0]}
              </span>
              {prerequisiteNames.length > 1 && (
                <span className="text-xs text-[#535862]">
                  +{prerequisiteNames.length - 1} khác
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-[#535862]">Không có</span>
          )}
        </div>

        {/* Resources Column with Dropdown */}
        <div className="w-32 shrink-0 flex items-center">
          {kp.resources && kp.resources.length > 0 ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  size="sm"
                  className="border-[#d5d7da] h-7 min-w-0 px-2"
                  endContent={<ChevronDown className="size-3" />}
                >
                  <span className="text-xs">{kp.resources.length} tài nguyên</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Resources"
                classNames={{
                  base: "bg-white border border-[#e9eaeb] rounded-xl shadow-lg max-w-xs",
                }}
              >
                {kp.resources.map((resource, idx) => (
                  <DropdownItem
                    key={`${kp.id}-resource-${idx}`}
                    textValue={resource.title}
                    className="py-2"
                    endContent={<ExternalLink className="size-3 text-[#7f56d9]" />}
                    onPress={() => window.open(resource.url, '_blank')}
                  >
                    <div className="flex items-center gap-2 max-w-full">
                      <span className="text-base shrink-0">{getResourceIcon(resource.resourceType)}</span>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-xs font-medium text-[#181d27] truncate">
                          {resource.title}
                        </span>
                        {resource.description && (
                          <span className="text-xs text-[#535862] line-clamp-2">
                            {resource.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <span className="text-xs text-[#535862]">Không có</span>
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
              aria-label="Knowledge Point actions"
              classNames={{
                base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[150px]",
              }}
            >
              <DropdownItem
                key="edit"
                textValue="Edit"
                startContent={<Edit className="size-4 text-[#535862]" />}
                onPress={() => onEdit(kp)}
              >
                <span className="text-[#181d27]">Chỉnh sửa</span>
              </DropdownItem>
              <DropdownItem
                key="delete"
                textValue="Delete"
                startContent={<Trash2 className="size-4 text-[#b42318]" />}
                onPress={() => onDelete(kp.id)}
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
            isSelected={selectedKnowledgePoints.length === knowledgePoints.length && knowledgePoints.length > 0}
            isIndeterminate={selectedKnowledgePoints.length > 0 && selectedKnowledgePoints.length < knowledgePoints.length}
            onValueChange={onSelectAll}
            size="sm"
          />
          <div className="flex gap-3 items-center w-48">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Tên điểm kiến thức</p>
          </div>
          <div className="flex-1">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Mô tả</p>
          </div>
          <div className="w-28 shrink-0">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Độ khó</p>
          </div>
          <div className="w-40 shrink-0">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Điểm KT tiên quyết</p>
          </div>
          <div className="w-32 shrink-0">
            <p className="font-semibold leading-4 text-[#181d27] text-sm">Tài nguyên</p>
          </div>
          <div className="w-20 shrink-0"></div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#535862]">Đang tải...</p>
          </div>
        ) : knowledgePoints.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#535862]">Không có điểm kiến thức nào</p>
          </div>
        ) : (
          knowledgePoints.map((kp, index) => renderTableRow(kp, index))
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
}

