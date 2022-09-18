import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { configOpts, mailOpts } from '@config/async.config';
import { mongoOpts } from '@databases';
import { LoggerModule } from '@logger/logger.module';
import { UsersModule } from '@users/users.module';
import { AuthModule } from '@auth/auth.module';
import { PostsModule } from '@posts/posts.module';
import { ReactsModule } from '@reacts/reacts.module';
import { UploadsModule } from '@uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot(configOpts),
    MongooseModule.forRootAsync(mongoOpts),
    MailerModule.forRootAsync(mailOpts),
    LoggerModule,
    UsersModule,
    AuthModule,
    PostsModule,
    ReactsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
