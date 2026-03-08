"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import {
  ArrowLeft,
  BarChart3,
  Download,
  FileDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
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

interface AssignmentDetail {
  id: string;
  title: string;
  description?: string | null;
  assignmentType: AssignmentType;
  dueDate?: string | null;
  aiGradingEnabled?: boolean;
}

interface AiSuggestion {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  suggestedScore?: number | null;
  confidence?: number | null;
  feedback?: string | null;
}

interface AssignmentTarget {
  id: string;
  assignmentId: string;
  targetType: "student" | "class" | "group" | "auto" | "section";
  targetId: string;
}

interface ClassItem {
  id: string;
  className: string;
  gradeLevel: number;
}

interface ClassEnrollment {
  status: "active" | "withdrawn" | "completed";
  student: {
    id: string;
    fullName: string;
  };
}

type StudentAssignmentStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded";

interface AssignmentResultRow {
  studentAssignment: {
    id: string;
    studentId: string;
    status: StudentAssignmentStatus;
    submittedTime?: string | null;
    submissionUrl?: string | null;
    submissionName?: string | null;
  };
  student: {
    id: string;
    fullName: string;
    email?: string | null;
  } | null;
  result: {
    totalScore: number;
    maxScore: number;
    accuracy: number;
    gradingSource?: "manual" | "ai_approved";
    approvalNote?: string | null;
    gradedAt: string;
  } | null;
  aiSuggestion?: AiSuggestion | null;
}

interface ClassAnalyticsRow {
  classId: string;
  classLabel: string;
  assignedStudents: number;
  submittedStudents: number;
  gradedStudents: number;
  waitingGrade: number;
  avgScore: number;
  aiFailed: number;
  completionRate: number;
}

