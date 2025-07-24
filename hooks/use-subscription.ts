"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { checkUserPromotionalAccess, type PromotionalAccess } from "@/lib/supabase/promotions"
import { checkTrialPeriod } from "@/lib/supabase/trial"

export interface SubscriptionStatus {
  isActive: boolean
  isExpired: boolean
  planType: string | null
  expirationDate: Date | null
  daysUntilExpiration: number | null
  hasAccess: boolean
  needsRenewal: boolean
  status?: string
  subscription?: any
  // Novos campos promocionais
  isPromotional?: boolean
  promotionalAccess?: PromotionalAccess | null
  // Novos campos para período de teste
  isInTrial?: boolean
  trialDaysRemaining?: number | null
}

export interface UserProfile {
  id: string
  nome_completo: string
  email?: string
  tipo_usuario?: string
  asaas_customer_id?: string
  // Novos campos promocionais
  is_promotional_user?: boolean
  promotional_end_date?: string
  document_validated?: boolean
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
    needsRenewal: false,
    status: undefined,
    subscription: undefined,
    isPromotional: false,
    promotionalAccess: null,
    isInTrial: false,
    trialDaysRemaining: null
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Buscar dados da assinatura atual (incluindo promocional e trial)
  const loadSubscriptionData = async (userId: string): Promise<SubscriptionStatus> => {
    try {
      // Primeiro, verificar período de teste
      const trialStatus = await checkTrialPeriod(userId)
      
      if (trialStatus.isInTrial) {
        return {
          isActive: true,
          isExpired: false,
          planType: trialStatus.trialPeriod?.plan_type || 'basico',
          expirationDate: new Date(trialStatus.trialPeriod?.end_date!),
          daysUntilExpiration: trialStatus.daysRemaining || 0,
          hasAccess: true,
          needsRenewal: trialStatus.daysRemaining! <= 3,
          status: 'trial',
          subscription: {
            plan_type: trialStatus.trialPeriod?.plan_type || 'basico',
            end_date: trialStatus.trialPeriod?.end_date,
            status: 'trial'
          },
          isPromotional: false,
          promotionalAccess: null,
          isInTrial: true,
          trialDaysRemaining: trialStatus.daysRemaining
        }
      }

      // Se não está em trial, verificar acesso promocional
      const promotionalAccess = await checkUserPromotionalAccess(userId)
      
      // Se tem acesso promocional ativo
      if (promotionalAccess && promotionalAccess.has_access && promotionalAccess.is_promotional) {
        const endDate = new Date(promotionalAccess.end_date!)
        const now = new Date()
        const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          isActive: true,
          isExpired: endDate < now,
          planType: 'promocional',
          expirationDate: endDate,
          daysUntilExpiration: daysUntilExpiration > 0 ? daysUntilExpiration : 0,
          hasAccess: true,
          needsRenewal: daysUntilExpiration <= 3,
          status: 'promotional_active',
          subscription: {
            plan_type: 'promocional',
            end_date: promotionalAccess.end_date,
            status: 'promotional_active'
          },
          isPromotional: true,
          promotionalAccess: promotionalAccess,
          isInTrial: false,
          trialDaysRemaining: null
        }
      }

      // Se não tem acesso promocional, verificar plano pago
      const response = await fetch(`/api/subscriptions?userId=${userId}`)
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.subscription && result.access) {
          const subscription = result.subscription
          const access = result.access
          const now = new Date()
          const endDate = new Date(subscription.end_date)
          const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          return {
            isActive: subscription.status === 'active',
            isExpired: endDate < now,
            planType: subscription.plan_type,
            expirationDate: endDate,
            daysUntilExpiration: daysUntilExpiration > 0 ? daysUntilExpiration : 0,
            hasAccess: access.hasAccess,
            needsRenewal: subscription.status === 'pending_payment' || (daysUntilExpiration <= 3),
            status: subscription.status,
            subscription: subscription,
            isPromotional: false,
            promotionalAccess: promotionalAccess,
            isInTrial: false,
            trialDaysRemaining: null
          }
        }
      }
    } catch (error) {
      console.error("❌ [SUBSCRIPTION] Erro ao buscar assinatura:", error)
    }

    // Fallback para usuários sem assinatura
    return {
      isActive: false,
      isExpired: false,
      planType: null,
      expirationDate: null,
      daysUntilExpiration: null,
      hasAccess: false,
      needsRenewal: false,
      status: undefined,
      subscription: undefined,
      isPromotional: false,
      promotionalAccess: null,
      isInTrial: false,
      trialDaysRemaining: null
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
          needsRenewal: false,
          status: undefined,
          subscription: undefined,
          isPromotional: false,
          promotionalAccess: null,
          isInTrial: false,
          trialDaysRemaining: null
        })
        return
      }

      setUser(user)
      console.log("✅ [SUBSCRIPTION] Usuário autenticado:", user.email)

      // Buscar perfil do usuário (incluindo campos promocionais)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id, nome_completo, email, tipo_usuario, asaas_customer_id,
          is_promotional_user, promotional_end_date, document_validated
        `)
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
          needsRenewal: true,
          status: undefined,
          subscription: undefined,
          isPromotional: false,
          promotionalAccess: null,
          isInTrial: false,
          trialDaysRemaining: null
        })
        return
      }

      setProfile(profileData)
      console.log("📋 [SUBSCRIPTION] Perfil carregado:", {
        id: profileData.id,
        tipo_usuario: profileData.tipo_usuario,
        is_promotional_user: profileData.is_promotional_user
      })

      // Buscar dados da assinatura (incluindo promocional)
      const status = await loadSubscriptionData(user.id)
      setSubscriptionStatus(status)
      
      console.log("📊 [SUBSCRIPTION] Status da assinatura:", status)

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

    // Usuários promocionais têm acesso básico
    if (subscriptionStatus.isPromotional) {
      const promotionalFeatures = [
        "create_vehicle", // Até 5 veículos durante promoção
        "basic_listings",
        "email_support",
        "basic_stats"
      ]
      return promotionalFeatures.includes(feature)
    }

    // Definir funcionalidades por plano pago
    const planFeatures = {
      basico: [
        "create_vehicle", // Até 5 veículos
        "basic_listings",
        "email_support",
        "basic_stats"
      ],
      premium: [
        "create_vehicle", // Até 20 veículos
        "featured_listings",
        "advanced_search",
        "priority_support",
        "detailed_stats",
        "custom_branding"
      ],
      premium_plus: [
        "create_vehicle", // Veículos ilimitados
        "featured_listings",
        "advanced_search",
        "priority_support",
        "detailed_stats",
        "custom_branding",
        "analytics_dashboard",
        "api_access",
        "white_label"
      ]
    }

    const allowedFeatures = planFeatures[planType as keyof typeof planFeatures] || []
    return allowedFeatures.includes(feature)
  }

  // Verificar se o usuário pode criar mais veículos
  const canCreateVehicle = (): boolean => {
    return hasFeatureAccess("create_vehicle")
  }

  // Verificar se é usuário promocional
  const isPromotionalUser = (): boolean => {
    return subscriptionStatus.isPromotional || false
  }

  // Obter informações da promoção
  const getPromotionalInfo = () => {
    if (!subscriptionStatus.isPromotional || !subscriptionStatus.promotionalAccess) {
      return null
    }

    return {
      daysRemaining: subscriptionStatus.promotionalAccess.days_remaining,
      endDate: subscriptionStatus.promotionalAccess.end_date,
      campaignName: subscriptionStatus.promotionalAccess.campaign_name
    }
  }

  // Atualizar dados quando houver mudanças na autenticação
  useEffect(() => {
    loadUserData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadUserData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Função para recarregar dados
  const reload = () => {
    loadUserData()
  }

  return {
    user,
    profile,
    subscriptionStatus,
    loading,
    hasFeatureAccess,
    canCreateVehicle,
    isPromotionalUser,
    getPromotionalInfo,
    reload
  }
} 