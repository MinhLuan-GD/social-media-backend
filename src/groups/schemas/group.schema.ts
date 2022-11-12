import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GroupMember, GroupMemberSchema } from './member.schema';
import { GroupMessage } from './message.schema';

export type GroupDocument = Group & Document;

@Schema({ collection: 'groups' })
export class Group {
  @Prop([GroupMemberSchema])
  members: GroupMember[];

  @Prop({ default: '' })
  name: string;

  @Prop()
  totalMessage: number;

  messages: GroupMessage[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
