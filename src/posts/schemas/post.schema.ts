import { User } from '@/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Comment, CommentSchema } from './comment.schema';

interface Image {
  url: string;
}

export type PostDocument = Post & Document;

@Schema({ collection: 'posts', timestamps: true, versionKey: false })
export class Post {
  @Prop({
    enum: ['profilePicture', 'coverPicture', 'picture', null],
    default: null,
  })
  type: string;

  @Prop()
  text: string;

  @Prop([{ url: String }])
  images: Image[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop([CommentSchema])
  comments: Comment[];

  @Prop({ default: false })
  hidePost: boolean;

  @Prop()
  background: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
