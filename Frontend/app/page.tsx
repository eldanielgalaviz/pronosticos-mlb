import { GamesList } from "@/components/games-list"
import { Header } from "@/components/header"
import Head from 'next/head'
import Script from 'next/script'

export default function HomePage() {
  return (
    <>
      <Head>
        <meta name="google-adsense-account" content="ca-pub-3982270058016354" />
        <meta name="google-site-verification" content="jV0KzUpyuzexdw8gPsrPrm3QhmAPSW1JkZw6RvCxgYU" />
      </Head>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Predicciones MLB 
            </h1>
            <p className="text-muted-foreground text-lg">
              Análisis avanzado y predicciones para los próximos juegos de la MLB
              Basado en los ultimos 10 juegos
            </p>
          </div>
          
          {/* 🚀 Banner Publicitario */}
          <div className="mt-10 flex justify-center">
            <Script id="ads-banner" strategy="afterInteractive">
              {`
                atOptions = {
                  'key' : '39c089ef1b2c7edeae4fe57c6e47834b',
                  'format' : 'iframe',
                  'height' : 60,
                  'width' : 468,
                  'params' : {}
                };
              `}
            </Script>
            <Script
              id="ads-banner-src"
              src="//www.highperformanceformat.com/39c089ef1b2c7edeae4fe57c6e47834b/invoke.js"
              strategy="afterInteractive"
            />
          </div>

          {/* ✅ El loading ahora está dentro de GamesList */}
          <GamesList />


          {/* 🔗 Smartlink */}
          <div className="mt-10 text-center">
            <a
              href="https://www.profitableratecpm.com/ykyz9cwg?key=0c5bc9aabe65b3c4e90097380d5d9ca9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-700"
            >
              👉 Ver más contenido aquí
            </a>
          </div>

          {/* 🟢 Barra Social */}
          {/* <div className="mt-10 flex justify-center">
            <Script
              id="social-bar"
              src="//pl27509465.profitableratecpm.com/02/9c/15/029c150864519d747c9de77c68741df6.js"
              strategy="afterInteractive"
            />
          </div> */}
        </main>

        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3982270058016354"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        
      </div>
    </>
  )
}
