import LayoutDashboard from "@/components/dashboards/LayoutDashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutDashboard>{children}</LayoutDashboard>
  );
}
