import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, and, inArray, or } from 'drizzle-orm';
import {
  db,
  knowledgePoint,
  kpResources,
  kpPrerequisites,
  kpExercises,
  sectionKpMap,
  sections,
} from '../../db';
import { CreateKnowledgePointDto } from './dto/create-knowledge-point.dto';
import { UpdateKnowledgePointDto } from './dto/update-knowledge-point.dto';
import { AssignToSectionDto } from './dto/assign-to-section.dto';
import { getAccessibleKnowledgePointIds, getAccessibleSectionIds } from '../courses/helpers/course-access.helper';

@Injectable()
export class KnowledgePointsService {
  // ==================== KNOWLEDGE POINTS ====================

  async create(createKpDto: CreateKnowledgePointDto, userId?: string) {
    // Validate prerequisite KPs exist if provided
    if (createKpDto.prerequisites && createKpDto.prerequisites.length > 0) {
      const existingKps = await db
        .select()
        .from(knowledgePoint)
        .where(inArray(knowledgePoint.id, createKpDto.prerequisites));

      if (existingKps.length !== createKpDto.prerequisites.length) {
        throw new BadRequestException('One or more prerequisite KPs do not exist');
      }
    }

    // Use transaction to create KP with related entities
    return await db.transaction(async (tx) => {
      // 1. Create the knowledge point
      const [kp] = await tx
        .insert(knowledgePoint)
        .values({
          title: createKpDto.title,
          description: createKpDto.description,
          difficultyLevel: createKpDto.difficultyLevel,
          tags: createKpDto.tags,
          createdBy: userId ?? null,
        })
        .returning();

      // 2. Create prerequisites if provided
      if (createKpDto.prerequisites && createKpDto.prerequisites.length > 0) {
        const prerequisiteValues = createKpDto.prerequisites.map((prereqId) => ({
          kpId: kp.id,
          prerequisiteKpId: prereqId,
        }));

        await tx.insert(kpPrerequisites).values(prerequisiteValues);
      }

      // 3. Create resources if provided
      if (createKpDto.resources && createKpDto.resources.length > 0) {
        const resourceValues = createKpDto.resources.map((resource) => {
          const values: any = {
            kpId: kp.id,
            resourceType: resource.resourceType,
            url: resource.url,
            title: resource.title,
            orderIndex: resource.orderIndex,
            createdBy: userId ?? null,
          };

          // Only include description if it's defined
          if (resource.description !== undefined) {
            values.description = resource.description;
          }

          return values;
        });

        await tx.insert(kpResources).values(resourceValues);
      }

      return kp;
    });
  }

  async findAll(userId?: string, userRole?: string) {
    // Filter by role: teacher only sees their KPs or KPs from accessible sections
    if (userRole === 'teacher' && userId) {
      const accessibleKpIds = await getAccessibleKnowledgePointIds(userId, userRole);
      if (accessibleKpIds.length === 0) {
        return [];
      }
      const result = await db
        .select()
        .from(knowledgePoint)
        .where(inArray(knowledgePoint.id, accessibleKpIds));
      return result;
    }

    // Admin sees all
    const result = await db.select().from(knowledgePoint);
    return result;
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const result = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    // Check access permission for teachers
    if (userRole === 'teacher' && userId) {
      const accessibleKpIds = await getAccessibleKnowledgePointIds(userId, userRole);
      if (!accessibleKpIds.includes(id)) {
        throw new ForbiddenException('You do not have access to this knowledge point');
      }
    }

    return result[0];
  }

  async findOneWithDetails(id: string, userId?: string, userRole?: string) {
    const kp = await this.findOne(id, userId, userRole);

    // Get prerequisites
    const prereqs = await db
      .select({
        prerequisite: knowledgePoint,
      })
      .from(kpPrerequisites)
      .innerJoin(
        knowledgePoint,
        eq(kpPrerequisites.prerequisiteKpId, knowledgePoint.id)
      )
      .where(eq(kpPrerequisites.kpId, id));

    // Get resources
    const resources = await db
      .select()
      .from(kpResources)
      .where(eq(kpResources.kpId, id))
      .orderBy(kpResources.orderIndex);

    // Get exercises
    const exercises = await db
      .select()
      .from(kpExercises)
      .where(eq(kpExercises.kpId, id));

    return {
      ...kp,
      prerequisites: prereqs.map((p) => p.prerequisite),
      resources,
      exerciseCount: exercises.length,
    };
  }

