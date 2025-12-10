import { PartialType } from '@nestjs/mapped-types';
import { CreateKnowledgePointDto } from './create-knowledge-point.dto';

export class UpdateKnowledgePointDto extends PartialType(CreateKnowledgePointDto) {}
