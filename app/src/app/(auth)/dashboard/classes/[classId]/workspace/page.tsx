"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { 
    UserPlus, 
    Search, 
    ChevronDown, 
    RefreshCw, 
    Filter,
    Plus,
    MoreHorizontal,
    TrendingUp,
    MessageCircle,
    Bell,
    Paperclip,
    FolderOpen
} from "lucide-react";
import { useParams } from "next/navigation";

interface Student {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
}

interface Announcement {
    id: string;
    title: string;
    date: string;
    content: string;
    link?: string;
    linkText?: string;
    icon?: "attachment" | "folder";
}

interface StatusColumn {
    id: string;
    title: string;
    count: number;
    students: Student[];
    color?: string;
}

export default function ClassWorkspacePage() {
    const params = useParams();
    const classId = params.classId as string;

    // Sample data - in production, this would come from API
    const announcements: Announcement[] = [
        {
            id: "1",
            title: "Kiểm tra Giữa kỳ môn Toán sắp tới!",
            date: "15/10/2023",
            content: "Chào các em! Hãy nhớ rằng bài kiểm tra giữa kỳ môn Toán sẽ diễn ra vào thứ Sáu tới. Tài liệu ôn tập đã được tải lên phần \"Tài liệu\".",
            link: "#",
            linkText: "Xem tài liệu",
            icon: "attachment"
        },
        {
            id: "2",
            title: "Bài tập nhóm: Dự án Khoa học",
            date: "10/10/2023",
            content: "Các nhóm dự án Khoa học, hãy xem lại hướng dẫn chi tiết và các mốc thời gian đã được cập nhật.",
            link: "#",
            linkText: "Xem hướng dẫn",
            icon: "folder"
        }
    ];

    const statusColumns: StatusColumn[] = [
        {
            id: "mastered",
            title: "Nắm vững kiến thức",
            count: 2,
            color: "green",
            students: [
                {
                    id: "1",
                    name: "Tran Thi B",
                    email: "btran@adapt.edu.vn",
                    avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=3b82f6&color=fff"
                },
                {
                    id: "2",
                    name: "Hoang Van E",
                    email: "ehoang@adapt.edu.vn",
                    initials: "HE"
                }
            ]
        },
        {
            id: "in-progress",
            title: "Đang thực hiện",
            count: 2,
            color: "orange",
            students: [
                {
                    id: "3",
                    name: "Nguyen Thi G",
                    email: "gnguyen@adapt.edu.vn",
                    avatar: "https://ui-avatars.com/api/?name=Nguyen+Thi+G&background=ef4444&color=fff"
                },
                {
                    id: "4",
                    name: "Mai Anh T",
                    email: "tmai@adapt.edu.vn",
                    initials: "MT"
                }
            ]
        },
        {
            id: "needs-help",
            title: "Cần hỗ trợ",
            count: 2,
            color: "red",
            students: [
                {
                    id: "5",
                    name: "Pham Hoang H",
                    email: "hpham@adapt.edu.vn",
                    initials: "PH"
                },
                {
                    id: "6",
                    name: "Le Kim L",
                    email: "lle@adapt.edu.vn",
                    avatar: "https://ui-avatars.com/api/?name=Le+Kim+L&background=8b5cf6&color=fff"
                }
            ]
        }
    ];

    const getInitialsColor = (color?: string) => {
        switch (color) {
            case "green":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-500/20 dark:border-green-500/30";
            case "orange":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-500/20 dark:border-orange-500/30";
            case "purple":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-500/20 dark:border-purple-500/30";
            case "red":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-500/20 dark:border-red-500/30";
            default:
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-500/20 dark:border-blue-500/30";
        }
    };

    const getBorderColor = (color?: string) => {
        switch (color) {
            case "green":
                return "border-green-500/20 dark:border-green-500/30";
            case "orange":
                return "border-orange-500/20 dark:border-orange-500/30";
            case "purple":
                return "border-purple-500/20 dark:border-purple-500/30";
            case "red":
                return "border-red-500/20 dark:border-red-500/30";
            default:
                return "border-primary/20 dark:border-primary/50";
        }
    };

    return (
        <LayoutDashboard>
            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-tight">
                            Không gian làm việc lớp 10A
                        </h2>
                        <p className="text-text-muted dark:text-gray-400 text-sm mt-1">
                            Quản lý học sinh, công bố và tài nguyên chung.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-background-dark border border-card-border dark:border-gray-700 text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                            <Plus className="w-[18px] h-[18px]" />
                            Thêm Cột
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
                            <UserPlus className="w-5 h-5" />
                            Thêm Học sinh
                        </button>
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
                        <div className="relative min-w-[160px]">
                            <select className="w-full pl-3 pr-10 py-2.5 bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer">
                                <option value="">Lớp 10A</option>
                                <option value="class-b">Lớp 10B</option>
                                <option value="class-c">Lớp 11C</option>
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

                {/* Main Content - Two Column Layout */}
                <div className="flex flex-col gap-6">
                    {/* Announcements & Shared Resources Section */}
                    <div className="bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-xl shadow-sm p-6 flex flex-col gap-4">
                        <h3 className="text-xl font-semibold text-text-main dark:text-white flex items-center gap-2">
                            <Bell className="text-primary w-6 h-6" />
                            Thông báo & Tài nguyên chung
                        </h3>
                        <div className="space-y-3 flex-1">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-text-main dark:text-white">
                                            {announcement.title}
                                        </h4>
                                        <span className="text-xs text-text-muted dark:text-gray-400">
                                            Đăng ngày {announcement.date}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-muted dark:text-gray-400">
                                        {announcement.content}
                                    </p>
                                    {announcement.link && (
                                        <div className="flex justify-end">
                                            <a
                                                href={announcement.link}
                                                className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                                            >
                                                {announcement.icon === "attachment" ? (
                                                    <Paperclip className="w-4 h-4" />
                                                ) : (
                                                    <FolderOpen className="w-4 h-4" />
                                                )}
                                                {announcement.linkText}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-muted dark:text-gray-400 rounded-lg text-sm font-medium transition-colors justify-center mt-2">
                            <Plus className="w-[18px] h-[18px]" />
                            Tạo Thông báo / Chia sẻ tài nguyên
                        </button>
                    </div>

                    {/* Student Status Kanban Board */}
                    <div className="lg:col-span-2 bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-xl shadow-sm overflow-x-auto p-6">
                        <h3 className="text-xl font-semibold text-text-main dark:text-white mb-4">
                            Trạng thái học sinh
                        </h3>
                        <div className="flex gap-6 pb-4 min-w-max">
                            {statusColumns.map((column) => (
                                <div
                                    key={column.id}
                                    className="kanban-column flex flex-col gap-3 bg-background-soft dark:bg-background-dark p-4 rounded-lg shadow-inner border border-card-border dark:border-gray-700 min-w-[280px]"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-text-main dark:text-white">
                                            {column.title}{" "}
                                            <span className="text-text-muted text-sm font-normal">
                                                ({column.count})
                                            </span>
                                        </h4>
                                        <button className="text-text-muted dark:text-gray-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <MoreHorizontal className="w-[18px] h-[18px]" />
                                        </button>
                                    </div>
                                    {column.students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="bg-white dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                        >
                                            {student.avatar ? (
                                                <div
                                                    className={`size-16 rounded-full bg-cover bg-center border-2 ${getBorderColor(column.color)} mb-3`}
                                                    style={{
                                                        backgroundImage: `url('${student.avatar}')`,
                                                    }}
                                                ></div>
                                            ) : (
                                                <div
                                                    className={`size-16 rounded-full ${getInitialsColor(column.color)} flex items-center justify-center font-bold text-lg border-2 mb-3`}
                                                >
                                                    {student.initials}
                                                </div>
                                            )}
                                            <p className="font-semibold text-text-main dark:text-white text-md">
                                                {student.name}
                                            </p>
                                            <p className="text-text-muted dark:text-gray-400 text-xs mb-2">
                                                {student.email}
                                            </p>
                                            <div className="flex gap-2 text-sm">
                                                <button className="flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-medium transition-colors">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Tiến độ
                                                </button>
                                                <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-muted dark:text-gray-400 rounded-full text-xs font-medium transition-colors">
                                                    <MessageCircle className="w-4 h-4" />
                                                    Liên hệ
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {/* Add New Status Column Button */}
                            <div className="kanban-column flex flex-col items-center justify-center p-4 rounded-lg shadow-inner border border-dashed border-card-border dark:border-gray-700 bg-background-soft dark:bg-background-dark text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-white hover:border-primary/50 transition-colors cursor-pointer min-w-[280px]">
                                <Plus className="w-7 h-7" />
                                <span className="text-sm font-medium mt-2">
                                    Thêm trạng thái mới
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutDashboard>
    );
}
