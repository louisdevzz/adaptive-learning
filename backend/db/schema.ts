import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  json,
  real,
  index,
  unique,
} from 'drizzle-orm/pg-core';

// =============================================
// USERS & AUTHENTICATION
// =============================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    fullName: text('full_name').notNull(),
    avatarUrl: text('avatar_url'),
    role: varchar('role', { length: 50 }).notNull(), // 'student', 'teacher', 'parent', 'admin'
    status: boolean('status').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
  }),
);

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleName: varchar('role_name', { length: 50 }).notNull(),
  permissions: json('permissions').notNull(),
});

export const admins = pgTable('admins', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  adminLevel: varchar('admin_level', { length: 10 }).notNull(),
  permissions: json('permissions').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const students = pgTable(
  'students',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    studentCode: varchar('student_code', { length: 50 }).notNull().unique(),
    gradeLevel: integer('grade_level').notNull(),
    schoolName: text('school_name').notNull(),
    dateOfBirth: date('date_of_birth').notNull(),
    gender: varchar('gender', { length: 10 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    studentCodeIdx: index('students_code_idx').on(table.studentCode),
    gradeLevelIdx: index('students_grade_idx').on(table.gradeLevel),
  }),
);

export const teachers = pgTable('teachers', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  specialization: json('specialization').notNull(), // array of subjects
  experienceYears: integer('experience_years').notNull(),
  certifications: json('certifications').notNull(),
  phone: varchar('phone', { length: 20 }),
  bio: text('bio'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const parents = pgTable('parents', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  relationshipType: varchar('relationship_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const parentStudentMap = pgTable(
  'parent_student_map',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parentId: uuid('parent_id')
      .notNull()
      .references(() => parents.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    parentStudentIdx: index('parent_student_idx').on(
      table.parentId,
      table.studentId,
    ),
  }),
);

// =============================================
// COURSES, MODULES & SECTIONS
// =============================================

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    thumbnailUrl: text('thumbnail_url').notNull(),
    subject: varchar('subject', { length: 50 }).notNull(),
    gradeLevel: integer('grade_level').notNull(),
    active: boolean('active').notNull().default(true),
    visibility: varchar('visibility', { length: 20 })
      .notNull()
      .default('public'), // 'public', 'private'
    originCourseId: uuid('origin_course_id').references(() => courses.id, {
      onDelete: 'set null',
    }),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    updatedBy: uuid('updated_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    subjectIdx: index('courses_subject_idx').on(table.subject),
    gradeLevelIdx: index('courses_grade_idx').on(table.gradeLevel),
    activeIdx: index('courses_active_idx').on(table.active),
    visibilityIdx: index('courses_visibility_idx').on(table.visibility),
    createdByIdx: index('courses_created_by_idx').on(table.createdBy),
    originCourseIdx: index('courses_origin_course_idx').on(
      table.originCourseId,
    ),
  }),
);

export const modules = pgTable(
  'modules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    orderIndex: integer('order_index').notNull(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    courseIdIdx: index('modules_course_idx').on(table.courseId),
    orderIdx: index('modules_order_idx').on(table.courseId, table.orderIndex),
    createdByIdx: index('modules_created_by_idx').on(table.createdBy),
  }),
);

export const sections = pgTable(
  'sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    orderIndex: integer('order_index').notNull(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    moduleIdIdx: index('sections_module_idx').on(table.moduleId),
    orderIdx: index('sections_order_idx').on(table.moduleId, table.orderIndex),
    createdByIdx: index('sections_created_by_idx').on(table.createdBy),
  }),
);

export const teacherCourseMap = pgTable(
  'teacher_course_map',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull(), // 'creator', 'collaborator'
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  },
  (table) => ({
    teacherCourseIdx: index('teacher_course_idx').on(
      table.teacherId,
      table.courseId,
    ),
  }),
);

export const courseAnalytics = pgTable(
  'course_analytics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id').references(() => modules.id, {
      onDelete: 'cascade',
    }),
    completionRate: integer('completion_rate').notNull(), // 0-100
    averageMastery: integer('average_mastery').notNull(), // 0-100
    highFailureKps: json('high_failure_kps').notNull(), // array of KP IDs
    engagementIndex: integer('engagement_index').notNull(), // 0-100
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    courseIdIdx: index('course_analytics_course_idx').on(table.courseId),
    moduleIdIdx: index('course_analytics_module_idx').on(table.moduleId),
  }),
);

