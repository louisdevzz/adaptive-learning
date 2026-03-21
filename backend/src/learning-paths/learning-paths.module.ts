import { Module } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsController } from './learning-paths.controller';
import { PrerequisiteService } from './prerequisite.service';
import { LearningPathAutoGenerationService } from './learning-path-auto-generation.service';
import { RecommendationService } from './recommendation.service';
import { StudentInsightsModule } from '../student-insights/student-insights.module';

@Module({
  imports: [StudentInsightsModule],
  controllers: [LearningPathsController],
  providers: [
    LearningPathsService,
    PrerequisiteService,
    LearningPathAutoGenerationService,
    RecommendationService,
  ],
  exports: [
    LearningPathsService,
    PrerequisiteService,
    LearningPathAutoGenerationService,
    RecommendationService,
  ],
})
export class LearningPathsModule {}
