import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UploadUtil } from './uploads.util';

@Module({
  imports: [MulterModule.register({ dest: './tmp' })],
  providers: [UploadsService, UploadUtil],
  controllers: [UploadsController],
})
export class UploadsModule {}
