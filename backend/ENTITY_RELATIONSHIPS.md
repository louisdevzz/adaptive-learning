# Entity Relationships and Cascading Creation Logic

## Overview
This document outlines all entity relationships in the Adaptive Learning Platform and defines which related entities should be automatically created when a parent entity is created.

## 1. Content Graph Entities

### Courses
**Primary Entity**: `courses`
**Auto-create on creation**: None (standalone entity)
**Related entities created separately**:
- `modules` (created via separate endpoint)
- `courseAnalytics` (auto-generated after first student enrollment)

### Modules
**Primary Entity**: `modules`
**Required parent**: `courses.id`
**Auto-create on creation**: None
**Related entities created separately**:
- `sections` (created via separate endpoint)

### Sections
**Primary Entity**: `sections`
**Required parent**: `modules.id`
**Auto-create on creation**: None
**Related entities created separately**:
- `sectionKpMap` (created when KPs are assigned)

### Knowledge Points (KP)
**Primary Entity**: `knowledgePoint`
**Auto-create on creation**:
- ✅ `kpResources` (if resources provided in DTO)
- ✅ `kpPrerequisites` (if prerequisite KPs provided in DTO)
**Related entities created separately**:
- `kpExercises` (created when questions are assigned)
- `sectionKpMap` (created when KP is assigned to section)

**DTO Structure**:
```typescript
CreateKnowledgePointDto {
  title: string;
  description: string;
  difficultyLevel: number; // 1-5
  tags: string[];
  prerequisites?: string[]; // KP IDs
  resources?: {
    resourceType: 'video' | 'article' | 'interactive';
    url: string;
    title: string;
    description: string;
    orderIndex: number;
  }[];
}
```

## 2. Assessment Entities

### Question Bank
**Primary Entity**: `questionBank`
**Auto-create on creation**:
- ✅ `questionMetadata` (required for all questions)
**Related entities created separately**:
- `kpExercises` (created when assigned to KP)
- `assignmentItems` (created when assigned to assignment)

**DTO Structure**:
```typescript
CreateQuestionDto {
  questionText: string;
  options: any; // JSON
  correctAnswer: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  metadata: {
    difficulty: number; // 1-10
    discrimination: number;
    skillId: string; // KP ID
    tags: string[];
    estimatedTime: number; // seconds
  };
}
```

### Assignments
**Primary Entity**: `assignments`
**Auto-create on creation**:
- ✅ `assignmentItems` (if questions provided in DTO)
**Related entities created separately**:
- `studentAssignments` (created when assigned to students)

**DTO Structure**:
```typescript
CreateAssignmentDto {
  teacherId: string;
  title: string;
  description: string;
  assignmentType: 'practice' | 'quiz' | 'exam';
  dueDate?: Date;
  questions?: {
    questionId: string;
    orderIndex: number;
    points: number;
  }[];
}
```

### Student Assignments
**Primary Entity**: `studentAssignments`
**Auto-create on completion**:
- ✅ `studentAssignmentResults` (auto-created when status = 'submitted')
- ✅ `questionAttempts` (auto-created for each question answered)

## 3. Mastery Entities

### Student KP Progress
**Primary Entity**: `studentKpProgress`
**Auto-create on update**:
- ✅ `studentKpHistory` (every time mastery score changes)
**Related entities auto-updated**:
- `studentMastery` (recalculated when KP progress changes)
- `studentInsights` (recalculated periodically)

### Question Attempts
**Primary Entity**: `questionAttempts`
**Auto-trigger on creation**:
- ✅ Update `studentKpProgress` (if kpId is linked)
- ✅ Create `studentKpHistory` record
- ✅ Update `studentMastery` (aggregate calculation)

## 4. Recommendation Entities

### Learning Path
**Primary Entity**: `learningPath`
**Auto-create on creation**:
- ✅ `learningPathItems` (if items provided in DTO)

**DTO Structure**:
```typescript
CreateLearningPathDto {
  studentId: string;
  createdBy: 'system' | 'teacher' | 'student';
  title: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  items?: {
    itemType: 'kp' | 'section' | 'assignment';
    itemId: string;
    orderIndex: number;
    status: 'not_started' | 'in_progress' | 'completed';
  }[];
}
```

## 5. Tracking Entities

### Student Session
**Primary Entity**: `studentSession`
**Auto-create during session**:
- ✅ `activityLog` (created for each action)
- ✅ `timeOnTask` (aggregated on session end)

### Activity Log
**Primary Entity**: `activityLog`
**No auto-creation**: Standalone tracking entity

## 6. Class Management

### Classes
**Primary Entity**: `classes`
**Auto-create on creation**: None
**Related entities created separately**:
- `classEnrollment` (created when students enrolled)
- `teacherClassMap` (created when teachers assigned)

## Service Implementation Pattern

### Transaction-based Creation
All services that auto-create related entities should use database transactions:

```typescript
async create(dto: CreateEntityDto) {
  return await db.transaction(async (tx) => {
    // 1. Create primary entity
    const [entity] = await tx.insert(table).values({...}).returning();

    // 2. Create related entities
    if (dto.relatedData) {
      const relatedValues = dto.relatedData.map(...);
      await tx.insert(relatedTable).values(relatedValues);
    }

    // 3. Return complete entity with relations
    return this.findOne(entity.id);
  });
}
```

## Key Principles

1. **Auto-create only tightly coupled entities**: Entities that cannot exist without the parent
2. **Use transactions**: Ensure atomic operations for cascading creates
3. **Validation first**: Validate all foreign keys before creating relationships
4. **Provide defaults**: Smart defaults for optional related entities
5. **Return complete objects**: Include created relationships in response

## Implementation Priority

1. **High Priority** (Core functionality):
   - KnowledgePoint + KPResources + KPPrerequisites
   - QuestionBank + QuestionMetadata
   - Assignment + AssignmentItems
   - QuestionAttempts → StudentKPProgress updates

2. **Medium Priority** (Enhanced functionality):
   - LearningPath + LearningPathItems
   - StudentSession + ActivityLog
   - StudentAssignment + StudentAssignmentResults

3. **Low Priority** (Analytics):
   - CourseAnalytics (batch job)
   - StudentInsights (batch job)
   - TimeOnTask (aggregation job)
