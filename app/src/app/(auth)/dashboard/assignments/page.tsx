"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  CircleCheck,
  Clock3,
  FileText,
} from "lucide-react";

type AssignmentType =
  | "practice"
  | "quiz"
  | "exam"
  | "homework"
  | "test"
  | "adaptive";

interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  assignmentType: AssignmentType;
  dueDate?: string | null;
  isPublished: boolean;
  createdAt: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}

interface StudentAssignment {
  id: string;
  status: "not_started" | "in_progress" | "submitted" | "graded";
  assignment: Assignment;
}
type StudentDisplayStatus = "pending" | "done" | "overdue";

function getAssignmentTypeLabel(type: AssignmentType) {
  switch (type) {
    case "practice":
      return "Luyện tập";
    case "quiz":
      return "Quiz";
    case "exam":
      return "Kiểm tra";
    case "homework":
      return "Bài tập về nhà";
    case "test":
      return "Test";
    default:
      return "Adaptive";
  }
}

function getStudentDisplayStatus(
  status: StudentAssignment["status"],
  dueDate?: string | null
): StudentDisplayStatus {
  if (status === "submitted" || status === "graded") return "done";
  if (dueDate && new Date(dueDate).getTime() < Date.now()) return "overdue";
  return "pending";
}

function getStudentStatusLabel(status: StudentDisplayStatus) {
  switch (status) {
    case "done":
      return "Đã làm";
    case "overdue":
      return "Trễ hạn";
    default:
      return "Chưa làm";
  }
}

function getStudentStatusClass(status: StudentDisplayStatus) {
  switch (status) {
    case "done":
      return "bg-green-50 text-green-700";
    case "overdue":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AssignmentsPage() {
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignment[]>(
    []
  );

  const role = user?.role?.toLowerCase() || "";
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";
  const isStudent = role === "student";
  const canRead = isTeacher || isAdmin || isStudent;

  const fetchAssignments = useCallback(async () => {
    if (!user || !canRead) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (isStudent) {
        const data = await api.assignments.getStudentAssignments(user.id);
        setStudentAssignments(
          Array.isArray(data) ? (data as StudentAssignment[]) : []
        );
        return;
      }

      const data = await api.assignments.getAll(
        isTeacher ? { teacherId: user.id } : undefined
      );
      setAssignments(Array.isArray(data) ? (data as Assignment[]) : []);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      toast.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  }, [user, canRead, isStudent, isTeacher]);

  useEffect(() => {
    if (!userLoading) {
      fetchAssignments();
    }
  }, [userLoading, fetchAssignments]);

  const filteredAssignments = useMemo(() => {
    const source = assignments.filter((item) => {
      const matchesType = typeFilter === "all" || item.assignmentType === typeFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query);
      return matchesType && matchesQuery;
    });

    return source.sort((a, b) => {
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [assignments, searchQuery, typeFilter]);

  const listStats = useMemo(() => {
    const total = assignments.length;
    const published = assignments.filter((a) => a.isPublished).length;
    const draft = total - published;
    const dueSoon = assignments.filter((a) => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate).getTime();
      const now = Date.now();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      return due >= now && due <= now + threeDays;
    }).length;
    return { total, published, draft, dueSoon };
  }, [assignments]);

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <p className="text-sm text-[#717680]">Đang tải bài tập...</p>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="bg-white rounded-xl border border-[#e9eaeb] p-6">
        <p className="text-sm text-[#717680]">
          Bạn không có quyền truy cập trang bài tập.
        </p>
      </div>
    );
  }

  if (isStudent) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#181d27]">Bài tập của tôi</h1>
            <p className="text-sm text-[#717680] mt-1">
              Danh sách bài tập được giao cho bạn
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#6244F4]/10 text-[#6244F4] text-sm font-medium">
            <ClipboardList className="w-4 h-4" />
            {studentAssignments.length} bài tập
          </div>
        </div>

        <div className="space-y-3">
          {studentAssignments.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e9eaeb] p-6 text-sm text-[#717680]">
              Chưa có bài tập nào.
            </div>
          ) : (
            studentAssignments.map((item) => {
              const displayStatus = getStudentDisplayStatus(
                item.status,
                item.assignment.dueDate
              );

              return (
                <Link key={item.id} href={`/dashboard/assignments/${item.assignment.id}`}>
                  <div className="bg-white rounded-xl border border-[#e9eaeb] p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#181d27]">
                          {item.assignment.title}
                        </h3>
                        <p className="text-sm text-[#717680] mt-1 line-clamp-2">
                          {item.assignment.description || "Không có mô tả"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStudentStatusClass(displayStatus)}`}
                      >
                        {getStudentStatusLabel(displayStatus)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181d27]">Quản lý bài tập</h1>
          <p className="text-sm text-[#717680] mt-1">
            Theo dõi bài tập đã tạo và giao bài tập cho lớp
          </p>
        </div>
        {isTeacher ? (
          <Button
            as={Link}
            href="/dashboard/assignments/create"
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
          >
            Tạo bài tập
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
          <div className="text-sm text-[#717680]">Tổng bài tập</div>
          
          <div className="text-2xl font-bold text-[#181d27] mt-1">
            {listStats.total}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
          <div className="text-sm text-[#717680]">Đã xuất bản</div>
          <div className="text-2xl font-bold text-[#181d27] mt-1">
            {listStats.published}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
          <div className="text-sm text-[#717680]">Bản nháp</div>
          <div className="text-2xl font-bold text-[#181d27] mt-1">
            {listStats.draft}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
          <div className="text-sm text-[#717680]">Sắp đến hạn (3 ngày)</div>
          <div className="text-2xl font-bold text-[#181d27] mt-1">
            {listStats.dueSoon}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
          <Input
            startContent={<Search className="w-4 h-4 text-[#717680]" />}
            placeholder="Tìm theo tiêu đề hoặc mô tả..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <select
            className="h-10 border border-[#d5d7da] rounded-xl px-3 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="practice">Luyện tập</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Kiểm tra</option>
            <option value="homework">Bài tập về nhà</option>
            <option value="test">Test</option>
            <option value="adaptive">Adaptive</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e9eaeb] p-6 text-sm text-[#717680]">
            Không có bài tập phù hợp bộ lọc.
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/dashboard/assignments/${assignment.id}`}
              className="block"
            >
              <div className="bg-white rounded-xl border border-[#e9eaeb] p-4 hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#181d27] truncate">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-[#717680] mt-1 line-clamp-2">
                      {assignment.description || "Không có mô tả"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#717680]">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {getAssignmentTypeLabel(assignment.assignmentType)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleString("vi-VN")
                          : "Không đặt hạn"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5" />
                        Tạo lúc {new Date(assignment.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                      assignment.isPublished
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <CircleCheck className="w-3 h-3" />
                    {assignment.isPublished ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
