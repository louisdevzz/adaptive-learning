"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { FileEdit, UserPlus, BarChart3, UserCheck, Calendar, AlertTriangle, MessageCircle, Edit, Bell, Search, ChevronDown, RefreshCw, ChevronRight, ChevronLeft, Layout, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ClassPage() {
    const params = useParams();
    const classId = params.classId as string;

    return (
        <LayoutDashboard>
            <div className="flex flex-col space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-tight">
                            Tổng quan Lớp 10A
                        </h2>
                        <p className="text-text-muted dark:text-gray-400 text-sm mt-1">
                            Thông tin chi tiết và quản lý học sinh cho Lớp 10A.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/dashboard/classes/${classId}/progress`}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <TrendingUp className="w-[18px] h-[18px]" />
                            Tiến độ & Can thiệp
                        </Link>
                        <Link
                            href={`/dashboard/classes/${classId}/workspace`}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <Layout className="w-[18px] h-[18px]" />
                            Không gian làm việc
                        </Link>
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                            <FileEdit className="w-[18px] h-[18px]" />
                            Quản lý điểm
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
                            <UserPlus className="w-5 h-5" />
                            Thêm Học sinh
                        </button>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Average Score Card */}
                    <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-primary/10 text-primary dark:bg-primary/20 rounded-full flex items-center justify-center">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted dark:text-gray-400">Điểm trung bình</p>
                                <p className="text-2xl font-bold text-text-main dark:text-white">8.5</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                            +0.2%
                        </span>
                    </div>

                    {/* Attendance Rate Card */}
                    <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full flex items-center justify-center">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted dark:text-gray-400">Tỷ lệ chuyên cần</p>
                                <p className="text-2xl font-bold text-text-main dark:text-white">92%</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                            ổn định
                        </span>
                    </div>

                    {/* Upcoming Deadlines Card */}
                    <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted dark:text-gray-400">Hạn chót sắp tới</p>
                                <p className="text-2xl font-bold text-text-main dark:text-white">3</p>
                            </div>
                        </div>
                        <a className="text-sm text-primary hover:underline font-medium" href="#">
                            Xem chi tiết
                        </a>
                    </div>
                </div>

                {/* Action Items Section */}
                <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-card-border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-text-main dark:text-white flex items-center gap-2">
                            <AlertTriangle className="text-orange-500 w-5 h-5" />
                            Hành động cần thiết
                        </h3>
                        <a className="text-sm text-primary hover:underline font-medium" href="#">
                            Xem tất cả
                        </a>
                    </div>

                    <div className="space-y-4">
                        {/* Student with Low Score */}
                        <div className="flex items-center gap-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-lg">
                            <div className="size-10 rounded-full bg-cover bg-center border border-red-200 shrink-0" style={{backgroundImage: "url('https://ui-avatars.com/api/?name=Nguyen+Thi+G&background=ef4444&color=fff')"}}></div>
                            <div className="flex-1">
                                <p className="font-medium text-text-main dark:text-white">
                                    Nguyen Thi G
                                    <span className="text-sm text-red-600 dark:text-red-400 ml-1">(Điểm thấp môn Toán)</span>
                                </p>
                                <p className="text-sm text-text-muted dark:text-gray-400">
                                    Cần hỗ trợ thêm hoặc bài tập bổ sung.
                                </p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <button className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-full text-xs font-medium transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    Liên hệ
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-medium transition-colors">
                                    <Edit className="w-4 h-4" />
                                    Giao bài
                                </button>
                            </div>
                        </div>

                        {/* Student with Missing Assignments */}
                        <div className="flex items-center gap-4 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900 rounded-lg">
                            <div className="size-10 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 flex items-center justify-center font-bold text-sm border border-orange-200 shrink-0">
                                LN
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-text-main dark:text-white">
                                    Le Nguyen N
                                    <span className="text-sm text-orange-600 dark:text-orange-400 ml-1">(Thiếu 2 bài tập)</span>
                                </p>
                                <p className="text-sm text-text-muted dark:text-gray-400">
                                    Bài tập Ngữ văn và Lịch sử chưa nộp.
                                </p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <button className="flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    Liên hệ
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-medium transition-colors">
                                    <Bell className="w-4 h-4" />
                                    Nhắc nhở
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student List Table */}
                <div className="bg-background-light dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-xl shadow-sm flex flex-col flex-1">
                    {/* Search and Filter Bar */}
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-1 w-full md:w-auto gap-3 items-center">
                            {/* Search Input */}
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

                            {/* Status Filter */}
                            <div className="relative min-w-[160px]">
                                <select className="w-full pl-3 pr-10 py-2.5 bg-background-soft dark:bg-background-dark border border-card-border dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer">
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="active">Active</option>
                                    <option value="offline">Offline</option>
                                    <option value="needs-attention">Cần chú ý</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                                    <ChevronDown className="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <div className="h-8 w-px bg-card-border dark:bg-gray-700 mx-2 hidden md:block"></div>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors">
                                <RefreshCw className="w-[18px] h-[18px]" />
                                Làm mới
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-card-border dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-background-dark/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                                        Học sinh
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                                        Điểm TB
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">
                                        Bài tập thiếu
                                    </th>
                                    <th className="relative px-6 py-3">
                                        <span className="sr-only">Hành động</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-background-light dark:bg-background-dark divide-y divide-card-border dark:divide-gray-700">
                                {/* Student 1 */}
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 size-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{backgroundImage: "url('https://ui-avatars.com/api/?name=Tran+Thi+B&background=3b82f6&color=fff')"}}></div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-main dark:text-white">Tran Thi B</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400">
                                        btran@adapt.edu.vn
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            <span className="text-sm text-text-muted dark:text-gray-300">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main dark:text-white font-medium">
                                        8.7
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        0
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a className="text-primary hover:text-primary-dark dark:hover:text-blue-400 flex items-center justify-end gap-1" href="#">
                                            Xem
                                            <ChevronRight className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>

                                {/* Student 2 */}
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 size-10 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center justify-center font-bold text-sm border border-green-200">
                                                HE
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-main dark:text-white">Hoang Van E</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400">
                                        ehoang@adapt.edu.vn
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            <span className="text-sm text-text-muted dark:text-gray-300">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main dark:text-white font-medium">
                                        8.1
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        0
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a className="text-primary hover:text-primary-dark dark:hover:text-blue-400 flex items-center justify-end gap-1" href="#">
                                            Xem
                                            <ChevronRight className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>

                                {/* Student 3 */}
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 size-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{backgroundImage: "url('https://ui-avatars.com/api/?name=Nguyen+Thi+G&background=ef4444&color=fff')"}}></div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-main dark:text-white">Nguyen Thi G</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400">
                                        gnguyen@adapt.edu.vn
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                            <span className="text-sm text-text-muted dark:text-gray-400">Offline</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                        6.2
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                        1
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a className="text-primary hover:text-primary-dark dark:hover:text-blue-400 flex items-center justify-end gap-1" href="#">
                                            Xem
                                            <ChevronRight className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>

                                {/* Student 4 */}
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 size-10 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 flex items-center justify-center font-bold text-sm border border-orange-200">
                                                PH
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-main dark:text-white">Pham Hoang H</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400">
                                        hpham@adapt.edu.vn
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            <span className="text-sm text-text-muted dark:text-gray-300">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main dark:text-white font-medium">
                                        7.9
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-500 font-medium">
                                        2
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a className="text-primary hover:text-primary-dark dark:hover:text-blue-400 flex items-center justify-end gap-1" href="#">
                                            Xem
                                            <ChevronRight className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>

                                {/* Student 5 */}
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 size-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{backgroundImage: "url('https://ui-avatars.com/api/?name=Le+Kim+L&background=8b5cf6&color=fff')"}}></div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-main dark:text-white">Le Kim L</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400">
                                        lle@adapt.edu.vn
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            <span className="text-sm text-text-muted dark:text-gray-300">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main dark:text-white font-medium">
                                        8.8
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        0
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a className="text-primary hover:text-primary-dark dark:hover:text-blue-400 flex items-center justify-end gap-1" href="#">
                                            Xem
                                            <ChevronRight className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-card-border dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl">
                        <span className="text-sm text-text-muted dark:text-gray-400">
                            Showing <span className="font-semibold text-text-main dark:text-white">1-5</span> of <span className="font-semibold text-text-main dark:text-white">15</span> students
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
            </div>
        </LayoutDashboard>
    )
}