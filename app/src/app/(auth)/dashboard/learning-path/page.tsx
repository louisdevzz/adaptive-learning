"use client";

import { useState, useEffect } from "react";
import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import {
  Button,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Route,
  Plus,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock,
  BookOpen,
  Loader2,
  TrendingUp,
  AlertCircle,
  Target,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  studentId: string;
  targetDate: string | null;
  status: "active" | "completed" | "paused";
  progress: number;
  createdAt: string;
  items?: LearningPathItem[];
}

interface LearningPathItem {
  id: string;
  learningPathId: string;
  itemType: "kp" | "section" | "assignment";
  itemId: string;
  orderIndex: number;
  status: "not_started" | "in_progress" | "completed";
  kp?: {
    id: string;
    title: string;
  };
  section?: {
    id: string;
    title: string;
  };
  assignment?: {
    id: string;
    title: string;
  };
}

export default function LearningPathPage() {
  const { user } = useUser();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [pathDetails, setPathDetails] = useState<LearningPath | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const [newPathTitle, setNewPathTitle] = useState("");
  const [newPathDescription, setNewPathDescription] = useState("");
  const [newPathTargetDate, setNewPathTargetDate] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchLearningPaths();
    }
  }, [user]);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      const data = await api.learningPaths.getAll({
        studentId: user?.id,
      });
      const pathsWithProgress = data.map((path: LearningPath) => ({
        ...path,
        progress: calculatePathProgress(path),
      }));
      setPaths(pathsWithProgress);
    } catch (error) {
      console.error("Failed to fetch learning paths:", error);
      toast.error("Không thể tải lộ trình học tập");
    } finally {
      setLoading(false);
    }
  };

  const calculatePathProgress = (path: LearningPath) => {
    if (!path.items || path.items.length === 0) return 0;
    const completed = path.items.filter((i) => i.status === "completed").length;
    return Math.round((completed / path.items.length) * 100);
  };

  const handleViewDetails = async (path: LearningPath) => {
    setSelectedPath(path);
    setLoadingDetails(true);
    onOpen();

    try {
      const details = await api.learningPaths.getByIdWithItems(path.id);
      setPathDetails(details);
    } catch (error) {
      console.error("Failed to fetch path details:", error);
      toast.error("Không thể tải chi tiết lộ trình");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreatePath = async () => {
    if (!newPathTitle.trim()) {
      toast.error("Vui lòng nhập tên lộ trình");
      return;
    }

    try {
      await api.learningPaths.create({
        title: newPathTitle,
        description: newPathDescription || undefined,
        studentId: user?.id || "",
        targetDate: newPathTargetDate || undefined,
        status: "active",
      });
      toast.success("Tạo lộ trình thành công");
      onCreateClose();
      setNewPathTitle("");
      setNewPathDescription("");
      setNewPathTargetDate("");
      fetchLearningPaths();
    } catch (error) {
      console.error("Failed to create path:", error);
      toast.error("Không thể tạo lộ trình");
    }
  };

  const handleUpdateItemStatus = async (
    pathId: string,
    itemId: string,
    status: "not_started" | "in_progress" | "completed"
  ) => {
    try {
      await api.learningPaths.updateItemStatus(pathId, itemId, status);
      toast.success("Cập nhật trạng thái thành công");
      const details = await api.learningPaths.getByIdWithItems(pathId);
      setPathDetails(details);
      fetchLearningPaths();
    } catch (error) {
      console.error("Failed to update item status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDeletePath = async (pathId: string) => {
    if (!confirm("Bạn có chắc muốn xóa lộ trình này?")) return;

    try {
      await api.learningPaths.delete(pathId);
      toast.success("Xóa lộ trình thành công");
      fetchLearningPaths();
    } catch (error) {
      console.error("Failed to delete path:", error);
      toast.error("Không thể xóa lộ trình");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "active":
        return "primary";
      case "paused":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "active":
        return "Đang hoạt động";
      case "paused":
        return "Tạm dừng";
      default:
        return status;
    }
  };

  const filteredPaths = paths.filter((path) => {
    if (activeTab === "all") return true;
    return path.status === activeTab;
  });

  const stats = {
    total: paths.length,
    active: paths.filter((p) => p.status === "active").length,
    completed: paths.filter((p) => p.status === "completed").length,
    avgProgress: paths.length > 0
      ? Math.round(paths.reduce((acc, p) => acc + p.progress, 0) / paths.length)
      : 0,
  };

  if (loading) {
    return (
      <LayoutDashboard>
        <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181d27] dark:text-white flex items-center gap-2">
              <Route className="w-8 h-8 text-primary" />
              Lộ trình học tập
            </h1>
            <p className="text-[#717680] dark:text-gray-400 mt-1">
              Lập kế hoạch và theo dõi lộ trình học tập của bạn
            </p>
          </div>
          <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={onCreateOpen}>
            Tạo lộ trình mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">Tổng lộ trình</p>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Route className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">Đang hoạt động</p>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">Hoàn thành</p>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400 font-medium">Tiến độ TB</p>
                <p className="text-2xl font-bold text-[#181d27] dark:text-white mt-1">{stats.avgProgress}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and List */}
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700">
          <div className="p-4 border-b border-[#e9eaeb] dark:border-gray-700">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              size="sm"
              color="primary"
              variant="underlined"
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center gap-2">
                    <span>Tất cả</span>
                    <Chip size="sm" variant="flat">{stats.total}</Chip>
                  </div>
                }
              />
              <Tab
                key="active"
                title={
                  <div className="flex items-center gap-2">
                    <span>Đang hoạt động</span>
                    <Chip size="sm" color="primary" variant="flat">{stats.active}</Chip>
                  </div>
                }
              />
              <Tab
                key="completed"
                title={
                  <div className="flex items-center gap-2">
                    <span>Hoàn thành</span>
                    <Chip size="sm" color="success" variant="flat">{stats.completed}</Chip>
                  </div>
                }
              />
              <Tab
                key="paused"
                title={
                  <div className="flex items-center gap-2">
                    <span>Tạm dừng</span>
                    <Chip size="sm" color="warning" variant="flat">
                      {paths.filter((p) => p.status === "paused").length}
                    </Chip>
                  </div>
                }
              />
            </Tabs>
          </div>

          <div className="p-4">
            {filteredPaths.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Route className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Chưa có lộ trình nào
                </h3>
                <p className="text-gray-500 max-w-md mb-4">
                  Tạo lộ trình học tập để lập kế hoạch và theo dõi tiến độ học tập của bạn
                </p>
                <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={onCreateOpen}>
                  Tạo lộ trình đầu tiên
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPaths.map((path) => (
                  <div
                    key={path.id}
                    className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Route className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#181d27] dark:text-white">
                            {path.title}
                          </h3>
                          {path.targetDate && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Hạn: {format(new Date(path.targetDate), "dd/MM/yyyy", { locale: vi })}
                            </p>
                          )}
                        </div>
                      </div>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly variant="light" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem key="view" onPress={() => handleViewDetails(path)}>
                            Xem chi tiết
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            onPress={() => handleDeletePath(path.id)}
                          >
                            Xóa
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    {path.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {path.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <Chip size="sm" color={getStatusColor(path.status)} variant="flat">
                        {getStatusText(path.status)}
                      </Chip>
                      <span className="text-sm font-medium">{path.progress}%</span>
                    </div>

                    <Progress value={path.progress} size="sm" color={getStatusColor(path.status)} />

                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {path.items?.length || 0} mục tiêu
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {path.items?.filter((i) => i.status === "completed").length || 0} hoàn thành
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Path Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Route className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#181d27]">{selectedPath?.title}</h2>
                      {selectedPath?.targetDate && (
                        <p className="text-sm text-gray-500">
                          Hạn chót: {format(new Date(selectedPath.targetDate), "dd/MM/yyyy", { locale: vi })}
                        </p>
                      )}
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Progress Overview */}
                      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Target className="w-6 h-6 text-primary" />
                            <span className="font-semibold">Tiến độ lộ trình</span>
                          </div>
                          <span className="text-2xl font-bold text-primary">{selectedPath?.progress}%</span>
                        </div>
                        <Progress value={selectedPath?.progress} size="md" color="primary" />
                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                          <span>
                            {pathDetails?.items?.filter((i) => i.status === "completed").length || 0} /{" "}
                            {pathDetails?.items?.length || 0} mục tiêu hoàn thành
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {selectedPath?.description && (
                        <div>
                          <h3 className="font-semibold text-[#181d27] mb-2">Mô tả</h3>
                          <p className="text-gray-600">{selectedPath.description}</p>
                        </div>
                      )}

                      {/* Items List */}
                      <div>
                        <h3 className="font-semibold text-[#181d27] mb-3">Danh sách mục tiêu</h3>
                        {pathDetails?.items?.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>Chưa có mục tiêu nào trong lộ trình này</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {pathDetails?.items
                              ?.sort((a, b) => a.orderIndex - b.orderIndex)
                              .map((item, idx) => (
                                <div
                                  key={item.id}
                                  className={`border rounded-xl p-4 flex items-center gap-4 ${
                                    item.status === "completed"
                                      ? "bg-green-50/50 border-green-200"
                                      : item.status === "in_progress"
                                      ? "bg-blue-50/50 border-blue-200"
                                      : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      item.status === "completed"
                                        ? "bg-green-500 text-white"
                                        : item.status === "in_progress"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    {item.status === "completed" ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      idx + 1
                                    )}
                                  </span>

                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {item.kp?.title || item.section?.title || item.assignment?.title || "Không có tên"}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Chip size="sm" variant="flat">
                                        {item.itemType === "kp"
                                          ? "Điểm kiến thức"
                                          : item.itemType === "section"
                                          ? "Chương học"
                                          : "Bài tập"}
                                      </Chip>
                                    </div>
                                  </div>

                                  <Dropdown>
                                    <DropdownTrigger>
                                      <Button variant="light" size="sm">
                                        {item.status === "completed"
                                          ? "Hoàn thành"
                                          : item.status === "in_progress"
                                          ? "Đang học"
                                          : "Chưa bắt đầu"}
                                      </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                      selectedKeys={[item.status]}
                                      onAction={(key) =>
                                        handleUpdateItemStatus(
                                          pathDetails!.id,
                                          item.id,
                                          key as "not_started" | "in_progress" | "completed"
                                        )
                                      }
                                    >
                                      <DropdownItem key="not_started">Chưa bắt đầu</DropdownItem>
                                      <DropdownItem key="in_progress">Đang học</DropdownItem>
                                      <DropdownItem key="completed">Hoàn thành</DropdownItem>
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Đóng
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Create Path Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h2 className="text-xl font-bold text-[#181d27]">Tạo lộ trình mới</h2>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Tên lộ trình"
                      placeholder="VD: Học Toán lớp 10"
                      value={newPathTitle}
                      onChange={(e) => setNewPathTitle(e.target.value)}
                      isRequired
                    />
                    <Textarea
                      label="Mô tả (tùy chọn)"
                      placeholder="Mô tả mục tiêu của lộ trình này"
                      value={newPathDescription}
                      onChange={(e) => setNewPathDescription(e.target.value)}
                    />
                    <Input
                      type="date"
                      label="Ngày hoàn thành mong muốn (tùy chọn)"
                      value={newPathTargetDate}
                      onChange={(e) => setNewPathTargetDate(e.target.value)}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Hủy
                  </Button>
                  <Button color="primary" onPress={handleCreatePath}>
                    Tạo lộ trình
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </LayoutDashboard>
  );
}
