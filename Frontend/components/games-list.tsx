"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
// Importa tus otros componentes aquí

interface Game {
  gamePk: string
  date: string
  home: string
  away: string
  // ... otras propiedades
}

export function GamesList() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true) // ✅ Empezar con loading en true

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true) // ✅ Mostrar loading
      
      try {
        // Tu llamada al backend aquí
        const response = await fetch('/api/games') // Ajusta tu endpoint
        const gamesData = await response.json()
        setGames(gamesData)
      } catch (err) {
        console.error('Error loading games:', err)
        // No mostrar error, solo log en consola
      } finally {
        setLoading(false) // ✅ Ocultar loading cuando termine
      }
    }

    loadGames()
  }, [])

  // ✅ Loading screen - solo esto
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando juegos...</span>
      </div>
    )
  }

  // ✅ Cuando termine de cargar, mostrar los juegos
  return (
    <div className="space-y-4">
      {/* Tu contenido de juegos aquí */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div key={game.gamePk}>
            {/* Tu GameCard component aquí */}
          </div>
        ))}
      </div>
    </div>
  )
}