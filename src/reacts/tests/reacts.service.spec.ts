import { Test, TestingModule } from '@nestjs/testing';
import { ReactsService } from '../reacts.service';

describe('ReactsService', () => {
  let service: ReactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReactsService],
    }).compile();

    service = module.get<ReactsService>(ReactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
