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
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AssignToKpDto } from './dto/assign-to-kp.dto';
import { GenerateQuestionDto } from './dto/generate-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';

@Controller('question-bank')
@UseGuards(JwtAuthGuard)
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @Roles('admin', 'teacher')
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.questionBankService.create(createQuestionDto, user.userId);
  }

  @Get()
  @Roles('admin', 'teacher')
  findAll(
    @Query('questionType') questionType?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.questionBankService.findAll(
      questionType,
      isActive ? isActive === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionBankService.findOne(id);
  }

  @Get(':id/with-metadata')
  findOneWithMetadata(@Param('id') id: string) {
    return this.questionBankService.findOneWithMetadata(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionBankService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.questionBankService.remove(id);
  }

  // ==================== KP ASSIGNMENTS ====================

  @Post('assign-to-kp')
  @Roles('admin', 'teacher')
  assignToKp(@Body() assignDto: AssignToKpDto) {
    return this.questionBankService.assignToKp(assignDto);
  }

  @Delete('kps/:kpId/questions/:questionId')
  @Roles('admin', 'teacher')
  removeFromKp(
    @Param('kpId') kpId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.questionBankService.removeFromKp(kpId, questionId);
  }

  @Get('kps/:kpId/questions')
  getQuestionsByKp(@Param('kpId') kpId: string) {
    return this.questionBankService.getQuestionsByKp(kpId);
  }

  // ==================== METADATA ====================

  @Get(':id/metadata')
  @Roles('admin', 'teacher')
  getQuestionMetadata(@Param('id') id: string) {
    return this.questionBankService.getQuestionMetadata(id);
  }

  // ==================== AI QUESTION GENERATION ====================

  @Post('generate')
  @Roles('admin', 'teacher')
  generateQuestion(@Body() generateDto: GenerateQuestionDto) {
    return this.questionBankService.generateQuestion(generateDto);
  }
}
