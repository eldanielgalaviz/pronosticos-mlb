import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GamesService {
  constructor(
    private http: HttpService,
    private configService: ConfigService,
  ) {}

  async getGamesByDate(date: string) {
    const base = this.configService.get<string>('MLB_API_BASE') || 'https://statsapi.mlb.com';
    const url = `${base}/api/v1/schedule?sportId=1&date=${date}`;
    const { data } = await this.http.axiosRef.get(url);

    return data.dates[0]?.games.map((game: any) => ({
      gamePk: game.gamePk,
      date: game.gameDate,
      status: game.status.detailedState,
      home: game.teams.home.team.name,
      away: game.teams.away.team.name,
      venue: game.venue.name,
    })) || [];
  }
}
