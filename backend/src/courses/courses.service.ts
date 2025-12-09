import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, desc, SQL } from 'drizzle-orm';
import { db, courses, modules, sections, sectionKpMap, teacherCourseMap, teachers, knowledgePoint, kpPrerequisites } from '../../db';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateSectionDto } from './dto/create-section.dto';

@Injectable()
export class CoursesService {
  // ==================== COURSES ====================

  async create(createCourseDto: CreateCourseDto) {
    const [course] = await db
      .insert(courses)
      .values({
        title: createCourseDto.title,
        description: createCourseDto.description,
        thumbnailUrl: createCourseDto.thumbnailUrl,
        subject: createCourseDto.subject,
        gradeLevel: createCourseDto.gradeLevel,
        active: createCourseDto.active ?? true,
      })
      .returning();

    return course;
  }

  async findAll(gradeLevel?: number, subject?: string, active?: boolean) {
    let query = db.select().from(courses);

    const conditions: SQL[] = [];
    if (gradeLevel) conditions.push(eq(courses.gradeLevel, gradeLevel));
    if (subject) conditions.push(eq(courses.subject, subject));
    if (active !== undefined) conditions.push(eq(courses.active, active));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query.orderBy(desc(courses.createdAt));
    return result;
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Course not found');
    }

    return result[0];
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);

    const updateData: any = { ...updateCourseDto, updatedAt: new Date() };

    const [updated] = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    await db.delete(courses).where(eq(courses.id, id));

    return { message: 'Course deleted successfully' };
  }

  // ==================== MODULES ====================

  async createModule(createModuleDto: CreateModuleDto) {
    // Validate course exists
    await this.findOne(createModuleDto.courseId);

    const [module] = await db
      .insert(modules)
      .values({
        courseId: createModuleDto.courseId,
        title: createModuleDto.title,
        description: createModuleDto.description,
        orderIndex: createModuleDto.orderIndex,
      })
      .returning();

    return module;
  }

  async findModulesByCourse(courseId: string) {
    await this.findOne(courseId);

    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.orderIndex);

    return result;
  }

  async findModule(moduleId: string) {
    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.id, moduleId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Module not found');
    }

    return result[0];
  }

  async updateModule(moduleId: string, updateData: Partial<CreateModuleDto>) {
    await this.findModule(moduleId);

    const [updated] = await db
      .update(modules)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(modules.id, moduleId))
      .returning();

    return updated;
  }

  async removeModule(moduleId: string) {
    await this.findModule(moduleId);

    await db.delete(modules).where(eq(modules.id, moduleId));

    return { message: 'Module deleted successfully' };
  }

  // ==================== SECTIONS ====================

  async createSection(createSectionDto: CreateSectionDto) {
    // Validate module exists
    await this.findModule(createSectionDto.moduleId);

    // Use transaction to create section, knowledge points, and section-kp mappings
    return await db.transaction(async (tx) => {
      // 1. Create the section
      const [section] = await tx
        .insert(sections)
        .values({
          moduleId: createSectionDto.moduleId,
          title: createSectionDto.title,
          summary: createSectionDto.summary,
          orderIndex: createSectionDto.orderIndex,
        })
        .returning();

      // 2. Create knowledge points and section-kp mappings if provided
      if (createSectionDto.knowledgePoints && createSectionDto.knowledgePoints.length > 0) {
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
              difficultyLevel: kpData.difficultyLevel,
              tags: kpData.tags || [],
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

  async findSectionsByModule(moduleId: string) {
    await this.findModule(moduleId);

    const result = await db
      .select()
      .from(sections)
      .where(eq(sections.moduleId, moduleId))
      .orderBy(sections.orderIndex);

    return result;
  }

  async findSection(sectionId: string) {
    const result = await db
      .select()
      .from(sections)
      .where(eq(sections.id, sectionId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Section not found');
    }

    return result[0];
  }

  async getSectionKnowledgePoints(sectionId: string) {
    await this.findSection(sectionId);

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
      })
    );

    return kpsWithPrerequisites;
  }

  async updateSection(sectionId: string, updateData: Partial<CreateSectionDto>) {
    await this.findSection(sectionId);

    const [updated] = await db
      .update(sections)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(sections.id, sectionId))
      .returning();

    return updated;
  }

  async removeSection(sectionId: string) {
    await this.findSection(sectionId);

    await db.delete(sections).where(eq(sections.id, sectionId));

    return { message: 'Section deleted successfully' };
  }

  // ==================== COURSE STRUCTURE ====================

  async getCourseStructure(courseId: string) {
    const course = await this.findOne(courseId);

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

        return {
          ...module,
          sections: moduleSections,
        };
      })
    );

    return {
      ...course,
      modules: structureWithSections,
    };
  }

  // ==================== TEACHER ASSIGNMENTS ====================

  async assignTeacherToCourse(courseId: string, teacherId: string, role: 'creator' | 'collaborator' = 'collaborator') {
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
          eq(teacherCourseMap.courseId, courseId)
        )
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

  async getCourseTeachers(courseId: string) {
    await this.findOne(courseId);

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
}
