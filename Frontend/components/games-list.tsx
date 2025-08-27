"use client"

import { useState, useEffect } from "react"
import { GameCard } from "./game-card"
import { Button } from "@/components/ui/button"
import { Calendar, RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import { getGamesByDate, type Game } from "@/lib/api"

function NativeBannerHighPerformance() {
  useEffect(() => {
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "//www.highperformanceformat.com/39c089ef1b2c7edeae4fe57c6e47834b/invoke.js"
    script.async = true

    const banner = document.getElementById("highperf-banner")
    if (banner) {
      banner.appendChild(script)
    }

    // Configuración del banner
    ;(window as any).atOptions = {
      key: "39c089ef1b2c7edeae4fe57c6e47834b",
      format: "iframe",
      height: 60,
      width: 468,
      params: {}
    }
  }, [])

  return <div id="highperf-banner" className="flex justify-center my-8"></div>
}

export function GamesList() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const loadGames = async (date: string) => {
    setLoading(true)
    setError(null)
    try {
      const gamesData = await getGamesByDate(date)
      setGames(gamesData)
    } catch (err) {
      setError("Error al cargar los juegos. Verifica que el backend esté funcionando.")
      console.error("Error loading games:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGames(selectedDate)
  }, [selectedDate])

  const refreshGames = () => {
    loadGames(selectedDate)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando juegos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de fecha y botón actualizar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <Button onClick={refreshGames} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {loading ? "Cargando..." : `${games.length} juegos programados`}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Sin juegos */}
      {!loading && !error && games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay juegos programados para esta fecha</p>
        </div>
      )}

      {/* Lista de juegos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.gamePk} game={game} />
        ))}
      </div>

      {/* Banner */}
      <NativeBannerHighPerformance />
    </div>
  )
}
