"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, TrendingUp, User } from "lucide-react"
import Link from "next/link"
import type { Game, GameDetail } from "@/lib/api"
import { getGameDetail } from "@/lib/api"

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null)
  const [loadingPitchers, setLoadingPitchers] = useState(false)

  const gameTime = new Date(game.date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Función para obtener el variant y texto del status
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      'Scheduled': { variant: 'secondary', text: 'Programado', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
      'Pre-Game': { variant: 'secondary', text: 'Próximamente', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
      'In Progress': { variant: 'destructive', text: 'En Vivo', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
      'Live': { variant: 'destructive', text: 'En Vivo', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
      'Final': { variant: 'outline', text: 'Finalizado', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
      'Postponed': { variant: 'secondary', text: 'Pospuesto', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
      'Cancelled': { variant: 'outline', text: 'Cancelado', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
      'Warmup': { variant: 'default', text: 'Calentamiento', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
    }
    
    return statusConfig[status] || { variant: 'secondary', text: status, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' }
  }

  const statusDisplay = getStatusDisplay(game.status)

  // Cargar detalles del juego para obtener pitchers probables
  useEffect(() => {
    const loadGameDetail = async () => {
      setLoadingPitchers(true)
      try {
        const detail = await getGameDetail(game.gamePk)
        setGameDetail(detail)
      } catch (error) {
        console.error("Error loading game detail:", error)
        // No mostrar error en la card, solo fallar silenciosamente
      } finally {
        setLoadingPitchers(false)
      }
    }

    // Solo cargar si no tenemos los datos aún
    if (game.status !== 'Final' && !gameDetail) {
      loadGameDetail()
    }
  }, [game.gamePk, game.status, gameDetail])

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* Badge con colores personalizados */}
          <Badge 
            variant={statusDisplay.variant} 
            className={`text-xs ${statusDisplay.color}`}
          >
            {statusDisplay.text}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {gameTime}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams Matchup */}
        <div className="text-center">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-foreground">{game.away}</div>
            <div className="text-sm text-muted-foreground font-medium">vs</div>
            <div className="text-lg font-semibold text-foreground">{game.home}</div>
          </div>
        </div>

        {/* Score if game is finished or in progress */}
        {game.homeScore !== undefined && game.awayScore !== undefined && (
          <div className="text-center bg-muted/50 rounded-lg p-2">
            <div className="text-sm font-medium">
              {game.away} {game.awayScore} - {game.homeScore} {game.home}
            </div>
          </div>
        )}

        {/* Probable Pitchers - Solo mostrar si el juego no ha terminado */}
        {game.status !== 'Final' && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pitchers Probables
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{game.away}:</span>
                <span className="font-medium text-foreground">
                  {loadingPitchers ? (
                    <span className="text-muted-foreground">Cargando...</span>
                  ) : (
                    gameDetail?.probablePitchers?.away || "TBD"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{game.home}:</span>
                <span className="font-medium text-foreground">
                  {loadingPitchers ? (
                    <span className="text-muted-foreground">Cargando...</span>
                  ) : (
                    gameDetail?.probablePitchers?.home || "TBD"
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Venue */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {game.venue}
        </div>

        {/* Action Button */}
        <Link href={`/game/${game.gamePk}`}>
          <Button className="w-full" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Predicción
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}