import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: true })
export class Message {
  @Prop({ required: true })
  sender: string;

  @Prop({ default: '' })
  text: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
