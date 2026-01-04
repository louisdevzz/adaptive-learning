# Changelogs - Adaptive Learning Platform

## [Unreleased] - 2026-01-04 (Latest)

### Added - Knowledge Point Management & Interactive Content

#### Major Features

**1. Knowledge Point Detail View**
- Added full detail view when clicking on a KP in the course structure tree
- Displays complete content: theory, visualization, questions, and resources
- Back navigation to return to structure view
- Highlighted selected KP in sidebar

**2. Questions & Games System**
- Added comprehensive question management in KP modal
- Support for 4 question types:
  - Multiple Choice (with dynamic answer options)
  - True/False
  - Fill in the Blank
  - Interactive Games (Flashcard, Matching, Sorting)
- Questions stored in `content.questions` array
- Full validation for question creation
- Display with answer highlighting and explanations

**3. Localized Resource Management**
- Renamed "Tài nguyên học liệu" → "Tài liệu"
- Localized resource types:
  - `video` → "Video"
  - `article` → "Bài viết"
  - `interactive` → "Tương tác"
  - `quiz` → "Bài tập"
  - `other` → "Khác"
- Resource type labels using `RESOURCE_TYPE_LABELS` constant

**4. AI Content Generation Improvements**
- Theory-based generation: AI uses theory content as context
- Optional prompt for additional requirements
- Removed "Examples" tab - consolidated into Theory
- Self-contained HTML/CSS/JS output with IIFE pattern
- Scoped CSS to prevent conflicts with main website

#### Backend Changes

**DTO Updates** (`backend/src/knowledge-points/dto/create-knowledge-point.dto.ts`)
- Added `KpQuestionDto` class for question validation:
  - `type`: multiple_choice | true_false | fill_blank | game
  - `questionText`: string (required)
  - `options`: string[] (optional)
  - `correctAnswer`: string (optional)
  - `explanation`: string (optional)
  - `gameType`: flashcard | matching | sorting (optional)
  - `orderIndex`: number
- Made `description` optional in `CreateKnowledgePointDto`
- Added `questions?: KpQuestionDto[]` array field

**DTO Updates** (`backend/src/knowledge-points/dto/generate-content.dto.ts`)
- Added `theoryContent?: string` - Theory content for AI context
- Added `prompt?: string` - Optional additional requirements
- Changed `contentType` from `'examples' | 'visualization'` to only `'visualization'`
- Removed examples generation type

**Service Updates** (`backend/src/knowledge-points/knowledge-points.service.ts`)
- `create()`: Merge questions into content JSON, set default description = ''
- `update()`: Handle questions in content updates
- `generateContent()`: Completely rewritten prompt with strict requirements:
  - IIFE pattern for JavaScript isolation
  - Scoped CSS with unique class prefixes
  - Function definitions before usage
  - No external libraries, vanilla JS only
  - Self-contained, no undefined functions
  - Example structure provided in prompt

**Course Structure API** (`backend/src/courses/courses.service.ts`)
- `getCourseStructure()`: Now fetches knowledge points for each section
- Joins `sectionKpMap` with `knowledgePoint` table
- Returns full KP data in nested structure

#### Frontend Changes

**Knowledge Point Modal** (`app/src/components/modals/KnowledgePointModal.tsx`)
- **Content Structure**:
  - Removed "Ví dụ minh hoạ" tab
  - Only "Lý thuyết" and "Trực quan hoá" tabs remain
  - Added `key={activeContentTab}` to RichTextEditor for proper re-rendering

- **Visualization Tab**:
  - Changed to theory-based generation
  - Added info text explaining AI will use theory content
  - Prompt input is now optional ("Yêu cầu bổ sung")
  - Generate button disabled if no theory content

- **Questions Tab**:
  - Full CRUD for questions
  - Question type selector dropdown
  - Dynamic form based on question type
  - Question list with type badges and answer display
  - Delete question functionality
  - Validation for required fields

- **Resources Tab**:
  - Updated all labels to use "Tài liệu"
  - Localized dropdown menu items
  - Using `RESOURCE_TYPE_LABELS` for display

- **Toast Notifications**:
  - Migrated from `sonner` to `@heroui/toast`
  - Changed from `toast.error()` to `addToast({ description, color })`
  - Import `addToast` directly from `@heroui/react`

**API Client** (`app/src/lib/api.ts`)
- Updated `generateContent` type definition:
  - Added `theoryContent?: string`
  - Added `prompt?: string`
  - Changed `contentType: 'visualization'` (removed 'examples')
- Updated `getById` to use `/details` endpoint for full resource data

**Course Edit Page** (`app/src/app/(auth)/dashboard/courses/[courseId]/edit/page.tsx`)
- Added KP detail view with sections:
  - Theory section with HTML rendering
  - Visualization section with interactive content
  - Questions section with formatted display
  - Resources section with clickable links
