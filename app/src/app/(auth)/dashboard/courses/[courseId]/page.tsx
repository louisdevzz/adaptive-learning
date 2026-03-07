"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import PDFSlideViewer from "@/components/ui/PDFSlideViewer";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Trophy,
  Video,
  FileText,
  Play,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lock,
  Clock,
  Target,
  Bookmark,
  Share2,
  GraduationCap,
  Star,
  LayoutList,
  MessageSquare,
  Library,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/react";
import Link from "next/link";

interface KnowledgePoint {
  id: string;
  title: string;
  description: string;
  difficultyLevel: number;
  orderIndex: number;
  content?: {
    slideUrl?: string;
    slideFileName?: string;
    youtubeUrl?: string;
  };
  resources: Resource[];
}

interface Resource {
  id: string;
  resourceType: "video" | "article" | "interactive" | "quiz" | "other";
  url: string;
  title: string;
  description?: string;
  orderIndex: number;
}

interface Section {
  id: string;
  moduleId: string;
  title: string;
  orderIndex: number;
  knowledgePoints: KnowledgePoint[];
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  sections: Section[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subject: string;
  gradeLevel: number;
  modules: Module[];
}

type TabKey = "overview" | "questions" | "resources";
type MediaTabKey = "slide" | "video";

function getDifficultyLabel(level: number): string {
  switch (level) {
    case 1: return "Dễ";
    case 2: return "Trung bình";
    case 3: return "Khá";
    case 4: return "Khó";
    default: return "Rất khó";
  }
}

function getDifficultyClass(level: number): string {
  if (level <= 2) return "bg-green-100 text-green-700";
  if (level === 3) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

/** SVG progress ring */
function ProgressRing({ progress, size = 40, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-200" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-[#6244F4] transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-[#181d27]">{progress}%</span>
      </div>
    </div>
  );
}

export default function CoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKpId, setSelectedKpId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [bookmarkedKps, setBookmarkedKps] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [mediaTab, setMediaTab] = useState<MediaTabKey>("slide");

  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());
  const [retryingQuestions, setRetryingQuestions] = useState<Set<string>>(new Set());
  const [questionAttempts, setQuestionAttempts] = useState<Record<string, { isCorrect: boolean; selectedAnswer: string }>>({});
  const [kpProgress, setKpProgress] = useState<Record<string, { masteryScore: number; confidence: number }>>({});

