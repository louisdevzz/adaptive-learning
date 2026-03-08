"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/react";
import { Input } from "@heroui/input";
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
import {
  Mail,
  Phone,
  Calendar,
  Lock,
  Ban,
  Edit,
  CheckCircle2,
  Shield,
  History,
  Camera,
  ChevronLeft,
  MoreVertical,
  Save,
  X,
  User,
  GraduationCap,
  UsersRound,
  School,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { api } from "@/lib/api";
import { Admin } from "@/types/admin";
import { Teacher } from "@/types/teacher";
import { Student } from "@/types/student";
import { Parent } from "@/types/parent";
import Link from "next/link";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

type UserRole = "admin" | "teacher" | "student" | "parent";
type UnifiedUser = (Admin | Teacher | Student | Parent) & {
  role: UserRole;
  status?: boolean;
  createdAt?: string;
  lastLogin?: string;
};

const roleLabels: Record<UserRole, string> = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  student: "Học sinh",
  parent: "Phụ huynh",
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  teacher: "bg-[#6244F4/10] text-[#0066CC] border-blue-200",
  student: "bg-green-50 text-green-700 border-green-200",
  parent: "bg-orange-50 text-orange-700 border-orange-200",
};

const roleIcons: Record<UserRole, React.ElementType> = {
  admin: Shield,
  teacher: GraduationCap,
  student: User,
  parent: UsersRound,
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Chưa có";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

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
          <p className="text-sm text-[#717680] dark:text-gray-400">{title}</p>
          <p className="text-lg font-bold text-[#181d27] dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({
  isOpen,
  onClose,
  user,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UnifiedUser | null;
  onSave: (data: { fullName: string; email: string; phone: string }) => Promise<void>;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(
        (user as Teacher).teacherInfo?.phone ||
        (user as Parent).parentInfo?.phone ||
        ""
      );
    }
  }, [user, isOpen]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await onSave({ fullName, email, phone });
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const RoleIcon = roleIcons[user.role];

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${roleColors[user.role]}`}>
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#181d27] dark:text-white">
                Chỉnh sửa thông tin
              </h3>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Cập nhật thông tin cho {user.fullName}
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* User Preview */}
            <div className="flex items-center gap-4 p-4 bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl">
              <Avatar
                src={user.avatarUrl}
                size="lg"
                className="rounded-full"
                fallback={getInitials(user.fullName)}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${roleColors[user.role]}`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleLabels[user.role]}
                  </span>
                </div>
                <p className="text-xs text-[#717680] dark:text-gray-400 mt-1">
                  ID: {user.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#181d27] dark:text-white mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <Input
                  value={fullName}
                  onValueChange={setFullName}
                  placeholder="Nhập họ và tên"
                  startContent={<User className="w-4 h-4 text-[#717680]" />}
                  isRequired
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181d27] dark:text-white mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onValueChange={setEmail}
                  placeholder="email@example.com"
                  startContent={<Mail className="w-4 h-4 text-[#717680]" />}
                  isRequired
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181d27] dark:text-white mb-1.5">
                  Số điện thoại
                </label>
                <Input
                  value={phone}
                  onValueChange={setPhone}
                  placeholder="+84 xxx xxx xxx"
                  startContent={<Phone className="w-4 h-4 text-[#717680]" />}
                />
                <p className="text-xs text-[#717680] dark:text-gray-400 mt-1">
                  Số điện thoại liên hệ chính
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={saving}
            startContent={!saving && <Save className="w-4 h-4" />}
          >
            Lưu thay đổi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Reset Password Modal Component
