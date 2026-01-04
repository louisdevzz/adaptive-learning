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
  Trash,
  Plus,
  ChevronsUpDown,
  GripVertical,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import KnowledgePointModal from "@/components/modals/KnowledgePointModal";

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

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"structure" | "analytics">(
    "structure"
  );

  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showKpModal, setShowKpModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(
    null
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  const [selectedKp, setSelectedKp] = useState<any | null>(null);
  const [editingKp, setEditingKp] = useState<any | null>(null);
  const [kpDetailLoading, setKpDetailLoading] = useState(false);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
  });
  const [sectionForm, setSectionForm] = useState({
    title: "",
  });

  // Fetch course data
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, structureData] = await Promise.all([
        api.courses.getById(courseId),
        api.courses.getStructure(courseId),
      ]);

      setCourse(courseData);

      // Transform structure data to match our component state
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
      toast.error(
        error.response?.data?.message || "Không thể tải dữ liệu khoá học"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, expanded: !m.expanded } : m
      )
    );
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

  // Module CRUD operations
  const handleCreateModule = () => {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setShowModuleModal(true);
  };

  const handleEditModule = (module: ModuleItem) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || "",
    });
    setShowModuleModal(true);
  };

  const handleSaveModule = async () => {
    try {
      setSaving(true);
      if (editingModule) {
        // Update existing module
        await api.courses.updateModule(editingModule.id, moduleForm);
        toast.success("Cập nhật chương thành công");
      } else {
        // Create new module
        const newModule = await api.courses.createModule({
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
    if (
      !confirm(
        "Bạn có chắc chắn muốn xoá chương này? Hành động này không thể hoàn tác."
      )
    ) {
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

  // Section CRUD operations
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
        // Update existing section
        await api.courses.updateSection(editingSection.id, sectionForm);
        toast.success("Cập nhật bài học thành công");
      } else {
        // Create new section
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
    if (
      !confirm(
        "Bạn có chắc chắn muốn xoá bài học này? Hành động này không thể hoàn tác."
      )
    ) {
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

  const handleCreateKp = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setEditingKp(null);
    setShowKpModal(true);
  };

  const handleSaveKp = async (kpData: any) => {
    if (!selectedSectionId) return;

    try {
      if (editingKp) {
        // Update existing KP
        await api.knowledgePoints.update(editingKp.id, kpData);
        toast.success("Cập nhật điểm kiến thức thành công");
      } else {
        // 1. Create Knowledge Point
        const newKp = await api.knowledgePoints.create({
          ...kpData,
          difficultyLevel: Number(kpData.difficultyLevel),
        });

        // 2. Assign to Section
        // Find current section to determine order index
        let orderIndex = 0;
        modules.forEach((mod) => {
          const section = mod.sections.find((s) => s.id === selectedSectionId);
          if (section) {
            orderIndex = section.knowledgePoints.length;
          }
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
      throw error; // Let the modal handle the error display
    }
  };

  const handleEditKp = async (kpId: string, sectionId: string) => {
    try {
      // Fetch full details for editing
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
    if (
      !confirm(
        "Bạn có chắc chắn muốn xoá điểm kiến thức này? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      await api.knowledgePoints.delete(kpId);
      toast.success("Xoá điểm kiến thức thành công");
      await fetchCourseData();
      if (selectedKp?.id === kpId) {
        setSelectedKp(null);
      }
    } catch (error: any) {
      console.error("Error deleting KP:", error);
      toast.error(
        error.response?.data?.message || "Không thể xoá điểm kiến thức"
      );
    }
  };

  const handleKpClick = async (kpId: string) => {
    try {
      setKpDetailLoading(true);
      const kpDetail = await api.knowledgePoints.getById(kpId);
      setSelectedKp(kpDetail);
      setActiveTab("structure"); // Keep on structure tab but show detail
    } catch (error: any) {
      console.error("Error fetching KP detail:", error);
      toast.error("Không thể tải chi tiết điểm kiến thức");
    } finally {
      setKpDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-text-muted dark:text-gray-400">
              Đang tải dữ liệu khoá học...
            </p>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  if (!course) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Không tìm thấy khoá học</p>
            <button
              onClick={() => router.push("/dashboard/courses")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Quay lại danh sách khoá học
            </button>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-white dark:bg-[#1a202c] rounded-xl border border-card-border dark:border-gray-800">
        {/* Sidebar Tree Navigator */}
        <aside className="w-[320px] flex-none bg-white dark:bg-[#1a202c] border-r border-card-border dark:border-gray-800 flex flex-col h-full z-10">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-card-border dark:border-gray-800 bg-[#fbfbfc] dark:bg-[#1e2532]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted dark:text-gray-400">
                Cấu trúc khoá học
              </h3>
              <button
                className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"
                title="Mở rộng tất cả"
                onClick={() =>
                  setModules(modules.map((m) => ({ ...m, expanded: true })))
                }
              >
                <ChevronsUpDown className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleCreateModule}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus className="w-[18px] h-[18px]" />
              Thêm Chương Mới
            </button>
          </div>

          {/* Tree Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Root Course Node */}
            <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border border-transparent">
              <FolderOpen className="text-primary w-5 h-5 fill-current" />
              <span className="font-bold text-sm truncate flex-1 text-text-main dark:text-white">
                {course.title}
              </span>
            </div>

            {modules.map((module) => (
              <div key={module.id} className="pl-3 relative">
                {/* Module Item */}
                <div
                  className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer mb-1 relative z-10 ${
                    module.expanded
                      ? "bg-primary/5 border border-primary/20 text-primary"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 text-text-muted dark:text-gray-400 border border-transparent"
                  }`}
                >
                  <ChevronRight
                    className={`w-[18px] h-[18px] transform transition-transform ${
                      module.expanded ? "rotate-90" : ""
                    }`}
                    onClick={() => toggleModule(module.id)}
                  />
                  <LayoutGrid className="w-5 h-5" />
                  <span className="font-medium text-sm truncate flex-1">
                    {module.title}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModule(module);
                      }}
                      className="p-1 hover:bg-primary/10 rounded cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children of Module */}
                {module.expanded && (
                  <div className="pl-6 space-y-1 mt-1">
                    {module.sections.map((section) => (
                      <div key={section.id} className="relative">
                        <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                          <ChevronRight
                            className={`w-[18px] h-[18px] transform transition-transform ${
                              section.expanded ? "rotate-90" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSection(module.id, section.id);
                            }}
                          />
                          <FileText className="text-text-muted dark:text-gray-500 w-[18px] h-[18px]" />
                          <span className="text-sm truncate flex-1 text-text-main dark:text-gray-300">
                            {section.title}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSection(section, module.id);
                              }}
                              className="p-1 hover:bg-primary/10 rounded cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(section.id);
                              }}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 cursor-pointer"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* KPs under Section */}
                        {section.expanded && (
                          <div className="pl-6 space-y-1 mt-1 border-l border-gray-100 dark:border-gray-800 ml-2">
                            {section.knowledgePoints.map((kp) => (
                              <div
                                key={kp.id}
                                onClick={() => handleKpClick(kp.id)}
                                className={`group flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ml-1 ${
                                  selectedKp?.id === kp.id
                                    ? "bg-primary/10 border border-primary/30"
                                    : ""
                                }`}
                              >
                                {kp.completed ? (
                                  <CheckCircle className="text-green-500 w-4 h-4" />
                                ) : (
                                  <Circle className="text-gray-300 dark:text-gray-600 w-4 h-4" />
                                )}
                                <span className="text-xs text-text-muted dark:text-gray-400 truncate">
                                  {kp.title}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 ml-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditKp(kp.id, section.id);
                                    }}
                                    className="p-1 hover:bg-primary/10 rounded text-gray-400 hover:text-primary cursor-pointer"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteKp(kp.id);
                                    }}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500 cursor-pointer"
                                  >
                                    <Trash className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateKp(section.id);
                              }}
                              className="w-full flex items-center gap-1 p-1.5 text-xs text-primary hover:bg-primary/5 rounded transition-colors ml-1 cursor-pointer"
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
                      className="w-full flex items-center gap-2 p-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
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
        <main className="flex-1 overflow-y-auto bg-background-soft dark:bg-[#0d121b] p-6 lg:p-10 scroll-smooth">
          <div className=" mx-auto space-y-6">
            {/* Page Heading & Actions */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-primary uppercase tracking-wide">
                    Khoá học
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${
                      course.active
                        ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30"
                        : "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-900/30"
                    }`}
                  >
                    <Globe className="w-[14px] h-[14px]" />
                    {course.active ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">
                  {course.title}
                </h1>
                <p className="text-text-muted dark:text-gray-400 mt-1 max-w-2xl">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-card-border dark:border-gray-700">
              <nav aria-label="Tabs" className="flex gap-8">
                <button
                  onClick={() => setActiveTab("structure")}
                  className={`py-3 px-1 text-sm font-bold flex items-center gap-2 border-b-[3px] transition-colors cursor-pointer ${
                    activeTab === "structure"
                      ? "border-primary text-text-main dark:text-white"
                      : "border-transparent text-text-muted hover:text-text-main dark:hover:text-gray-300"
                  }`}
                >
                  <List className="w-5 h-5" /> Cấu trúc nội dung
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`py-3 px-1 text-sm font-medium flex items-center gap-2 border-b-[3px] transition-colors cursor-pointer ${
                    activeTab === "analytics"
                      ? "border-primary text-text-main dark:text-white"
                      : "border-transparent text-text-muted hover:text-text-main dark:hover:text-gray-300"
                  }`}
                >
                  <BarChart className="w-5 h-5" /> Phân tích
                </button>
              </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === "structure" && !selectedKp && (
              <div className="space-y-6">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-white dark:bg-[#1a202c] rounded-xl border border-card-border dark:border-gray-800 overflow-hidden"
                  >
                    <div className="p-5 border-b border-card-border dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                      <div>
                        <h3 className="text-base font-bold text-text-main dark:text-white">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-medium text-text-muted dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {module.sections.length} Bài học
                      </span>
                    </div>

                    <div className="divide-y divide-card-border dark:divide-gray-800">
                      {module.sections.map((section) => (
                        <div
                          key={section.id}
                          className="group p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-semibold text-text-main dark:text-white">
                                  {section.title}
                                </h4>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleEditSection(section, module.id)
                                    }
                                    className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteSection(section.id)
                                    }
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                                  >
                                    <Trash className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>

                              {/* Knowledge Points */}
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase mr-1">
                                  Điểm kiến thức:
                                </span>
                                {section.knowledgePoints.map((kp) => (
                                  <span
                                    key={kp.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-900/30"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {kp.title}
                                  </span>
                                ))}
                                <button
                                  onClick={() => handleCreateKp(section.id)}
                                  className="text-xs text-text-muted hover:text-primary font-medium flex items-center gap-0.5 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Plus className="w-[14px] h-[14px]" /> Thêm
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add New Section Trigger */}
                    <div className="p-5">
                      <button
                        onClick={() => handleCreateSection(module.id)}
                        className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-card-border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-primary/50 group transition-all"
                      >
                        <div className="size-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Plus className="text-gray-400 group-hover:text-primary w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="block text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary">
                            Tạo Bài học Mới
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KP Detail View */}
            {activeTab === "structure" && selectedKp && (
              <div className="space-y-6 w-full">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <button
                      onClick={() => setSelectedKp(null)}
                      className="text-sm text-primary hover:underline mb-3 flex items-center gap-1"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Quay lại cấu trúc
                    </button>
                    <h2 className="text-2xl font-bold text-text-main dark:text-white">
                      {selectedKp.title}
                    </h2>
                    {selectedKp.description && (
                      <p className="text-text-muted dark:text-gray-400 mt-2">
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

                {/* Content Tabs */}
                <div className="bg-white dark:bg-[#1a202c] rounded-xl w-full border border-card-border dark:border-gray-800 overflow-hidden">
                  {/* Theory Section */}
                  {selectedKp.content?.theory && (
                    <div className="p-6 border-b border-card-border dark:border-gray-800">
                      <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Lý thuyết
                      </h3>
                      <div
                        className="w-full p-0"
                        dangerouslySetInnerHTML={{
                          __html: selectedKp.content.theory,
                        }}
                      />
                    </div>
                  )}

                  {/* Visualization Section */}
                  {selectedKp.content?.visualization && (
                    <div className="p-6 border-b border-card-border dark:border-gray-800">
                      <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-primary" />
                        Trực quan hoá
                      </h3>
                      <div className="w-full relative">
                        <div
                          className="w-full"
                          dangerouslySetInnerHTML={{
                            __html: selectedKp.content.visualization,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Questions Section */}
                  {selectedKp.content?.questions &&
                    selectedKp.content.questions.length > 0 && (
                      <div className="p-6 border-b border-card-border dark:border-gray-800">
                        <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          Câu hỏi luyện tập (
                          {selectedKp.content.questions.length})
                        </h3>
                        <div className="space-y-4">
                          {selectedKp.content.questions.map(
                            (question: any, index: number) => (
                              <div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                        {question.type === "multiple_choice"
                                          ? "Trắc nghiệm"
                                          : question.type === "true_false"
                                          ? "Đúng/Sai"
                                          : question.type === "fill_blank"
                                          ? "Điền vào chỗ trống"
                                          : "Game"}
                                      </span>
                                      {question.type === "game" && (
                                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                                          {question.gameType === "flashcard"
                                            ? "Flashcard"
                                            : question.gameType === "matching"
                                            ? "Nối từ"
                                            : "Sắp xếp"}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-text-main dark:text-white font-medium mb-3">
                                      {question.questionText}
                                    </p>
                                    {question.type === "multiple_choice" &&
                                      question.options && (
                                        <div className="space-y-2">
                                          {question.options
                                            .filter(
                                              (opt: string) => opt.trim() !== ""
                                            )
                                            .map(
                                              (
                                                option: string,
                                                optIndex: number
                                              ) => (
                                                <div
                                                  key={optIndex}
                                                  className={`flex items-center gap-2 p-2 rounded ${
                                                    option ===
                                                    question.correctAnswer
                                                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30"
                                                      : "bg-gray-50 dark:bg-gray-800"
                                                  }`}
                                                >
                                                  {option ===
                                                    question.correctAnswer && (
                                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                  )}
                                                  <span
                                                    className={`text-sm ${
                                                      option ===
                                                      question.correctAnswer
                                                        ? "text-green-700 dark:text-green-300 font-medium"
                                                        : "text-gray-600 dark:text-gray-400"
                                                    }`}
                                                  >
                                                    {String.fromCharCode(
                                                      65 + optIndex
                                                    )}
                                                    . {option}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                        </div>
                                      )}
                                    {question.explanation && (
                                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                          <span className="font-medium">
                                            💡 Giải thích:
                                          </span>{" "}
                                          {question.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Resources Section */}
                  {selectedKp.resources && selectedKp.resources.length > 0 && (
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Tài liệu tham khảo ({selectedKp.resources.length})
                      </h3>
                      <div className="grid gap-3">
                        {selectedKp.resources.map(
                          (resource: any, index: number) => (
                            <a
                              key={index}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all group"
                            >
                              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                {resource.resourceType === "video" && (
                                  <span className="text-xl">🎥</span>
                                )}
                                {resource.resourceType === "article" && (
                                  <span className="text-xl">📄</span>
                                )}
                                {resource.resourceType === "interactive" && (
                                  <span className="text-xl">🎮</span>
                                )}
                                {resource.resourceType === "quiz" && (
                                  <span className="text-xl">📝</span>
                                )}
                                {resource.resourceType === "other" && (
                                  <span className="text-xl">📎</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-text-main dark:text-white group-hover:text-primary transition-colors">
                                  {resource.title}
                                </h4>
                                <p className="text-xs text-text-muted dark:text-gray-500 truncate">
                                  {resource.url}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
              {editingModule ? "Chỉnh sửa Chương" : "Tạo Chương Mới"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-text-main dark:text-white"
                  placeholder="Tiêu đề chương"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm({
                      ...moduleForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-text-main dark:text-white"
                  placeholder="Mô tả chương"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModuleModal(false)}
                className="flex-1 px-4 py-2 border border-card-border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleSaveModule}
                disabled={!moduleForm.title || saving}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingModule ? "Cập nhật" : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
              {editingSection ? "Chỉnh sửa Bài học" : "Tạo Bài học Mới"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-card-border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-text-main dark:text-white"
                  placeholder="Tiêu đề bài học"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSectionModal(false)}
                className="flex-1 px-4 py-2 border border-card-border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleSaveSection}
                disabled={!sectionForm.title || saving}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingSection ? "Cập nhật" : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
      <KnowledgePointModal
        isOpen={showKpModal}
        initialData={editingKp}
        onClose={() => setShowKpModal(false)}
        onSave={handleSaveKp}
        sectionTitle={
          modules
            .flatMap((m) => m.sections)
            .find((s) => s.id === selectedSectionId)?.title
        }
      />
    </LayoutDashboard>
  );
}
