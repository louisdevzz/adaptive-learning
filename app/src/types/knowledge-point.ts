export interface KnowledgePoint {
  id: string;
  title: string;
  description: string;
  difficultyLevel: number;
  tags: string[];
  prerequisites?: string[]; // Array of prerequisite KP IDs
  resources?: KnowledgePointResource[]; // Array of resources
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgePointFormData {
  title: string;
  description: string;
  difficultyLevel: number;
  tags?: string[];
  prerequisites?: string[];
  resources?: Omit<KnowledgePointResource, 'id' | 'kpId' | 'createdAt'>[];
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

export interface KnowledgePointStats {
  total: number;
  byDifficulty: {
    [key: number]: number;
  };
}
