"use client";

import { Button } from "@heroui/button";
import { Upload, Plus, BookOpen, Users, GraduationCap, UserCheck } from "lucide-react";
import { useUser } from "@/hooks/useUser";

const roleDescriptions: Record<string, { title: string; description: string; icon: any }> = {
  admin: {
    title: "Bảng điều khiển Quản trị viên",
    description: "Quản lý toàn bộ hệ thống, người dùng và khóa học.",
    icon: UserCheck,
  },
  teacher: {
    title: "Bảng điều khiển Giáo viên",
    description: "Tạo nội dung, quản lý lớp học và theo dõi tiến độ học sinh.",
    icon: GraduationCap,
  },
  student: {
    title: "Bảng điều khiển Học sinh",
    description: "Theo dõi lộ trình học tập, mức độ nắm vững và tiến độ của bạn.",
    icon: BookOpen,
  },
  parent: {
    title: "Bảng điều khiển Phụ huynh",
    description: "Theo dõi tiến độ học tập và thành tích của con bạn.",
    icon: Users,
  },
};

export function DashboardHeader() {
  const { user, loading } = useUser();
  const role = user?.role?.toLowerCase() || "";
  const roleInfo = roleDescriptions[role] || {
    title: "Bảng điều khiển",
    description: "Chào mừng bạn đến với nền tảng học tập thông minh.",
    icon: BookOpen,
  };
  const IconComponent = roleInfo.icon;

  return (
    <div className="flex flex-col items-start relative shrink-0 w-full">
      <div className="flex flex-col items-start px-6 py-0 relative shrink-0 w-full">
        <div className="flex flex-col items-start relative shrink-0 w-full">
          <div className="flex gap-4 items-center justify-between relative shrink-0 w-full">
            <div className="flex flex-1 flex-col gap-0.5 items-start relative shrink-0">
              <div className="flex gap-2 items-center relative shrink-0 w-full mb-1">
                <IconComponent className="size-5 text-[#7f56d9]" />
                <h1 className="font-semibold leading-7 text-[#181d27] text-xl">
                  {loading ? "Đang tải..." : roleInfo.title}
                </h1>
              </div>
              <p className="font-normal leading-5 text-[#535862] text-sm w-full">
                {loading
                  ? "Đang tải thông tin..."
                  : user
                  ? `Chào mừng trở lại, ${user.fullName}! ${roleInfo.description}`
                  : roleInfo.description}
              </p>
            </div>
            {(role === "admin" || role === "teacher") && (
              <div className="flex gap-2 items-center relative shrink-0">
                <Button
                  variant="bordered"
                  size="sm"
                  className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
                  startContent={<Upload className="size-4 text-[#414651]" />}
                >
                  Nhập dữ liệu
                </Button>
                <Button
                  size="sm"
                  className="bg-[#7f56d9] text-white font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
                  startContent={<Plus className="size-4 text-white" />}
                >
                  {role === "admin" ? "Thêm mới" : "Tạo nội dung"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

