import { useState, useEffect, useCallback } from 'react'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private static instance: CacheManager

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

const cacheManager = CacheManager.getInstance()

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    enabled?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const { ttl = 5 * 60 * 1000, enabled = true, onSuccess, onError } = options
  
  const [data, setData] = useState<T | null>(() => {
    return enabled ? cacheManager.get<T>(key) : null
  })
  const [loading, setLoading] = useState<boolean>(!data && enabled)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    // Verificar cache primeiro
    if (!force) {
      const cachedData = cacheManager.get<T>(key)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return cachedData
      }
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      cacheManager.set(key, result, ttl)
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl, enabled, onSuccess, onError])

  const invalidate = useCallback(() => {
    cacheManager.invalidate(key)
    setData(null)
  }, [key])

  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  useEffect(() => {
    if (enabled && !data) {
      fetchData()
    }
  }, [enabled, data, fetchData])

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    fetchData
  }
}

export { cacheManager }