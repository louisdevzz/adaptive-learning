import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { ParentsModule } from './parents/parents.module';
import { AdminsModule } from './admins/admins.module';
import { ClassesModule } from './classes/classes.module';
import { UploadModule } from './upload/upload.module';
import { CoursesModule } from './courses/courses.module';
import { KnowledgePointsModule } from './knowledge-points/knowledge-points.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { StudentProgressModule } from './student-progress/student-progress.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { ExplorerModule } from './explorer/explorer.module';
import { CourseAnalyticsModule } from './course-analytics/course-analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    ParentsModule,
    AdminsModule,
    ClassesModule,
    UploadModule,
    CoursesModule,
    KnowledgePointsModule,
    QuestionBankModule,
    AssignmentsModule,
    StudentProgressModule,
    LearningPathsModule,
    ExplorerModule,
    CourseAnalyticsModule,
  ],
})
export class AppModule {}
