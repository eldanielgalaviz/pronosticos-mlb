"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export function GlobalLoading() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Mostrar loading cuando cambie la ruta
    setLoading(true)
    
    // Ocultar loading después de un pequeño delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500) // Ajusta este tiempo según necesites

    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando juegos...</span>
      </div>
    </div>
  )
}