- Click handler for KP items in tree
- Highlight selected KP
- Removed "Xem trước" and "Làm mới" buttons from header
- Removed max-width constraint for full-width detail view

**Course Detail Page** (`app/src/app/(auth)/dashboard/courses/[courseId]/page.tsx`)
- **Toast Migration**: Migrated from `sonner` to `@heroui/react` addToast
  - All toast notifications updated to use HeroUI format
  - Changed from `toast.error()` to `addToast({ description, color: "danger" })`
- **Interface Updates**:
  - Removed `tags` field from KnowledgePoint interface
  - Removed `summary` field from Section interface
  - Added `content` field with theory, visualization, and questions structure
- **Content Display**:
  - Added theory content section with prose styling
  - Added visualization content section with interactive HTML rendering
  - Conditional rendering - only show sections if content exists
  - Removed default video placeholder
- **Questions System**:
  - Priority system: Use `content.questions` from KP first, fallback to question bank
  - Content questions: Client-side validation only (instant feedback)
  - Question bank questions: Server-side submission with progress tracking
  - Auto-generate IDs for content questions: `content-q-{index}`
  - Dual question source support in `fetchQuestions` callback
- **Submit Logic**:
  - Detect content questions vs question bank questions by ID prefix
  - Content questions: Local validation + immediate feedback
  - Question bank questions: API submission + mastery score updates
  - Improved error handling for both question types

#### Database Schema

**Content Structure**:
```typescript
{
  theory: string,        // HTML content
  visualization: string, // HTML interactive content
  questions: [           // Array of questions
    {
      type: string,
      questionText: string,
      options?: string[],
      correctAnswer?: string,
      explanation?: string,
      gameType?: string,
      orderIndex: number
    }
  ]
}
```

**Resources**: Stored in separate `kp_resources` table with types

### Technical Details

**AI Generation Prompt Structure**:
```javascript
// Output format
<div class="viz-container-{unique-id}">
  <style scoped>
    .viz-container-{unique-id} { /* scoped CSS */ }
  </style>

  <div class="content">
    <!-- Interactive elements -->
  </div>

  <script>
    (function() {
      const container = document.currentScript.parentElement;

      // Define functions FIRST
      function updateDisplay() { }
      function handleClick() { }

      // Then use them
      button.addEventListener('click', handleClick);
    })();
  </script>
</div>
```

**Critical Requirements**:
1. All JavaScript wrapped in IIFE
2. CSS scoped with unique class prefix
3. Functions defined before usage
4. No external libraries
5. No global pollution
6. Self-contained and complete

**Dual Question System**:

The course detail page now supports two sources of questions:

1. **Content Questions** (from `content.questions`):
   - Embedded directly in KP content JSON
   - Auto-generated IDs: `content-q-0`, `content-q-1`, etc.
   - Client-side validation only
   - Instant feedback without server roundtrip
   - Perfect for practice questions

2. **Question Bank Questions**:
   - Stored in separate `question_bank` table
   - Real database IDs (UUIDs)
   - Server-side submission and validation
   - Progress tracking and mastery score calculation
   - Used for formal assessments

**Question Detection Logic**:
```typescript
// Check if question is from content or question bank
const isContentQuestion = questionId.startsWith('content-q-');

if (isContentQuestion) {
  // Instant local validation
  const isCorrect = selectedAnswer === correctAnswer;
  addToast({ description: "Chính xác!", color: "success" });
} else {
  // Submit to server for progress tracking
  const result = await api.submitQuestionAttempt(...);
  updateMasteryScore(result.masteryScore);
}
```

**Benefits**:
- Flexibility: Teachers can add quick practice questions without creating question bank entries
- Performance: Content questions don't require API calls
- Tracking: Question bank questions still provide progress analytics
- Backward compatibility: Existing question bank integration still works

### Breaking Changes

> [!WARNING]
> **Content Structure & API Changes**
>
> - Content field structure changed - `examples` removed
> - `generateContent` API only accepts `contentType: 'visualization'`
> - Toast notifications migrated to HeroUI - update any code using `sonner`
> - Course structure API now returns full KP objects (may affect caching)
> - `tags` field removed from Knowledge Point interface and database
> - `summary` field removed from Section interface
> - Course detail page now prioritizes `content.questions` over question bank API

### Migration Notes

**Frontend Toast Migration**:
```typescript
// OLD (sonner)
import { toast } from "sonner";
toast.error("Error message");
toast.success("Success message");

// NEW (HeroUI)
import { addToast } from "@heroui/react";
addToast({ description: "Error message", color: "danger" });
addToast({ description: "Success message", color: "success" });
```

