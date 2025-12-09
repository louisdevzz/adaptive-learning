export interface Teacher {
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
}

export interface TeacherFormData {
  email: string;
  password: string;
  fullName: string;
  specialization: string[];
  experienceYears: number;
  certifications: string[];
  phone: string;
  bio: string;
  avatarUrl: string;
}

export interface TeacherStats {
  total: number;
  experienced: number; // >= 5 years
  certified: number; // has certifications
  active: number; // active teachers
}

