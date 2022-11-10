import { Module } from '@nestjs/common';
import { ReactsService } from './reacts.service';
import { ReactsController } from './reacts.controller';
import { User, UserSchema } from '@/users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { React, ReactSchema } from './schemas/react.schema';
import { Services } from '@/utils/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: React.name, schema: ReactSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    {
      provide: Services.REACTS,
      useClass: ReactsService,
    },
  ],
  controllers: [ReactsController],
  exports: [
    {
      provide: Services.REACTS,
      useClass: ReactsService,
    },
  ],
})
export class ReactsModule {}
