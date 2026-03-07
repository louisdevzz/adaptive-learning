"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { 
  Users, UserPlus, Trash2, CheckCircle2, Search, ChevronDown, Filter, 
  GraduationCap, School
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ClassEnrollment } from "@/types/class";
import { Student } from "@/types/student";

interface StudentsTabProps {
  classId: string;
  students: ClassEnrollment[];
  onStudentsChange: () => void;
}

export function StudentsTab({ classId, students, onStudentsChange }: StudentsTabProps) {
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentFilterGrade, setStudentFilterGrade] = useState<string>('all');
  const [studentFilterSchool, setStudentFilterSchool] = useState<string>('all');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);

  const loadAvailableStudents = async () => {
    try {
      setLoadingStudents(true);
      const available = await api.classes.getAvailableStudents(classId);
      setAvailableStudents(available);
    } catch (error) {
      console.error('Error loading available students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const uniqueSchools = useMemo(() => {
    const schools = availableStudents
      .map(s => s.studentInfo?.schoolName)
      .filter((school): school is string => !!school);
    return Array.from(new Set(schools)).sort();
  }, [availableStudents]);

  const uniqueGrades = useMemo(() => {
    const grades = availableStudents
      .map(s => s.studentInfo?.gradeLevel)
      .filter((grade): grade is number => grade !== undefined);
    return Array.from(new Set(grades)).sort((a, b) => a - b);
  }, [availableStudents]);

  const filteredStudents = useMemo(() => {
    return availableStudents.filter((student) => {
      if (studentSearchQuery.trim()) {
        const query = studentSearchQuery.toLowerCase();
        const matchesSearch = 
          student.fullName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.studentInfo?.studentCode.toLowerCase().includes(query) ||
          student.studentInfo?.schoolName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (studentFilterGrade !== 'all') {
        if (student.studentInfo?.gradeLevel !== parseInt(studentFilterGrade)) {
          return false;
        }
      }

      if (studentFilterSchool !== 'all') {
        if (student.studentInfo?.schoolName !== studentFilterSchool) {
          return false;
        }
      }

      return true;
    });
  }, [availableStudents, studentSearchQuery, studentFilterGrade, studentFilterSchool]);

  useEffect(() => {
    if (showAddStudent) {
      loadAvailableStudents();
      setStudentSearchQuery('');
      setStudentFilterGrade('all');
      setStudentFilterSchool('all');
      setSelectedStudentId('');
    }
  }, [showAddStudent]);

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsAddingStudent(true);
      toastId = toast.loading("Đang thêm học sinh vào lớp...");
      
      await api.classes.enrollStudent(classId, {
        studentId: selectedStudentId,
        status: 'active'
      });
      
      await onStudentsChange();
      setShowAddStudent(false);
      setSelectedStudentId('');
      toast.success("Thêm học sinh thành công", { id: toastId });
    } catch (error: any) {
      console.error('Error adding student:', error);
      const errorMessage = error.response?.data?.message || "Không thể thêm học sinh. Có thể học sinh đã được thêm vào lớp này.";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    setDeletingStudentId(studentId);
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveStudent = async () => {
    if (!deletingStudentId) return;
    
    let toastId: string | number | undefined;
    try {
      setIsRemovingStudent(true);
      toastId = toast.loading("Đang xóa học sinh khỏi lớp...");
      
      await api.classes.removeStudent(classId, deletingStudentId);
      await onStudentsChange();
      
      setIsDeleteModalOpen(false);
      setDeletingStudentId(null);
      toast.success("Xóa học sinh khỏi lớp thành công", { id: toastId });
    } catch (error: any) {
      console.error('Error removing student:', error);
      const errorMessage = error.response?.data?.message || "Không thể xóa học sinh khỏi lớp.";
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsRemovingStudent(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#181d27]">Danh sách học sinh</h2>
          <button
            onClick={() => setShowAddStudent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7f56d9] text-white rounded-lg hover:bg-[#6941c6] transition-colors"
          >
            <UserPlus className="size-4" />
            <span>Thêm học sinh</span>
          </button>
        </div>

        {students.length === 0 ? (
          <div className="bg-white border border-[#e9eaeb] rounded-lg p-8 text-center">
            <Users className="size-12 mx-auto mb-4 text-[#9ca3af]" />
            <p className="text-[#535862]">Chưa có học sinh nào trong lớp</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e9eaeb] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f9fafb] border-b border-[#e9eaeb]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Họ tên</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Mã học sinh</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Trường</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#181d27]">Trạng thái</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#181d27]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9eaeb]">
                {students.map((enrollment) => (
                  <tr key={enrollment.enrollmentId} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={enrollment.student.avatarUrl}
                          className="rounded-full shrink-0 w-6 h-6"
                          name={enrollment.student.fullName}
                          fallback={
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7f56d9] to-[#6941c6] flex items-center justify-center text-white font-medium text-[10px]">
                              {enrollment.student.fullName.charAt(0).toUpperCase()}
                            </div>
                          }
                        />
                        <span className="font-medium text-[#181d27] text-sm truncate max-w-[200px]">
                          {enrollment.student.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-[#535862]">
                        {enrollment.student.studentInfo?.studentCode || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-[#535862] truncate block max-w-[200px]">
                        {enrollment.student.studentInfo?.schoolName || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        enrollment.status === 'active' 
                          ? 'bg-[#d1fae5] text-[#027a48]'
                          : enrollment.status === 'withdrawn'
                          ? 'bg-[#fee2e2] text-[#dc2626]'
                          : 'bg-[#e0e7ff] text-[#4338ca]'
                      }`}>
                        {enrollment.status === 'active' ? 'Đang học' : 
                         enrollment.status === 'withdrawn' ? 'Đã rút' : 'Hoàn thành'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleRemoveStudent(enrollment.student.id)}
                        className="p-1.5 text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-colors"
                        title="Xóa khỏi lớp"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal 
        isOpen={showAddStudent} 
        onOpenChange={setShowAddStudent}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="font-semibold text-lg text-[#181d27]">
                  Thêm học sinh vào lớp
                </h2>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col gap-3">
                    <Input
                      placeholder="Tìm kiếm theo tên, email, mã học sinh..."
                      size="sm"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      startContent={<Search className="size-4 text-[#717680]" />}
                      classNames={{
                        input: "text-sm",
                        inputWrapper: "border-[#d5d7da] h-9",
                      }}
                    />
                    <div className="flex gap-2">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            size="sm"
                            className="border-[#d5d7da] text-[#414651] font-semibold"
                            endContent={<ChevronDown className="size-4" />}
                            startContent={<Filter className="size-4" />}
                          >
                            {studentFilterGrade === 'all' ? 'Tất cả khối' : `Khối ${studentFilterGrade}`}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Grade filter"
                          selectedKeys={[studentFilterGrade]}
                          selectionMode="single"
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setStudentFilterGrade(value);
                          }}
                        >
                          {[
                            <DropdownItem key="all" textValue="Tất cả khối">Tất cả khối</DropdownItem>,
                            ...uniqueGrades.map((grade) => (
                              <DropdownItem key={grade.toString()} textValue={`Khối ${grade}`}>
                                Khối {grade}
                              </DropdownItem>
                            ))
                          ]}
                        </DropdownMenu>
                      </Dropdown>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            size="sm"
                            className="border-[#d5d7da] text-[#414651] font-semibold"
                            endContent={<ChevronDown className="size-4" />}
                            startContent={<School className="size-4" />}
                          >
                            {studentFilterSchool === 'all' ? 'Tất cả trường' : studentFilterSchool}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="School filter"
                          selectedKeys={[studentFilterSchool]}
                          selectionMode="single"
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setStudentFilterSchool(value);
                          }}
                        >
                          {[
                            <DropdownItem key="all" textValue="Tất cả trường">Tất cả trường</DropdownItem>,
                            ...uniqueSchools.map((school) => (
                              <DropdownItem key={school} textValue={school}>
                                {school}
                              </DropdownItem>
                            ))
                          ]}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="border border-[#e9eaeb] rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                    {loadingStudents ? (
                      <div className="p-8 text-center">
                        <p className="text-sm text-[#535862]">Đang tải...</p>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="p-8 text-center">
                        <Users className="size-12 mx-auto mb-4 text-[#9ca3af]" />
                        <p className="text-sm text-[#535862]">
                          {studentSearchQuery || studentFilterGrade !== 'all' || studentFilterSchool !== 'all'
                            ? 'Không tìm thấy học sinh phù hợp'
                            : 'Không có học sinh nào có sẵn'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#e9eaeb]">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            className={`p-4 cursor-pointer transition-all duration-200 ${
                              selectedStudentId === student.id
                                ? 'bg-[#f3f0ff] border-l-4 border-l-[#7f56d9] shadow-sm'
                                : 'hover:bg-[#f9fafb] border-l-4 border-l-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar
                                src={student.avatarUrl}
                                size="md"
                                className="rounded-full shrink-0"
                                name={student.fullName}
                                fallback={
                                  <div className="size-10 rounded-full bg-gradient-to-br from-[#7f56d9] to-[#6941c6] flex items-center justify-center text-white font-semibold text-sm">
                                    {student.fullName.charAt(0).toUpperCase()}
                                  </div>
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-[#181d27] text-sm truncate">
                                    {student.fullName}
                                  </p>
                                  {selectedStudentId === student.id && (
                                    <CheckCircle2 className="size-4 text-[#7f56d9] shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-[#535862] truncate mb-2">
                                  {student.email}
                                </p>
                                {student.studentInfo && (
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#f0f0f0]">
                                      <span className="text-xs font-medium text-[#414651]">
                                        Mã: {student.studentInfo.studentCode}
                                      </span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#e0f2fe]">
                                      <GraduationCap className="size-3 text-[#0369a1]" />
                                      <span className="text-xs font-medium text-[#0369a1]">
                                        Khối {student.studentInfo.gradeLevel}
                                      </span>
                                    </div>
                                    {student.studentInfo.schoolName && (
                                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#f0fdf4]">
                                        <School className="size-3 text-[#027a48]" />
                                        <span className="text-xs font-medium text-[#027a48] truncate max-w-[200px]">
                                          {student.studentInfo.schoolName}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-[#414651]"
                >
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    await handleAddStudent();
                    if (!isAddingStudent) {
                      onClose();
                    }
                  }}
                  isDisabled={!selectedStudentId || isAddingStudent}
                  isLoading={isAddingStudent}
                  className="font-semibold"
                >
                  {isAddingStudent ? 'Đang thêm...' : 'Thêm học sinh'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Student Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) {
            setDeletingStudentId(null);
          }
        }}
        size="md"
      >
        <ModalContent>
          {(onClose) => {
            const studentToDelete = students.find(s => s.student.id === deletingStudentId);
            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="font-semibold text-lg text-[#181d27]">
                    Xác nhận xóa học sinh
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-[#414651]">
                    Bạn có chắc chắn muốn xóa học sinh <span className="font-semibold text-[#181d27]">{studentToDelete?.student.fullName}</span> khỏi lớp này? Hành động này không thể hoàn tác.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    className="text-[#414651]"
                    isDisabled={isRemovingStudent}
                  >
                    Hủy
                  </Button>
                  <Button
                    color="danger"
                    onPress={async () => {
                      await confirmRemoveStudent();
                      if (!isRemovingStudent) {
                        onClose();
                      }
                    }}
                    isLoading={isRemovingStudent}
                    className="font-semibold"
                  >
                    {isRemovingStudent ? 'Đang xóa...' : 'Xóa học sinh'}
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
}

