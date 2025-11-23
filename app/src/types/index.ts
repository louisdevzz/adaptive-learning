// User and Authentication Types
export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  image?: string;
  role: UserRole;
  meta_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  role?: UserRole;
  image?: string;
  meta_data?: Record<string, any>;
}

// Course Related Types
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface Course {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  code: string;
  grade_level?: number;
  academic_year?: number;
  difficulty_level: DifficultyLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  module_number: number;
  estimated_hours?: number;
  difficulty_level: DifficultyLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  module_id: string;
  name: string;
  description?: string;
  section_number: number;
  estimated_hours?: number;
  difficulty_level: DifficultyLevel;
  objectives?: {
    knowledge?: string[];
    skills?: string[];
    attitude?: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  knowledge_points?: KnowledgePoint[];
}

export type KPType = 'concept' | 'rule' | 'formula' | 'problem_type';

export interface KnowledgePoint {
  id: string;
  section_id: string;
  module_id: string;
  course_id: string;
  name: string;
  description?: string;
  code: string;
  kp_type: KPType;
  learning_objectives?: {
    knowledge?: string[];
    skills?: string[];
    attitude?: string[];
  };
  difficulty_level: DifficultyLevel;
  estimated_time?: {
    minutes?: number;
    practice_minutes?: number;
    total_minutes?: number;
  };
  created_at: string;
  updated_at: string;
}

// Mastery and Progress Types
export type MasteryLevel = 'none' | 'poor' | 'fair' | 'good' | 'excellent';

export interface StudentMastery {
  id: string;
  student_id: string;
  kp_id: string;
  mastery_score: number;
  accuracy: number;
  practice_count: number;
  time_spent_minutes: number;
  last_practiced_at?: string;
  mastery_level: MasteryLevel;
  created_at: string;
  updated_at: string;
}

// Learning and Practice Types
export interface Question {
  id: string;
  kp_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  difficulty_level: DifficultyLevel;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  hint?: string;
}

export interface PracticeSession {
  id: string;
  student_id: string;
  kp_id: string;
  score: number;
  accuracy: number;
  time_spent_minutes: number;
  questions_attempted: number;
  questions_correct: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

// Search Types
export interface SearchResult {
  id: string;
  name: string;
  type: 'course' | 'module' | 'section' | 'knowledge_point';
  description?: string;
  score: number;
  highlight?: string;
}

// Dashboard Stats
export interface StudentStats {
  overall_mastery: number;
  total_time_minutes: number;
  active_streak_days: number;
  kp_completed: number;
  kp_in_progress: number;
  kp_total: number;
}

export interface TeacherStats {
  total_students: number;
  total_courses: number;
  active_courses: number;
  avg_student_progress: number;
}

export interface AdminStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_courses: number;
  active_users: number;
}

// Admin User Management Types
export interface UserListItem {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name?: string;
}

export interface UserStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_parents: number;
  total_admins: number;
  active_users: number;
  inactive_users: number;
  new_users_this_month: number;
}

// Meta data interfaces for each role
export interface AdminMetaData {
  permissions: string[];
  admin_level: 'super' | 'system' | 'support';
}

export interface TeacherMetaData {
  phone?: string;
  address?: string;
  bio?: string;
  specialization: string[];
  grades: number[];
  assigned_courses?: string[];
  homeroom_class?: string;
}

export interface StudentMetaData {
  student_code?: string;
  grade_level: number;
  class_id?: string;
  parents?: string[];
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  interests?: string[];
  behavior_score?: number;
  notes?: string;
}

export interface ParentMetaData {
  children: {
    student_id: string;
    relationship: 'father' | 'mother' | 'guardian';
  }[];
  contact_number?: string;
  occupation?: string;
}

export type UserMetaData = AdminMetaData | TeacherMetaData | StudentMetaData | ParentMetaData;

export interface UserCreateData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  role?: UserRole;
  meta_data?: UserMetaData;
}

export interface UserUpdateData {
  email?: string;
  username?: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
  meta_data?: UserMetaData;
}

// Network Visualization
export interface NetworkNode {
  id: string;
  name: string;
  mastery_score: number;
  mastery_level: MasteryLevel;
  x: number;
  y: number;
  type: 'current' | 'mastered' | 'locked' | 'at_risk';
}

export interface NetworkEdge {
  from: string;
  to: string;
  type: 'dependency' | 'progression';
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// Pagination
export interface PaginationParams {
  page?: number;
  page_size?: number;
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}
