import { Injectable, NotFoundException } from '@nestjs/common';
import { GamesService } from '../games/games.service';
import { TeamsService } from '../teams/teams.service';
import { PlayersService } from '../players/players.service';

@Injectable()
export class PredictionsService {
  constructor(
    private readonly gamesService: GamesService,
    private readonly teamsService: TeamsService,
    private readonly playersService: PlayersService,
  ) {}

  // Función sigmoide para convertir score en probabilidad
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // Convierte string numérico a float seguro
  private parseStat(value: any): number {
    if (!value) return 0;
    if (typeof value === 'string') return parseFloat(value.replace(',', '')) || 0;
    return value;
  }

  async predictGame(gamePk: number) {
    const game = await this.gamesService.getGameByPk(gamePk);
    if (!game) throw new NotFoundException(`Juego con gamePk ${gamePk} no encontrado`);

    const homeTeamId = game.homeTeamId;
    const awayTeamId = game.awayTeamId;

    // 1️⃣ Obtener info de equipos
    const homeTeam = await this.teamsService.getTeamById(homeTeamId);
    const awayTeam = await this.teamsService.getTeamById(awayTeamId);

    // 2️⃣ Obtener roster
    const homeRoster = await this.playersService.getRoster(homeTeamId);
    const awayRoster = await this.playersService.getRoster(awayTeamId);

    // 3️⃣ Obtener pitchers titulares
    const homePitcherId = game.probablePitchers?.homeId || (await this.playersService.getLastStartingPitcher(homeTeamId));
    const awayPitcherId = game.probablePitchers?.awayId || (await this.playersService.getLastStartingPitcher(awayTeamId));

    if (!homePitcherId || !awayPitcherId) {
      throw new NotFoundException('Probable pitcher no disponible para predicción');
    }

    const homePitcherStats = await this.playersService.getPlayerStats(homePitcherId, 'pitching');
    const awayPitcherStats = await this.playersService.getPlayerStats(awayPitcherId, 'pitching');

    // 4️⃣ Calcular estadísticas de bateo diferenciando home/away
    const calcTeamHitting = async (roster, isHome: boolean) => {
      let totalAVG = 0;
      let totalHRPerGame = 0;
      let count = 0;

      for (const player of roster) {
        try {
          const stats = await this.playersService.getPlayerStats(player.id, 'hitting');
          if (!stats) continue;

          // ⚡ Usa splits home/away si existen
          let split = isHome ? stats.splits?.home : stats.splits?.away;
          if (!split) split = stats; // fallback general si no hay split

          const gamesPlayed = split.gamesPlayed || 1;
          totalAVG += this.parseStat(split.avg || 0);
          totalHRPerGame += (this.parseStat(split.homeRuns) || 0) / gamesPlayed;
          count++;
        } catch {
          continue;
        }
      }

      return {
        avg: count ? totalAVG / count : 0,
        hrPerGame: count ? totalHRPerGame / count : 0,
      };
    };

    const homeHitting = await calcTeamHitting(homeRoster, true);
    const awayHitting = await calcTeamHitting(awayRoster, false);

    // 5️⃣ Preparar estadísticas de pitchers (tasa por inning)
    const parsePitcherStats = (stats, isHome: boolean) => {
      let split = isHome ? stats.splits?.home : stats.splits?.away;
      if (!split) split = stats; // fallback general

      const innings = parseFloat(split.inningsPitched) || 1;
      return {
        era: this.parseStat(split.era || 4.5),
        whip: this.parseStat(split.whip || 1.3),
        kPer9: ((this.parseStat(split.strikeOuts) || 0) / innings) * 9,
        hrPer9: ((this.parseStat(split.homeRuns) || 0) / innings) * 9,
      };
    };

    const homePitcher = parsePitcherStats(homePitcherStats, true);
    const awayPitcher = parsePitcherStats(awayPitcherStats, false);

    // 6️⃣ Calcular score relativo
    const homeScore = 
      homeHitting.avg / awayPitcher.era +
      homeHitting.hrPerGame / awayPitcher.hrPer9 +
      homePitcher.kPer9 / awayPitcher.kPer9;

    const awayScore = 
      awayHitting.avg / homePitcher.era +
      awayHitting.hrPerGame / homePitcher.hrPer9 +
      awayPitcher.kPer9 / homePitcher.kPer9;

    // 7️⃣ Convertir a probabilidad porcentual
    const homeWinProb = this.sigmoid(homeScore - awayScore) * 100;
    const awayWinProb = 100 - homeWinProb;

    return {
      gamePk,
      date: game.gameDate,
      venue: game.venue,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      homeWinProb: homeWinProb.toFixed(1) + '%',
      awayWinProb: awayWinProb.toFixed(1) + '%',
      factors: {
        homeHitting,
        awayHitting,
        homePitcherStats,
        awayPitcherStats,
      },
    };
  }
}
