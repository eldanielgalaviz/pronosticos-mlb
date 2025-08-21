import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PlayersService {
  constructor(private readonly http: HttpService) {}

  // Obtener roster del equipo
  async getRoster(teamId: number) {
    const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster`;
    const { data } = await firstValueFrom(this.http.get(url));

    if (!data?.roster) throw new NotFoundException(`Roster del equipo ${teamId} no encontrado`);

    return data.roster.map((p) => ({
      id: p.person.id,
      name: p.person.fullName,
      position: p.position.abbreviation,
    }));
  }

  // Información general del jugador
  async getPlayerInfo(playerId: number) {
    const url = `https://statsapi.mlb.com/api/v1/people/${playerId}`;
    const { data } = await firstValueFrom(this.http.get(url));

    if (!data?.people?.length) throw new NotFoundException(`Jugador ${playerId} no encontrado`);

    return data.people[0];
  }

  // Estadísticas del jugador
  async getPlayerStats(playerId: number, type: 'hitting' | 'pitching', season = new Date().getFullYear()) {
    const url = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=statsSingleSeason&season=${season}&group=${type}`;
    const { data } = await firstValueFrom(this.http.get(url));

    const splits = data.stats?.[0]?.splits;
    if (!splits?.length) {
      // Si no hay estadísticas reales, devolvemos null en vez de valores por defecto
      return null;
    }

    return splits[0].stat;
  }

  // Último pitcher que inició un juego del equipo
  async getLastStartingPitcher(teamId: number): Promise<number | null> {
    // Obtenemos roster
    const roster = await this.getRoster(teamId);
    if (!roster?.length) return null;

    // Filtramos pitchers (P)
    const pitchers = roster.filter(player => player.position === 'P');
    if (!pitchers.length) return null;

    // Tomamos el primero encontrado (puedes luego optimizar buscando el que jugó más recientemente)
    return pitchers[0].id;
  }
}
