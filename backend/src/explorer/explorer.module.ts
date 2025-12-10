import { Module } from '@nestjs/common';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';
import { CoursesModule } from '../courses/courses.module';
import { KnowledgePointsModule } from '../knowledge-points/knowledge-points.module';

@Module({
  imports: [CoursesModule, KnowledgePointsModule],
  controllers: [ExplorerController],
  providers: [ExplorerService],
  exports: [ExplorerService],
})
export class ExplorerModule {}

