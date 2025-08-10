"use client"

import { Suspense, lazy, ComponentType, ReactNode, useState, useEffect, useCallback, useRef } from 'react'
import { LoadingScreen } from './loading-screen'

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  loadingMessage?: string
  loadingSubmessage?: string
}

// Componente wrapper para lazy loading
export function LazyWrapper({ 
  children, 
  fallback, 
  loadingMessage = "Carregando...",
  loadingSubmessage = "Preparando a página para você"
}: LazyWrapperProps) {
  const defaultFallback = (
    <LoadingScreen 
      message={loadingMessage}
      submessage={loadingSubmessage}
      showLogo={true}
    />
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

// HOC para criar componentes lazy com fallback personalizado
export function withLazyLoading<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallbackOptions?: {
    message?: string
    submessage?: string
    showLogo?: boolean
  }
) {
  const LazyComponent = lazy(importFn)
  
  return function LazyLoadedComponent(props: T) {
    const fallback = (
      <LoadingScreen 
        message={fallbackOptions?.message || "Carregando componente..."}
        submessage={fallbackOptions?.submessage || "Aguarde um momento"}
        showLogo={fallbackOptions?.showLogo ?? true}
      />
    )

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Hook para lazy loading de dados
export function useLazyData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = [],
  options: {
    enabled?: boolean
    retryCount?: number
    retryDelay?: number
  } = {}
) {
  const { enabled = true, retryCount = 3, retryDelay = 1000 } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retries, setRetries] = useState(0)

  const fetchData = useCallback(async () => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchFn()
      setData(result)
      setRetries(0)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      
      if (retries < retryCount) {
        setTimeout(() => {
          setRetries(prev => prev + 1)
          fetchData()
        }, retryDelay * (retries + 1))
      } else {
        setError(error)
      }
    } finally {
      setLoading(false)
    }
  }, [enabled, fetchFn, retries, retryCount, retryDelay])

  useEffect(() => {
    fetchData()
  }, [...deps, fetchData])

  return {
    data,
    loading,
    error,
    retry: fetchData,
    retries
  }
}

// Componente para lazy loading de imagens
interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({ 
  src, 
  alt, 
  className, 
  placeholder = '/images/placeholder.svg',
  onLoad,
  onError
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const image = new Image()
          
          image.onload = () => {
            setImageSrc(src)
            setIsLoading(false)
            setHasError(false)
            onLoad?.()
          }
          
          image.onerror = () => {
            setHasError(true)
            setIsLoading(false)
            onError?.()
          }
          
          image.src = src
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(img)
    
    return () => observer.disconnect()
  }, [src, onLoad, onError])

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        } ${className}`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <span className="text-sm">Erro ao carregar</span>
        </div>
      )}
    </div>
  )
}