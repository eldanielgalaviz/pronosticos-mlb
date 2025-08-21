import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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
      homeTeamId: game.teams.home.team.id,
      awayTeamId: game.teams.away.team.id,
      probablePitchers: {
        homeId: game.teams.home.probablePitcher?.id,
        awayId: game.teams.away.probablePitcher?.id,
      },
    })) || [];
  }

  async getGameByPk(gamePk: number) {
    // Primero intentamos obtener datos del live feed
    try {
      const res = await axios.get(`https://statsapi.mlb.com/api/v1/game/${gamePk}/feed/live`);
      const gameData = res.data.gameData;
      if (gameData) {
        return {
          gamePk: gameData.gamePk,
          gameDate: gameData.datetime?.dateTime || null,
          venue: gameData.venue?.name || '',
          status: res.data.liveData?.linescore?.status || 'InProgress',
          homeTeamId: gameData.teams.home.id,
          awayTeamId: gameData.teams.away.id,
          probablePitchers: {
            homeId: gameData.probablePitchers?.home?.id,
            awayId: gameData.probablePitchers?.away?.id,
          },
        };
      }
    } catch (err) {
      // console.log('No hay live feed, intentamos con schedule...');
    }

    // Si no hay live feed, buscamos en schedule (ideal para juegos futuros)
    const today = new Date().toISOString().split('T')[0];
    const games = await this.getGamesByDate(today);
    const game = games.find(g => g.gamePk === gamePk);

    if (!game) throw new Error(`Juego con gamePk ${gamePk} no encontrado`);

    return game;
  }
}
