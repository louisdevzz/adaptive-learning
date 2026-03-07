import { Module } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsController } from './learning-paths.controller';
import { PrerequisiteService } from './prerequisite.service';
import { LearningPathAutoGenerationService } from './learning-path-auto-generation.service';

@Module({
  controllers: [LearningPathsController],
  providers: [
    LearningPathsService,
    PrerequisiteService,
    LearningPathAutoGenerationService,
  ],
  exports: [
    LearningPathsService,
    PrerequisiteService,
    LearningPathAutoGenerationService,
  ],
})
export class LearningPathsModule {}
