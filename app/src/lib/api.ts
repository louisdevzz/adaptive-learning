import { apiClient } from './api-client';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Profile,
  Course,
  Module,
  Section,
  KnowledgePoint,
  StudentMastery,
  PaginatedResponse,
  SearchResult,
  UserListItem,
  UserStats,
  UserCreateData,
  UserUpdateData,
  UserRole,
} from '@/types';

// Authentication API
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  googleLogin: (token: string, role?: string) =>
    apiClient.post<AuthResponse>('/auth/google', { token, role }),

  getCurrentUser: () =>
    apiClient.get<User>('/auth/me'),

  logout: () =>
    apiClient.post<{ message: string }>('/auth/logout'),
};

// Profile API
export const profileAPI = {
  getMyProfile: () =>
    apiClient.get<Profile>('/profile/me'),

  updateMyProfile: (data: Partial<Profile>) =>
    apiClient.put<Profile>('/profile/me', data),

  getUserProfile: (userId: string) =>
    apiClient.get<Profile>(`/profile/${userId}`),
};

// Course API
export const courseAPI = {
  createCourse: (data: Partial<Course>) =>
    apiClient.post<Course>('/courses/', data),

  listCourses: (params?: {
    page?: number;
    page_size?: number;
    grade_level?: number;
    difficulty_level?: number;
    academic_year?: number;
    is_active?: boolean;
  }) =>
    apiClient.get<PaginatedResponse<Course>>('/courses/', params),

  getCourseByCode: (code: string) =>
    apiClient.get<Course>(`/courses/code/${code}`),

  getCourse: (courseId: string) =>
    apiClient.get<Course>(`/courses/${courseId}`),

  updateCourse: (courseId: string, data: Partial<Course>) =>
    apiClient.put<Course>(`/courses/${courseId}`, data),

  deleteCourse: (courseId: string) =>
    apiClient.delete<void>(`/courses/${courseId}`),

  searchCourses: (query: string, params?: { skip?: number; limit?: number }) =>
    apiClient.get<{ total: number; query: string; courses: Course[] }>(
      '/courses/search/',
      { q: query, ...params }
    ),
};

// Module API
export const moduleAPI = {
  createModule: (data: Partial<Module>) =>
    apiClient.post<Module>('/modules/', data),

  listModules: (params?: {
    page?: number;
    page_size?: number;
    course_id?: string;
    is_active?: boolean;
  }) =>
    apiClient.get<PaginatedResponse<Module>>('/modules/', params),

  listModulesByCourse: (courseId: string) =>
    apiClient.get<Module[]>(`/modules/course/${courseId}`),

  getModule: (moduleId: string) =>
    apiClient.get<Module>(`/modules/${moduleId}`),

  updateModule: (moduleId: string, data: Partial<Module>) =>
    apiClient.put<Module>(`/modules/${moduleId}`, data),

  deleteModule: (moduleId: string) =>
    apiClient.delete<void>(`/modules/${moduleId}`),
};

// Section API
export const sectionAPI = {
  createSection: (data: Partial<Section>) =>
    apiClient.post<Section>('/sections/', data),

  listSectionsByModule: (moduleId: string) =>
    apiClient.get<Section[]>(`/sections/module/${moduleId}`),

  getSection: (sectionId: string) =>
    apiClient.get<Section>(`/sections/${sectionId}`),

  updateSection: (sectionId: string, data: Partial<Section>) =>
    apiClient.put<Section>(`/sections/${sectionId}`, data),

  deleteSection: (sectionId: string) =>
    apiClient.delete<void>(`/sections/${sectionId}`),
};

// Knowledge Point API
export const knowledgePointAPI = {
  createKnowledgePoint: (data: Partial<KnowledgePoint>) =>
    apiClient.post<KnowledgePoint>('/knowledge-points/', data),

  listKnowledgePointsBySection: (sectionId: string) =>
    apiClient.get<KnowledgePoint[]>(`/knowledge-points/section/${sectionId}`),

  getKnowledgePoint: (kpId: string) =>
    apiClient.get<KnowledgePoint>(`/knowledge-points/${kpId}`),

  updateKnowledgePoint: (kpId: string, data: Partial<KnowledgePoint>) =>
    apiClient.put<KnowledgePoint>(`/knowledge-points/${kpId}`, data),

  deleteKnowledgePoint: (kpId: string) =>
    apiClient.delete<void>(`/knowledge-points/${kpId}`),
};

// Search API
export const searchAPI = {
  search: (query: string, params?: {
    kp_type?: string;
    difficulty_level?: number;
    limit?: number;
  }) =>
    apiClient.get<{ total: number; query: string; results: SearchResult[] }>(
      '/search/',
      { q: query, ...params }
    ),

  advancedSearch: (params: {
    query: string;
    course_ids?: string[];
    kp_types?: string[];
    difficulty_levels?: number[];
    limit?: number;
  }) =>
    apiClient.post<{ total: number; results: SearchResult[] }>(
      '/search/advanced',
      params
    ),
};

// Mastery API (Note: Will need to be implemented in backend)
export const masteryAPI = {
  getStudentMastery: (studentId: string, kpId: string) =>
    apiClient.get<StudentMastery>(`/mastery/student/${studentId}/kp/${kpId}`),

  listStudentMasteries: (studentId: string, params?: {
    course_id?: string;
    module_id?: string;
  }) =>
    apiClient.get<StudentMastery[]>(`/mastery/student/${studentId}`, params),

  updateMastery: (studentId: string, kpId: string, data: {
    accuracy: number;
    time_spent_minutes: number;
  }) =>
    apiClient.post<StudentMastery>(`/mastery/student/${studentId}/kp/${kpId}`, data),
};

// Admin API
export const adminAPI = {
  // User Management
  getUsers: (params?: {
    page?: number;
    page_size?: number;
    role?: UserRole;
    is_active?: boolean;
    search?: string;
  }) =>
    apiClient.get<PaginatedResponse<UserListItem>>('/admin/users', params),

  getUserStats: () =>
    apiClient.get<UserStats>('/admin/users/stats'),

  getUser: (userId: string) =>
    apiClient.get<UserListItem>(`/admin/users/${userId}`),

  createUser: (data: UserCreateData) =>
    apiClient.post<UserListItem>('/admin/users', data),

  updateUser: (userId: string, data: UserUpdateData) =>
    apiClient.put<UserListItem>(`/admin/users/${userId}`, data),

  deleteUser: (userId: string) =>
    apiClient.delete<void>(`/admin/users/${userId}`),

  toggleUserStatus: (userId: string) =>
    apiClient.post<UserListItem>(`/admin/users/${userId}/toggle-status`),

  resetUserPassword: (userId: string, newPassword: string) =>
    apiClient.post<UserListItem>(`/admin/users/${userId}/reset-password`, {
      new_password: newPassword,
    }),
};
