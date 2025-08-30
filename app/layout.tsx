import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { HydrationSafe } from "@/components/hydration-safe"

import { TrialNotificationBar } from "@/components/trial-notification-bar"
import { PageTransition } from "@/components/page-transition"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://rxnegocios.com.br'),
  title: {
    template: '%s | RX AUTOS',
    default: 'RX NEGOCIO | Conectando Agências de Carros com Compradores',
  },
  description: 'A RX Negocio é a plataforma ideal para quem quer vender ou comprar veículos com agilidade, segurança e praticidade. Conectamos agências de carros e revendas a compradores qualificados, facilitando negociações transparentes, com suporte e tecnologia de ponta.',
  applicationName: 'RX AUTOS',
  keywords: ['carros', 'veículos', 'compra', 'venda', 'agência', 'revenda', 'automóveis', 'negócios', 'rx negocio', 'rx autos'],
  authors: [{ name: 'RX NEGOCIO' }],
  creator: 'RX NEGOCIO',
  publisher: 'RX NEGOCIO',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RX AUTOS',
    startupImage: [
      {
        url: '/images/pwa/icon-192x192.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/images/pwa/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/images/pwa/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/images/pwa/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/images/pwa/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/images/pwa/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/images/pwa/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/pwa/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/images/pwa/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/pwa/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/images/pwa/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'RX NEGOCIO | Conectando Agências de Carros com Compradores',
    description: 'A RX Negocio é a plataforma ideal para quem quer vender ou comprar veículos com agilidade, segurança e praticidade. Conectamos agências de carros e revendas a compradores qualificados.',
    url: 'https://rxnegocios.com.br',
    siteName: 'RX AUTOS',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'RX NEGOCIO - Plataforma de Negócios Automotivos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RX NEGOCIO | Conectando Agências de Carros com Compradores',
    description: 'Plataforma ideal para compra e venda de veículos com agilidade e segurança.',
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'adicionar_codigo_verificacao_google',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'RX AUTOS',
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
        <HydrationSafe>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <TrialNotificationBar />
              <main className="flex-grow">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
          </Providers>
          <Toaster />
        </HydrationSafe>

        
        {/* Service Worker Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async function() {
                  try {
                    // Registrar service worker
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('SW registered: ', registration);
                  } catch (error) {
                    console.log('SW registration failed: ', error);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
