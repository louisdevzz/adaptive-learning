'use client';

import {
  StudentDashboard,
  TeacherDashboard,
  ParentDashboard,
  AdminDashboard
} from '@/components/dashboard';
import { courseAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.listCourses({ page: 1, page_size: 10 });
      return response.items || [];
    } catch (error) {
      console.error('Failed to load courses:', error);
      return [];
    }
  };

  if (!user) {
    return null;
  }

  const role = profile?.role || user?.role || 'student';

  switch (role) {
    case 'teacher':
      return <TeacherDashboard onLoadCourses={loadCourses} />;
    case 'parent':
      return <ParentDashboard onLoadCourses={loadCourses} />;
    case 'admin':
      return <AdminDashboard />;
    case 'student':
    default:
      return <StudentDashboard onLoadCourses={loadCourses} />;
  }
}