// =============================================
// KNOWLEDGE POINTS (KP)
// =============================================

export const knowledgePoint = pgTable(
  'knowledge_point',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    content: json('content').notNull(), // knowledge point content data
    difficultyLevel: integer('difficulty_level').notNull(), // 1-5

    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    difficultyIdx: index('kp_difficulty_idx').on(table.difficultyLevel),
    createdByIdx: index('kp_created_by_idx').on(table.createdBy),
  }),
);

export const kpPrerequisites = pgTable(
  'kp_prerequisites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kpId: uuid('kp_id')
      .notNull()
      .references(() => knowledgePoint.id, { onDelete: 'cascade' }),
    prerequisiteKpId: uuid('prerequisite_kp_id')
      .notNull()
      .references(() => knowledgePoint.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    kpPrereqIdx: index('kp_prereq_idx').on(table.kpId, table.prerequisiteKpId),
  }),
);

export const kpResources = pgTable(
  'kp_resources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kpId: uuid('kp_id')
      .notNull()
      .references(() => knowledgePoint.id, { onDelete: 'cascade' }),
    resourceType: varchar('resource_type', { length: 20 }).notNull(), // 'video', 'article', 'interactive', 'quiz', 'other'
    url: text('url').notNull(),
    title: text('title').notNull(),
    description: text('description'), // Made optional
    orderIndex: integer('order_index').notNull(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    kpIdIdx: index('kp_resources_kp_idx').on(table.kpId),
    orderIdx: index('kp_resources_order_idx').on(table.kpId, table.orderIndex),
    createdByIdx: index('kp_resources_created_by_idx').on(table.createdBy),
  }),
);

export const sectionKpMap = pgTable(
  'section_kp_map',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),
    kpId: uuid('kp_id')
      .notNull()
      .references(() => knowledgePoint.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull(),
  },
  (table) => ({
    sectionKpIdx: index('section_kp_idx').on(table.sectionId, table.kpId),
    orderIdx: index('section_kp_order_idx').on(
      table.sectionId,
      table.orderIndex,
    ),
  }),
);

// =============================================
// QUESTIONS & ASSIGNMENTS
// =============================================

export const questionBank = pgTable(
  'question_bank',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionText: text('question_text').notNull(),
    options: json('options').notNull(), // array of options
    correctAnswer: text('correct_answer').notNull(),
    questionType: varchar('question_type', { length: 100 }).notNull(), // 'multiple_choice', 'true_false', 'short_answer'
    isActive: boolean('is_active').notNull().default(true),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    typeIdx: index('question_type_idx').on(table.questionType),
    activeIdx: index('question_active_idx').on(table.isActive),
    createdByIdx: index('question_bank_created_by_idx').on(table.createdBy),
  }),
);

export const questionMetadata = pgTable(
  'question_metadata',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questionBank.id, { onDelete: 'cascade' }),
    difficulty: integer('difficulty').notNull(), // 1-10
    discrimination: real('discrimination').notNull(), // IRT parameter (0-1, float: 0.2-0.39=avg, 0.4-0.69=good, 0.7-1.0=excellent)
    skillId: uuid('skill_id').notNull(), // references to knowledge_point
    tags: json('tags').notNull(),
    estimatedTime: integer('estimated_time').notNull(), // seconds
  },
  (table) => ({
    questionIdIdx: index('question_metadata_question_idx').on(table.questionId),
    difficultyIdx: index('question_metadata_difficulty_idx').on(
      table.difficulty,
    ),
  }),
);

export const kpExercises = pgTable(
  'kp_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kpId: uuid('kp_id')
      .notNull()
      .references(() => knowledgePoint.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questionBank.id, { onDelete: 'cascade' }),
    difficulty: integer('difficulty').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    kpQuestionIdx: index('kp_exercises_kp_question_idx').on(
      table.kpId,
      table.questionId,
    ),
    difficultyIdx: index('kp_exercises_difficulty_idx').on(
      table.kpId,
      table.difficulty,
    ),
  }),
);

