"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import PDFSlideViewer from "@/components/ui/PDFSlideViewer";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  BookOpen,
  CheckCircle2,
  Circle,
  Trophy,
  Flag,
  Video,
  FileText,
  Play,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lock,
  GraduationCap,
  Clock,
  Target,
  MoreVertical,
  Bookmark,
  Share2,
} from "lucide-react";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Progress,
} from "@heroui/react";
import Link from "next/link";

interface KnowledgePoint {
  id: string;
  title: string;
  description: string;
  difficultyLevel: number;
  orderIndex: number;
  // Content only contains slideUrl, slideFileName, youtubeUrl
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

// Difficulty level label helper
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
  if (level <= 2) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (level === 3) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

// Progress Ring Component
function ProgressRing({
  progress,
  size = 40,
  strokeWidth = 4,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-[#181d27] dark:text-white">
          {progress}%
        </span>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bookmarkedKps, setBookmarkedKps] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());
  const [retryingQuestions, setRetryingQuestions] = useState<Set<string>>(new Set());
  const [questionAttempts, setQuestionAttempts] = useState<Record<string, { isCorrect: boolean; selectedAnswer: string }>>({});
  const [kpProgress, setKpProgress] = useState<Record<string, { masteryScore: number; confidence: number }>>({});
  const questionStartTimeRefs = useRef<Record<string, number>>({});
  
  // Time tracking
  const kpStartTimeRef = useRef<number | null>(null);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);

  const allKnowledgePoints = useMemo(() => {
    if (!course) return [];
    const kps: { kp: KnowledgePoint; moduleId: string; sectionId: string }[] = [];
    course.modules.forEach((module) => {
      module.sections.forEach((section) => {
        section.knowledgePoints.forEach((kp) => {
          kps.push({ kp, moduleId: module.id, sectionId: section.id });
        });
      });
    });
    return kps;
  }, [course]);

  const currentKp = useMemo(() => {
    if (!selectedKpId) return null;
    const found = allKnowledgePoints.find((item) => item.kp.id === selectedKpId);
    return found?.kp || null;
  }, [selectedKpId, allKnowledgePoints]);

