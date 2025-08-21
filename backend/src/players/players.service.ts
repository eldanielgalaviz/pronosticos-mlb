import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PlayersService {
  constructor(private readonly http: HttpService) {}

  async getRoster(teamId: number) {
    const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data.roster.map((p) => ({
      id: p.person.id,
      name: p.person.fullName,
      position: p.position.abbreviation,
    }));
  }

  async getPlayerInfo(playerId: number) {
    const url = `https://statsapi.mlb.com/api/v1/people/${playerId}`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data.people[0];
  }

  async getPlayerStats(playerId: number, type: 'hitting' | 'pitching') {
    const url = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&group=${type}`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data.stats[0].splits[0]?.stat || {};
  }
}
