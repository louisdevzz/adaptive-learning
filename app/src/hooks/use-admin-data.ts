import useSWR, { SWRConfiguration } from 'swr';
import { adminAPI, courseAPI, moduleAPI, sectionAPI } from '@/lib/api';
import type { UserStats, UserListItem, UserRole, Course, Module, Section } from '@/types';

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  keepPreviousData: true,
};

export function useUserStats(config?: SWRConfiguration) {
  return useSWR<UserStats>(
    'admin-user-stats',
    () => adminAPI.getUserStats(),
    {
      ...defaultConfig,
      refreshInterval: 10000,
      ...config,
    }
  );
}

export function useRecentUsers(pageSize = 5, config?: SWRConfiguration) {
  return useSWR(
    ['admin-recent-users', pageSize],
    () => adminAPI.getUsers({ page: 1, page_size: pageSize }),
    {
      ...defaultConfig,
      refreshInterval: 10000,
      ...config,
    }
  );
}

interface UseUsersParams {
  page: number;
  pageSize: number;
  role?: UserRole | '';
  isActive?: boolean | '';
  search?: string;
}

export function useUsers(params: UseUsersParams, config?: SWRConfiguration) {
  const { page, pageSize, role, isActive, search } = params;

  // Build query params
  const queryParams: {
    page: number;
    page_size: number;
    role?: UserRole;
    is_active?: boolean;
    search?: string;
  } = {
    page,
    page_size: pageSize,
  };

  if (role) queryParams.role = role;
  if (isActive !== '') queryParams.is_active = isActive as boolean;
  if (search) queryParams.search = search;

  return useSWR(
    ['admin-users', queryParams],
    () => adminAPI.getUsers(queryParams),
    {
      ...defaultConfig,
      ...config,
    }
  );
}

export function useTotalCourses(config?: SWRConfiguration) {
  return useSWR(
    'admin-total-courses',
    () => courseAPI.listCourses({ page: 1, page_size: 1 }),
    {
      ...defaultConfig,
      refreshInterval: 10000,
      ...config,
    }
  );
}

export function useCourses(config?: SWRConfiguration) {
  return useSWR(
    'admin-courses',
    () => courseAPI.listCourses({ page: 1, page_size: 100 }),
    {
      ...defaultConfig,
      ...config,
    }
  );
}

export function useModules(courseId?: string, config?: SWRConfiguration) {
  return useSWR(
    courseId ? ['admin-modules', courseId] : 'admin-modules',
    () => moduleAPI.listModules({
      page: 1,
      page_size: 100,
      ...(courseId && { course_id: courseId }),
    }),
    {
      ...defaultConfig,
      ...config,
    }
  );
}

export function useTotalModules(config?: SWRConfiguration) {
  return useSWR(
    'admin-total-modules',
    () => moduleAPI.listModules({ page: 1, page_size: 1 }),
    {
      ...defaultConfig,
      refreshInterval: 10000,
      ...config,
    }
  );
}

export function useSections(moduleId?: string, config?: SWRConfiguration) {
  return useSWR<Section[]>(
    moduleId ? ['admin-sections', moduleId] : null,
    () => moduleId ? sectionAPI.listSectionsByModule(moduleId) : Promise.resolve([]),
    {
      ...defaultConfig,
      ...config,
    }
  );
}

export function useAdminOverview() {
  const stats = useUserStats();
  const recentUsers = useRecentUsers();
  const totalCourses = useTotalCourses();

  const isLoading = stats.isLoading || recentUsers.isLoading || totalCourses.isLoading;

  const mutateAll = () => {
    stats.mutate();
    recentUsers.mutate();
    totalCourses.mutate();
  };

  return {
    userStats: stats.data,
    recentUsers: recentUsers.data?.items || [],
    totalCourses: totalCourses.data?.total || 0,
    isLoading,
    mutateAll,
    mutateStats: stats.mutate,
    mutateUsers: recentUsers.mutate,
    mutateCourses: totalCourses.mutate,
  };
}
