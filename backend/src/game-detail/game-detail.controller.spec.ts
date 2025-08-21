import { Test, TestingModule } from '@nestjs/testing';
import { GameDetailController } from './game-detail.controller';

describe('GameDetailController', () => {
  let controller: GameDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameDetailController],
    }).compile();

    controller = module.get<GameDetailController>(GameDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
