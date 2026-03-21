import { Module } from '@nestjs/common';
import { LearningProfileModule } from '../learning-profile/learning-profile.module';
import { ClassAnalyticsService } from './class-analytics.service';
import { InterventionAiService } from './intervention-ai.service';
import { TeacherInterventionsController } from './teacher-interventions.controller';
import { TeacherInterventionsService } from './teacher-interventions.service';

@Module({
  imports: [LearningProfileModule],
  controllers: [TeacherInterventionsController],
  providers: [
    TeacherInterventionsService,
    ClassAnalyticsService,
    InterventionAiService,
  ],
})
export class TeacherInterventionsModule {}
