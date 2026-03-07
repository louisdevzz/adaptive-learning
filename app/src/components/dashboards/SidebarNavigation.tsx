"use client";

import { Avatar } from "@heroui/react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  School,
  Book,
  Compass,
  TrendingUp,
  Award,
  ChevronDown,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

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

const courseManagementSubmenu: MenuSubItem[] = [
  { icon: Book, label: "Quản lý môn học", href: "/dashboard/courses" },
  { icon: Compass, label: "Khám phá khóa học", href: "/dashboard/courses/explorer" },
];

const menuItems: Record<string, MenuItem[]> = {
  admin: [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Người dùng", href: "/dashboard/users" },
    { icon: BookOpen, label: "Khóa học", href: "/dashboard/courses", hasSubmenu: true, submenu: courseManagementSubmenu },
    { icon: Users, label: "Học sinh", href: "/dashboard/students" },
    { icon: School, label: "Lớp học", href: "/dashboard/classes" },
    { icon: TrendingUp, label: "Báo cáo", href: "/dashboard/reports" },
  ],
  teacher: [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Khóa học", href: "/dashboard/courses", hasSubmenu: true, submenu: courseManagementSubmenu },
    { icon: Users, label: "Quản lý học sinh", href: "/dashboard/students" },
    { icon: School, label: "Quản lý Lớp học", href: "/dashboard/classes" },
    { icon: TrendingUp, label: "Báo cáo", href: "/dashboard/reports" },
  ],
  student: [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Khóa học của tôi", href: "/dashboard/my-courses" },
    { icon: TrendingUp, label: "Lộ trình học tập", href: "/dashboard/learning-path" },
    { icon: Award, label: "Tiến độ", href: "/dashboard/progress" },
  ],
  parent: [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Tiến độ con", href: "/dashboard/children-progress" },
  ],
};