**Content Structure Migration**:
```sql
-- Update existing KPs to remove examples from content
UPDATE knowledge_point
SET content = content - 'examples'
WHERE content ? 'examples';

-- Ensure questions array exists
UPDATE knowledge_point
SET content = jsonb_set(content, '{questions}', '[]'::jsonb, true)
WHERE NOT (content ? 'questions');
```

---

## [Previous] - 2026-01-04

### Added - AI Content Generation for Knowledge Points

#### Backend Changes

**DTO** (`backend/src/knowledge-points/dto/generate-content.dto.ts`)

- Created new `GenerateContentDto` for AI content generation requests
- Fields:
  - `topic: string` - The main topic for content generation
  - `description?: string` - Optional context/description
  - `contentType: 'examples' | 'visualization'` - Type of content to generate
  - `aiModel: 'openai' | 'gemini'` - AI model selection

**Service** (`backend/src/knowledge-points/knowledge-points.service.ts`)

- Added `generateContent` method for AI-powered content generation
- Integrates with LangChain for OpenAI (GPT-4o-mini) and Google Gemini (1.5-flash)
- Generates HTML content for examples and interactive visualizations
- Returns structured response with generated content

**Controller** (`backend/src/knowledge-points/knowledge-points.controller.ts`)

- Added `POST /knowledge-points/generate-content` endpoint
- Restricted to admin and teacher roles
- Accepts `GenerateContentDto` and returns AI-generated HTML content

#### Frontend Changes

**API Client** (`app/src/lib/api.ts`)

- Added `knowledgePoints.generateContent` method (line 720)
- Accepts topic, description, content type, and AI model selection
- Returns generated HTML content

**Knowledge Point Modal** (`app/src/components/modals/KnowledgePointModal.tsx`)

- Restructured `content` field to support three types:
  - `theory` - Manual theory input
  - `examples` - AI-generated or manual examples
  - `visualization` - AI-generated or manual visualizations
- Added "Generate with AI" button for Examples and Visualization tabs
- Integrated AI content generation with loading states
- Added proper static import for API client (removed dynamic imports)
- Implemented resource management UI:
  - Add resources with title, URL, and type selection
  - Upload files directly (integrates with upload API)
  - Display resource list with icons
  - Remove resources functionality

### Technical Details

**AI Generation Prompts:**

- **Examples**: Generates 3 practical examples with HTML5 + TailwindCSS styling
- **Visualization**: Creates self-contained interactive HTML components with CSS and vanilla JavaScript

**Environment Variables Required:**

- `OPENAI_API_KEY` - For OpenAI GPT-4o-mini model
- `GOOGLE_API_KEY` - For Google Gemini 1.5-flash model

**Resource Management:**

- Supports resource types: video, article, interactive, quiz, other
- File upload integration via `api.upload.file`
- Resources stored with title, URL, type, and order index

### Migration Notes

> [!IMPORTANT] > **Content Structure Change**
>
> The `content` field in knowledge points now expects a structured object:
>
> ```typescript
> {
>   theory: string,      // HTML content for theory
>   examples: string,    // HTML content for examples
>   visualization: string // HTML content for visualization
> }
> ```

**Suggested Migration Steps:**

```sql
-- Update existing knowledge points to use new structure
UPDATE knowledge_point
SET content = jsonb_build_object(
  'theory', content,
  'examples', '',
  'visualization', ''
)
WHERE jsonb_typeof(content) != 'object'
   OR NOT (content ? 'theory');
```

### Breaking Changes

> [!WARNING] > **Content Field Structure**
>
> - The `content` field structure has changed from flexible JSON to a specific structure
> - Existing knowledge points may need data migration
> - Frontend components expecting old content structure will need updates

---

### Removed - Knowledge Point Tags Field

- Removed `tags` field from `knowledge_point` table and all related DTOs, Services, and UI components.

### Removed - Section Summary Field

#### Backend Changes

**Database Schema** (`backend/db/schema.ts`)

- Removed `summary: text("summary").notNull()` field from `sections` table (line 194)
- Sections now only require `title` and `orderIndex` fields

**DTOs** (`backend/src/courses/dto/create-section.dto.ts`)

- Removed `summary: string` field from `CreateSectionDto` class
- Simplified section creation to only require title

**Services** (`backend/src/courses/courses.service.ts`)

- Updated `createSection` method to remove `summary` field from insert statement (line 334)
- Section creation no longer accepts or stores summary data

#### Frontend Changes

**API Client** (`app/src/lib/api.ts`)

- Updated `courses.createSection` method to remove `summary: string` from data type (line 591)
- Updated `courses.updateSection` method to remove `summary?: string` from data type (line 609)

**Edit Course Page** (`app/src/app/(auth)/dashboard/courses/[courseId]/edit/page.tsx`)

- Removed `summary` field from section creation API call (line 263)

### Migration Notes

