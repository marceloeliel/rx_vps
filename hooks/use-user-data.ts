"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface UserData {
  user: any
  profile: any
  loading: boolean
  error: string | null
}

interface UseUserDataOptions {
  includeProfile?: boolean
  includePendingPayments?: boolean
  redirectOnError?: boolean
}

export function useUserData(options: UseUserDataOptions = {}) {
  const {
    includeProfile = true,
    includePendingPayments = false,
    redirectOnError = false
  } = options

  const [userData, setUserData] = useState<UserData>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  const [hasPendingPayments, setHasPendingPayments] = useState(false)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0)

  const supabase = createClient()

  const loadUserData = async () => {
    try {
      setUserData(prev => ({ ...prev, loading: true, error: null }))

      // 1. Buscar usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        if (redirectOnError) {
          window.location.href = "/login"
          return
        }
        throw new Error("Usuário não autenticado")
      }

      // 2. Preparar operações paralelas
      const operations: Promise<any>[] = []
      
      if (includeProfile) {
        operations.push(
          supabase.from('profiles').select('*').eq('id', user.id).single()
        )
      }

      if (includePendingPayments) {
        operations.push(
          fetch(`/api/asaas/payments/user/${user.id}?email=${encodeURIComponent(user.email)}&status=PENDING`)
        )
      }

      // 3. Executar operações em paralelo
      const results = await Promise.allSettled(operations)
      
      let profile = null
      let pendingPayments = { hasPendingPayments: false, pendingPayments: 0 }

      // 4. Processar resultados
      let resultIndex = 0
      
      if (includeProfile) {
        const profileResult = results[resultIndex]
        if (profileResult.status === 'fulfilled' && profileResult.value.data) {
          profile = profileResult.value.data
        }
        resultIndex++
      }

      if (includePendingPayments) {
        const paymentsResult = results[resultIndex]
        if (paymentsResult.status === 'fulfilled' && paymentsResult.value.ok) {
          const response = paymentsResult.value as Response
          pendingPayments = await response.json()
        }
      }

      // 5. Atualizar estados
      setUserData({
        user,
        profile,
        loading: false,
        error: null
      })

      if (includePendingPayments) {
        setHasPendingPayments(pendingPayments.hasPendingPayments)
        setPendingPaymentsCount(pendingPayments.pendingPayments)
      }

    } catch (error: any) {
      console.error("Erro ao carregar dados do usuário:", error)
      setUserData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  const refreshUserData = () => {
    loadUserData()
  }

  useEffect(() => {
    loadUserData()
  }, [])

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadUserData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    ...userData,
    hasPendingPayments,
    pendingPaymentsCount,
    refreshUserData,
    isAuthenticated: !!userData.user
  }
} 