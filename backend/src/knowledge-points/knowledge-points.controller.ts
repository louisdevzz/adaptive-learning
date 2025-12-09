import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { KnowledgePointsService } from './knowledge-points.service';
import { CreateKnowledgePointDto } from './dto/create-knowledge-point.dto';
import { UpdateKnowledgePointDto } from './dto/update-knowledge-point.dto';
import { AssignToSectionDto } from './dto/assign-to-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('knowledge-points')
@UseGuards(JwtAuthGuard)
export class KnowledgePointsController {
  constructor(private readonly kpService: KnowledgePointsService) {}

  @Post()
  @Roles('admin', 'teacher')
  create(@Body() createKpDto: CreateKnowledgePointDto) {
    return this.kpService.create(createKpDto);
  }

  @Get()
  findAll() {
    return this.kpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kpService.findOne(id);
  }

  @Get(':id/details')
  findOneWithDetails(@Param('id') id: string) {
    return this.kpService.findOneWithDetails(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  update(@Param('id') id: string, @Body() updateKpDto: UpdateKnowledgePointDto) {
    return this.kpService.update(id, updateKpDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.kpService.remove(id);
  }

  // ==================== SECTION ASSIGNMENTS ====================

  @Post('assign-to-section')
  @Roles('admin', 'teacher')
  assignToSection(@Body() assignDto: AssignToSectionDto) {
    return this.kpService.assignToSection(assignDto);
  }

  @Delete('sections/:sectionId/kps/:kpId')
  @Roles('admin', 'teacher')
  removeFromSection(
    @Param('sectionId') sectionId: string,
    @Param('kpId') kpId: string,
  ) {
    return this.kpService.removeFromSection(sectionId, kpId);
  }

  @Get('sections/:sectionId/kps')
  getKpsBySection(@Param('sectionId') sectionId: string) {
    return this.kpService.getKpsBySection(sectionId);
  }

  // ==================== PREREQUISITES ====================

  @Get(':id/prerequisites')
  getPrerequisites(@Param('id') id: string) {
    return this.kpService.getPrerequisites(id);
  }

  @Get(':id/dependents')
  getDependents(@Param('id') id: string) {
    return this.kpService.getDependents(id);
  }

  // ==================== RESOURCES ====================

  @Get(':id/resources')
  getResources(@Param('id') id: string) {
    return this.kpService.getResources(id);
  }
}