function ResetPasswordModal({
  isOpen,
  onClose,
  user,
  onReset,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UnifiedUser | null;
  onReset: (password: string) => Promise<void>;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setResetting(true);
      await onReset(newPassword);
      onClose();
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setResetting(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    setError("");
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#181d27] dark:text-white">
                Đặt lại mật khẩu
              </h3>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Tạo mật khẩu mới cho {user.fullName}
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Lưu ý quan trọng
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Sau khi đặt lại mật khẩu, ngưởi dùng sẽ cần đăng nhập lại bằng mật khẩu mới. 
                  Hãy đảm bảo thông báo cho họ về thay đổi này.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[#181d27] dark:text-white">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <Button
                    size="sm"
                    variant="light"
                    className="text-primary text-xs"
                    onPress={generatePassword}
                  >
                    Tạo ngẫu nhiên
                  </Button>
                </div>
                <Input
                  type={isVisible ? "text" : "password"}
                  value={newPassword}
                  onValueChange={setNewPassword}
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  startContent={<Lock className="w-4 h-4 text-[#717680]" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setIsVisible(!isVisible)}
                      className="focus:outline-none"
                    >
                      {isVisible ? (
                        <EyeOff className="w-4 h-4 text-[#717680]" />
                      ) : (
                        <Eye className="w-4 h-4 text-[#717680]" />
                      )}
                    </button>
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181d27] dark:text-white mb-1.5">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <Input
                  type={isConfirmVisible ? "text" : "password"}
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                  placeholder="Nhập lại mật khẩu mới"
                  startContent={<Lock className="w-4 h-4 text-[#717680]" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                      className="focus:outline-none"
                    >
                      {isConfirmVisible ? (
                        <EyeOff className="w-4 h-4 text-[#717680]" />
                      ) : (
                        <Eye className="w-4 h-4 text-[#717680]" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm font-medium text-[#181d27] dark:text-white mb-2">
                Yêu cầu mật khẩu:
              </p>
              <ul className="space-y-1.5">
                {[
                  { label: "Ít nhất 8 ký tự", valid: newPassword.length >= 8 },
                  { label: "Có ít nhất 1 chữ hoa", valid: /[A-Z]/.test(newPassword) },
                  { label: "Có ít nhất 1 chữ thường", valid: /[a-z]/.test(newPassword) },
                  { label: "Có ít nhất 1 số", valid: /\d/.test(newPassword) },
                  { label: "Mật khẩu khớp nhau", valid: newPassword === confirmPassword && newPassword !== "" },
                ].map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        req.valid ? "text-green-500" : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                    <span className={req.valid ? "text-green-600" : "text-[#717680] dark:text-gray-400"}>
                      {req.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="warning"
            onPress={handleSubmit}
            isLoading={resetting}
            startContent={!resetting && <KeyRound className="w-4 h-4" />}
          >
            Đặt lại mật khẩu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useUser();
  
  // Check admin access
  useEffect(() => {
    if (!userLoading && currentUser) {
      const isAdmin = currentUser.role?.toLowerCase() === "admin";
      if (!isAdmin) {
        toast.error("Bạn không có quyền truy cập trang này");
        router.push("/dashboard");
      }
    }
  }, [currentUser, userLoading, router]);
  
  const userId = params.userId as string;
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const endpoints = [
          api.admins.getById(userId).then((data) => ({ ...data, role: "admin" as UserRole })),
          api.teachers.getById(userId).then((data) => ({ ...data, role: "teacher" as UserRole })),
          api.students.getById(userId).then((data) => ({ ...data, role: "student" as UserRole })),
          api.parents.getById(userId).then((data) => ({ ...data, role: "parent" as UserRole })),
        ];

        const results = await Promise.allSettled(endpoints);
        const successfulResult = results.find((r) => r.status === "fulfilled");

        if (successfulResult && successfulResult.status === "fulfilled") {
          const userData = successfulResult.value as UnifiedUser;
          setUser(userData);
        } else {
          toast.error("Không tìm thấy ngưởi dùng");
          router.push("/dashboard/users");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Lỗi khi tải thông tin");
        router.push("/dashboard/users");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, router]);

  const handleSaveUser = async (data: { fullName: string; email: string; phone: string }) => {
    if (!user) return;
    
    try {
      switch (user.role) {
        case "admin":
          await api.admins.update(userId, { fullName: data.fullName, email: data.email });
          break;
        case "teacher":
          await api.teachers.update(userId, { fullName: data.fullName, email: data.email });
          break;
        case "student":
          await api.students.update(userId, { fullName: data.fullName, email: data.email });
          break;
        case "parent":
          await api.parents.update(userId, { fullName: data.fullName, email: data.email });
          break;
      }
      setUser({ ...user, fullName: data.fullName, email: data.email });
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Không thể cập nhật thông tin");
      throw error;
    }
  };

  const handleResetPassword = async (password: string) => {
    try {
      await api.users.resetPassword(userId, password);
      toast.success("Đặt lại mật khẩu thành công");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa ngưởi dùng này?")) return;
    
    try {
      if (!user) return;
      switch (user.role) {
        case "admin":
          await api.admins.delete(userId);
          break;
        case "teacher":
          await api.teachers.delete(userId);
          break;
        case "student":
          await api.students.delete(userId);
          break;
        case "parent":
          await api.parents.delete(userId);
          break;
      }
      toast.success("Xóa ngưởi dùng thành công");
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Không thể xóa ngưởi dùng");
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    try {
      const newStatus = !user.status;
      // TODO: Implement status toggle API
      setUser({ ...user, status: newStatus });
      toast.success(newStatus ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản");
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  if (loading) {
    return (
              <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      
    );
  }

  if (!user) {
    return (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-[#717680] dark:text-gray-400">Không tìm thấy ngưởi dùng</p>
          <Button as={Link} href="/dashboard/users" startContent={<ChevronLeft className="w-4 h-4" />}>
            Quay lại danh sách
          </Button>
        </div>
      
    );
  }

  const userRole = user.role;
  const userStatus = user.status !== false;
  const RoleIcon = roleIcons[userRole];

  // Get role-specific info
  const getRoleInfo = () => {
    switch (userRole) {
      case "student":
        const studentInfo = (user as Student).studentInfo;
        return [
          { label: "Mã học sinh", value: studentInfo?.studentCode || "Chưa có", icon: User },
          { label: "Khối lớp", value: studentInfo?.gradeLevel ? `Khối ${studentInfo.gradeLevel}` : "Chưa có", icon: School },
          { label: "Trường", value: studentInfo?.schoolName || "Chưa có", icon: MapPin },
          { label: "Giới tính", value: studentInfo?.gender === "male" ? "Nam" : studentInfo?.gender === "female" ? "Nữ" : "Khác", icon: User },
        ];
      case "teacher":
        const teacherInfo = (user as Teacher).teacherInfo;
        return [
          { label: "Chuyên môn", value: teacherInfo?.specialization?.join(", ") || "Chưa có", icon: GraduationCap },
          { label: "Kinh nghiệm", value: teacherInfo?.experienceYears ? `${teacherInfo.experienceYears} năm` : "Chưa có", icon: Clock },
          { label: "Số điện thoại", value: teacherInfo?.phone || "Chưa có", icon: Phone },
        ];
      case "parent":
        const parentInfo = (user as Parent).parentInfo;
        return [
          { label: "Mối quan hệ", value: parentInfo?.relationshipType === "father" ? "Bố" : parentInfo?.relationshipType === "mother" ? "Mẹ" : "Ngưởi giám hộ", icon: UsersRound },
          { label: "Số điện thoại", value: parentInfo?.phone || "Chưa có", icon: Phone },
          { label: "Địa chỉ", value: parentInfo?.address || "Chưa có", icon: MapPin },
        ];
      case "admin":
        const adminInfo = (user as Admin).adminInfo;
        return [
          { label: "Cấp độ", value: adminInfo?.adminLevel === "super" ? "Quản trị cấp cao" : adminInfo?.adminLevel === "system" ? "Quản trị hệ thống" : "Hỗ trợ", icon: Shield },
        ];
      default:
        return [];
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              isIconOnly
              as={Link}
              href="/dashboard/users"
              className="text-[#717680]"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#010101] dark:text-white">
                  {user.fullName}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[userRole]}`}>
                  <RoleIcon className="w-3 h-3" />
                  {roleLabels[userRole]}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  userStatus
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${userStatus ? "bg-green-500" : "bg-gray-400"}`} />
                  {userStatus ? "Hoạt động" : "Đã khóa"}
                </span>
              </div>
              <p className="text-[#717680] dark:text-gray-400 text-sm mt-1">
                ID: {user.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="bordered"
              className="border-[#d5d7da]"
              startContent={<Lock className="w-4 h-4" />}
              onPress={() => setIsResetPasswordModalOpen(true)}
            >
              Đặt lại MK
            </Button>
            <Button
              variant="bordered"
              className={`border-[#d5d7da] ${userStatus ? "text-red-600" : "text-green-600"}`}
              startContent={<Ban className="w-4 h-4" />}
              onPress={handleToggleStatus}
            >
              {userStatus ? "Khóa" : "Kích hoạt"}
            </Button>
            <Button
              className="bg-primary text-white"
              startContent={<Edit className="w-4 h-4" />}
              onPress={() => setIsEditModalOpen(true)}
            >
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {user.avatarUrl ? (
                    <Avatar
                      src={user.avatarUrl}
                      className="w-24 h-24 border-4 border-[#f9fafb] dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border-4 border-[#f9fafb] dark:border-gray-800">
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full border border-[#e9eaeb] dark:border-gray-600 flex items-center justify-center text-[#717680] hover:text-primary transition-colors shadow-sm">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-[#181d27] dark:text-white">
                  {user.fullName}
                </h2>
                <p className="text-[#717680] dark:text-gray-400 text-sm mt-1">
                  {user.email}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-[#e9eaeb] dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#717680] dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Ngày tham gia
                  </div>
                  <span className="text-sm font-medium text-[#181d27] dark:text-white">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#717680] dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    Đăng nhập gần nhất
                  </div>
                  <span className="text-sm font-medium text-[#181d27] dark:text-white">
                    {formatDate(user.lastLogin)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Khóa học"
                value="5"
                icon={<School className="w-5 h-5 text-[#6244F4]" />}
                color="bg-[#6244F4/10] dark:bg-blue-900/20"
              />
              <StatCard
                title="Tiến độ"
                value="78%"
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                color="bg-green-50 dark:bg-green-900/20"
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Info */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-[#181d27] dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Thông tin {roleLabels[userRole].toLowerCase()}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-[#f9fafb] dark:bg-gray-800/50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-[#717680]">
                      <info.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-[#717680] dark:text-gray-400">{info.label}</p>
                      <p className="font-medium text-[#181d27] dark:text-white">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e9eaeb] dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#181d27] dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Hoạt động gần đây
                </h3>
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="light" size="sm" isIconOnly>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem key="all">Tất cả</DropdownItem>
                    <DropdownItem key="login">Đăng nhập</DropdownItem>
                    <DropdownItem key="system">Hệ thống</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="divide-y divide-[#e9eaeb] dark:divide-gray-700">
                {[
                  { action: "Đăng nhập thành công", time: "Hôm nay, 08:30", type: "login" },
                  { action: "Cập nhật thông tin cá nhân", time: "Hôm qua, 14:15", type: "update" },
                  { action: "Hoàn thành bài tập", time: "2 ngày trước", type: "activity" },
                ].map((activity, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "login"
                          ? "bg-green-50 text-green-600"
                          : activity.type === "update"
                          ? "bg-[#6244F4/10] text-[#6244F4]"
                          : "bg-purple-50 text-purple-600"
                      }`}>
                        <History className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-[#181d27] dark:text-white">{activity.action}</span>
                    </div>
                    <span className="text-xs text-[#717680] dark:text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-[#e9eaeb] dark:border-gray-700 text-center">
                <Button variant="light" size="sm" className="text-primary">
                  Xem tất cả lịch sử
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveUser}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        user={user}
        onReset={handleResetPassword}
      />
    </>
  );
}
