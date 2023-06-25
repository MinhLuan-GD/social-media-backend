import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ToxicLabelDocument = ToxicLabel & Document;

@Schema({ collection: 'toxicLabel', timestamps: true, versionKey: false })
export class ToxicLabel {
  @Prop()
  text: string;

  @Prop({ default: 0 })
  toxic: number;

  @Prop({ default: 0 })
  severe_toxic: number;

  @Prop({ default: 0 })
  obscene: number;

  @Prop({ default: 0 })
  threat: number;

  @Prop({ default: 0 })
  insult: number;

  @Prop({ default: 0 })
  identity_hate: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ToxicLabelSchema = SchemaFactory.createForClass(ToxicLabel);
