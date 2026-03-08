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
  isPublished: boolean;
  createdAt: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentMimeType?: string | null;
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
    gradedAt: string;
  } | null;
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
            ? `${row.result.totalScore}/${row.result.maxScore > 0 ? row.result.maxScore : 10}`
            : "Chưa chấm",
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
    setGradeScore(String(row.result?.totalScore ?? 0));
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
      });
      toast.success("Đã chấm bài");
      setIsGradeModalOpen(false);
      setGradingRow(null);
      fetchData();
    } catch (error) {
      console.error("Failed to grade assignment:", error);
      toast.error("Chấm bài thất bại");
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <p className="text-xs text-[#717680]">Đang tải file {submissionProgress}%</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
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
      </div>

      <div className="bg-white rounded-xl border border-[#e9eaeb] p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-[#181d27]">
            Workspace nộp bài & chấm điểm
          </h2>
          <span className="text-xs text-[#717680]">
            {submissionWorkspaceRows.filter((row) => row.submittedAt).length}/
            {submissionWorkspaceRows.length} học sinh đã nộp
          </span>
        </div>

        {submissionWorkspaceRows.length === 0 ? (
          <p className="text-sm text-[#717680]">Chưa có dữ liệu học sinh được giao bài.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[#717680] border-b border-[#ececec]">
                  <th className="py-2 pr-3">Học sinh</th>
                  <th className="py-2 pr-3">Lớp</th>
                  <th className="py-2 pr-3">Thời gian nộp</th>
                  <th className="py-2 pr-3">Trạng thái hạn</th>
                  <th className="py-2 pr-3">Bài nộp</th>
                  <th className="py-2 pr-3">Điểm</th>
                  <th className="py-2 text-right">Chấm bài</th>
                </tr>
              </thead>
              <tbody>
                {submissionWorkspaceRows.map((row) => (
                  <tr key={row.studentAssignment.id} className="border-b border-[#f2f4f7]">
                    <td className="py-3 pr-3">
                      <div className="font-medium text-[#181d27]">{row.studentName}</div>
                      <div className="text-xs text-[#717680]">{row.student?.email || "—"}</div>
                    </td>
                    <td className="py-3 pr-3 text-[#414651]">{row.classLabel}</td>
                    <td className="py-3 pr-3 text-[#414651]">
                      {row.submittedAt
                        ? new Date(row.submittedAt).toLocaleString("vi-VN")
                        : "Chưa nộp"}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          !row.submittedAt
                            ? "bg-gray-100 text-gray-600"
                            : row.isLate
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {row.submissionStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
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
                        <span className="text-[#717680]">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-[#181d27]">{row.scoreLabel}</td>
                    <td className="py-3 text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Chấm bài tập</ModalHeader>
              <ModalBody>
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
