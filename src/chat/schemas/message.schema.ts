import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: true })
export class Message {
  @Prop()
  sender: string;

  @Prop()
  text: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
