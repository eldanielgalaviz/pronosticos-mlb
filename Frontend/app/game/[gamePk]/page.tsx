import { GameDetail } from "@/components/game-detail"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface GamePageProps {
  params: Promise<{
    gamePk: string
  }>
}

export default async function GamePage({ params }: GamePageProps) {
  // Await params before using it
  const { gamePk } = await params

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Juegos
            </Button>
          </Link>
        </div>
        <GameDetail gamePk={gamePk} />
      </main>
    </div>
  )
}