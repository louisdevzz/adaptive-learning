export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subject: string;
  gradeLevel: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  thumbnailUrl: string;
  subject: string;
  gradeLevel: number;
  active?: boolean;
}

export interface CourseStats {
  total: number;
  byGradeLevel: {
    [key: number]: number;
  };
  bySubject: {
    [key: string]: number;
  };
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  course?: Course;
}

export interface ModuleFormData {
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
}

export interface ModuleStats {
  total: number;
  byCourse: {
    [key: string]: number;
  };
}

export interface Section {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  module?: Module;
}

export interface CreateKnowledgePointData {
  title: string;
  description: string;
  difficultyLevel: number;
  tags?: string[];
}

export interface SectionFormData {
  moduleId: string;
  title: string;
  summary: string;
  orderIndex: number;
  knowledgePoints?: CreateKnowledgePointData[];
}

export interface SectionStats {
  total: number;
  byModule: {
    [key: string]: number;
  };
}

