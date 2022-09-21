import { User } from '@users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ collection: 'conversations', timestamps: true })
export class Conversation {
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  })
  user: User[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
