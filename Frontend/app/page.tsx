import { GamesList } from "@/components/games-list"
import { Header } from "@/components/header"
import Script from 'next/script'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">MLB Predictions & Analytics</h1>
          <p className="text-muted-foreground text-lg">
            Análisis avanzado y predicciones para los próximos juegos de la MLB
          </p>
        </div>
        <GamesList />
      </main>
      
      {/* Google AdSense Script */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3982270058016354"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </div>
  )
}