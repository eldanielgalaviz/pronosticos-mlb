"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Target, Users, Shield, Zap, AlertCircle, Loader2, Play } from "lucide-react"
import { getPrediction, getGameDetail, type Prediction, type GameDetail as GameDetailType } from "@/lib/api"

function BaseballDiamond({ basesOccupied = { first: false, second: false, third: false }, runners = {} }) {
  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Campo de juego */}
        <path d="M 100 180 L 20 100 L 100 20 L 180 100 Z" fill="#4ade80" stroke="#22c55e" strokeWidth="2" />
        {/* Área del infield */}
        <path d="M 100 140 L 60 100 L 100 60 L 140 100 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
        {/* Home plate */}
        <circle cx="100" cy="160" r="6" fill="white" stroke="#374151" strokeWidth="2" />
        
        {/* Primera base */}
        <rect
          x="135"
          y="95"
          width="10"
          height="10"
          fill={basesOccupied.first ? "#ef4444" : "white"}
          stroke="#374151"
          strokeWidth="2"
        />
        {basesOccupied.first && runners.first && (
          <text x="148" y="103" fontSize="8" fill="#374151" fontWeight="bold">
            {runners.first.split(' ').map(name => name[0]).join('.')}
          </text>
        )}
        
        {/* Segunda base */}
        <rect
          x="95"
          y="55"
          width="10"
          height="10"
          fill={basesOccupied.second ? "#ef4444" : "white"}
          stroke="#374151"
          strokeWidth="2"
        />
        {basesOccupied.second && runners.second && (
          <text x="78" y="63" fontSize="8" fill="#374151" fontWeight="bold">
            {runners.second.split(' ').map(name => name[0]).join('.')}
          </text>
        )}
        
        {/* Tercera base */}
        <rect
          x="55"
          y="95"
          width="10"
          height="10"
          fill={basesOccupied.third ? "#ef4444" : "white"}
          stroke="#374151"
          strokeWidth="2"
        />
        {basesOccupied.third && runners.third && (
          <text x="38" y="103" fontSize="8" fill="#374151" fontWeight="bold">
            {runners.third.split(' ').map(name => name[0]).join('.')}
          </text>
        )}
        
        {/* Montículo del pitcher */}
        <circle cx="100" cy="120" r="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
      </svg>
    </div>
  )
}

