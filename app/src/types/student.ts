export type Gender = "male" | "female" | "other";

export interface Student {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  status?: boolean;
  studentInfo?: {
    studentCode: string;
    gradeLevel: number;
    schoolName: string;
    dateOfBirth: string;
    gender: Gender;
  };
}

export interface StudentFormData {
  email: string;
  password: string;
  fullName: string;
  studentCode: string;
  gradeLevel: number;
  schoolName: string;
  dateOfBirth: string;
  gender: Gender;
  avatarUrl: string;
}

export interface StudentStats {
  total: number;
  byGrade: {
    [key: number]: number;
  };
  byGender: {
    male: number;
    female: number;
    other: number;
  };
}

