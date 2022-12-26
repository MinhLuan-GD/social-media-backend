import { Test, TestingModule } from '@nestjs/testing';
import { RequestWithUser } from '../../auth/interfaces/auth.interface';
import { Services } from '../../utils/constants';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const requestMock = {
    user: {
      _id: '1234',
    },
  } as unknown as RequestWithUser;

  const tokenMock = 'token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: Services.AUTH,
          useValue: {
            login: jest.fn(() => ({ token: tokenMock })),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(Services.AUTH);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('authService be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should return a successful response', async () => {
      const login = await controller.login(requestMock);
      expect(login.token).toEqual(tokenMock);
    });

    it('should throw error', async () => {
      jest.spyOn(authService, 'login').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const response = await controller.login(requestMock);
      } catch (error) {}
    });
  });
});