  async update(id: string, updateKpDto: UpdateKnowledgePointDto, userId?: string, userRole?: string) {
    await this.findOne(id, userId, userRole);

    // Validate prerequisite KPs if provided
    if (updateKpDto.prerequisites && updateKpDto.prerequisites.length > 0) {
      const existingKps = await db
        .select()
        .from(knowledgePoint)
        .where(inArray(knowledgePoint.id, updateKpDto.prerequisites));

      if (existingKps.length !== updateKpDto.prerequisites.length) {
        throw new BadRequestException('One or more prerequisite KPs do not exist');
      }
    }

    return await db.transaction(async (tx) => {
      // 1. Update the knowledge point
      const updateData: any = { updatedAt: new Date() };
      if (updateKpDto.title) updateData.title = updateKpDto.title;
      if (updateKpDto.description) updateData.description = updateKpDto.description;
      if (updateKpDto.difficultyLevel) updateData.difficultyLevel = updateKpDto.difficultyLevel;
      if (updateKpDto.tags) updateData.tags = updateKpDto.tags;

      const [updated] = await tx
        .update(knowledgePoint)
        .set(updateData)
        .where(eq(knowledgePoint.id, id))
        .returning();

      // 2. Update prerequisites if provided
      if (updateKpDto.prerequisites !== undefined) {
        // Delete existing prerequisites
        await tx.delete(kpPrerequisites).where(eq(kpPrerequisites.kpId, id));

        // Insert new prerequisites
        if (updateKpDto.prerequisites.length > 0) {
          const prerequisiteValues = updateKpDto.prerequisites.map((prereqId) => ({
            kpId: id,
            prerequisiteKpId: prereqId,
          }));

          await tx.insert(kpPrerequisites).values(prerequisiteValues);
        }
      }

      // 3. Update resources if provided
      if (updateKpDto.resources !== undefined) {
        // Delete existing resources
        await tx.delete(kpResources).where(eq(kpResources.kpId, id));

        // Insert new resources
        if (updateKpDto.resources.length > 0) {
          const resourceValues = updateKpDto.resources.map((resource) => {
            const values: any = {
              kpId: id,
              resourceType: resource.resourceType,
              url: resource.url,
              title: resource.title,
              orderIndex: resource.orderIndex,
              createdBy: userId ?? null,
            };

            // Only include description if it's defined
            if (resource.description !== undefined) {
              values.description = resource.description;
            }

            return values;
          });

          await tx.insert(kpResources).values(resourceValues);
        }
      }

      return updated;
    });
  }

  async remove(id: string, userId?: string, userRole?: string) {
    await this.findOne(id, userId, userRole);

    await db.delete(knowledgePoint).where(eq(knowledgePoint.id, id));

    return { message: 'Knowledge Point deleted successfully' };
  }

  // ==================== SECTION ASSIGNMENTS ====================

  async assignToSection(assignDto: AssignToSectionDto, userId?: string, userRole?: string) {
    // Validate section exists and check access
    const sectionResult = await db
      .select()
      .from(sections)
      .where(eq(sections.id, assignDto.sectionId))
      .limit(1);

    if (sectionResult.length === 0) {
      throw new NotFoundException('Section not found');
    }

    // Check section access for teachers
    if (userRole === 'teacher' && userId) {
      const accessibleSectionIds = await getAccessibleSectionIds(userId, userRole);
      if (!accessibleSectionIds.includes(assignDto.sectionId)) {
        throw new ForbiddenException('You do not have access to this section');
      }
    }

    // Validate KP exists and check access
    await this.findOne(assignDto.kpId, userId, userRole);

    // Check if already assigned
    const existing = await db
      .select()
      .from(sectionKpMap)
      .where(
        and(
          eq(sectionKpMap.sectionId, assignDto.sectionId),
          eq(sectionKpMap.kpId, assignDto.kpId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('KP already assigned to this section');
    }

    const [assignment] = await db
      .insert(sectionKpMap)
      .values({
        sectionId: assignDto.sectionId,
        kpId: assignDto.kpId,
        orderIndex: assignDto.orderIndex,
      })
      .returning();

    return assignment;
  }

  async removeFromSection(sectionId: string, kpId: string, userId?: string, userRole?: string) {
    // Check section access for teachers
    if (userRole === 'teacher' && userId) {
      const accessibleSectionIds = await getAccessibleSectionIds(userId, userRole);
      if (!accessibleSectionIds.includes(sectionId)) {
        throw new ForbiddenException('You do not have access to this section');
      }
    }
    const result = await db
      .delete(sectionKpMap)
      .where(
        and(
          eq(sectionKpMap.sectionId, sectionId),
          eq(sectionKpMap.kpId, kpId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('KP not assigned to this section');
    }

    return { message: 'KP removed from section successfully' };
  }

  async getKpsBySection(sectionId: string, userId?: string, userRole?: string) {
    // Check section access for teachers
    if (userRole === 'teacher' && userId) {
      const accessibleSectionIds = await getAccessibleSectionIds(userId, userRole);
      if (!accessibleSectionIds.includes(sectionId)) {
        throw new ForbiddenException('You do not have access to this section');
      }
    }
    const result = await db
      .select({
        kp: knowledgePoint,
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
          .where(eq(kpPrerequisites.kpId, row.kp.id));

        return {
          ...row.kp,
          orderIndex: row.mapping.orderIndex,
          prerequisites: prereqs.map((p) => p.prerequisiteKpId),
        };
      })
    );

    return kpsWithPrerequisites;
  }

  // ==================== PREREQUISITES ====================

  async getPrerequisites(kpId: string, userId?: string, userRole?: string) {
    await this.findOne(kpId, userId, userRole);

    const result = await db
      .select({
        prerequisite: knowledgePoint,
      })
      .from(kpPrerequisites)
      .innerJoin(
        knowledgePoint,
        eq(kpPrerequisites.prerequisiteKpId, knowledgePoint.id)
      )
      .where(eq(kpPrerequisites.kpId, kpId));

    return result.map((row) => row.prerequisite);
  }

  async getDependents(kpId: string, userId?: string, userRole?: string) {
    await this.findOne(kpId, userId, userRole);

    const result = await db
      .select({
        dependent: knowledgePoint,
      })
      .from(kpPrerequisites)
      .innerJoin(knowledgePoint, eq(kpPrerequisites.kpId, knowledgePoint.id))
      .where(eq(kpPrerequisites.prerequisiteKpId, kpId));

    return result.map((row) => row.dependent);
  }

  // ==================== RESOURCES ====================

  async getResources(kpId: string, userId?: string, userRole?: string) {
    await this.findOne(kpId, userId, userRole);

    const resources = await db
      .select()
      .from(kpResources)
      .where(eq(kpResources.kpId, kpId))
      .orderBy(kpResources.orderIndex);

    return resources;
  }
}
