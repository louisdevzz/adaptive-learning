import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createParentDto: CreateParentDto) {
    return this.parentsService.create(createParentDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.parentsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'parent')
  findOne(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    if (user.role === 'parent' && user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.parentsService.findOne(id);
  }

  @Get(':id/students')
  @Roles('admin', 'parent')
  getParentStudents(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    if (user.role === 'parent' && user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.parentsService.getParentStudents(id);
  }

  @Patch(':id')
  @Roles('admin', 'parent')
  update(
    @Param('id') id: string,
    @Body() updateParentDto: UpdateParentDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    if (user.role === 'parent' && user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.parentsService.update(id, updateParentDto);
  }

  @Post(':id/students/:studentId')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  addStudentToParent(
    @Param('id') parentId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.addStudentToParent(parentId, studentId);
  }

  @Delete(':id/students/:studentId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  removeStudentFromParent(
    @Param('id') parentId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.removeStudentFromParent(parentId, studentId);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.parentsService.remove(id);
  }
}
