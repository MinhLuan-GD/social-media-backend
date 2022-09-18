import { Module } from '@nestjs/common';
import { ReactsService } from './reacts.service';
import { ReactsController } from './reacts.controller';

@Module({
  providers: [ReactsService],
  controllers: [ReactsController],
})
export class ReactsModule {}
