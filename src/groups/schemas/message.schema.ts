import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User, UserSchema } from './users.schema';

export type GroupMessageDocument = GroupMessage & Document;

@Schema({ collection: 'groups_messages', timestamps: true })
export class GroupMessage {
  @Prop({ required: true })
  group: string;

  @Prop(UserSchema)
  user: User;

  @Prop()
  message: string;

  createdAt: Date;
  updatedAt: Date;
}

export const GroupMessageSchema = SchemaFactory.createForClass(GroupMessage);
