import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { Services } from '../../utils/constants';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: Services.USERS,
          useValue: {},
        },
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token', async () => {
      jest.spyOn(service.jwtService, 'sign').mockReturnValue('token123');
      const { token } = await service.login('123', 'luan@gmail.com');
      expect(token).toEqual('token123');
    });
  });
});
