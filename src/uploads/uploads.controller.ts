import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadUtil } from './uploads.util';

@Controller('uploads')
export class UploadsController {
  constructor(
    private uploadsService: UploadsService,
    private uploadUtil: UploadUtil,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadImages(
    @Body('path') path: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const images: { url: string }[] = [];
    for (const file of files) {
      const url = await this.uploadsService.uploadToCloud(file, path);
      images.push(url);
      this.uploadUtil.removeTmp(file.path);
    }
    return images;
  }

  @UseGuards(JwtAuthGuard)
  @Post('list-images')
  async listImages(@Body() body: any) {
    const { path, sort, max } = body;
    return this.uploadsService.listImages(path, sort, max);
  }
}
