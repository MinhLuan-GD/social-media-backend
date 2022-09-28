import { User } from '@users/schemas/user.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ _id: false })
export class Comment {
  @Prop()
  comment: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '' })
  parentId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  commentBy: User;

  @Prop({ required: true })
  commentAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
