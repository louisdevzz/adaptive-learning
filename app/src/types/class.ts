export interface Class {
  id: string;
  className: string;
  gradeLevel: number;
  schoolYear: string;
  homeroomTeacherId?: string;
  homeroomTeacher?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClassFormData {
  className: string;
  gradeLevel: number;
  schoolYear: string;
  homeroomTeacherId?: string;
}

export interface ClassStats {
  total: number;
  byGradeLevel: {
    [key: number]: number;
  };
}

export interface ClassEnrollment {
  enrollmentId: string;
  status: 'active' | 'withdrawn' | 'completed';
  enrolledAt: string;
  student: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    studentInfo?: {
      studentCode: string;
      gradeLevel: number;
      schoolName: string;
      dateOfBirth: string;
      gender: string;
    };
  };
}

export interface ClassTeacher {
  assignmentId: string;
  role: 'homeroom' | 'subject_teacher' | 'assistant';
  status: 'active' | 'inactive';
  assignedAt: string;
  teacher: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    teacherInfo?: {
      specialization: string[];
      experienceYears: number;
      certifications: string[];
      phone?: string;
      bio?: string;
    };
  };
}

