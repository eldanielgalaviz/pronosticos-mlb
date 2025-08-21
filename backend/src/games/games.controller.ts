import { Controller, Get, Query } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  async getGames(@Query('date') date: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.gamesService.getGamesByDate(date || today);
  }
}
