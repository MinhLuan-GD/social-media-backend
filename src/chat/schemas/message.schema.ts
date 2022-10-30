import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  sender: string;

  @Prop({ default: '' })
  text: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: 'unseen', enum: ['delivered', 'unseen', 'seen'] })
  status: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
