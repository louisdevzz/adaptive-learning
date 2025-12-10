export type RelationshipType = "father" | "mother" | "guardian";

export interface Parent {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  parentInfo?: {
    phone: string;
    address: string;
    relationshipType: RelationshipType;
  };
}

export interface ParentFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  relationshipType: RelationshipType;
  avatarUrl: string;
  studentIds: string[];
}

export interface ParentStats {
  total: number;
  byRelationship: {
    father: number;
    mother: number;
    guardian: number;
  };
}

