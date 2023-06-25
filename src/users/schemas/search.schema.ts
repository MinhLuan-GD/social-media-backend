import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ _id: false, versionKey: false })
export class Search {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({ required: true })
  createdAt: Date;
}

export const SearchSchema = SchemaFactory.createForClass(Search);
