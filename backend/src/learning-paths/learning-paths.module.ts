import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsController } from './learning-paths.controller';
import { PrerequisiteService } from './prerequisite.service';
import { LearningPathAutoGenerationService } from './learning-path-auto-generation.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [LearningPathsController],
  providers: [
    LearningPathsService,
    PrerequisiteService,
    LearningPathAutoGenerationService,
    // Event listener for progress updates
    {
      provide: 'PROGRESS_UPDATE_LISTENER',
      useFactory: (autoGenService: LearningPathAutoGenerationService) => {
        return {
          handleProgressUpdate: async (payload: any) => {
            await autoGenService.handleProgressUpdate(
              payload.studentId,
              payload.kpId,
              payload.newMasteryScore,
            );
          },
        };
      },
      inject: [LearningPathAutoGenerationService],
    },
  ],
  exports: [LearningPathsService, PrerequisiteService, LearningPathAutoGenerationService],
})
export class LearningPathsModule implements OnModuleInit {
  private readonly logger = new Logger(LearningPathsModule.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly autoGenService: LearningPathAutoGenerationService,
  ) {}

  onModuleInit() {
    // Register event listener for progress updates
    this.eventEmitter.on('progress.updated', async (payload: any) => {
      try {
        await this.autoGenService.handleProgressUpdate(
          payload.studentId,
          payload.kpId,
          payload.newMasteryScore,
        );
      } catch (error) {
        this.logger.error(
          'Error handling progress update in LearningPathsModule:',
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    });

    this.logger.log('LearningPathsModule initialized with auto-generation enabled');
  }
}
