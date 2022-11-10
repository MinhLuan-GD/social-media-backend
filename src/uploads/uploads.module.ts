import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UploadUtil } from './uploads.util';
import { Services } from '@/utils/constants';

@Module({
  imports: [MulterModule.register({ dest: './tmp' })],
  providers: [
    {
      provide: Services.UPLOADS,
      useClass: UploadsService,
    },
    UploadUtil,
  ],
  controllers: [UploadsController],
  exports: [
    {
      provide: Services.UPLOADS,
      useClass: UploadsService,
    },
  ],
})
export class UploadsModule {}
