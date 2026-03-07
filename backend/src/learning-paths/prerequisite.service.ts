import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { db, knowledgePoint, kpPrerequisites } from '../../db';

interface KnowledgePointWithPrereqs {
  id: string;
  title: string;
  difficultyLevel: number;
  prerequisites: string[];
}

@Injectable()
export class PrerequisiteService {
  /**
   * Build a prerequisite chain using topological sort
   * Returns KPs in order: prerequisites first, then dependent KPs
   */
  async buildPrerequisiteChain(kpIds: string[]): Promise<string[]> {
    // Get all KPs with their prerequisites
    const kpData = await this.getKnowledgePointsWithPrereqs(kpIds);

    // Build adjacency list and calculate in-degrees
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();
    const allKpIds = new Set<string>();

    // Initialize
    for (const kp of kpData) {
      allKpIds.add(kp.id);
      inDegree.set(kp.id, 0);
      if (!graph.has(kp.id)) {
        graph.set(kp.id, new Set());
      }
    }

    // Build graph: prerequisite -> dependent
    for (const kp of kpData) {
      for (const prereqId of kp.prerequisites) {
        // Only include if prerequisite is in our target set
        if (allKpIds.has(prereqId)) {
          if (!graph.has(prereqId)) {
            graph.set(prereqId, new Set());
          }
          graph.get(prereqId)!.add(kp.id);
          inDegree.set(kp.id, (inDegree.get(kp.id) || 0) + 1);
        }
      }
    }

    // Kahn's algorithm for topological sort
    const queue: string[] = [];
    const result: string[] = [];

    // Start with nodes having no prerequisites
    for (const [kpId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(kpId);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const dependents = graph.get(current) || new Set();
      for (const dependent of dependents) {
        const newDegree = (inDegree.get(dependent) || 0) - 1;
        inDegree.set(dependent, newDegree);

        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    // Check for cycles
    if (result.length !== allKpIds.size) {
      // Cycle detected, return original order as fallback
      return kpIds;
    }

    return result;
  }

  /**
   * Get all prerequisites recursively (including nested prerequisites)
   */
  async getAllPrerequisites(
    kpId: string,
    visited = new Set<string>(),
  ): Promise<string[]> {
    if (visited.has(kpId)) {
      return [];
    }

    visited.add(kpId);

    const prereqs = await db
      .select({
        prerequisiteKpId: kpPrerequisites.prerequisiteKpId,
      })
      .from(kpPrerequisites)
      .where(eq(kpPrerequisites.kpId, kpId));

    const result: string[] = [];

    for (const { prerequisiteKpId } of prereqs) {
      // Recursively get prerequisites of prerequisites
      const nestedPrereqs = await this.getAllPrerequisites(
        prerequisiteKpId,
        visited,
      );
      result.push(...nestedPrereqs);
      result.push(prerequisiteKpId);
    }

    return [...new Set(result)]; // Remove duplicates
  }

  /**
   * Add missing prerequisites to a list of KPs
   * Returns expanded list including all prerequisites
   */
  async expandWithPrerequisites(kpIds: string[]): Promise<string[]> {
    const expanded = new Set<string>();

    for (const kpId of kpIds) {
      const prereqs = await this.getAllPrerequisites(kpId);
      for (const prereq of prereqs) {
        expanded.add(prereq);
      }
      expanded.add(kpId);
    }

    // Sort by topological order
    return this.buildPrerequisiteChain([...expanded]);
  }

  /**
   * Get knowledge points with their prerequisites
   */
  private async getKnowledgePointsWithPrereqs(
    kpIds: string[],
  ): Promise<KnowledgePointWithPrereqs[]> {
    if (kpIds.length === 0) {
      return [];
    }

    const kps = await db
      .select({
        id: knowledgePoint.id,
        title: knowledgePoint.title,
        difficultyLevel: knowledgePoint.difficultyLevel,
      })
      .from(knowledgePoint)
      .where(inArray(knowledgePoint.id, kpIds));

    // Batch fetch all prerequisites in a single query
    const allPrereqs = await db
      .select({
        kpId: kpPrerequisites.kpId,
        prerequisiteKpId: kpPrerequisites.prerequisiteKpId,
      })
      .from(kpPrerequisites)
      .where(inArray(kpPrerequisites.kpId, kpIds));

    // Group prerequisites by kpId
    const prereqsByKpId = new Map<string, string[]>();
    for (const prereq of allPrereqs) {
      if (!prereqsByKpId.has(prereq.kpId)) {
        prereqsByKpId.set(prereq.kpId, []);
      }
      prereqsByKpId.get(prereq.kpId)!.push(prereq.prerequisiteKpId);
    }

    return kps.map((kp) => ({
      id: kp.id,
      title: kp.title,
      difficultyLevel: kp.difficultyLevel,
      prerequisites: prereqsByKpId.get(kp.id) || [],
    }));
  }

  /**
   * Check if a student has mastered all prerequisites for a KP
   */
  async hasCompletedPrerequisites(
    studentId: string,
    kpId: string,
    getMasteryScore: (
      studentId: string,
      kpId: string,
    ) => Promise<number | null>,
  ): Promise<boolean> {
    const prereqs = await this.getAllPrerequisites(kpId);

    if (prereqs.length === 0) {
      return true;
    }

    // Check if all prerequisites have mastery >= 60
    for (const prereqId of prereqs) {
      const masteryScore = await getMasteryScore(studentId, prereqId);
      if (masteryScore === null || masteryScore < 60) {
        return false;
      }
    }

    return true;
  }
}
