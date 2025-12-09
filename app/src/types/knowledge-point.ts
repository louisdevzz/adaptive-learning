export interface KnowledgePoint {
  id: string;
  title: string;
  description: string;
  difficultyLevel: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgePointFormData {
  title: string;
  description: string;
  difficultyLevel: number;
  tags?: string[];
  prerequisites?: string[];
}

export interface KnowledgePointResource {
  id: string;
  kpId: string;
  resourceType: 'video' | 'article' | 'interactive' | 'quiz' | 'other';
  url: string;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: string;
}
