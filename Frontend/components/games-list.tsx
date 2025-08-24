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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true) // ✅ Mostrar loading
      setError(null)
      
      try {
        // Tu llamada al backend aquí
        const response = await fetch('/api/games') // Ajusta tu endpoint
        if (!response.ok) {
          throw new Error('Error al cargar juegos')
        }
        
        const gamesData = await response.json()
        setGames(gamesData)
      } catch (err) {
        console.error('Error loading games:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false) // ✅ Ocultar loading cuando termine
      }
    }

    loadGames()
  }, [])

  // ✅ Loading screen - esto es lo que quieres
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando juegos...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Reintentar
        </button>
      </div>
    )
  }

  // No games
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay juegos disponibles</p>
      </div>
    )
  }

  // Render games
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