import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import {
  db,
  learningPath,
  learningPathItems,
  students,
  knowledgePoint,
  sections,
  assignments,
} from '../../db';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';

@Injectable()
export class LearningPathsService {
  // ==================== LEARNING PATHS ====================

  async create(createDto: CreateLearningPathDto) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, createDto.studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Validate items if provided
    if (createDto.items && createDto.items.length > 0) {
      for (const item of createDto.items) {
        await this.validateItem(item.itemType, item.itemId);
      }
    }

    // Use transaction to create learning path with items
    return await db.transaction(async (tx) => {
      // 1. Create the learning path
      const [path] = await tx
        .insert(learningPath)
        .values({
          studentId: createDto.studentId,
          createdBy: createDto.createdBy,
          title: createDto.title,
          description: createDto.description,
          status: createDto.status ?? 'active',
        })
        .returning();

      // 2. Create learning path items if provided
      if (createDto.items && createDto.items.length > 0) {
        const itemValues = createDto.items.map((item) => ({
          learningPathId: path.id,
          itemType: item.itemType,
          itemId: item.itemId,
          orderIndex: item.orderIndex,
          status: item.status ?? 'not_started',
        }));

        await tx.insert(learningPathItems).values(itemValues);
      }

      return path;
    });
  }

  async findAll(studentId?: string, status?: string) {
    let query = db.select().from(learningPath);

    const conditions: SQL[] = [];
    if (studentId) conditions.push(eq(learningPath.studentId, studentId));
    if (status) conditions.push(eq(learningPath.status, status as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(learningPath)
      .where(eq(learningPath.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Learning path not found');
    }

    return result[0];
  }

  async findOneWithItems(id: string) {
    const path = await this.findOne(id);

    const items = await db
      .select()
      .from(learningPathItems)
      .where(eq(learningPathItems.learningPathId, id))
      .orderBy(learningPathItems.orderIndex);

    return {
      ...path,
      items,
    };
  }

  async update(id: string, updateDto: UpdateLearningPathDto) {
    await this.findOne(id);

    // Validate student if provided
    if (updateDto.studentId) {
      const studentResult = await db
        .select()
        .from(students)
        .where(eq(students.id, updateDto.studentId))
        .limit(1);

      if (studentResult.length === 0) {
        throw new NotFoundException('Student not found');
      }
    }

    // Validate items if provided
    if (updateDto.items) {
      for (const item of updateDto.items) {
        await this.validateItem(item.itemType, item.itemId);
      }
    }

    return await db.transaction(async (tx) => {
      // 1. Update the learning path
      const updateData: any = { updatedAt: new Date() };
      if (updateDto.studentId) updateData.studentId = updateDto.studentId;
      if (updateDto.createdBy) updateData.createdBy = updateDto.createdBy;
      if (updateDto.title) updateData.title = updateDto.title;
      if (updateDto.description) updateData.description = updateDto.description;
      if (updateDto.status) updateData.status = updateDto.status;

      const [updated] = await tx
        .update(learningPath)
        .set(updateData)
        .where(eq(learningPath.id, id))
        .returning();

      // 2. Update items if provided
      if (updateDto.items !== undefined) {
        // Delete existing items
        await tx.delete(learningPathItems).where(eq(learningPathItems.learningPathId, id));

        // Insert new items
        if (updateDto.items.length > 0) {
          const itemValues = updateDto.items.map((item) => ({
            learningPathId: id,
            itemType: item.itemType,
            itemId: item.itemId,
            orderIndex: item.orderIndex,
            status: item.status ?? 'not_started',
          }));

          await tx.insert(learningPathItems).values(itemValues);
        }
      }

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await db.delete(learningPath).where(eq(learningPath.id, id));

    return { message: 'Learning path deleted successfully' };
  }

  // ==================== LEARNING PATH ITEMS ====================

  async updateItemStatus(pathId: string, itemId: string, status: 'not_started' | 'in_progress' | 'completed') {
    await this.findOne(pathId);

    const [updated] = await db
      .update(learningPathItems)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(learningPathItems.learningPathId, pathId),
          eq(learningPathItems.id, itemId)
        )
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Learning path item not found');
    }

    return updated;
  }

  async getPathItems(pathId: string) {
    await this.findOne(pathId);

    const items = await db
      .select()
      .from(learningPathItems)
      .where(eq(learningPathItems.learningPathId, pathId))
      .orderBy(learningPathItems.orderIndex);

    return items;
  }

  // ==================== HELPERS ====================

  private async validateItem(itemType: string, itemId: string) {
    let table;
    switch (itemType) {
      case 'kp':
        table = knowledgePoint;
        break;
      case 'section':
        table = sections;
        break;
      case 'assignment':
        table = assignments;
        break;
      default:
        throw new BadRequestException(`Invalid item type: ${itemType}`);
    }

    const result = await db
      .select()
      .from(table)
      .where(eq(table.id, itemId))
      .limit(1);

    if (result.length === 0) {
      throw new BadRequestException(`${itemType} with id ${itemId} not found`);
    }
  }
}
