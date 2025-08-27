import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GameDetailService {
  constructor(
    private http: HttpService,
    private configService: ConfigService,
  ) {}

  async getGameDetail(gamePk: number | string) {
    try {
      const base =
        this.configService.get<string>('MLB_API_BASE') ||
        'https://statsapi.mlb.com';
      const url = `${base}/api/v1.1/game/${gamePk}/feed/live`;

      const { data } = await this.http.axiosRef.get(url);

      return {
        gamePk: data.gamePk,
        gameDate: data.gameData?.datetime?.dateTime || null,
        venue: data.gameData?.venue?.name || 'Unknown venue',
        homeTeam: data.gameData?.teams?.home?.name,
        awayTeam: data.gameData?.teams?.away?.name,
        homeTeamId: data.gameData?.teams?.home?.id,
        awayTeamId: data.gameData?.teams?.away?.id,
        probablePitchers: {
          home: data.gameData?.probablePitchers?.home?.fullName || 'TBD',
          away: data.gameData?.probablePitchers?.away?.fullName || 'TBD',
        },
        linescore: data.liveData?.linescore || {},
      };
    } catch (error) {
      throw new HttpException(
        `Error fetching game details for gamePk ${gamePk}`,
        error.response?.status || 500,
      );
    }
  }
}
