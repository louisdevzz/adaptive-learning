import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
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
import {
  getAccessibleKnowledgePointIds,
  getAccessibleSectionIds,
} from '../courses/helpers/course-access.helper';
import { GenerateContentDto } from './dto/generate-content.dto';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';

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
        throw new BadRequestException(
          'One or more prerequisite KPs do not exist',
        );
      }
    }

    // Use transaction to create KP with related entities
    return await db.transaction(async (tx) => {
      // Merge questions into content object if provided
      const content = {
        ...createKpDto.content,
        ...(createKpDto.questions && { questions: createKpDto.questions }),
      };

      // 1. Create the knowledge point
      const [kp] = await tx
        .insert(knowledgePoint)
        .values({
          title: createKpDto.title,
          description: createKpDto.description || '',
          content: content,
          difficultyLevel: createKpDto.difficultyLevel,

          createdBy: userId ?? null,
        })
        .returning();

      // 2. Create prerequisites if provided
      if (createKpDto.prerequisites && createKpDto.prerequisites.length > 0) {
        const prerequisiteValues = createKpDto.prerequisites.map(
          (prereqId) => ({
            kpId: kp.id,
            prerequisiteKpId: prereqId,
          }),
        );

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
      const accessibleKpIds = await getAccessibleKnowledgePointIds(
        userId,
        userRole,
      );
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
      const accessibleKpIds = await getAccessibleKnowledgePointIds(
        userId,
        userRole,
      );
      if (!accessibleKpIds.includes(id)) {
        throw new ForbiddenException(
          'You do not have access to this knowledge point',
        );
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
        eq(kpPrerequisites.prerequisiteKpId, knowledgePoint.id),
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

  async update(
    id: string,
    updateKpDto: UpdateKnowledgePointDto,
    userId?: string,
    userRole?: string,
  ) {
    await this.findOne(id, userId, userRole);

    // Validate prerequisite KPs if provided
    if (updateKpDto.prerequisites && updateKpDto.prerequisites.length > 0) {
      const existingKps = await db
        .select()
        .from(knowledgePoint)
        .where(inArray(knowledgePoint.id, updateKpDto.prerequisites));

      if (existingKps.length !== updateKpDto.prerequisites.length) {
        throw new BadRequestException(
          'One or more prerequisite KPs do not exist',
        );
      }
    }

    return await db.transaction(async (tx) => {
      // 1. Update the knowledge point
      const updateData: any = { updatedAt: new Date() };
      if (updateKpDto.title) updateData.title = updateKpDto.title;
      if (updateKpDto.description !== undefined)
        updateData.description = updateKpDto.description;

      // Merge questions into content if provided
      if (updateKpDto.content !== undefined) {
        updateData.content = {
          ...updateKpDto.content,
          ...(updateKpDto.questions && { questions: updateKpDto.questions }),
        };
      }

      if (updateKpDto.difficultyLevel)
        updateData.difficultyLevel = updateKpDto.difficultyLevel;

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
          const prerequisiteValues = updateKpDto.prerequisites.map(
            (prereqId) => ({
              kpId: id,
              prerequisiteKpId: prereqId,
            }),
          );

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

  async assignToSection(
    assignDto: AssignToSectionDto,
    userId?: string,
    userRole?: string,
  ) {
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
      const accessibleSectionIds = await getAccessibleSectionIds(
        userId,
        userRole,
      );
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
          eq(sectionKpMap.kpId, assignDto.kpId),
        ),
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

  async removeFromSection(
    sectionId: string,
    kpId: string,
    userId?: string,
    userRole?: string,
  ) {
    // Check section access for teachers
    if (userRole === 'teacher' && userId) {
      const accessibleSectionIds = await getAccessibleSectionIds(
        userId,
        userRole,
      );
      if (!accessibleSectionIds.includes(sectionId)) {
        throw new ForbiddenException('You do not have access to this section');
      }
    }
    const result = await db
      .delete(sectionKpMap)
      .where(
        and(eq(sectionKpMap.sectionId, sectionId), eq(sectionKpMap.kpId, kpId)),
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
      const accessibleSectionIds = await getAccessibleSectionIds(
        userId,
        userRole,
      );
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
      }),
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
        eq(kpPrerequisites.prerequisiteKpId, knowledgePoint.id),
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

  // ==================== AI CONTENT GENERATION ====================

  async generateContent(generateDto: GenerateContentDto) {
    // Build prompt for visualization based on theory content
    let prompt = `Create an interactive visualization/game for the topic "${generateDto.topic}".

    Theory Content:
    ${generateDto.theoryContent || generateDto.description || 'No theory content provided'}

    ${generateDto.prompt ? `Additional Requirements:\n${generateDto.prompt}\n` : ''}

    CRITICAL REQUIREMENTS - YOU MUST FOLLOW THESE EXACTLY:

    1. OUTPUT FORMAT:
       - Output ONLY raw HTML starting with <div> and ending with </div>
       - Do NOT wrap in markdown code blocks (\`\`\`html or \`\`\`)
       - Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags

    2. CSS STYLING (MUST BE SCOPED):
       - Use <style scoped> tag inside the root <div>
       - ALL CSS selectors MUST use a unique class prefix like ".viz-container-{random-id}"
       - Example: .viz-container-abc123 .button { ... }
       - This prevents CSS conflicts with the main website

    3. JAVASCRIPT (MUST BE SELF-CONTAINED):
       - Use <script> tag inside the root <div>
       - Wrap ALL code in an Immediately Invoked Function Expression (IIFE):
         (function() {
           // All your code here
         })();
       - Define ALL functions INSIDE the IIFE before using them
       - Do NOT call functions that are not defined
       - Use vanilla JavaScript only - NO external libraries
       - Use const/let for all variables (no global pollution)

    4. STRUCTURE EXAMPLE:
       <div class="viz-container-abc123">
         <style scoped>
           .viz-container-abc123 {
             width: 100%;
             padding: 20px;
           }
           .viz-container-abc123 .button {
             background: #007bff;
             color: white;
             border: none;
             padding: 10px 20px;
             cursor: pointer;
           }
         </style>

         <div class="content">
           <!-- Your interactive elements here -->
         </div>

         <script>
           (function() {
             // Get container
             const container = document.currentScript.parentElement;

             // Define ALL helper functions first
             function updateDisplay() {
               // Implementation
             }

             function handleClick(event) {
               // Implementation
             }

             // Then use them
             const button = container.querySelector('.button');
             button.addEventListener('click', handleClick);

             // Initialize
             updateDisplay();
           })();
         </script>
       </div>

    5. FUNCTIONALITY:
       - Make it interactive (buttons, sliders, animations)
       - Clearly demonstrate the concept from theory
       - Use Canvas API for graphics if needed
       - Add clear labels and instructions
       - Make it visually appealing and educational

    6. IMPORTANT - FUNCTION DEFINITIONS:
       - ALWAYS define functions BEFORE calling them
       - All event handlers must be defined functions
       - No references to undefined variables or functions
       - Test that all code paths work

    Output the complete, working HTML now:`;

    try {
      // Initialize AI model based on selection
      let model;
      if (generateDto.aiModel === 'openai') {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
          throw new BadRequestException('OpenAI API key is not configured');
        }
        model = new ChatOpenAI({
          modelName: 'gpt-4o-mini',
          temperature: 0.7,
          apiKey: openaiApiKey,
        });
      } else {
        const googleApiKey = process.env.GOOGLE_API_KEY;
        if (!googleApiKey) {
          throw new BadRequestException('Google API key is not configured');
        }
        model = new ChatGoogleGenerativeAI({
          model: 'gemini-1.5-flash',
          temperature: 0.7,
          apiKey: googleApiKey,
        });
      }

      // Generate content
      const response = await model.invoke([new HumanMessage(prompt)]);
      let content = response.content as string;

      // Clean up markdown code blocks if present
      content = content.replace(/```html/g, '').replace(/```/g, '');

      return {
        content: content.trim(),
        type: generateDto.contentType,
      };
    } catch (error) {
      console.error('AI content generation error:', error);
      throw new BadRequestException(
        `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
