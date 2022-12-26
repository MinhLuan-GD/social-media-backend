import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from '../chat.controller';
import { RequestWithUser } from '../../auth/interfaces/auth.interface';
import { ChatService } from '../chat.service';
import { Services } from '../../utils/constants';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  const requestMock = {
    user: {
      _id: '1234',
    },
  } as unknown as RequestWithUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: Services.CHAT,
          useValue: {
            addMessage: jest.fn((id, user, text, image) => ({
              id,
              user,
              text,
              image,
            })),
          },
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(Services.CHAT);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addMessage', () => {
    it('should return a successful response', async () => {
      const response = await controller.addMessage(requestMock, {
        image: 'blah.jpg',
        text: 'blah',
        user: '1236',
      });
      // expect(response).toStrictEqual({
      //   status: 'success',
      // });
    });

    it('should throw error', async () => {
      jest.spyOn(chatService, 'addMessage').mockImplementationOnce(() => {
        throw new HttpException('Sender is Receiver', HttpStatus.CONFLICT);
      });
      try {
        const response = await controller.addMessage(requestMock, {
          image: '',
          text: '',
          user: '1234',
        });
      } catch (error) {}
    });
  });
});
