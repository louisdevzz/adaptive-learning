"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Book,
  Sparkles,
  PlayCircle,
  FileText,
  LifeBuoy,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { InteractiveHoverButtonCustom } from "./InteractiveHoverButtonCustom";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";

// Resources menu items
const resourcesItems = [
  {
    key: "blog",
    title: "Blog",
    description: "Tin tức, cập nhật và thông tin mới nhất về giáo dục.",
    icon: Book,
  },
  {
    key: "customer-stories",
    title: "Câu chuyện khách hàng",
    description: "Tìm hiểu cách người dùng đang tạo ra những thay đổi lớn.",
    icon: Sparkles,
  },
  {
    key: "video-tutorials",
    title: "Video hướng dẫn",
    description: "Học cách sử dụng các tính năng và kỹ thuật mới.",
    icon: PlayCircle,
  },
  {
    key: "documentation",
    title: "Tài liệu",
    description: "Tất cả thông tin chi tiết mà bạn có thể cần.",
    icon: FileText,
  },
  {
    key: "help-support",
    title: "Trợ giúp và hỗ trợ",
    description: "Học hỏi, giải quyết vấn đề và nhận câu trả lời cho câu hỏi của bạn.",
    icon: LifeBuoy,
  },
];

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  const Icon = isOpen ? ChevronUp : ChevronDown;
  return (
    <Icon className="w-5 h-5" />
  );
}

export function Header() {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="border-b border-neutral-100 h-20 w-full z-2 bg-white">
      <div className="absolute flex flex-col h-20 items-center justify-center left-0 right-0 top-0">
        <div className="flex items-center justify-between px-8 py-0 w-full max-w-[1280px]">
          <div className="flex gap-8 items-center">
            {/* Logo */}
            <Link href={"/"} className="relative">
              <span className="text-xl font-semibold text-[#181d27]">Adaptive Learning</span>
            </Link>

            {/* Navigation */}
            <nav className="flex gap-5 items-center">
              <Button variant="light" className="text-[#535862] font-semibold">
                <Link href={"/"}>Trang chủ</Link>
              </Button>
              <Button variant="light" className="text-[#535862] font-semibold">
                <Link href={"/about"}>Giới thiệu</Link>
              </Button>
              <Button variant="light" className="text-[#535862] font-semibold">
                <Link href={"/contact"}>Liên hệ</Link>
              </Button>

              {/* Resources Dropdown */}
              <Dropdown
                isOpen={isResourcesOpen}
                onOpenChange={setIsResourcesOpen}
                placement="bottom-start"
              >
                <DropdownTrigger>
                  <Button
                    variant="light"
                    className="text-[#535862] font-semibold"
                    endContent={<ChevronIcon isOpen={isResourcesOpen} />}
                  >
                    Tài nguyên
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Resources menu"
                  classNames={{
                    base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] p-5 gap-2 min-w-[336px]",
                  }}
                  itemClasses={{
                    base: "p-0 rounded-lg data-[hover=true]:bg-transparent",
                  }}
                >
                  {resourcesItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownItem
                        key={item.key}
                        textValue={item.title}
                        className="p-3 rounded-lg"
                      >
                        <div className="flex gap-4 items-start w-full">
                          <div className="shrink-0 size-6 flex items-center justify-center text-[#535862]">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex flex-1 flex-col gap-1 items-start">
                            <p className="font-semibold leading-6 text-[#181d27] text-base">
                              {item.title}
                            </p>
                            <p className="font-normal leading-5 text-[#535862] text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </Dropdown>

              
            </nav>
          </div>

          {/* Actions */}
          <div className="flex gap-3 items-center">
            {loading || !user ? (
              <InteractiveHoverButtonCustom className="text-sm bg-[#6941c6] text-white [&>div:first-child>div:first-child]:bg-white [&>div:last-child]:text-[#6941c6] [&>div:last-child]:border-none">
                <Link href="/login">Đăng nhập</Link>
              </InteractiveHoverButtonCustom>
            ) : (
              <Dropdown
                isOpen={isUserMenuOpen}
                onOpenChange={setIsUserMenuOpen}
                placement="bottom-end"
              >
                <DropdownTrigger className="cursor-pointer">
                  <button className="flex gap-2 items-center hover:opacity-80 transition-opacity">
                    <Avatar
                      src={user.avatarUrl || "/asset/4f9e135d-72bf-49d5-8313-cacb6abeb703.svg"}
                      size="md"
                      className="rounded-full"
                    />
                    <div className="flex flex-col items-start text-left">
                      <p className="font-semibold leading-4 text-[#181d27] text-sm">
                        {user.fullName}
                      </p>
                      <p className="font-normal leading-4 text-[#535862] text-xs">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown className="size-4 text-[#535862]" />
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="User menu"
                  classNames={{
                    base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[200px]",
                  }}
                >
                  <DropdownItem
                    key="settings"
                    textValue="Settings"
                    startContent={<LayoutDashboard className="size-4 text-[#535862]" />}
                    onPress={() => router.push("/dashboard")}
                  >
                    <span className="text-[#181d27]">Bảng điều khiển</span>
                  </DropdownItem>
                  <DropdownItem
                    key="profile"
                    textValue="Profile"
                    startContent={<User className="size-4 text-[#535862]" />}
                    onPress={() => router.push("/profile")}
                  >
                    <span className="text-[#181d27]">Thông tin cá nhân</span>
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    textValue="Logout"
                    startContent={<LogOut className="size-4 text-[#b42318]" />}
                    onPress={handleLogout}
                    className="text-[#b42318]"
                  >
                    <span className="text-[#b42318]">Đăng xuất</span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

