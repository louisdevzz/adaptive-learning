"use client";

import { Checkbox } from "@heroui/checkbox";
import { Avatar } from "@heroui/react";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { MoreVertical, Edit, Trash2, ChevronDown } from "lucide-react";
import { Teacher } from "@/types/teacher";

interface TeacherTableRowProps {
  teacher: Teacher;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
}

export function TeacherTableRow({
  teacher,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: TeacherTableRowProps) {
  const specialization = teacher.teacherInfo?.specialization || [];
  const experienceYears = teacher.teacherInfo?.experienceYears || 0;

  return (
    <div
      className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-16 items-center px-4 py-3 relative shrink-0 w-full ${
        index % 2 === 0 ? "bg-white" : "bg-neutral-50"
      }`}
    >
      <Checkbox
        isSelected={isSelected}
        onValueChange={() => onSelect(teacher.id)}
        size="sm"
      />
      <div className="flex gap-3 items-center flex-1">
        <Avatar
          src={teacher.avatarUrl || "/asset/4f9e135d-72bf-49d5-8313-cacb6abeb703.svg"}
          size="md"
          className="rounded-full shrink-0"
        />
        <div className="flex flex-col items-start">
          <p className="font-medium leading-4 text-[#181d27] text-sm">
            {teacher.fullName}
          </p>
          <p className="font-normal leading-4 text-[#535862] text-xs">
            {teacher.email}
          </p>
        </div>
      </div>
      <div className="w-40">
        <div className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-[#f0f0f0]">
          <p className="font-medium text-xs text-[#414651]">
            {experienceYears} năm
          </p>
        </div>
      </div>
      <div className="w-48">
        {specialization.length > 0 ? (
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
                className="border-[#d5d7da] text-[#414651] font-medium text-xs justify-between"
                endContent={<ChevronDown className="size-3" />}
              >
                {specialization.length} môn
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Specialization list"
              classNames={{
                base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[250px] max-h-[300px] overflow-y-auto",
              }}
            >
              {specialization.map((subject, idx) => (
                <DropdownItem
                  key={idx}
                  textValue={subject}
                  className="py-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[#181d27]">{subject}</span>
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        ) : (
          <p className="font-normal text-xs text-[#535862]">Không có</p>
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
            aria-label="Teacher actions"
            classNames={{
              base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[150px]",
            }}
          >
            <DropdownItem
              key="edit"
              textValue="Edit"
              startContent={<Edit className="size-4 text-[#535862]" />}
              onPress={() => onEdit(teacher)}
            >
              <span className="text-[#181d27]">Chỉnh sửa</span>
            </DropdownItem>
            <DropdownItem
              key="delete"
              textValue="Delete"
              startContent={<Trash2 className="size-4 text-[#b42318]" />}
              onPress={() => onDelete(teacher.id)}
              className="text-[#b42318]"
            >
              <span className="text-[#b42318]">Xóa</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}

