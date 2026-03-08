# AI-Assisted File Grading (V1)

## Overview
This feature adds an AI-assisted grading pipeline for student file submissions.
The system generates a **suggested score + feedback + rubric breakdown**, while the final grade is always approved by a teacher/admin.

### V1 decisions
- Scope: file-based essay/open-response grading
- Policy: AI suggestion only, teacher/admin approval required
- Execution: async background processing after submission
- Scale: keep score scale at 0-10
- File support: PDF and DOCX for AI grading (unsupported formats fail gracefully)

---

## Data Model Changes

### `assignments`
- `ai_grading_enabled` (`boolean`, default `false`)
- `grading_rubric` (`text`, optional)

### `student_assignment_results`
- `grading_source` (`manual | ai_approved`, default `manual`)
- `approved_by` (`uuid`, optional, FK -> `users.id`)
- `approval_note` (`text`, optional)

### New table: `assignment_grading_runs`
Stores AI grading history per student assignment:
- `id`
- `student_assignment_id`
- `status` (`pending | processing | completed | failed`)
- `provider`, `model`
- `rubric_used`
- `extracted_text` (truncated/safe)
- `suggested_score` (0..10)
- `feedback`
- `criteria_breakdown` (json)
- `confidence` (0..100)
- `error_message`
- `retry_count`
- `created_at`, `started_at`, `completed_at`

---

## Backend Workflow

### Submit flow
When a student submits:
1. `student_assignments` is updated to `submitted`.
2. Result row exists/updates as baseline (manual flow compatibility).
3. If submission has file URL and assignment has `ai_grading_enabled=true`, create a new `assignment_grading_runs` row with `pending` status.

### Background worker (every minute)
Worker processes pending runs in batches:
1. Claim run atomically (`pending -> processing`).
2. Recover stale `processing` runs (timeout + retry up to limit).
3. Validate submission URL is from allowed R2 public domain.
4. Download file and extract text:
   - PDF: `pdf-parse`
   - DOCX: `mammoth`
5. Build rubric:
   - Use assignment rubric if provided
   - Fallback to default rubric by assignment type
6. Call LLM via shared AI model factory (`PROVIDER`, `MODEL`, supports OpenAI/Kimi-compatible).
7. Parse strict JSON output and persist suggestion.
8. Mark run as `completed` or `failed` with reason.

---

## API Changes

### Updated DTOs
- `CreateAssignmentDto` / `UpdateAssignmentDto`
  - `aiGradingEnabled?: boolean`
  - `gradingRubric?: string`
- `GradeStudentAssignmentDto`
  - `gradingSource?: "manual" | "ai_approved"`
  - `approvalNote?: string`

### New endpoints
- `GET /assignments/student-assignments/:id/ai-suggestion`
  - Returns latest AI grading run for that student assignment
- `POST /assignments/student-assignments/:id/regrade-ai`
  - Enqueues a new AI regrading run

### Existing endpoint behavior
- `PATCH /assignments/student-assignments/:id/grade`
  - Final score remains teacher/admin-controlled
  - Stores grading source and approval metadata

---

## Frontend Changes

### Teacher create assignment page
- New toggle: enable AI grading
- Optional rubric textarea

### Teacher assignment detail page
- Submission workspace shows AI status (`pending/processing/completed/failed`)
- Displays AI suggested score/confidence when available
- Action to trigger regrade
- Grade modal pre-fills score from AI suggestion when available
- Shows AI feedback and rubric breakdown for approval

### Student assignment detail page
- Existing submission UX stays unchanged
- Shows final approved result when available

---

## Reliability / Guardrails
- AI never writes final grade directly.
- Unsupported file formats fail safely with explicit error state.
- Retry policy for stuck processing runs.
- URL allowlist prevents grading arbitrary external files.
- Results are auditable through `assignment_grading_runs` history.

---

## Suggested Next Iterations
1. Add parser support for OCR images/scanned PDFs.
2. Add teacher-adjustable criterion weights per assignment.
3. Add notifications when AI suggestion is ready.
4. Add moderation checks for malformed/empty submissions.
