export interface StudentInfo {
  id: string;
  studentCode: string;
  gradeLevel: number;
  schoolName: string;
  dateOfBirth: string;
  gender: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherInfo {
  id: string;
  specialization: string[];
  experienceYears: number;
  certifications: string[];
  phone: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentInfo {
  id: string;
  phone: string;
  address: string;
  relationshipType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminInfo {
  id: string;
  adminLevel: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type RoleSpecificInfo =
  | StudentInfo
  | TeacherInfo
  | ParentInfo
  | AdminInfo;

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
    info?: RoleSpecificInfo;
  };
  accessToken?: string; // Also returned in body so the frontend can set the cookie on its own domain
}
