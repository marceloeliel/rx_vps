import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RX Autos - Marketplace de Veículos",
  description: "Encontre o veículo perfeito para você na RX Autos",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  keywords: ['veículos', 'carros', 'marketplace', 'comprar carro', 'vender carro'],
  authors: [{ name: 'RX Autos Team' }],
  creator: 'RX Autos',
  publisher: 'RX Autos',
  applicationName: 'RX Autos',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/images/rxveiculos.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/rxveiculos.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/rxveiculos.png', sizes: '96x96', type: 'image/png' },
      { url: '/images/rxveiculos.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/rxveiculos.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/images/rxveiculos.png',
    apple: [
      { url: '/images/rxveiculos.png', sizes: '152x152', type: 'image/png' },
      { url: '/images/rxveiculos.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'RX Autos',
    title: 'RX Autos - Marketplace de Veículos',
    description: 'Encontre o veículo perfeito para você na RX Autos',
    images: [
      {
        url: '/images/hero-car.png',
        width: 1200,
        height: 630,
        alt: 'RX Autos - Marketplace de Veículos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RX Autos - Marketplace de Veículos',
    description: 'Encontre o veículo perfeito para você na RX Autos',
    images: ['/images/hero-car.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RX Autos',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'RX Autos',
    'msapplication-TileColor': '#f97316',
    'msapplication-tap-highlight': 'no',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#f97316' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster />
        
        {/* Service Worker Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