export const assignments = pgTable(
  'assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    attachmentUrl: text('attachment_url'),
    attachmentName: text('attachment_name'),
    attachmentMimeType: varchar('attachment_mime_type', { length: 100 }),
    assignmentType: varchar('assignment_type', { length: 50 }).notNull(), // 'practice', 'quiz', 'exam', 'homework', 'test', 'adaptive'
    aiGradingEnabled: boolean('ai_grading_enabled').notNull().default(false),
    gradingRubric: text('grading_rubric'),
    dueDate: timestamp('due_date'),
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    teacherIdx: index('assignments_teacher_idx').on(table.teacherId),
    publishedIdx: index('assignments_published_idx').on(table.isPublished),
    dueDateIdx: index('assignments_due_date_idx').on(table.dueDate),
  }),
);

export const sectionAssignments = pgTable(
  'section_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),
    assignmentId: uuid('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    autoAssign: boolean('auto_assign').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    sectionAssignmentIdx: index(
      'section_assignments_section_assignment_idx',
    ).on(table.sectionId, table.assignmentId),
    sectionIdx: index('section_assignments_section_idx').on(table.sectionId),
    assignmentIdx: index('section_assignments_assignment_idx').on(
      table.assignmentId,
    ),
  }),
);

export const assignmentTargets = pgTable(
  'assignment_targets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assignmentId: uuid('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    targetType: varchar('target_type', { length: 20 }).notNull(), // 'student', 'class', 'group', 'auto', 'section'
    targetId: uuid('target_id').notNull(), // ID of student/class/group/section
    assignedBy: varchar('assigned_by', { length: 50 }).notNull(), // teacher_id or 'system'
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  },
  (table) => ({
    assignmentTargetIdx: index('assignment_targets_assignment_target_idx').on(
      table.assignmentId,
      table.targetType,
      table.targetId,
    ),
    assignmentIdx: index('assignment_targets_assignment_idx').on(
      table.assignmentId,
    ),
    targetIdx: index('assignment_targets_target_idx').on(
      table.targetType,
      table.targetId,
    ),
  }),
);

export const studentAssignments = pgTable(
  'student_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    assignmentId: uuid('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull(), // 'not_started', 'in_progress', 'submitted', 'graded'
    startTime: timestamp('start_time'),
    submittedTime: timestamp('submitted_time'),
    submissionUrl: text('submission_url'),
    submissionName: text('submission_name'),
    submissionMimeType: varchar('submission_mime_type', { length: 100 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    studentAssignmentIdx: index(
      'student_assignments_student_assignment_idx',
    ).on(table.studentId, table.assignmentId),
    statusIdx: index('student_assignments_status_idx').on(table.status),
  }),
);

export const studentAssignmentResults = pgTable(
  'student_assignment_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentAssignmentId: uuid('student_assignment_id')
      .notNull()
      .references(() => studentAssignments.id, { onDelete: 'cascade' }),
    totalScore: integer('total_score').notNull(),
    maxScore: integer('max_score').notNull(),
    accuracy: integer('accuracy').notNull(), // 0-100
    timeSpent: integer('time_spent').notNull(), // seconds
    gradingSource: varchar('grading_source', { length: 20 })
      .notNull()
      .default('manual'), // 'manual', 'ai_approved'
    approvedBy: uuid('approved_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    approvalNote: text('approval_note'),
    gradedAt: timestamp('graded_at').notNull().defaultNow(),
  },
  (table) => ({
    studentAssignmentIdx: index('student_assignment_results_idx').on(
      table.studentAssignmentId,
    ),
    approvedByIdx: index('student_assignment_results_approved_by_idx').on(
      table.approvedBy,
    ),
  }),
);

export const assignmentGradingRuns = pgTable(
  'assignment_grading_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentAssignmentId: uuid('student_assignment_id')
      .notNull()
      .references(() => studentAssignments.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
    provider: varchar('provider', { length: 50 }),
    model: text('model'),
    rubricUsed: text('rubric_used'),
    extractedText: text('extracted_text'),
    suggestedScore: real('suggested_score'),
    feedback: text('feedback'),
    criteriaBreakdown: json('criteria_breakdown'),
    confidence: integer('confidence'), // 0-100
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    studentAssignmentIdx: index('assignment_grading_runs_student_idx').on(
      table.studentAssignmentId,
    ),
    statusCreatedIdx: index('assignment_grading_runs_status_created_idx').on(
      table.status,
      table.createdAt,
    ),
  }),
);

