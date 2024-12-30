import { Test, TestingModule } from '@nestjs/testing';
import { FocusSessionService } from './focus-session.service';

describe('FocusSessionService', () => {
  let service: FocusSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FocusSessionService],
    }).compile();

    service = module.get<FocusSessionService>(FocusSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