function CountDisplay({ balls = 0, strikes = 0 }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">Bolas:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 ${
                i <= balls ? "bg-green-500 border-green-500" : "bg-transparent border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">Strikes:</span>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 ${
                i <= strikes ? "bg-red-500 border-red-500" : "bg-transparent border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ScoreboardTable({ awayTeam, homeTeam, liveData }) {
  if (!liveData?.linescore?.innings) {
    return (
      <div className="bg-gray-900 text-white rounded-lg p-4">
        <div className="text-center text-gray-400">Cargando marcador...</div>
      </div>
    )
  }

  const innings = liveData.linescore.innings || []
  const awayTotal = liveData.linescore.teams?.away?.runs || 0
  const homeTotal = liveData.linescore.teams?.home?.runs || 0
  const awayHits = liveData.linescore.teams?.away?.hits || 0
  const homeHits = liveData.linescore.teams?.home?.hits || 0
  const awayErrors = liveData.linescore.teams?.away?.errors || 0
  const homeErrors = liveData.linescore.teams?.home?.errors || 0

  return (
    <div className="bg-gray-900 text-white rounded-lg p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-2 font-medium">Equipo</th>
              {innings.map((_, index) => (
                <th key={index + 1} className="text-center py-2 px-2 font-medium w-8">
                  {index + 1}
                </th>
              ))}
              <th className="text-center py-2 px-2 font-medium w-8">R</th>
              <th className="text-center py-2 px-2 font-medium w-8">H</th>
              <th className="text-center py-2 px-2 font-medium w-8">E</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td className="py-2 px-2 font-medium">{awayTeam}</td>
              {innings.map((inning, index) => (
                <td key={index} className="text-center py-2 px-2">
                  {inning.away?.runs ?? '-'}
                </td>
              ))}
              <td className="text-center py-2 px-2 font-bold text-lg">{awayTotal}</td>
              <td className="text-center py-2 px-2">{awayHits}</td>
              <td className="text-center py-2 px-2">{awayErrors}</td>
            </tr>
            <tr>
              <td className="py-2 px-2 font-medium">{homeTeam}</td>
              {innings.map((inning, index) => (
                <td key={index} className="text-center py-2 px-2">
                  {inning.home?.runs ?? '-'}
                </td>
              ))}
              <td className="text-center py-2 px-2 font-bold text-lg">{homeTotal}</td>
              <td className="text-center py-2 px-2">{homeHits}</td>
              <td className="text-center py-2 px-2">{homeErrors}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface GameDetailProps {
  gamePk: string
}

export function GameDetailComponent({ gamePk }: GameDetailProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [gameDetail, setGameDetail] = useState<GameDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveGameData, setLiveGameData] = useState<any | null>(null)

useEffect(() => {
  let interval: NodeJS.Timeout

  const loadLiveGameData = async () => {
    try {
      const res = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
      if (!res.ok) throw new Error("Error al obtener datos del juego")

      const data = await res.json()
      setLiveGameData(data)   // 👈 guarda directo
    } catch (err) {
      console.error("Error fetching live game:", err)
    }
  }

  loadLiveGameData()
  interval = setInterval(loadLiveGameData, 15000)

  return () => clearInterval(interval)
}, [gamePk])


  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true)
      setError(null)

      try {
        const gamePkNum = Number.parseInt(gamePk)
        const [gameDetailData, predictionData] = await Promise.all([
          getGameDetail(gamePkNum), 
          getPrediction(gamePkNum)
        ])

        setGameDetail(gameDetailData)
        setPrediction(predictionData)

        if (!gameDetailData && !predictionData) {
          setError("No se pudieron cargar los datos del juego")
        }
      } catch (err) {
        setError("Error al cargar los datos. Verifica que el backend esté funcionando.")
        console.error("Error loading game data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadGameData()
  }, [gamePk])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando predicción...</span>
      </div>
    )
  }

  if (error || (!prediction && !gameDetail)) {
    return (
      <div className="flex items-center gap-2 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <p className="text-sm text-destructive font-medium">Error al cargar los datos</p>
          <p className="text-xs text-destructive/80">{error || "Datos no disponibles"}</p>
        </div>
      </div>
    )
  }
  
  const displayData = prediction || gameDetail
  if (!displayData) return null

  const homeWinProbNum = prediction ? Number.parseFloat(prediction.homeWinProb.replace("%", "")) : 50
  const awayWinProbNum = prediction ? Number.parseFloat(prediction.awayWinProb.replace("%", "")) : 50

  // Extraer datos en vivo
