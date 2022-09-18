import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [MulterModule.register({ dest: './tmp' })],
  providers: [UploadsService],
  controllers: [UploadsController],
})
export class UploadsModule {}
