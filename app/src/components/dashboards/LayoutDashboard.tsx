import { SidebarNavigation } from "./SidebarNavigation";

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white flex flex-col items-start relative min-h-screen w-full">
      <SidebarNavigation />
      {children}
    </div>
  );
}