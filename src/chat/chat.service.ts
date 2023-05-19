import { User, UserDocument } from '@/users/schemas/user.schema';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { IChatService } from './chat';
import { EventsGateway } from '@/gateway/events.gateway';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationsModel: Model<ConversationDocument>,
    @InjectModel(User.name)
    private usersModel: Model<UserDocument>,
    @Inject(EventsGateway)
    private readonly evenGateWay: EventsGateway,
  ) {}

  async conversations(id: string, skip = 0) {
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

  async addMessage(
    sender: string,
    receiver: string,
    text: string,
    image: string,
  ) {
    if (sender == receiver) {
      throw new HttpException('Sender is Receiver', HttpStatus.CONFLICT);
    }
    const conversation = await this.conversationsModel
      .findOneAndUpdate(
        {
          members: {
            $all: [
              { $elemMatch: { $eq: new Types.ObjectId(sender) } },
              { $elemMatch: { $eq: new Types.ObjectId(receiver) } },
            ],
          },
        },
        {
          $setOnInsert: {
            members: [sender, receiver],
          },
          $push: {
            messages: { sender, receiver, text, image },
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

  async messageSeen(conversationId: string, messageId: string) {
    this.conversationsModel.findOneAndUpdate(
      {
        _id: conversationId,
        'messages._id': messageId,
      },
      {
        $set: {
          'messages.$.status': 'seen',
        },
      },
      { new: true },
      () => ({}),
    );

    return 'ok';
  }

  async deliveredMessage(conversationId: string, messageId: string) {
    this.conversationsModel.findOneAndUpdate(
      {
        _id: conversationId,
        'messages._id': messageId,
      },
      {
        $set: {
          'messages.$.status': 'delivered',
        },
      },
      { new: true },
      () => ({}),
    );

    return 'ok';
  }

  async seenAll(conversationId: string) {
    const { messages } = await this.conversationsModel
      .findOneAndUpdate(
        {
          _id: conversationId,
        },
        {
          $set: {
            'messages.$[e].status': 'seen',
          },
        },
        {
          new: true,
          arrayFilters: [{ 'e.status': { $in: ['unseen', 'delivered'] } }],
        },
      )
      .lean();

    return messages;
  }

  async deliveredAll(conversationId: string) {
    const { messages } = await this.conversationsModel
      .findOneAndUpdate(
        {
          _id: conversationId,
        },
        {
          $set: {
            'messages.$[e].status': 'delivered',
          },
        },
        { new: true, arrayFilters: [{ 'e.status': 'unseen' }] },
      )
      .lean();

    return messages;
  }

  async seenAllConversations(userId: string) {
    const conversations = await this.conversationsModel
      .find({
        members: { $elemMatch: { $eq: userId } },
      })
      .populate('members', 'first_name last_name picture')
      .select('-messages.updatedAt');

    for (const conversation of conversations) {
      conversation.messages.forEach((message) => {
        if (message.status === 'unseen' || message.status === 'delivered') {
          message.status = 'seen';
        }
      });
      await conversation.save();
    }

    const userIds = conversations.map((conversation) => {
      const { members } = conversation;
      return members.find((member) => member._id != userId)._id;
    });

    for (const id of userIds) {
      const newConversations = await this.conversationsModel
        .find({
          members: { $elemMatch: { $eq: id } },
        })
        .populate('members', 'first_name last_name picture')
        .select('-messages.updatedAt');
      this.evenGateWay.server
        .to(`users:${id}`)
        .emit('seenAllConversations', newConversations);
    }

    return conversations;
  }

  async deliveredAllConversations(userId: string) {
    const conversations = await this.conversationsModel
      .find({
        members: { $elemMatch: { $eq: userId } },
      })
      .populate('members', 'first_name last_name picture')
      .select('-messages.updatedAt');

    for (const conversation of conversations) {
      conversation.messages.forEach((message) => {
        if (message.status === 'unseen') {
          message.status = 'delivered';
        }
      });
      await conversation.save();
    }

    const userIds = conversations.map((conversation) => {
      const { members } = conversation;
      return members.find((member) => member._id != userId)._id;
    });

    for (const id of userIds) {
      const newConversations = await this.conversationsModel
        .find({
          members: { $elemMatch: { $eq: id } },
        })
        .populate('members', 'first_name last_name picture')
        .select('-messages.updatedAt');
      this.evenGateWay.server
        .to(`users:${id}`)
        .emit('deliveredAllConversations', newConversations);
    }

    return conversations;
  }
}
