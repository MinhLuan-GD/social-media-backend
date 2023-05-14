import { User } from '@/users/schemas/user.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { IConNotification } from '../types/iconnotification';

export type NotificationDocument = Notification & Document;

@Schema({ collection: 'notifications', timestamps: true, versionKey: false })
export class Notification {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  from: User;

  @Prop({ required: true, enum: IConNotification })
  icon: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ default: 'unseen', enum: ['unseen', 'seen'] })
  status: string;

  @Prop()
  postId: string;

  @Prop()
  hateSpeechLabels: string[];

  @Prop()
  commentId: string;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
