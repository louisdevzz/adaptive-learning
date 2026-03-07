import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, desc, SQL, or, inArray } from 'drizzle-orm';
import {
  db,
  courses,
  modules,
  sections,
  sectionKpMap,
  teacherCourseMap,
  teachers,
  knowledgePoint,
  kpPrerequisites,
  kpResources,
} from '../../db';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import {
  hasCourseAccess,
  hasCourseWriteAccess,
  getAccessibleCourseIds,
  getAccessibleModuleIds,
  getAccessibleSectionIds,
} from './helpers/course-access.helper';

@Injectable()
export class CoursesService {
  // ==================== COURSES ====================

  async create(
    createCourseDto: CreateCourseDto,
    userId?: string,
    userRole?: string,
  ) {
    const result = await db
      .insert(courses)
      .values({
        title: createCourseDto.title,
        description: createCourseDto.description,
        thumbnailUrl: createCourseDto.thumbnailUrl,
        subject: createCourseDto.subject,
        gradeLevel: createCourseDto.gradeLevel,
        active: createCourseDto.active ?? true,
        visibility: createCourseDto.visibility ?? 'public',
        createdBy: userId ?? null,
        updatedBy: userId ?? null,
      })
      .returning();

    const newCourse = result[0];

    // Also insert into teacher_course_map if created by a teacher
    if (userId && userRole === 'teacher') {
      await db.insert(teacherCourseMap).values({
        teacherId: userId,
        courseId: newCourse.id,
        role: 'creator',
      });
    }

    return newCourse;
  }

  async findAll(
    gradeLevel?: number,
    subject?: string,
    active?: boolean,
    userId?: string,
    userRole?: string,
  ) {
    let query = db.select().from(courses);

    const conditions: SQL[] = [];

    // Filter by role: teacher only sees their courses
    if (userRole === 'teacher' && userId) {
      const accessibleCourseIds = await getAccessibleCourseIds(
        userId,
        userRole,
      );
      if (accessibleCourseIds.length === 0) {
        return [];
      }
      conditions.push(inArray(courses.id, accessibleCourseIds));
    }

    if (gradeLevel) conditions.push(eq(courses.gradeLevel, gradeLevel));
    if (subject) conditions.push(eq(courses.subject, subject));
    if (active !== undefined) conditions.push(eq(courses.active, active));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query.orderBy(desc(courses.createdAt));
    return result;
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Course not found');
    }

