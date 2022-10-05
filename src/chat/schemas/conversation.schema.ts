import { User } from '@users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Message, MessageSchema } from './message.schema';

export type ConversationDocument = Conversation & Document;

@Schema({ collection: 'conversations' })
export class Conversation {
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  })
  members: User[];

  @Prop({ default: '' })
  userNotSeen: string;

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
