"use client";

import { SidebarNavigation } from "./SidebarNavigation";
import { DashboardBreadcrumbs } from "./DashboardBreadcrumbs";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});

  // Check if a string is a UUID
  const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Fetch entity name by ID and type
  useEffect(() => {
    const fetchEntityName = async () => {
      const segments = pathname.split("/").filter(Boolean);
      
      // Skip 'dashboard' segment
      if (segments[0] === "dashboard") {
        segments.shift();
      }

      // Find ID segments and their entity types that need fetching
      const toFetch: Array<{ entityType: string; entityId: string; cacheKey: string }> = [];
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        // Check if segment is a UUID and get entity type from previous segment
        if (isUUID(segment) && i > 0) {
          const entityType = segments[i - 1];
          const entityId = segment;
          const cacheKey = `${entityType}-${entityId}`;

          // Check if we support this entity type and it's not cached
          if (["courses", "classes", "admins", "teachers", "students", "parents", "users"].includes(entityType)) {
            // Check if already cached
            setEntityNames((prev) => {
              if (prev[cacheKey]) {
                return prev; // Already cached, no update needed
              }
              return prev; // Return same reference, we'll fetch separately
            });
            
            toFetch.push({ entityType, entityId, cacheKey });
          }
        }
      }

      // If nothing to fetch, return early
      if (toFetch.length === 0) return;


      // Fetch all entities in parallel
      const fetchPromises = toFetch.map(async ({ entityType, entityId, cacheKey }) => {
        try {
          // Check cache one more time before fetching
          setEntityNames((prev) => {
            if (prev[cacheKey]) return prev;
            return prev;
          });

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
              // Try to fetch from all role endpoints (similar to user detail page)
              try {
                const endpoints = [
                  api.admins.getById(entityId).then((data) => ({ ...data, role: "admin" })),
                  api.teachers.getById(entityId).then((data) => ({ ...data, role: "teacher" })),
                  api.students.getById(entityId).then((data) => ({ ...data, role: "student" })),
                  api.parents.getById(entityId).then((data) => ({ ...data, role: "parent" })),
                ];

                const results = await Promise.allSettled(endpoints);
                const successfulResult = results.find((r) => r.status === "fulfilled");

                if (successfulResult && successfulResult.status === "fulfilled") {
                  name = (successfulResult.value as any)?.fullName;
                }
              } catch (error) {
                console.error("Error fetching user from all endpoints:", error);
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
      });

      const results = await Promise.all(fetchPromises);
      const newNames: Record<string, string> = {};
      
      results.forEach((result) => {
        if (result) {
          newNames[result.cacheKey] = result.name;
        }
      });

      if (Object.keys(newNames).length > 0) {
        setEntityNames((prev) => {
          // Only update if we have new names that aren't already in cache
          const hasNew = Object.keys(newNames).some(key => !prev[key]);
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
      delete: "Xóa"
    };

    const actionLabels: Record<string, Record<string, string>> = {
      courses: {
        create: "Tạo khóa học",
        edit: "Sửa khóa học",
      },
      classes: {
        create: "Tạo lớp học",
        edit: "Sửa lớp học",
      },
      students: {
        create: "Tạo học sinh",
        edit: "Sửa học sinh",
      },
      teachers: {
        create: "Tạo giáo viên",
        edit: "Sửa giáo viên",
      },
      parents: {
        create: "Tạo phụ huynh",
        edit: "Sửa phụ huynh",
      },
      admins: {
        create: "Tạo quản trị viên",
        edit: "Sửa quản trị viên",
      },
      users: {
        create: "Tạo người dùng",
        edit: "Sửa người dùng",
      },
    };

    const segments = pathname.split("/").filter(Boolean);
    const items: Array<{ label: string; href?: string }> = [];

    // Skip 'dashboard' segment
    if (segments[0] === "dashboard") {
      segments.shift();
    }

    // Build breadcrumb items
    let currentPath = "/dashboard";
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      
      currentPath += `/${segment}`;

      let label: string;

      // Check if this segment is a UUID (ID)
      if (isUUID(segment) && index > 0) {
        const entityType = segments[index - 1];
        const cacheKey = `${entityType}-${segment}`;
        label = entityNames[cacheKey] || segment; // Use cached name or fallback to ID
      } 
      // Check if this is an action (create/edit) with a specific label
      else if (actionLabels[segments[index - 1]]?.[segment]) {
        const entityType = segments[index - 1];
        label = actionLabels[entityType][segment];
      }
      // Check if this is "create" and should combine with previous segment
      else if (segment === "create" && index > 0) {
        const entityType = segments[index - 1];
        label = actionLabels[entityType]?.["create"] || labelMap[segment] || segment;
      }
      // Check if this is "edit" and should combine with previous segment
      else if (segment === "edit" && index > 0 && isUUID(segments[index - 1])) {
        const entityType = segments[index - 2];
        label = actionLabels[entityType]?.["edit"] || labelMap[segment] || segment;
      }
      // Use labelMap or format the segment
      else {
        label = labelMap[segment] || segment
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
    <div className="bg-[#fbfbfc] dark:bg-[#101622] flex flex-col items-start relative min-h-screen w-full">
      <SidebarNavigation />
      <main className="flex-1 px-4 md:px-10 py-6 max-w-[1400px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <DashboardBreadcrumbs items={breadcrumbItems} />
        </div>
        {children}
      </main>
    </div>
  );
}