function csvEscape(value: string | number | null | undefined) {
  if (value == null) return "";
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AssignmentWorkspacePage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [targets, setTargets] = useState<AssignmentTarget[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResultRow[]>(
    []
  );
  const [classStudentsMap, setClassStudentsMap] = useState<
    Record<string, ClassEnrollment[]>
  >({});

  const role = user?.role?.toLowerCase() || "";
  const canReadWorkspace = role === "teacher" || role === "admin";

  const fetchWorkspaceData = useCallback(async () => {
    if (!assignmentId || !canReadWorkspace) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [assignmentData, targetData, classesData] = await Promise.all([
        api.assignments.getByIdWithDetails(assignmentId),
        api.assignments.getTargets(assignmentId).catch(() => []),
        api.classes.getAll().catch(() => []),
      ]);

      const parsedTargets = Array.isArray(targetData)
        ? (targetData as AssignmentTarget[])
        : [];
      const classTargetIds = [
        ...new Set(
          parsedTargets
            .filter((target) => target.targetType === "class")
            .map((target) => target.targetId)
        ),
      ];

      const [resultData, classStudentsData] = await Promise.all([
        api.assignments.getAssignmentResults(assignmentId).catch(() => []),
        Promise.all(
          classTargetIds.map(async (classId) => {
            const studentsData = await api.classes
              .getClassStudents(classId)
              .catch(() => []);
            return {
              classId,
              students: Array.isArray(studentsData)
                ? (studentsData as ClassEnrollment[])
                : [],
            };
          })
        ),
      ]);

      setAssignment(assignmentData as AssignmentDetail);
      setTargets(parsedTargets);
      setClasses(Array.isArray(classesData) ? (classesData as ClassItem[]) : []);
      setAssignmentResults(
        Array.isArray(resultData) ? (resultData as AssignmentResultRow[]) : []
      );
      setClassStudentsMap(
        Object.fromEntries(
          classStudentsData.map((item) => [item.classId, item.students])
        )
      );
    } catch (error) {
      console.error("Failed to load assignment workspace:", error);
      toast.error("Không thể tải workspace phân tích");
    } finally {
      setLoading(false);
    }
  }, [assignmentId, canReadWorkspace]);

  useEffect(() => {
    if (!userLoading) {
      fetchWorkspaceData();
    }
  }, [userLoading, fetchWorkspaceData]);

  const classMap = useMemo(() => {
    return new Map(classes.map((item) => [item.id, item]));
  }, [classes]);

  const studentClassLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(classStudentsMap).forEach(([classId, enrollments]) => {
      const classInfo = classMap.get(classId);
      const classLabel = classInfo
        ? `${classInfo.className} - Khối ${classInfo.gradeLevel}`
        : classId;
      enrollments.forEach((enrollment) => {
        if (!map.has(enrollment.student.id)) {
          map.set(enrollment.student.id, classLabel);
        }
      });
    });
    return map;
  }, [classStudentsMap, classMap]);

  const workspaceRows = useMemo(() => {
    return assignmentResults
      .map((row) => {
        const submittedAt = row.studentAssignment.submittedTime || null;
        const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;
        const isLate =
          Boolean(submittedAt) &&
          Boolean(dueDate) &&
          new Date(submittedAt as string).getTime() > dueDate!.getTime();
        const submissionStatus = !submittedAt
          ? "chua_nop"
          : isLate
            ? "tre_han"
            : "dung_han";

        return {
          ...row,
          studentName:
            row.student?.fullName ||
            `Học sinh ${row.studentAssignment.studentId.slice(0, 8)}`,
          classLabel:
            studentClassLabelMap.get(row.studentAssignment.studentId) || "—",
          submittedAt,
          isLate,
          submissionStatus,
          score:
            row.studentAssignment.status === "graded" && row.result
              ? row.result.totalScore
              : null,
          maxScore:
            row.studentAssignment.status === "graded" && row.result
              ? row.result.maxScore || 10
              : 10,
        };
      })
      .sort((a, b) => {
        const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [assignmentResults, assignment?.dueDate, studentClassLabelMap]);

  const summary = useMemo(() => {
    const total = workspaceRows.length;
    const submitted = workspaceRows.filter((row) => Boolean(row.submittedAt)).length;
    const waitingGrade = workspaceRows.filter(
      (row) => row.studentAssignment.status === "submitted"
    ).length;
    const graded = workspaceRows.filter(
      (row) => row.studentAssignment.status === "graded"
    ).length;
    const aiFailed = workspaceRows.filter(
      (row) => row.aiSuggestion?.status === "failed"
    ).length;
    const gradedRows = workspaceRows.filter((row) => typeof row.score === "number");
    const avgScore =
      gradedRows.length > 0
        ? Number(
            (
              gradedRows.reduce((sum, row) => sum + Number(row.score || 0), 0) /
              gradedRows.length
            ).toFixed(2)
          )
        : 0;

    return {
      total,
      submitted,
      waitingGrade,
      graded,
      aiFailed,
      avgScore,
    };
  }, [workspaceRows]);

  const classAnalytics = useMemo(() => {
    const classTargets = targets.filter((target) => target.targetType === "class");
    const rowsByStudentId = new Map<string, (typeof workspaceRows)[number]>();
    workspaceRows.forEach((row) => {
      rowsByStudentId.set(row.studentAssignment.studentId, row);
    });

    return classTargets
      .map((target) => {
        const classInfo = classMap.get(target.targetId);
        if (!classInfo) return null;

        const enrollments = classStudentsMap[target.targetId] || [];
        const activeStudents = enrollments.filter(
          (enrollment) => enrollment.status === "active"
        );
        const studentRows = activeStudents
          .map((enrollment) => rowsByStudentId.get(enrollment.student.id))
          .filter((row): row is (typeof workspaceRows)[number] => Boolean(row));

        const assignedStudents = studentRows.length;
        const submittedStudents = studentRows.filter((row) => row.submittedAt).length;
        const gradedStudents = studentRows.filter(
          (row) => row.studentAssignment.status === "graded"
        ).length;
        const waitingGrade = studentRows.filter(
          (row) => row.studentAssignment.status === "submitted"
        ).length;
        const aiFailed = studentRows.filter(
          (row) => row.aiSuggestion?.status === "failed"
        ).length;
        const scoredRows = studentRows.filter((row) => typeof row.score === "number");
        const avgScore =
          scoredRows.length > 0
            ? Number(
                (
                  scoredRows.reduce((sum, row) => sum + Number(row.score || 0), 0) /
                  scoredRows.length
                ).toFixed(2)
              )
            : 0;
        const completionRate =
          assignedStudents > 0
            ? Math.round((submittedStudents / assignedStudents) * 100)
            : 0;

        const classRow: ClassAnalyticsRow = {
          classId: classInfo.id,
          classLabel: `${classInfo.className} - Khối ${classInfo.gradeLevel}`,
          assignedStudents,
          submittedStudents,
          gradedStudents,
          waitingGrade,
          avgScore,
          aiFailed,
          completionRate,
        };

        return classRow;
      })
      .filter((item): item is ClassAnalyticsRow => Boolean(item))
      .sort((a, b) => b.completionRate - a.completionRate);
  }, [targets, classMap, classStudentsMap, workspaceRows]);

  const studentsNeedAttention = useMemo(() => {
    return workspaceRows
      .filter((row) => {
        const missingSubmission = !row.submittedAt;
        const waitingTooLong =
          row.studentAssignment.status === "submitted" &&
          row.submittedAt &&
          Date.now() - new Date(row.submittedAt).getTime() > 24 * 60 * 60 * 1000;
        const aiFailed = row.aiSuggestion?.status === "failed";
        return missingSubmission || waitingTooLong || aiFailed;
      })
      .slice(0, 8);
  }, [workspaceRows]);

  const handleExportCsv = () => {
    if (!assignment) return;
    setExporting(true);
    try {
      const headers = [
        "Student Name",
        "Class",
        "Student Status",
        "Submission Time",
        "Deadline Status",
        "Final Score",
        "AI Status",
        "AI Suggested Score",
        "AI Confidence",
      ];

      const rows = workspaceRows.map((row) => [
        row.studentName,
        row.classLabel,
        row.studentAssignment.status,
        row.submittedAt ? new Date(row.submittedAt).toLocaleString("vi-VN") : "",
        row.submissionStatus,
        row.score != null ? `${row.score}/${row.maxScore}` : "",
        row.aiSuggestion?.status || "",
        row.aiSuggestion?.suggestedScore ?? "",
        row.aiSuggestion?.confidence ?? "",
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((value) => csvEscape(value)).join(","))
        .join("\n");

      downloadFile(
        csv,
        `assignment-workspace-${assignment.id}-${Date.now()}.csv`,
        "text/csv;charset=utf-8;"
      );
      toast.success("Đã xuất báo cáo CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = () => {
    if (!assignment) return;
    setExporting(true);
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        assignment: {
          id: assignment.id,
          title: assignment.title,
          assignmentType: assignment.assignmentType,
          dueDate: assignment.dueDate || null,
          aiGradingEnabled: Boolean(assignment.aiGradingEnabled),
        },
        summary,
        classAnalytics,
        students: workspaceRows.map((row) => ({
          studentId: row.studentAssignment.studentId,
          studentName: row.studentName,
          classLabel: row.classLabel,
          status: row.studentAssignment.status,
          submittedAt: row.submittedAt,
          submissionStatus: row.submissionStatus,
          score: row.score,
          maxScore: row.maxScore,
          aiSuggestion: row.aiSuggestion || null,
        })),
      };

      downloadFile(
        JSON.stringify(report, null, 2),
        `assignment-workspace-${assignment.id}-${Date.now()}.json`,
        "application/json;charset=utf-8;"
      );
      toast.success("Đã xuất báo cáo JSON");
    } finally {
      setExporting(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <p className="text-sm text-[#717680]">Đang tải workspace phân tích...</p>
      </div>
    );
  }

  if (!canReadWorkspace) {
    return (
      <div className="bg-white rounded-xl border border-[#e9eaeb] p-6">
        <p className="text-sm text-[#717680]">
          Bạn không có quyền truy cập workspace phân tích này.
        </p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-white rounded-xl border border-[#e9eaeb] p-6">
        <p className="text-sm text-[#717680]">Không tìm thấy bài tập.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/dashboard/assignments/${assignmentId}`}
            className="inline-flex items-center gap-1 text-sm text-[#717680] hover:text-[#181d27]"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại chi tiết bài tập
          </Link>
          <h1 className="text-2xl font-bold text-[#181d27] mt-2">
            Workspace phân tích chấm điểm
          </h1>
          <p className="text-sm text-[#717680] mt-1">
            {assignment.title}
            {assignment.dueDate
              ? ` · Hạn nộp ${new Date(assignment.dueDate).toLocaleString("vi-VN")}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="bordered"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={fetchWorkspaceData}
          >
            Làm mới
          </Button>
          <Button
            variant="bordered"
            isLoading={exporting}
            startContent={<FileDown className="w-4 h-4" />}
            onPress={handleExportCsv}
          >
            Export CSV
          </Button>
          <Button
            color="primary"
            isLoading={exporting}
            startContent={<Download className="w-4 h-4" />}
            onPress={handleExportJson}
          >
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Được giao", value: summary.total, icon: <BarChart3 className="w-4 h-4" /> },
          {
            label: "Đã nộp",
            value: summary.submitted,
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            label: "Chờ chấm",
            value: summary.waitingGrade,
            icon: <Clock3 className="w-4 h-4" />,
          },
          {
            label: "Đã chấm",
            value: summary.graded,
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            label: "AI lỗi",
            value: summary.aiFailed,
            icon: <AlertTriangle className="w-4 h-4" />,
          },
          { label: "Điểm TB", value: summary.avgScore, icon: <BarChart3 className="w-4 h-4" /> },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-[#e9eaeb] p-4">
            <div className="text-xs text-[#717680] inline-flex items-center gap-1">
              {item.icon}
              {item.label}
            </div>
            <div className="text-2xl font-bold text-[#181d27] mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
          <h2 className="font-semibold text-[#181d27] mb-4">Phân tích theo lớp</h2>
          {classAnalytics.length === 0 ? (
            <p className="text-sm text-[#717680]">Chưa có dữ liệu lớp để phân tích.</p>
          ) : (
            <div className="space-y-3">
              {classAnalytics.map((row) => (
                <div key={row.classId} className="rounded-lg border border-[#ececec] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-[#181d27]">{row.classLabel}</div>
                      <div className="text-xs text-[#717680] mt-1">
                        {row.submittedStudents}/{row.assignedStudents} đã nộp ·{" "}
                        {row.waitingGrade} chờ chấm
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">
                        {row.completionRate}%
                      </div>
                      <div className="text-xs text-[#717680]">Hoàn thành</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${row.completionRate}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                    <div>
                      <div className="text-[#717680]">Đã chấm</div>
                      <div className="font-medium text-[#181d27]">{row.gradedStudents}</div>
                    </div>
                    <div>
                      <div className="text-[#717680]">Điểm TB</div>
                      <div className="font-medium text-[#181d27]">{row.avgScore}</div>
                    </div>
                    <div>
                      <div className="text-[#717680]">Chờ chấm</div>
                      <div className="font-medium text-[#181d27]">{row.waitingGrade}</div>
                    </div>
                    <div>
                      <div className="text-[#717680]">AI lỗi</div>
                      <div className="font-medium text-[#181d27]">{row.aiFailed}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
          <h2 className="font-semibold text-[#181d27] mb-4">Học sinh cần chú ý</h2>
          {studentsNeedAttention.length === 0 ? (
            <p className="text-sm text-[#717680]">
              Không có học sinh thuộc nhóm cần theo dõi thêm.
            </p>
          ) : (
            <div className="space-y-2">
              {studentsNeedAttention.map((row) => (
                <div
                  key={row.studentAssignment.id}
                  className="rounded-lg border border-[#ececec] p-3"
                >
                  <div className="font-medium text-[#181d27]">{row.studentName}</div>
                  <div className="text-xs text-[#717680] mt-1">{row.classLabel}</div>
                  <div className="text-xs mt-2 text-[#414651]">
                    {!row.submittedAt
                      ? "Chưa nộp bài."
                      : row.aiSuggestion?.status === "failed"
                        ? "AI chấm lỗi, cần kiểm tra/chấm tay."
                        : "Đã nộp nhưng đang chờ chấm quá 24h."}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
        <h2 className="font-semibold text-[#181d27] mb-4">
          Danh sách chi tiết học sinh
        </h2>
        {workspaceRows.length === 0 ? (
          <p className="text-sm text-[#717680]">Chưa có dữ liệu học sinh được giao bài.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#ececec]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#fafafa]">
                <tr className="text-left text-[#717680] border-b border-[#ececec]">
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4">Trạng thái nộp</th>
                  <th className="py-3 px-4">Bài nộp</th>
                  <th className="py-3 px-4">AI</th>
                  <th className="py-3 px-4">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {workspaceRows.map((row) => (
                  <tr
                    key={row.studentAssignment.id}
                    className="border-b border-[#f2f4f7] last:border-b-0"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#181d27]">{row.studentName}</div>
                      <div className="text-xs text-[#717680] mt-1">
                        {row.classLabel} · {row.student?.email || "Không có email"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          !row.submittedAt
                            ? "bg-gray-100 text-gray-600"
                            : row.isLate
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {row.submittedAt
                          ? row.isLate
                            ? "Nộp trễ"
                            : "Nộp đúng hạn"
                          : "Chưa nộp"}
                      </span>
                      <div className="text-xs text-[#717680] mt-1">
                        {row.submittedAt
                          ? new Date(row.submittedAt).toLocaleString("vi-VN")
                          : "—"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {row.studentAssignment.submissionUrl ? (
                        <a
                          href={row.studentAssignment.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          {row.studentAssignment.submissionName || "Xem file"}
                        </a>
                      ) : (
                        <span className="text-[#717680]">Không có file</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {row.aiSuggestion?.status === "completed" ? (
                        <div>
                          <div className="font-medium text-[#181d27]">
                            {row.aiSuggestion.suggestedScore ?? "—"}/10
                          </div>
                          <div className="text-xs text-[#717680]">
                            Tin cậy {row.aiSuggestion.confidence ?? 0}%
                          </div>
                        </div>
                      ) : row.aiSuggestion?.status === "failed" ? (
                        <span className="text-xs text-red-600">Lỗi chấm AI</span>
                      ) : row.aiSuggestion?.status === "pending" ||
                        row.aiSuggestion?.status === "processing" ? (
                        <span className="text-xs text-[#717680]">Đang xử lý...</span>
                      ) : (
                        <span className="text-xs text-[#717680]">Chưa có gợi ý</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {row.score != null ? (
                        <div className="font-medium text-[#181d27]">
                          {row.score}/{row.maxScore}
                        </div>
                      ) : (
                        <span className="text-[#717680]">Chưa chấm</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
