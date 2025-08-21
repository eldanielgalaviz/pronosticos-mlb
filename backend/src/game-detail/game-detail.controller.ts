import { Controller, Get, Param } from '@nestjs/common';
import { GameDetailService } from './game-detail.service';

@Controller('game')
export class GameDetailController {
  constructor(private readonly gameDetailService: GameDetailService) {}

  @Get(':gamePk')
  async getGameDetail(@Param('gamePk') gamePk: string) {
    return this.gameDetailService.getGameDetail(gamePk);
  }
}
