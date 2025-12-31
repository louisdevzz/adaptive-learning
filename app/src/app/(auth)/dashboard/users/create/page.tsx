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
  LockKeyhole,
  Phone,
  Building,
  Save,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type UserRole = "admin" | "teacher" | "student" | "parent";

const roleOptions = [
  { value: "admin", label: "Admin", icon: Shield },
  { value: "teacher", label: "Teacher", icon: GraduationCap },
  { value: "student", label: "Student", icon: User },
  { value: "parent", label: "Parent", icon: UsersRound },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("teacher");
  const [loading, setLoading] = useState(false);
  
  // General information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Teacher specific
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [classInput, setClassInput] = useState("");

  // Student specific
  const [studentCode, setStudentCode] = useState("");
  const [gradeLevel, setGradeLevel] = useState<number>(1);
  const [schoolName, setSchoolName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");

  // Parent specific
  const [address, setAddress] = useState("");
  const [relationshipType, setRelationshipType] = useState<"father" | "mother" | "guardian">("father");
  const [studentIds, setStudentIds] = useState<string[]>([]);

  // Admin specific
  const [adminLevel, setAdminLevel] = useState<"super" | "system" | "support">("system");
  const [permissions, setPermissions] = useState<string[]>([]);

  const handleAddClass = () => {
    if (classInput.trim() && !assignedClasses.includes(classInput.trim())) {
      setAssignedClasses([...assignedClasses, classInput.trim()]);
      setClassInput("");
    }
  };

  const handleRemoveClass = (className: string) => {
    setAssignedClasses(assignedClasses.filter((c) => c !== className));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password || !firstName || !lastName) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 8) {
      alert("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    try {
      setLoading(true);
      const fullName = `${firstName} ${lastName}`.trim();

      switch (role) {
        case "admin":
          await api.admins.create({
            email,
            password,
            fullName,
            adminLevel,
            permissions,
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
            studentIds,
          });
          break;
      }

      alert("Tạo người dùng thành công!");
      router.push("/dashboard/users");
    } catch (error: any) {
      console.error("Error creating user:", error);
      alert(error.response?.data?.message || "Không thể tạo người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const RoleIcon = roleOptions.find((r) => r.value === role)?.icon || Shield;

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-6 max-w-[960px] mx-auto w-full">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between gap-3 px-4">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white tracking-tight">
              Create New User
            </h1>
            <p className="text-[#4c669a] dark:text-gray-400 text-sm">
              Enter details to onboard a new user into the system.
            </p>
          </div>
        </div>

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6 md:p-8">
          {/* Role Selection Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white border-b border-[#f0f2f5] dark:border-[#2d3748] pb-3">
              <span className="text-[#135bec] mr-2">01.</span> Account Role
            </h3>
            <div className="flex flex-wrap gap-3">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = role === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex-1 min-w-[140px] cursor-pointer relative`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="peer invisible absolute"
                    />
                    <div
                      className={`flex items-center justify-center rounded-lg border px-4 h-12 font-medium transition-all ${
                        isSelected
                          ? "border-[#135bec] border-2 bg-[#135bec]/5 text-[#135bec]"
                          : "border-[#cfd7e7] dark:border-[#4a5568] text-[#4c669a] dark:text-gray-300 bg-white dark:bg-[#2d3748] hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="size-5 mr-2" />
                      {option.label}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* General Information Section */}
          <div className="flex flex-col gap-6 mt-4">
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white border-b border-[#f0f2f5] dark:border-[#2d3748] pb-3">
              <span className="text-[#135bec] mr-2">02.</span> General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                placeholder="e.g. Sarah"
                value={firstName}
                onValueChange={setFirstName}
                isRequired
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                }}
              />
              <Input
                label="Last Name"
                placeholder="e.g. Connor"
                value={lastName}
                onValueChange={setLastName}
                isRequired
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                }}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="sarah.connor@school.edu"
                value={email}
                onValueChange={setEmail}
                isRequired
                startContent={<Mail className="size-4 text-[#9ca3af]" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                }}
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onValueChange={setPassword}
                isRequired
                description="Must be at least 8 characters."
                startContent={<Lock className="size-4 text-[#9ca3af]" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                  description: "text-xs text-[#4c669a]",
                }}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                isRequired
                startContent={<LockKeyhole className="size-4 text-[#9ca3af]" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                }}
              />
            </div>
          </div>

          {/* Dynamic Section based on Role */}
          {role === "teacher" && (
            <div className="flex flex-col gap-6 mt-4">
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white border-b border-[#f0f2f5] dark:border-[#2d3748] pb-3 flex items-center justify-between">
    <div>
                  <span className="text-[#135bec] mr-2">03.</span> Professional Details
                </div>
                <span className="text-xs font-normal bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  Teacher Role Selected
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Staff ID"
                  placeholder="T-2024-XXX"
                  value={staffId}
                  onValueChange={setStaffId}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                  }}
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Input
                      label="Department / Specialization"
                      placeholder="Select department"
                      value={department}
                      readOnly
                      classNames={{
                        input: "text-sm cursor-pointer",
                        inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                      }}
                      endContent={
                        <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      }
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
                    <DropdownItem key="mathematics">Mathematics</DropdownItem>
                    <DropdownItem key="science">Science</DropdownItem>
                    <DropdownItem key="literature">Literature</DropdownItem>
                    <DropdownItem key="history">History</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-gray-200">
                    Assigned Classes
                  </label>
                  <div className="w-full rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] p-2 min-h-[50px] flex flex-wrap gap-2">
                    {assignedClasses.map((className) => (
                      <div
                        key={className}
                        className="flex items-center gap-1 bg-white dark:bg-[#4a5568] border border-[#e2e8f0] dark:border-[#718096] rounded px-2 py-1 text-sm text-[#0d121b] dark:text-white"
                      >
                        {className}
                        <button
                          type="button"
                          onClick={() => handleRemoveClass(className)}
                          className="text-gray-400 hover:text-red-500 ml-1"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                    <input
                      className="flex-1 bg-transparent outline-none min-w-[150px] px-2 text-sm text-[#0d121b] dark:text-white placeholder-[#9ca3af]"
                      placeholder="Type to search classes..."
                      value={classInput}
                      onChange={(e) => setClassInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddClass();
                        }
                      }}
                    />
                  </div>
                </div>
                <Input
                  label="Contact Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onValueChange={setPhone}
                  startContent={<Phone className="size-4 text-[#9ca3af]" />}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                  }}
                />
              </div>
            </div>
          )}

          {role === "student" && (
            <div className="flex flex-col gap-6 mt-4">
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white border-b border-[#f0f2f5] dark:border-[#2d3748] pb-3">
                <span className="text-[#135bec] mr-2">03.</span> Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Student Code"
                  placeholder="STU-2024-XXX"
                  value={studentCode}
                  onValueChange={setStudentCode}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                  }}
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Input
                      label="Grade Level"
                      value={`Grade ${gradeLevel}`}
                      readOnly
                      classNames={{
                        input: "text-sm cursor-pointer",
                        inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                      }}
                      endContent={
                        <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      }
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    selectedKeys={[gradeLevel.toString()]}
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setGradeLevel(parseInt(selected) || 1);
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                      <DropdownItem key={grade.toString()}>Grade {grade}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
                <Input
                  label="School Name"
                  placeholder="Enter school name"
                  value={schoolName}
                  onValueChange={setSchoolName}
                  startContent={<Building className="size-4 text-[#9ca3af]" />}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                  }}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onValueChange={setDateOfBirth}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                  }}
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Input
                      label="Gender"
                      value={gender.charAt(0).toUpperCase() + gender.slice(1)}
                      readOnly
                      classNames={{
                        input: "text-sm cursor-pointer",
                        inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                      }}
                      endContent={
                        <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      }
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    selectedKeys={[gender]}
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setGender((selected as "male" | "female" | "other") || "male");
                    }}
                  >
                    <DropdownItem key="male">Male</DropdownItem>
                    <DropdownItem key="female">Female</DropdownItem>
                    <DropdownItem key="other">Other</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          )}

          {role === "parent" && (
            <div className="flex flex-col gap-6 mt-4">
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white border-b border-[#f0f2f5] dark:border-[#2d3748] pb-3">
                <span className="text-[#135bec] mr-2">03.</span> Parent Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onValueChange={setPhone}
                  startContent={<Phone className="size-4 text-[#9ca3af]" />}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                  }}
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Input
                      label="Relationship Type"
                      value={relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}
                      readOnly
                      classNames={{
                        input: "text-sm cursor-pointer",
                        inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                      }}
                      endContent={
                        <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      }
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    selectedKeys={[relationshipType]}
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setRelationshipType((selected as "father" | "mother" | "guardian") || "father");
                    }}
                  >
                    <DropdownItem key="father">Father</DropdownItem>
                    <DropdownItem key="mother">Mother</DropdownItem>
                    <DropdownItem key="guardian">Guardian</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Input
                  label="Address"
                  placeholder="Enter address"
                  value={address}
                  onValueChange={setAddress}
                  className="md:col-span-2"
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                  }}
                />
              </div>
            </div>
          )}

          {role === "admin" && (
            <div className="flex flex-col gap-6 mt-4">
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white border-b border-[#f0f2f5] dark:border-[#2d3748] pb-3">
                <span className="text-[#135bec] mr-2">03.</span> Admin Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dropdown>
                  <DropdownTrigger>
                    <Input
                      label="Admin Level"
                      value={adminLevel === "super" ? "Super Admin" : adminLevel === "system" ? "System Admin" : "Support"}
                      readOnly
                      classNames={{
                        input: "text-sm cursor-pointer",
                        inputWrapper: "border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748]",
                      }}
                      endContent={
                        <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      }
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    selectedKeys={[adminLevel]}
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setAdminLevel((selected as "super" | "system" | "support") || "system");
                    }}
                  >
                    <DropdownItem key="super">Super Admin</DropdownItem>
                    <DropdownItem key="system">System Admin</DropdownItem>
                    <DropdownItem key="support">Support</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-[#f0f2f5] dark:border-[#2d3748]">
            <Button
              variant="bordered"
              className="border-[#cfd7e7] text-[#4c669a] dark:text-gray-300"
              onPress={() => router.push("/dashboard/users")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="bg-[#135bec] hover:bg-blue-700 text-white"
              startContent={!loading && <Save className="size-4" />}
            >
              Create User
            </Button>
          </div>
        </form>
    </div>
    </LayoutDashboard>
  );
}
