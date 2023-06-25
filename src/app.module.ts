import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { configOpts, mailOpts, throttlerOpts } from './config/async.config';
import { mongoOpts } from './databases';
import { LoggerModule } from './logger/logger.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { ReactsModule } from './reacts/reacts.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './gateway/events.module';

@Module({
  imports: [
    ConfigModule.forRoot(configOpts),
    MongooseModule.forRootAsync(mongoOpts),
    MailerModule.forRootAsync(mailOpts),
    ThrottlerModule.forRootAsync(throttlerOpts),
    LoggerModule,
    UsersModule,
    AuthModule,
    PostsModule,
    ReactsModule,
    UploadsModule,
    ChatModule,
    NotificationsModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
