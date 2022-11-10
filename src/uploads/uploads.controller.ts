import { Routes, Services } from '@/utils/constants';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IUploadsService } from './uploads';
import { UploadUtil } from './uploads.util';

@Controller(Routes.UPLOADS)
export class UploadsController {
  constructor(
    @Inject(Services.UPLOADS) private uploadsService: IUploadsService,
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
