import { Test, TestingModule } from '@nestjs/testing';
import { GameDetailService } from './game-detail.service';

describe('GameDetailService', () => {
  let service: GameDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameDetailService],
    }).compile();

    service = module.get<GameDetailService>(GameDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
