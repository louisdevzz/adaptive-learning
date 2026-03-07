"use client";

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Shield,
  GraduationCap,
  User,
  UsersRound,
  Mail,
  Lock,
  Phone,
  Building,
  Save,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2,
  UserCircle,
  School,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";

type UserRole = "admin" | "teacher" | "student" | "parent";

const roleOptions = [
  {
    value: "admin",
    label: "Quản trị viên",
    icon: Shield,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    value: "teacher",
    label: "Giáo viên",
    icon: GraduationCap,
    color: "bg-[#F0F8FF] text-[#0085FF] border-blue-200",
  },
  {
    value: "student",
    label: "Học sinh",
    icon: User,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    value: "parent",
    label: "Phụ huynh",
    icon: UsersRound,
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
];

export default function CreateUserPage() {
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
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>("teacher");
  const [loading, setLoading] = useState(false);

  // General information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  // Teacher specific
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");

  // Student specific
  const [studentCode, setStudentCode] = useState("");
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [schoolName, setSchoolName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");

  // Parent specific
  const [address, setAddress] = useState("");
  const [relationshipType, setRelationshipType] = useState<
    "father" | "mother" | "guardian"
  >("father");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Array<{id: string, fullName: string, studentInfo?: {studentCode: string}}>>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Admin specific
  const [adminLevel, setAdminLevel] = useState<"super" | "system" | "support">(
    "system",
  );

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  // Fetch students when parent role is selected
  useEffect(() => {
    if (role === "parent" && step === 2) {
      fetchStudents();
    }
  }, [role, step]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await api.students.getAll();
      setAvailableStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Không thể tải danh sách học sinh");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectedRoleConfig = roleOptions.find((r) => r.value === role);

  const handleNext = () => {
    if (step === 1) {
      if (!email || !password || !firstName || !lastName) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }
      if (password.length < 8) {
        toast.error("Mật khẩu phải có ít nhất 8 ký tự");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Vietnamese format: Họ + Tên (lastName + firstName)
      const fullName = `${lastName} ${firstName}`.trim();

      switch (role) {
        case "admin":
          await api.admins.create({
            email,
            password,
            fullName,
            adminLevel,
            permissions: [],
          });
          break;

        case "teacher":
          await api.teachers.create({
            email,
            password,
            fullName,
            specialization: department ? [department] : [],
            experienceYears: 0,
            phone: phone || "",
            avatarUrl: "",
          });
          break;

        case "student":
          await api.students.create({
            email,
            password,
            fullName,
            studentCode,
            gradeLevel,
            schoolName,
            dateOfBirth,
            gender,
            avatarUrl: "",
          });
          break;

        case "parent":
          await api.parents.create({
            email,
            password,
            fullName,
            phone,
            address,
            relationshipType,
            avatarUrl: "",
            studentIds: selectedStudentIds,
          });
          break;
      }

      toast.success("Tạo người dùng thành công!");
      router.push("/dashboard/users");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo người dùng. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                s < step
                  ? "bg-green-500 text-white"
                  : s === step
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              }`}
            >
              {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 mx-2 rounded ${
                  s < step ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#181d27] dark:text-white mb-2">
          Chọn vai trò
        </h2>
        <p className="text-sm text-[#717680] dark:text-gray-400">
          Chọn vai trò phù hợp cho người dùng mới
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = role === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setRole(option.value as UserRole)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-[#e9eaeb] dark:border-gray-700 hover:border-primary/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-[#181d27] dark:text-white">
                  {option.label}
                </p>
                <p className="text-xs text-[#717680] dark:text-gray-400">
                  {option.value === "admin" && "Quản lý hệ thống"}
                  {option.value === "teacher" && "Giảng dạy và quản lý lớp học"}
                  {option.value === "student" && "Học tập và làm bài tập"}
                  {option.value === "parent" && "Theo dõi tiến độ con"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#e9eaeb] dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-[#181d27] dark:text-white mb-4">
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Họ"
            placeholder="Ví dụ: Nguyễn"
            value={lastName}
            onValueChange={setLastName}
            isRequired
            startContent={<UserCircle className="w-4 h-4 text-[#717680]" />}
          />
          <Input
            label="Tên"
            placeholder="Ví dụ: Văn A"
            value={firstName}
            onValueChange={setFirstName}
            isRequired
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onValueChange={setEmail}
            isRequired
            startContent={<Mail className="w-4 h-4 text-[#717680]" />}
          />
          <Input
            label="Số điện thoại"
            placeholder="+84 xxx xxx xxx"
            value={phone}
            onValueChange={setPhone}
            startContent={<Phone className="w-4 h-4 text-[#717680]" />}
          />
        </div>
      </div>

      <div className="border-t border-[#e9eaeb] dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-[#181d27] dark:text-white mb-4">
          Mật khẩu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mật khẩu"
            type={isVisible ? "text" : "password"}
            value={password}
            onValueChange={setPassword}
            isRequired
            description="Tối thiểu 8 ký tự"
            startContent={<Lock className="w-4 h-4 text-[#717680]" />}
            endContent={
              <button
                type="button"
                onClick={toggleVisibility}
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
          <Input
            label="Xác nhận mật khẩu"
            type={isConfirmVisible ? "text" : "password"}
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            isRequired
            startContent={<Lock className="w-4 h-4 text-[#717680]" />}
            endContent={
              <button
                type="button"
                onClick={toggleConfirmVisibility}
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
    </div>
  );

  const renderStep2 = () => {
    switch (role) {
      case "teacher":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181d27] dark:text-white mb-2">
                Thông tin giáo viên
              </h2>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Nhập thông tin chuyên môn của giáo viên
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropdown>
                <DropdownTrigger>
                  <Input
                    label="Chuyên môn"
                    placeholder="Chọn môn dạy"
                    value={department}
                    readOnly
                    isRequired
                    startContent={<School className="w-4 h-4 text-[#717680]" />}
                  />
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={department ? [department] : []}
                  selectionMode="single"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setDepartment(selected || "");
                  }}
                >
                  <DropdownItem key="Toán">Toán học</DropdownItem>
                  <DropdownItem key="Vật lý">Vật lý</DropdownItem>
                  <DropdownItem key="Hóa học">Hóa học</DropdownItem>
                  <DropdownItem key="Sinh học">Sinh học</DropdownItem>
                  <DropdownItem key="Ngữ văn">Ngữ văn</DropdownItem>
                  <DropdownItem key="Lịch sử">Lịch sử</DropdownItem>
                  <DropdownItem key="Địa lý">Địa lý</DropdownItem>
                  <DropdownItem key="Tiếng Anh">Tiếng Anh</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        );

      case "student":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181d27] dark:text-white mb-2">
                Thông tin học sinh
              </h2>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Nhập thông tin học tập của học sinh
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Mã học sinh"
                placeholder="Nhập mã học sinh"
                value={studentCode}
                onValueChange={setStudentCode}
                isRequired
              />
              <Dropdown>
                <DropdownTrigger>
                  <Input
                    label="Khối lớp"
                    placeholder="Chọn khối"
                    value={`Khối ${gradeLevel}`}
                    readOnly
                    isRequired
                    startContent={<School className="w-4 h-4 text-[#717680]" />}
                  />
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[gradeLevel.toString()]}
                  selectionMode="single"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setGradeLevel(parseInt(selected) || 10);
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <DropdownItem key={grade.toString()}>
                      Khối {grade}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Input
                label="Trường học"
                placeholder="Tên trường"
                value={schoolName}
                onValueChange={setSchoolName}
                isRequired
                startContent={<Building className="w-4 h-4 text-[#717680]" />}
              />
              <Input
                label="Ngày sinh"
                type="date"
                value={dateOfBirth}
                onValueChange={setDateOfBirth}
                startContent={<Calendar className="w-4 h-4 text-[#717680]" />}
              />
              <Dropdown>
                <DropdownTrigger>
                  <Input
                    label="Giới tính"
                    value={
                      gender === "male"
                        ? "Nam"
                        : gender === "female"
                          ? "Nữ"
                          : "Khác"
                    }
                    readOnly
                    startContent={<User className="w-4 h-4 text-[#717680]" />}
                  />
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[gender]}
                  selectionMode="single"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setGender(
                      (selected as "male" | "female" | "other") || "male",
                    );
                  }}
                >
                  <DropdownItem key="male">Nam</DropdownItem>
                  <DropdownItem key="female">Nữ</DropdownItem>
                  <DropdownItem key="other">Khác</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        );

      case "parent":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181d27] dark:text-white mb-2">
                Thông tin phụ huynh
              </h2>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Nhập thông tin liên hệ của phụ huynh
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropdown>
                <DropdownTrigger>
                  <Input
                    label="Mối quan hệ"
                    value={
                      relationshipType === "father"
                        ? "Bố"
                        : relationshipType === "mother"
                          ? "Mẹ"
                          : "Người giám hộ"
                    }
                    readOnly
                    isRequired
                  />
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[relationshipType]}
                  selectionMode="single"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setRelationshipType(
                      (selected as "father" | "mother" | "guardian") ||
                        "father",
                    );
                  }}
                >
                  <DropdownItem key="father">Bố</DropdownItem>
                  <DropdownItem key="mother">Mẹ</DropdownItem>
                  <DropdownItem key="guardian">Người giám hộ</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Input
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                value={address}
                onValueChange={setAddress}
                startContent={<Building className="w-4 h-4 text-[#717680]" />}
              />
            </div>

            {/* Student Selection */}
            <div className="border-t border-[#e9eaeb] dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-[#181d27] dark:text-white mb-4">
                Liên kết với học sinh
              </h3>
              <p className="text-sm text-[#717680] dark:text-gray-400 mb-4">
                Chọn học sinh mà phụ huynh này sẽ theo dõi
              </p>
              
              {loadingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-gray-500">Chưa có học sinh nào trong hệ thống</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentToggle(student.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        selectedStudentIds.includes(student.id)
                          ? "bg-primary/10 border border-primary"
                          : "bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedStudentIds.includes(student.id)
                          ? "bg-primary border-primary"
                          : "border-gray-300"
                      }`}>
                        {selectedStudentIds.includes(student.id) && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#181d27] dark:text-white">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Mã HS: {student.studentInfo?.studentCode || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedStudentIds.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Đã chọn {selectedStudentIds.length} học sinh
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "admin":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181d27] dark:text-white mb-2">
                Cấu hình quản trị
              </h2>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Chọn cấp độ quyền hạn cho quản trị viên
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Dropdown>
                <DropdownTrigger>
                  <Input
                    label="Cấp độ quản trị"
                    value={
                      adminLevel === "super"
                        ? "Quản trị cấp cao"
                        : adminLevel === "system"
                          ? "Quản trị hệ thống"
                          : "Hỗ trợ"
                    }
                    readOnly
                    isRequired
                    startContent={<Shield className="w-4 h-4 text-[#717680]" />}
                  />
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[adminLevel]}
                  selectionMode="single"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setAdminLevel(
                      (selected as "super" | "system" | "support") || "system",
                    );
                  }}
                >
                  <DropdownItem key="super">Quản trị cấp cao</DropdownItem>
                  <DropdownItem key="system">Quản trị hệ thống</DropdownItem>
                  <DropdownItem key="support">Hỗ trợ</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        );
    }
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#181d27] dark:text-white mb-2">
          Xác nhận thông tin
        </h2>
        <p className="text-sm text-[#717680] dark:text-gray-400">
          Kiểm tra lại thông tin trước khi tạo người dùng
        </p>
      </div>

      <div className="bg-[#f9fafb] dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-[#e9eaeb] dark:border-gray-700">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRoleConfig?.color}`}
          >
            {selectedRoleConfig && (
              <selectedRoleConfig.icon className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm text-[#717680] dark:text-gray-400">Vai trò</p>
            <p className="font-semibold text-[#181d27] dark:text-white">
              {selectedRoleConfig?.label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#717680] dark:text-gray-400">Họ tên</p>
            <p className="font-medium text-[#181d27] dark:text-white">
              {lastName} {firstName}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#717680] dark:text-gray-400">Email</p>
            <p className="font-medium text-[#181d27] dark:text-white">
              {email}
            </p>
          </div>
          {role === "student" && (
            <>
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400">
                  Mã học sinh
                </p>
                <p className="font-medium text-[#181d27] dark:text-white">
                  {studentCode || "Chưa có"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400">
                  Khối lớp
                </p>
                <p className="font-medium text-[#181d27] dark:text-white">
                  Khối {gradeLevel}
                </p>
              </div>
            </>
          )}
          {role === "teacher" && (
            <div>
              <p className="text-sm text-[#717680] dark:text-gray-400">
                Chuyên môn
              </p>
              <p className="font-medium text-[#181d27] dark:text-white">
                {department || "Chưa có"}
              </p>
            </div>
          )}
          {role === "parent" && (
            <>
              <div>
                <p className="text-sm text-[#717680] dark:text-gray-400">
                  Mối quan hệ
                </p>
                <p className="font-medium text-[#181d27] dark:text-white">
                  {relationshipType === "father"
                    ? "Bố"
                    : relationshipType === "mother"
                      ? "Mẹ"
                      : "Ngườ giám hộ"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[#717680] dark:text-gray-400">
                  Học sinh liên kết
                </p>
                <p className="font-medium text-[#181d27] dark:text-white">
                  {selectedStudentIds.length > 0
                    ? `${selectedStudentIds.length} học sinh`
                    : "Chưa chọn học sinh nào"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-[800px] mx-auto">
        {/* Header */}
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
            <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">
              Tạo người dùng mới
            </h1>
            <p className="text-[#717680] dark:text-gray-400 text-sm">
              Thêm người dùng mới vào hệ thống
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form Card */}
        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e9eaeb] dark:border-gray-700 p-6 md:p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#e9eaeb] dark:border-gray-700">
            <Button
              variant="light"
              onPress={
                step === 1 ? () => router.push("/dashboard/users") : handleBack
              }
              className="text-[#717680]"
            >
              {step === 1 ? "Hủy" : "Quay lại"}
            </Button>
            <div className="flex gap-3">
              {step < 3 ? (
                <Button onPress={handleNext} className="bg-primary text-white">
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  onPress={handleSubmit}
                  isLoading={loading}
                  className="bg-primary text-white"
                  startContent={!loading && <Save className="w-4 h-4" />}
                >
                  Tạo người dùng
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
