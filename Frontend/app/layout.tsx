import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalLoading } from "@/components/global-loading"
import "./globals.css"

export const metadata: Metadata = {
  title: "Predicciones MLB GRATIS - Análisis y Predicciones",
  description: "Plataforma profesional de predicciones y estadísticas de MLB",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GlobalLoading />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}