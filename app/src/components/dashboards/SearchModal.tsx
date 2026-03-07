"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  X,
  Command,
  Users,
  BookOpen,
  School,
  GraduationCap,
  UserCircle,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Color constants
const colors = {
  primary: "#6244F4",
  lime: "#D7F654",
  black: "#010101",
  white: "#FFFFFF",
  textMuted: "#666666",
  border: "#E5E5E5",
  lightPurple: "rgba(98, 68, 244, 0.1)",
};

// Search categories by role
type SearchCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const searchCategoriesByRole: Record<string, SearchCategory[]> = {
  admin: [
    { id: "all", label: "Tất cả", icon: Search },
    { id: "users", label: "Ngườii dùng", icon: Users },
    { id: "courses", label: "Khóa học", icon: BookOpen },
    { id: "classes", label: "Lớp học", icon: School },
    { id: "students", label: "Học sinh", icon: UserCircle },
    { id: "teachers", label: "Giáo viên", icon: GraduationCap },
  ],
  teacher: [
    { id: "all", label: "Tất cả", icon: Search },
    { id: "courses", label: "Khóa học", icon: BookOpen },
    { id: "students", label: "Học sinh", icon: UserCircle },
    { id: "classes", label: "Lớp học", icon: School },
    { id: "assignments", label: "Bài tập", icon: FileText },
  ],
  student: [
    { id: "all", label: "Tất cả", icon: Search },
    { id: "courses", label: "Khóa học", icon: BookOpen },
    { id: "learning-path", label: "Lộ trình", icon: TrendingUp },
    { id: "progress", label: "Tiến độ", icon: TrendingUp },
  ],
  parent: [
    { id: "all", label: "Tất cả", icon: Search },
    { id: "children", label: "Con", icon: UserCircle },
    { id: "progress", label: "Tiến độ", icon: TrendingUp },
    { id: "courses", label: "Khóa học", icon: BookOpen },
  ],
};

// Mock search results - in production, this would come from API
type SearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  icon?: string;
  href: string;
  metadata?: Record<string, any>;
};

