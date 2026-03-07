"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  School,
  Calendar,
  Phone,
  MapPin,
  KeyRound,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/react";

interface ProfileData {
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  // Role-specific fields
  studentCode?: string;
  gradeLevel?: number;
  school?: string;
  specialization?: string;
  experience?: number;
}

export default function ProfilePage() {
  const { user, mutate } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    avatarUrl: "",
    phone: "",
    address: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Load user data
  useEffect(() => {
    if (user) {
      const info = user.info || {};
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || "",
        phone: info.phone || "",
        address: info.address || "",
        // Load role-specific data
        ...(user.role === "student" && {
          studentCode: info.studentCode,
          gradeLevel: info.gradeLevel,
          school: info.school,
        }),
        ...(user.role === "teacher" && {
          specialization: info.specialization,
          experience: info.experienceYears,
        }),
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }

    setIsLoading(true);
    try {
      // Upload avatar - pass file directly
      const response = await api.upload.avatar(file);
      setProfileData((prev) => ({ ...prev, avatarUrl: response.url }));
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      toast.error("Không thể tải ảnh lên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }

    setIsSaving(true);
    try {
      // Update based on user role
      const updateData: any = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        avatarUrl: profileData.avatarUrl,
      };
      
      // Add teacher-specific fields
      if (user?.role === "teacher") {
        updateData.specialization = profileData.specialization ? [profileData.specialization] : undefined;
        updateData.experienceYears = profileData.experience;
      }

      switch (user?.role) {
        case "admin":
          await api.admins.update(user.id, updateData);
          break;
        case "teacher":
          await api.teachers.update(user.id, updateData);
          break;
        case "student":
          await api.students.update(user.id, updateData);
          break;
        case "parent":
          await api.parents.update(user.id, updateData);
          break;
      }
      
      // Refresh user data
      await mutate();
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Add change password endpoint to backend
      // For now, show a message that this feature is coming soon
      toast.info("Tính năng đổi mật khẩu đang được phát triển. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Không thể đổi mật khẩu. Vui lòng liên hệ quản trị viên.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "teacher":
        return "Giáo viên";
      case "student":
        return "Học sinh";
      case "parent":
        return "Phụ huynh";
      default:
        return "Ngườii dùng";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#6244F4]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#010101]">Thông tin cá nhân</h1>
        <p className="text-[#666666] mt-2">
          Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "info"
              ? "bg-[#6244F4] text-white"
              : "bg-white text-[#666666] hover:bg-gray-50 border border-[#E5E5E5]"
          }`}
        >
          <User className="w-4 h-4" />
          Thông tin cơ bản
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "password"
              ? "bg-[#6244F4] text-white"
              : "bg-white text-[#666666] hover:bg-gray-50 border border-[#E5E5E5]"
          }`}
        >
          <Lock className="w-4 h-4" />
          Đổi mật khẩu
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
      >
        {activeTab === "info" ? (
          <div className="p-6 md:p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <Avatar
                  src={profileData.avatarUrl}
                  name={getInitials(profileData.fullName)}
                  className="w-32 h-32 text-3xl"
                  classNames={{
                    base: "bg-[#6244F4]/10",
                    name: "text-[#6244F4] font-bold",
                  }}
                />
                <button
                  onClick={handleAvatarClick}
                  disabled={isLoading}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#6244F4] text-white rounded-full flex items-center justify-center hover:bg-[#5138d0] transition-colors shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-[#666666] mt-4">
                Nhấn vào biểu tượng camera để thay đổi ảnh đại diện
              </p>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#010101]">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#6244F4] focus:ring-2 focus:ring-[#6244F4]/20 outline-none transition-all"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#010101]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] bg-gray-50 text-[#666666] cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[#666666]">Email không thể thay đổi</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#010101]">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                  <input
                    type="tel"
                    value={profileData.phone || ""}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#6244F4] focus:ring-2 focus:ring-[#6244F4]/20 outline-none transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#010101]">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                  <input
                    type="text"
                    value={profileData.address || ""}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#6244F4] focus:ring-2 focus:ring-[#6244F4]/20 outline-none transition-all"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              {user.role === "student" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#010101]">
                      Mã học sinh
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                      <input
                        type="text"
                        value={profileData.studentCode || ""}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] bg-gray-50 text-[#666666] cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#010101]">
                      Khối lớp
                    </label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                      <input
                        type="text"
                        value={profileData.gradeLevel ? `Khối ${profileData.gradeLevel}` : ""}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] bg-gray-50 text-[#666666] cursor-not-allowed"
                      />
                    </div>
                  </div>
                </>
              )}

              {user.role === "teacher" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#010101]">
                      Chuyên môn
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                      <input
                        type="text"
                        value={profileData.specialization || ""}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            specialization: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#6244F4] focus:ring-2 focus:ring-[#6244F4]/20 outline-none transition-all"
                        placeholder="VD: Toán học"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#010101]">
                      Kinh nghiệm (năm)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                      <input
                        type="number"
                        value={profileData.experience || ""}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            experience: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#6244F4] focus:ring-2 focus:ring-[#6244F4]/20 outline-none transition-all"
                        placeholder="VD: 5"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-[#6244F4] text-white hover:bg-[#5138d0] px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#6244F4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[#6244F4]" />
                </div>
                <h2 className="text-xl font-bold text-[#010101]">Đổi mật khẩu</h2>
                <p className="text-[#666666] mt-2">
                  Vui lòng nhập mật khẩu hiện tại và mật khẩu mới
                </p>
              </div>

              <div className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#010101]">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#6244F4] focus:ring-2 focus:ring-[#6244F4]/20 outline-none transition-all"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#010101]"
                    >
                      {showPassword.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#010101]">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#6244F4] focus:ring-2 focus:ring-[#6244F4]/20 outline-none transition-all"
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#010101]"
                    >
                      {showPassword.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#666666]">Mật khẩu phải có ít nhất 6 ký tự</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#010101]">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E5E5E5] focus:border-[#6244F4] focus:ring-2 focus:ring-[#6244F4]/20 outline-none transition-all"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#010101]"
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordData.confirmPassword &&
                    passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Mật khẩu xác nhận không khớp
                      </p>
                    )}
                </div>
              </div>

              {/* Change Password Button */}
              <div className="mt-8">
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isSaving ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword ||
                    passwordData.newPassword !== passwordData.confirmPassword
                  }
                  className="w-full bg-[#6244F4] text-white hover:bg-[#5138d0]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Đổi mật khẩu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Account Info Card */}
      <div className="mt-6 bg-gradient-to-r from-[#6244F4]/5 to-[#D7F654]/5 rounded-2xl border border-[#E5E5E5] p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#6244F4] rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#010101]">{getRoleLabel(user.role)}</p>
            <p className="text-sm text-[#666666]">
              Vai trò của bạn trong hệ thống
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
