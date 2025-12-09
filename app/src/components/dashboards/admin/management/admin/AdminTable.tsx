"use client";

import { Checkbox } from "@heroui/checkbox";
import { AdminTableRow } from "./AdminTableRow";
import { Admin } from "@/types/admin";

interface AdminTableProps {
  admins: Admin[];
  loading: boolean;
  selectedAdmins: string[];
  searchQuery: string;
  onSelectAll: (checked: boolean) => void;
  onSelectAdmin: (id: string) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (id: string) => void;
}

export function AdminTable({
  admins,
  loading,
  selectedAdmins,
  searchQuery,
  onSelectAll,
  onSelectAdmin,
  onEdit,
  onDelete,
}: AdminTableProps) {
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
                admins.length > 0 &&
                admins.every((admin) => selectedAdmins.includes(admin.id))
              }
              isIndeterminate={
                selectedAdmins.length > 0 &&
                selectedAdmins.length < admins.length
              }
              onValueChange={onSelectAll}
              size="sm"
            />
            <div className="flex-1 font-medium leading-4 text-[#535862] text-xs">
              Tên / Email
            </div>
            <div className="w-40 font-medium leading-4 text-[#535862] text-xs">
              Cấp độ
            </div>
            <div className="w-48 font-medium leading-4 text-[#535862] text-xs">
              Quyền hạn
            </div>
            <div className="w-20 font-medium leading-4 text-[#535862] text-xs text-center">
              Thao tác
            </div>
          </div>

          {/* Table Rows */}
          {admins.length === 0 ? (
            <div className="flex items-center justify-center p-8 w-full">
              <p className="text-[#535862] text-sm">
                {searchQuery ? "Không tìm thấy quản trị viên nào" : "Chưa có quản trị viên nào"}
              </p>
            </div>
          ) : (
            admins.map((admin, index) => (
              <AdminTableRow
                key={admin.id}
                admin={admin}
                index={index}
                isSelected={selectedAdmins.includes(admin.id)}
                onSelect={onSelectAdmin}
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

