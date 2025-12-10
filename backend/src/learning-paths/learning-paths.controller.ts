import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('learning-paths')
@UseGuards(JwtAuthGuard)
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @Post()
  @Roles('admin', 'teacher', 'student')
  create(@Body() createDto: CreateLearningPathDto) {
    return this.learningPathsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    return this.learningPathsService.findAll(studentId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
  }

  @Get(':id/with-items')
  findOneWithItems(@Param('id') id: string) {
    return this.learningPathsService.findOneWithItems(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher', 'student')
  update(@Param('id') id: string, @Body() updateDto: UpdateLearningPathDto) {
    return this.learningPathsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin', 'teacher')
  remove(@Param('id') id: string) {
    return this.learningPathsService.remove(id);
  }

  // ==================== LEARNING PATH ITEMS ====================

  @Patch(':pathId/items/:itemId/status')
  @Roles('student', 'teacher', 'admin')
  updateItemStatus(
    @Param('pathId') pathId: string,
    @Param('itemId') itemId: string,
    @Body('status') status: 'not_started' | 'in_progress' | 'completed',
  ) {
    return this.learningPathsService.updateItemStatus(pathId, itemId, status);
  }

  @Get(':pathId/items')
  getPathItems(@Param('pathId') pathId: string) {
    return this.learningPathsService.getPathItems(pathId);
  }
}
