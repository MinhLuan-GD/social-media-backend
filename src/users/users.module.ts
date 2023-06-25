import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Post, PostSchema } from '@/posts/schemas/post.schema';
// import { userCacheOpts } from '@/cache';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Services } from '@/utils/constants';
import { EventsModule } from '@/gateway/events.module';
import {
  Notification,
  NotificationSchema,
} from '@/notifications/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    // CacheModule.registerAsync(userCacheOpts),
    EventsModule,
  ],
  providers: [
    {
      provide: Services.USERS,
      useClass: UsersService,
    },
  ],
  controllers: [UsersController],
  exports: [
    {
      provide: Services.USERS,
      useClass: UsersService,
    },
  ],
})
export class UsersModule {}
