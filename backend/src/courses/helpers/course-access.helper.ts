import { eq, and, inArray } from 'drizzle-orm';
import {
  db,
  courses,
  teacherCourseMap,
  modules,
  sections,
  knowledgePoint,
  sectionKpMap,
} from '../../../db';

/**
 * Check if a user has access to a course (for management purposes)
 * - Admin: always has access
 * - Teacher: has access if:
 *   1. They created it OR
 *   2. They are assigned to it
 * Note: Public courses are accessed via Explorer, not through this function
 */
export async function hasCourseAccess(
  courseId: string,
  userId: string,
  userRole: string,
): Promise<boolean> {
  if (userRole === 'admin') {
    return true;
  }

  if (userRole !== 'teacher') {
    return false;
  }

  // Get the course
  const courseResult = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (courseResult.length === 0) {
    return false;
  }

  const course = courseResult[0];

  // Check if teacher created the course
  if (course.createdBy === userId) {
    return true;
  }

  // Check if teacher is assigned to the course
  const assignment = await db
    .select()
    .from(teacherCourseMap)
    .where(
      and(
        eq(teacherCourseMap.courseId, courseId),
        eq(teacherCourseMap.teacherId, userId),
      ),
    )
    .limit(1);

  return assignment.length > 0;
}

/**
 * Check if a user has write access to a course (can edit/delete)
 * - Admin: always has write access
 * - Teacher: has write access if they created it OR are assigned to it (NOT for public courses they don't own)
 */
export async function hasCourseWriteAccess(
  courseId: string,
  userId: string,
  userRole: string,
): Promise<boolean> {
  if (userRole === 'admin') {
    return true;
  }

  if (userRole !== 'teacher') {
    return false;
  }

  // Get the course
  const courseResult = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (courseResult.length === 0) {
    return false;
  }

  const course = courseResult[0];

  // Check if teacher created the course
  if (course.createdBy === userId) {
    return true;
  }

  // Check if teacher is assigned to the course
  const assignment = await db
    .select()
    .from(teacherCourseMap)
    .where(
      and(
        eq(teacherCourseMap.courseId, courseId),
        eq(teacherCourseMap.teacherId, userId),
      ),
    )
    .limit(1);

  return assignment.length > 0;
}

/**
 * Get accessible course IDs for a user (for management purposes)
 * - Admin: all course IDs
 * - Teacher: course IDs they created OR are assigned to
 * Note: Public courses are accessed via Explorer, not included here
 */
export async function getAccessibleCourseIds(
  userId: string,
  userRole: string,
): Promise<string[]> {
  if (userRole === 'admin') {
    const allCourses = await db.select({ id: courses.id }).from(courses);
    return allCourses.map((c) => c.id);
  }

  if (userRole !== 'teacher') {
    return [];
  }

  const courseIds = new Set<string>();

  // Get courses created by teacher
  const createdCourses = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.createdBy, userId));
  createdCourses.forEach((c) => courseIds.add(c.id));

  // Get courses assigned to teacher
  const assignedCourses = await db
    .select({ courseId: teacherCourseMap.courseId })
    .from(teacherCourseMap)
    .where(eq(teacherCourseMap.teacherId, userId));
  assignedCourses.forEach((a) => courseIds.add(a.courseId));

  return Array.from(courseIds);
}

/**
 * Get accessible module IDs for a user
 * - Admin: all module IDs
 * - Teacher: module IDs from courses they have access to
 */
export async function getAccessibleModuleIds(
  userId: string,
  userRole: string,
): Promise<string[]> {
  const accessibleCourseIds = await getAccessibleCourseIds(userId, userRole);

  if (accessibleCourseIds.length === 0) {
    return [];
  }

  const accessibleModules = await db
    .select({ id: modules.id })
    .from(modules)
    .where(inArray(modules.courseId, accessibleCourseIds));

  return accessibleModules.map((m) => m.id);
}

/**
 * Get accessible section IDs for a user
 * - Admin: all section IDs
 * - Teacher: section IDs from modules they have access to
 */
export async function getAccessibleSectionIds(
  userId: string,
  userRole: string,
): Promise<string[]> {
  const accessibleModuleIds = await getAccessibleModuleIds(userId, userRole);

  if (accessibleModuleIds.length === 0) {
    return [];
  }

  const accessibleSections = await db
    .select({ id: sections.id })
    .from(sections)
    .where(inArray(sections.moduleId, accessibleModuleIds));

  return accessibleSections.map((s) => s.id);
}

/**
 * Get accessible knowledge point IDs for a user
 * - Admin: all KP IDs
 * - Teacher: KP IDs they created OR from sections they have access to
 */
export async function getAccessibleKnowledgePointIds(
  userId: string,
  userRole: string,
): Promise<string[]> {
  if (userRole === 'admin') {
    const allKps = await db
      .select({ id: knowledgePoint.id })
      .from(knowledgePoint);
    return allKps.map((kp) => kp.id);
  }

  if (userRole !== 'teacher') {
    return [];
  }

  const kpIds = new Set<string>();

  // Get KPs created by teacher
  const createdKps = await db
    .select({ id: knowledgePoint.id })
    .from(knowledgePoint)
    .where(eq(knowledgePoint.createdBy, userId));
  createdKps.forEach((kp) => kpIds.add(kp.id));

  // Get KPs from accessible sections
  const accessibleSectionIds = await getAccessibleSectionIds(userId, userRole);
  if (accessibleSectionIds.length > 0) {
    const sectionKps = await db
      .select({ kpId: sectionKpMap.kpId })
      .from(sectionKpMap)
      .where(inArray(sectionKpMap.sectionId, accessibleSectionIds));
    sectionKps.forEach((skp) => kpIds.add(skp.kpId));
  }

  return Array.from(kpIds);
}
