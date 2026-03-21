import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { LearningProfileController } from './learning-profile.controller';
import { LearningProfileMemoryService } from './learning-profile-memory.service';
import { LearningProfileService } from './learning-profile.service';

@Module({
  imports: [StudentsModule],
  controllers: [LearningProfileController],
  providers: [LearningProfileService, LearningProfileMemoryService],
  exports: [LearningProfileService],
})
export class LearningProfileModule {}