const mockSearchResults: Record<string, SearchResult[]> = {
  users: [
    { id: "1", type: "user", title: "Nguyễn Văn A", subtitle: "Học sinh - Lớp 10A", href: "/dashboard/users/1" },
    { id: "2", type: "user", title: "Trần Thị B", subtitle: "Giáo viên - Toán", href: "/dashboard/users/2" },
    { id: "3", type: "user", title: "Lê Văn C", subtitle: "Học sinh - Lớp 11B", href: "/dashboard/users/3" },
  ],
  courses: [
    { id: "1", type: "course", title: "Toán học 10", subtitle: "Đại số và Hình học", href: "/dashboard/courses/1" },
    { id: "2", type: "course", title: "Vật lý 11", subtitle: "Cơ học và Nhiệt học", href: "/dashboard/courses/2" },
    { id: "3", type: "course", title: "Hóa học 12", subtitle: "Hóa hữu cơ", href: "/dashboard/courses/3" },
  ],
  classes: [
    { id: "1", type: "class", title: "Lớp 10A", subtitle: "35 học sinh", href: "/dashboard/classes/1" },
    { id: "2", type: "class", title: "Lớp 11B", subtitle: "32 học sinh", href: "/dashboard/classes/2" },
  ],
  students: [
    { id: "1", type: "student", title: "Nguyễn Văn A", subtitle: "Lớp 10A - 85% hoàn thành", href: "/dashboard/students/1" },
    { id: "2", type: "student", title: "Trần Thị B", subtitle: "Lớp 10A - 92% hoàn thành", href: "/dashboard/students/2" },
  ],
  teachers: [
    { id: "1", type: "teacher", title: "Trần Thị B", subtitle: "Toán - 3 lớp", href: "/dashboard/teachers/1" },
  ],
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { user } = useUser();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const role = user?.role?.toLowerCase() || "student";
  const categories = searchCategoriesByRole[role] || searchCategoriesByRole.student;

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`recentSearches_${role}`);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, [role]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }

      const results = getFilteredResults();

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, query, selectedCategory, selectedIndex]);

  // Get filtered results based on query and category
  const getFilteredResults = useCallback((): SearchResult[] => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    let results: SearchResult[] = [];

    if (selectedCategory === "all") {
      // Search across all categories
      Object.values(mockSearchResults).forEach((categoryResults) => {
        results.push(...categoryResults);
      });
    } else if (mockSearchResults[selectedCategory]) {
      results = mockSearchResults[selectedCategory];
    }

    return results.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.subtitle?.toLowerCase().includes(searchTerm)
    );
  }, [query, selectedCategory]);

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    // Save to recent searches
    const newRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem(`recentSearches_${role}`, JSON.stringify(newRecent));

    // Navigate
    router.push(result.href);
    onClose();
    setQuery("");
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(`recentSearches_${role}`);
  };

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className="font-semibold text-[#6244F4]"
        >
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const filteredResults = getFilteredResults();
  const showRecent = !query.trim() && recentSearches.length > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-start justify-center pt-[15vh] z-50 px-4 pointer-events-none"
          >
            <div
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              style={{ border: `1px solid ${colors.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: colors.border }}>
                <Search className="w-5 h-5" style={{ color: colors.textMuted }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Tìm kiếm khóa học, học sinh, lớp học..."
                  className="flex-1 bg-transparent outline-none text-base"
                  style={{ color: colors.black }}
                />
                <div className="flex items-center gap-2">
                  <kbd
                    className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                    style={{ backgroundColor: colors.lightPurple, color: colors.primary }}
                  >
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </kbd>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" style={{ color: colors.textMuted }} />
                  </button>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="px-6 py-3 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <span
                    className="text-sm font-medium mr-2 whitespace-nowrap"
                    style={{ color: colors.textMuted }}
                  >
                    Bạn đang tìm kiếm:
                  </span>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedIndex(0);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
                        style={{
                          backgroundColor: isSelected ? colors.lightPurple : "transparent",
                          color: isSelected ? colors.primary : colors.textMuted,
                          border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {category.label}
                        {isSelected && (
                          <X
                            className="w-3 h-3 ml-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory("all");
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[50vh] overflow-y-auto">
                {showRecent ? (
                  /* Recent Searches */
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider"
                        style={{ color: colors.textMuted }}
                      >
                        Tìm kiếm gần đây
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs hover:underline text-[#6244F4]"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        >
                          <Clock className="w-4 h-4" style={{ color: colors.textMuted }} />
                          <span className="flex-1 text-sm" style={{ color: colors.black }}>
                            {search}
                          </span>
                          <ChevronRight className="w-4 h-4" style={{ color: colors.textMuted }} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : query.trim() ? (
                  /* Search Results */
                  <div className="p-4">
                    {filteredResults.length > 0 ? (
                      <div className="space-y-1">
                        {filteredResults.map((result, index) => (
                          <button
                            key={result.id}
                            onClick={() => handleSelectResult(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left"
                            style={{
                              backgroundColor:
                                selectedIndex === index ? colors.lightPurple : "transparent",
                            }}
                          >
                            {/* Icon */}
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: colors.lightPurple,
                              }}
                            >
                              {result.type === "user" || result.type === "student" || result.type === "teacher" ? (
                                <UserCircle className="w-5 h-5 text-[#6244F4]" />
                              ) : result.type === "course" ? (
                                <BookOpen className="w-5 h-5 text-[#6244F4]" />
                              ) : result.type === "class" ? (
                                <School className="w-5 h-5 text-[#6244F4]" />
                              ) : (
                                <Search className="w-5 h-5 text-[#6244F4]" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate" style={{ color: colors.black }}>
                                {highlightText(result.title, query)}
                              </p>
                              {result.subtitle && (
                                <p
                                  className="text-sm truncate"
                                  style={{ color: colors.textMuted }}
                                >
                                  {highlightText(result.subtitle, query)}
                                </p>
                              )}
                            </div>

                            {/* Arrow */}
                            <ArrowRight
                              className="w-4 h-4 flex-shrink-0"
                              style={{
                                color:
                                  selectedIndex === index ? colors.primary : colors.textMuted,
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{ backgroundColor: colors.lightPurple }}
                        >
                          <Search className="w-8 h-8 text-[#6244F4]" />
                        </div>
                        <p className="text-sm font-medium" style={{ color: colors.black }}>
                          Không tìm thấy kết quả
                        </p>
                        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                          Thử tìm kiếm với từ khóa khác
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Default State - Quick Actions */
                  <div className="p-4">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider mb-3 px-4"
                      style={{ color: colors.textMuted }}
                    >
                      Truy cập nhanh
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {role === "admin" && (
                        <>
                          <QuickAction
                            href="/dashboard/users"
                            icon={Users}
                            title="Quản lý ngườii dùng"
                            description="Xem tất cả users"
                          />
                          <QuickAction
                            href="/dashboard/courses"
                            icon={BookOpen}
                            title="Quản lý khóa học"
                            description="Danh sách khóa học"
                          />
                        </>
                      )}
                      {role === "teacher" && (
                        <>
                          <QuickAction
                            href="/dashboard/classes"
                            icon={School}
                            title="Lớp học của tôi"
                            description="Quản lý lớp học"
                          />
                          <QuickAction
                            href="/dashboard/students"
                            icon={UserCircle}
                            title="Học sinh"
                            description="Danh sách học sinh"
                          />
                        </>
                      )}
                      {role === "student" && (
                        <>
                          <QuickAction
                            href="/dashboard/my-courses"
                            icon={BookOpen}
                            title="Khóa học của tôi"
                            description="Tiếp tục học"
                          />
                          <QuickAction
                            href="/dashboard/learning-path"
                            icon={TrendingUp}
                            title="Lộ trình học tập"
                            description="Xem tiến độ"
                          />
                        </>
                      )}
                      {role === "parent" && (
                        <>
                          <QuickAction
                            href="/dashboard/children-progress"
                            icon={TrendingUp}
                            title="Tiến độ con"
                            description="Theo dõi học tập"
                          />
                          <QuickAction
                            href="/dashboard/courses"
                            icon={BookOpen}
                            title="Khóa học"
                            description="Khám phá khóa học"
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-6 py-3 border-t text-xs"
                style={{ borderColor: colors.border, color: colors.textMuted }}
              >
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-medium">
                      ↑↓
                    </kbd>
                    <span>Điều hướng</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-medium">
                      ↵
                    </kbd>
                    <span>Chọn</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Powered by</span>
                  <span
                    className="font-semibold text-[#6244F4]"
                  >
                    Adaptive Learning
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Quick Action Component
function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left border"
      style={{ borderColor: colors.border }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: colors.lightPurple }}
      >
        <Icon className="w-5 h-5 text-[#6244F4]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: colors.black }}>
          {title}
        </p>
        <p className="text-xs truncate" style={{ color: colors.textMuted }}>
          {description}
        </p>
      </div>
    </button>
  );
}

export default SearchModal;
