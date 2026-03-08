"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  CircleCheck,
  BarChart3,
  CheckCheck,
  Send,
  Clock3,
  FileText,
  Upload,
  Download,
  ExternalLink,
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
  aiGradingEnabled?: boolean;
  gradingRubric?: string | null;
  dueDate?: string | null;
  isPublished: boolean;
  createdAt: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentMimeType?: string | null;
}

interface AiSuggestion {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  provider?: string | null;
  model?: string | null;
  suggestedScore?: number | null;
  feedback?: string | null;
  criteriaBreakdown?: unknown;
  confidence?: number | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

interface AssignmentTarget {
  id: string;
  assignmentId: string;
  targetType: "student" | "class" | "group" | "auto" | "section";
  targetId: string;
  assignedBy: string;
  assignedAt: string;
}

interface ClassItem {
  id: string;
  className: string;
  gradeLevel: number;
  schoolYear: string;
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
type StudentDisplayStatus = "pending" | "done" | "overdue";

interface AssignmentResultRow {
  studentAssignment: {
    id: string;
    studentId: string;
    assignmentId: string;
    status: StudentAssignmentStatus;
    startTime?: string | null;
    submittedTime?: string | null;
    submissionUrl?: string | null;
    submissionName?: string | null;
    submissionMimeType?: string | null;
    createdAt?: string;
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
    timeSpent: number;
    gradingSource?: "manual" | "ai_approved";
    approvedBy?: string | null;
    approvalNote?: string | null;
    gradedAt: string;
  } | null;
  aiSuggestion?: AiSuggestion | null;
}

interface StudentAssignmentDetail {
  id: string;
  studentId: string;
  assignmentId: string;
  status: StudentAssignmentStatus;
  startTime?: string | null;
  submittedTime?: string | null;
  submissionUrl?: string | null;
  submissionName?: string | null;
  submissionMimeType?: string | null;
  result?: {
    totalScore: number;
    maxScore: number;
    accuracy: number;
    gradingSource?: "manual" | "ai_approved";
    approvalNote?: string | null;
    gradedAt: string;
  } | null;
}

interface ClassPerformance {
  classId: string;
  className: string;
  gradeLevel: number;
  totalStudents: number;
  assignedStudents: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  graded: number;
  completionRate: number;
  averageAccuracy: number;
}

interface CriteriaBreakdownItem {
  criterion: string;
  score: number;
  maxScore: number;
  comment?: string;
}

function getTypeLabel(type: AssignmentType) {
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
  status: StudentAssignmentStatus,
  dueDate?: string | null
): StudentDisplayStatus {
  if (status === "submitted" || status === "graded") return "done";
  if (dueDate && new Date(dueDate).getTime() < Date.now()) return "overdue";
  return "pending";
}

function getStudentDisplayStatusLabel(status: StudentDisplayStatus) {
  switch (status) {
    case "done":
      return "Đã làm";
    case "overdue":
      return "Trễ hạn";
    default:
      return "Chưa làm";
  }
}

function parseCriteriaBreakdown(data: unknown): CriteriaBreakdownItem[] {
  if (!data) return [];

  let source: unknown = data;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item): CriteriaBreakdownItem | null => {
      if (!item || typeof item !== "object") return null;

      const rawCriterion = (item as { criterion?: unknown }).criterion;
      const rawScore = (item as { score?: unknown }).score;
      const rawMaxScore = (item as { maxScore?: unknown }).maxScore;
      const rawComment = (item as { comment?: unknown }).comment;

      const criterion =
        typeof rawCriterion === "string" ? rawCriterion.trim() : "";
      const score = Number(rawScore);
      const maxScore = Number(rawMaxScore);

      if (!criterion || !Number.isFinite(score) || !Number.isFinite(maxScore)) {
        return null;
      }

      return {
        criterion,
        score: Number(score.toFixed(2)),
        maxScore: Number(maxScore.toFixed(2)),
        comment:
          typeof rawComment === "string" && rawComment.trim()
            ? rawComment.trim()
            : undefined,
      };
    })
    .filter((item): item is CriteriaBreakdownItem => Boolean(item));
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [targets, setTargets] = useState<AssignmentTarget[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResultRow[]>(
    []
  );
  const [classStudentsMap, setClassStudentsMap] = useState<
    Record<string, ClassEnrollment[]>
  >({});
  const [studentAssignment, setStudentAssignment] =
    useState<StudentAssignmentDetail | null>(null);
  const [submissionUpload, setSubmissionUpload] = useState<{
    url: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [uploadingSubmission, setUploadingSubmission] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradingRow, setGradingRow] = useState<AssignmentResultRow | null>(null);
  const [gradeScore, setGradeScore] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState<
    "all" | "missing" | "pending" | "graded"
  >("all");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [workspacePage, setWorkspacePage] = useState(1);

  const role = user?.role?.toLowerCase() || "";
  const isStudent = role === "student";
  const canRead = role === "teacher" || role === "admin" || isStudent;
  const canAssign = role === "teacher";

  const fetchData = useCallback(async () => {
    if (!assignmentId || !canRead) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (isStudent && user) {
        const [assignmentData, studentAssignmentData] = await Promise.all([
          api.assignments.getByIdWithDetails(assignmentId),
          api.assignments
            .getStudentAssignment(user.id, assignmentId)
            .catch(() => null),
        ]);

        setAssignment(assignmentData as AssignmentDetail);
        setStudentAssignment(studentAssignmentData as StudentAssignmentDetail | null);
        setTargets([]);
        setClasses([]);
        setAssignmentResults([]);
        setClassStudentsMap({});
        return;
      }

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
      setStudentAssignment(null);
    } catch (error) {
      console.error("Failed to fetch assignment detail:", error);
      toast.error("Không thể tải chi tiết bài tập");
    } finally {
      setLoading(false);
    }
  }, [assignmentId, canRead, isStudent, user]);

