import { Module } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { StudentProgressController } from './student-progress.controller';
import { StudentsModule } from '../students/students.module';
import { BktMasteryService } from './bkt-mastery.service';
import { QuestionBankModule } from '../question-bank/question-bank.module';

@Module({
  imports: [StudentsModule, QuestionBankModule],
  controllers: [StudentProgressController],
  providers: [StudentProgressService, BktMasteryService],
  exports: [StudentProgressService, BktMasteryService],
})
export class StudentProgressModule {}
