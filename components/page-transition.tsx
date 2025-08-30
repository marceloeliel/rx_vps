"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2, Car } from 'lucide-react'

interface PageTransitionProps {
  children: React.ReactNode
}

// Componente para suprimir erros de hidratação causados por extensões do navegador
function HydrationSafeWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Suprimir erros de hidratação específicos de extensões do navegador
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      const fullMessage = args.join(' ').toLowerCase()
      
      // Padrões de extensões conhecidas
      const extensionPatterns = [
        'bis_skin_checked',
        'data-lastpass-icon-root',
        'data-dashlane-rid',
        'data-bitwarden-watching',
        'data-1p-ignore',
        'data-gramm'
      ]
      
      // Verificar se é erro de hidratação específico de extensão
      const isHydrationError = fullMessage.includes('hydration') || 
                              fullMessage.includes('server rendered html') ||
                              fullMessage.includes('didn\'t match the client')
      
      const hasExtensionAttribute = extensionPatterns.some(pattern => 
        fullMessage.includes(pattern.toLowerCase())
      )
      
      // Silenciar apenas erros de hidratação com atributos de extensão
      if (isHydrationError && hasExtensionAttribute) {
        return
      }
      
      // Permitir TODOS os outros erros (incluindo erros de aplicação)
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  // Durante a hidratação, renderizar de forma segura
  if (!isClient) {
    return <>{children}</>
  }

  return <>{children}</>
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [previousPathname, setPreviousPathname] = useState(pathname)

  useEffect(() => {
    if (pathname !== previousPathname) {
      setIsTransitioning(true)
      
      // Simular um pequeno delay para mostrar a transição
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setPreviousPathname(pathname)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [pathname, previousPathname])

  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Logo animado */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-gray-900">RX Autos</div>
              <div className="text-xs text-gray-600">Carregando...</div>
            </div>
          </div>
          
          {/* Spinner otimizado */}
          <div className="relative">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-48 bg-gray-200 rounded-full h-1 mx-auto">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full transition-all duration-300 ease-out"
              style={{
                width: '100%',
                animation: 'progress-bar 300ms ease-out'
              }}
            />
          </div>
        </div>
        
        <style jsx>{`
          @keyframes progress-bar {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <HydrationSafeWrapper>
      <div className="animate-in fade-in duration-200">
        {children}
      </div>
    </HydrationSafeWrapper>
  )
}

// Hook para controlar transições manuais
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const startTransition = () => {
    setIsTransitioning(true)
  }

  const endTransition = () => {
    setIsTransitioning(false)
  }

  return {
    isTransitioning,
    startTransition,
    endTransition
  }
}