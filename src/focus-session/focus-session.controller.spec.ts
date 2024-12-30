import { Test, TestingModule } from '@nestjs/testing';
import { FocusSessionController } from './focus-session.controller';

describe('FocusSessionController', () => {
  let controller: FocusSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FocusSessionController],
    }).compile();

    controller = module.get<FocusSessionController>(FocusSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
