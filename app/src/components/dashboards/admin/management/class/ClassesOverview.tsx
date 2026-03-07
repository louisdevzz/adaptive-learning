"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { Class, ClassEnrollment } from "@/types/class";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ClassesOverviewProps {
  classes: Class[];
  loading: boolean;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface ClassWithStudents extends Class {
  students: ClassEnrollment[];
}

export function ClassesOverview({ classes, loading }: ClassesOverviewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("");
  const [classesWithStudents, setClassesWithStudents] = useState<
    ClassWithStudents[]
  >([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (classes.length > 0) {
      fetchStudentsForClasses();
    }
  }, [classes]);

  const fetchStudentsForClasses = async () => {
    try {
      setLoadingStudents(true);
      const promises = classes.map(async (classItem) => {
        try {
          const students = await api.classes.getClassStudents(classItem.id);
          return { ...classItem, students };
        } catch (error) {
          console.error(
            `Error fetching students for class ${classItem.id}:`,
            error,
          );
          return { ...classItem, students: [] };
        }
      });
      const results = await Promise.all(promises);
      setClassesWithStudents(results);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filter classes
  const filteredClasses = classesWithStudents.filter((classItem) => {
    const matchesSearch =
      classItem.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.gradeLevel.toString().includes(searchQuery) ||
      classItem.schoolYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.homeroomTeacher?.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (selectedClassFilter && selectedClassFilter !== "") {
      if (classItem.className !== selectedClassFilter) return false;
    }

    return matchesSearch;
  });

  // Paginate
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filters */}
      <div className="bg-white dark:bg-[#1a2231] p-4 rounded-xl border border-[#E5E5E5] dark:border-[#2a3447] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full md:w-auto gap-3 items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Input
              placeholder="Tìm kiếm theo tên học sinh..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search className="size-5 text-[#666666]" />}
              className="w-full"
              classNames={{
                input: "text-sm",
                inputWrapper: "border-[#E5E5E5] dark:border-[#2a3447]",
              }}
            />
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="min-w-[160px] justify-between border-[#E5E5E5] dark:border-[#2a3447]"
                endContent={<ChevronDown className="size-4" />}
              >
                {selectedClassFilter || "Tất cả Lớp"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={selectedClassFilter ? [selectedClassFilter] : []}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedClassFilter(selected || "");
              }}
              items={[
                { key: "", label: "Tất cả Lớp" },
                ...classes.map((classItem) => ({
                  key: classItem.className,
                  label: classItem.className,
                })),
              ]}
            >
              {(item) => (
                <DropdownItem key={item.key}>{item.label}</DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="bg-white dark:bg-[#1a2231] border border-[#E5E5E5] dark:border-[#2a3447] rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 p-6">
        {loading || loadingStudents ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[#666666] dark:text-gray-400">Đang tải...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {paginatedClasses.map((classItem) => (
              <div key={classItem.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#010101] dark:text-white">
                    {classItem.className}{" "}
                    <span className="text-[#666666] text-sm font-normal">
                      ({classItem.students.length} Học sinh)
                    </span>
                  </h3>
                  <Link
                    href={`/dashboard/classes/${classItem.id}`}
                    className="text-sm text-[#6244F4] hover:underline font-medium"
                  >
                    Xem tất cả
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {classItem.students.slice(0, 4).map((enrollment) => {
                    const student = enrollment.student;
                    const isActive = enrollment.status === "active";

                    return (
                      <div
                        key={enrollment.enrollmentId}
                        className="bg-[#f8f9fcc6] dark:bg-[#101622] border border-[#E5E5E5] dark:border-[#2a3447] rounded-lg p-4 flex flex-col items-center text-center hover:shadow-sm transition-shadow"
                      >
                        {student.avatarUrl ? (
                          <Avatar
                            src={student.avatarUrl}
                            size="lg"
                            className="size-20 rounded-full mb-3 border-2 border-[#6244F4]/20 dark:border-[#6244F4]/50"
                          />
                        ) : (
                          <div className="size-20 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center justify-center font-bold text-xl border-2 border-green-500/20 dark:border-green-500/30 mb-3">
                            {getInitials(student.fullName)}
                          </div>
                        )}
                        <p className="font-semibold text-[#010101] dark:text-white text-lg">
                          {student.fullName}
                        </p>
                        <p className="text-[#666666] dark:text-gray-400 text-sm mb-2">
                          {student.email}
                        </p>
                        <div className="flex items-center gap-1.5 mb-4">
                          <span
                            className={`size-2 rounded-full ${
                              isActive
                                ? "bg-success"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                          <span className="text-[#666666] dark:text-gray-300 text-sm">
                            {isActive ? "Active" : "Offline"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="light"
                            size="sm"
                            className="bg-[#6244F4]/10 hover:bg-[#6244F4]/20 text-[#6244F4]"
                            startContent={<TrendingUp className="size-4" />}
                            onPress={() =>
                              router.push(
                                `/dashboard/students/${student.id}/progress`,
                              )
                            }
                          >
                            Tiến độ
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#666666] dark:text-gray-400"
                            startContent={<MessageSquare className="size-4" />}
                            onPress={() =>
                              router.push(`/dashboard/students/${student.id}`)
                            }
                          >
                            Liên hệ
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#2a3447] flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl mt-6">
            <span className="text-sm text-[#666666] dark:text-gray-400">
              Hiển thị{" "}
              <span className="font-semibold text-[#010101] dark:text-white">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredClasses.length)}
              </span>{" "}
              trong{" "}
              <span className="font-semibold text-[#010101] dark:text-white">
                {filteredClasses.length}
              </span>{" "}
              lớp học
            </span>
            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                isDisabled={currentPage === 1}
                onPress={() => setCurrentPage(currentPage - 1)}
                className="border border-[#E5E5E5] dark:border-[#2a3447]"
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                // @ts-ignore
                let pageNum;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (currentPage <= 2) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "solid" : "light"}
                    size="sm"
                    className={`min-w-[32px] h-8 ${
                      currentPage === pageNum
                        ? "bg-[#6244F4] text-white"
                        : "text-[#666666] dark:text-gray-400"
                    }`}
                    // @ts-ignore
                    onPress={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                isDisabled={currentPage === totalPages}
                onPress={() => setCurrentPage(currentPage + 1)}
                className="border border-[#E5E5E5] dark:border-[#2a3447]"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
