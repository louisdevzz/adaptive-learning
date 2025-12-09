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
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createParentDto: CreateParentDto) {
    return this.parentsService.create(createParentDto);
  }

  @Get()
  findAll() {
    return this.parentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentsService.findOne(id);
  }

  @Get(':id/students')
  getParentStudents(@Param('id') id: string) {
    return this.parentsService.getParentStudents(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParentDto: UpdateParentDto) {
    return this.parentsService.update(id, updateParentDto);
  }

  @Post(':id/students/:studentId')
  @HttpCode(HttpStatus.CREATED)
  addStudentToParent(
    @Param('id') parentId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.addStudentToParent(parentId, studentId);
  }

  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.OK)
  removeStudentFromParent(
    @Param('id') parentId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.removeStudentFromParent(parentId, studentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.parentsService.remove(id);
  }
}
