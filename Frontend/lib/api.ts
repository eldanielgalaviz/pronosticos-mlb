const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"

export interface Game {
  gamePk: number
  date: string
  status: string
  home: string
  away: string
  venue: string
  homeTeamId: number
  awayTeamId: number
  homeScore?: number
  awayScore?: number
  probablePitchers: {
    homeId?: number
    awayId?: number
  }
}

export interface GameDetail {
  gamePk: number
  gameDate: string
  venue: string
  homeTeam: string
  awayTeam: string
  homeTeamId: number
  awayTeamId: number
  probablePitchers: {
    home: string
    away: string
  }
  linescore?: any
}

export interface Prediction {
  gamePk: number
  date: string
  venue: string
  homeTeam: string
  awayTeam: string
  homeStarterName: string
  awayStarterName: string
  homeWinProb: string
  awayWinProb: string
  factors: {
    homeHitting: any
    awayHitting: any
    homePitcherStats: any
    awayPitcherStats: any
    homeBullpen: any
    awayBullpen: any
    homeRecentForm: number
    awayRecentForm: number
  }
}

export async function getGamesByDate(date: string): Promise<Game[]> {
  try {
    const response = await fetch(`${API_BASE}/games?date=${date}`)
    if (!response.ok) throw new Error("Failed to fetch games")
    return await response.json()
  } catch (error) {
    console.error("Error fetching games:", error)
    return []
  }
}

export async function getGameDetail(gamePk: number): Promise<GameDetail | null> {
  try {
    const response = await fetch(`${API_BASE}/game/${gamePk}`)
    if (!response.ok) throw new Error("Failed to fetch game detail")
    return await response.json()
  } catch (error) {
    console.error("Error fetching game detail:", error)
    return null
  }
}

export async function getPrediction(gamePk: number): Promise<Prediction | null> {
  try {
    const response = await fetch(`${API_BASE}/predict/${gamePk}`)
    if (!response.ok) throw new Error("Failed to fetch prediction")
    return await response.json()
  } catch (error) {
    console.error("Error fetching prediction:", error)
    return null
  }
}
