import { Module } from '@nestjs/common';
import { LearningProfileModule } from '../learning-profile/learning-profile.module';
import { StudentsModule } from '../students/students.module';
import { ExternalSearchService } from './external-search.service';
import { ResourceRankingService } from './resource-ranking.service';
import { ResourceRecommendationsController } from './resource-recommendations.controller';
import { ResourceRecommendationsService } from './resource-recommendations.service';

@Module({
  imports: [StudentsModule, LearningProfileModule],
  controllers: [ResourceRecommendationsController],
  providers: [
    ResourceRecommendationsService,
    ExternalSearchService,
    ResourceRankingService,
  ],
  exports: [ResourceRecommendationsService],
})
export class ResourceRecommendationsModule {}
