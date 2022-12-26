import { Module } from '@nestjs/common';
import { User, UserSchema } from '../users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Services } from '../utils/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    {
      provide: Services.POSTS,
      useClass: PostsService,
    },
  ],
  controllers: [PostsController],
  exports: [
    {
      provide: Services.POSTS,
      useClass: PostsService,
    },
  ],
})
export class PostsModule {}
