"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SubscriptionStatus {
  isActive: boolean
  hasAccess: boolean
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
    hasAccess: false,
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

      // Verificar se há uma sessão ativa primeiro
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Erro ao verificar sessão:', sessionError)
        // Não lançar erro, apenas definir como não autenticado
      }

      if (!session || !session.user) {
        setUser(null)
        setProfile(null)
        setSubscriptionStatus({
          isActive: false,
          hasAccess: false,
          planType: null,
          expiresAt: null,
          status: 'not_authenticated',
          daysRemaining: null
        })
        return
      }

      const currentUser = session.user
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

      // Verificar se o usuário tem acesso baseado no perfil
      const hasAccess = profileData?.unlimited_access === true || 
                       profileData?.plano_atual === 'ilimitado' ||
                       profileData?.plano_atual === 'premium_plus' ||
                       profileData?.plano_atual === 'empresarial'

      // Sistema de pagamentos desabilitado - retornar status baseado no perfil
      setSubscriptionStatus({
        isActive: hasAccess,
        hasAccess: hasAccess,
        planType: profileData?.plano_atual || null,
        expiresAt: null,
        status: hasAccess ? 'active' : 'payment_system_disabled',
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
    // Retornar true se o usuário tem acesso ilimitado
    return subscriptionStatus.hasAccess
  }

  const getPlanLimits = () => {
    // Retornar limites baseados no status do usuário
    if (subscriptionStatus.hasAccess) {
      return {
        maxVehicles: 999999,
        maxPhotos: 999999,
        canCreateAgency: true
      }
    }
    
    // Limites padrão para usuários sem acesso
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