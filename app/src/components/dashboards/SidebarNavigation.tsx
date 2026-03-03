"use client";

import { Button } from "@heroui/button";
import { Avatar } from "@heroui/react";
import { usePathname } from "next/navigation";
import {
  Search,
  BarChart3,
  BookOpen,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  School,
  FolderOpen,
  Book,
  Target,
  Compass,
  TrendingUp,
  Award,
  ChevronDown,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

// Type definitions for menu items
type MenuSubItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  hasSubmenu?: boolean;
  submenu?: MenuSubItem[];
};

// Submenu items for course management
const courseManagementSubmenu: MenuSubItem[] = [
  { icon: Book, label: "Quản lý môn học", href: "/dashboard/courses" },
  {
    icon: Compass,
    label: "Khám phá khóa học",
    href: "/dashboard/courses/explorer",
  },
];

// Menu items for each role
const menuItems: Record<string, MenuItem[]> = {
  admin: [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Người dùng", href: "/dashboard/users" },
    {
      icon: BookOpen,
      label: "Khóa học",
      href: "/dashboard/courses",
      hasSubmenu: true,
      submenu: courseManagementSubmenu,
    },
    { icon: Users, label: "Học sinh", href: "/dashboard/students" },
    { icon: School, label: "Lớp học", href: "/dashboard/classes" },
    { icon: TrendingUp, label: "Báo cáo", href: "/dashboard/reports" },
  ],
  teacher: [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    {
      icon: BookOpen,
      label: "Khóa học",
      href: "/dashboard/courses",
      hasSubmenu: true,
      submenu: courseManagementSubmenu,
    },
    { icon: Users, label: "Quản lý học sinh", href: "/dashboard/students" },
    { icon: School, label: "Quản lý Lớp học", href: "/dashboard/classes" },
    { icon: TrendingUp, label: "Báo cáo", href: "/dashboard/reports" },
  ],
  student: [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    {
      icon: BookOpen,
      label: "Khóa học của tôi",
      href: "/dashboard/my-courses",
    },
    {
      icon: TrendingUp,
      label: "Lộ trình học tập",
      href: "/dashboard/learning-path",
    },
    { icon: Award, label: "Tiến độ", href: "/dashboard/progress" },
  ],
  parent: [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Tiến độ con", href: "/dashboard/children-progress" },
  ],
};