interface SidebarNavigationProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarNavigation({ isCollapsed, onToggleCollapse }: SidebarNavigationProps) {
  const { user, logout } = useUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    const words = fullName.trim().split(" ");
    return words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : fullName.substring(0, 2).toUpperCase();
  };

  const role = user?.role?.toLowerCase() || "";
  const currentMenuItems = menuItems[role as keyof typeof menuItems] || menuItems.student;

  const isActive = (item: MenuItem) => {
    if (item.hasSubmenu && item.submenu) {
      return item.submenu.some((sub) => pathname === sub.href || pathname?.startsWith(sub.href + "/")) || pathname === item.href;
    }
    if (pathname === item.href) return true;
    if (pathname?.startsWith(item.href + "/")) {
      return !currentMenuItems.some((o) => o.href !== item.href && (pathname === o.href || pathname?.startsWith(o.href + "/")) && o.href.startsWith(item.href + "/"));
    }
    return false;
  };

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const roleLabel = user?.role === "admin" ? "Quản trị viên"
    : user?.role === "teacher" ? "Giáo viên"
    : user?.role === "student" ? "Học sinh"
    : "Phụ huynh";

  // ── Collapsed tooltip wrapper ─────────────────────────────────────────────
  const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="relative group/tip">
      {children}
      {isCollapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
          bg-[#0d121b] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap
          opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0d121b]" />
        </div>
      )}
    </div>
  );

  // ── Full sidebar content (shared between desktop + mobile drawer) ─────────
  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo */}
      <div className={`shrink-0 flex items-center border-b border-[#e7ebf3] ${collapsed ? "justify-center px-3 py-4" : "px-5 py-4"}`}>
        <Link href="/" className="flex items-center gap-2 min-w-0">
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg bg-[#0085FF] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          ) : (
            <img src="/logo-text.png" alt="Adapt" className="w-28 object-contain" />
          )}
        </Link>
      </div>

      {/* User profile */}
      {user && (
        <div className={`shrink-0 py-3 ${collapsed ? "px-2" : "px-3"} border-b border-[#e7ebf3]`}>
          {collapsed ? (
            <Tooltip label={`${user.fullName} · ${roleLabel}`}>
              <Dropdown placement="right-start">
                <DropdownTrigger>
                  <button className="w-full flex justify-center p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <Avatar
                      src={user.avatarUrl || undefined}
                      name={getInitials(user.fullName)}
                      size="sm"
                      className="w-8 h-8 border-2 border-white shadow-sm shrink-0"
                      color="secondary"
                    />
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu" classNames={{ base: "bg-white border border-[#e7ebf3] rounded-xl shadow-lg min-w-[200px]" }}>
                  <DropdownItem key="settings" startContent={<Settings className="w-4 h-4 text-[#4c669a]" />} as={Link} href="/dashboard/settings" className="cursor-pointer text-[#0d121b]">Cài đặt</DropdownItem>
                  <DropdownItem key="help" startContent={<HelpCircle className="w-4 h-4 text-[#4c669a]" />} className="cursor-pointer text-[#0d121b]">Hỗ trợ</DropdownItem>
                  <DropdownItem key="logout" startContent={<LogOut className="w-4 h-4 text-[#b42318]" />} onPress={logout} className="cursor-pointer text-[#b42318]">Đăng xuất</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Tooltip>
          ) : (
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Avatar
                    src={user.avatarUrl || undefined}
                    name={getInitials(user.fullName)}
                    size="sm"
                    className="w-8 h-8 shrink-0 border-2 border-white shadow-sm"
                    color="secondary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0d121b] truncate">{user.fullName}</p>
                    <p className="text-xs text-[#4c669a] truncate">{roleLabel}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#4c669a] shrink-0" />
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" classNames={{ base: "bg-white border border-[#e7ebf3] rounded-xl shadow-lg min-w-[200px]" }}>
                <DropdownItem key="settings" startContent={<Settings className="w-4 h-4 text-[#4c669a]" />} as={Link} href="/dashboard/settings" className="cursor-pointer text-[#0d121b]">Cài đặt</DropdownItem>
                <DropdownItem key="help" startContent={<HelpCircle className="w-4 h-4 text-[#4c669a]" />} className="cursor-pointer text-[#0d121b]">Hỗ trợ</DropdownItem>
                <DropdownItem key="logout" startContent={<LogOut className="w-4 h-4 text-[#b42318]" />} onPress={logout} className="cursor-pointer text-[#b42318]">Đăng xuất</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      )}

      {/* Nav links */}
      <nav className={`flex-1 overflow-y-auto py-3 space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
        {currentMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const isExpanded = expandedItems[item.label] ?? active;

          if (item.hasSubmenu && item.submenu) {
            if (collapsed) {
              // Collapsed: show icon only, clicking navigates to first submenu item
              return (
                <Tooltip key={item.label} label={item.label}>
                  <Link
                    href={item.submenu[0].href}
                    className={`flex justify-center items-center p-2.5 rounded-xl transition-all ${active ? "bg-[#E8F4FF] text-[#0085FF]" : "text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b]"}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                  </Link>
                </Tooltip>
              );
            }
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${active ? "bg-[#E8F4FF] text-[#0085FF]" : "text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b]"}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                {isExpanded && (
                  <div className="mt-0.5 ml-4 pl-3 border-l-2 border-[#e7ebf3] space-y-0.5">
                    {item.submenu.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = pathname === sub.href || pathname?.startsWith(sub.href + "/");
                      return (
                        <Link key={sub.label} href={sub.href} onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${subActive ? "bg-[#E8F4FF] text-[#0085FF] font-medium" : "text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b]"}`}>
                          <SubIcon className="w-4 h-4 shrink-0" />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (collapsed) {
            return (
              <Tooltip key={item.label} label={item.label}>
                <Link href={item.href} onClick={() => setMobileOpen(false)}
                  className={`flex justify-center items-center p-2.5 rounded-xl transition-all ${active ? "bg-[#E8F4FF] text-[#0085FF]" : "text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b]"}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </Link>
              </Tooltip>
            );
          }

          return (
            <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-[#E8F4FF] text-[#0085FF]" : "text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b]"}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings, Support, Collapse toggle */}
      <div className={`shrink-0 border-t border-[#e7ebf3] pt-2 pb-3 space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
        {collapsed ? (
          <>
            <Tooltip label="Cài đặt">
              <Link href="/dashboard/settings"
                className={`flex justify-center items-center p-2.5 rounded-xl transition-all ${pathname === "/dashboard/settings" ? "bg-[#E8F4FF] text-[#0085FF]" : "text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b]"}`}>
                <Settings className="w-5 h-5 shrink-0" />
              </Link>
            </Tooltip>
            <Tooltip label="Hỗ trợ">
              <button className="w-full flex justify-center items-center p-2.5 rounded-xl text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b] transition-all cursor-pointer">
                <HelpCircle className="w-5 h-5 shrink-0" />
              </button>
            </Tooltip>
          </>
        ) : (
          <>
            <Link href="/dashboard/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === "/dashboard/settings" ? "bg-[#E8F4FF] text-[#0085FF]" : "text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b]"}`}>
              <Settings className="w-5 h-5 shrink-0" />
              <span>Cài đặt</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4c669a] hover:bg-gray-50 hover:text-[#0d121b] transition-all cursor-pointer">
              <HelpCircle className="w-5 h-5 shrink-0" />
              <span>Hỗ trợ</span>
            </button>
          </>
        )}

        {/* Collapse toggle (desktop only — rendered inside sidebar) */}
        <Tooltip label={collapsed ? "Mở rộng" : "Thu gọn"}>
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-[#4c669a] hover:bg-gray-50 hover:text-[#0085FF] transition-all cursor-pointer mt-1 ${collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}`}
          >
            {collapsed
              ? <ChevronsRight className="w-5 h-5 shrink-0" />
              : <><ChevronsLeft className="w-5 h-5 shrink-0" /><span>Thu gọn</span></>
            }
          </button>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-[#e7ebf3] z-40 transition-all duration-300 ${isCollapsed ? "w-[64px]" : "w-[250px]"}`}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Mobile: top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e7ebf3] flex items-center justify-between px-4 py-3">
        <Link href="/">
          <img src="/logo-text.png" alt="Adapt" className="w-24 object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-[#0d121b] hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white" />
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-[#0d121b] hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[260px] h-full bg-white flex flex-col shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-[#4c669a] transition-colors">
              <X className="w-4 h-4" />
            </button>
            {/* Mobile always shows expanded */}
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}
    </>
  );
}
