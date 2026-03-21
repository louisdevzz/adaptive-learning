# AI-Powered Adaptive Learning Features

## Overview

This document describes the 4 phases of real AI-powered adaptive learning features added to the platform. These replace the previous binary mastery system (correct=100, wrong=0) with a probabilistic model and populate the previously empty `student_mastery`, `student_insights`, and `recommendation_events` tables.

---

## Phase 1: BKT Mastery Engine

**Files:**
- `backend/src/student-progress/bkt-mastery.service.ts` — Pure stateless BKT computation
- `backend/src/student-progress/bkt-mastery.service.spec.ts` — 14 unit tests
- `backend/src/student-progress/student-progress.service.ts` — Modified `submitQuestionAttempt()`
- `backend/src/student-progress/student-progress.module.ts` — Registered `BktMasteryService`

### What changed

Replaced the binary mastery calculation (`isCorrect ? 100 : 0`) with **Bayesian Knowledge Tracing (BKT)**, a proven probabilistic model from educational data mining.

### BKT Algorithm

```
P(L|correct)   = P(L)*(1-P(S)) / [P(L)*(1-P(S)) + (1-P(L))*P(G)]
P(L|incorrect) = P(L)*P(S)     / [P(L)*P(S) + (1-P(L))*(1-P(G))]
P(L_next)      = P(L|response) + (1-P(L|response)) * P(T)
```

**Default parameters:**
| Parameter | Value | Meaning |
|-----------|-------|---------|
| P(L₀) | 0.2 | Initial probability of knowing |
| P(T) | 0.1 | Probability of learning per attempt |
| P(S) | 0.1 | Probability of slipping (knowing but answering wrong) |
| P(G) | 0.25 | Probability of guessing (not knowing but answering right) |

**Parameter adaptation:** BKT parameters are derived from `question_metadata.difficulty` and `discrimination` when available, falling back to `knowledge_point.difficultyLevel`.

### Course Mastery Aggregation

After each question attempt, `updateCourseMastery()` is called asynchronously to:
1. Find all courses containing the attempted KP
2. Average mastery scores across all KPs in each course
3. Upsert the `student_mastery` table with overall score, strengths (≥80), and weaknesses (<40)

### Behavior

- 5 correct answers → mastery increases monotonically (reaches ~60-70% from 20%)
- 5 wrong answers → mastery decreases but never reaches 0 (learning transition ensures this)
- Mixed responses → net improvement reflects actual understanding

---

## Phase 2: AI Student Insights

**Files:**
- `backend/src/student-insights/student-insights.module.ts`
- `backend/src/student-insights/student-insights.service.ts` — Cron (daily 2am) + event-driven
- `backend/src/student-insights/student-insights-analyzer.ts` — Pure computation (no DB, no AI)
- `backend/src/student-insights/student-insights-analyzer.spec.ts` — 13 unit tests
- `backend/src/app.module.ts` — Registered `StudentInsightsModule`

### What it computes

| Metric | Logic |
|--------|-------|
| **Strengths** | KPs with masteryScore ≥ 80 |
| **Weaknesses** | KPs with masteryScore < 60 AND ≥ 3 attempts |
| **Risk KPs** | Score decline > 15 points in 7 days, OR low mastery (<50) + no activity for 5+ days |
| **Learning pattern** | Avg time per question, velocity trend (improving/declining/stable), consistency score |
| **Engagement score** | Weighted composite: recent attempts (40%) + study minutes (30%) + consistency (30%) |

### Triggers

1. **Daily cron at 2:00 AM** — processes all active students (enrolled in at least one class)
2. **Event-driven** — reacts to `progress.updated` events when `|delta| ≥ 15`

### AI Enrichment

When a student has ≥ 10 total attempts, the service calls an LLM (temperature 0.3) to generate Vietnamese-language reasons for each strength and weakness. If AI fails, the rule-based result is used as-is.

---

## Phase 3: AI Recommendation Engine

**Files:**
- `backend/src/learning-paths/recommendation.service.ts`
- `backend/src/learning-paths/recommendation.service.spec.ts` — 4 unit tests
- `backend/src/learning-paths/learning-paths.module.ts` — Registered `RecommendationService`

### Rule Set

| Priority | Rule | Condition | Type |
|----------|------|-----------|------|
| 1 | Prerequisite gap | KP is weak AND its prerequisite is also weak | `review` (on prerequisite) |
| 2 | Review | masteryScore < 40 | `review` |
| 3 | Practice | 40 ≤ masteryScore < 60 | `practice` |
| 4 | Advance | masteryScore ≥ 85 AND dependent KP not started | `advance` |

### AI Fallback

When ≥ 3 weak KPs exist AND no prerequisite gap rule fired → call LLM (temperature 0.2) to rank by learning priority. Returns top 5 items. Falls back to sort-by-mastery-ascending if AI fails.

### Persistence

All recommendations are written to the `recommendation_events` table with:
- `recommendation_type`: review / practice / advance
- `student_action`: defaults to `ignored` (updated when student interacts)
- `metadata`: priority number and reason string

---

## Phase 4: Enhanced AI Learning Path

**Files:**
- `backend/db/schema.ts` — Added `metadata: json('metadata').default({})` to `learning_path_items`
- `backend/drizzle/0015_watery_firebird.sql` — Migration file
- `backend/src/learning-paths/learning-path-auto-generation.service.ts` — Major upgrade

### What changed

The `LearningPathAutoGenerationService` now:

1. **Calls `RecommendationService`** before building the path — recommended KPs get priority ordering
2. **AI-generated titles** — LLM (temperature 0.7) creates Vietnamese path titles; falls back to hardcoded strings
3. **AI-generated descriptions** — LLM creates path descriptions with context about items and mastery level
4. **Per-item rationales** — Batch AI call generates a reason for each KP in the path, stored in `learning_path_items.metadata.reason`

### Flow

```
analyzeAndUpdatePath(studentId)
  ├── generateRecommendations() → writes to recommendation_events
  ├── identifyWeakAreas()
  ├── merge & prioritize (recommendations first, then remaining weak areas)
  ├── expandWithPrerequisites()
  ├── generateItemReasons() → AI batch call
  ├── generatePathTitle() → AI call
  ├── generatePathDescription() → AI call
  └── createNewPath() or updateExistingPath() → writes to learning_path + learning_path_items
```

---

## Cross-Cutting Design Decisions

### AI Failure Handling
All AI calls are wrapped in try/catch. If the LLM fails, the system falls back to rule-based results. AI failures never crash the service or block the pipeline.

### Event Filtering
Phases 2 & 3 only react to `progress.updated` when `|delta| ≥ 15` to avoid excessive recomputation.

### Concurrency Guards
Each phase uses `processingStudents: Set<string>` to prevent duplicate processing for the same student.

### AI Model Usage
All AI calls use `createChatModel()` from `backend/src/common/ai/chat-model.factory.ts`:
- **Temperature 0.2** — analytical/ranking tasks (recommendations)
- **Temperature 0.3** — insights analysis
- **Temperature 0.7** — creative content (path titles, descriptions)

### Database Schema Change
Migration `0015_watery_firebird.sql` adds a `metadata` JSON column to `learning_path_items` (default `{}`). This is a non-breaking, additive change.

---

## Test Summary

| File | Tests |
|------|-------|
| `bkt-mastery.service.spec.ts` | 14 passed |
| `student-insights-analyzer.spec.ts` | 13 passed |
| `recommendation.service.spec.ts` | 4 passed |
| **Total** | **31 passed** |
