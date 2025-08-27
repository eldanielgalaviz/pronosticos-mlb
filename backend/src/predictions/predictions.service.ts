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

  /** Diferencia relativa escalada a [-1, 1], robusta a magnitudes distintas */
  private rd(a: number, b: number): number {
    const eps = 1e-9;
    return (a - b) / (Math.abs(a) + Math.abs(b) + eps);
  }

  private parseStat(value: any): number {
    if (!value && value !== 0) return 0; // evita tirar excepción por pequeños faltantes
    if (typeof value === 'string') return parseFloat(value.replace(',', '')) || 0;
    return value;
  }

  /** ---- BATEO DE EQUIPO ----
   * Corrige wOBA (sin duplicar hits) y BABIP
   */
private async calcTeamHitting(roster: any[], isHome: boolean) {
  let AB = 0, H = 0, BB = 0, IBB = 0, HBP = 0, SF = 0, _2B = 0, _3B = 0, HR = 0, SO = 0;
  let totalGames = 0; // para calcular HR por juego

  for (const player of roster) {
    const stats = await this.playersService.getPlayerStats(player.id, 'hitting');
    if (!stats) continue;
    const s = (isHome ? stats.splits?.home : stats.splits?.away) || stats;

    AB  += this.parseStat(s.atBats ?? 0);
    H   += this.parseStat(s.hits ?? 0);
    BB  += this.parseStat(s.baseOnBalls ?? 0);
    IBB += this.parseStat(s.intentionalWalks ?? 0);
    HBP += this.parseStat(s.hitByPitch ?? 0);
    SF  += this.parseStat(s.sacFlies ?? 0);
    _2B += this.parseStat(s.doubles ?? 0);
    _3B += this.parseStat(s.triples ?? 0);
    HR  += this.parseStat(s.homeRuns ?? 0);
    SO  += this.parseStat(s.strikeOuts ?? 0);

    // Asumimos que s.gamesPlayed existe y es el número de juegos del jugador
    totalGames += this.parseStat(s.gamesPlayed ?? 0);
  }

  const singles = Math.max(0, H - _2B - _3B - HR);
  const PA_wOBA = AB + (BB - IBB) + HBP + SF; // denominador de wOBA
  if (PA_wOBA <= 0) throw new BadRequestException('Estadísticas de bateo insuficientes para el equipo');

  const wOBA = (
    0.69 * (BB - IBB) +
    0.72 * HBP +
    0.89 * singles +
    1.27 * _2B +
    1.62 * _3B +
    2.10 * HR
  ) / PA_wOBA;

  const denomBABIP = AB - SO - HR + SF;
  const babip = denomBABIP > 0 ? (H - HR) / denomBABIP : 0;

  const PA = AB + BB + HBP + SF;
  const hrRate = PA > 0 ? HR / PA : 0;
  const bbRate = PA > 0 ? (BB - IBB) / PA : 0;
  const kRate  = PA > 0 ? SO / PA : 0;

  // HR por juego (promedio del equipo)
  const gamesCount = totalGames > 0 ? totalGames : 1;
  const hrPerGame = HR / gamesCount;

  return { wOBA, babip, hrRate, bbRate, kRate, PA, AB, H, HR, hrPerGame };
}


  /** ---- ABRIDOR ---- añade bbPer9 y usa splits home/away correctos */
  private parsePitcherStats(stats: any, isHome: boolean) {
    if (!stats) throw new BadRequestException('Estadísticas de pitcheo no disponibles');

    const s = (isHome ? stats.splits?.home : stats.splits?.away) || stats;
    const ipStr = s.inningsPitched;
    const IP = typeof ipStr === 'string' ? parseFloat(ipStr) : this.parseStat(ipStr);
    if (!IP || IP <= 0) throw new BadRequestException('Innings pitched no disponible');

    const K  = this.parseStat(s.strikeOuts ?? 0);
    const BB = this.parseStat(s.baseOnBalls ?? 0);
    const H  = this.parseStat(s.hits ?? 0);
    const HR = this.parseStat(s.homeRuns ?? 0);
    const HBP = this.parseStat(s.hitByPitch ?? 0);

    const era  = this.parseStat(s.era);
    const whip = this.parseStat(s.whip);
    const kPer9  = (K / IP) * 9;
    const bbPer9 = (BB / IP) * 9;
    const hrPer9 = (HR / IP) * 9;

    // FIP opcional (constante ~3.2 genérica si no tienes la anual)
    const fipConst = 3.2;
    const fip = IP > 0 ? ((13 * HR) + 3 * (BB + HBP) - 2 * K) / IP + fipConst : era;

    return { era, whip, kPer9, bbPer9, hrPer9, fip, IP, K, BB, H, HR };
  }

  /** ---- BULLPEN ---- ponderado por IP y con métricas derivadas */
  private async calcBullpenStats(teamId: number) {
    const roster = await this.playersService.getRoster(teamId);
    const pen = roster.filter((p: any) => !p.isStarter);
    if (!pen.length) throw new BadRequestException('Estadísticas de bullpen no disponibles');

    let IP = 0, ERx9_sum = 0, WHIPxIP_sum = 0;
    let K = 0, BB = 0, HR = 0, H = 0, HBP = 0;

    for (const p of pen) {
      const st = await this.playersService.getPlayerStats(p.id, 'pitching');
      if (!st) continue;
      const s = st; // bullpen sin split home/away suele ser suficiente
      const ipStr = s.inningsPitched;
      const ip = typeof ipStr === 'string' ? parseFloat(ipStr) : this.parseStat(ipStr);
      if (!ip || ip <= 0) continue;

      const era  = this.parseStat(s.era);
      const whip = this.parseStat(s.whip);

      IP += ip;
      ERx9_sum   += era * ip;       // aproximación ponderada (era ~ ER*9/IP)
      WHIPxIP_sum += whip * ip;

      K   += this.parseStat(s.strikeOuts ?? 0);
      BB  += this.parseStat(s.baseOnBalls ?? 0);
      HR  += this.parseStat(s.homeRuns ?? 0);
      H   += this.parseStat(s.hits ?? 0);
      HBP += this.parseStat(s.hitByPitch ?? 0);
    }

    if (IP <= 0) throw new BadRequestException('Estadísticas de bullpen insuficientes');

    const era  = ERx9_sum / IP;       // ponderado
    const whip = WHIPxIP_sum / IP;    // ponderado
    const kPer9  = (K / IP) * 9;
    const bbPer9 = (BB / IP) * 9;
    const hrPer9 = (HR / IP) * 9;

    const fipConst = 3.2;
    const fip = ((13 * HR) + 3 * (BB + HBP) - 2 * K) / IP + fipConst;

    return { era, whip, kPer9, bbPer9, hrPer9, fip, IP };
  }

  private async calcRecentForm(teamId: number, games = 10) {
    const recentGames = await this.gamesService.getRecentGames(teamId, games);
    if (!recentGames?.length)
      throw new BadRequestException('No se encontraron juegos recientes para calcular forma reciente');
    const wins = recentGames.filter((g: any) => g.winnerId === teamId).length;
    return wins / recentGames.length; // 0..1
  }

  /** ---- PREDICCIÓN ---- combinación por diferencias relativas y pesos */
  async predictGame(gamePk: number) {
    const game = await this.gameDetailService.getGameDetail(gamePk);
    if (!game) throw new NotFoundException(`Juego con gamePk ${gamePk} no encontrado`);

    const homeTeam = await this.teamsService.getTeamById(game.homeTeamId);
    const awayTeam = await this.teamsService.getTeamById(game.awayTeamId);

    const homeRoster = await this.playersService.getRoster(game.homeTeamId);
    const awayRoster = await this.playersService.getRoster(game.awayTeamId);

    const homeStarterName = game.probablePitchers.home;
    const awayStarterName = game.probablePitchers.away;
    if (!homeStarterName || !awayStarterName)
      throw new NotFoundException('Probable pitcher no disponible para predicción');

    const homePitcher = homeRoster.find((p: any) => p.name === homeStarterName);
    const awayPitcher = awayRoster.find((p: any) => p.name === awayStarterName);
    if (!homePitcher || !awayPitcher)
      throw new NotFoundException('No se encontró el pitcher en el roster del equipo');

    const homePitcherStats = this.parsePitcherStats(
      await this.playersService.getPlayerStats(homePitcher.id, 'pitching'), true
    );
    const awayPitcherStats = this.parsePitcherStats(
      await this.playersService.getPlayerStats(awayPitcher.id, 'pitching'), false
    );

    const homeHitting = await this.calcTeamHitting(homeRoster, true);
    const awayHitting = await this.calcTeamHitting(awayRoster, false);
    const homeBullpen = await this.calcBullpenStats(game.homeTeamId);
    const awayBullpen = await this.calcBullpenStats(game.awayTeamId);
    const homeRecentForm = await this.calcRecentForm(game.homeTeamId);
    const awayRecentForm = await this.calcRecentForm(game.awayTeamId);

    // ---- Diferencias relativas (escala uniforme [-1,1]) ----
    const d_offense   = this.rd(homeHitting.wOBA,        awayHitting.wOBA);       // mayor mejor
    const d_sp_era    = -this.rd(homePitcherStats.era,   awayPitcherStats.era);   // menor mejor
    const d_sp_k9     = this.rd(homePitcherStats.kPer9,  awayPitcherStats.kPer9); // mayor mejor
    const d_sp_hr9    = -this.rd(homePitcherStats.hrPer9,awayPitcherStats.hrPer9);// menor mejor
    const d_bp_era    = -this.rd(homeBullpen.era,        awayBullpen.era);        // menor mejor
    const d_bp_whip   = -this.rd(homeBullpen.whip,       awayBullpen.whip);       // menor mejor
    const d_form      = this.rd(homeRecentForm,          awayRecentForm);         // mayor mejor

    // ---- Pesos (suman ~1.0) ----
    const w = {
      offense: 0.35,
      spEra:   0.15,
      spK9:    0.10,
      spHR9:   0.05,
      bpEra:   0.12,
      bpWHIP:  0.08,
      form:    0.10,
      hfa:     0.05, // ventaja de localía constante
    };

    const linear =
      w.offense * d_offense +
      w.spEra   * d_sp_era  +
      w.spK9    * d_sp_k9   +
      w.spHR9   * d_sp_hr9  +
      w.bpEra   * d_bp_era  +
      w.bpWHIP  * d_bp_whip +
      w.form    * d_form    +
      w.hfa; // sesgo a favor del local

    // Temperatura (1.0 = sensible; >1.0 más plana; <1.0 más agresiva)
    const temperature = 1.0;
    const homeWinProb = this.sigmoid(linear / temperature) * 100;
    const awayWinProb = 100 - homeWinProb;

    // Explicabilidad por factor (contribuciones)
    const contributions = {
      offense: +(w.offense * d_offense).toFixed(3),
      starterERA: +(w.spEra * d_sp_era).toFixed(3),
      starterK9: +(w.spK9 * d_sp_k9).toFixed(3),
      starterHR9: +(w.spHR9 * d_sp_hr9).toFixed(3),
      bullpenERA: +(w.bpEra * d_bp_era).toFixed(3),
      bullpenWHIP: +(w.bpWHIP * d_bp_whip).toFixed(3),
      recentForm: +(w.form * d_form).toFixed(3),
      homeField: +w.hfa.toFixed(3),
      totalLinear: +linear.toFixed(3),
    };

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
      diffs: {
        d_offense, d_sp_era, d_sp_k9, d_sp_hr9, d_bp_era, d_bp_whip, d_form
      },
      contributions,
    };
  }
}
