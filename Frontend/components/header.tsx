import { BeerIcon as Baseball } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Baseball className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">MLB Predictor</h1>
            <p className="text-sm text-muted-foreground">Análisis Profesional</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
