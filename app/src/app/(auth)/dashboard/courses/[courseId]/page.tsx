"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { addToast } from "@heroui/react";
import { useUser } from "@/hooks/useUser";
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
} from "lucide-react";
import { Button } from "@heroui/button";

interface KnowledgePoint {
  id: string;
  title: string;
  description: string;
  difficultyLevel: number;
  orderIndex: number;
  content?: {
    theory?: string;
    visualization?: string;
    questions?: any[];
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

export default function CoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKpId, setSelectedKpId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bookmarkedKps, setBookmarkedKps] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [retryingQuestions, setRetryingQuestions] = useState<Set<string>>(
    new Set()
  ); // Questions being retried
  const [questionAttempts, setQuestionAttempts] = useState<
    Record<string, { isCorrect: boolean; selectedAnswer: string }>
  >({});
  const [kpProgress, setKpProgress] = useState<
    Record<string, { masteryScore: number; confidence: number }>
  >({});
  const questionStartTimeRefs = useRef<Record<string, number>>({});

  // Get all knowledge points in order
  const allKnowledgePoints = useMemo(() => {
    if (!course) return [];
    const kps: { kp: KnowledgePoint; moduleId: string; sectionId: string }[] =
      [];
    course.modules.forEach((module) => {
      module.sections.forEach((section) => {
        section.knowledgePoints.forEach((kp) => {
          kps.push({ kp, moduleId: module.id, sectionId: section.id });
        });
      });
    });
    return kps;
  }, [course]);

  // Get current knowledge point
  const currentKp = useMemo(() => {
    if (!selectedKpId) return null;
    const found = allKnowledgePoints.find(
      (item) => item.kp.id === selectedKpId
    );
    return found?.kp || null;
  }, [selectedKpId, allKnowledgePoints]);