const liveData = liveGameData?.liveData
const gameData = liveGameData?.gameData

  const currentPlay = liveData?.plays?.currentPlay
  const linescore = liveData?.linescore
  const boxscore = liveData?.boxscore

  // Estado actual del juego
  const currentInning = linescore?.currentInning || 1
  const isTopInning = linescore?.isTopInning || false
  const currentOuts = linescore?.outs || 0
  const currentBalls = linescore?.balls || 0
  const currentStrikes = linescore?.strikes || 0

  // Corredores en bases
  const runners = currentPlay?.runners || []
  const basesOccupied = {
    first: runners.some(r => r.movement?.end === '1B'),
    second: runners.some(r => r.movement?.end === '2B'),
    third: runners.some(r => r.movement?.end === '3B')
  }

  // Información de jugadores actuales
  const currentBatter = currentPlay?.matchup?.batter
  const currentPitcher = currentPlay?.matchup?.pitcher

  // Scores actuales
  const awayScore = linescore?.teams?.away?.runs || 0
  const homeScore = linescore?.teams?.home?.runs || 0

  // Helper function to find pitcher stats safely
  const findPitcherStats = (pitcherId: number | undefined, teamSide: 'home' | 'away') => {
    if (!pitcherId || !boxscore?.teams?.[teamSide]?.pitchers) return null
    return boxscore.teams[teamSide].pitchers.find(p => p.person?.id === pitcherId)
  }

  // Helper function to find batter stats safely
  const findBatterStats = (batterId: number | undefined, teamSide: 'home' | 'away') => {
    if (!batterId || !boxscore?.teams?.[teamSide]?.batters) return null
    return boxscore.teams[teamSide].batters.find(b => b.person?.id === batterId)
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-foreground">
                {prediction
                  ? `${prediction.awayTeam} vs ${prediction.homeTeam}`
                  : gameDetail
                    ? `${gameDetail.awayTeam} vs ${gameDetail.homeTeam}`
                    : "Cargando..."}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{displayData.venue}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {new Date(prediction?.date || gameDetail?.gameDate || "").toLocaleDateString("es-ES")}
              </Badge>
              <Badge variant={linescore?.inningState === 'End' ? 'outline' : 'default'}>
                {linescore?.inningState || 'Programado'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {prediction && (
        <>
          {/* Win Probability */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5 text-primary" />
                Probabilidad de Victoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">{prediction.awayWinProb}</div>
                  <div className="text-sm text-muted-foreground">{prediction.awayTeam}</div>
                  <Progress value={awayWinProbNum} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">{prediction.homeWinProb}</div>
                  <div className="text-sm text-muted-foreground">{prediction.homeTeam}</div>
                  <Progress value={homeWinProbNum} className="h-2" />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Justificación de la Predicción</h4>
                <p className="text-sm text-muted-foreground">
                  Los {prediction.homeTeam} tienen ventaja debido a su superior ofensiva (wOBA:{" "}
                  {prediction.factors.homeHitting.wOBA}) y la calidad de su pitcher abridor {prediction.homeStarterName}{" "}
                  (ERA: {prediction.factors.homePitcherStats.era}). Sus{" "}
                  {(prediction.factors.homeRecentForm * 10).toFixed(0)} victorias de los últimos 10 partidos también favorecen el pronóstico.
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="live" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="live">En Vivo</TabsTrigger>
              <TabsTrigger value="pitchers">Pitchers</TabsTrigger>
              <TabsTrigger value="hitting">Bateo</TabsTrigger>
              <TabsTrigger value="bullpen">Bullpen</TabsTrigger>
              <TabsTrigger value="form">Forma</TabsTrigger>
            </TabsList>

            <TabsContent value="live">
              <div className="space-y-6">
                <Card className="bg-gray-900 text-white border-gray-700">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Información del pitcher actual */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            P
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {currentPitcher?.fullName || "Esperando..."}
                            </h3>
                            <p className="text-sm text-gray-300">Lanzador</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <div className="text-xs text-gray-400">IP</div>
                            <div className="font-bold">
                              {currentPitcher?.id ? 
                                findPitcherStats(currentPitcher.id, isTopInning ? 'home' : 'away')?.stats?.pitching?.inningsPitched || "-"
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">H</div>
                            <div className="font-bold">
                              {currentPitcher?.id ? 
                                findPitcherStats(currentPitcher.id, isTopInning ? 'home' : 'away')?.stats?.pitching?.hits || "-"
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">BB</div>
                            <div className="font-bold">
                              {currentPitcher?.id ? 
                                findPitcherStats(currentPitcher.id, isTopInning ? 'home' : 'away')?.stats?.pitching?.baseOnBalls || "-"
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">K</div>
                            <div className="font-bold">
                              {currentPitcher?.id ? 
                                findPitcherStats(currentPitcher.id, isTopInning ? 'home' : 'away')?.stats?.pitching?.strikeOuts || "-"
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Situación del juego */}
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-4xl font-bold">{awayScore}-{homeScore}</div>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-2xl font-bold">{currentInning}</span>
                              <div className="flex flex-col">
                                <div
                                  className={`w-0 h-0 border-l-4 border-r-4 border-transparent ${
                                    isTopInning ? "border-b-4 border-b-white" : "border-b-4 border-b-gray-500"
                                  }`}
                                ></div>
                                <div
                                  className={`w-0 h-0 border-l-4 border-r-4 border-transparent ${
                                    !isTopInning ? "border-t-4 border-t-white" : "border-t-4 border-t-gray-500"
                                  }`}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <CountDisplay balls={currentBalls} strikes={currentStrikes} />
                        <div className="text-sm text-gray-300">
                          {currentOuts} {currentOuts === 1 ? "out" : "outs"}
                        </div>
                      </div>

                      {/* Información del bateador actual */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            B
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {currentBatter?.fullName || "Esperando..."}
                            </h3>
                            <p className="text-sm text-gray-300">Bateador</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <div className="text-xs text-gray-400">AB</div>
                            <div className="font-bold">
                              {currentBatter?.id ? 
                                findBatterStats(currentBatter.id, isTopInning ? 'away' : 'home')?.stats?.batting?.atBats || "-"
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">R</div>
                            <div className="font-bold">
                              {currentBatter?.id ? 
                                findBatterStats(currentBatter.id, isTopInning ? 'away' : 'home')?.stats?.batting?.runs || "-"
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">H</div>
                            <div className="font-bold">
                              {currentBatter?.id ? 
                                findBatterStats(currentBatter.id, isTopInning ? 'away' : 'home')?.stats?.batting?.hits || "-"
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">RBI</div>
                            <div className="font-bold">
                              {currentBatter?.id ? 
                                findBatterStats(currentBatter.id, isTopInning ? 'away' : 'home')?.stats?.batting?.rbi || "-"
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diamante de baseball */}
                    <div className="mt-6">
                      <BaseballDiamond 
                        basesOccupied={basesOccupied}
                        runners={{
                          first: runners.find(r => r.movement?.end === '1B')?.details?.runner?.fullName,
                          second: runners.find(r => r.movement?.end === '2B')?.details?.runner?.fullName,
                          third: runners.find(r => r.movement?.end === '3B')?.details?.runner?.fullName,
                        }}
                      />
                      <div className="text-center mt-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">1B</span>
                            <div className="font-medium">
                              {basesOccupied.first 
                                ? runners.find(r => r.movement?.end === '1B')?.details?.runner?.fullName || "Ocupada"
                                : "Vacía"
                              }
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">2B</span>
                            <div className="font-medium">
                              {basesOccupied.second 
                                ? runners.find(r => r.movement?.end === '2B')?.details?.runner?.fullName || "Ocupada"
                                : "Vacía"
                              }
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">3B</span>
                            <div className="font-medium">
                              {basesOccupied.third 
                                ? runners.find(r => r.movement?.end === '3B')?.details?.runner?.fullName || "Ocupada"
                                : "Vacía"
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Última jugada */}
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Última Jugada</span>
                      </div>
                      <p className="text-sm">
                        {currentPlay?.result?.description || "Esperando jugada..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla de puntuación por innings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Marcador</h3>
                    <div className="flex gap-4">
                      <Badge variant="outline">Live</Badge>
                      <Badge variant="outline">Entrada {currentInning}</Badge>
                      <Badge variant="outline">{isTopInning ? 'Alta' : 'Baja'}</Badge>
                    </div>
                  </div>
                  <ScoreboardTable
                    awayTeam={prediction?.awayTeam || gameDetail?.awayTeam}
                    homeTeam={prediction?.homeTeam || gameDetail?.homeTeam}
                    liveData={liveData}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pitchers">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">{prediction.awayStarterName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{prediction.awayTeam}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ERA:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayPitcherStats.era}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WHIP:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayPitcherStats.whip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">K/9:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayPitcherStats.kPer9}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HR/9:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayPitcherStats.hrPer9}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">{prediction.homeStarterName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{prediction.homeTeam}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ERA:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homePitcherStats.era}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WHIP:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homePitcherStats.whip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">K/9:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homePitcherStats.kPer9}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HR/9:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homePitcherStats.hrPer9}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hitting">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Users className="h-5 w-5" />
                      {prediction.awayTeam}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">wOBA:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayHitting.wOBA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BABIP:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayHitting.babip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HR/Juego:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayHitting.hrPerGame}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Users className="h-5 w-5" />
                      {prediction.homeTeam}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">wOBA:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homeHitting.wOBA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BABIP:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homeHitting.babip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HR/Juego:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homeHitting.hrPerGame}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bullpen">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Shield className="h-5 w-5" />
                      {prediction.awayTeam} Bullpen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ERA:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayBullpen.era}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WHIP:</span>
                      <span className="font-medium text-foreground">{prediction.factors.awayBullpen.whip}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Shield className="h-5 w-5" />
                      {prediction.homeTeam} Bullpen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ERA:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homeBullpen.era}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WHIP:</span>
                      <span className="font-medium text-foreground">{prediction.factors.homeBullpen.whip}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="form">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Zap className="h-5 w-5" />
                      {prediction.awayTeam}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Victorias recientes de los últimos 10 partidos:</span>
                        <span className="font-medium text-foreground">
                          {(prediction.factors.awayRecentForm * 10).toFixed(0)}
                        </span>
                      </div>
                      <Progress value={prediction.factors.awayRecentForm * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Zap className="h-5 w-5" />
                      {prediction.homeTeam}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Victorias recientes de los últimos 10 partidos:</span>
                        <span className="font-medium text-foreground">
                          {(prediction.factors.homeRecentForm * 10).toFixed(0)}
                        </span>
                      </div>
                      <Progress value={prediction.factors.homeRecentForm * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!prediction && gameDetail && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-primary" />
              Información del Juego
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Pitchers Probables</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{gameDetail.awayTeam}:</span>
                  <span className="font-medium text-foreground">{gameDetail.probablePitchers.away}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{gameDetail.homeTeam}:</span>
                  <span className="font-medium text-foreground">{gameDetail.probablePitchers.home}</span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                La predicción detallada no está disponible para este juego. Verifica que el backend esté funcionando
                correctamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { GameDetailComponent as GameDetail }