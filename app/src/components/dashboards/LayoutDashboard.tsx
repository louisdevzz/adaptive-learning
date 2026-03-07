"use client";

import { SidebarNavigation } from "./SidebarNavigation";
import { DashboardBreadcrumbs } from "./DashboardBreadcrumbs";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Search, Bell } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function LayoutDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if a string is a UUID
  const isUUID = (str: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Fetch entity name by ID and type
  useEffect(() => {
    const fetchEntityName = async () => {
      const segments = pathname.split("/").filter(Boolean);

      if (segments[0] === "dashboard") {
        segments.shift();
      }

      const toFetch: Array<{
        entityType: string;
        entityId: string;
        cacheKey: string;
      }> = [];

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (isUUID(segment) && i > 0) {
          const entityType = segments[i - 1];
          const entityId = segment;
          const cacheKey = `${entityType}-${entityId}`;

          if (
            [
              "courses",
              "classes",
              "admins",
              "teachers",
              "students",
              "parents",
              "users",
            ].includes(entityType)
          ) {
            setEntityNames((prev) => {
              if (prev[cacheKey]) return prev;
              return prev;
            });
            toFetch.push({ entityType, entityId, cacheKey });
          }
        }
      }

      if (toFetch.length === 0) return;

      const fetchPromises = toFetch.map(
        async ({ entityType, entityId, cacheKey }) => {
          try {
            let name: string | undefined;

            switch (entityType) {
              case "courses":
                const course = await api.courses.getById(entityId);
                name = course?.title;
                break;
              case "classes":
                const classData = await api.classes.getById(entityId);
                name = classData?.className;
                break;
              case "admins":
                const admin = await api.admins.getById(entityId);
                name = admin?.fullName;
                break;
              case "teachers":
                const teacher = await api.teachers.getById(entityId);
                name = teacher?.fullName;
                break;
              case "students":
                const student = await api.students.getById(entityId);
                name = student?.fullName;
                break;
              case "parents":
                const parent = await api.parents.getById(entityId);
                name = parent?.fullName;
                break;
              case "users":
                try {
                  const endpoints = [
                    api.admins
                      .getById(entityId)
                      .then((data) => ({ ...data, role: "admin" })),
                    api.teachers
                      .getById(entityId)
                      .then((data) => ({ ...data, role: "teacher" })),
                    api.students
                      .getById(entityId)
                      .then((data) => ({ ...data, role: "student" })),
                    api.parents
                      .getById(entityId)
                      .then((data) => ({ ...data, role: "parent" })),
                  ];

                  const results = await Promise.allSettled(endpoints);
                  const successfulResult = results.find(
                    (r) => r.status === "fulfilled"
                  );

                  if (
                    successfulResult &&
                    successfulResult.status === "fulfilled"
                  ) {
                    name = (successfulResult.value as any)?.fullName;
                  }
                } catch (error) {
                  console.error(
                    "Error fetching user from all endpoints:",
                    error
                  );
                }
                break;
            }

            if (name) {
              return { cacheKey, name };
            }
          } catch (error) {
            console.error(`Error fetching ${entityType} name:`, error);
          }
          return null;
        }
      );

      const results = await Promise.all(fetchPromises);
      const newNames: Record<string, string> = {};

      results.forEach((result) => {
        if (result) {
          newNames[result.cacheKey] = result.name;
        }
      });

      if (Object.keys(newNames).length > 0) {
        setEntityNames((prev) => {
          const hasNew = Object.keys(newNames).some((key) => !prev[key]);
          return hasNew ? { ...prev, ...newNames } : prev;
        });
      }
    };

    fetchEntityName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Generate breadcrumb items based on pathname
  const breadcrumbItems = useMemo(() => {
    if (pathname === "/dashboard") {
      return [{ label: "Dashboard tổng quan" }];
    }

    const labelMap: Record<string, string> = {
      users: "Người dùng",
      students: "Học sinh",
      teachers: "Giáo viên",
      parents: "Phụ huynh",
      admins: "Quản trị viên",
      courses: "Khóa học",
      modules: "Chủ đề",
      sections: "Bài học",
      "knowledge-points": "Điểm kiến thức",
      explorer: "Khám phá",
      classes: "Lớp học",
      reports: "Báo cáo",
      "my-courses": "Khóa học của tôi",
      "learning-path": "Lộ trình học tập",
      progress: "Tiến độ",
      "children-progress": "Tiến độ con",
      create: "Tạo",
      edit: "Sửa",
      delete: "Xóa",
    };

    const actionLabels: Record<string, Record<string, string>> = {
      courses: { create: "Tạo khóa học", edit: "Sửa khóa học" },
      classes: { create: "Tạo lớp học", edit: "Sửa lớp học" },
      students: { create: "Tạo học sinh", edit: "Sửa học sinh" },
      teachers: { create: "Tạo giáo viên", edit: "Sửa giáo viên" },
      parents: { create: "Tạo phụ huynh", edit: "Sửa phụ huynh" },
      admins: { create: "Tạo quản trị viên", edit: "Sửa quản trị viên" },
      users: { create: "Tạo người dùng", edit: "Sửa người dùng" },
    };

    const segments = pathname.split("/").filter(Boolean);
    const items: Array<{ label: string; href?: string }> = [];

    if (segments[0] === "dashboard") {
      segments.shift();
    }

    let currentPath = "/dashboard";
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      currentPath += `/${segment}`;

      let label: string;

      if (isUUID(segment) && index > 0) {
        const entityType = segments[index - 1];
        const cacheKey = `${entityType}-${segment}`;
        label = entityNames[cacheKey] || segment;
      } else if (actionLabels[segments[index - 1]]?.[segment]) {
        const entityType = segments[index - 1];
        label = actionLabels[entityType][segment];
      } else if (segment === "create" && index > 0) {
        const entityType = segments[index - 1];
        label =
          actionLabels[entityType]?.["create"] || labelMap[segment] || segment;
      } else if (segment === "edit" && index > 0 && isUUID(segments[index - 1])) {
        const entityType = segments[index - 2];
        label =
          actionLabels[entityType]?.["edit"] || labelMap[segment] || segment;
      } else {
        label =
          labelMap[segment] ||
          segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
      }

      items.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return items;
  }, [pathname, entityNames]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      {/* Sidebar */}
      <SidebarNavigation
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[64px]" : "lg:ml-[250px]"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#e7ebf3] px-6 py-3 flex items-center justify-between gap-4 lg:mt-0 mt-[57px]">
          {/* Search */}
          <div className="flex items-center bg-[#f0f2f5] rounded-lg px-3 py-2 w-full max-w-sm focus-within:ring-2 focus-within:ring-[#0085FF]/20 transition-all">
            <Search className="w-4 h-4 text-[#4c669a] shrink-0" />
            <input
              className="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d121b] placeholder:text-[#4c669a] ml-2 outline-none"
              placeholder="Tìm kiếm..."
              type="text"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="relative p-2 text-[#0d121b] hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-5">
          {/* Breadcrumbs */}
          <div className="mb-5">
            <DashboardBreadcrumbs items={breadcrumbItems} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
