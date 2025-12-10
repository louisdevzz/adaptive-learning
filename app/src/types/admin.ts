export interface Admin {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  adminInfo?: {
    adminLevel: "super" | "system" | "support";
    permissions: string[];
  };
}

export interface AdminFormData {
  email: string;
  password: string;
  fullName: string;
  adminLevel: "super" | "system" | "support";
  permissions: string[];
  avatarUrl: string;
}

export interface AdminStats {
  total: number;
  super: number;
  system: number;
  support: number;
}