  const currentIndex = useMemo(() => {
    if (!selectedKpId) return -1;
    return allKnowledgePoints.findIndex((item) => item.kp.id === selectedKpId);
  }, [selectedKpId, allKnowledgePoints]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (allKnowledgePoints.length === 0) return 0;
    const completedCount = Object.values(kpProgress).filter(
      (p) => p.masteryScore >= 80
    ).length;
    return Math.round((completedCount / allKnowledgePoints.length) * 100);
  }, [kpProgress, allKnowledgePoints.length]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    const loadAllKpProgress = async () => {
      if (course && user?.id && allKnowledgePoints.length > 0) {
        try {
          const progressPromises = allKnowledgePoints.map(async (item) => {
            try {
              const progress = await api.studentProgress.getStudentKpProgress(
                user.id,
                item.kp.id
              );
              if (progress) {
                return {
                  kpId: item.kp.id,
                  progress: {
                    masteryScore: progress.masteryScore,
                    confidence: progress.confidence,
                  },
                };
              }
              return null;
            } catch (error: any) {
              if (error.response?.status === 404) return null;
              console.error(`Failed to load progress for KP ${item.kp.id}:`, error);
              return null;
            }
          });

          const results = await Promise.all(progressPromises);
          const progressMap: Record<string, { masteryScore: number; confidence: number }> = {};
          results.forEach((result) => {
            if (result) progressMap[result.kpId] = result.progress;
          });
          setKpProgress(progressMap);
        } catch (error) {
          console.error("Failed to load KP progress:", error);
        }
      }
    };
    loadAllKpProgress();
  }, [course, user?.id, allKnowledgePoints.length]);

  useEffect(() => {
    if (course && course.modules.length > 0 && !selectedKpId) {
      const firstModule = course.modules[0];
      setExpandedModules(new Set([firstModule.id]));
      if (firstModule.sections.length > 0) {
        const firstSection = firstModule.sections[0];
        setExpandedSections(new Set([firstSection.id]));
        if (firstSection.knowledgePoints.length > 0) {
          setSelectedKpId(firstSection.knowledgePoints[0].id);
          kpStartTimeRef.current = Date.now(); // Start tracking time for first KP
        }
      }
    }
  }, [course, selectedKpId]);

  // Track time when KP changes
  useEffect(() => {
    if (selectedKpId) {
      kpStartTimeRef.current = Date.now();
    }
  }, [selectedKpId]);

  // Save time when component unmounts
  useEffect(() => {
    return () => {
      if (kpStartTimeRef.current && selectedKpId && user?.id) {
        const timeSpentSeconds = Math.round((Date.now() - kpStartTimeRef.current) / 1000);
        if (timeSpentSeconds >= 5) {
          // Use sendBeacon for reliable tracking on page unload
          const data = JSON.stringify({
            studentId: user.id,
            kpId: selectedKpId,
            timeSpentSeconds,
          });
          navigator.sendBeacon?.('/api/student-progress/track-time', new Blob([data], { type: 'application/json' }));
        }
      }
    };
  }, [selectedKpId, user?.id]);

  // Fetch total study time on mount
  useEffect(() => {
    const fetchStudyTime = async () => {
      if (user?.id) {
        try {
          const data = await api.studentProgress.getTotalStudyTime(user.id);
          setTotalStudyTime(data.totalSeconds || 0);
        } catch (error) {
          console.error("Failed to fetch study time:", error);
        }
      }
    };
    fetchStudyTime();
  }, [user?.id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getForLearning(courseId as string);
      setCourse(data);
    } catch (error: any) {
      console.error("Failed to fetch course:", error);
      toast.error("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) newExpanded.delete(moduleId);
    else newExpanded.add(moduleId);
    setExpandedModules(newExpanded);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) newExpanded.delete(sectionId);
    else newExpanded.add(sectionId);
    setExpandedSections(newExpanded);
  };

  // Save time spent on current KP before switching
  const saveCurrentKpTime = async () => {
    console.log("[Time Tracking] Saving time...", { hasStart: !!kpStartTimeRef.current, selectedKpId, userId: user?.id });
    if (kpStartTimeRef.current && selectedKpId && user?.id) {
      const timeSpentSeconds = Math.round((Date.now() - kpStartTimeRef.current) / 1000);
      console.log("[Time Tracking] Time spent:", timeSpentSeconds, "seconds");
      if (timeSpentSeconds >= 5) {
        try {
          await api.studentProgress.trackTimeOnTask({
            studentId: user.id,
            kpId: selectedKpId,
            timeSpentSeconds,
          });
          console.log("[Time Tracking] Saved successfully");
          setTotalStudyTime((prev) => prev + timeSpentSeconds);
        } catch (error) {
          console.error("[Time Tracking] Failed:", error);
        }
      } else {
        console.log("[Time Tracking] Too short, skipped");
      }
    }
  };

  const handleSelectKp = async (kpId: string) => {
    const kpIndex = allKnowledgePoints.findIndex((item) => item.kp.id === kpId);
    if (kpIndex === -1) return;
    if (isKpLocked(kpIndex)) {
      const previousKp = allKnowledgePoints[kpIndex - 1];
      toast.warning(`Vui lòng hoàn thành "${previousKp.kp.title}" trước khi học bài này`);
      return;
    }
    
    // Save time for current KP before switching
    await saveCurrentKpTime();
    
    setSelectedKpId(kpId);
    kpStartTimeRef.current = Date.now(); // Start tracking new KP
    
    const found = allKnowledgePoints.find((item) => item.kp.id === kpId);
    if (found) {
      setExpandedModules((prev) => new Set(prev).add(found.moduleId));
      setExpandedSections((prev) => new Set(prev).add(found.sectionId));
    }
  };

  const fetchQuestions = useCallback(
    async (kpId: string) => {
      try {
        setLoadingQuestions(true);
        let questionsData: any[] = [];

        // Always fetch questions from question_bank
        try {
          const data = await api.questionBank.getQuestionsByKp(kpId);
          questionsData = Array.isArray(data) ? data : [];
        } catch (error) {
          console.log("No question bank questions found");
        }

        setQuestions(questionsData);
        setSelectedAnswers({});
        setSubmittedQuestions(new Set());
        setRetryingQuestions(new Set());
        setQuestionAttempts({});
        questionStartTimeRefs.current = {};
      } catch (error: any) {
        console.error("Failed to fetch questions:", error);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedKpId && course) fetchQuestions(selectedKpId);
  }, [selectedKpId, course, fetchQuestions]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevKp = allKnowledgePoints[currentIndex - 1];
      handleSelectKp(prevKp.kp.id);
    }
  };

  const handleNext = () => {
    if (currentIndex < allKnowledgePoints.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextKp = allKnowledgePoints[nextIndex];
      if (isKpLocked(nextIndex)) {
        const currentKp = allKnowledgePoints[currentIndex];
        toast.warning(`Vui lòng hoàn thành "${currentKp.kp.title}" (đạt 80% điểm nắm vững) để tiếp tục`);
        return;
      }
      handleSelectKp(nextKp.kp.id);
    }
  };

  const toggleBookmark = (kpId: string) => {
    const newBookmarked = new Set(bookmarkedKps);
    if (newBookmarked.has(kpId)) {
      newBookmarked.delete(kpId);
      toast.success("Đã bỏ đánh dấu");
    } else {
      newBookmarked.add(kpId);
      toast.success("Đã đánh dấu trang");
    }
    setBookmarkedKps(newBookmarked);
  };

  const getKpStatus = (kpId: string): "not_started" | "in_progress" | "completed" => {
    if (kpId === selectedKpId) return "in_progress";
    const progress = kpProgress[kpId];
    if (progress) {
      // Có progress record nghĩa là đã bắt đầu học (dù masteryScore = 0 hay bao nhiêu)
      if (progress.masteryScore >= 80) return "completed";
      return "in_progress";
    }
    return "not_started";
  };

  const isKpLocked = (kpIndex: number): boolean => {
    if (kpIndex === 0) return false;
    const previousKp = allKnowledgePoints[kpIndex - 1];
    if (!previousKp) return false;
    const previousProgress = kpProgress[previousKp.kp.id];
    if (!previousProgress) return true;
    return previousProgress.masteryScore < 80;
  };

  const hasKpBeenStudied = (kpId: string): boolean => {
    const progress = kpProgress[kpId];
    return progress !== undefined && progress.masteryScore > 0;
  };

  const getStatusIcon = (status: "not_started" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
    if (!questionStartTimeRefs.current[questionId]) {
      questionStartTimeRefs.current[questionId] = Date.now();
    }
  };

  const handleRetryQuestion = (questionId: string) => {
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
    setSubmittedQuestions((prev) => {
      const newSubmitted = new Set(prev);
      newSubmitted.delete(questionId);
      return newSubmitted;
    });
    setRetryingQuestions((prev) => new Set(prev).add(questionId));
    questionStartTimeRefs.current[questionId] = Date.now();
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!user?.id || !selectedKpId) {
      toast.error("Không thể lưu kết quả. Vui lòng thử lại.");
      return;
    }

    const selectedAnswer = selectedAnswers[questionId];
    if (!selectedAnswer) {
      toast.error("Vui lòng chọn đáp án trước khi nộp bài");
      return;
    }

    const startTime = questionStartTimeRefs.current[questionId] || Date.now();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      toast.error("Không tìm thấy câu hỏi");
      return;
    }

    const correctAnswerText = getCorrectAnswerText(question);
    const isCorrect = selectedAnswer === correctAnswerText;

    setSubmittedQuestions((prev) => new Set(prev).add(questionId));
    setRetryingQuestions((prev) => {
      const newRetrying = new Set(prev);
      newRetrying.delete(questionId);
      return newRetrying;
    });
    setQuestionAttempts((prev) => ({
      ...prev,
      [questionId]: { isCorrect, selectedAnswer },
    }));

    const isContentQuestion = questionId.startsWith("content-q-");

    if (!isContentQuestion) {
      try {
        const result = await api.studentProgress.submitQuestionAttempt({
          studentId: user.id,
          questionId: questionId,
          kpId: selectedKpId,
          selectedAnswer: selectedAnswer,
          timeSpent: timeSpent,
        });

        setKpProgress((prev) => ({
          ...prev,
          [selectedKpId]: {
            masteryScore: result.masteryScore,
            confidence: result.confidence,
          },
        }));

        if (result.isCorrect) {
          toast.success(`Chính xác! Điểm nắm vững: ${result.masteryScore}%`);
        } else {
          toast.info(`Câu trả lời chưa đúng. Điểm nắm vững: ${result.masteryScore}%`);
        }
      } catch (error: any) {
        console.error("Failed to submit answer:", error);
        toast.error("Không thể lưu kết quả. Vui lòng thử lại.");
      }
    } else {
      try {
        const result = await api.studentProgress.submitContentQuestion({
          studentId: user.id,
          kpId: selectedKpId,
          questionIndex: questionId,
          isCorrect: isCorrect,
          timeSpent: timeSpent,
          totalQuestions: questions.length,
        });

        setKpProgress((prev) => ({
          ...prev,
          [selectedKpId]: {
            masteryScore: result.masteryScore,
            confidence: result.confidence,
          },
        }));

        if (isCorrect) {
          toast.success(`Chính xác! Điểm nắm vững: ${result.masteryScore}%`);
        } else {
          toast.info(`Câu trả lời chưa đúng. Điểm nắm vững: ${result.masteryScore}%`);
        }
      } catch (error: any) {
        console.error("Failed to submit content question:", error);
        if (isCorrect) toast.success("Chính xác!");
        else toast.info("Câu trả lời chưa đúng. Hãy thử lại!");
      }
    }
  };

  const getCorrectAnswerText = (question: any): string => {
    if (
      question.questionType === "multiple_choice" &&
      question.options &&
      Array.isArray(question.options)
    ) {
      const answerIndex = parseInt(question.correctAnswer);
      if (
        !isNaN(answerIndex) &&
        answerIndex >= 1 &&
        answerIndex <= question.options.length
      ) {
        return question.options[answerIndex - 1];
      }
    }
    return question.correctAnswer;
  };

  const isAnswerCorrect = (question: any) => {
    const correctAnswerText = getCorrectAnswerText(question);
    return selectedAnswers[question.id] === correctAnswerText;
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Trắc nghiệm";
      case "true_false":
        return "Đúng/Sai";
      case "fill_in_blank":
        return "Điền vào chỗ trống";
      case "short_answer":
        return "Trả lời ngắn";
      default:
        return "Câu hỏi";
    }
  };

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </LayoutDashboard>
    );
  }

  if (!course) {
    return (
      <LayoutDashboard>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-[#717680] dark:text-gray-400">Không tìm thấy khóa học</p>
          <Button as={Link} href="/dashboard/courses" startContent={<ChevronLeft className="w-4 h-4" />}>
            Quay lại
          </Button>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-[#f9fafb] dark:bg-[#0d121b]">
        {/* Sidebar Navigation */}
        <div
          className={`bg-white dark:bg-[#1a202c] border-r border-[#e9eaeb] dark:border-gray-800 transition-all duration-300 ${
            isSidebarOpen ? "w-80" : "w-0"
          } overflow-hidden flex flex-col`}
        >
          {isSidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-[#e9eaeb] dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => router.back()}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 min-w-0 mx-2">
                    <h2 className="font-semibold text-[#181d27] dark:text-white text-sm truncate">
                      {course.title}
                    </h2>
                    <p className="text-xs text-[#717680] dark:text-gray-400">
                      {course.subject} • Khối {course.gradeLevel}
                    </p>
                  </div>
                  <Button isIconOnly variant="light" size="sm" onClick={() => setIsSidebarOpen(false)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 p-3 bg-[#f9fafb] dark:bg-gray-800 rounded-xl">
                  <ProgressRing progress={overallProgress} size={44} strokeWidth={3} />
                  <div>
                    <p className="text-sm font-medium text-[#181d27] dark:text-white">
                      Tiến độ học tập
                    </p>
                    <p className="text-xs text-[#717680] dark:text-gray-400">
                      {Object.values(kpProgress).filter((p) => p.masteryScore >= 80).length} /{" "}
                      {allKnowledgePoints.length} bài học
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation List */}
              <div className="flex-1 overflow-y-auto p-3">
                {course.modules.map((module, modIndex) => (
                  <div key={module.id} className="mb-2">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-[#f9fafb] dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {modIndex + 1}
                      </div>
                      <span className="flex-1 text-left text-sm font-medium text-[#181d27] dark:text-white truncate">
                        {module.title}
                      </span>
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="w-4 h-4 text-[#717680]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#717680]" />
                      )}
                    </button>

                    {expandedModules.has(module.id) && (
                      <div className="mt-1 ml-4 space-y-1">
                        {module.sections.map((section) => (
                          <div key={section.id}>
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#f9fafb] dark:hover:bg-gray-800 transition-colors"
                            >
                              <BookOpen className="w-4 h-4 text-[#717680]" />
                              <span className="flex-1 text-left text-sm text-[#535862] dark:text-gray-300 truncate">
                                {section.title}
                              </span>
                              {expandedSections.has(section.id) ? (
                                <ChevronUp className="w-3 h-3 text-[#717680]" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-[#717680]" />
                              )}
                            </button>

                            {expandedSections.has(section.id) && (
                              <div className="mt-1 ml-4 space-y-0.5">
                                {section.knowledgePoints.map((kp) => {
                                  const status = getKpStatus(kp.id);
                                  const isSelected = kp.id === selectedKpId;
                                  const kpIndex = allKnowledgePoints.findIndex(
                                    (item) => item.kp.id === kp.id
                                  );
                                  const isLocked = isKpLocked(kpIndex);
                                  const hasStudied = hasKpBeenStudied(kp.id);

                                  return (
                                    <button
                                      key={kp.id}
                                      onClick={() => !isLocked && handleSelectKp(kp.id)}
                                      disabled={isLocked}
                                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                                        isLocked
                                          ? "opacity-50 cursor-not-allowed"
                                          : isSelected
                                          ? "bg-primary/10 border border-primary/30"
                                          : "hover:bg-[#f9fafb] dark:hover:bg-gray-800"
                                      }`}
                                    >
                                      {isLocked ? (
                                        <Lock className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        getStatusIcon(status)
                                      )}
                                      <span
                                        className={`flex-1 text-left text-xs truncate ${
                                          isLocked
                                            ? "text-gray-400"
                                            : isSelected
                                            ? "font-medium text-primary"
                                            : hasStudied
                                            ? "text-[#535862] font-medium"
                                            : "text-[#717680]"
                                        }`}
                                      >
                                        {kp.title}
                                      </span>
                                      {status === "completed" && !isLocked && (
                                        <Trophy className="w-3 h-3 text-yellow-500" />
                                      )}
                                      {hasStudied && !isLocked && status !== "completed" && (
                                        <span className="text-xs text-primary font-medium">
                                          {kpProgress[kp.id]?.masteryScore || 0}%
                                        </span>
                                      )}
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
                ))}
              </div>
            </>
          )}
        </div>

        {/* Toggle Sidebar Button */}
        {!isSidebarOpen && (
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-[100px] z-10 bg-white dark:bg-[#1a202c] border border-[#e9eaeb] dark:border-gray-700 rounded-full shadow-md"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentKp ? (
            <>
              {/* Top Navigation Bar */}
              <div className="bg-white dark:bg-[#1a202c] border-b border-[#e9eaeb] dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="border border-[#e9eaeb] dark:border-gray-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="text-sm text-[#717680] dark:text-gray-400">
                    <span className="font-medium text-[#181d27] dark:text-white">
                      {currentIndex + 1}
                    </span>{" "}
                    / {allKnowledgePoints.length}
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === allKnowledgePoints.length - 1 || isKpLocked(currentIndex + 1)}
                    className="border border-[#e9eaeb] dark:border-gray-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => toggleBookmark(currentKp.id)}
                    startContent={
                      <Bookmark
                        className={`w-4 h-4 ${
                          bookmarkedKps.has(currentKp.id)
                            ? "text-red-500 fill-red-500"
                            : "text-[#717680]"
                        }`}
                      />
                    }
                  >
                    {bookmarkedKps.has(currentKp.id) ? "Đã đánh dấu" : "Đánh dấu"}
                  </Button>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem key="share" startContent={<Share2 className="w-4 h-4" />}>
                        Chia sẻ
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* KP Title Header */}
                  <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-[#181d27] dark:text-white leading-tight">
                          {currentKp.title}
                        </h1>
                        {currentKp.description && (
                          <p className="mt-2 text-sm text-[#535862] dark:text-gray-400">
                            {currentKp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {kpProgress[currentKp.id] && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">
                              {kpProgress[currentKp.id].masteryScore}%
                            </span>
                          </div>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getDifficultyClass(currentKp.difficultyLevel)}`}>
                          {getDifficultyLabel(currentKp.difficultyLevel)}
                        </span>
                      </div>
                    </div>
                    {/* Content availability indicators */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {currentKp.content?.youtubeUrl && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#717680] dark:text-gray-400 bg-[#f9fafb] dark:bg-gray-800 px-2 py-1 rounded-md">
                          <Video className="w-3 h-3" /> Video
                        </span>
                      )}
                      {currentKp.content?.slideUrl && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#717680] dark:text-gray-400 bg-[#f9fafb] dark:bg-gray-800 px-2 py-1 rounded-md">
                          <FileText className="w-3 h-3" /> Slide
                        </span>
                      )}
                      {currentKp.resources && currentKp.resources.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#717680] dark:text-gray-400 bg-[#f9fafb] dark:bg-gray-800 px-2 py-1 rounded-md">
                          <BookOpen className="w-3 h-3" /> {currentKp.resources.length} tài liệu
                        </span>
                      )}
                      {questions.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#717680] dark:text-gray-400 bg-[#f9fafb] dark:bg-gray-800 px-2 py-1 rounded-md">
                          <HelpCircle className="w-3 h-3" /> {questions.length} câu hỏi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* YouTube Video */}
                  {currentKp.content?.youtubeUrl && (() => {
                    const match = currentKp.content.youtubeUrl!.match(
                      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
                    );
                    const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : null;
                    return embedUrl ? (
                      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6">
                        <h2 className="text-lg font-bold text-[#181d27] dark:text-white mb-4 flex items-center gap-2">
                          <Video className="w-5 h-5 text-primary" />
                          Video bài giảng
                        </h2>
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Slide Viewer */}
                  {currentKp.content?.slideUrl && (
                    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-[#181d27] dark:text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Slide bài giảng
                        </h2>
                        <a
                          href={currentKp.content.slideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Mở tab mới
                          <Play className="w-4 h-4" />
                        </a>
                      </div>
                      {currentKp.content.slideFileName?.toLowerCase().endsWith(".pdf") ? (
                        <PDFSlideViewer url={currentKp.content.slideUrl!} />
                      ) : /\.(pptx?|docx?)$/i.test(currentKp.content.slideFileName || "") ? (
                        <iframe
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentKp.content.slideUrl!)}`}
                          className="w-full h-[500px] rounded-lg border border-[#e9eaeb] dark:border-gray-700"
                          title="Document Preview"
                        />
                      ) : (
                        <a
                          href={currentKp.content.slideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-[#f9fafb] dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FileText className="w-8 h-8 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#181d27] dark:text-white">
                              {currentKp.content.slideFileName || "Tài liệu bài giảng"}
                            </p>
                            <p className="text-xs text-[#535862] dark:text-gray-400">
                              Nhấn để tải xuống
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  )}
                  
                  {/* Resources */}
                  {currentKp.resources && currentKp.resources.length > 0 && (
                    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6">
                      <h2 className="text-lg font-bold text-[#181d27] dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Tài liệu tham khảo
                      </h2>
                      <div className="grid gap-3">
                        {currentKp.resources.map((resource) => (
                          <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-[#f9fafb] dark:bg-gray-800 rounded-xl hover:bg-primary/5 transition-colors group"
                          >
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-2xl shadow-sm">
                              {resource.resourceType === "video" && "🎥"}
                              {resource.resourceType === "article" && "📄"}
                              {resource.resourceType === "interactive" && "🎮"}
                              {resource.resourceType === "quiz" && "📝"}
                              {resource.resourceType === "other" && "📎"}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-[#181d27] dark:text-white group-hover:text-primary transition-colors">
                                {resource.title}
                              </h3>
                              {resource.description && (
                                <p className="text-sm text-[#717680] dark:text-gray-400">
                                  {resource.description}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#717680] group-hover:text-primary" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questions Section */}
                  <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold text-[#181d27] dark:text-white">
                        Câu hỏi luyện tập
                      </h2>
                      {questions.length > 0 && (
                        <span className="text-sm text-[#717680] dark:text-gray-400 bg-[#f9fafb] dark:bg-gray-800 px-3 py-1 rounded-full">
                          {questions.length} câu
                        </span>
                      )}
                    </div>

                    {loadingQuestions ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-[#717680] dark:text-gray-400">
                          Chưa có câu hỏi luyện tập cho bài học này
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {questions.map((question, index) => {
                          const isSubmitted = submittedQuestions.has(question.id);
                          const isRetrying = retryingQuestions.has(question.id);
                          const isCorrect = isSubmitted && !isRetrying && isAnswerCorrect(question);
                          const selectedAnswer = selectedAnswers[question.id];
                          const canInteract = !isSubmitted || isRetrying;

                          return (
                            <div
                              key={question.id}
                              className="bg-[#f9fafb] dark:bg-gray-800 rounded-xl p-5"
                            >
                              {/* Question Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold text-sm">
                                    {index + 1}
                                  </span>
                                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-medium">
                                    {getQuestionTypeLabel(question.questionType)}
                                  </span>
                                </div>
                                {isSubmitted && (
                                  <div>
                                    {isCorrect ? (
                                      <CheckCircle className="w-6 h-6 text-green-500" />
                                    ) : (
                                      <XCircle className="w-6 h-6 text-red-500" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Question Text */}
                              <p className="text-base font-medium text-[#181d27] dark:text-white mb-4">
                                {question.questionText}
                              </p>

                              {/* Multiple Choice Options */}
                              {question.questionType === "multiple_choice" && question.options && (
                                <div className="space-y-2 mb-4">
                                  {question.options.map((option: string, optIndex: number) => {
                                    const optionLetter = String.fromCharCode(65 + optIndex);
                                    const isSelected = selectedAnswer === option;
                                    const correctAnswerText = getCorrectAnswerText(question);
                                    const isCorrectOption = option === correctAnswerText;

                                    let optionClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
                                    if (isSubmitted && !isRetrying) {
                                      if (isCorrectOption) {
                                        optionClass += "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400";
                                      } else if (isSelected && !isCorrect) {
                                        optionClass += "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400";
                                      } else {
                                        optionClass += "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-[#535862] dark:text-gray-300";
                                      }
                                    } else {
                                      optionClass += isSelected
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary/50";
                                    }

                                    return (
                                      <button
                                        key={optIndex}
                                        onClick={() => canInteract && handleAnswerSelect(question.id, option)}
                                        disabled={!canInteract}
                                        className={optionClass}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="font-semibold">{optionLetter}.</span>
                                          <span>{option}</span>
                                          {isSubmitted && !isRetrying && isCorrectOption && (
                                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                          )}
                                          {isSubmitted && !isRetrying && isSelected && !isCorrect && (
                                            <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* True/False Options */}
                              {question.questionType === "true_false" && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  {["Đúng", "Sai"].map((option) => {
                                    const isSelected = selectedAnswer === option;
                                    const correctAnswerText = getCorrectAnswerText(question);
                                    const isCorrectOption = option === correctAnswerText;

                                    let optionClass = "p-4 rounded-xl border-2 transition-all text-center font-medium ";
                                    if (isSubmitted && !isRetrying) {
                                      if (isCorrectOption) {
                                        optionClass += "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400";
                                      } else if (isSelected && !isCorrect) {
                                        optionClass += "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400";
                                      } else {
                                        optionClass += "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600";
                                      }
                                    } else {
                                      optionClass += isSelected
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary/50";
                                    }

                                    return (
                                      <button
                                        key={option}
                                        onClick={() => canInteract && handleAnswerSelect(question.id, option)}
                                        disabled={!canInteract}
                                        className={optionClass}
                                      >
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Submit/Retry Buttons */}
                              {canInteract && selectedAnswer && (
                                <Button
                                  onClick={() => handleSubmitAnswer(question.id)}
                                  className="bg-primary text-white rounded-xl"
                                >
                                  {isRetrying ? "Nộp lại" : "Nộp bài"}
                                </Button>
                              )}

                              {isSubmitted && !isCorrect && !isRetrying && (
                                <Button
                                  onClick={() => handleRetryQuestion(question.id)}
                                  variant="bordered"
                                  className="mt-2 border-primary text-primary rounded-xl"
                                >
                                  Làm lại
                                </Button>
                              )}

                              {/* Feedback */}
                              {isSubmitted && !isRetrying && (
                                <div
                                  className={`mt-4 p-4 rounded-xl ${
                                    isCorrect
                                      ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                      : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    {isCorrect ? (
                                      <>
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <p className="font-semibold text-green-700 dark:text-green-400">
                                          Chúc mừng! Bạn trả lời đúng
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <p className="font-semibold text-red-700 dark:text-red-400">
                                          Câu trả lời chưa chính xác
                                        </p>
                                      </>
                                    )}
                                  </div>
                                  {!isCorrect && (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                      Đáp án đúng: {getCorrectAnswerText(question)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-[#717680] dark:text-gray-400">Chọn một bài học để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
}
