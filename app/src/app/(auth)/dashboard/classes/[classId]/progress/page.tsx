"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import {
    Download,
    StickyNote,
    Search,
    ChevronDown,
    RefreshCw,
    Filter,
    TrendingUp,
    Flag,
    User,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useParams } from "next/navigation";

interface Student {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
    progress: number;
    status: "active" | "offline";
    riskLevel?: "high" | "medium" | "low";
}

export default function ClassProgressPage() {
    const params = useParams();
    const classId = params.classId as string;

    // Sample data - in production, this would come from API
    const students: Student[] = [
        {
            id: "1",
            name: "Tran Thi B",
            email: "btran@adapt.edu.vn",
            avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=3b82f6&color=fff",
            progress: 75,
            status: "active",
            riskLevel: "low"
        },
        {
            id: "2",
            name: "Hoang Van E",
            email: "ehoang@adapt.edu.vn",
            initials: "HE",
            progress: 40,
            status: "active",
            riskLevel: "high"
        },
        {
            id: "3",
            name: "Nguyen Thi G",
            email: "gnguyen@adapt.edu.vn",
            avatar: "https://ui-avatars.com/api/?name=Nguyen+Thi+G&background=ef4444&color=fff",
            progress: 60,
            status: "offline",
            riskLevel: "medium"
        },
        {
            id: "4",
            name: "Pham Hoang H",
            email: "hpham@adapt.edu.vn",
            initials: "PH",
            progress: 88,
            status: "active",
            riskLevel: "low"
        },
        {
            id: "5",
            name: "Le Kim L",
            email: "lle@adapt.edu.vn",
            avatar: "https://ui-avatars.com/api/?name=Le+Kim+L&background=8b5cf6&color=fff",
            progress: 92,
            status: "active",
            riskLevel: "low"
        },
        {
            id: "6",
            name: "Mai Anh T",
            email: "tmai@adapt.edu.vn",
            initials: "MT",
            progress: 30,
            status: "offline",
            riskLevel: "high"
        }
    ];

    const getProgressColor = (progress: number) => {
        if (progress >= 75) return "bg-primary/10 text-primary";
        if (progress >= 50) return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    };

    const getRiskButtonColor = (riskLevel?: string) => {
        switch (riskLevel) {
            case "high":
                return "bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300";
            case "medium":
                return "bg-warning/10 hover:bg-warning/20 text-warning";
            default:
                return "bg-warning/10 hover:bg-warning/20 text-warning";
        }
    };

    return (
        <LayoutDashboard>
            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-tight">
                            Tiến độ & Can thiệp Lớp 10A
                        </h2>
                        <p className="text-text-muted dark:text-gray-400 text-sm mt-1">
                            Tổng quan về tiến độ học tập và các biện pháp can thiệp cho Lớp 10A.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-background-dark border border-card-border dark:border-gray-700 text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                            <Download className="w-[18px] h-[18px]" />
                            Xuất Báo cáo
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
                            <StickyNote className="w-5 h-5" />
                            Thêm Ghi chú Lớp
                        </button>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Assignment Completion Chart */}
                    <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm col-span-1 md:col-span-2">
                        <h3 className="text-lg font-semibold text-text-main dark:text-white mb-4">
                            Hoàn thành bài tập toàn lớp
                        </h3>
                        <div className="h-48 bg-background-soft dark:bg-background-dark rounded-lg flex items-center justify-center text-text-muted dark:text-gray-500 text-sm border border-dashed border-card-border dark:border-gray-700">
                            Biểu đồ cột: Tỷ lệ hoàn thành bài tập
                        </div>
                    </div>

                    {/* Engagement Heatmap */}
                    <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-text-main dark:text-white mb-4">
                            Mức độ tương tác theo thời gian
                        </h3>
                        <div className="h-48 bg-background-soft dark:bg-background-dark rounded-lg flex items-center justify-center text-text-muted dark:text-gray-500 text-sm border border-dashed border-card-border dark:border-gray-700">
                            Bản đồ nhiệt: Mức độ tương tác
                        </div>
                    </div>

                    {/* Average Score Chart */}
                    <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-text-main dark:text-white mb-4">
                            Điểm trung bình
                        </h3>
                        <div className="h-48 bg-background-soft dark:bg-background-dark rounded-lg flex items-center justify-center text-text-muted dark:text-gray-500 text-sm border border-dashed border-card-border dark:border-gray-700">
                            Biểu đồ đường: Điểm trung bình môn
                        </div>
                    </div>

                    {/* Students Needing Support */}
                    <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-text-main dark:text-white mb-4">
                            Học sinh cần hỗ trợ
                        </h3>
                        <div className="h-48 bg-background-soft dark:bg-background-dark rounded-lg flex items-center justify-center text-text-muted dark:text-gray-500 text-sm border border-dashed border-card-border dark:border-gray-700">
                            Danh sách nhanh học sinh cần can thiệp
                        </div>
                    </div>

                    {/* Upcoming Activities */}
                    <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm col-span-1 md:col-span-2">
                        <h3 className="text-lg font-semibold text-text-main dark:text-white mb-4">
                            Các hoạt động sắp tới
                        </h3>
                        <div className="h-48 bg-background-soft dark:bg-background-dark rounded-lg flex items-center justify-center text-text-muted dark:text-gray-500 text-sm border border-dashed border-card-border dark:border-gray-700">
                            Lịch hoạt động & Bài tập
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-background-light dark:bg-background-dark p-4 rounded-xl border border-card-border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-1 w-full md:w-auto gap-3 items-center">
                        <div className="relative flex-1 max-w-md w-full">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500 pointer-events-none">
                                <Search className="w-5 h-5" />
                            </span>
                            <input
                                className="w-full pl-10 pr-4 py-2.5 bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Tìm kiếm theo tên học sinh..."
                                type="text"
                            />
                        </div>
                        <div className="relative min-w-[160px] hidden md:block">
                            <select className="w-full pl-3 pr-10 py-2.5 bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer">
                                <option value="">Tất cả trạng thái</option>
                                <option value="needs-followup">Cần theo dõi</option>
                                <option value="at-risk">Nguy cơ</option>
                                <option value="excelling">Xuất sắc</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                                <ChevronDown className="w-5 h-5" />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button className="sm:hidden flex items-center justify-center p-2.5 bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg text-text-muted hover:text-primary transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-px bg-card-border dark:bg-gray-700 mx-2 hidden md:block"></div>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors">
                            <RefreshCw className="w-[18px] h-[18px]" />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Students Grid */}
                <div className="bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 p-6">
                    <div className="space-y-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-text-main dark:text-white">
                                    Học sinh Lớp 10A{" "}
                                    <span className="text-text-muted text-sm font-normal">
                                        (15 Học sinh)
                                    </span>
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative"
                                    >
                                        {/* Progress Badge */}
                                        <div
                                            className={`absolute top-3 right-3 size-6 rounded-full ${getProgressColor(
                                                student.progress
                                            )} flex items-center justify-center text-xs font-semibold`}
                                        >
                                            {student.progress}%
                                        </div>

                                        {/* Avatar */}
                                        {student.avatar ? (
                                            <div
                                                className="size-20 rounded-full bg-cover bg-center border-2 border-primary/20 dark:border-primary/50 mb-3"
                                                style={{
                                                    backgroundImage: `url('${student.avatar}')`,
                                                }}
                                            ></div>
                                        ) : (
                                            <div className="size-20 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center font-bold text-xl border-2 border-blue-500/20 dark:border-blue-500/30 mb-3">
                                                {student.initials}
                                            </div>
                                        )}

                                        {/* Name and Email */}
                                        <p className="font-semibold text-text-main dark:text-white text-lg">
                                            {student.name}
                                        </p>
                                        <p className="text-text-muted dark:text-gray-400 text-sm mb-2">
                                            {student.email}
                                        </p>

                                        {/* Status */}
                                        <div className="flex items-center gap-1.5 mb-4">
                                            <span
                                                className={`size-2 rounded-full ${
                                                    student.status === "active"
                                                        ? "bg-green-500"
                                                        : "bg-gray-300 dark:bg-gray-600"
                                                }`}
                                            ></span>
                                            <span className="text-text-muted dark:text-gray-300 text-sm capitalize">
                                                {student.status === "active" ? "Active" : "Offline"}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <button className="flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-medium transition-colors">
                                                <TrendingUp className="w-4 h-4" />
                                                Tiến độ
                                            </button>
                                            <button
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${getRiskButtonColor(
                                                    student.riskLevel
                                                )}`}
                                            >
                                                <Flag className="w-4 h-4" />
                                                Theo dõi
                                            </button>
                                            <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-muted dark:text-gray-400 rounded-full text-xs font-medium transition-colors">
                                                <User className="w-4 h-4" />
                                                Liên hệ PH
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-card-border dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl">
                    <span className="text-sm text-text-muted dark:text-gray-400">
                        Hiển thị{" "}
                        <span className="font-semibold text-text-main dark:text-white">1-6</span> của{" "}
                        <span className="font-semibold text-text-main dark:text-white">15</span> học sinh
                    </span>
                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg border border-card-border dark:border-gray-700 text-text-muted dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="min-w-[32px] h-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-medium">
                            1
                        </button>
                        <button className="min-w-[32px] h-8 flex items-center justify-center rounded-lg text-text-muted dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                            2
                        </button>
                        <button className="min-w-[32px] h-8 flex items-center justify-center rounded-lg text-text-muted dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                            3
                        </button>
                        <button className="p-2 rounded-lg border border-card-border dark:border-gray-700 text-text-muted dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </LayoutDashboard>
    );
}
