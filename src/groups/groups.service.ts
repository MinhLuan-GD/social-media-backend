import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGroupsService } from './groups';
import { Group, GroupDocument } from './schemas/group.schema';
import { GroupMessage, GroupMessageDocument } from './schemas/message.schema';

@Injectable()
export class GroupsService implements IGroupsService {
  constructor(
    @InjectModel(Group.name)
    private groupsModel: Model<GroupDocument>,
    @InjectModel(GroupMessage.name)
    private gMesModel: Model<GroupMessageDocument>,
  ) {}
  createGroup(params: any) {
    throw new Error('Method not implemented.');
  }
  modifyGroup(params: any) {
    throw new Error('Method not implemented.');
  }
  listGroups(filter: any, limit: any, skip: any) {
    throw new Error('Method not implemented.');
  }
  findGroup(filter: any) {
    throw new Error('Method not implemented.');
  }
}
