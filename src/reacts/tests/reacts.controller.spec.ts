import { Test, TestingModule } from '@nestjs/testing';
import { ReactsController } from '../reacts.controller';

describe('ReactsController', () => {
  let controller: ReactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactsController],
    }).compile();

    controller = module.get<ReactsController>(ReactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