export const questionAttempts = pgTable(
  'question_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questionBank.id, { onDelete: 'cascade' }),
    assignmentId: uuid('assignment_id').references(() => assignments.id, {
      onDelete: 'cascade',
    }),
    selectedAnswer: text('selected_answer').notNull(),
    isCorrect: boolean('is_correct').notNull(),
    timeSpent: integer('time_spent').notNull(), // seconds
    kpId: uuid('kp_id').references(() => knowledgePoint.id, {
      onDelete: 'set null',
    }),
    attemptTime: timestamp('attempt_time').notNull().defaultNow(),
  },
  (table) => ({
    studentQuestionIdx: index('question_attempts_student_question_idx').on(
      table.studentId,
      table.questionId,
    ),
    kpIdx: index('question_attempts_kp_idx').on(table.kpId),
    attemptTimeIdx: index('question_attempts_time_idx').on(table.attemptTime),
  }),
);

// =============================================
// STUDENT PROGRESS & ANALYTICS
// =============================================

export const studentKpProgress = pgTable(
  'student_kp_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    kpId: uuid('kp_id')
      .notNull()
      .references(() => knowledgePoint.id, { onDelete: 'cascade' }),
    masteryScore: integer('mastery_score').notNull(), // 0-100
    confidence: integer('confidence').notNull(), // 0-100, confidence in mastery score
    lastAttemptId: uuid('last_attempt_id').references(
      () => questionAttempts.id,
      { onDelete: 'cascade' },
    ),
    lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  },
  (table) => ({
    studentKpIdx: index('student_kp_progress_student_kp_idx').on(
      table.studentId,
      table.kpId,
    ),
    masteryIdx: index('student_kp_progress_mastery_idx').on(
      table.studentId,
      table.masteryScore,
    ),
  }),
);

export const studentKpHistory = pgTable(
  'student_kp_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    kpId: uuid('kp_id')
      .notNull()
      .references(() => knowledgePoint.id, { onDelete: 'cascade' }),
    oldScore: integer('old_score').notNull(),
    newScore: integer('new_score').notNull(),
    confidence: integer('confidence').notNull(),
    source: varchar('source', { length: 20 }).notNull(), // 'assessment', 'practice', 'review'
    attemptId: uuid('attempt_id').references(() => questionAttempts.id),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
  },
  (table) => ({
    studentKpIdx: index('student_kp_history_student_kp_idx').on(
      table.studentId,
      table.kpId,
    ),
    timestampIdx: index('student_kp_history_timestamp_idx').on(table.timestamp),
  }),
);

export const studentMastery = pgTable(
  'student_mastery',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    overallMasteryScore: integer('overall_mastery_score').notNull(), // 0-100
    strengths: json('strengths').notNull(), // array of KP IDs
    weaknesses: json('weaknesses').notNull(), // array of KP IDs
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    studentCourseIdx: index('student_mastery_student_course_idx').on(
      table.studentId,
      table.courseId,
    ),
  }),
);

export const studentInsights = pgTable(
  'student_insights',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    strengths: json('strengths').notNull(), // detailed analysis
    weaknesses: json('weaknesses').notNull(),
    riskKps: json('risk_kps').notNull(), // KPs at risk
    learningPattern: json('learning_pattern').notNull(), // learning behavior patterns
    engagementScore: integer('engagement_score').notNull(), // 0-100
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    studentIdx: index('student_insights_student_idx').on(table.studentId),
  }),
);

export const studentSession = pgTable(
  'student_session',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    startTime: timestamp('start_time').notNull().defaultNow(),
    endTime: timestamp('end_time'),
    deviceInfo: text('device_info').notNull(),
    ipAddress: varchar('ip_address', { length: 100 }).notNull(),
    sessionType: varchar('session_type', { length: 20 }).notNull(), // 'practice', 'assignment', 'review'
  },
  (table) => ({
    studentIdx: index('student_session_student_idx').on(table.studentId),
    startTimeIdx: index('student_session_start_time_idx').on(table.startTime),
  }),
);