> [!IMPORTANT] > **Database Migration Required**
>
> This change removes the `summary` column from the `sections` table. You will need to:
>
> 1. Run database migrations to drop the `summary` column
> 2. Existing summary data will be lost

**Suggested Migration Steps:**

```sql
-- Drop the summary column
ALTER TABLE sections DROP COLUMN summary;
```

### Breaking Changes

> [!WARNING] > **Breaking Change for API Consumers**
>
> - The `summary` field is no longer accepted or returned in section endpoints
> - Affected endpoints:
>   - `POST /api/courses/sections` (no longer accepts `summary`)
>   - `PATCH /api/courses/sections/:id` (no longer accepts `summary`)
>   - `GET /api/courses/sections/:id` (no longer returns `summary`)

---

### Added - Knowledge Point Content Field

#### Backend Changes

**Database Schema** (`backend/db/schema.ts`)

- Added `content: json("content").notNull()` field to `knowledgePoint` table
- This field stores structured content data for knowledge points (e.g., learning materials, explanations, examples)

**DTOs** (`backend/src/courses/dto/create-section.dto.ts`)

- Added `content: any` field to `CreateKnowledgePointData` class
- Validates that content is provided when creating knowledge points within sections

**DTOs** (`backend/src/knowledge-points/dto/create-knowledge-point.dto.ts`)

- Added `content: any` field to `CreateKnowledgePointDto` class
- Ensures content is required when creating standalone knowledge points

**Services** (`backend/src/courses/courses.service.ts`)

- Updated `createSection` method to include `content` field when inserting knowledge points
- Line 276: Added `content: kpData.content` to knowledge point creation

**Services** (`backend/src/knowledge-points/knowledge-points.service.ts`)

- Updated `create` method to include `content` field when creating knowledge points (line 42)
- Updated `update` method to handle `content` field updates (line 181)
- Content can now be updated via PATCH requests

#### Frontend Changes

**API Client** (`app/src/lib/api.ts`)

- Updated `courses.createSection` method to include `content: any` in knowledge points type definition (line 596)
- Updated `knowledgePoints.create` method to require `content: any` field (line 660)
- Updated `knowledgePoints.update` method to accept optional `content?: any` field (line 679)

### Migration Notes

> [!IMPORTANT] > **Database Migration Required**
>
> This change adds a new required field to the `knowledge_point` table. You will need to:
>
> 1. Run database migrations to add the `content` column
> 2. Provide default content for existing knowledge points, or
> 3. Make the field nullable temporarily during migration

**Suggested Migration Steps:**

```sql
-- Option 1: Add column as nullable first
ALTER TABLE knowledge_point ADD COLUMN content JSONB;

-- Update existing records with default content
UPDATE knowledge_point SET content = '{}' WHERE content IS NULL;

-- Make column NOT NULL
ALTER TABLE knowledge_point ALTER COLUMN content SET NOT NULL;
```

### Breaking Changes

> [!WARNING] > **Breaking Change for API Consumers**
>
> - All endpoints that create knowledge points now **require** a `content` field
> - Affected endpoints:
>   - `POST /api/courses/sections` (when including knowledgePoints)
>   - `POST /api/knowledge-points`
> - The `content` field accepts any valid JSON structure

### Technical Details

**Content Field Structure**
The `content` field is defined as `json` type in PostgreSQL and accepts any valid JSON structure. Recommended structure:

```typescript
{
  "text": "Main learning content",
  "examples": [...],
  "explanations": [...],
  "media": {
    "images": [...],
    "videos": [...]
  }
}
```

**Affected Components:**

- Backend:
  - Database schema layer
  - Course service (section creation with KPs)
  - Knowledge points service (CRUD operations)
  - DTOs and validation
- Frontend:
  - API client type definitions
  - Any components creating/updating knowledge points

### Testing Recommendations

1. **Backend Tests:**

   - Test knowledge point creation with valid content
   - Test knowledge point creation without content (should fail validation)
   - Test knowledge point updates with content changes
   - Test section creation with embedded knowledge points

2. **Frontend Tests:**
   - Verify TypeScript compilation with new type definitions
   - Test API calls to create/update knowledge points
   - Ensure proper error handling for missing content field

---

## Previous Changes

### Course Management System

- Implemented course, module, and section CRUD operations
- Added teacher-course assignment functionality
- Implemented role-based access control for teachers and admins
- Added course structure retrieval with nested modules and sections

### Knowledge Points System

- Created knowledge points with prerequisites and resources
- Implemented section-KP mapping
- Added difficulty levels and tagging system
- Built resource management for learning materials

### User Management

- Implemented authentication system with JWT
- Created user roles: admin, teacher, student, parent
- Added user profile management
- Implemented parent-student relationships

### Class Management

- Created class system with grade levels
- Implemented student enrollment
- Added teacher-class assignments
- Built course-class associations
