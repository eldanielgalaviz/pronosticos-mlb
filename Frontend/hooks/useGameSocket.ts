import { useEffect, useRef, useState } from 'react'
import io, { Socket } from 'socket.io-client'

interface GameUpdate {
  timestamp: string
  balls: number
  strikes: number
  outs: number
  currentInning: number
  isTopInning: boolean
  inningState: string
  homeScore: number
  awayScore: number
  currentPitcher: any
  currentBatter: any
  lastPlay: string
  boxscore: any
}

export function useGameSocket(gamePk: string, backendUrl: string = 'http://localhost:8000') {
  const [connected, setConnected] = useState(false)
  const [gameData, setGameData] = useState<GameUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Conectar a WebSocket
    const socket = io(`${backendUrl}/game-updates`, {
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to WebSocket')
      setConnected(true)
      setError(null)
      
      // Suscribirse al juego
      socket.emit('subscribe-to-game', { gamePk })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket')
      setConnected(false)
    })

    socket.on('game-update', (data: GameUpdate) => {
      console.log('Received game update:', data)
      setGameData(data)
      setLastUpdate(new Date())
      setError(null)
    })

    socket.on('game-error', (errorData: any) => {
      console.error('Game error:', errorData)
      setError(errorData.message || 'Error en la conexión')
    })

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err)
      setConnected(false)
      setError('Error de conexión con el servidor')
    })

    return () => {
      if (socket) {
        socket.emit('unsubscribe-from-game')
        socket.disconnect()
      }
    }
  }, [gamePk, backendUrl])

  const forceUpdate = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('force-update', { gamePk })
    }
  }

  return {
    connected,
    gameData,
    error,
    lastUpdate,
    forceUpdate
  }
}