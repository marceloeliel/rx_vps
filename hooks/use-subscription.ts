"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export interface SubscriptionStatus {
  isActive: boolean
  isExpired: boolean
  planType: string | null
  expirationDate: Date | null
  daysUntilExpiration: number | null
  hasAccess: boolean
  needsRenewal: boolean
}

export interface UserProfile {
  id: string
  nome_completo: string
  email?: string
  plano_atual?: string
  plano_data_inicio?: string
  plano_data_fim?: string
  asaas_customer_id?: string
  asaas_subscription_id?: string
}

export function useSubscription() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isExpired: false,
    planType: null,
    expirationDate: null,
    daysUntilExpiration: null,
    hasAccess: false,
    needsRenewal: false
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Calcular status da assinatura
  const calculateSubscriptionStatus = (profile: UserProfile): SubscriptionStatus => {
    const now = new Date()
    
    // Se não tem plano ativo
    if (!profile.plano_atual || !profile.plano_data_fim) {
      return {
        isActive: false,
        isExpired: false,
        planType: null,
        expirationDate: null,
        daysUntilExpiration: null,
        hasAccess: false,
        needsRenewal: true
      }
    }

    const expirationDate = new Date(profile.plano_data_fim)
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = expirationDate < now
    const isActive = !isExpired
    
    // Considerar como "precisa renovar" se vence em 3 dias ou menos
    const needsRenewal = daysUntilExpiration <= 3

    return {
      isActive,
      isExpired,
      planType: profile.plano_atual,
      expirationDate,
      daysUntilExpiration,
      hasAccess: isActive,
      needsRenewal: needsRenewal || isExpired
    }
  }

  // Carregar dados do usuário e perfil
  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Buscar usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.log("❌ [SUBSCRIPTION] Usuário não autenticado")
        setUser(null)
        setProfile(null)
        setSubscriptionStatus({
          isActive: false,
          isExpired: false,
          planType: null,
          expirationDate: null,
          daysUntilExpiration: null,
          hasAccess: false,
          needsRenewal: false
        })
        return
      }

      setUser(user)
      console.log("✅ [SUBSCRIPTION] Usuário autenticado:", user.email)

      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, nome_completo, email, plano_atual, plano_data_inicio, plano_data_fim, asaas_customer_id, asaas_subscription_id")
        .eq("id", user.id)
        .single()

      if (profileError || !profileData) {
        console.log("❌ [SUBSCRIPTION] Erro ao buscar perfil:", profileError)
        setProfile(null)
        setSubscriptionStatus({
          isActive: false,
          isExpired: false,
          planType: null,
          expirationDate: null,
          daysUntilExpiration: null,
          hasAccess: false,
          needsRenewal: true
        })
        return
      }

      setProfile(profileData)
      console.log("📋 [SUBSCRIPTION] Perfil carregado:", {
        plano_atual: profileData.plano_atual,
        plano_data_fim: profileData.plano_data_fim
      })

      // Calcular status da assinatura
      const status = calculateSubscriptionStatus(profileData)
      setSubscriptionStatus(status)
      
      console.log("📊 [SUBSCRIPTION] Status calculado:", status)

    } catch (error) {
      console.error("❌ [SUBSCRIPTION] Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar se o usuário tem acesso a uma funcionalidade específica
  const hasFeatureAccess = (feature: string): boolean => {
    if (!subscriptionStatus.hasAccess) {
      return false
    }

    const planType = subscriptionStatus.planType

    // Definir funcionalidades por plano
    const planFeatures = {
      basico: [
        "create_vehicle", // Até 5 veículos
        "basic_listings",
        "email_support",
        "basic_stats"
      ],
      profissional: [
        "create_vehicle", // Até 20 veículos
        "featured_listings",
        "priority_support", 
        "advanced_stats",
        "custom_reports",
        "api_integration"
      ],
      empresarial: [
        "unlimited_vehicles",
        "premium_listings",
        "24_7_support",
        "complete_stats",
        "advanced_reports",
        "api_integration",
        "admin_panel",
        "multiple_users"
      ]
    }

    const allowedFeatures = planFeatures[planType as keyof typeof planFeatures] || []
    return allowedFeatures.includes(feature)
  }

  // Verificar limites por plano
  const getPlanLimits = () => {
    const planType = subscriptionStatus.planType

    const planLimits = {
      basico: {
        maxVehicles: 5,
        maxPhotosPerVehicle: 10,
        featuredListings: false,
        apiAccess: false
      },
      profissional: {
        maxVehicles: 20,
        maxPhotosPerVehicle: 15,
        featuredListings: true,
        apiAccess: true
      },
      empresarial: {
        maxVehicles: -1, // Ilimitado
        maxPhotosPerVehicle: 20,
        featuredListings: true,
        apiAccess: true
      }
    }

    return planLimits[planType as keyof typeof planLimits] || planLimits.basico
  }

  // Renovar assinatura (redirecionar para checkout)
  const renewSubscription = () => {
    const planType = subscriptionStatus.planType || "basico"
    window.location.href = `/checkout?plano=${planType}&action=renewal`
  }

  // Atualizar dados do perfil
  const refreshProfile = async () => {
    await loadUserData()
  }

  // Effect para carregar dados iniciais
  useEffect(() => {
    loadUserData()
  }, [])

  // Effect para escutar mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadUserData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    subscriptionStatus,
    loading,
    hasFeatureAccess,
    getPlanLimits,
    renewSubscription,
    refreshProfile
  }
} 