export function SidebarNavigation() {
  const { user, logout } = useUser();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const role = user?.role?.toLowerCase() || "";
  const currentMenuItems =
    menuItems[role as keyof typeof menuItems] || menuItems.student;

  // Check if menu item is active
  const isActive = (item: MenuItem) => {
    if (item.hasSubmenu && item.submenu) {
      const matchesSubmenu = item.submenu.some(
        (sub) => pathname === sub.href || pathname?.startsWith(sub.href + "/")
      );
      return matchesSubmenu || pathname === item.href;
    }
    if (pathname === item.href) {
      return true;
    }
    if (pathname?.startsWith(item.href + "/")) {
      // Only active if no other menu item with a longer matching href exists
      const hasMoreSpecificMatch = currentMenuItems.some((otherItem) => {
        if (otherItem.href === item.href) return false;
        return (
          (pathname === otherItem.href ||
            pathname?.startsWith(otherItem.href + "/")) &&
          otherItem.href.startsWith(item.href + "/")
        );
      });
      return !hasMoreSpecificMatch;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#1a202c] border-b border-[#d9dfea] dark:border-gray-700 w-full">
      {/* Desktop Navigation */}
      <div className="px-6 md:px-10 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar flex-1 min-w-0">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 text-[#135bec] shrink-0"
          >
            <img
              src="/logo-text.png"
              alt="Adapt"
              className="w-32 object-cover"
            />
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {currentMenuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item);

              // If item has submenu, render as dropdown
              if (item.hasSubmenu && item.submenu) {
                return (
                  <Dropdown key={item.label} placement="bottom-start">
                    <DropdownTrigger>
                      <button
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors cursor-pointer ${
                          active
                            ? "text-[#135bec] font-semibold"
                            : "text-[#4c669a] dark:text-gray-400 hover:text-[#135bec]"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.label}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label={item.label}
                      classNames={{
                        base: "bg-white dark:bg-[#1a202c] border border-[#e7ebf3] dark:border-gray-700 rounded-xl shadow-lg min-w-[200px]",
                      }}
                    >
                      {item.submenu.map((subItem: MenuSubItem) => {
                        const SubIconComponent = subItem.icon;
                        const isSubActive = pathname === subItem.href;
                        return (
                          <DropdownItem
                            key={subItem.label}
                            startContent={
                              <SubIconComponent className="w-4 h-4 text-[#4c669a]" />
                            }
                            as={Link}
                            href={subItem.href}
                            className={
                              isSubActive
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                            }
                          >
                            <span
                              className={
                                isSubActive
                                  ? "text-[#135bec] font-medium"
                                  : "text-[#0d121b] dark:text-gray-200"
                              }
                            >
                              {subItem.label}
                            </span>
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </Dropdown>
                );
              }

              // Regular menu item
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${
                    active
                      ? "text-[#135bec] font-semibold"
                      : "text-[#4c669a] dark:text-gray-400 hover:text-[#135bec]"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center bg-[#f0f2f5] dark:bg-gray-800 rounded-lg px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-[#135bec]/20 transition-all">
            <Search className="w-4 h-4 text-[#4c669a] dark:text-gray-400" />
            <input
              className="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d121b] dark:text-white placeholder:text-[#4c669a] ml-2 outline-none"
              placeholder="Tìm kiếm..."
              type="text"
            />
          </div>

          <Button
            variant="light"
            isIconOnly
            className="relative p-2 text-[#0d121b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#1a202c]"></span>
          </Button>

          {/* Profile Dropdown */}
          {user && (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button className="flex items-center gap-2 pl-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <Avatar
                    src={
                      user.avatarUrl ||
                      "/asset/4f9e135d-72bf-49d5-8313-cacb6abeb703.svg"
                    }
                    size="sm"
                    className="w-8 h-8 border border-gray-200 dark:border-gray-700"
                  />
                  <span className="hidden md:block text-sm font-semibold text-[#0d121b] dark:text-white">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#4c669a] dark:text-gray-400" />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User menu"
                classNames={{
                  base: "bg-white dark:bg-[#1a202c] border border-[#e7ebf3] dark:border-gray-700 rounded-xl shadow-lg min-w-[200px]",
                }}
              >
                <DropdownItem
                  key="settings"
                  startContent={<Settings className="w-4 h-4 text-[#4c669a]" />}
                  as={Link}
                  href="/dashboard/settings"
                  className="cursor-pointer text-[#0d121b] dark:text-gray-200"
                >
                  Cài đặt
                </DropdownItem>
                <DropdownItem
                  key="help"
                  startContent={
                    <HelpCircle className="w-4 h-4 text-[#4c669a]" />
                  }
                  className="cursor-pointer text-[#0d121b] dark:text-gray-200"
                >
                  Hỗ trợ
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  startContent={<LogOut className="w-4 h-4 text-[#b42318]" />}
                  onPress={handleLogout}
                  className="cursor-pointer text-[#b42318]"
                >
                  Đăng xuất
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden flex overflow-x-auto gap-4 px-6 py-2 border-t border-[#e7ebf3] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 no-scrollbar">
        {currentMenuItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item);

          if (item.hasSubmenu && item.submenu) {
            return (
              <Dropdown key={item.label} placement="bottom-start">
                <DropdownTrigger>
                  <button
                    className={`whitespace-nowrap flex items-center gap-1.5 font-medium text-sm ${
                      active
                        ? "text-[#135bec] font-semibold"
                        : "text-[#4c669a] dark:text-gray-400"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label={item.label}
                  classNames={{
                    base: "bg-white dark:bg-[#1a202c] border border-[#e7ebf3] dark:border-gray-700 rounded-xl shadow-lg min-w-[200px]",
                  }}
                >
                  {item.submenu.map((subItem: MenuSubItem) => {
                    const SubIconComponent = subItem.icon;
                    const isSubActive = pathname === subItem.href;
                    return (
                      <DropdownItem
                        key={subItem.label}
                        startContent={
                          <SubIconComponent className="w-4 h-4 text-[#4c669a]" />
                        }
                        as={Link}
                        href={subItem.href}
                        className={
                          isSubActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }
                      >
                        <span
                          className={
                            isSubActive
                              ? "text-[#135bec] font-medium"
                              : "text-[#0d121b] dark:text-gray-200"
                          }
                        >
                          {subItem.label}
                        </span>
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </Dropdown>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`whitespace-nowrap flex items-center gap-1.5 font-medium text-sm ${
                active
                  ? "text-[#135bec] font-semibold"
                  : "text-[#4c669a] dark:text-gray-400"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
