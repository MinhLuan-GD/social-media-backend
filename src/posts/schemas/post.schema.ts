import { User } from '../../users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Comment, CommentSchema } from './comment.schema';
import { React, ReactSchema } from './react.schema';

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

  @Prop({ type: [ReactSchema], default: [] })
  reacts: React[];

  @Prop()
  background: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
