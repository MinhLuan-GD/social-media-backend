import { User } from '../../users/schemas/user.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ _id: false })
export class React {
  @Prop({
    enum: ['like', 'love', 'haha', 'sad', 'angry', 'wow'],
    required: true,
  })
  react: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;
}

export const ReactSchema = SchemaFactory.createForClass(React);
