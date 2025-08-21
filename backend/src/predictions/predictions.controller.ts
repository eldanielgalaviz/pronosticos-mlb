import { Controller, Get, Param } from '@nestjs/common';
import { PredictionsService } from './predictions.service';

@Controller('predict')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get(':gamePk')
  async getPrediction(@Param('gamePk') gamePk: string) {
    const gameId = parseInt(gamePk, 10);
    return this.predictionsService.predictGame(gameId);
  }
}
