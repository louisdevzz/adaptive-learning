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
import { GenerateContentDto } from './dto/generate-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';

@Controller('knowledge-points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KnowledgePointsController {
  constructor(private readonly kpService: KnowledgePointsService) {}

  @Post()
  @Roles('admin', 'teacher')
  create(
    @Body() createKpDto: CreateKnowledgePointDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.kpService.create(createKpDto, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user?: ICurrentUser) {
    return this.kpService.findAll(user?.userId, user?.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: ICurrentUser) {
    return this.kpService.findOne(id, user?.userId, user?.role);
  }

  @Get(':id/details')
  findOneWithDetails(
    @Param('id') id: string,
    @CurrentUser() user?: ICurrentUser,
  ) {
    return this.kpService.findOneWithDetails(id, user?.userId, user?.role);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  update(
    @Param('id') id: string,
    @Body() updateKpDto: UpdateKnowledgePointDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.kpService.update(id, updateKpDto, user.userId, user.role);
  }

  @Delete(':id')
  @Roles('admin', 'teacher')
  remove(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    return this.kpService.remove(id, user.userId, user.role);
  }

  // ==================== SECTION ASSIGNMENTS ====================

  @Post('assign-to-section')
  @Roles('admin', 'teacher')
  assignToSection(
    @Body() assignDto: AssignToSectionDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.kpService.assignToSection(assignDto, user.userId, user.role);
  }

  @Delete('sections/:sectionId/kps/:kpId')
  @Roles('admin', 'teacher')
  removeFromSection(
    @Param('sectionId') sectionId: string,
    @Param('kpId') kpId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.kpService.removeFromSection(
      sectionId,
      kpId,
      user.userId,
      user.role,
    );
  }

  @Get('sections/:sectionId/kps')
  getKpsBySection(
    @Param('sectionId') sectionId: string,
    @CurrentUser() user?: ICurrentUser,
  ) {
    return this.kpService.getKpsBySection(sectionId, user?.userId, user?.role);
  }

  // ==================== PREREQUISITES ====================

  @Get(':id/prerequisites')
  getPrerequisites(
    @Param('id') id: string,
    @CurrentUser() user?: ICurrentUser,
  ) {
    return this.kpService.getPrerequisites(id, user?.userId, user?.role);
  }

  @Get(':id/dependents')
  getDependents(@Param('id') id: string, @CurrentUser() user?: ICurrentUser) {
    return this.kpService.getDependents(id, user?.userId, user?.role);
  }

  // ==================== RESOURCES ====================

  @Get(':id/resources')
  getResources(@Param('id') id: string, @CurrentUser() user?: ICurrentUser) {
    return this.kpService.getResources(id, user?.userId, user?.role);
  }

  @Post('generate-content')
  @Roles('admin', 'teacher')
  generateContent(@Body() generateDto: GenerateContentDto) {
    return this.kpService.generateContent(generateDto);
  }
}
