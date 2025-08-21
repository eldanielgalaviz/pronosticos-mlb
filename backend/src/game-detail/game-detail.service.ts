import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GameDetailService {
  constructor(
    private http: HttpService,
    private configService: ConfigService,
  ) {}

  async getGameDetail(gamePk: string) {
    const base = this.configService.get<string>('MLB_API_BASE') || 'https://statsapi.mlb.com';
    const url = `${base}/api/v1.1/game/${gamePk}/feed/live`;

    const { data } = await this.http.axiosRef.get(url);

    return {
      gamePk: data.gamePk,
      gameDate: data.gameData.datetime.dateTime,
      venue: data.gameData.venue.name,
      homeTeam: data.gameData.teams.home.name,
      awayTeam: data.gameData.teams.away.name,
      probablePitchers: {
        home: data.gameData.probablePitchers.home?.fullName || 'TBD',
        away: data.gameData.probablePitchers.away?.fullName || 'TBD',
      },
      linescore: data.liveData.linescore,
    };
  }
}
