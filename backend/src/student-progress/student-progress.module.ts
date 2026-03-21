import { Module } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { StudentProgressController } from './student-progress.controller';
import { StudentsModule } from '../students/students.module';
import { BktMasteryService } from './bkt-mastery.service';

@Module({
  imports: [StudentsModule],
  controllers: [StudentProgressController],
  providers: [StudentProgressService, BktMasteryService],
  exports: [StudentProgressService, BktMasteryService],
})
export class StudentProgressModule {}