export const timeOnTask = pgTable(
  'time_on_task',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    kpId: uuid('kp_id').references(() => knowledgePoint.id, {
      onDelete: 'set null',
    }),
    sectionId: uuid('section_id').references(() => sections.id, {
      onDelete: 'set null',
    }),
    timeSpentSeconds: integer('time_spent_seconds').notNull(),
    computedAt: timestamp('computed_at').notNull().defaultNow(),
  },
  (table) => ({
    studentKpIdx: index('time_on_task_student_kp_idx').on(
      table.studentId,
      table.kpId,
    ),
    studentSectionIdx: index('time_on_task_student_section_idx').on(
      table.studentId,
      table.sectionId,
    ),
  }),
);

export const activityLog = pgTable(
  'activity_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorUserId: uuid('actor_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    actorRole: varchar('actor_role', { length: 20 }), // 'student', 'teacher', 'parent', 'admin', 'system'
    studentId: uuid('student_id').references(() => students.id, {
      onDelete: 'set null',
    }),
    sessionId: uuid('session_id').references(() => studentSession.id, {
      onDelete: 'set null',
    }),
    activityType: varchar('activity_type', { length: 50 }).notNull(), // 'learning', 'assignment', 'auth', 'classroom'
    action: varchar('action', { length: 50 }).notNull(), // 'view', 'submit', 'complete', 'create', 'update', 'delete'
    targetType: varchar('target_type', { length: 30 }).notNull(), // 'course', 'module', 'section', 'kp', 'assignment', 'class'
    targetId: uuid('target_id'), // polymorphic resource ID
    source: varchar('source', { length: 30 }).notNull().default('web_app'), // 'web_app', 'mobile_app', 'api', 'system'
    status: varchar('status', { length: 20 }).notNull().default('success'), // 'success', 'failure', 'denied'
    ipAddress: varchar('ip_address', { length: 100 }),
    userAgent: text('user_agent'),
    requestId: varchar('request_id', { length: 100 }),
    metadata: json('metadata').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    actorUserIdx: index('activity_log_actor_user_idx').on(table.actorUserId),
    actorRoleIdx: index('activity_log_actor_role_idx').on(table.actorRole),
    studentIdx: index('activity_log_student_idx').on(table.studentId),
    sessionIdx: index('activity_log_session_idx').on(table.sessionId),
    activityTypeActionIdx: index('activity_log_activity_type_action_idx').on(
      table.activityType,
      table.action,
    ),
    targetIdx: index('activity_log_target_idx').on(
      table.targetType,
      table.targetId,
    ),
    sourceIdx: index('activity_log_source_idx').on(table.source),
    statusIdx: index('activity_log_status_idx').on(table.status),
    requestIdIdx: index('activity_log_request_id_idx').on(table.requestId),
    createdAtIdx: index('activity_log_created_at_idx').on(table.createdAt),
  }),
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipientId: uuid('recipient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    actorUserId: uuid('actor_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    relatedStudentId: uuid('related_student_id').references(() => students.id, {
      onDelete: 'set null',
    }),
    type: varchar('type', { length: 50 }).notNull(), // 'assignment_assigned', 'progress_update', ...
    title: text('title').notNull(),
    message: text('message').notNull(),
    actionUrl: text('action_url'),
    metadata: json('metadata').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    recipientIdx: index('notifications_recipient_idx').on(table.recipientId),
    recipientReadIdx: index('notifications_recipient_read_idx').on(
      table.recipientId,
      table.isRead,
    ),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
    typeIdx: index('notifications_type_idx').on(table.type),
    relatedStudentIdx: index('notifications_related_student_idx').on(
      table.relatedStudentId,
    ),
  }),
);

// =============================================
// CLASSES & ENROLLMENTS
// =============================================

