import { User, UserDocument } from '@users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';

@Injectable()
export class ChatService {
  @InjectModel(Conversation.name)
  private conversationsModel: Model<ConversationDocument>;

  @InjectModel(User.name)
  private usersModel: Model<UserDocument>;

  async conversations(id: string, search = '', skip = 0) {
    const { friends } = await this.usersModel.findById(id).lean();
    const conversations: Conversation[] = [];
    const start = skip * 10;
    const end = (skip + 1) * 10;
    const len = friends.length - 1;
    const userId = new Types.ObjectId(id);

    for (let i = start; i < end; i++) {
      if (i > len) break;
      conversations.push(
        await this.conversationsModel
          .findOneAndUpdate(
            {
              members: {
                $all: [
                  { $elemMatch: { $eq: friends[i] } },
                  { $elemMatch: { $eq: userId } },
                ],
              },
            },
            {
              $setOnInsert: {
                members: [friends[i], userId],
              },
            },
            {
              upsert: true,
              new: true,
            },
          )
          .populate('members', 'first_name last_name picture')
          .select('-messages.updatedAt')
          .lean(),
      );
    }
    return conversations;
  }

  async addMessage(sender: string, user: string, text: string) {
    const conversation = await this.conversationsModel
      .findOneAndUpdate(
        {
          members: {
            $all: [
              { $elemMatch: { $eq: new Types.ObjectId(sender) } },
              { $elemMatch: { $eq: new Types.ObjectId(user) } },
            ],
          },
        },
        {
          $setOnInsert: {
            members: [sender, user],
          },
          $push: {
            messages: { sender, text },
          },
        },
        {
          upsert: true,
          new: true,
        },
      )
      .populate('members', 'first_name last_name picture')
      .select('-messages.updatedAt')
      .lean();
    return conversation;
  }
}
