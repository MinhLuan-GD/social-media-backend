import { Post } from '@/posts/schemas/post.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ _id: false })
export class SavedPost {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  })
  post: Post;

  @Prop({ required: true })
  savedAt: Date;
}

export const SavedPostSchema = SchemaFactory.createForClass(SavedPost);