  // Get current index
  const currentIndex = useMemo(() => {
    if (!selectedKpId) return -1;
    return allKnowledgePoints.findIndex((item) => item.kp.id === selectedKpId);
  }, [selectedKpId, allKnowledgePoints]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Load progress for all KPs when course is loaded
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
              // If progress is null, student hasn't started this KP yet
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
              // Handle 404 or other errors gracefully
              if (error.response?.status === 404) {
                return null; // KP not started yet
              }
              console.error(
                `Failed to load progress for KP ${item.kp.id}:`,
                error
              );
              return null;
            }
          });

          const results = await Promise.all(progressPromises);
          const progressMap: Record<
            string,
            { masteryScore: number; confidence: number }
          > = {};

          results.forEach((result) => {
            if (result) {
              progressMap[result.kpId] = result.progress;
            }
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
    // Auto-expand first module and section, select first KP
    if (course && course.modules.length > 0 && !selectedKpId) {
      const firstModule = course.modules[0];
      setExpandedModules(new Set([firstModule.id]));

      if (firstModule.sections.length > 0) {
        const firstSection = firstModule.sections[0];
        setExpandedSections(new Set([firstSection.id]));

        if (firstSection.knowledgePoints.length > 0) {
          setSelectedKpId(firstSection.knowledgePoints[0].id);
        }
      }
    }
  }, [course, selectedKpId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getForLearning(courseId as string);
      setCourse(data);
    } catch (error: any) {
      console.error("Failed to fetch course:", error);
      addToast({
        description: "Không thể tải thông tin khóa học",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSelectKp = async (kpId: string) => {
    // Check if KP is locked
    const kpIndex = allKnowledgePoints.findIndex((item) => item.kp.id === kpId);
    if (kpIndex === -1) return;

    if (isKpLocked(kpIndex)) {
      const previousKp = allKnowledgePoints[kpIndex - 1];
      addToast({
        description: `Vui lòng hoàn thành "${previousKp.kp.title}" trước khi học bài này`,
        color: "warning",
      });
      return;
    }

    setSelectedKpId(kpId);
    // Auto-expand parent module and section
    const found = allKnowledgePoints.find((item) => item.kp.id === kpId);
    if (found) {
      setExpandedModules((prev) => new Set(prev).add(found.moduleId));
      setExpandedSections((prev) => new Set(prev).add(found.sectionId));
    }
    // fetchQuestions will be called automatically by useEffect when selectedKpId changes
  };

  const fetchQuestions = useCallback(
    async (kpId: string) => {
      try {
        setLoadingQuestions(true);

        // Get questions from KP content first
        const kp = allKnowledgePoints.find((item) => item.kp.id === kpId);
        let questionsData: any[] = [];

        if (kp?.kp.content?.questions && kp.kp.content.questions.length > 0) {
          // Use questions from content, add IDs if needed
          questionsData = kp.kp.content.questions.map((q, index) => ({
            ...q,
            id: q.id || `content-q-${index}`,
            questionType: q.type || "multiple_choice",
            questionText: q.questionText,
            correctAnswer: q.correctAnswer,
            options: q.options || [],
          }));
        } else {
          // Fallback to question bank if no content questions
          try {
            const data = await api.questionBank.getQuestionsByKp(kpId);
            questionsData = Array.isArray(data) ? data : [];
          } catch (error) {
            console.log("No question bank questions found");
          }
        }

        setQuestions(questionsData);

        // Reset answers for new KP
        setSelectedAnswers({});
        setSubmittedQuestions(new Set());
        setRetryingQuestions(new Set());
        setQuestionAttempts({});

        // Reset question start times
        questionStartTimeRefs.current = {};
      } catch (error: any) {
        console.error("Failed to fetch questions:", error);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    },
    [allKnowledgePoints]
  );

  // Fetch questions when selectedKpId changes
  useEffect(() => {
    if (selectedKpId && course) {
      fetchQuestions(selectedKpId);
    }
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

      // Check if next KP is locked
      if (isKpLocked(nextIndex)) {
        const currentKp = allKnowledgePoints[currentIndex];
        addToast({
          description: `Vui lòng hoàn thành "${currentKp.kp.title}" (đạt 80% điểm nắm vững) để tiếp tục`,
          color: "warning",
        });
        return;
      }

      handleSelectKp(nextKp.kp.id);
    }
  };

  const toggleBookmark = (kpId: string) => {
    const newBookmarked = new Set(bookmarkedKps);
    if (newBookmarked.has(kpId)) {
      newBookmarked.delete(kpId);
      addToast({ description: "Đã bỏ đánh dấu", color: "success" });
    } else {
      newBookmarked.add(kpId);
      addToast({ description: "Đã đánh dấu trang", color: "success" });
    }
    setBookmarkedKps(newBookmarked);
  };

  const getKpStatus = (
    kpId: string
  ): "not_started" | "in_progress" | "completed" => {
    if (kpId === selectedKpId) return "in_progress";

    // Check progress from state
    const progress = kpProgress[kpId];
    if (progress) {
      if (progress.masteryScore >= 80) return "completed";
      if (progress.masteryScore > 0) return "in_progress";
    }

    return "not_started";
  };

  // Check if KP is locked (previous KP not completed)
  const isKpLocked = (kpIndex: number): boolean => {
    if (kpIndex === 0) return false; // First KP is always unlocked

    // Check if previous KP is completed
    const previousKp = allKnowledgePoints[kpIndex - 1];
    if (!previousKp) return false;

    const previousProgress = kpProgress[previousKp.kp.id];
    if (!previousProgress) return true; // Previous KP not started = locked

    // Previous KP must have masteryScore >= 80 to unlock next KP
    return previousProgress.masteryScore < 80;
  };

  // Check if KP has been studied (has any progress)
  const hasKpBeenStudied = (kpId: string): boolean => {
    const progress = kpProgress[kpId];
    return progress !== undefined && progress.masteryScore > 0;
  };

  // Load progress when KP is selected
  useEffect(() => {
    const loadKpProgress = async () => {
      if (selectedKpId && user?.id) {
        try {
          const progress = await api.studentProgress.getStudentKpProgress(
            user.id,
            selectedKpId
          );
          setKpProgress((prev) => ({
            ...prev,
            [selectedKpId]: {
              masteryScore: progress.masteryScore,
              confidence: progress.confidence,
            },
          }));
        } catch (error: any) {
          // Progress not found is OK - student hasn't started this KP yet
          if (error.response?.status !== 404) {
            console.error("Failed to load KP progress:", error);
          }
        }
      }
    };

    loadKpProgress();
  }, [selectedKpId, user?.id]);

  const getStatusIcon = (
    status: "not_started" | "in_progress" | "completed"
  ) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <CheckCircle2 className="w-5 h-5 text-[#7f56d9]" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Track start time if this is the first interaction with this question
    if (!questionStartTimeRefs.current[questionId]) {
      questionStartTimeRefs.current[questionId] = Date.now();
    }
  };

  const handleRetryQuestion = (questionId: string) => {
    // Reset question state for retry
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
    // Reset start time for this question
    questionStartTimeRefs.current[questionId] = Date.now();
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!user?.id || !selectedKpId) {
      addToast({
        description: "Không thể lưu kết quả. Vui lòng thử lại.",
        color: "danger",
      });
      return;
    }

    const selectedAnswer = selectedAnswers[questionId];
    if (!selectedAnswer) {
      addToast({
        description: "Vui lòng chọn đáp án trước khi nộp bài",
        color: "danger",
      });
      return;
    }

    // Calculate time spent
    const startTime = questionStartTimeRefs.current[questionId] || Date.now();
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // Convert to seconds

    // Find the question to get correct answer
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      addToast({ description: "Không tìm thấy câu hỏi", color: "danger" });
      return;
    }

    const correctAnswerText = getCorrectAnswerText(question);
    const isCorrect = selectedAnswer === correctAnswerText;

    // Mark question as submitted immediately
    setSubmittedQuestions((prev) => new Set(prev).add(questionId));

    // Remove from retrying set
    setRetryingQuestions((prev) => {
      const newRetrying = new Set(prev);
      newRetrying.delete(questionId);
      return newRetrying;
    });

    // Save attempt result locally
    setQuestionAttempts((prev) => ({
      ...prev,
      [questionId]: {
        isCorrect: isCorrect,
        selectedAnswer: selectedAnswer,
      },
    }));

    // Check if this is a content question (not from question bank)
    const isContentQuestion = questionId.startsWith("content-q-");

    if (!isContentQuestion) {
      // Only submit to server for question bank questions
      try {
        const result = await api.studentProgress.submitQuestionAttempt({
          studentId: user.id,
          questionId: questionId,
          kpId: selectedKpId,
          selectedAnswer: selectedAnswer,
          timeSpent: timeSpent,
        });

        // Update KP progress state
        setKpProgress((prev) => ({
          ...prev,
          [selectedKpId]: {
            masteryScore: result.masteryScore,
            confidence: result.confidence,
          },
        }));

        // Show success message
        if (result.isCorrect) {
          addToast({
            description: `Chính xác! Điểm nắm vững: ${result.masteryScore}%`,
            color: "success",
          });
        } else {
          addToast({
            description: `Câu trả lời chưa đúng. Điểm nắm vững: ${result.masteryScore}%`,
            color: "primary",
          });
        }
      } catch (error: any) {
        console.error("Failed to submit answer:", error);
        addToast({
          description: "Không thể lưu kết quả. Vui lòng thử lại.",
          color: "danger",
        });
      }
    } else {
      // For content questions, just show immediate feedback
      if (isCorrect) {
        addToast({ description: "Chính xác!", color: "success" });
      } else {
        addToast({
          description: "Câu trả lời chưa đúng. Hãy thử lại!",
          color: "primary",
        });
      }
    }
  };

  // Get the actual correct answer text (handles both index and text format)
  const getCorrectAnswerText = (question: any): string => {
    if (
      question.questionType === "multiple_choice" &&
      question.options &&
      Array.isArray(question.options)
    ) {
      // Check if correctAnswer is an index (1-based)
      const answerIndex = parseInt(question.correctAnswer);
      if (
        !isNaN(answerIndex) &&
        answerIndex >= 1 &&
        answerIndex <= question.options.length
      ) {
        // Return the option text at that index (1-based to 0-based conversion)
        return question.options[answerIndex - 1];
      }
    }
    // Return as-is for other question types or if it's already text
    return question.correctAnswer;
  };

  // Check if answer is correct (handles both index and text format)
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
        <div className="flex items-center justify-center w-full h-screen">
          <p className="text-[#535862]">Đang tải...</p>
        </div>
      </LayoutDashboard>
    );
  }

  if (!course) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center w-full h-screen">
          <p className="text-[#535862]">Không tìm thấy khóa học</p>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-white">
        {/* Sidebar Navigation */}
        <div
          className={`bg-white border-r border-[#e9eaeb] transition-all duration-300 ${
            isSidebarOpen ? "w-80" : "w-0"
          } overflow-hidden flex flex-col`}
        >
          {isSidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div className="p-2 py-4 border-b border-[#e9eaeb] flex items-center justify-between rounded-br-3xl">
                <div className="flex items-center">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => router.back()}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-[#181d27] text-xs truncate">
                      {course.title}
                    </h2>
                  </div>
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-full"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation List */}
              <div className="flex-1 overflow-y-auto py-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="px-4 mb-2">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-[#7f56d9]" />
                      <span className="flex-1 text-left text-sm font-medium text-[#181d27]">
                        {module.title}
                      </span>
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {expandedModules.has(module.id) && (
                      <div className="mt-2 ml-6 space-y-1">
                        {module.sections.map((section) => (
                          <div key={section.id}>
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                              <span className="flex-1 text-left text-sm text-[#535862]">
                                {section.title}
                              </span>
                              {expandedSections.has(section.id) ? (
                                <ChevronUp className="w-3 h-3 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-gray-400" />
                              )}
                            </button>

                            {expandedSections.has(section.id) && (
                              <div className="mt-1 ml-4 space-y-1">
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
                                      onClick={() =>
                                        !isLocked && handleSelectKp(kp.id)
                                      }
                                      disabled={isLocked}
                                      className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all ${
                                        isLocked
                                          ? "opacity-50 cursor-not-allowed bg-gray-100"
                                          : isSelected
                                          ? "bg-[#7f56d9]/10 border border-[#7f56d9]"
                                          : "hover:bg-gray-50"
                                      }`}
                                      title={
                                        isLocked
                                          ? "Vui lòng hoàn thành bài học trước đó"
                                          : undefined
                                      }
                                    >
                                      {isLocked ? (
                                        <Lock className="w-5 h-5 text-gray-400" />
                                      ) : (
                                        getStatusIcon(status)
                                      )}
                                      <span
                                        className={`flex-1 text-left text-xs ${
                                          isLocked
                                            ? "text-gray-400"
                                            : isSelected
                                            ? "font-semibold text-[#7f56d9]"
                                            : hasStudied
                                            ? "text-[#535862] font-medium"
                                            : "text-[#535862]"
                                        }`}
                                      >
                                        {kp.title}
                                      </span>
                                      {status === "completed" && !isLocked && (
                                        <Trophy className="w-3 h-3 text-yellow-500" />
                                      )}
                                      {hasStudied &&
                                        !isLocked &&
                                        status !== "completed" && (
                                          <span className="text-xs text-blue-500 font-medium">
                                            {kpProgress[kp.id]?.masteryScore ||
                                              0}
                                            %
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
            className="absolute left-4 top-[160px] z-10 bg-white border border-[#e9eaeb] rounded-full shadow-md"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentKp ? (
            <>
              {/* Top Navigation */}
              <div className="bg-white border-b border-[#e9eaeb] p-4 flex items-center justify-between rounded-bl-3xl">
                <div className="flex items-center gap-4">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="rounded-xl border border-[#e9eaeb]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={handleNext}
                    disabled={
                      currentIndex === allKnowledgePoints.length - 1 ||
                      (currentIndex >= 0 && isKpLocked(currentIndex + 1))
                    }
                    className="rounded-xl border border-[#e9eaeb]"
                    title={
                      currentIndex >= 0 && isKpLocked(currentIndex + 1)
                        ? "Vui lòng hoàn thành bài học hiện tại (đạt 80% điểm nắm vững) để tiếp tục"
                        : undefined
                    }
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Title and Bookmark */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h1 className="text-3xl font-bold text-[#181d27] flex-1">
                        {currentKp.title}
                      </h1>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => toggleBookmark(currentKp.id)}
                        startContent={
                          <Flag
                            className={`w-4 h-4 ${
                              bookmarkedKps.has(currentKp.id)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        }
                        className={`rounded-2xl ${
                          bookmarkedKps.has(currentKp.id)
                            ? "bg-red-50 border border-red-200"
                            : "border border-[#e9eaeb]"
                        }`}
                      >
                        <span className="text-sm">
                          {bookmarkedKps.has(currentKp.id)
                            ? "Đã đánh dấu"
                            : "Đánh dấu trang này"}
                        </span>
                      </Button>
                    </div>

                    {/* Description */}
                    {currentKp.description && (
                      <div className="bg-white rounded-lg p-6 border border-[#e9eaeb] mb-6">
                        <p className="text-[#535862] leading-relaxed whitespace-pre-line">
                          {currentKp.description}
                        </p>
                      </div>
                    )}

                    {/* Theory Content */}
                    {currentKp.content?.theory && (
                      <div className="bg-white rounded-lg p-6 border border-[#e9eaeb] mb-6">
                        <h3 className="text-xl font-semibold text-[#181d27] mb-4 flex items-center gap-3">
                          <BookOpen className="w-6 h-6 text-[#7f56d9]" />
                          Lý thuyết
                        </h3>
                        <div
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: currentKp.content.theory,
                          }}
                        />
                      </div>
                    )}

                    {/* Visualization Content */}
                    {currentKp.content?.visualization && (
                      <div className="bg-white rounded-lg p-6 border border-[#e9eaeb] mb-6">
                        <h3 className="text-xl font-semibold text-[#181d27] mb-4 flex items-center gap-3">
                          <Play className="w-6 h-6 text-[#7f56d9]" />
                          Trực quan hoá
                        </h3>
                        <div
                          className="bg-gray-50 rounded-2xl p-4 min-h-[300px]"
                          dangerouslySetInnerHTML={{
                            __html: currentKp.content.visualization,
                          }}
                        />
                      </div>
                    )}

                    {/* Resources */}
                    {currentKp.resources && currentKp.resources.length > 0 && (
                      <div className="space-y-6">
                        {currentKp.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="bg-white rounded-lg p-6 border border-[#e9eaeb]"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              {resource.resourceType === "video" ? (
                                <Video className="w-6 h-6 text-[#7f56d9]" />
                              ) : (
                                <FileText className="w-6 h-6 text-[#7f56d9]" />
                              )}
                              <h3 className="text-xl font-semibold text-[#181d27]">
                                {resource.title}
                              </h3>
                            </div>

                            {resource.description && (
                              <p className="text-[#535862] mb-4">
                                {resource.description}
                              </p>
                            )}

                            {resource.resourceType === "video" ? (
                              <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-video">
                                <iframe
                                  src={resource.url}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-[#e9eaeb] p-4 bg-gray-50">
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[#7f56d9] hover:underline"
                                >
                                  <FileText className="w-5 h-5" />
                                  <span>Xem tài liệu</span>
                                  <Play className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Questions Section */}
                    <div className="bg-white rounded-lg p-6 border border-[#e9eaeb] mt-6">
                      <div className="flex items-center gap-3 mb-6">
                        <HelpCircle className="w-6 h-6 text-[#7f56d9]" />
                        <h3 className="text-xl font-semibold text-[#181d27]">
                          Câu hỏi luyện tập
                        </h3>
                        {questions.length > 0 && (
                          <span className="text-sm text-[#535862] bg-gray-100 px-3 py-1 rounded-full">
                            {questions.length} câu hỏi
                          </span>
                        )}
                      </div>

                      {loadingQuestions ? (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-[#535862]">Đang tải câu hỏi...</p>
                        </div>
                      ) : questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-[#535862]">
                            Chưa có câu hỏi luyện tập cho bài học này
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {questions.map((question, index) => {
                            const isSubmitted = submittedQuestions.has(
                              question.id
                            );
                            const isRetrying = retryingQuestions.has(
                              question.id
                            );
                            const isCorrect =
                              isSubmitted &&
                              !isRetrying &&
                              isAnswerCorrect(question);
                            const selectedAnswer = selectedAnswers[question.id];
                            const canInteract = !isSubmitted || isRetrying;

                            return (
                              <div
                                key={question.id}
                                className="border border-[#e9eaeb] rounded-lg p-6 bg-gray-50"
                              >
                                {/* Question Header */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7f56d9] text-white font-semibold text-sm">
                                      {index + 1}
                                    </span>
                                    <div>
                                      <span className="text-xs text-[#7f56d9] bg-purple-100 px-2 py-1 rounded-full font-medium">
                                        {getQuestionTypeLabel(
                                          question.questionType
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  {isSubmitted && (
                                    <div className="flex items-center gap-2">
                                      {isCorrect ? (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                      ) : (
                                        <XCircle className="w-6 h-6 text-red-500" />
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Question Text */}
                                <p className="text-base font-medium text-[#181d27] mb-4">
                                  {question.questionText}
                                </p>

                                {/* Answer Options */}
                                {question.questionType === "multiple_choice" &&
                                  question.options &&
                                  Array.isArray(question.options) &&
                                  question.options.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                      {question.options.map(
                                        (option: string, optIndex: number) => {
                                          const optionLetter =
                                            String.fromCharCode(65 + optIndex); // A, B, C, D
                                          const isSelected =
                                            selectedAnswer === option;
                                          const correctAnswerText =
                                            getCorrectAnswerText(question);
                                          const isCorrectOption =
                                            option === correctAnswerText;

                                          let optionClass =
                                            "w-full text-left p-4 rounded-xl border-2 transition-all ";
                                          if (isSubmitted && !isRetrying) {
                                            if (isCorrectOption) {
                                              optionClass +=
                                                "bg-green-50 border-green-500 text-green-700";
                                            } else if (
                                              isSelected &&
                                              !isCorrect
                                            ) {
                                              optionClass +=
                                                "bg-red-50 border-red-500 text-red-700";
                                            } else {
                                              optionClass +=
                                                "bg-gray-50 border-gray-200 text-gray-600";
                                            }
                                          } else {
                                            optionClass += isSelected
                                              ? "bg-[#7f56d9]/10 border-[#7f56d9] text-[#7f56d9]"
                                              : "bg-white border-gray-200 hover:border-[#7f56d9]/50 hover:bg-gray-50";
                                          }

                                          return (
                                            <button
                                              key={optIndex}
                                              onClick={() =>
                                                canInteract &&
                                                handleAnswerSelect(
                                                  question.id,
                                                  option
                                                )
                                              }
                                              disabled={!canInteract}
                                              className={optionClass}
                                            >
                                              <div className="flex items-center gap-3">
                                                <span className="font-semibold">
                                                  {optionLetter}.
                                                </span>
                                                <span>{option}</span>
                                                {isSubmitted &&
                                                  !isRetrying &&
                                                  isCorrectOption && (
                                                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                                  )}
                                                {isSubmitted &&
                                                  !isRetrying &&
                                                  isSelected &&
                                                  !isCorrect && (
                                                    <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                                                  )}
                                              </div>
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}

                                {/* True/False Options */}
                                {question.questionType === "true_false" && (
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    {["Đúng", "Sai"].map((option) => {
                                      const isSelected =
                                        selectedAnswer === option;
                                      const correctAnswerText =
                                        getCorrectAnswerText(question);
                                      const isCorrectOption =
                                        option === correctAnswerText;

                                      let optionClass =
                                        "p-4 rounded-xl border-2 transition-all text-center font-medium ";
                                      if (isSubmitted && !isRetrying) {
                                        if (isCorrectOption) {
                                          optionClass +=
                                            "bg-green-50 border-green-500 text-green-700";
                                        } else if (isSelected && !isCorrect) {
                                          optionClass +=
                                            "bg-red-50 border-red-500 text-red-700";
                                        } else {
                                          optionClass +=
                                            "bg-gray-50 border-gray-200 text-gray-600";
                                        }
                                      } else {
                                        optionClass += isSelected
                                          ? "bg-[#7f56d9]/10 border-[#7f56d9] text-[#7f56d9]"
                                          : "bg-white border-gray-200 hover:border-[#7f56d9]/50 hover:bg-gray-50";
                                      }

                                      return (
                                        <button
                                          key={option}
                                          onClick={() =>
                                            canInteract &&
                                            handleAnswerSelect(
                                              question.id,
                                              option
                                            )
                                          }
                                          disabled={!canInteract}
                                          className={optionClass}
                                        >
                                          {option}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Fill in blank or Short answer */}
                                {(question.questionType === "fill_in_blank" ||
                                  question.questionType === "short_answer") && (
                                  <div className="mb-4">
                                    <textarea
                                      value={selectedAnswer || ""}
                                      onChange={(e) =>
                                        canInteract &&
                                        handleAnswerSelect(
                                          question.id,
                                          e.target.value
                                        )
                                      }
                                      disabled={!canInteract}
                                      placeholder="Nhập câu trả lời của bạn..."
                                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-[#7f56d9] focus:outline-none resize-none min-h-[100px]"
                                    />
                                    {isSubmitted && !isRetrying && (
                                      <div className="mt-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                                        <p className="text-sm font-medium text-blue-900 mb-1">
                                          Đáp án đúng:
                                        </p>
                                        <p className="text-blue-700">
                                          {getCorrectAnswerText(question)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Submit Button */}
                                {canInteract && selectedAnswer && (
                                  <Button
                                    onClick={() =>
                                      handleSubmitAnswer(question.id)
                                    }
                                    className="bg-[#7f56d9] text-white rounded-xl"
                                  >
                                    {isRetrying ? "Nộp lại" : "Nộp bài"}
                                  </Button>
                                )}

                                {/* Retry Button - Show for incorrect answers */}
                                {isSubmitted && !isCorrect && !isRetrying && (
                                  <Button
                                    onClick={() =>
                                      handleRetryQuestion(question.id)
                                    }
                                    variant="light"
                                    className="mt-2 border border-[#7f56d9] text-[#7f56d9] rounded-xl"
                                  >
                                    Làm lại
                                  </Button>
                                )}

                                {/* Feedback */}
                                {isSubmitted && !isRetrying && (
                                  <div
                                    className={`mt-4 p-4 rounded-xl ${
                                      isCorrect
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-red-50 border border-red-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      {isCorrect ? (
                                        <>
                                          <CheckCircle className="w-5 h-5 text-green-600" />
                                          <p className="font-semibold text-green-700">
                                            Chúc mừng! Bạn trả lời đúng
                                          </p>
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="w-5 h-5 text-red-600" />
                                          <p className="font-semibold text-red-700">
                                            Câu trả lời chưa chính xác
                                          </p>
                                        </>
                                      )}
                                    </div>
                                    {!isCorrect && (
                                      <p className="text-sm text-red-600">
                                        Đáp án đúng:{" "}
                                        {getCorrectAnswerText(question)}
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
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#535862]">Chọn một bài học để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
}
