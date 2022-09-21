import { User, UserDocument } from '@users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async findConversations(userId: string, search = '') {
    const { friends } = await this.usersModel.findById(userId).lean();
  }
}
