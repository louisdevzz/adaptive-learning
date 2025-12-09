"use client"

import LayoutDashboard from "@/components/dashboards/LayoutDashboard";
import { useParams } from "next/navigation";    
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Class, ClassEnrollment } from "@/types/class";
import { ClassDetailHeader, StudentsTab, CoursesTab, type ClassCourse } from "@/components/dashboards/admin/management/class";

type TabType = 'students' | 'courses';

export default function ClassPage() {
    const { classId } = useParams();
    const [activeTab, setActiveTab] = useState<TabType>('students');
    const [classData, setClassData] = useState<Class | null>(null);
    const [students, setStudents] = useState<ClassEnrollment[]>([]);
    const [courses, setCourses] = useState<ClassCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (classId && typeof classId === 'string') {
            loadClassData();
        }
    }, [classId]);

    const loadClassData = async () => {
        if (!classId || typeof classId !== 'string') return;
        
        try {
            setLoading(true);
            const [classInfo, studentsData, coursesData] = await Promise.all([
                api.classes.getById(classId),
                api.classes.getClassStudents(classId),
                api.classes.getClassCourses(classId, 'active')
            ]);
            
            setClassData(classInfo);
            setStudents(studentsData);
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading class data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <LayoutDashboard>
                <div className="bg-white flex flex-1 flex-col gap-6 items-center justify-center overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
                    <p>Đang tải...</p>
                </div>
            </LayoutDashboard>
        );
    }

    if (!classData) {
        return (
            <LayoutDashboard>
                <div className="bg-white flex flex-1 flex-col gap-6 items-center justify-center overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
                    <p>Không tìm thấy lớp học</p>
                </div>
            </LayoutDashboard>
        );
    }

    return (
        <LayoutDashboard>
            <div className="bg-white flex flex-1 flex-col gap-6 items-start overflow-y-auto pb-8 pt-6 px-12 w-full relative shrink-0 mt-[140px]">
                <ClassDetailHeader
                    classData={classData}
                    activeTab={activeTab}
                    studentsCount={students.length}
                    coursesCount={courses.length}
                    onTabChange={setActiveTab}
                />

                <div className="w-full">
                    {activeTab === 'students' && (
                        <StudentsTab
                            classId={classId as string}
                            students={students}
                            onStudentsChange={loadClassData}
                        />
                    )}

                    {activeTab === 'courses' && (
                        <CoursesTab
                            classId={classId as string}
                            courses={courses}
                            onCoursesChange={loadClassData}
                        />
                    )}
                </div>
            </div>
        </LayoutDashboard>
    )
}
