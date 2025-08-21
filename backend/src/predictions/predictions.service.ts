import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GamesService } from '../games/games.service';
import { TeamsService } from '../teams/teams.service';
import { PlayersService } from '../players/players.service';
import { GameDetailService } from '../game-detail/game-detail.service';

@Injectable()
export class PredictionsService {
  constructor(
    private readonly gamesService: GamesService,
    private readonly teamsService: TeamsService,
    private readonly playersService: PlayersService,
    private readonly gameDetailService: GameDetailService,

  ) {}

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private parseStat(value: any): number {
    if (!value && value !== 0) throw new BadRequestException('Estadísticas incompletas: valor indefinido');
    if (typeof value === 'string') return parseFloat(value.replace(',', '')) || 0;
    return value;
  }

  private async calcTeamHitting(roster: any[], isHome: boolean) {
    let totalPA = 0;
    let totalBB = 0;
    let totalH = 0;
    let total2B = 0;
    let total3B = 0;
    let totalHR = 0;
    let totalAB = 0;
    let totalHBP = 0;
    let totalSF = 0;

    for (const player of roster) {
      const stats = await this.playersService.getPlayerStats(player.id, 'hitting');
      if (!stats) continue;

      const split = (isHome ? stats.splits?.home : stats.splits?.away) || stats;
      if (!split) throw new BadRequestException(`Estadísticas de bateo no disponibles para jugador ${player.id}`);

      const ab = this.parseStat(split.atBats);
      const h = this.parseStat(split.hits);
      const bb = this.parseStat(split.baseOnBalls);
      const hbp = this.parseStat(split.hitByPitch);
      const sf = this.parseStat(split.sacFlies);
      const dbl = this.parseStat(split.doubles);
      const tpl = this.parseStat(split.triples);
      const hr = this.parseStat(split.homeRuns);

      totalAB += ab;
      totalH += h;
      totalBB += bb;
      totalHBP += hbp;
      totalSF += sf;
      total2B += dbl;
      total3B += tpl;
      totalHR += hr;
      totalPA += ab + bb + hbp + sf;
    }

    if (totalPA === 0) throw new BadRequestException('Estadísticas de bateo insuficientes para el equipo');

    const wOBA = ((0.69 * totalBB) + (0.72 * totalHBP) + (0.89 * totalH) + (1.27 * total2B) + (1.62 * total3B) + (2.10 * totalHR)) / totalPA;
    const babip = totalAB ? (totalH - totalHR) / (totalAB - totalHR - totalSF + totalSF) : 0;
    const hrPerGame = totalAB ? totalHR / (totalAB / 4) : 0;

    return { wOBA, babip, hrPerGame };
  }

  private parsePitcherStats(stats: any, isHome: boolean) {
    if (!stats) throw new BadRequestException('Estadísticas de pitcheo no disponibles');

    const split = (isHome ? stats.splits?.home : stats.splits?.away) || stats;
    if (!split) throw new BadRequestException('Estadísticas de pitcheo no disponibles para este pitcher');

    const innings = parseFloat(split.inningsPitched);
    if (!innings || innings === 0) throw new BadRequestException('Innings pitched no disponible');

    return {
      era: this.parseStat(split.era),
      whip: this.parseStat(split.whip),
      kPer9: (this.parseStat(split.strikeOuts) / innings) * 9,
      hrPer9: (this.parseStat(split.homeRuns) / innings) * 9,
    };
  }

  private async calcBullpenStats(teamId: number) {
    const roster = await this.playersService.getRoster(teamId);
    const bullpenPitchers = roster.filter(p => !p.isStarter);
    if (!bullpenPitchers.length) throw new BadRequestException('Estadísticas de bullpen no disponibles');

    let totalERA = 0;
    let totalWHIP = 0;
    let count = 0;

    for (const pitcher of bullpenPitchers) {
      const stats = await this.playersService.getPlayerStats(pitcher.id, 'pitching');
      if (!stats) continue;

      totalERA += this.parseStat(stats.era);
      totalWHIP += this.parseStat(stats.whip);
      count++;
    }

    if (count === 0) throw new BadRequestException('Estadísticas de bullpen insuficientes');

    return { era: totalERA / count, whip: totalWHIP / count };
  }

  private async calcRecentForm(teamId: number, games = 10) {
    const recentGames = await this.gamesService.getRecentGames(teamId, games);
    if (!recentGames || !recentGames.length)
      throw new BadRequestException('No se encontraron juegos recientes para calcular forma reciente');

    const wins = recentGames.filter(g => g.winnerId === teamId).length;
    return wins / recentGames.length;
  }

async predictGame(gamePk: number) {
  // Usamos GameDetailService para obtener los pitchers correctos
  const game = await this.gameDetailService.getGameDetail(gamePk);
  if (!game) throw new NotFoundException(`Juego con gamePk ${gamePk} no encontrado`);

  const homeTeam = await this.teamsService.getTeamById(game.homeTeamId);
  const awayTeam = await this.teamsService.getTeamById(game.awayTeamId);

  const homeRoster = await this.playersService.getRoster(game.homeTeamId);
  const awayRoster = await this.playersService.getRoster(game.awayTeamId);

  const homeStarterName = game.probablePitchers.home;
  const awayStarterName = game.probablePitchers.away;

  if (!homeStarterName || !awayStarterName) {
    throw new NotFoundException('Probable pitcher no disponible para predicción');
  }

  // Buscar IDs de los pitchers dentro del roster
  const homePitcher = homeRoster.find(p => p.name === homeStarterName);
  const awayPitcher = awayRoster.find(p => p.name === awayStarterName);

  if (!homePitcher || !awayPitcher) {
    throw new NotFoundException('No se encontró el pitcher en el roster del equipo');
  }

  const homePitcherStats = this.parsePitcherStats(
    await this.playersService.getPlayerStats(homePitcher.id, 'pitching'), 
    true
  );
  const awayPitcherStats = this.parsePitcherStats(
    await this.playersService.getPlayerStats(awayPitcher.id, 'pitching'), 
    false
  );

  const homeHitting = await this.calcTeamHitting(homeRoster, true);
  const awayHitting = await this.calcTeamHitting(awayRoster, false);
  const homeBullpen = await this.calcBullpenStats(game.homeTeamId);
  const awayBullpen = await this.calcBullpenStats(game.awayTeamId);
  const homeRecentForm = await this.calcRecentForm(game.homeTeamId);
  const awayRecentForm = await this.calcRecentForm(game.awayTeamId);

  const homeScore =
    homeHitting.wOBA * 0.3 +
    homePitcherStats.kPer9 * 0.2 -
    awayPitcherStats.era * 0.2 +
    homeBullpen.era * -0.1 +
    homeRecentForm * 0.15;

  const awayScore =
    awayHitting.wOBA * 0.3 +
    awayPitcherStats.kPer9 * 0.2 -
    homePitcherStats.era * 0.2 +
    awayBullpen.era * -0.1 +
    awayRecentForm * 0.15;

  const homeWinProb = this.sigmoid(homeScore - awayScore) * 100;
  const awayWinProb = 100 - homeWinProb;

  return {
    gamePk,
    date: game.gameDate,
    venue: game.venue,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    homeStarterName,
    awayStarterName,
    homeWinProb: homeWinProb.toFixed(1) + '%',
    awayWinProb: awayWinProb.toFixed(1) + '%',
    factors: {
      homeHitting,
      awayHitting,
      homePitcherStats,
      awayPitcherStats,
      homeBullpen,
      awayBullpen,
      homeRecentForm,
      awayRecentForm,
    },
  };
}



}
