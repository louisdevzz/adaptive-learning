import LayoutDashboard from "@/components/dashboards/LayoutDashboard";

export default function ProgressPage() {
  return(
    <LayoutDashboard>
      <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
        <h1 className="text-2xl font-bold text-[#181d27]">Progress</h1>
      </div>
    </LayoutDashboard>
  )
}