import { Module } from '@nestjs/common';
import { ReactsService } from './reacts.service';
import { ReactsController } from './reacts.controller';
import { User, UserSchema } from '@/users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { React, ReactSchema } from './schemas/react.schema';
import { Services } from '@/utils/constants';
import { Post, PostSchema } from '@/posts/schemas/post.schema';
import {
  Notification,
  NotificationSchema,
} from '@/notifications/schemas/notification.schema';
import { EventsModule } from '@/gateway/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: React.name, schema: ReactSchema },
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    EventsModule,
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
