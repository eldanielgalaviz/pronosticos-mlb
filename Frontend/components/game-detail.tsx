"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Target, Users, Shield, Zap, AlertCircle, Loader2 } from "lucide-react"
import { getPrediction, getGameDetail, type Prediction, type GameDetail as GameDetailType } from "@/lib/api"

interface GameDetailProps {
  gamePk: string
}

export function GameDetailComponent({ gamePk }: GameDetailProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [gameDetail, setGameDetail] = useState<GameDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true)
      setError(null)

      try {
        const gamePkNum = Number.parseInt(gamePk)

        // Cargar detalles del juego y predicción en paralelo
        const [gameDetailData, predictionData] = await Promise.all([getGameDetail(gamePkNum), getPrediction(gamePkNum)])

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

  // Usar datos de predicción o gameDetail según disponibilidad
  const displayData = prediction || gameDetail
  if (!displayData) return null

  const homeWinProbNum = prediction ? Number.parseFloat(prediction.homeWinProb.replace("%", "")) : 50
  const awayWinProbNum = prediction ? Number.parseFloat(prediction.awayWinProb.replace("%", "")) : 50

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
            <Badge variant="secondary">
              {new Date(prediction?.date || gameDetail?.gameDate || "").toLocaleDateString("es-ES")}
            </Badge>
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
                  (ERA: {prediction.factors.homePitcherStats.era}). Su forma reciente (
                  {(prediction.factors.homeRecentForm * 100).toFixed(0)}% de victorias) también favorece el pronóstico.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="pitchers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pitchers">Pitchers</TabsTrigger>
              <TabsTrigger value="hitting">Bateo</TabsTrigger>
              <TabsTrigger value="bullpen">Bullpen</TabsTrigger>
              <TabsTrigger value="form">Forma</TabsTrigger>
            </TabsList>

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
                        <span className="text-muted-foreground">Forma Reciente:</span>
                        <span className="font-medium text-foreground">
                          {(prediction.factors.awayRecentForm * 100).toFixed(0)}%
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
                        <span className="text-muted-foreground">Forma Reciente:</span>
                        <span className="font-medium text-foreground">
                          {(prediction.factors.homeRecentForm * 100).toFixed(0)}%
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