    // Check access permission for teachers
    if (userRole === 'teacher' && userId) {
      const hasAccess = await hasCourseAccess(id, userId, userRole);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this course');
      }
    }

    return result[0];
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    userId?: string,
    userRole?: string,
  ) {
    // Check read access first
    await this.findOne(id, userId, userRole);

    // Check write access for teachers (can't edit public courses they don't own)
    if (userRole === 'teacher' && userId) {
      const hasWriteAccess = await hasCourseWriteAccess(id, userId, userRole);
      if (!hasWriteAccess) {
        throw new ForbiddenException(
          'You do not have permission to edit this course',
        );
      }
    }

    const updateData: any = { ...updateCourseDto, updatedAt: new Date() };
    if (userId) {
      updateData.updatedBy = userId;
    }

    const [updated] = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, userId?: string, userRole?: string) {
    // Check read access first
    await this.findOne(id, userId, userRole);

    // Check write access for teachers (can't delete public courses they don't own)
    if (userRole === 'teacher' && userId) {
      const hasWriteAccess = await hasCourseWriteAccess(id, userId, userRole);
      if (!hasWriteAccess) {
        throw new ForbiddenException(
          'You do not have permission to delete this course',
        );
      }
    }

    await db.delete(courses).where(eq(courses.id, id));

    return { message: 'Course deleted successfully' };
  }

  // ==================== MODULES ====================

  async createModule(
    createModuleDto: CreateModuleDto,
    userId?: string,
    userRole?: string,
  ) {
    // Validate course exists and check read access
    await this.findOne(createModuleDto.courseId, userId, userRole);

    // Check write access for teachers (can't create modules in public courses they don't own)
    if (userRole === 'teacher' && userId) {
      const hasWriteAccess = await hasCourseWriteAccess(
        createModuleDto.courseId,
        userId,
        userRole,
      );
      if (!hasWriteAccess) {
        throw new ForbiddenException(
          'You do not have permission to create modules in this course',
        );
      }
    }

    const [module] = await db
      .insert(modules)
      .values({
        courseId: createModuleDto.courseId,
        title: createModuleDto.title,
        description: createModuleDto.description,
        orderIndex: createModuleDto.orderIndex,
        createdBy: userId ?? null,
      })
      .returning();

    return module;
  }

  async findModulesByCourse(
    courseId: string,
    userId?: string,
    userRole?: string,
  ) {
    await this.findOne(courseId, userId, userRole);

    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.orderIndex);

    return result;
  }

  async findModule(moduleId: string, userId?: string, userRole?: string) {
    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.id, moduleId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Module not found');
    }

    // Check access permission for teachers
    if (userRole === 'teacher' && userId) {
      const module = result[0];
      const hasAccess = await hasCourseAccess(
        module.courseId,
        userId,
        userRole,
      );
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this module');
      }
    }

    return result[0];
  }

  async updateModule(
    moduleId: string,
    updateData: Partial<CreateModuleDto>,
    userId?: string,
    userRole?: string,
  ) {
    const module = await this.findModule(moduleId, userId, userRole);

    // Check write access for teachers (can't edit modules in public courses they don't own)
    if (userRole === 'teacher' && userId) {
      const hasWriteAccess = await hasCourseWriteAccess(
        module.courseId,
        userId,
        userRole,
      );
      if (!hasWriteAccess) {
        throw new ForbiddenException(
          'You do not have permission to edit this module',
        );
      }
    }

    const [updated] = await db
      .update(modules)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(modules.id, moduleId))
      .returning();

    return updated;
  }

  async removeModule(moduleId: string, userId?: string, userRole?: string) {
    const module = await this.findModule(moduleId, userId, userRole);

    // Check write access for teachers (can't delete modules in public courses they don't own)
    if (userRole === 'teacher' && userId) {
      const hasWriteAccess = await hasCourseWriteAccess(
        module.courseId,
        userId,
        userRole,
      );
      if (!hasWriteAccess) {
        throw new ForbiddenException(
          'You do not have permission to delete this module',
        );
      }
    }

    await db.delete(modules).where(eq(modules.id, moduleId));

    return { message: 'Module deleted successfully' };
  }

  // ==================== SECTIONS ====================

  async createSection(
    createSectionDto: CreateSectionDto,
    userId?: string,
    userRole?: string,
  ) {
    // Validate module exists and check read access
    const module = await this.findModule(
      createSectionDto.moduleId,
      userId,
      userRole,
    );

    // Check write access for teachers (can't create sections in public courses they don't own)
    if (userRole === 'teacher' && userId) {
      const hasWriteAccess = await hasCourseWriteAccess(
        module.courseId,
        userId,
        userRole,
      );
      if (!hasWriteAccess) {
        throw new ForbiddenException(
          'You do not have permission to create sections in this course',
        );
      }
    }

    // Use transaction to create section, knowledge points, and section-kp mappings
    return await db.transaction(async (tx) => {
      // 1. Create the section
      const [section] = await tx
        .insert(sections)
        .values({
          moduleId: createSectionDto.moduleId,
          title: createSectionDto.title,
          orderIndex: createSectionDto.orderIndex,
          createdBy: userId ?? null,
        })
        .returning();

      // 2. Create knowledge points and section-kp mappings if provided
      if (
        createSectionDto.knowledgePoints &&
        createSectionDto.knowledgePoints.length > 0
      ) {
        const sectionKpValues: Array<{
          sectionId: string;
          kpId: string;
          orderIndex: number;
        }> = [];

        // Map to store created knowledge point IDs for prerequisites processing
        const createdKpIds: string[] = [];
        const kpPrerequisitesData: Array<{
          kpId: string;
          prerequisiteKpId: string;
        }> = [];

        // First pass: Create all knowledge points
        for (let i = 0; i < createSectionDto.knowledgePoints.length; i++) {
          const kpData = createSectionDto.knowledgePoints[i];

          // Create the knowledge point
          const [kp] = await tx
            .insert(knowledgePoint)
            .values({
              title: kpData.title,
              description: kpData.description,
              content: kpData.content,
              difficultyLevel: kpData.difficultyLevel,

              createdBy: userId ?? null,
            })
            .returning();

          createdKpIds.push(kp.id);

          // Add to section-kp mapping list
          sectionKpValues.push({
            sectionId: section.id,
            kpId: kp.id,
            orderIndex: i,
          });

          // Collect prerequisites data for later processing
          if (kpData.prerequisites && kpData.prerequisites.length > 0) {
            for (const prereqId of kpData.prerequisites) {
              kpPrerequisitesData.push({
                kpId: kp.id,
                prerequisiteKpId: prereqId,
              });
            }
          }
        }

        // Insert all section-kp mappings
        if (sectionKpValues.length > 0) {
          await tx.insert(sectionKpMap).values(sectionKpValues);
        }

        // Insert all prerequisites
        if (kpPrerequisitesData.length > 0) {
          await tx.insert(kpPrerequisites).values(kpPrerequisitesData);
        }
      }

      return section;
    });
  }

  async findSectionsByModule(
    moduleId: string,
    userId?: string,
    userRole?: string,
  ) {
    await this.findModule(moduleId, userId, userRole);

    const result = await db
      .select()
      .from(sections)
      .where(eq(sections.moduleId, moduleId))
      .orderBy(sections.orderIndex);

    return result;
  }

  async findSection(sectionId: string, userId?: string, userRole?: string) {
    const result = await db
      .select()
      .from(sections)
      .where(eq(sections.id, sectionId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Section not found');
    }

    // Check access permission for teachers
    if (userRole === 'teacher' && userId) {
      const section = result[0];
      const module = await this.findModule(section.moduleId, userId, userRole);
      // findModule already checks course access
    }

    return result[0];
  }

  async getSectionKnowledgePoints(
    sectionId: string,
    userId?: string,
    userRole?: string,
  ) {
    await this.findSection(sectionId, userId, userRole);

    const result = await db
      .select({
        knowledgePoint: knowledgePoint,
        mapping: sectionKpMap,
      })
      .from(sectionKpMap)
      .innerJoin(knowledgePoint, eq(sectionKpMap.kpId, knowledgePoint.id))
      .where(eq(sectionKpMap.sectionId, sectionId))
      .orderBy(sectionKpMap.orderIndex);

    // Fetch prerequisites for each knowledge point
    const kpsWithPrerequisites = await Promise.all(
      result.map(async (row) => {
        const prereqs = await db
          .select({
            prerequisiteKpId: kpPrerequisites.prerequisiteKpId,
          })
          .from(kpPrerequisites)
          .where(eq(kpPrerequisites.kpId, row.knowledgePoint.id));

        return {
          ...row.knowledgePoint,
          prerequisites: prereqs.map((p) => p.prerequisiteKpId),
        };
      }),
    );

    return kpsWithPrerequisites;
  }

  async updateSection(
    sectionId: string,
    updateData: Partial<CreateSectionDto>,
    userId?: string,
    userRole?: string,
  ) {
    const section = await this.findSection(sectionId, userId, userRole);
    const module = await this.findModule(section.moduleId, userId, userRole);

    // Check write access for teachers (can't edit sections in public courses they don't own)
    if (userRole === 'teacher' && userId) {
      const hasWriteAccess = await hasCourseWriteAccess(
        module.courseId,
        userId,
        userRole,
      );
      if (!hasWriteAccess) {
        throw new ForbiddenException(
          'You do not have permission to edit this section',
        );
      }
    }

    const [updated] = await db
      .update(sections)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(sections.id, sectionId))
      .returning();

    return updated;
  }

  async removeSection(sectionId: string, userId?: string, userRole?: string) {
    const section = await this.findSection(sectionId, userId, userRole);
    const module = await this.findModule(section.moduleId, userId, userRole);

    // Check write access for teachers (can't delete sections in public courses they don't own)
    if (userRole === 'teacher' && userId) {
      const hasWriteAccess = await hasCourseWriteAccess(
        module.courseId,
        userId,
        userRole,
      );
      if (!hasWriteAccess) {
        throw new ForbiddenException(
          'You do not have permission to delete this section',
        );
      }
    }

    await db.delete(sections).where(eq(sections.id, sectionId));

    return { message: 'Section deleted successfully' };
  }

  // ==================== COURSE STRUCTURE ====================

  async getCourseStructure(
    courseId: string,
    userId?: string,
    userRole?: string,
  ) {
    const course = await this.findOne(courseId, userId, userRole);

    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.orderIndex);

    const structureWithSections = await Promise.all(
      courseModules.map(async (module) => {
        const moduleSections = await db
          .select()
          .from(sections)
          .where(eq(sections.moduleId, module.id))
          .orderBy(sections.orderIndex);

        // Fetch knowledge points for each section
        const sectionsWithKps = await Promise.all(
          moduleSections.map(async (section) => {
            const kps = await db
              .select({
                kp: knowledgePoint,
                mapping: sectionKpMap,
              })
              .from(sectionKpMap)
              .innerJoin(
                knowledgePoint,
                eq(sectionKpMap.kpId, knowledgePoint.id),
              )
              .where(eq(sectionKpMap.sectionId, section.id))
              .orderBy(sectionKpMap.orderIndex);

            return {
              ...section,
              knowledgePoints: kps.map((row) => row.kp),
            };
          }),
        );

        return {
          ...module,
          sections: sectionsWithKps,
        };
      }),
    );

    return {
      ...course,
      modules: structureWithSections,
    };
  }

  // ==================== TEACHER ASSIGNMENTS ====================

  async assignTeacherToCourse(
    courseId: string,
    teacherId: string,
    role: 'creator' | 'collaborator' = 'collaborator',
  ) {
    // Validate course exists
    await this.findOne(courseId);

    // Validate teacher exists
    const teacherResult = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .limit(1);

    if (teacherResult.length === 0) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if already assigned
    const existing = await db
      .select()
      .from(teacherCourseMap)
      .where(
        and(
          eq(teacherCourseMap.teacherId, teacherId),
          eq(teacherCourseMap.courseId, courseId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Teacher already assigned to this course');
    }

    const [assignment] = await db
      .insert(teacherCourseMap)
      .values({
        teacherId,
        courseId,
        role,
      })
      .returning();

    return assignment;
  }

  async getCourseTeachers(
    courseId: string,
    userId?: string,
    userRole?: string,
  ) {
    await this.findOne(courseId, userId, userRole);

    const result = await db
      .select({
        teacher: teachers,
        assignment: teacherCourseMap,
      })
      .from(teacherCourseMap)
      .innerJoin(teachers, eq(teacherCourseMap.teacherId, teachers.id))
      .where(eq(teacherCourseMap.courseId, courseId));

    return result;
  }

  // ==================== COURSE LEARNING DETAILS ====================

  async getCourseForLearning(
    courseId: string,
    userId?: string,
    userRole?: string,
  ) {
    const course = await this.findOne(courseId, userId, userRole);

    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.orderIndex);

    const structureWithSectionsAndKps = await Promise.all(
      courseModules.map(async (module) => {
        const moduleSections = await db
          .select()
          .from(sections)
          .where(eq(sections.moduleId, module.id))
          .orderBy(sections.orderIndex);

        const sectionsWithKps = await Promise.all(
          moduleSections.map(async (section) => {
            // Get knowledge points for this section
            const kpMappings = await db
              .select({
                kp: knowledgePoint,
                mapping: sectionKpMap,
              })
              .from(sectionKpMap)
              .innerJoin(
                knowledgePoint,
                eq(sectionKpMap.kpId, knowledgePoint.id),
              )
              .where(eq(sectionKpMap.sectionId, section.id))
              .orderBy(sectionKpMap.orderIndex);

            // Get resources for each knowledge point
            const kpsWithResources = await Promise.all(
              kpMappings.map(async (row) => {
                const resources = await db
                  .select()
                  .from(kpResources)
                  .where(eq(kpResources.kpId, row.kp.id))
                  .orderBy(kpResources.orderIndex);

                return {
                  ...row.kp,
                  orderIndex: row.mapping.orderIndex,
                  resources,
                };
              }),
            );

            return {
              ...section,
              knowledgePoints: kpsWithResources,
            };
          }),
        );

        return {
          ...module,
          sections: sectionsWithKps,
        };
      }),
    );

    return {
      ...course,
      modules: structureWithSectionsAndKps,
    };
  }
}
