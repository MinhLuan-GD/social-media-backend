import { User, UserDocument } from '../../users/schemas/user.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ChatService } from '../chat.service';
import {
  Conversation,
  ConversationDocument,
} from '../schemas/conversation.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('ChatService', () => {
  let service: ChatService;
  let conversationsModel: Model<ConversationDocument>;
  let usersModel: Model<UserDocument>;

  const conversationsModelToken = getModelToken(Conversation.name);
  const usersModelToken = getModelToken(User.name);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: conversationsModelToken,
          useValue: Model,
        },
        {
          provide: usersModelToken,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    conversationsModel = module.get<Model<ConversationDocument>>(
      conversationsModelToken,
    );
    usersModel = module.get<Model<UserDocument>>(usersModelToken);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('conversationsModel should be defined', () => {
    expect(conversationsModel).toBeDefined();
  });

  it('usersModel should be defined', () => {
    expect(usersModel).toBeDefined();
  });
});
