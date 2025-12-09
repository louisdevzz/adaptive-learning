import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
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

@Injectable()
export class KnowledgePointsService {
  // ==================== KNOWLEDGE POINTS ====================

  async create(createKpDto: CreateKnowledgePointDto) {
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

  async findAll() {
    const result = await db.select().from(knowledgePoint);
    return result;
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    return result[0];
  }

  async findOneWithDetails(id: string) {
    const kp = await this.findOne(id);

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

  async update(id: string, updateKpDto: UpdateKnowledgePointDto) {
    await this.findOne(id);

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

  async remove(id: string) {
    await this.findOne(id);

    await db.delete(knowledgePoint).where(eq(knowledgePoint.id, id));

    return { message: 'Knowledge Point deleted successfully' };
  }

  // ==================== SECTION ASSIGNMENTS ====================

  async assignToSection(assignDto: AssignToSectionDto) {
    // Validate section exists
    const sectionResult = await db
      .select()
      .from(sections)
      .where(eq(sections.id, assignDto.sectionId))
      .limit(1);

    if (sectionResult.length === 0) {
      throw new NotFoundException('Section not found');
    }

    // Validate KP exists
    await this.findOne(assignDto.kpId);

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

  async removeFromSection(sectionId: string, kpId: string) {
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

  async getKpsBySection(sectionId: string) {
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

  async getPrerequisites(kpId: string) {
    await this.findOne(kpId);

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

  async getDependents(kpId: string) {
    await this.findOne(kpId);

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

  async getResources(kpId: string) {
    await this.findOne(kpId);

    const resources = await db
      .select()
      .from(kpResources)
      .where(eq(kpResources.kpId, kpId))
      .orderBy(kpResources.orderIndex);

    return resources;
  }
}
