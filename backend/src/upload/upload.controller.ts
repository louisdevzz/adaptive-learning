import {
  Controller,
  Post,
  Get,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = await this.uploadService.uploadAvatar(file);
    return {
      message: 'Avatar uploaded successfully',
      url,
    };
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = await this.uploadService.uploadFile(file);
    return {
      message: 'File uploaded successfully',
      url,
    };
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = await this.uploadService.uploadDocument(file);
    return {
      message: 'Document uploaded successfully',
      url,
    };
  }

  @Get('proxy')
  async proxyFile(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    // Only allow proxying files from our R2 bucket
    const publicUrl = this.uploadService.getPublicUrl();
    if (!url.startsWith(publicUrl)) {
      throw new BadRequestException('URL not allowed');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new BadRequestException('Failed to fetch file');
      }

      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';
      const buffer = Buffer.from(await response.arrayBuffer());

      res.set({
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      });
      res.send(buffer);
    } catch (error) {
      throw new BadRequestException('Failed to proxy file');
    }
  }
}
