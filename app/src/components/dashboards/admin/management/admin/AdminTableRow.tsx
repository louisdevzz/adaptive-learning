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
import { parsePermissions } from "@/utils/permissions";
import { adminLevelLabels, adminLevelColors } from "@/constants/admin";
import { Admin } from "@/types/admin";

interface AdminTableRowProps {
  admin: Admin;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (id: string) => void;
}

export function AdminTableRow({
  admin,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: AdminTableRowProps) {
  const adminLevel = admin.adminInfo?.adminLevel || "system";

  return (
    <div
      className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-16 items-center px-4 py-3 relative shrink-0 w-full ${
        index % 2 === 0 ? "bg-white" : "bg-neutral-50"
      }`}
    >
      <Checkbox
        isSelected={isSelected}
        onValueChange={() => onSelect(admin.id)}
        size="sm"
      />
      <div className="flex gap-3 items-center flex-1">
        <Avatar
          src={admin.avatarUrl || "/asset/4f9e135d-72bf-49d5-8313-cacb6abeb703.svg"}
          size="md"
          className="rounded-full shrink-0"
        />
        <div className="flex flex-col items-start">
          <p className="font-medium leading-4 text-[#181d27] text-sm">
            {admin.fullName}
          </p>
          <p className="font-normal leading-4 text-[#535862] text-xs">
            {admin.email}
          </p>
        </div>
      </div>
      <div className="w-40">
        <div
          className={`inline-flex items-center justify-center px-2 py-1 rounded-lg ${
            adminLevelColors[adminLevel]
          }`}
        >
          <p className="font-medium text-xs">
            {adminLevelLabels[adminLevel]}
          </p>
        </div>
      </div>
      <div className="w-48">
        {admin.adminInfo?.permissions && admin.adminInfo.permissions.length > 0 ? (
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
                className="border-[#d5d7da] text-[#414651] font-medium text-xs justify-between"
                endContent={<ChevronDown className="size-3" />}
              >
                {admin.adminInfo.permissions.length} quyền
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Permissions list"
              classNames={{
                base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[250px] max-h-[300px] overflow-y-auto",
              }}
            >
              {admin.adminInfo.permissions.map((permission, idx) => {
                const label = parsePermissions([permission])[0];
                return (
                  <DropdownItem
                    key={idx}
                    textValue={label}
                    className="py-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-[#181d27]">{label}</span>
                    </div>
                  </DropdownItem>
                );
              })}
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
            aria-label="Admin actions"
            classNames={{
              base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[150px]",
            }}
          >
            <DropdownItem
              key="edit"
              textValue="Edit"
              startContent={<Edit className="size-4 text-[#535862]" />}
              onPress={() => onEdit(admin)}
            >
              <span className="text-[#181d27]">Chỉnh sửa</span>
            </DropdownItem>
            <DropdownItem
              key="delete"
              textValue="Delete"
              startContent={<Trash2 className="size-4 text-[#b42318]" />}
              onPress={() => onDelete(admin.id)}
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

