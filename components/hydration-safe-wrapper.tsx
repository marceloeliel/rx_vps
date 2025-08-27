"use client"

import { useEffect, useState } from 'react'

interface HydrationSafeWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente para suprimir erros de hidratação causados por extensões do navegador
 * que adicionam atributos como bis_skin_checked, data-darkreader-*, etc.
 */
export function HydrationSafeWrapper({ children, fallback = null }: HydrationSafeWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <>{fallback}</>
  }

  return <div suppressHydrationWarning>{children}</div>
}