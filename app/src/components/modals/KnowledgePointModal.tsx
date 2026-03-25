"use client";

import { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Layout,
  Pencil,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  Plus,
  Trash,
  Save,
  Loader2,
  ChevronLeft,
  ChevronDown,
  Upload,
  Youtube,
  ExternalLink,
  File,
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  addToast,
} from "@heroui/react";
import { api } from "@/lib/api";
import PDFSlideViewer from "../ui/PDFSlideViewer";

interface KnowledgePointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  sectionTitle?: string;
}

type TabType = "general" | "content" | "questions" | "resources";

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  video: "Video",
  article: "Bài viết",
  interactive: "Tương tác",
  quiz: "Bài tập",
  other: "Khác",
};

const KnowledgePointModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  sectionTitle,
}: KnowledgePointModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [saving, setSaving] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    type: "multiple_choice" as
      | "multiple_choice"
      | "true_false"
      | "fill_blank"
      | "game",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    gameType: "flashcard" as "flashcard" | "matching" | "sorting",
  });
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);
  const [generateDifficulty, setGenerateDifficulty] = useState(3);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficultyLevel: 1,
    // Content only contains slideUrl, slideFileName, youtubeUrl
    content: {
      slideUrl: "",
      slideFileName: "",
      youtubeUrl: "",
    },
    questions: [] as any[],
    resources: [] as any[],
  });

  useEffect(() => {
    if (initialData) {
      // Questions now come from initialData.questions (from API join) instead of content.questions
      const questions = initialData.questions || [];

      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        difficultyLevel: initialData.difficultyLevel || 1,
        // Content only contains slideUrl, slideFileName, youtubeUrl
        content: {
          slideUrl: initialData.content?.slideUrl || "",
          slideFileName: initialData.content?.slideFileName || "",
          youtubeUrl: initialData.content?.youtubeUrl || "",
        },
        questions: questions,
        resources: initialData.resources || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        difficultyLevel: 1,
        // Content only contains slideUrl, slideFileName, youtubeUrl
        content: {
          slideUrl: "",
          slideFileName: "",
          youtubeUrl: "",
        },
        questions: [],
        resources: [],
      });
    }
  }, [initialData, isOpen]);

  // Resource States
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    resourceType: "video" as
      | "video"
      | "article"
      | "interactive"
      | "quiz"
      | "other",
  });
  const [uploading, setUploading] = useState(false);

  // ... (previous useEffect)

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.url) {
      addToast({
        description: "Vui lòng nhập tiêu đề và đường dẫn tài liệu",
        color: "danger",
      });
      return;
    }

    setFormData({
      ...formData,
      resources: [
        ...formData.resources,
        {
          ...newResource,
          orderIndex: formData.resources.length,
        },
      ],
    });

    setNewResource({
      title: "",
      url: "",
      resourceType: "video",
    });
  };

  const handleRemoveResource = (index: number) => {
    const updatedResources = [...formData.resources];
    updatedResources.splice(index, 1);
    setFormData({ ...formData, resources: updatedResources });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await api.upload.file(file);

      setNewResource({
        ...newResource,
        title: file.name,
        url: response.url,
        resourceType: "other",
      });
      addToast({ description: "Upload file thành công", color: "success" });
    } catch (error) {
      console.error("Upload failed", error);
      addToast({ description: "Upload file thất bại", color: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      addToast({
        description: "Chỉ hỗ trợ file PDF, PPTX, PPT, DOCX, DOC",
        color: "danger",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      addToast({
        description: "File không được vượt quá 50MB",
        color: "danger",
      });
      return;
    }

    try {
      setUploadingSlide(true);
      setUploadProgress(0);
      const response = await api.upload.document(file, (progress) => {
        setUploadProgress(progress);
      });

      setFormData({
        ...formData,
        content: {
          ...formData.content,
          slideUrl: response.url,
          slideFileName: file.name,
        },
      });
      addToast({ description: "Upload slide thành công", color: "success" });
    } catch (error) {
      console.error("Slide upload failed", error);
      addToast({ description: "Upload slide thất bại", color: "danger" });
    } finally {
      setUploadingSlide(false);
      setUploadProgress(0);
    }
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleAddQuestion = () => {
    if (!newQuestion.questionText) {
      addToast({
        description: "Vui lòng nhập nội dung câu hỏi",
        color: "danger",
      });
      return;
    }

    if (newQuestion.type === "multiple_choice") {
      const validOptions = newQuestion.options.filter(
        (opt) => opt.trim() !== ""
      );
      if (validOptions.length < 2) {
        addToast({
          description: "Câu hỏi trắc nghiệm cần ít nhất 2 đáp án",
          color: "danger",
        });
        return;
      }
      if (!newQuestion.correctAnswer) {
        addToast({ description: "Vui lòng chọn đáp án đúng", color: "danger" });
        return;
      }
    }

    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          ...newQuestion,
          orderIndex: formData.questions.length,
        },
      ],
    });

    // Reset form
    setNewQuestion({
      type: "multiple_choice",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      gameType: "flashcard",
    });
    setShowQuestionForm(false);
    addToast({ description: "Đã thêm câu hỏi thành công", color: "success" });
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({ ...formData, questions: updatedQuestions });
    addToast({ description: "Đã xóa câu hỏi", color: "success" });
  };

  const handleGenerateQuestions = async () => {
    if (!initialData?.id) {
      addToast({
        description: "Vui lòng lưu KP trước khi generate câu hỏi bằng AI",
        color: "warning",
      });
      return;
    }

    try {
      setGeneratingQuestions(true);
      const result = await api.questionBank.generateBatch({
        kpId: initialData.id,
        count: generateCount,
        difficulty: generateDifficulty,
        questionType: "multiple_choice",
        useSlides: true,
        useResources: true,
        useExistingQuestions: true,
      });

      const generated = Array.isArray(result?.questions) ? result.questions : [];
      if (generated.length === 0) {
        addToast({
          description: "Không tạo được câu hỏi mới. Thử lại với độ khó hoặc số lượng khác.",
          color: "warning",
        });
        return;
      }

      const mappedGenerated = generated.map((question: any, index: number) => ({
        type: question.questionType || "multiple_choice",
        questionType: question.questionType || "multiple_choice",
        questionText: question.questionText,
        options: Array.isArray(question.options) ? question.options : [],
        correctAnswer: question.correctAnswer || "",
        explanation: "",
        orderIndex: formData.questions.length + index,
      }));

      setFormData((prev) => ({
        ...prev,
        questions: [...prev.questions, ...mappedGenerated],
      }));
      addToast({
        description: `Đã tạo ${mappedGenerated.length} câu hỏi mới`,
        color: "success",
      });
    } catch (error) {
      console.error("Generate questions failed", error);
      addToast({
        description: "Không thể generate câu hỏi bằng AI",
        color: "danger",
      });
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const updateQuestionOption = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleSave = async () => {
    if (!formData.title) {
      addToast({
        description: "Vui lòng nhập tiêu đề điểm kiến thức",
        color: "danger",
      });
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
      addToast({
        description: "Lưu điểm kiến thức thành công",
        color: "success",
      });
      onClose();
    } catch (error) {
      console.error("Failed to save KP:", error);
      addToast({
        description: "Không thể lưu điểm kiến thức",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const SidebarItem = ({
    tab,
    icon: Icon,
    label,
  }: {
    tab: TabType;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tab
          ? "bg-primary text-white shadow-sm"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-card-border dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-main dark:text-white">
              {initialData
                ? "Chỉnh sửa Điểm Kiến Thức"
                : "Thêm Điểm Kiến Thức Mới"}
            </h2>
            {sectionTitle && (
              <p className="text-sm text-text-muted dark:text-gray-500">
                Trong bài học:{" "}
                <span className="font-medium">{sectionTitle}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu & Đóng
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-card-border dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4 space-y-2 overflow-y-auto">
          <div className="mb-6 px-4">
            <p className="text-xs font-semibold text-text-muted dark:text-gray-500 uppercase tracking-wider">
              Nội dung
            </p>
          </div>
          <SidebarItem tab="general" icon={Pencil} label="Thông tin chung" />
          <SidebarItem tab="content" icon={BookOpen} label="Nội dung bài học" />
          <div className="my-4 border-t border-gray-200 dark:border-gray-800 pt-4 px-4">
            <p className="text-xs font-semibold text-text-muted dark:text-gray-500 uppercase tracking-wider">
              Mở rộng
            </p>
          </div>
          <SidebarItem
            tab="questions"
            icon={HelpCircle}
            label="Câu hỏi luyện tập"
          />
          <SidebarItem
            tab="resources"
            icon={LinkIcon}
            label="Tài liệu tham khảo"
          />
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                        Tiêu đề <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-card-border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white dark:bg-gray-800 text-text-main dark:text-white"
                        placeholder="Nhập tiêu đề điểm kiến thức..."
                        autoFocus
                      />
                    </div>
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                          Mức độ khó (1-5)
                        </label>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              variant="bordered"
                              className="w-full justify-between capitalize text-left"
                              endContent={
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              }
                            >
                              {formData.difficultyLevel === 1
                                ? "Dễ"
                                : formData.difficultyLevel === 2
                                ? "Trung bình"
                                : formData.difficultyLevel === 3
                                ? "Khá"
                                : formData.difficultyLevel === 4
                                ? "Khó"
                                : "Rất khó"}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Chọn mức độ khó"
                            variant="flat"
                            disallowEmptySelection
                            selectionMode="single"
                            selectedKeys={
                              new Set([String(formData.difficultyLevel)])
                            }
                            onSelectionChange={(keys) => {
                              const selectedKey = Array.from(keys)[0];
                              setFormData({
                                ...formData,
                                difficultyLevel: Number(selectedKey),
                              });
                            }}
                          >
                            <DropdownItem key="1">Dễ</DropdownItem>
                            <DropdownItem key="2">Trung bình</DropdownItem>
                            <DropdownItem key="3">Khá</DropdownItem>
                            <DropdownItem key="4">Khó</DropdownItem>
                            <DropdownItem key="5">Rất khó</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Nội dung giảng dạy
                  </h3>

                  {/* Slide Upload */}
                  <div className="space-y-4 mb-8">
                    <label className="block text-sm font-medium text-text-main dark:text-gray-300">
                      Slide bài giảng
                    </label>
                    <p className="text-xs text-text-muted dark:text-gray-500">
                      Hỗ trợ PDF, PPTX, PPT, DOCX, DOC (tối đa 50MB)
                    </p>

                    {formData.content.slideUrl ? (
                      <div className="space-y-3">
                        {/* File info bar */}
                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                          <File className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                          <p className="flex-1 text-sm font-medium text-text-main dark:text-white truncate">
                            {formData.content.slideFileName || "Slide đã tải lên"}
                          </p>
                          <button
                            onClick={() =>
                              setFormData({
                                ...formData,
                                content: {
                                  ...formData.content,
                                  slideUrl: "",
                                  slideFileName: "",
                                },
                              })
                            }
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>

                        {/* File Preview */}
                        {formData.content.slideFileName?.toLowerCase().endsWith(".pdf") ? (
                          <PDFSlideViewer url={formData.content.slideUrl} />
                        ) : /\.(pptx?|docx?)$/i.test(formData.content.slideFileName || "") ? (
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Preview
                              </span>
                            </div>
                            <iframe
                              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(formData.content.slideUrl)}`}
                              className="w-full h-[500px]"
                              title="Document Preview"
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        {uploadingSlide ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-text-muted dark:text-gray-400">
                              Đang tải lên... {uploadProgress}%
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-sm text-text-muted dark:text-gray-400">
                              Nhấn để chọn file hoặc kéo thả vào đây
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.pptx,.ppt,.docx,.doc"
                          onChange={handleSlideUpload}
                          disabled={uploadingSlide}
                        />
                      </label>
                    )}
                  </div>

                  {/* YouTube Link */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-text-main dark:text-gray-300">
                      Video YouTube
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                        <input
                          type="url"
                          value={formData.content.youtubeUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              content: {
                                ...formData.content,
                                youtubeUrl: e.target.value,
                              },
                            })
                          }
                          className="w-full pl-11 pr-4 py-2 border border-card-border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white dark:bg-gray-800 text-text-main dark:text-white"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      {formData.content.youtubeUrl && (
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              content: {
                                ...formData.content,
                                youtubeUrl: "",
                              },
                            })
                          }
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* YouTube Preview */}
                    {getYoutubeEmbedUrl(formData.content.youtubeUrl) && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Preview
                          </span>
                        </div>
                        <div className="aspect-video">
                          <iframe
                            src={getYoutubeEmbedUrl(formData.content.youtubeUrl)!}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === "questions" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-main dark:text-white">
                    Danh sách câu hỏi
                  </h3>
                  <button
                    onClick={() => setShowQuestionForm(!showQuestionForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {showQuestionForm ? "Đóng form" : "Thêm câu hỏi"}
                  </button>
                </div>

                <div className="bg-[#f8f9fb] dark:bg-gray-800/40 p-4 rounded-xl border border-[#e9eaeb] dark:border-gray-700 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full border border-[#e9eaeb] dark:border-gray-700 bg-white dark:bg-gray-900 text-[#535862] dark:text-gray-300">
                      Tổng câu hiện tại: {formData.questions.length}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full border ${
                        formData.questions.length >= 8
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      Yêu cầu tối thiểu để xuất bản: 8 câu/KP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-[#535862] dark:text-gray-300 mb-1">
                        Số câu generate
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={generateCount}
                        onChange={(e) => setGenerateCount(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#535862] dark:text-gray-300 mb-1">
                        Độ khó
                      </label>
                      <select
                        value={generateDifficulty}
                        onChange={(e) => setGenerateDifficulty(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((difficulty) => (
                          <option key={difficulty} value={difficulty}>
                            {difficulty}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <button
                        onClick={handleGenerateQuestions}
                        disabled={generatingQuestions || !initialData?.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#6244F4] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {generatingQuestions ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang generate...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Generate câu hỏi bằng AI (slide/docs/pptx + câu cũ)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {!initialData?.id && (
                    <p className="text-xs text-amber-700">
                      Cần lưu KP trước để dùng chức năng generate AI.
                    </p>
                  )}
                </div>

                {/* Question Form */}
                {showQuestionForm && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-text-main dark:text-gray-300">
                        Loại câu hỏi:
                      </label>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            className="capitalize"
                            endContent={<ChevronDown className="w-4 h-4" />}
                          >
                            {newQuestion.type === "multiple_choice"
                              ? "Trắc nghiệm"
                              : newQuestion.type === "true_false"
                              ? "Đúng/Sai"
                              : newQuestion.type === "fill_blank"
                              ? "Điền vào chỗ trống"
                              : "Game tương tác"}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Loại câu hỏi"
                          selectionMode="single"
                          selectedKeys={new Set([newQuestion.type])}
                          onSelectionChange={(keys) =>
                            setNewQuestion({
                              ...newQuestion,
                              type: Array.from(keys)[0] as any,
                            })
                          }
                        >
                          <DropdownItem key="multiple_choice">
                            Trắc nghiệm
                          </DropdownItem>
                          <DropdownItem key="true_false">Đúng/Sai</DropdownItem>
                          <DropdownItem key="fill_blank">
                            Điền vào chỗ trống
                          </DropdownItem>
                          <DropdownItem key="game">Game tương tác</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                        Nội dung câu hỏi <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={newQuestion.questionText}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            questionText: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-card-border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-800 text-text-main dark:text-white"
                        rows={3}
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                    </div>

                    {/* Multiple Choice Options */}
                    {newQuestion.type === "multiple_choice" && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-text-main dark:text-gray-300">
                          Các đáp án
                        </label>
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={newQuestion.correctAnswer === option}
                              onChange={() =>
                                setNewQuestion({
                                  ...newQuestion,
                                  correctAnswer: option,
                                })
                              }
                              className="w-4 h-4 text-primary"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateQuestionOption(index, e.target.value)
                              }
                              className="flex-1 px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-800 text-text-main dark:text-white"
                              placeholder={`Đáp án ${String.fromCharCode(
                                65 + index
                              )}`}
                            />
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            setNewQuestion({
                              ...newQuestion,
                              options: [...newQuestion.options, ""],
                            })
                          }
                          className="text-sm text-primary hover:underline"
                        >
                          + Thêm đáp án
                        </button>
                      </div>
                    )}

                    {/* True/False Options */}
                    {newQuestion.type === "true_false" && (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="trueFalse"
                            checked={newQuestion.correctAnswer === "true"}
                            onChange={() =>
                              setNewQuestion({
                                ...newQuestion,
                                correctAnswer: "true",
                              })
                            }
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm text-text-main dark:text-gray-300">
                            Đúng
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="trueFalse"
                            checked={newQuestion.correctAnswer === "false"}
                            onChange={() =>
                              setNewQuestion({
                                ...newQuestion,
                                correctAnswer: "false",
                              })
                            }
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm text-text-main dark:text-gray-300">
                            Sai
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Fill in the Blank */}
                    {newQuestion.type === "fill_blank" && (
                      <div>
                        <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                          Đáp án đúng
                        </label>
                        <input
                          type="text"
                          value={newQuestion.correctAnswer}
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              correctAnswer: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-800 text-text-main dark:text-white"
                          placeholder="Nhập đáp án đúng..."
                        />
                      </div>
                    )}

                    {/* Game Type */}
                    {newQuestion.type === "game" && (
                      <div>
                        <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                          Loại game
                        </label>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              variant="bordered"
                              className="capitalize"
                              endContent={<ChevronDown className="w-4 h-4" />}
                            >
                              {newQuestion.gameType === "flashcard"
                                ? "Flashcard"
                                : newQuestion.gameType === "matching"
                                ? "Nối từ"
                                : "Sắp xếp"}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Loại game"
                            selectionMode="single"
                            selectedKeys={new Set([newQuestion.gameType])}
                            onSelectionChange={(keys) =>
                              setNewQuestion({
                                ...newQuestion,
                                gameType: Array.from(keys)[0] as any,
                              })
                            }
                          >
                            <DropdownItem key="flashcard">
                              Flashcard
                            </DropdownItem>
                            <DropdownItem key="matching">Nối từ</DropdownItem>
                            <DropdownItem key="sorting">Sắp xếp</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                        Giải thích (không bắt buộc)
                      </label>
                      <textarea
                        value={newQuestion.explanation}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            explanation: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-card-border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-gray-800 text-text-main dark:text-white"
                        rows={2}
                        placeholder="Giải thích đáp án..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowQuestionForm(false)}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleAddQuestion}
                        className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Thêm câu hỏi
                      </button>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-3">
                  {formData.questions.map((question, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                              {question.type === "multiple_choice"
                                ? "Trắc nghiệm"
                                : question.type === "true_false"
                                ? "Đúng/Sai"
                                : question.type === "fill_blank"
                                ? "Điền vào chỗ trống"
                                : "Game"}
                            </span>
                            {question.type === "game" && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded font-medium">
                                {question.gameType === "flashcard"
                                  ? "Flashcard"
                                  : question.gameType === "matching"
                                  ? "Nối từ"
                                  : "Sắp xếp"}
                              </span>
                            )}
                          </div>
                          <p className="text-text-main dark:text-white font-medium mb-2">
                            {question.questionText}
                          </p>
                          {question.type === "multiple_choice" &&
                            question.options && (
                              <div className="space-y-1 text-sm">
                                {question.options
                                  .filter((opt: string) => opt.trim())
                                  .map((option: string, optIndex: number) => (
                                    <div
                                      key={optIndex}
                                      className={`flex items-center gap-2 ${
                                        option === question.correctAnswer
                                          ? "text-green-600 dark:text-green-400 font-medium"
                                          : "text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {option === question.correctAnswer && (
                                        <span>✓</span>
                                      )}
                                      {String.fromCharCode(65 + optIndex)}.{" "}
                                      {option}
                                    </div>
                                  ))}
                              </div>
                            )}
                          {question.explanation && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              💡 {question.explanation}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {formData.questions.length === 0 && !showQuestionForm && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
                      <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-text-muted dark:text-gray-500">
                        Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-main dark:text-white">
                    Tài liệu
                  </h3>
                </div>

                {/* Add Resource Form */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            className="w-full justify-between"
                            endContent={
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            }
                          >
                            {RESOURCE_TYPE_LABELS[newResource.resourceType]}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Loại tài liệu"
                          selectionMode="single"
                          selectedKeys={new Set([newResource.resourceType])}
                          onSelectionChange={(keys) =>
                            setNewResource({
                              ...newResource,
                              resourceType: Array.from(keys)[0] as any,
                            })
                          }
                        >
                          <DropdownItem key="video">Video</DropdownItem>
                          <DropdownItem key="article">Bài viết</DropdownItem>
                          <DropdownItem key="interactive">
                            Tương tác
                          </DropdownItem>
                          <DropdownItem key="quiz">Bài tập</DropdownItem>
                          <DropdownItem key="other">Khác</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={newResource.title}
                        onChange={(e) =>
                          setNewResource({
                            ...newResource,
                            title: e.target.value,
                          })
                        }
                        placeholder="Tiêu đề tài liệu"
                        className="w-full px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="col-span-5 flex gap-2">
                      <input
                        type="text"
                        value={newResource.url}
                        onChange={(e) =>
                          setNewResource({
                            ...newResource,
                            url: e.target.value,
                          })
                        }
                        placeholder="URL tài liệu"
                        className="flex-1 px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-gray-800"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                        <button className="h-full px-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <div className="text-sm">Up</div>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={handleAddResource}
                        className="px-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resource List */}
                <div className="space-y-3">
                  {formData.resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                          {resource.resourceType === "video" && (
                            <div className="text-base">🎥</div>
                          )}
                          {resource.resourceType === "article" && (
                            <div className="text-base">📄</div>
                          )}
                          {resource.resourceType !== "video" &&
                            resource.resourceType !== "article" && (
                              <LinkIcon className="w-4 h-4" />
                            )}
                        </span>
                        <div>
                          <h4 className="font-medium text-text-main dark:text-gray-200">
                            {resource.title}
                          </h4>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline truncate max-w-[300px] block"
                          >
                            {resource.url}
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveResource(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {formData.resources.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có tài liệu nào.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default KnowledgePointModal;
