"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/react";
import { ChevronDown, User, LayoutDashboard, LogOut } from "lucide-react";

export function Header() {
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
    <header className="fixed top-0 z-50 w-full transition-all duration-300 border-b border-transparent bg-white/80 backdrop-blur-xl dark:bg-background-dark/80 dark:border-slate-800/50">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href={"/"} className="flex items-center gap-3">
          <img src="/logo-text.png" alt="Adapt" className="w-36 object-cover" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <a 
            className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors" 
            href="#features"
          >
            Tính năng
          </a>
          <a 
            className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors" 
            href="#solutions"
          >
            Giải pháp
          </a>
          <a 
            className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors" 
            href="#feedback"
          >
            Phản hồi
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {loading || !user ? (
            <>
              <Link 
                className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-300" 
                href="/login"
              >
                Đăng nhập
              </Link>
              <Link 
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-primary/40 transition-all hover:-translate-y-0.5" 
                href="/login"
              >
                Bắt đầu ngay
              </Link>
            </>
          ) : (
            <Dropdown placement="bottom-end">
              <DropdownTrigger className="cursor-pointer">
                <button className="flex gap-2 items-center hover:opacity-80 transition-opacity">
                  <Avatar
                    src={user.avatarUrl || "/asset/4f9e135d-72bf-49d5-8313-cacb6abeb703.svg"}
                    size="md"
                    className="rounded-full"
                  />
                  <div className="hidden sm:flex flex-col items-start text-left">
                    <p className="font-semibold leading-4 text-slate-900 dark:text-white text-sm">
                      {user.fullName}
                    </p>
                    <p className="font-normal leading-4 text-slate-500 dark:text-slate-400 text-xs">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="size-4 text-slate-500 hidden sm:block" />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User menu"
                classNames={{
                  base: "bg-white border border-slate-200 rounded-xl shadow-lg min-w-[200px] dark:bg-slate-800 dark:border-slate-700",
                }}
              >
                <DropdownItem
                  key="dashboard"
                  textValue="Dashboard"
                  startContent={<LayoutDashboard className="size-4" />}
                  onPress={() => router.push("/dashboard")}
                >
                  Bảng điều khiển
                </DropdownItem>
                <DropdownItem
                  key="profile"
                  textValue="Profile"
                  startContent={<User className="size-4" />}
                  onPress={() => router.push("/profile")}
                >
                  Thông tin cá nhân
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  textValue="Logout"
                  startContent={<LogOut className="size-4 text-red-500" />}
                  onPress={handleLogout}
                  className="text-red-500"
                >
                  Đăng xuất
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
}