  const questionStartTimeRefs = useRef<Record<string, number>>({});
  const kpStartTimeRef = useRef<number | null>(null);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);

  // ─── Derived data ──────────────────────────────────────────────────────────
  const allKnowledgePoints = useMemo(() => {
    if (!course) return [];
    const kps: { kp: KnowledgePoint; moduleId: string; sectionId: string }[] = [];
    course.modules.forEach((m) => m.sections.forEach((s) => s.knowledgePoints.forEach((kp) => kps.push({ kp, moduleId: m.id, sectionId: s.id }))));
    return kps;
  }, [course]);

  const currentKp = useMemo(() => {
    if (!selectedKpId) return null;
    return allKnowledgePoints.find((item) => item.kp.id === selectedKpId)?.kp || null;
  }, [selectedKpId, allKnowledgePoints]);

  const currentIndex = useMemo(() => {
    if (!selectedKpId) return -1;
    return allKnowledgePoints.findIndex((item) => item.kp.id === selectedKpId);
  }, [selectedKpId, allKnowledgePoints]);

  const overallProgress = useMemo(() => {
    if (allKnowledgePoints.length === 0) return 0;
    const done = Object.values(kpProgress).filter((p) => p.masteryScore >= 80).length;
    return Math.round((done / allKnowledgePoints.length) * 100);
  }, [kpProgress, allKnowledgePoints.length]);

  const totalKps = allKnowledgePoints.length;
  const completedKps = Object.values(kpProgress).filter((p) => p.masteryScore >= 80).length;

  // ─── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { if (courseId) fetchCourse(); }, [courseId]);

  useEffect(() => {
    const loadAll = async () => {
      if (!course || !user?.id || allKnowledgePoints.length === 0) return;
      const results = await Promise.all(
        allKnowledgePoints.map(async ({ kp }) => {
          try {
            const p = await api.studentProgress.getStudentKpProgress(user.id, kp.id);
            return p ? { kpId: kp.id, progress: { masteryScore: p.masteryScore, confidence: p.confidence } } : null;
          } catch { return null; }
        })
      );
      const map: Record<string, { masteryScore: number; confidence: number }> = {};
      results.forEach((r) => { if (r) map[r.kpId] = r.progress; });
      setKpProgress(map);
    };
    loadAll();
  }, [course, user?.id, allKnowledgePoints.length]);

  useEffect(() => {
    if (course && course.modules.length > 0 && !selectedKpId) {
      const first = course.modules[0];
      setExpandedModules(new Set([first.id]));
      if (first.sections.length > 0) {
        const firstSec = first.sections[0];
        setExpandedSections(new Set([firstSec.id]));
        if (firstSec.knowledgePoints.length > 0) {
          setSelectedKpId(firstSec.knowledgePoints[0].id);
          kpStartTimeRef.current = Date.now();
        }
      }
    }
  }, [course, selectedKpId]);

  useEffect(() => { if (selectedKpId) kpStartTimeRef.current = Date.now(); }, [selectedKpId]);

  useEffect(() => {
    return () => {
      if (kpStartTimeRef.current && selectedKpId && user?.id) {
        const t = Math.round((Date.now() - kpStartTimeRef.current) / 1000);
        if (t >= 5) {
          navigator.sendBeacon?.("/api/student-progress/track-time", new Blob([JSON.stringify({ studentId: user.id, kpId: selectedKpId, timeSpentSeconds: t })], { type: "application/json" }));
        }
      }
    };
  }, [selectedKpId, user?.id]);

  useEffect(() => {
    const fetchTime = async () => {
      if (user?.id) {
        try { const d = await api.studentProgress.getTotalStudyTime(user.id); setTotalStudyTime(d.totalSeconds || 0); }
        catch { /* ignore */ }
      }
    };
    fetchTime();
  }, [user?.id]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getForLearning(courseId as string);
      setCourse(data);
    } catch { toast.error("Không thể tải thông tin khóa học"); }
    finally { setLoading(false); }
  };

  const saveCurrentKpTime = async () => {
    if (kpStartTimeRef.current && selectedKpId && user?.id) {
      const t = Math.round((Date.now() - kpStartTimeRef.current) / 1000);
      if (t >= 5) {
        try {
          await api.studentProgress.trackTimeOnTask({ studentId: user.id, kpId: selectedKpId, timeSpentSeconds: t });
          setTotalStudyTime((prev) => prev + t);
        } catch { /* ignore */ }
      }
    }
  };

  const isKpLocked = (idx: number): boolean => {
    if (idx === 0) return false;
    const prev = allKnowledgePoints[idx - 1];
    if (!prev) return false;
    const pp = kpProgress[prev.kp.id];
    return !pp || pp.masteryScore < 80;
  };

  const handleSelectKp = async (kpId: string) => {
    const idx = allKnowledgePoints.findIndex((item) => item.kp.id === kpId);
    if (idx === -1) return;
    if (isKpLocked(idx)) { toast.warning(`Vui lòng hoàn thành bài trước`); return; }
    await saveCurrentKpTime();
    setSelectedKpId(kpId);
    kpStartTimeRef.current = Date.now();
    const found = allKnowledgePoints.find((item) => item.kp.id === kpId);
    if (found) {
      setExpandedModules((prev) => new Set(prev).add(found.moduleId));
      setExpandedSections((prev) => new Set(prev).add(found.sectionId));
    }
    setActiveTab("overview");
    // Reset media tab: prefer slide if available, else video
    const targetKp = allKnowledgePoints.find((item) => item.kp.id === kpId)?.kp;
    if (targetKp?.content?.slideUrl) setMediaTab("slide");
    else if (targetKp?.content?.youtubeUrl) setMediaTab("video");
  };

  const fetchQuestions = useCallback(async (kpId: string) => {
    try {
      setLoadingQuestions(true);
      let data: any[] = [];
      try { const res = await api.questionBank.getQuestionsByKp(kpId); data = Array.isArray(res) ? res : []; } catch { /* no questions */ }
      setQuestions(data);
      setSelectedAnswers({});
      setSubmittedQuestions(new Set());
      setRetryingQuestions(new Set());
      setQuestionAttempts({});
      questionStartTimeRefs.current = {};
    } finally { setLoadingQuestions(false); }
  }, []);

  useEffect(() => { if (selectedKpId && course) fetchQuestions(selectedKpId); }, [selectedKpId, course, fetchQuestions]);

  const handlePrevious = () => {
    if (currentIndex > 0) handleSelectKp(allKnowledgePoints[currentIndex - 1].kp.id);
  };

  const handleNext = () => {
    if (currentIndex < allKnowledgePoints.length - 1) {
      if (isKpLocked(currentIndex + 1)) { toast.warning("Hãy đạt 80% điểm nắm vững để tiếp tục"); return; }
      handleSelectKp(allKnowledgePoints[currentIndex + 1].kp.id);
    }
  };

  const toggleBookmark = (kpId: string) => {
    setBookmarkedKps((prev) => {
      const n = new Set(prev);
      if (n.has(kpId)) { n.delete(kpId); toast.success("Đã bỏ đánh dấu"); } else { n.add(kpId); toast.success("Đã đánh dấu trang"); }
      return n;
    });
  };

  const getKpStatus = (kpId: string): "not_started" | "in_progress" | "completed" => {
    if (kpId === selectedKpId) return "in_progress";
    const p = kpProgress[kpId];
    if (p) return p.masteryScore >= 80 ? "completed" : "in_progress";
    return "not_started";
  };

  const hasKpBeenStudied = (kpId: string) => !!kpProgress[kpId] && kpProgress[kpId].masteryScore > 0;

  const getCorrectAnswerText = (question: any): string => {
    if (question.questionType === "multiple_choice" && Array.isArray(question.options)) {
      const idx = parseInt(question.correctAnswer);
      if (!isNaN(idx) && idx >= 1 && idx <= question.options.length) return question.options[idx - 1];
    }
    return question.correctAnswer;
  };

  const isAnswerCorrect = (question: any) => selectedAnswers[question.id] === getCorrectAnswerText(question);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
    if (!questionStartTimeRefs.current[questionId]) questionStartTimeRefs.current[questionId] = Date.now();
  };

  const handleRetryQuestion = (questionId: string) => {
    setSelectedAnswers((prev) => { const n = { ...prev }; delete n[questionId]; return n; });
    setSubmittedQuestions((prev) => { const n = new Set(prev); n.delete(questionId); return n; });
    setRetryingQuestions((prev) => new Set(prev).add(questionId));
    questionStartTimeRefs.current[questionId] = Date.now();
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!user?.id || !selectedKpId) { toast.error("Không thể lưu kết quả"); return; }
    const selectedAnswer = selectedAnswers[questionId];
    if (!selectedAnswer) { toast.error("Vui lòng chọn đáp án"); return; }
    const timeSpent = Math.round((Date.now() - (questionStartTimeRefs.current[questionId] || Date.now())) / 1000);
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const correctAnswerText = getCorrectAnswerText(question);
    const isCorrect = selectedAnswer === correctAnswerText;
    setSubmittedQuestions((prev) => new Set(prev).add(questionId));
    setRetryingQuestions((prev) => { const n = new Set(prev); n.delete(questionId); return n; });
    setQuestionAttempts((prev) => ({ ...prev, [questionId]: { isCorrect, selectedAnswer } }));

    const isContentQuestion = questionId.startsWith("content-q-");
    try {
      if (!isContentQuestion) {
        const result = await api.studentProgress.submitQuestionAttempt({ studentId: user.id, questionId, kpId: selectedKpId, selectedAnswer, timeSpent });
        setKpProgress((prev) => ({ ...prev, [selectedKpId]: { masteryScore: result.masteryScore, confidence: result.confidence } }));
        if (result.isCorrect) toast.success(`Chính xác! Điểm nắm vững: ${result.masteryScore}%`);
        else toast.info(`Chưa đúng. Điểm nắm vững: ${result.masteryScore}%`);
      } else {
        const result = await api.studentProgress.submitContentQuestion({ studentId: user.id, kpId: selectedKpId, questionIndex: questionId, isCorrect, timeSpent, totalQuestions: questions.length });
        setKpProgress((prev) => ({ ...prev, [selectedKpId]: { masteryScore: result.masteryScore, confidence: result.confidence } }));
        if (isCorrect) toast.success(`Chính xác! Điểm nắm vững: ${result.masteryScore}%`);
        else toast.info("Câu trả lời chưa đúng. Hãy thử lại!");
      }
    } catch {
      if (isCorrect) toast.success("Chính xác!");
      else toast.info("Câu trả lời chưa đúng");
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice": return "Trắc nghiệm";
      case "true_false": return "Đúng/Sai";
      case "fill_in_blank": return "Điền vào chỗ trống";
      default: return "Câu hỏi";
    }
  };

  // ─── Module duration estimate (2 min per KP) ──────────────────────────────
  const getModuleDuration = (module: Module) => {
    const total = module.sections.reduce((acc, s) => acc + s.knowledgePoints.length, 0);
    const mins = total * 2;
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}min` : ""}` : `${mins}min`;
  };

  // ─── Loading / empty states ─────────────────────────────────────────────
  if (loading) {
    return (
              <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6244F4]" />
        </div>
      
    );
  }

  if (!course) {
    return (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500">Không tìm thấy khóa học</p>
          <Button as={Link} href="/dashboard/courses" startContent={<ChevronLeft className="w-4 h-4" />}>Quay lại</Button>
        </div>
      
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────
  return (
          <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-130px)]">

        {/* ══════════════════════════════════════════════════════════
            LEFT — Main content
        ══════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* ── Course header ── */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              {/* Back + title */}
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => router.back()}
                  className="mt-1 p-1.5 rounded-lg hover:bg-gray-100 text-[#666666] transition-colors shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl font-bold text-[#010101] leading-tight truncate">
                      {course.title}
                    </h1>
                    <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-[#6244F4/10] text-[#6244F4]">
                      {course.subject}
                    </span>
                  </div>
                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-sm text-[#666666] flex-wrap">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {totalKps} bài học
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.ceil(totalKps * 2 / 60)}h {(totalKps * 2) % 60}min
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      Khối {course.gradeLevel}
                    </span>
                    {completedKps > 0 && (
                      <span className="flex items-center gap-1 text-[#6244F4] font-medium">
                        <Star className="w-4 h-4 fill-[#6244F4]" />
                        {completedKps}/{totalKps} hoàn thành
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => currentKp && toggleBookmark(currentKp.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E5E5] text-sm text-[#666666] hover:bg-gray-50 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${currentKp && bookmarkedKps.has(currentKp.id) ? "fill-[#6244F4] text-[#6244F4]" : ""}`} />
                  Lưu
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E5E5] text-sm text-[#666666] hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Chia sẻ
                </button>
              </div>
            </div>

            {/* Overall progress bar */}
            {overallProgress > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <Progress
                  value={overallProgress}
                  size="sm"
                  classNames={{ base: "flex-1", indicator: "bg-[#6244F4]", track: "bg-[#6244F4/10]" }}
                />
                <span className="text-xs font-semibold text-[#6244F4] shrink-0">{overallProgress}%</span>
              </div>
            )}
          </div>

          {/* ── KP navigation (prev / current title / next) ── */}
          {currentKp && (
            <div className="bg-white rounded-2xl border border-[#E5E5E5] px-5 py-3 flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#6244F4] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>

              <div className="flex-1 text-center min-w-0">
                <p className="text-xs text-[#666666] mb-0.5">
                  Bài {currentIndex + 1} / {totalKps}
                </p>
                <h2 className="font-semibold text-[#010101] text-sm truncate">{currentKp.title}</h2>
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex >= allKnowledgePoints.length - 1}
                className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#6244F4] disabled:opacity-40 transition-colors"
              >
                Tiếp
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Media player (Slide / Video tabs) ── */}
          {currentKp && (currentKp.content?.slideUrl || currentKp.content?.youtubeUrl) && (
            <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
              {/* Tab header */}
              <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5">
                <div className="flex">
                  {currentKp.content?.slideUrl && (
                    <button
                      onClick={() => setMediaTab("slide")}
                      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer ${
                        mediaTab === "slide"
                          ? "border-[#6244F4] text-[#6244F4]"
                          : "border-transparent text-[#666666] hover:text-[#010101]"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Slide
                    </button>
                  )}
                  {currentKp.content?.youtubeUrl && (
                    <button
                      onClick={() => setMediaTab("video")}
                      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer ${
                        mediaTab === "video"
                          ? "border-[#6244F4] text-[#6244F4]"
                          : "border-transparent text-[#666666] hover:text-[#010101]"
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      Video
                    </button>
                  )}
                </div>
              </div>

              {/* Slide content */}
              {mediaTab === "slide" && currentKp.content?.slideUrl && (
                <div className="p-4">
                  {currentKp.content.slideFileName?.toLowerCase().endsWith(".pdf") ? (
                    <PDFSlideViewer url={currentKp.content.slideUrl} />
                  ) : /\.(pptx?|docx?)$/i.test(currentKp.content.slideFileName || "") ? (
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentKp.content.slideUrl)}`}
                      className="w-full h-[500px] rounded-xl border border-[#E5E5E5]"
                      title="Document Preview"
                    />
                  ) : (
                    <a
                      href={currentKp.content.slideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-[#f8f9fb] rounded-xl hover:bg-[#6244F4/10] transition-colors group"
                    >
                      <FileText className="w-8 h-8 text-[#6244F4]" />
                      <div>
                        <p className="text-sm font-medium text-[#010101]">{currentKp.content.slideFileName || "Tài liệu bài giảng"}</p>
                        <p className="text-xs text-[#666666]">Nhấn để tải xuống</p>
                      </div>
                    </a>
                  )}
                </div>
              )}

              {/* Video content */}
              {mediaTab === "video" && currentKp.content?.youtubeUrl && (() => {
                const match = currentKp.content!.youtubeUrl!.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : null;
                return embedUrl ? (
                  <div className="bg-black">
                    <div className="aspect-video">
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-[#666666]">Không thể tải video</div>
                );
              })()}
            </div>
          )}

          {/* ── Tabs ── */}
          {currentKp && (
            <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-[#E5E5E5] px-5">
                {[
                  { key: "overview" as TabKey, label: "Tổng quan", icon: <BookOpen className="w-4 h-4" /> },
                  { key: "questions" as TabKey, label: `Câu hỏi${questions.length > 0 ? ` (${questions.length})` : ""}`, icon: <MessageSquare className="w-4 h-4" /> },
                  { key: "resources" as TabKey, label: `Tài liệu${currentKp.resources?.length > 0 ? ` (${currentKp.resources.length})` : ""}`, icon: <Library className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer ${
                      activeTab === tab.key
                        ? "border-[#6244F4] text-[#6244F4]"
                        : "border-transparent text-[#666666] hover:text-[#010101]"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5">

                {/* Overview tab */}
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    {/* KP info */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {kpProgress[currentKp.id] && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#6244F4/10] text-[#6244F4] rounded-lg text-sm font-semibold">
                              <Target className="w-4 h-4" />
                              {kpProgress[currentKp.id].masteryScore}% nắm vững
                            </span>
                          )}
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getDifficultyClass(currentKp.difficultyLevel)}`}>
                            {getDifficultyLabel(currentKp.difficultyLevel)}
                          </span>
                        </div>
                        {currentKp.description && (
                          <p className="text-sm text-[#666666] leading-relaxed">{currentKp.description}</p>
                        )}
                      </div>
                    </div>

                    {/* About course */}
                    {course.description && (
                      <div>
                        <h3 className="font-semibold text-[#010101] mb-2">Giới thiệu khóa học</h3>
                        <p className="text-sm text-[#666666] leading-relaxed">{course.description}</p>
                      </div>
                    )}

                    {/* What you'll learn */}
                    <div>
                      <h3 className="font-semibold text-[#010101] mb-3">Những gì bạn sẽ học</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {allKnowledgePoints.slice(0, 8).map(({ kp }) => (
                          <div key={kp.id} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#6244F4] shrink-0 mt-0.5" />
                            <span className="text-sm text-[#666666]">{kp.title}</span>
                          </div>
                        ))}
                        {allKnowledgePoints.length > 8 && (
                          <div className="flex items-center gap-2 text-sm text-[#6244F4]">
                            <span>+ {allKnowledgePoints.length - 8} bài học khác</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content indicators */}
                    <div className="flex flex-wrap gap-2">
                      {currentKp.content?.youtubeUrl && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#666666] bg-[#f8f9fb] border border-[#E5E5E5] px-3 py-1.5 rounded-lg">
                          <Video className="w-3.5 h-3.5" /> Video bài giảng
                        </span>
                      )}
                      {currentKp.content?.slideUrl && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#666666] bg-[#f8f9fb] border border-[#E5E5E5] px-3 py-1.5 rounded-lg">
                          <FileText className="w-3.5 h-3.5" /> Slide bài giảng
                        </span>
                      )}
                      {currentKp.resources?.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#666666] bg-[#f8f9fb] border border-[#E5E5E5] px-3 py-1.5 rounded-lg">
                          <BookOpen className="w-3.5 h-3.5" /> {currentKp.resources.length} tài liệu
                        </span>
                      )}
                      {questions.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#666666] bg-[#f8f9fb] border border-[#E5E5E5] px-3 py-1.5 rounded-lg">
                          <HelpCircle className="w-3.5 h-3.5" /> {questions.length} câu hỏi
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Questions tab */}
                {activeTab === "questions" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-5 h-5 text-[#6244F4]" />
                      <h3 className="font-semibold text-[#010101]">Câu hỏi luyện tập</h3>
                      {questions.length > 0 && (
                        <span className="text-xs text-[#666666] bg-[#f8f9fb] px-2.5 py-1 rounded-full border border-[#E5E5E5]">
                          {questions.length} câu
                        </span>
                      )}
                    </div>

                    {loadingQuestions ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6244F4]" />
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="flex flex-col items-center py-10 text-center">
                        <HelpCircle className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-[#666666] text-sm">Chưa có câu hỏi luyện tập cho bài học này</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {questions.map((question, index) => {
                          const isSubmitted = submittedQuestions.has(question.id);
                          const isRetrying = retryingQuestions.has(question.id);
                          const isCorrect = isSubmitted && !isRetrying && isAnswerCorrect(question);
                          const selectedAnswer = selectedAnswers[question.id];
                          const canInteract = !isSubmitted || isRetrying;

                          return (
                            <div key={question.id} className="bg-[#f8f9fb] rounded-xl p-5 border border-[#E5E5E5]">
                              {/* Question header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#6244F4] text-white font-semibold text-xs">{index + 1}</span>
                                  <span className="text-xs text-[#6244F4] bg-[#6244F4/10] px-2 py-0.5 rounded-full font-medium">{getQuestionTypeLabel(question.questionType)}</span>
                                </div>
                                {isSubmitted && (
                                  isCorrect
                                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                                    : <XCircle className="w-5 h-5 text-red-500" />
                                )}
                              </div>

                              <p className="text-sm font-medium text-[#010101] mb-4">{question.questionText}</p>

                              {/* Multiple choice */}
                              {question.questionType === "multiple_choice" && question.options && (
                                <div className="space-y-2 mb-4">
                                  {question.options.map((option: string, optIdx: number) => {
                                    const letter = String.fromCharCode(65 + optIdx);
                                    const isSelected = selectedAnswer === option;
                                    const correctAnswerText = getCorrectAnswerText(question);
                                    const isCorrectOption = option === correctAnswerText;
                                    let cls = "w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ";
                                    if (isSubmitted && !isRetrying) {
                                      cls += isCorrectOption ? "bg-green-50 border-green-400 text-green-700" : isSelected && !isCorrect ? "bg-red-50 border-red-400 text-red-700" : "bg-white border-gray-200 text-[#666666]";
                                    } else {
                                      cls += isSelected ? "bg-[#6244F4/10] border-[#6244F4] text-[#6244F4]" : "bg-white border-gray-200 hover:border-[#6244F4]/40 text-[#666666]";
                                    }
                                    return (
                                      <button key={optIdx} onClick={() => canInteract && handleAnswerSelect(question.id, option)} disabled={!canInteract} className={cls}>
                                        <div className="flex items-center gap-3">
                                          <span className="font-semibold w-5 shrink-0">{letter}.</span>
                                          <span>{option}</span>
                                          {isSubmitted && !isRetrying && isCorrectOption && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                                          {isSubmitted && !isRetrying && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* True/false */}
                              {question.questionType === "true_false" && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  {["Đúng", "Sai"].map((option) => {
                                    const isSelected = selectedAnswer === option;
                                    const correctAnswerText = getCorrectAnswerText(question);
                                    const isCorrectOption = option === correctAnswerText;
                                    let cls = "py-3 rounded-xl border-2 text-sm font-medium text-center transition-all ";
                                    if (isSubmitted && !isRetrying) {
                                      cls += isCorrectOption ? "bg-green-50 border-green-400 text-green-700" : isSelected && !isCorrect ? "bg-red-50 border-red-400 text-red-700" : "bg-white border-gray-200 text-[#666666]";
                                    } else {
                                      cls += isSelected ? "bg-[#6244F4/10] border-[#6244F4] text-[#6244F4]" : "bg-white border-gray-200 hover:border-[#6244F4]/40 text-[#666666]";
                                    }
                                    return (
                                      <button key={option} onClick={() => canInteract && handleAnswerSelect(question.id, option)} disabled={!canInteract} className={cls}>{option}</button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Submit / retry */}
                              <div className="flex gap-2">
                                {canInteract && selectedAnswer && (
                                  <button onClick={() => handleSubmitAnswer(question.id)} className="px-4 py-2 rounded-xl bg-[#6244F4] text-white text-sm font-semibold hover:bg-[#0066CC] transition-colors">
                                    {isRetrying ? "Nộp lại" : "Nộp bài"}
                                  </button>
                                )}
                                {isSubmitted && !isCorrect && !isRetrying && (
                                  <button onClick={() => handleRetryQuestion(question.id)} className="px-4 py-2 rounded-xl border-2 border-[#6244F4] text-[#6244F4] text-sm font-semibold hover:bg-[#6244F4/10] transition-colors">
                                    Làm lại
                                  </button>
                                )}
                              </div>

                              {/* Feedback */}
                              {isSubmitted && !isRetrying && (
                                <div className={`mt-4 p-3 rounded-xl ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    {isCorrect ? <><CheckCircle className="w-4 h-4 text-green-600" /><p className="text-sm font-semibold text-green-700">Chúc mừng! Bạn trả lời đúng</p></> : <><XCircle className="w-4 h-4 text-red-600" /><p className="text-sm font-semibold text-red-700">Câu trả lời chưa chính xác</p></>}
                                  </div>
                                  {!isCorrect && <p className="text-xs text-red-600">Đáp án đúng: {getCorrectAnswerText(question)}</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Resources tab */}
                {activeTab === "resources" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Library className="w-5 h-5 text-[#6244F4]" />
                      <h3 className="font-semibold text-[#010101]">Tài liệu tham khảo</h3>
                    </div>
                    {!currentKp.resources || currentKp.resources.length === 0 ? (
                      <div className="flex flex-col items-center py-10 text-center">
                        <Library className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-[#666666] text-sm">Chưa có tài liệu cho bài học này</p>
                      </div>
                    ) : (
                      currentKp.resources.map((resource) => (
                        <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-[#f8f9fb] rounded-xl border border-[#E5E5E5] hover:border-[#6244F4]/30 hover:bg-[#6244F4/10]/30 transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                            {resource.resourceType === "video" ? "🎥" : resource.resourceType === "article" ? "📄" : resource.resourceType === "interactive" ? "🎮" : resource.resourceType === "quiz" ? "📝" : "📎"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#010101] group-hover:text-[#6244F4] transition-colors truncate">{resource.title}</p>
                            {resource.description && <p className="text-xs text-[#666666] mt-0.5 truncate">{resource.description}</p>}
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#666666] group-hover:text-[#6244F4] shrink-0" />
                        </a>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!currentKp && (
            <div className="bg-white rounded-2xl border border-[#E5E5E5] flex flex-col items-center justify-center py-20">
              <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-[#666666]">Chọn một bài học từ danh sách bên phải để bắt đầu</p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT — Course content panel
        ══════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-4">

          {/* Course content list */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="font-bold text-[#010101] flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-[#6244F4]" />
                Nội dung khóa học
              </h3>
              {overallProgress > 0 && (
                <div className="flex items-center gap-2">
                  <ProgressRing progress={overallProgress} size={36} strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {course.modules.map((module, modIndex) => {
                const moduleKpCount = module.sections.reduce((acc, s) => acc + s.knowledgePoints.length, 0);
                const moduleCompleted = module.sections.reduce((acc, s) =>
                  acc + s.knowledgePoints.filter((kp) => (kpProgress[kp.id]?.masteryScore || 0) >= 80).length, 0);

                return (
                  <div key={module.id} className="border-b border-[#E5E5E5] last:border-0">
                    {/* Module header */}
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedModules);
                        if (newExpanded.has(module.id)) newExpanded.delete(module.id);
                        else newExpanded.add(module.id);
                        setExpandedModules(newExpanded);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#f8f9fb] transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#6244F4/10] flex items-center justify-center text-xs font-bold text-[#6244F4] shrink-0">
                        {String(modIndex + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#010101] truncate">{module.title}</p>
                        <p className="text-xs text-[#666666]">
                          {moduleCompleted}/{moduleKpCount} bài · {getModuleDuration(module)}
                        </p>
                      </div>
                      {expandedModules.has(module.id)
                        ? <ChevronUp className="w-4 h-4 text-[#666666] shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-[#666666] shrink-0" />}
                    </button>

                    {/* Sections */}
                    {expandedModules.has(module.id) && (
                      <div className="bg-[#f8f9fb]">
                        {module.sections.map((section) => (
                          <div key={section.id}>
                            {/* Section title */}
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedSections);
                                if (newExpanded.has(section.id)) newExpanded.delete(section.id);
                                else newExpanded.add(section.id);
                                setExpandedSections(newExpanded);
                              }}
                              className="w-full flex items-center gap-2.5 px-5 py-2.5 hover:bg-[#6244F4/10]/30 transition-colors text-left border-t border-[#E5E5E5]/60"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#6244F4] shrink-0" />
                              <span className="flex-1 text-xs font-semibold text-[#010101] truncate">{section.title}</span>
                              {expandedSections.has(section.id)
                                ? <ChevronUp className="w-3 h-3 text-[#666666] shrink-0" />
                                : <ChevronDown className="w-3 h-3 text-[#666666] shrink-0" />}
                            </button>

                            {/* KPs */}
                            {expandedSections.has(section.id) && (
                              <div>
                                {section.knowledgePoints.map((kp) => {
                                  const kpIdx = allKnowledgePoints.findIndex((item) => item.kp.id === kp.id);
                                  const locked = isKpLocked(kpIdx);
                                  const status = getKpStatus(kp.id);
                                  const isSelected = kp.id === selectedKpId;
                                  const progress = kpProgress[kp.id];

                                  return (
                                    <button
                                      key={kp.id}
                                      onClick={() => !locked && handleSelectKp(kp.id)}
                                      disabled={locked}
                                      className={`w-full flex items-center gap-3 pl-8 pr-5 py-2.5 transition-all text-left ${
                                        locked ? "opacity-50 cursor-not-allowed" :
                                        isSelected ? "bg-[#6244F4/10]" : "hover:bg-white"
                                      }`}
                                    >
                                      {/* Status icon */}
                                      <div className="shrink-0">
                                        {locked ? (
                                          <Lock className="w-4 h-4 text-gray-400" />
                                        ) : status === "completed" ? (
                                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : isSelected ? (
                                          <div className="w-4 h-4 rounded-full bg-[#6244F4] flex items-center justify-center">
                                            <Play className="w-2.5 h-2.5 text-white fill-white" />
                                          </div>
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-300" />
                                        )}
                                      </div>
                                      <span className={`flex-1 text-xs truncate ${
                                        locked ? "text-gray-400" :
                                        isSelected ? "font-semibold text-[#6244F4]" :
                                        status === "completed" ? "text-[#535862] font-medium" :
                                        "text-[#666666]"
                                      }`}>
                                        {kp.title}
                                      </span>
                                      {/* Right indicators */}
                                      <div className="shrink-0 flex items-center gap-1.5">
                                        {status === "completed" && <Trophy className="w-3 h-3 text-yellow-500" />}
                                        {progress && status !== "completed" && (
                                          <span className="text-xs font-medium text-[#6244F4]">{progress.masteryScore}%</span>
                                        )}
                                        {kp.content?.youtubeUrl && <Video className="w-3 h-3 text-[#666666]" />}
                                        {kp.content?.slideUrl && <FileText className="w-3 h-3 text-[#666666]" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Study stats card */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5">
            <h3 className="font-bold text-[#010101] mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#6244F4]" />
              Thống kê học tập
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666666]">Hoàn thành</span>
                <span className="font-semibold text-[#010101]">{completedKps} / {totalKps} bài</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666666]">Thời gian học</span>
                <span className="font-semibold text-[#010101]">
                  {totalStudyTime >= 3600
                    ? `${Math.floor(totalStudyTime / 3600)}h ${Math.floor((totalStudyTime % 3600) / 60)}min`
                    : `${Math.floor(totalStudyTime / 60)} min`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666666]">Tiến độ</span>
                <span className="font-semibold text-[#6244F4]">{overallProgress}%</span>
              </div>
              {overallProgress > 0 && (
                <Progress
                  value={overallProgress}
                  size="sm"
                  classNames={{ indicator: "bg-[#6244F4]", track: "bg-[#6244F4/10]" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    
  );
}
