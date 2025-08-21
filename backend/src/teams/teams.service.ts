import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TeamsService {
  constructor(private readonly http: HttpService) {}

  async getTeams() {
    const url = `https://statsapi.mlb.com/api/v1/teams?sportId=1`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data.teams.map((t) => ({
      id: t.id,
      name: t.name,
      abbreviation: t.abbreviation,
      venue: t.venue?.name,
    }));
  }

  async getTeamById(teamId: number) {
    const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data.teams[0];
  }
}