  useEffect(() => {
    if (!userLoading) {
      fetchData();
    }
  }, [userLoading, fetchData]);

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

  const targetClassIds = useMemo(() => {
    return new Set(
      targets.filter((target) => target.targetType === "class").map((target) => target.targetId)
    );
  }, [targets]);

  const availableClasses = useMemo(() => {
    return classes.filter((classItem) => !targetClassIds.has(classItem.id));
  }, [classes, targetClassIds]);
  const canShowAssignButton = canAssign && targets.length === 0 && availableClasses.length > 0;

  const timelineItems = useMemo(() => {
    return [...targets].sort(
      (a, b) =>
        new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );
  }, [targets]);

  const submissionWorkspaceRows = useMemo(() => {
    return assignmentResults
      .map((row) => {
        const submittedAt = row.studentAssignment.submittedTime || null;
        const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;
        const isLate =
          Boolean(submittedAt) &&
          Boolean(dueDate) &&
          new Date(submittedAt as string).getTime() > dueDate!.getTime();
        const submissionStatus = !submittedAt
          ? "Chưa nộp"
          : isLate
            ? "Trễ hạn"
            : "Đúng hạn";

        return {
          ...row,
          studentName:
            row.student?.fullName ||
            `Học sinh ${row.studentAssignment.studentId.slice(0, 8)}`,
          classLabel:
            studentClassLabelMap.get(row.studentAssignment.studentId) || "—",
          submittedAt,
          submissionStatus,
          isLate,
          scoreLabel: row.result
            && row.studentAssignment.status === "graded"
            ? `${row.result.totalScore}/${row.result.maxScore > 0 ? row.result.maxScore : 10}`
            : "Chưa chấm",
          aiSuggestionStatus: row.aiSuggestion?.status || "none",
          aiSuggestedScore:
            row.aiSuggestion?.status === "completed" &&
            typeof row.aiSuggestion.suggestedScore === "number"
              ? `${row.aiSuggestion.suggestedScore}/10`
              : "—",
          canGrade:
            row.studentAssignment.status === "submitted" ||
            row.studentAssignment.status === "graded",
        };
      })
      .sort((a, b) => {
        const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [assignmentResults, assignment?.dueDate, studentClassLabelMap]);

  const filteredWorkspaceRows = useMemo(() => {
    if (workspaceFilter === "all") {
      return submissionWorkspaceRows;
    }
    if (workspaceFilter === "missing") {
      return submissionWorkspaceRows.filter((row) => !row.submittedAt);
    }
    if (workspaceFilter === "pending") {
      return submissionWorkspaceRows.filter(
        (row) => row.studentAssignment.status === "submitted"
      );
    }
    return submissionWorkspaceRows.filter(
      (row) => row.studentAssignment.status === "graded"
    );
  }, [submissionWorkspaceRows, workspaceFilter]);

  const searchableWorkspaceRows = useMemo(() => {
    const keyword = workspaceSearch.trim().toLowerCase();
    if (!keyword) {
      return filteredWorkspaceRows;
    }

    return filteredWorkspaceRows.filter((row) => {
      const haystack = [
        row.studentName,
        row.student?.email || "",
        row.classLabel,
        row.studentAssignment.submissionName || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [filteredWorkspaceRows, workspaceSearch]);

  const workspacePageSize = 8;
  const workspaceTotalPages = Math.max(
    1,
    Math.ceil(searchableWorkspaceRows.length / workspacePageSize)
  );

  const pagedWorkspaceRows = useMemo(() => {
    const start = (workspacePage - 1) * workspacePageSize;
    return searchableWorkspaceRows.slice(start, start + workspacePageSize);
  }, [searchableWorkspaceRows, workspacePage]);

  useEffect(() => {
    setWorkspacePage(1);
  }, [workspaceFilter, workspaceSearch]);

  const aiCriteriaItems = useMemo(
    () => parseCriteriaBreakdown(gradingRow?.aiSuggestion?.criteriaBreakdown),
    [gradingRow?.aiSuggestion?.criteriaBreakdown]
  );

  const classPerformance = useMemo(() => {
    const classTargets = targets.filter((target) => target.targetType === "class");
    const resultsByStudent = new Map<string, AssignmentResultRow>();

    assignmentResults.forEach((row) => {
      resultsByStudent.set(row.studentAssignment.studentId, row);
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
          .map((enrollment) => resultsByStudent.get(enrollment.student.id))
          .filter((row): row is AssignmentResultRow => Boolean(row));

        const assignedStudents = studentRows.length;
        const notStarted = studentRows.filter(
          (row) => row.studentAssignment.status === "not_started"
        ).length;
        const inProgress = studentRows.filter(
          (row) => row.studentAssignment.status === "in_progress"
        ).length;
        const submitted = studentRows.filter(
          (row) => row.studentAssignment.status === "submitted"
        ).length;
        const graded = studentRows.filter(
          (row) => row.studentAssignment.status === "graded"
        ).length;
        const completionRate =
          assignedStudents > 0
            ? Math.round(((submitted + graded) / assignedStudents) * 100)
            : 0;
        const gradedRows = studentRows.filter((row) => row.result);
        const averageAccuracy =
          gradedRows.length > 0
            ? Math.round(
                gradedRows.reduce(
                  (total, row) => total + Number(row.result?.accuracy || 0),
                  0
                ) / gradedRows.length
              )
            : 0;

        const stats: ClassPerformance = {
          classId: classInfo.id,
          className: classInfo.className,
          gradeLevel: classInfo.gradeLevel,
          totalStudents: activeStudents.length,
          assignedStudents,
          notStarted,
          inProgress,
          submitted,
          graded,
          completionRate,
          averageAccuracy,
        };

        return stats;
      })
      .filter((item): item is ClassPerformance => Boolean(item));
  }, [targets, classMap, classStudentsMap, assignmentResults]);

  const overviewStats = useMemo(() => {
    const assigned = classPerformance.reduce(
      (total, item) => total + item.assignedStudents,
      0
    );
    const submitted = classPerformance.reduce(
      (total, item) => total + item.submitted,
      0
    );
    const graded = classPerformance.reduce((total, item) => total + item.graded, 0);
    const gradedClasses = classPerformance.filter(
      (item) => item.averageAccuracy > 0
    );
    const avgAccuracy =
      gradedClasses.length > 0
        ? Math.round(
            gradedClasses.reduce(
              (total, item) => total + item.averageAccuracy,
              0
            ) / gradedClasses.length
          )
        : 0;

    return {
      assigned,
      submitted,
      graded,
      avgAccuracy,
    };
  }, [classPerformance]);

  const handleAssignToClass = async () => {
    if (!assignment || !user || !selectedClassId) {
      toast.error("Vui lòng chọn lớp");
      return;
    }

    try {
      setSubmitting(true);
      await api.assignments.createTarget({
        assignmentId: assignment.id,
        targetType: "class",
        targetId: selectedClassId,
        assignedBy: user.id,
      });
      toast.success("Đã giao bài tập cho lớp");
      setIsAssignModalOpen(false);
      setSelectedClassId("");
      fetchData();
    } catch (error) {
      console.error("Failed to assign class target:", error);
      toast.error("Giao bài tập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTarget = async (targetId: string) => {
    try {
      setSubmitting(true);
      await api.assignments.removeTarget(targetId);
      toast.success("Đã gỡ target giao bài");
      fetchData();
    } catch (error) {
      console.error("Failed to remove assignment target:", error);
      toast.error("Không thể gỡ target");
    } finally {
      setSubmitting(false);
    }
  };

  const openGradeModal = (row: AssignmentResultRow) => {
    setGradingRow(row);
    const aiSuggestionScore =
      row.aiSuggestion?.status === "completed"
        ? row.aiSuggestion.suggestedScore
        : null;
    const defaultScore =
      row.result?.totalScore ?? (typeof aiSuggestionScore === "number" ? aiSuggestionScore : 0);
    setGradeScore(String(defaultScore));
    setApprovalNote(row.result?.approvalNote || "");
    setIsGradeModalOpen(true);
  };

  const handleGradeSubmission = async () => {
    if (!gradingRow) return;

    const totalScore = Number(gradeScore);
    if (!Number.isFinite(totalScore) || totalScore < 0 || totalScore > 10) {
      toast.error("Điểm không hợp lệ");
      return;
    }

    try {
      setSubmitting(true);
      await api.assignments.gradeStudentAssignment(gradingRow.studentAssignment.id, {
        totalScore,
        gradingSource:
          gradingRow.aiSuggestion?.status === "completed"
            ? "ai_approved"
            : "manual",
        approvalNote: approvalNote.trim() || undefined,
      });
      toast.success("Đã chấm bài");
      setIsGradeModalOpen(false);
      setGradingRow(null);
      setApprovalNote("");
      fetchData();
    } catch (error) {
      console.error("Failed to grade assignment:", error);
      toast.error("Chấm bài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegradeAi = async (studentAssignmentId: string) => {
    try {
      setSubmitting(true);
      await api.assignments.regradeAi(studentAssignmentId);
      toast.success("Đã đưa bài vào hàng đợi chấm AI");
      fetchData();
    } catch (error) {
      console.error("Failed to regrade with AI:", error);
      toast.error("Không thể chấm lại bằng AI");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSubmission = async (file: File | null) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "doc", "docx"];
    if (!allowedExtensions.includes(extension || "")) {
      toast.error("Chỉ hỗ trợ PDF, DOC, DOCX");
      return;
    }

    try {
      setUploadingSubmission(true);
      setSubmissionProgress(0);
      const uploaded = await api.upload.document(file, setSubmissionProgress);
      setSubmissionUpload({
        url: uploaded.url,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
      });
      toast.success("Đã tải file bài nộp");
    } catch (error) {
      console.error("Failed to upload submission:", error);
      toast.error("Không thể tải file nộp bài");
    } finally {
      setUploadingSubmission(false);
    }
  };

  const handleSubmitAssignmentFile = async () => {
    if (!studentAssignment) {
      toast.error("Bạn chưa được giao bài tập này");
      return;
    }
    if (!submissionUpload?.url) {
      toast.error("Vui lòng tải file bài nộp trước");
      return;
    }

    try {
      setSubmitting(true);
      await api.assignments.submitAssignment({
        studentAssignmentId: studentAssignment.id,
        answers: [],
        submissionUrl: submissionUpload.url,
        submissionName: submissionUpload.name,
        submissionMimeType: submissionUpload.mimeType,
      });
      toast.success("Nộp bài thành công");
      setSubmissionUpload(null);
      setSubmissionProgress(0);
      fetchData();
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast.error("Nộp bài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <p className="text-sm text-[#717680]">Đang tải chi tiết bài tập...</p>
      </div>
    );
  }

  if (!assignment || !canRead) {
    return (
      <div className="bg-white rounded-xl border border-[#e9eaeb] p-6">
        <p className="text-sm text-[#717680]">
          Không tìm thấy bài tập hoặc bạn không có quyền truy cập.
        </p>
      </div>
    );
  }

  if (isStudent) {
    const status = studentAssignment?.status || "not_started";
    const isSubmissionLocked = status === "submitted" || status === "graded";
    const displayStatus = getStudentDisplayStatus(status, assignment.dueDate);
    const statusStyle =
      displayStatus === "done"
        ? "bg-green-50 text-green-700"
        : displayStatus === "overdue"
          ? "bg-red-50 text-red-700"
          : status === "in_progress"
            ? "bg-yellow-50 text-yellow-700"
            : "bg-gray-100 text-gray-600";

    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/assignments"
            className="inline-flex items-center gap-1 text-sm text-[#717680] hover:text-[#181d27]"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          <h1 className="text-2xl font-bold text-[#181d27] mt-2">{assignment.title}</h1>
          <p className="text-sm text-[#717680] mt-1">
            {assignment.description || "Không có mô tả"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
            <div className="text-sm text-[#717680]">Loại bài tập</div>
            <div className="text-lg font-semibold text-[#181d27] mt-1">
              {getTypeLabel(assignment.assignmentType)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
            <div className="text-sm text-[#717680]">Hạn nộp</div>
            <div className="text-sm font-semibold text-[#181d27] mt-1">
              {assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleString("vi-VN")
                : "Không đặt hạn"}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
            <div className="text-sm text-[#717680]">Trạng thái của bạn</div>
            <span className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs ${statusStyle}`}>
              {getStudentDisplayStatusLabel(displayStatus)}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
            <div className="text-sm text-[#717680]">Kết quả cuối</div>
            {studentAssignment?.status === "graded" && studentAssignment?.result ? (
              <div>
                <div className="text-lg font-semibold text-[#181d27] mt-1">
                  {studentAssignment.result.totalScore}/
                  {studentAssignment.result.maxScore || 10}
                </div>
                <p className="text-xs text-[#717680] mt-1">
                  {studentAssignment.result.approvalNote || "Giáo viên đã chấm điểm"}
                </p>
              </div>
            ) : studentAssignment?.status === "submitted" ? (
              <div>
                <div className="text-sm font-medium text-[#181d27] mt-1">
                  Đang chấm
                </div>
                <p className="text-xs text-[#717680] mt-1">
                  Giáo viên đang chấm bài của bạn.
                </p>
              </div>
            ) : (
              <div className="text-sm text-[#717680] mt-1">Chưa có điểm</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
            <h2 className="font-semibold text-[#181d27] mb-3">Đề bài</h2>
            {assignment.attachmentUrl ? (
              <div className="space-y-3">
                <div className="border border-[#ececec] rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-[#181d27]">
                        {assignment.attachmentName || "Tệp bài tập"}
                      </div>
                      <div className="text-xs text-[#717680] mt-1">
                        {assignment.attachmentMimeType || "application/octet-stream"}
                      </div>
                    </div>
                  </div>

                  <a
                    href={assignment.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Mở file ở tab mới
                  </a>
                </div>

              </div>
            ) : (
              <p className="text-sm text-[#717680]">Giáo viên chưa đính kèm file đề bài.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#e9eaeb] p-5 space-y-4">
            <h2 className="font-semibold text-[#181d27]">Nộp bài tập</h2>

            {!studentAssignment ? (
              <p className="text-sm text-[#717680]">
                Bạn chưa được giao bài tập này, không thể nộp bài.
              </p>
            ) : (
              <>
                {studentAssignment.submissionUrl ? (
                  <div className="border border-[#ececec] rounded-lg p-3">
                    <div className="text-xs text-[#717680]">Bài đã nộp</div>
                    <a
                      href={studentAssignment.submissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      {studentAssignment.submissionName || "Xem file đã nộp"}
                    </a>
                    {studentAssignment.submittedTime ? (
                      <div className="text-xs text-[#717680] mt-2">
                        Nộp lúc{" "}
                        {new Date(studentAssignment.submittedTime).toLocaleString("vi-VN")}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {isSubmissionLocked ? (
                  <div className="rounded-lg border border-[#ececec] bg-[#fafafa] p-3 text-sm text-[#414651]">
                    {status === "graded"
                      ? "Bài nộp đã được giáo viên chấm điểm."
                      : "Bạn đã nộp bài. Vui lòng chờ giáo viên chấm điểm."}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#414651]">
                        Upload file bài nộp (PDF/DOC/DOCX)
                      </label>
                      <label className="inline-flex items-center gap-2 px-3 h-10 rounded-xl border border-[#d5d7da] text-sm text-[#414651] cursor-pointer hover:bg-[#f9fafb]">
                        <Upload className="w-4 h-4" />
                        Chọn file
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            void handleUploadSubmission(file);
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                      {uploadingSubmission ? (
                        <p className="text-xs text-[#717680]">
                          Đang tải file {submissionProgress}%
                        </p>
                      ) : null}
                      {submissionUpload ? (
                        <div className="text-sm text-[#414651]">
                          Đã chọn: <span className="font-medium">{submissionUpload.name}</span>
                        </div>
                      ) : null}
                    </div>

                    <Button
                      color="primary"
                      isLoading={submitting}
                      isDisabled={!submissionUpload || uploadingSubmission}
                      onPress={handleSubmitAssignmentFile}
                    >
                      Nộp bài
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/assignments"
            className="inline-flex items-center gap-1 text-sm text-[#717680] hover:text-[#181d27]"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          <h1 className="text-2xl font-bold text-[#181d27] mt-2">{assignment.title}</h1>
          <p className="text-sm text-[#717680] mt-1">
            {assignment.description || "Không có mô tả"}
          </p>
        </div>
        {canShowAssignButton ? (
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => setIsAssignModalOpen(true)}
          >
            Giao cho lớp
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
          <div className="text-sm text-[#717680]">Loại bài tập</div>
          <div className="text-lg font-semibold text-[#181d27] mt-1">
            {getTypeLabel(assignment.assignmentType)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
          <div className="text-sm text-[#717680]">File đính kèm</div>
          <div className="text-lg font-semibold text-[#181d27] mt-1">
            {assignment.attachmentUrl ? "Có file" : "Không có"}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
          <div className="text-sm text-[#717680]">Hạn nộp</div>
          <div className="text-sm font-semibold text-[#181d27] mt-1">
            {assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleString("vi-VN")
              : "Không đặt hạn"}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
          <div className="text-sm text-[#717680]">Trạng thái</div>
          <div
            className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs ${
              assignment.isPublished
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <CircleCheck className="w-3 h-3" />
            {assignment.isPublished ? "Đã xuất bản" : "Bản nháp"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 items-start">
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
            <h2 className="font-semibold text-[#181d27] mb-3">Nội dung bài tập</h2>
            {assignment.attachmentUrl ? (
              <div className="border border-[#ececec] rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-[#181d27]">
                      {assignment.attachmentName || "Tệp bài tập"}
                    </div>
                    <div className="text-xs text-[#717680] mt-1">
                      {assignment.attachmentMimeType || "application/octet-stream"}
                    </div>
                  </div>
                </div>
                <a
                  href={assignment.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Mở file bài tập
                </a>
              </div>
            ) : (
              <p className="text-sm text-[#717680]">
                Chưa có file đính kèm. Giáo viên có thể cập nhật sau.
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
              <h2 className="font-semibold text-[#181d27] mb-4">
                Thống kê theo lớp
              </h2>
              {classPerformance.length === 0 ? (
                <p className="text-sm text-[#717680]">
                  Chưa có dữ liệu lớp để thống kê.
                </p>
              ) : (
                <div className="space-y-3">
                  {classPerformance.map((item) => (
                    <div
                      key={item.classId}
                      className="border border-[#ececec] rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-[#181d27]">
                            {item.className} - Khối {item.gradeLevel}
                          </div>
                          <div className="text-xs text-[#717680] mt-1">
                            {item.assignedStudents}/{item.totalStudents} học sinh có assignment
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {item.completionRate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden mt-3">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.completionRate}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                        <div>
                          <div className="text-[#717680]">Chưa làm</div>
                          <div className="font-medium text-[#181d27]">
                            {item.notStarted}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#717680]">Đang làm</div>
                          <div className="font-medium text-[#181d27]">
                            {item.inProgress}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#717680]">Đã nộp</div>
                          <div className="font-medium text-[#181d27]">
                            {item.submitted}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#717680]">Điểm TB</div>
                          <div className="font-medium text-[#181d27]">
                            {item.averageAccuracy}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
              <div className="text-xs text-[#717680] flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Được giao
              </div>
              <div className="text-2xl font-bold text-[#181d27] mt-1">
                {overviewStats.assigned}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
              <div className="text-xs text-[#717680] flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                Đã nộp
              </div>
              <div className="text-2xl font-bold text-[#181d27] mt-1">
                {overviewStats.submitted}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
              <div className="text-xs text-[#717680] flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" />
                Đã chấm
              </div>
              <div className="text-2xl font-bold text-[#181d27] mt-1">
                {overviewStats.graded}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#e9eaeb] p-4">
              <div className="text-xs text-[#717680] flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                Accuracy TB
              </div>
              <div className="text-2xl font-bold text-[#181d27] mt-1">
                {overviewStats.avgAccuracy}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
            <h2 className="font-semibold text-[#181d27] mb-4">
              Timeline giao bài
            </h2>
            {timelineItems.length === 0 ? (
              <p className="text-sm text-[#717680]">Chưa giao cho đối tượng nào.</p>
            ) : (
              <div className="space-y-3">
                {timelineItems.map((target, index) => {
                  const classInfo =
                    target.targetType === "class"
                      ? classMap.get(target.targetId)
                      : null;
                  const label =
                    target.targetType === "class" && classInfo
                      ? `${classInfo.className} - Khối ${classInfo.gradeLevel}`
                      : `${target.targetType}: ${target.targetId}`;

                  return (
                    <div key={target.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1" />
                        {index < timelineItems.length - 1 ? (
                          <span className="w-px h-full bg-[#e9eaeb]" />
                        ) : null}
                      </div>
                      <div className="flex-1 border border-[#ececec] rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium text-[#181d27]">
                              {label}
                            </div>
                            <div className="text-xs text-[#717680] mt-1 inline-flex items-center gap-1">
                              <Clock3 className="w-3.5 h-3.5" />
                              {new Date(target.assignedAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                          {canAssign ? (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              isDisabled={submitting}
                              onPress={() => handleRemoveTarget(target.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-[#181d27]">Workspace chấm điểm nhanh</h2>
            <p className="text-xs text-[#717680] mt-1">
              {submissionWorkspaceRows.filter((row) => row.submittedAt).length}/
              {submissionWorkspaceRows.length} học sinh đã nộp bài
            </p>
          </div>
          <Link
            href={`/dashboard/assignments/${assignmentId}/workspace`}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#d5d7da] text-sm text-[#414651] hover:bg-[#f9fafb]"
          >
            <BarChart3 className="w-4 h-4" />
            Mở workspace phân tích
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: `Tất cả (${submissionWorkspaceRows.length})` },
              {
                key: "missing",
                label: `Chưa nộp (${submissionWorkspaceRows.filter((row) => !row.submittedAt).length})`,
              },
              {
                key: "pending",
                label: `Chờ chấm (${submissionWorkspaceRows.filter((row) => row.studentAssignment.status === "submitted").length})`,
              },
              {
                key: "graded",
                label: `Đã chấm (${submissionWorkspaceRows.filter((row) => row.studentAssignment.status === "graded").length})`,
              },
            ].map((item) => {
              const active = workspaceFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setWorkspaceFilter(
                      item.key as "all" | "missing" | "pending" | "graded"
                    )
                  }
                  className={`px-3 h-8 rounded-full text-xs border transition ${
                    active
                      ? "border-primary bg-[#f0ecff] text-primary"
                      : "border-[#e5e7eb] text-[#717680] hover:bg-[#fafafa]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={workspaceSearch}
            onChange={(e) => setWorkspaceSearch(e.target.value)}
            placeholder="Tìm học sinh, lớp, email..."
            className="h-9 w-full sm:w-[280px] rounded-lg border border-[#d5d7da] px-3 text-sm outline-none focus:border-[#b2b5ff]"
          />
        </div>

        {searchableWorkspaceRows.length === 0 ? (
          <p className="text-sm text-[#717680]">
            Không có học sinh phù hợp với bộ lọc hiện tại.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#ececec] max-h-[560px] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#fafafa] sticky top-0 z-10">
                <tr className="text-left text-[#717680] border-b border-[#ececec]">
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4">Nộp bài</th>
                  <th className="py-3 px-4">Bài nộp</th>
                  <th className="py-3 px-4">AI chấm</th>
                  <th className="py-3 px-4">Điểm cuối</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedWorkspaceRows.map((row) => (
                  <tr
                    key={row.studentAssignment.id}
                    className="border-b border-[#f2f4f7] last:border-b-0 hover:bg-[#fcfcfd]"
                  >
                    <td className="py-3 px-4 align-top">
                      <div className="font-medium text-[#181d27]">{row.studentName}</div>
                      <div className="text-xs text-[#717680] mt-1">
                        {row.classLabel} · {row.student?.email || "Không có email"}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          !row.submittedAt
                            ? "bg-gray-100 text-gray-600"
                            : row.isLate
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {row.submissionStatus}
                      </span>
                      <div className="text-xs text-[#717680] mt-2">
                        {row.submittedAt
                          ? new Date(row.submittedAt).toLocaleString("vi-VN")
                          : "Chưa có thời gian nộp"}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      {row.studentAssignment.submissionUrl ? (
                        <a
                          href={row.studentAssignment.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline max-w-[280px]"
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            {row.studentAssignment.submissionName || "Xem file đã nộp"}
                          </span>
                        </a>
                      ) : (
                        <span className="text-[#717680]">Chưa có file</span>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top">
                      {row.aiSuggestionStatus === "completed" ? (
                        <div>
                          <div className="font-medium text-[#181d27]">
                            {row.aiSuggestedScore}
                          </div>
                          <div className="text-xs text-[#717680] mt-1">
                            Tin cậy: {row.aiSuggestion?.confidence ?? 0}%
                          </div>
                        </div>
                      ) : row.aiSuggestionStatus === "failed" ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs bg-red-50 text-red-700">
                          Lỗi AI
                        </span>
                      ) : row.aiSuggestionStatus === "processing" ||
                        row.aiSuggestionStatus === "pending" ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700">
                          Đang xử lý
                        </span>
                      ) : (
                        <span className="text-xs text-[#717680]">Chưa có gợi ý</span>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="font-medium text-[#181d27]">{row.scoreLabel}</div>
                      {row.result?.gradingSource === "ai_approved" ? (
                        <div className="text-xs text-[#717680] mt-1">Đã tham khảo AI</div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-right align-top">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="bordered"
                          isDisabled={!row.canGrade}
                          onPress={() => openGradeModal(row)}
                        >
                          {row.studentAssignment.status === "graded"
                            ? "Chấm lại"
                            : "Chấm điểm"}
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          isDisabled={
                            !assignment?.aiGradingEnabled ||
                            !row.studentAssignment.submissionUrl
                          }
                          onPress={() => handleRegradeAi(row.studentAssignment.id)}
                        >
                          Chấm AI
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {searchableWorkspaceRows.length > 0 ? (
          <div className="flex items-center justify-between mt-3 text-xs text-[#717680]">
            <span>
              Hiển thị {(workspacePage - 1) * workspacePageSize + 1}-
              {Math.min(
                workspacePage * workspacePageSize,
                searchableWorkspaceRows.length
              )}{" "}
              / {searchableWorkspaceRows.length} học sinh
            </span>
            <div className="inline-flex items-center gap-2">
              <Button
                size="sm"
                variant="light"
                isDisabled={workspacePage <= 1}
                onPress={() => setWorkspacePage((prev) => Math.max(1, prev - 1))}
              >
                Trước
              </Button>
              <span>
                Trang {workspacePage}/{workspaceTotalPages}
              </span>
              <Button
                size="sm"
                variant="light"
                isDisabled={workspacePage >= workspaceTotalPages}
                onPress={() =>
                  setWorkspacePage((prev) =>
                    Math.min(workspaceTotalPages, prev + 1)
                  )
                }
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Modal isOpen={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6244F4]" />
                Giao bài tập cho lớp
              </ModalHeader>
              <ModalBody>
                {availableClasses.length === 0 ? (
                  <p className="text-sm text-[#717680]">
                    Tất cả lớp đã được giao bài tập này.
                  </p>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-[#414651]">
                      Chọn lớp
                    </label>
                    <select
                      className="mt-1 w-full border border-[#d5d7da] rounded-xl px-3 py-2 text-sm"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                      <option value="">-- Chọn lớp --</option>
                      {availableClasses.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.className} - Khối {classItem.gradeLevel}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="primary"
                  isLoading={submitting}
                  isDisabled={!selectedClassId}
                  onPress={handleAssignToClass}
                >
                  Xác nhận giao
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
        <ModalContent className="w-[92vw] max-w-5xl">
          {(onClose) => (
            <>
              <ModalHeader>Chấm bài tập</ModalHeader>
              <ModalBody className="max-h-[70vh] overflow-y-auto">
                <div
                  className={`grid gap-4 ${
                    gradingRow?.aiSuggestion?.status === "completed"
                      ? "lg:grid-cols-[0.95fr_1.05fr]"
                      : "grid-cols-1"
                  }`}
                >
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-[#717680]">Học sinh</div>
                      <div className="font-medium text-[#181d27]">
                        {gradingRow?.student?.fullName || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#414651]">
                        Điểm đạt được (0 - 10)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        className="mt-1 w-full border border-[#d5d7da] rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#414651]">
                        Nhận xét chấm (tuỳ chọn)
                      </label>
                      <textarea
                        value={approvalNote}
                        onChange={(e) => setApprovalNote(e.target.value)}
                        className="mt-1 w-full border border-[#d5d7da] rounded-xl px-3 py-2 text-sm min-h-[72px]"
                        placeholder="Ví dụ: Đã điều chỉnh điểm theo cách trình bày và lập luận."
                      />
                    </div>
                  </div>

                  {gradingRow?.aiSuggestion?.status === "completed" ? (
                    <div className="rounded-lg border border-[#ececec] p-3 space-y-2 bg-[#fcfcfd]">
                      <div className="text-sm font-medium text-[#181d27]">
                        Gợi ý từ AI: {gradingRow.aiSuggestion.suggestedScore}/10
                      </div>
                      <p className="text-xs text-[#717680] whitespace-pre-wrap leading-5 max-h-[110px] overflow-y-auto">
                        {gradingRow.aiSuggestion.feedback || "Không có nhận xét"}
                      </p>
                      {aiCriteriaItems.length > 0 ? (
                        <div className="rounded-lg border border-[#ececec] bg-white p-2">
                          <div className="text-xs font-medium text-[#414651] mb-2">
                            Phân rã theo tiêu chí
                          </div>
                          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                            {aiCriteriaItems.map((item, index) => {
                              const progress =
                                item.maxScore > 0
                                  ? Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        Math.round((item.score / item.maxScore) * 100)
                                      )
                                    )
                                  : 0;

                              return (
                                <div
                                  key={`${item.criterion}-${index}`}
                                  className="rounded-md border border-[#ececec] p-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="text-xs font-medium text-[#181d27]">
                                      {index + 1}. {item.criterion}
                                    </div>
                                    <div className="text-xs font-semibold text-[#181d27] whitespace-nowrap">
                                      {item.score}/{item.maxScore}
                                    </div>
                                  </div>
                                  <div className="h-1.5 bg-[#f1f3f7] rounded-full mt-2 overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  {item.comment ? (
                                    <p className="text-[11px] text-[#717680] mt-2 leading-5">
                                      {item.comment}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button color="primary" isLoading={submitting} onPress={handleGradeSubmission}>
                  Lưu điểm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
