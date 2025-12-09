import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import {
  db,
  courses,
  modules,
  sections,
  knowledgePoint,
  sectionKpMap,
  kpResources,
  kpPrerequisites,
  questionBank,
  questionMetadata,
  kpExercises,
} from '../../db';
import { CoursesService } from '../courses/courses.service';
import { KnowledgePointsService } from '../knowledge-points/knowledge-points.service';

@Injectable()
export class ExplorerService {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly knowledgePointsService: KnowledgePointsService,
  ) {}

  /**
   * Get all public courses for explorer
   */
  async getPublicCourses(gradeLevel?: number, subject?: string) {
    const conditions: any[] = [
      eq(courses.visibility, 'public'),
      eq(courses.active, true)
    ];
    
    if (gradeLevel) {
      conditions.push(eq(courses.gradeLevel, gradeLevel));
    }
    if (subject) {
      conditions.push(eq(courses.subject, subject));
    }

    const result = await db
      .select()
      .from(courses)
      .where(and(...conditions))
      .orderBy(courses.createdAt);
    
    return result;
  }

  /**
   * Get public course details
   */
  async getPublicCourseDetails(courseId: string) {
    const course = await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.id, courseId),
          eq(courses.visibility, 'public'),
          eq(courses.active, true)
        )
      )
      .limit(1);

    if (course.length === 0) {
      throw new NotFoundException('Public course not found');
    }

    // Get course structure
    const structure = await this.coursesService.getCourseStructure(courseId);

    return structure;
  }

  /**
   * Clone a public course to teacher's account
   */
  async cloneCourse(courseId: string, teacherId: string) {
    // Verify course is public
    const sourceCourse = await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.id, courseId),
          eq(courses.visibility, 'public'),
          eq(courses.active, true)
        )
      )
      .limit(1);

    if (sourceCourse.length === 0) {
      throw new NotFoundException('Public course not found');
    }

    const source = sourceCourse[0];

    // Check if teacher already cloned this course
    const existingClone = await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.originCourseId, courseId),
          eq(courses.createdBy, teacherId)
        )
      )
      .limit(1);

    if (existingClone.length > 0) {
      throw new BadRequestException('You have already cloned this course');
    }

    // Use transaction for atomic clone operation
    return await db.transaction(async (tx) => {
      // Mapping objects
      const moduleMap: Record<string, string> = {};
      const sectionMap: Record<string, string> = {};
      const kpMap: Record<string, string> = {};
      const questionMap: Record<string, string> = {};

      // 1. Clone course
      const newCourseResult = await tx
        .insert(courses)
        .values({
          title: `${source.title} (Copy)`,
          description: source.description,
          thumbnailUrl: source.thumbnailUrl,
          subject: source.subject,
          gradeLevel: source.gradeLevel,
          active: true,
          visibility: 'private',
          originCourseId: source.id,
          createdBy: teacherId,
          updatedBy: teacherId,
        })
        .returning();
      const newCourse = newCourseResult[0];

      // 2. Clone modules
      const sourceModules = await tx
        .select()
        .from(modules)
        .where(eq(modules.courseId, courseId))
        .orderBy(modules.orderIndex);

      for (const sourceModule of sourceModules) {
        const newModuleResult = await tx
          .insert(modules)
          .values({
            courseId: newCourse.id,
            title: sourceModule.title,
            description: sourceModule.description,
            orderIndex: sourceModule.orderIndex,
            createdBy: teacherId,
          })
          .returning();
        const newModule = newModuleResult[0];

        moduleMap[sourceModule.id] = newModule.id;

        // 3. Clone sections
        const sourceSections = await tx
          .select()
          .from(sections)
          .where(eq(sections.moduleId, sourceModule.id))
          .orderBy(sections.orderIndex);

        for (const sourceSection of sourceSections) {
          const newSectionResult = await tx
            .insert(sections)
            .values({
              moduleId: newModule.id,
              title: sourceSection.title,
              summary: sourceSection.summary,
              orderIndex: sourceSection.orderIndex,
              createdBy: teacherId,
            })
            .returning();
          const newSection = newSectionResult[0];

          sectionMap[sourceSection.id] = newSection.id;

          // 4. Get knowledge points for this section
          const sectionKps = await tx
            .select()
            .from(sectionKpMap)
            .where(eq(sectionKpMap.sectionId, sourceSection.id))
            .orderBy(sectionKpMap.orderIndex);

          for (const sectionKp of sectionKps) {
            // Check if KP already cloned
            if (kpMap[sectionKp.kpId]) {
              // Just create the mapping
              await tx.insert(sectionKpMap).values({
                sectionId: newSection.id,
                kpId: kpMap[sectionKp.kpId],
                orderIndex: sectionKp.orderIndex,
              });
              continue;
            }

            // Get source KP
            const sourceKp = await tx
              .select()
              .from(knowledgePoint)
              .where(eq(knowledgePoint.id, sectionKp.kpId))
              .limit(1);

            if (sourceKp.length === 0) continue;

            const kp = sourceKp[0];

            // Clone KP
            const newKpResult = await tx
              .insert(knowledgePoint)
              .values({
                title: kp.title,
                description: kp.description,
                difficultyLevel: kp.difficultyLevel,
                tags: kp.tags,
                createdBy: teacherId,
              })
              .returning();
            const newKp = newKpResult[0];

            kpMap[kp.id] = newKp.id;

            // Create section-KP mapping
            await tx.insert(sectionKpMap).values({
              sectionId: newSection.id,
              kpId: newKp.id,
              orderIndex: sectionKp.orderIndex,
            });

            // 5. Clone KP prerequisites
            const sourcePrereqs = await tx
              .select()
              .from(kpPrerequisites)
              .where(eq(kpPrerequisites.kpId, kp.id));

            for (const prereq of sourcePrereqs) {
              // If prerequisite KP is already cloned, use it; otherwise skip (will be handled when cloning that KP)
              if (kpMap[prereq.prerequisiteKpId]) {
                await tx.insert(kpPrerequisites).values({
                  kpId: newKp.id,
                  prerequisiteKpId: kpMap[prereq.prerequisiteKpId],
                });
              }
            }

            // 6. Clone KP resources
            const sourceResources = await tx
              .select()
              .from(kpResources)
              .where(eq(kpResources.kpId, kp.id))
              .orderBy(kpResources.orderIndex);

            for (const resource of sourceResources) {
              await tx.insert(kpResources).values({
                kpId: newKp.id,
                resourceType: resource.resourceType,
                url: resource.url,
                title: resource.title,
                description: resource.description,
                orderIndex: resource.orderIndex,
                createdBy: teacherId,
              });
            }

            // 7. Clone questions and KP exercises
            const sourceExercises = await tx
              .select()
              .from(kpExercises)
              .where(eq(kpExercises.kpId, kp.id));

            for (const exercise of sourceExercises) {
              // Check if question already cloned
              if (questionMap[exercise.questionId]) {
                await tx.insert(kpExercises).values({
                  kpId: newKp.id,
                  questionId: questionMap[exercise.questionId],
                  difficulty: exercise.difficulty,
                });
                continue;
              }

              // Get source question
              const sourceQuestion = await tx
                .select()
                .from(questionBank)
                .where(eq(questionBank.id, exercise.questionId))
                .limit(1);

              if (sourceQuestion.length === 0) continue;

              const question = sourceQuestion[0];

              // Clone question
              const newQuestionResult = await tx
                .insert(questionBank)
                .values({
                  questionText: question.questionText,
                  options: question.options,
                  correctAnswer: question.correctAnswer,
                  questionType: question.questionType,
                  isActive: question.isActive,
                  createdBy: teacherId,
                })
                .returning();
              const newQuestion = newQuestionResult[0];

              questionMap[question.id] = newQuestion.id;

              // Clone question metadata
              const sourceMetadata = await tx
                .select()
                .from(questionMetadata)
                .where(eq(questionMetadata.questionId, question.id))
                .limit(1);

              if (sourceMetadata.length > 0) {
                const metadata = sourceMetadata[0];
                await tx.insert(questionMetadata).values({
                  questionId: newQuestion.id,
                  difficulty: metadata.difficulty,
                  discrimination: metadata.discrimination,
                  skillId: newKp.id, // Use new KP ID
                  tags: metadata.tags,
                  estimatedTime: metadata.estimatedTime,
                });
              }

              // Create KP exercise link
              await tx.insert(kpExercises).values({
                kpId: newKp.id,
                questionId: newQuestion.id,
                difficulty: exercise.difficulty,
              });
            }
          }
        }
      }

      return newCourse;
    });
  }
}

