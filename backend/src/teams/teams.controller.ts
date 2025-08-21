import { Controller, Get, Param } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  getTeams() {
    return this.teamsService.getTeams();
  }

  @Get(':id')
  getTeam(@Param('id') id: string) {
    return this.teamsService.getTeamById(+id);
  }
}
