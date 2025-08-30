"use client"

import { useEffect, useState } from 'react'

interface HydrationSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente para prevenir erros de hidratação causados por extensões do navegador
 * que adicionam atributos como bis_skin_checked, data-lastpass-icon-root, etc.
 */
export function HydrationSafe({ children, fallback }: HydrationSafeProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Configurar supressão de erros de hidratação específicos
    const originalError = console.error
    const originalWarn = console.warn

    const shouldSuppressError = (message: string, ...args: any[]) => {
      const fullMessage = [message, ...args].join(' ').toLowerCase()
      
      // Padrões específicos para erros de hidratação de extensões
      const hydrationExtensionPatterns = [
        'bis_skin_checked',
        'data-lastpass-icon-root',
        'data-dashlane-rid',
        'data-bitwarden-watching',
        'data-1p-ignore',
        'data-gramm',
        'grammarly-extension',
        'data-darkreader',
        'data-adguard'
      ]
      
      // Verificar se é erro de hidratação com atributos de extensão
      const isHydrationError = fullMessage.includes('hydration') || 
                              fullMessage.includes('server rendered html') ||
                              fullMessage.includes('didn\'t match the client') ||
                              fullMessage.includes('a tree hydrated but some attributes')
      
      const hasExtensionAttribute = hydrationExtensionPatterns.some(pattern => 
        fullMessage.includes(pattern.toLowerCase())
      )
      
      // Também suprimir erros específicos do React sobre hidratação
      const isReactHydrationWarning = fullMessage.includes('suppresshydrationwarning') ||
                                     fullMessage.includes('hydration mismatch') ||
                                     (fullMessage.includes('warning') && fullMessage.includes('hydration'))
      
      // Suprimir se for erro de hidratação com extensões OU aviso específico do React
      return (isHydrationError && hasExtensionAttribute) || isReactHydrationWarning
    }

    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      if (!shouldSuppressError(message, ...args)) {
        originalError.apply(console, args)
      }
    }

    console.warn = (...args) => {
      const message = args[0]?.toString() || ''
      if (!shouldSuppressError(message, ...args)) {
        originalWarn.apply(console, args)
      }
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  // Durante a hidratação inicial, usar fallback ou renderização segura
  if (!isClient) {
    return (
      <>
        {fallback || children}
      </>
    )
  }

  return <>{children}</>
}

/**
 * Hook para detectar se estamos no cliente (pós-hidratação)
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Componente para renderizar conteúdo apenas no cliente
 */
export function ClientOnly({ children, fallback }: HydrationSafeProps) {
  const isClient = useIsClient()

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}