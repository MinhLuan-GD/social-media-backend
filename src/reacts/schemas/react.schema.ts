import { Post } from '@/posts/schemas/post.schema';
import { User } from '@/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ReactDocument = React & Document;

@Schema({ collection: 'reacts' })
export class React {
  @Prop({
    enum: ['like', 'love', 'haha', 'sad', 'angry', 'wow'],
    required: true,
  })
  react: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Post.name })
  postRef: Post;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  reactBy: User;
}

export const ReactSchema = SchemaFactory.createForClass(React);
