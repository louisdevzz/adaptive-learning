import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
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
import { DashboardModule } from './dashboard/dashboard.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StudentInsightsModule } from './student-insights/student-insights.module';
import { LearningProfileModule } from './learning-profile/learning-profile.module';
import { ResourceRecommendationsModule } from './resource-recommendations/resource-recommendations.module';
import { ParentDashboardModule } from './parent-dashboard/parent-dashboard.module';
import { ActivityLogInterceptor } from './common/interceptors/activity-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot({
      // Enable wildcard for event patterns
      wildcard: true,
      // Max listeners per event
      maxListeners: 20,
      // Show verbose memory leak warning
      verboseMemoryLeak: true,
    }),
    ScheduleModule.forRoot(),
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
    DashboardModule,
    ActivityLogModule,
    NotificationsModule,
    StudentInsightsModule,
    LearningProfileModule,
    ResourceRecommendationsModule,
    ParentDashboardModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
})
export class AppModule {}
