// app/sitemap.xml/route.ts
import { getGamesByDate } from "@/lib/api"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Obtener juegos de los próximos 7 días
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }

    // Obtener todos los juegos de todas las fechas
    const allGames = []
    for (const date of dates) {
      try {
        const games = await getGamesByDate(date)
        allGames.push(...games)
      } catch (error) {
        console.error(`Error fetching games for ${date}:`, error)
        // Continuar con las otras fechas aunque una falle
      }
    }

    // Generar el sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pronosticosmlb.vercel.app</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  ${allGames.map(game => `
  <url>
    <loc>https://pronosticosmlb.vercel.app/game/${game.gamePk}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        // Cache por 1 hora
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Sitemap de fallback solo con la homepage
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pronosticosmlb.vercel.app</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }
}