import { Controller, Get, Param } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('team/:teamId')
  getRoster(@Param('teamId') teamId: string) {
    return this.playersService.getRoster(+teamId);
  }

  @Get(':id')
  getPlayerInfo(@Param('id') id: string) {
    return this.playersService.getPlayerInfo(+id);
  }

  @Get(':id/stats/:type')
  getStats(@Param('id') id: string, @Param('type') type: 'hitting' | 'pitching') {
    return this.playersService.getPlayerStats(+id, type);
  }
}