export const classes = pgTable(
  'classes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    className: varchar('class_name', { length: 20 }).notNull(),
    gradeLevel: integer('grade_level').notNull(),
    schoolYear: varchar('school_year', { length: 20 }).notNull(), // '2024-2025'
    homeroomTeacherId: uuid('homeroom_teacher_id').references(
      () => teachers.id,
      { onDelete: 'set null' },
    ),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    gradeLevelIdx: index('classes_grade_level_idx').on(table.gradeLevel),
    schoolYearIdx: index('classes_school_year_idx').on(table.schoolYear),
    homeroomTeacherIdx: index('classes_homeroom_teacher_idx').on(
      table.homeroomTeacherId,
    ),
  }),
);

export const classEnrollment = pgTable(
  'class_enrollment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull(), // 'active', 'withdrawn', 'completed'
    enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  },
  (table) => ({
    classStudentIdx: index('class_enrollment_class_student_idx').on(
      table.classId,
      table.studentId,
    ),
    statusIdx: index('class_enrollment_status_idx').on(table.status),
  }),
);

export const teacherClassMap = pgTable(
  'teacher_class_map',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull(), // 'homeroom', 'subject_teacher', 'assistant'
    status: varchar('status', { length: 20 }).notNull(), // 'active', 'inactive'
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  },
  (table) => ({
    teacherClassIdx: index('teacher_class_map_teacher_class_idx').on(
      table.teacherId,
      table.classId,
    ),
    roleIdx: index('teacher_class_map_role_idx').on(table.role),
  }),
);

export const classCourses = pgTable(
  'class_courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    assignedBy: uuid('assigned_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
    status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'inactive'
  },
  (table) => ({
    classCourseIdx: index('class_courses_class_course_idx').on(
      table.classId,
      table.courseId,
    ),
    classIdx: index('class_courses_class_idx').on(table.classId),
    courseIdx: index('class_courses_course_idx').on(table.courseId),
    statusIdx: index('class_courses_status_idx').on(table.status),
  }),
);

// =============================================
// LEARNING PATH & RECOMMENDATIONS
// =============================================

export const learningPath = pgTable(
  'learning_path',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    createdBy: varchar('created_by', { length: 10 }).notNull(), // 'system', 'teacher', 'student'
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: varchar('status', { length: 10 }).notNull(), // 'active', 'paused', 'completed'
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    studentIdx: index('learning_path_student_idx').on(table.studentId),
    statusIdx: index('learning_path_status_idx').on(table.status),
  }),
);

export const learningPathItems = pgTable(
  'learning_path_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learningPathId: uuid('learning_path_id')
      .notNull()
      .references(() => learningPath.id, { onDelete: 'cascade' }),
    itemType: varchar('item_type', { length: 10 }).notNull(), // 'kp', 'section', 'assignment'
    itemId: uuid('item_id').notNull(), // ID of KP, section, or assignment
    orderIndex: integer('order_index').notNull(),
    status: varchar('status', { length: 20 }).notNull(), // 'not_started', 'in_progress', 'completed'
    metadata: json('metadata').default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    learningPathIdx: index('learning_path_items_path_idx').on(
      table.learningPathId,
    ),
    orderIdx: index('learning_path_items_order_idx').on(
      table.learningPathId,
      table.orderIndex,
    ),
  }),
);

export const recommendationEvents = pgTable(
  'recommendation_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    kpId: uuid('kp_id').references(() => knowledgePoint.id, {
      onDelete: 'set null',
    }),
    assignmentId: uuid('assignment_id').references(
      () => studentAssignments.id,
      { onDelete: 'set null' },
    ),
    sectionId: uuid('section_id').references(() => sections.id, {
      onDelete: 'set null',
    }),
    recommendationType: varchar('recommendation_type', {
      length: 20,
    }).notNull(), // 'practice', 'review', 'advance'
    studentAction: varchar('student_action', { length: 20 }).notNull(), // 'accepted', 'rejected', 'ignored'
    metadata: json('metadata').notNull(),
    recommendedAt: timestamp('recommended_at').notNull().defaultNow(),
    actionTimestamp: timestamp('action_timestamp'),
  },
  (table) => ({
    studentIdx: index('recommendation_events_student_idx').on(table.studentId),
    typeIdx: index('recommendation_events_type_idx').on(
      table.recommendationType,
    ),
    recommendedAtIdx: index('recommendation_events_recommended_at_idx').on(
      table.recommendedAt,
    ),
  }),
);
