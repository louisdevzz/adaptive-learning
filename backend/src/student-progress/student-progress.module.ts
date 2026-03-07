import { Module } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { StudentProgressController } from './student-progress.controller';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [StudentsModule],
  controllers: [StudentProgressController],
  providers: [StudentProgressService],
  exports: [StudentProgressService],
})
export class StudentProgressModule {}
