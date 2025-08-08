"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SubscriptionStatus {
  isActive: boolean
  planType: string | null
  expiresAt: string | null
  status: string
  daysRemaining: number | null
}

interface UseSubscriptionReturn {
  user: any
  profile: any
  subscriptionStatus: SubscriptionStatus
  loading: boolean
  error: string | null
  reload: () => void
  renewSubscription: () => Promise<boolean>
  hasFeatureAccess: (feature: string) => boolean
  getPlanLimits: () => any
}

export function useSubscription(): UseSubscriptionReturn {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    planType: null,
    expiresAt: null,
    status: 'inactive',
    daysRemaining: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar usuário
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw userError
      }

      if (!currentUser) {
        setUser(null)
        setProfile(null)
        setSubscriptionStatus({
          isActive: false,
          planType: null,
          expiresAt: null,
          status: 'inactive',
          daysRemaining: null
        })
        return
      }

      setUser(currentUser)

      // Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError)
      } else {
        setProfile(profileData)
      }

      // Sistema de pagamentos desabilitado - retornar status padrão
      setSubscriptionStatus({
        isActive: false,
        planType: null,
        expiresAt: null,
        status: 'payment_system_disabled',
        daysRemaining: null
      })

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      setError(error.message)
      toast.error('Erro ao carregar dados do usuário')
    } finally {
      setLoading(false)
    }
  }

  const renewSubscription = async (): Promise<boolean> => {
    toast.error('Sistema de pagamentos temporariamente desabilitado')
    return false
  }

  const hasFeatureAccess = (feature: string): boolean => {
    // Sistema de pagamentos desabilitado - retornar false para todas as features
    return false
  }

  const getPlanLimits = () => {
    // Sistema de pagamentos desabilitado - retornar limites padrão
    return {
      maxVehicles: 0,
      maxPhotos: 0,
      canCreateAgency: false
    }
  }

  useEffect(() => {
    loadData()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    subscriptionStatus,
    loading,
    error,
    reload: loadData,
    renewSubscription,
    hasFeatureAccess,
    getPlanLimits
  }
}