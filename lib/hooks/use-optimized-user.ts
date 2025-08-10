"use client"

import { useUser } from '@/lib/contexts/user-context'
import { usePageCache } from './use-page-cache'
import { createClient } from '@/lib/supabase/client'
import { useCallback } from 'react'

interface OptimizedUserOptions {
  enableCache?: boolean
  cacheTTL?: number
  includeProfile?: boolean
}

export function useOptimizedUser(options: OptimizedUserOptions = {}) {
  const {
    enableCache = true,
    cacheTTL = 2 * 60 * 1000, // 2 minutos
    includeProfile = true
  } = options

  const { user, profile, loading, error, isAuthenticated, refreshUserData } = useUser()
  const supabase = createClient()

  // Cache para dados adicionais do usuário
  const fetchUserExtendedData = useCallback(async () => {
    if (!user?.id) return null

    const promises = []

    // Buscar dados do perfil se necessário
    if (includeProfile && !profile) {
      promises.push(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => ({ profile: data }))
      )
    }

    // Buscar agência se o usuário for uma agência
    if (user?.user_metadata?.user_type === 'agencia') {
      promises.push(
        supabase
          .from('agencias')
          .select('*')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => ({ agencia: data }))
      )
    }

    if (promises.length === 0) {
      return { profile, agencia: null }
    }

    const results = await Promise.allSettled(promises)
    const data: any = { profile }

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        Object.assign(data, result.value)
      }
    })

    return data
  }, [user?.id, user?.user_metadata?.user_type, profile, includeProfile, supabase])

  const {
    data: extendedData,
    loading: extendedLoading,
    error: extendedError,
    refresh: refreshExtended
  } = usePageCache(
    `user-extended-${user?.id}`,
    fetchUserExtendedData,
    {
      ttl: cacheTTL,
      enabled: enableCache && !!user?.id
    }
  )

  const refresh = useCallback(async () => {
    await refreshUserData()
    refreshExtended()
  }, [refreshUserData, refreshExtended])

  return {
    // Dados básicos do contexto
    user,
    profile: extendedData?.profile || profile,
    loading: loading || extendedLoading,
    error: error || extendedError,
    isAuthenticated,
    
    // Dados estendidos
    agencia: extendedData?.agencia || null,
    
    // Funções
    refresh,
    refreshUserData,
    
    // Status
    isFromCache: !extendedLoading && enableCache,
    hasExtendedData: !!extendedData
  }
}

// Hook específico para agências
export function useOptimizedAgencia() {
  const { user, agencia, loading, error, refresh } = useOptimizedUser({
    enableCache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutos para agências
    includeProfile: false
  })

  return {
    user,
    agencia,
    loading,
    error,
    refresh,
    isAgencia: user?.user_metadata?.user_type === 'agencia',
    hasAgencia: !!agencia
  }
}

// Hook para verificação rápida de autenticação
export function useQuickAuth() {
  const { isAuthenticated, user, loading } = useUser()
  
  return {
    isAuthenticated,
    isLoading: loading,
    userId: user?.id,
    userType: user?.user_metadata?.user_type,
    isAgencia: user?.user_metadata?.user_type === 'agencia',
    isUser: user?.user_metadata?.user_type === 'user'
  }
}