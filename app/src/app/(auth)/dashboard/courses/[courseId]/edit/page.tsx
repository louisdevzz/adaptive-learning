"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import {
  ChevronRight,
  FolderOpen,
  LayoutGrid,
  FileText,
  CheckCircle,
  Circle,
  Globe,
  List,
  BarChart,
  Edit,
  Trash2,
  Plus,
  ChevronsUpDown,
  GripVertical,
  Loader2,
  ChevronLeft,
  Save,
  MoreVertical,
  Eye,
  BookOpen,
  Layers,
  Clock,
  Award,
  ArrowUpRight,
  X,
} from "lucide-react";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import KnowledgePointModal from "@/components/modals/KnowledgePointModal";
import Link from "next/link";

// Types
interface KnowledgePointItem {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}

interface SectionItem {
  id: string;
  title: string;
  orderIndex: number;
  active?: boolean;
  draft?: boolean;
  expanded?: boolean;
  knowledgePoints: KnowledgePointItem[];
}

interface ModuleItem {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  sections: SectionItem[];
  expanded?: boolean;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  subject: string;
  gradeLevel: number;
  active: boolean;
  visibility: "public" | "private";
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-[#717680] dark:text-gray-400">{title}</p>
          <p className="text-lg font-bold text-[#181d27] dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"structure" | "analytics">("structure");

  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showKpModal, setShowKpModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedKp, setSelectedKp] = useState<any | null>(null);
  const [editingKp, setEditingKp] = useState<any | null>(null);
  const [kpDetailLoading, setKpDetailLoading] = useState(false);

  // Form states
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [sectionForm, setSectionForm] = useState({ title: "" });

