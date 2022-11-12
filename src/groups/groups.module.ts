import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupMessage } from './schemas/message.schema';
import { GroupMemberSchema } from './schemas/member.schema';
import { Services } from '@/utils/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: GroupMessage.name, schema: GroupMemberSchema },
    ]),
  ],
  providers: [
    {
      provide: Services.GROUPS,
      useClass: GroupsService,
    },
  ],
  controllers: [GroupsController],
  exports: [
    {
      provide: Services.GROUPS,
      useClass: GroupsService,
    },
  ],
})
export class GroupsModule {}
