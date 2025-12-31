"use client";

import { DashboardHeader } from "@/components/dashboards/DashboardHeader";
import { AdminDashboard } from "@/components/dashboards/admin/management/admin/AdminDashboard";
import { TeacherDashboard } from "@/components/dashboards/teacher/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboards/student/StudentDashboard";
import { ParentDashboard } from "@/components/dashboards/parent/ParentDashboard";
import { useUser } from "@/hooks/useUser";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";

export default function DashboardPage() {
  const { user, loading } = useUser();

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center w-full py-12">
          <p className="text-[#535862] text-sm">Đang tải...</p>
        </div>
      );
    }

    const role = user?.role?.toLowerCase() || "";

    switch (role) {
      case "admin":
        return <AdminDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "student":
        return <StudentDashboard />;
      case "parent":
        return <ParentDashboard />;
      default:
        return (
          <div className="flex items-center justify-center w-full py-12">
            <p className="text-[#535862] text-sm">
              Vui lòng đăng nhập để xem bảng điều khiển của bạn.
            </p>
          </div>
        );
    }
  };

  return (
    <LayoutDashboard>
      <DashboardHeader />
      {renderDashboard()}
    </LayoutDashboard>
  );
}