  // Fetch course data
  useEffect(() => {
    if (courseId) fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, structureData] = await Promise.all([
        api.courses.getById(courseId),
        api.courses.getStructure(courseId),
      ]);

      setCourse(courseData);
      const transformedModules = structureData.modules.map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        orderIndex: mod.orderIndex,
        expanded: false,
        sections: mod.sections.map((sec: any) => ({
          id: sec.id,
          title: sec.title,
          summary: sec.summary,
          orderIndex: sec.orderIndex,
          knowledgePoints: sec.knowledgePoints || [],
        })),
      }));
      setModules(transformedModules);
    } catch (error: any) {
      console.error("Error fetching course data:", error);
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu khoá học");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, expanded: !m.expanded } : m)));
  };

  const toggleSection = (moduleId: string, sectionId: string) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              sections: m.sections.map((s) =>
                s.id === sectionId ? { ...s, expanded: !s.expanded } : s
              ),
            }
          : m
      )
    );
  };

  // Module CRUD
  const handleCreateModule = () => {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setShowModuleModal(true);
  };

  const handleEditModule = (module: ModuleItem) => {
    setEditingModule(module);
    setModuleForm({ title: module.title, description: module.description || "" });
    setShowModuleModal(true);
  };

  const handleSaveModule = async () => {
    try {
      setSaving(true);
      if (editingModule) {
        await api.courses.updateModule(editingModule.id, moduleForm);
        toast.success("Cập nhật chương thành công");
      } else {
        await api.courses.createModule({
          courseId,
          title: moduleForm.title,
          description: moduleForm.description,
          orderIndex: modules.length,
        });
        toast.success("Tạo chương thành công");
      }
      setShowModuleModal(false);
      await fetchCourseData();
    } catch (error: any) {
      console.error("Error saving module:", error);
      toast.error(error.response?.data?.message || "Không thể lưu chương");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá chương này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await api.courses.deleteModule(moduleId);
      toast.success("Xoá chương thành công");
      await fetchCourseData();
    } catch (error: any) {
      console.error("Error deleting module:", error);
      toast.error(error.response?.data?.message || "Không thể xoá chương");
    }
  };

  // Section CRUD
  const handleCreateSection = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingSection(null);
    setSectionForm({ title: "" });
    setShowSectionModal(true);
  };

  const handleEditSection = (section: SectionItem, moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingSection(section);
    setSectionForm({ title: section.title });
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!selectedModuleId) return;
    try {
      setSaving(true);
      if (editingSection) {
        await api.courses.updateSection(editingSection.id, sectionForm);
        toast.success("Cập nhật bài học thành công");
      } else {
        const module = modules.find((m) => m.id === selectedModuleId);
        await api.courses.createSection({
          moduleId: selectedModuleId,
          title: sectionForm.title,
          orderIndex: module?.sections.length || 0,
        });
        toast.success("Tạo bài học thành công");
      }
      setShowSectionModal(false);
      await fetchCourseData();
    } catch (error: any) {
      console.error("Error saving section:", error);
      toast.error(error.response?.data?.message || "Không thể lưu bài học");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá bài học này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await api.courses.deleteSection(sectionId);
      toast.success("Xoá bài học thành công");
      await fetchCourseData();
    } catch (error: any) {
      console.error("Error deleting section:", error);
      toast.error(error.response?.data?.message || "Không thể xoá bài học");
    }
  };

  // Knowledge Point CRUD
  const handleCreateKp = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setEditingKp(null);
    setShowKpModal(true);
  };

  const handleSaveKp = async (kpData: any) => {
    if (!selectedSectionId) return;
    try {
      const preparedData = {
        ...kpData,
        content: {
          ...kpData.content,
          questions: kpData.questions || [],
        },
      };
      delete preparedData.questions;

      if (editingKp) {
        await api.knowledgePoints.update(editingKp.id, preparedData);
        toast.success("Cập nhật điểm kiến thức thành công");
      } else {
        const newKp = await api.knowledgePoints.create({
          ...preparedData,
          difficultyLevel: Number(preparedData.difficultyLevel),
        });
        let orderIndex = 0;
        modules.forEach((mod) => {
          const section = mod.sections.find((s) => s.id === selectedSectionId);
          if (section) orderIndex = section.knowledgePoints.length;
        });
        await api.knowledgePoints.assignToSection({
          sectionId: selectedSectionId,
          kpId: newKp.id,
          orderIndex: orderIndex,
        });
        toast.success("Tạo điểm kiến thức thành công");
      }
      await fetchCourseData();
      setShowKpModal(false);
      setEditingKp(null);
    } catch (error: any) {
      console.error("Save KP error:", error);
      toast.error("Không thể lưu điểm kiến thức");
      throw error;
    }
  };

  const handleEditKp = async (kpId: string, sectionId: string) => {
    try {
      const kpData = await api.knowledgePoints.getById(kpId);
      setEditingKp(kpData);
      setSelectedSectionId(sectionId);
      setShowKpModal(true);
    } catch (error) {
      console.error("Error fetching KP details for edit:", error);
      toast.error("Không thể tải thông tin điểm kiến thức");
    }
  };

  const handleDeleteKp = async (kpId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá điểm kiến thức này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await api.knowledgePoints.delete(kpId);
      toast.success("Xoá điểm kiến thức thành công");
      await fetchCourseData();
      if (selectedKp?.id === kpId) setSelectedKp(null);
    } catch (error: any) {
      console.error("Error deleting KP:", error);
      toast.error(error.response?.data?.message || "Không thể xoá điểm kiến thức");
    }
  };

  const handleKpClick = async (kpId: string) => {
    try {
      setKpDetailLoading(true);
      const kpDetail = await api.knowledgePoints.getById(kpId);
      setSelectedKp(kpDetail);
      setActiveTab("structure");
    } catch (error: any) {
      console.error("Error fetching KP detail:", error);
      toast.error("Không thể tải chi tiết điểm kiến thức");
    } finally {
      setKpDetailLoading(false);
    }
  };

  // Calculate stats
  const totalSections = modules.reduce((acc, m) => acc + m.sections.length, 0);
  const totalKps = modules.reduce(
    (acc, m) => acc + m.sections.reduce((sAcc, s) => sAcc + s.knowledgePoints.length, 0),
    0
  );

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-[#717680] dark:text-gray-400">Đang tải dữ liệu khoá học...</p>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  if (!course) {
    return (
      <LayoutDashboard>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-red-500">Không tìm thấy khoá học</p>
          <Button
            as={Link}
            href="/dashboard/courses"
            startContent={<ChevronLeft className="w-4 h-4" />}
          >
            Quay lại danh sách
          </Button>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              isIconOnly
              as={Link}
              href="/dashboard/courses"
              className="text-[#717680]"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">
                  {course.title}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    course.active
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  {course.active ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </div>
              <p className="text-[#717680] dark:text-gray-400 text-sm mt-1">
                {course.subject} • Khối {course.gradeLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="bordered"
              className="border-[#d5d7da]"
              startContent={<Eye className="w-4 h-4" />}
              as={Link}
              href={`/dashboard/courses/${courseId}`}
            >
              Xem trước
            </Button>
            <Button
              className="bg-primary text-white"
              startContent={<Save className="w-4 h-4" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Chương"
            value={modules.length.toString()}
            icon={<Layers className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            title="Bài học"
            value={totalSections.toString()}
            icon={<BookOpen className="w-5 h-5 text-purple-600" />}
            color="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard
            title="Điểm kiến thức"
            value={totalKps.toString()}
            icon={<Award className="w-5 h-5 text-green-600" />}
            color="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            title="Thời gian ước tính"
            value={`${totalKps * 15} phút`}
            icon={<Clock className="w-5 h-5 text-orange-600" />}
            color="bg-orange-50 dark:bg-orange-900/20"
          />
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-400px)] min-h-[500px] bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 overflow-hidden">
          {/* Sidebar Tree Navigator */}
          <aside className="w-[320px] flex-none bg-[#f9fafb] dark:bg-[#1e2532] border-r border-[#e9eaeb] dark:border-gray-800 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#e9eaeb] dark:border-gray-800 bg-white dark:bg-[#1a202c]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#181d27] dark:text-white">
                  Cấu trúc khóa học
                </h3>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setModules(modules.map((m) => ({ ...m, expanded: true })))}
                >
                  <ChevronsUpDown className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleCreateModule}
                className="w-full bg-primary text-white"
                startContent={<Plus className="w-4 h-4" />}
                size="sm"
              >
                Thêm Chương
              </Button>
            </div>

            {/* Tree Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {/* Root Course Node */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                <FolderOpen className="text-primary w-5 h-5" />
                <span className="font-bold text-sm text-[#181d27] dark:text-white truncate">
                  {course.title}
                </span>
              </div>

              {modules.map((module) => (
                <div key={module.id} className="pl-3 relative">
                  {/* Module Item */}
                  <div
                    className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer mb-1 ${
                      module.expanded
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-white dark:hover:bg-gray-800 text-[#535862] dark:text-gray-400"
                    }`}
                  >
                    <ChevronRight
                      className={`w-4 h-4 transform transition-transform ${
                        module.expanded ? "rotate-90" : ""
                      }`}
                      onClick={() => toggleModule(module.id)}
                    />
                    <LayoutGrid className="w-4 h-4" />
                    <span className="font-medium text-sm truncate flex-1">{module.title}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditModule(module);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(module.id);
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Children of Module */}
                  {module.expanded && (
                    <div className="pl-6 space-y-1 mt-1">
                      {module.sections.map((section) => (
                        <div key={section.id}>
                          <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 cursor-pointer">
                            <ChevronRight
                              className={`w-4 h-4 transform transition-transform ${
                                section.expanded ? "rotate-90" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(module.id, section.id);
                              }}
                            />
                            <FileText className="w-4 h-4 text-[#717680]" />
                            <span className="text-sm truncate flex-1 text-[#535862] dark:text-gray-300">
                              {section.title}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSection(section, module.id);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.id);
                                }}
                                className="text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* KPs under Section */}
                          {section.expanded && (
                            <div className="pl-6 space-y-1 mt-1 border-l border-[#e9eaeb] dark:border-gray-700 ml-2">
                              {section.knowledgePoints.map((kp) => (
                                <div
                                  key={kp.id}
                                  onClick={() => handleKpClick(kp.id)}
                                  className={`group flex items-center gap-2 p-1.5 rounded cursor-pointer ${
                                    selectedKp?.id === kp.id
                                      ? "bg-primary/10 border border-primary/30"
                                      : "hover:bg-white dark:hover:bg-gray-800"
                                  }`}
                                >
                                  {kp.completed ? (
                                    <CheckCircle className="text-green-500 w-4 h-4" />
                                  ) : (
                                    <Circle className="text-gray-300 w-4 h-4" />
                                  )}
                                  <span className="text-xs text-[#717680] dark:text-gray-400 truncate">
                                    {kp.title}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 ml-auto">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditKp(kp.id, section.id);
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteKp(kp.id);
                                      }}
                                      className="text-red-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateKp(section.id);
                                }}
                                className="w-full flex items-center gap-1 p-1.5 text-xs text-primary hover:bg-primary/5 rounded transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                Thêm điểm kiến thức
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleCreateSection(module.id)}
                        className="w-full flex items-center gap-2 p-2 text-sm text-primary hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Bài học
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0d121b] p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Tabs */}
              <div className="border-b border-[#e9eaeb] dark:border-gray-800">
                <nav className="flex gap-6">
                  <button
                    onClick={() => setActiveTab("structure")}
                    className={`py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === "structure"
                        ? "border-primary text-primary"
                        : "border-transparent text-[#717680] hover:text-[#181d27]"
                    }`}
                  >
                    <List className="w-4 h-4" /> Cấu trúc
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === "analytics"
                        ? "border-primary text-primary"
                        : "border-transparent text-[#717680] hover:text-[#181d27]"
                    }`}
                  >
                    <BarChart className="w-4 h-4" /> Phân tích
                  </button>
                </nav>
              </div>

              {/* Content based on active tab */}
              {activeTab === "structure" && !selectedKp && (
                <div className="space-y-6">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 overflow-hidden"
                    >
                      <div className="p-5 border-b border-[#e9eaeb] dark:border-gray-800 flex justify-between items-center bg-[#f9fafb] dark:bg-gray-800/30">
                        <div>
                          <h3 className="text-base font-bold text-[#181d27] dark:text-white">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm text-[#717680] dark:text-gray-400 mt-1">
                              {module.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-medium text-[#717680] bg-white dark:bg-gray-700 px-2 py-1 rounded">
                          {module.sections.length} Bài học
                        </span>
                      </div>

                      <div className="divide-y divide-[#e9eaeb] dark:divide-gray-800">
                        {module.sections.map((section) => (
                          <div
                            key={section.id}
                            className="group p-5 hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1 text-[#717680]">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-lg font-semibold text-[#181d27] dark:text-white">
                                    {section.title}
                                  </h4>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      onClick={() => handleEditSection(section, module.id)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      onClick={() => handleDeleteSection(section.id)}
                                      className="text-red-500"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                  <span className="text-xs font-medium text-[#717680] uppercase">
                                    Điểm kiến thức:
                                  </span>
                                  {section.knowledgePoints.map((kp) => (
                                    <span
                                      key={kp.id}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                      {kp.title}
                                    </span>
                                  ))}
                                  <button
                                    onClick={() => handleCreateKp(section.id)}
                                    className="text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                                  >
                                    + Thêm
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-5">
                        <button
                          onClick={() => handleCreateSection(module.id)}
                          className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#e9eaeb] dark:border-gray-700 rounded-xl hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 hover:border-primary/50 transition-all"
                        >
                          <div className="w-10 h-10 bg-[#f9fafb] dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Plus className="text-[#717680] w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-[#717680]">
                            Tạo Bài học Mới
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* KP Detail View */}
              {activeTab === "structure" && selectedKp && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <button
                        onClick={() => setSelectedKp(null)}
                        className="text-sm text-primary hover:underline mb-3 flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Quay lại cấu trúc
                      </button>
                      <h2 className="text-2xl font-bold text-[#181d27] dark:text-white">
                        {selectedKp.title}
                      </h2>
                      {selectedKp.description && (
                        <p className="text-[#717680] dark:text-gray-400 mt-2">
                          {selectedKp.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                          Mức độ: {selectedKp.difficultyLevel}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-800 overflow-hidden">
                    {selectedKp.content?.theory && (
                      <div className="p-6 border-b border-[#e9eaeb] dark:border-gray-800">
                        <h3 className="text-lg font-bold text-[#181d27] dark:text-white mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          Lý thuyết
                        </h3>
                        <div
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedKp.content.theory }}
                        />
                      </div>
                    )}

                    {selectedKp.content?.visualization && (
                      <div className="p-6 border-b border-[#e9eaeb] dark:border-gray-800">
                        <h3 className="text-lg font-bold text-[#181d27] dark:text-white mb-4 flex items-center gap-2">
                          <LayoutGrid className="w-5 h-5 text-primary" />
                          Trực quan hoá
                        </h3>
                        <div
                          dangerouslySetInnerHTML={{ __html: selectedKp.content.visualization }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="text-center py-12">
                  <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-[#717680] dark:text-gray-400">Tính năng phân tích đang được phát triển</p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Module Modal */}
        <Modal isOpen={showModuleModal} onOpenChange={setShowModuleModal} size="md">
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-bold text-[#181d27] dark:text-white">
                {editingModule ? "Chỉnh sửa Chương" : "Tạo Chương mới"}
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#181d27] dark:text-white mb-1.5">
                    Tên chương <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    placeholder="Nhập tên chương"
                    className="w-full px-3 py-2 border border-[#e9eaeb] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#181d27] dark:text-white mb-1.5">
                    Mô tả
                  </label>
                  <textarea
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    placeholder="Mô tả ngắn về chương này"
                    rows={3}
                    className="w-full px-3 py-2 border border-[#e9eaeb] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setShowModuleModal(false)}>
                Hủy
              </Button>
              <Button
                color="primary"
                onPress={handleSaveModule}
                isLoading={saving}
                isDisabled={!moduleForm.title}
              >
                {editingModule ? "Cập nhật" : "Tạo chương"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Section Modal */}
        <Modal isOpen={showSectionModal} onOpenChange={setShowSectionModal} size="md">
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-bold text-[#181d27] dark:text-white">
                {editingSection ? "Chỉnh sửa Bài học" : "Tạo Bài học mới"}
              </h3>
            </ModalHeader>
            <ModalBody>
              <div>
                <label className="block text-sm font-medium text-[#181d27] dark:text-white mb-1.5">
                  Tên bài học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ title: e.target.value })}
                  placeholder="Nhập tên bài học"
                  className="w-full px-3 py-2 border border-[#e9eaeb] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setShowSectionModal(false)}>
                Hủy
              </Button>
              <Button
                color="primary"
                onPress={handleSaveSection}
                isLoading={saving}
                isDisabled={!sectionForm.title}
              >
                {editingSection ? "Cập nhật" : "Tạo bài học"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Knowledge Point Modal */}
        <KnowledgePointModal
          isOpen={showKpModal}
          onClose={() => {
            setShowKpModal(false);
            setEditingKp(null);
          }}
          onSave={handleSaveKp}
          initialData={editingKp}
        />
      </div>
    </LayoutDashboard>
  );
}
