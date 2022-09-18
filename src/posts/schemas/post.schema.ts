import { User } from '@users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Comment, CommentSchema } from './comment.schema';

interface Image {
  url: string;
}

export type PostDocument = Post & Document;

@Schema({ collection: 'posts', timestamps: true })
export class Post {
  @Prop({ enum: ['profilePicture', 'coverPicture', null], default: null })
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

  @Prop()
  background: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
