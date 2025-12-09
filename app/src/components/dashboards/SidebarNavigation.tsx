"use client";

import { Button } from "@heroui/button";
import { Avatar } from "@heroui/react";
import { Input } from "@heroui/input";
import { usePathname } from "next/navigation";
import {
  Search,
  BarChart3,
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Award,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  Bell,
  GraduationCap,
  UserCheck,
  UserCog,
  School,
  FolderOpen,
  Book,
  Target,
  Compass,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

function Logo() {
  return (
    <Link href={"/"} className="h-8 relative shrink-0">
      <div className="relative">
        <p className="text-xl font-semibold text-[#181d27]">Adaptive Learning</p>
      </div>
    </Link>
  );
}

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

// Submenu items for user management
const userManagementSubmenu: MenuSubItem[] = [
  { icon: GraduationCap, label: "Quản lý học sinh", href: "/dashboard/users/students" },
  { icon: UserCheck, label: "Quản lý giáo viên", href: "/dashboard/users/teachers" },
  { icon: Users, label: "Quản lý phụ huynh", href: "/dashboard/users/parents" },
  { icon: UserCog, label: "Quản lý quản trị viên", href: "/dashboard/users/admins" },
];

// Submenu items for course management
const courseManagementSubmenu: MenuSubItem[] = [
  { icon: Book, label: "Quản lý môn học", href: "/dashboard/courses" },
  { icon: FolderOpen, label: "Quản lý chủ đề", href: "/dashboard/courses/modules" },
  { icon: FileText, label: "Quản lý bài học", href: "/dashboard/courses/sections" },
  { icon: Target, label: "Quản lý điểm kiến thức", href: "/dashboard/courses/knowledge-points" },
  { icon: Compass, label: "Khám phá khóa học", href: "/dashboard/courses/explorer" },
];

// Menu items for each role
const menuItems: Record<string, MenuItem[]> = {
  admin: [
    { icon: BarChart3, label: "Bảng điều khiển", href: "/dashboard" },
    { icon: Users, label: "Quản lý người dùng", href: "/dashboard/users", hasSubmenu: true, submenu: userManagementSubmenu },
    { icon: BookOpen, label: "Quản lý khóa học", href: "/dashboard/courses", hasSubmenu: true, submenu: courseManagementSubmenu },
    { icon: School, label: "Quản lý lớp học", href: "/dashboard/classes" },
    { icon: TrendingUp, label: "Báo cáo hệ thống", href: "/dashboard/reports" },
  ],
  teacher: [
    { icon: BarChart3, label: "Bảng điều khiển", href: "/dashboard" },
    { icon: BookOpen, label: "Quản lý khóa học", href: "/dashboard/courses", hasSubmenu: true, submenu: courseManagementSubmenu },
    { icon: Users, label: "Quản lý học sinh", href: "/dashboard/students" },
    { icon: School, label: "Quản lý lớp học", href: "/dashboard/classes" },
    { icon: TrendingUp, label: "Báo cáo", href: "/dashboard/reports" },
  ],
  student: [
    { icon: BarChart3, label: "Bảng điều khiển", href: "/dashboard" },
    { icon: BookOpen, label: "Khóa học của tôi", href: "/dashboard/my-courses" },
    { icon: TrendingUp, label: "Lộ trình học tập", href: "/dashboard/learning-path" },
    { icon: Award, label: "Tiến độ", href: "/dashboard/progress" },
  ],
  parent: [
    { icon: BarChart3, label: "Bảng điều khiển", href: "/dashboard" },
    { icon: Users, label: "Tiến độ con", href: "/dashboard/children-progress" },
    { icon: TrendingUp, label: "Báo cáo", href: "/dashboard/reports" },
  ],
};

export function SidebarNavigation() {
  const { user, logout } = useUser();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const role = user?.role?.toLowerCase() || "";
  const currentMenuItems = menuItems[role as keyof typeof menuItems] || menuItems.student;

  return (
    <div className="bg-white border-b border-[#eef0f3] flex flex-col fixed left-0 right-0 top-0 z-10">
      {/* Top Header Section - Logo, Search, User Actions */}
      <div className="bg-white border-b border-[#eef0f3] border-solid flex items-center justify-between px-12 py-5 relative shrink-0 w-full">
        <div className="flex gap-8 items-center relative shrink-0 flex-1 min-w-0">
          <Logo />
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm..."
              size="sm"
              startContent={
                <Search className="size-5 text-[#bcbcbd]" />
              }
              className="w-full"
              classNames={{
                input: "text-xs text-[#bcbcbd] font-normal",
                inputWrapper: "bg-[#fdfdfd] border border-[#eef0f3] rounded-[10px] h-10 px-[14px]",
              }}
            />
          </div>
        </div>
        
        <div className="flex gap-6 items-start relative shrink-0">
          {/* Notification Button */}
          <div
            className="h-10 min-w-0 flex items-center justify-center cursor-pointer"
          >
            <Bell className="w-5 h-5 text-[#242424]" />
          </div>
          
          {/* User Menu */}
          {user && (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="flat"
                  size="sm"
                  className="bg-[#f0f0f0] rounded-[6px] h-10 px-3 gap-2 min-w-0"
                  endContent={<ChevronDown className="size-4 text-[#242424]" />}
                >
                  <Avatar
                    src={user.avatarUrl || "/asset/4f9e135d-72bf-49d5-8313-cacb6abeb703.svg"}
                    size="sm"
                    className="relative rounded-full shrink-0"
                  />
                  <div className="flex flex-col items-start relative shrink-0">
                    <p className="font-semibold leading-4 text-[#242424] text-xs">
                      {user.fullName}
                    </p>
                    <p className="font-normal leading-3 text-[#535862] text-[10px]">
                      {user.email}
                    </p>
                  </div>
                </Button>
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
                  startContent={<Settings className="size-4 text-[#535862]" />}
                >
                  <span className="text-[#181d27]">Cài đặt</span>
                </DropdownItem>
                <DropdownItem
                  key="help"
                  textValue="Help"
                  startContent={<HelpCircle className="size-4 text-[#535862]" />}
                >
                  <span className="text-[#181d27]">Hỗ trợ</span>
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

      {/* Bottom Navigation Section - Menu Items and Actions */}
      <div className="bg-white flex items-end justify-between px-12 py-3 relative shrink-0 w-full">
        {/* Menu Items */}
        <nav className="flex gap-12 items-end relative shrink-0">
          {currentMenuItems.map((item) => {
            const IconComponent = item.icon;
            
            // Check if pathname matches any submenu item first
            const matchesSubmenu = item.hasSubmenu && item.submenu?.some((sub: MenuSubItem) => 
              pathname === sub.href || pathname?.startsWith(sub.href + '/')
            );
            
            let isActive = false;
            if (item.hasSubmenu) {
              // For items with submenu, check if pathname matches any submenu item
              isActive = matchesSubmenu || pathname === item.href;
            } else {
              // For items without submenu, check exact match first
              if (pathname === item.href) {
                isActive = true;
              } else if (pathname?.startsWith(item.href + '/')) {
                // Only active if no other menu item with a longer matching href exists
                const hasMoreSpecificMatch = currentMenuItems.some((otherItem) => {
                  if (otherItem.href === item.href) return false; // Skip self
                  // Check if other item's href is more specific and matches current pathname
                  return pathname?.startsWith(otherItem.href + '/') && 
                         otherItem.href.startsWith(item.href + '/');
                });
                isActive = !hasMoreSpecificMatch;
              }
            }
            
            // If item has submenu, render as dropdown
            if (item.hasSubmenu && item.submenu) {
              return (
                <Dropdown key={item.label} placement="bottom-start">
                  <DropdownTrigger>
                    <div
                      className={`flex items-center gap-2 cursor-pointer transition-colors pb-2 ${
                        isActive 
                          ? "text-[#242424] font-medium border-b-2 border-[#242424]" 
                          : "text-[#242424] font-medium hover:opacity-70"
                      }`}
                    >
                      <IconComponent className="size-4" />
                      <p className="text-sm leading-4">{item.label}</p>
                      <ChevronDown className="size-3" />
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={item.label}
                    classNames={{
                      base: "bg-white border border-[#e9eaeb] rounded-xl shadow-[0px_12px_16px_-4px_rgba(10,13,18,0.08),0px_4px_6px_-2px_rgba(10,13,18,0.03)] min-w-[200px]",
                    }}
                  >
                    {item.submenu.map((subItem: MenuSubItem) => {
                      const SubIconComponent = subItem.icon;
                      const isSubActive = pathname === subItem.href;
                      return (
                        <DropdownItem
                          key={subItem.label}
                          startContent={<SubIconComponent className="size-4 text-[#535862]" />}
                          as={Link}
                          href={subItem.href}
                          className={isSubActive ? "bg-neutral-50" : ""}
                        >
                          <span className={isSubActive ? "text-[#242424] font-medium" : "text-[#181d27]"}>{subItem.label}</span>
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
                className="relative shrink-0"
              >
                <div
                  className={`flex items-center gap-2 transition-colors pb-2 ${
                    isActive 
                      ? "text-[#242424] font-medium border-b-2 border-[#242424]" 
                      : "text-[#242424] font-medium hover:opacity-70"
                  }`}
                >
                  <IconComponent className="size-4" />
                  <p className="text-sm leading-4">{item.label}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex gap-2 items-center relative shrink-0">
          <Button
            variant="flat"
            size="sm"
            className="bg-[#f0f0f0] rounded-[6px] h-8 px-2 min-w-0"
            isIconOnly
          >
            <HelpCircle className="size-4 text-[#242424]" />
          </Button>
          <Button
            variant="flat"
            size="sm"
            className="bg-[#f0f0f0] rounded-[6px] h-8 px-2 min-w-0"
            isIconOnly
          >
            <Settings className="size-4 text-[#242424]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

