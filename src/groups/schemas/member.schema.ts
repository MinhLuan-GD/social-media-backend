import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class GroupMember {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  username: string;

  @Prop()
  totalUnread: number;
}

export const GroupMemberSchema = SchemaFactory.createForClass(GroupMember);
