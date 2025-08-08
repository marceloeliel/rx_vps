import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

// Configurações dos planos
export const PLAN_CONFIGURATIONS = {
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 59.90,
    maxVehicles: 5,
    maxFeaturedVehicles: 0,
    maxPhotosPerVehicle: 5,
    hasBasicAds: true,
    hasFeaturedAds: false,
    hasPremiumAds: false,
    hasPrioritySupport: false,
    has24_7Support: false,
    hasEmailSupport: true,
    hasPhoneSupport: false,
    hasWhatsappSupport: false,
    hasBasicStats: true,
    hasAdvancedStats: false,
    hasCompleteStats: false,
    hasCustomReports: false,
    hasAdvancedReports: false,
    hasAdminPanel: false,
    hasApiAccess: false,
    hasDedicatedConsulting: false,
    storageLimitMb: 100,
    apiCallsPerMonth: 0
  },
  profissional: {
    id: 'profissional',
    name: 'Profissional',
    price: 299.00,
    maxVehicles: 30,
    maxFeaturedVehicles: 3,
    maxPhotosPerVehicle: 10,
    hasBasicAds: true,
    hasFeaturedAds: true,
    hasPremiumAds: false,
    hasPrioritySupport: true,
    has24_7Support: false,
    hasEmailSupport: true,
    hasPhoneSupport: false,
    hasWhatsappSupport: true,
    hasBasicStats: true,
    hasAdvancedStats: true,
    hasCompleteStats: false,
    hasCustomReports: true,
    hasAdvancedReports: false,
    hasAdminPanel: true,
    hasApiAccess: false,
    hasDedicatedConsulting: false,
    storageLimitMb: 500,
    apiCallsPerMonth: 1000
  },
  empresarial: {
    id: 'empresarial',
    name: 'Empresarial',
    price: 897.90,
    maxVehicles: 400,
    maxFeaturedVehicles: 40,
    maxPhotosPerVehicle: 15,
    hasBasicAds: true,
    hasFeaturedAds: true,
    hasPremiumAds: true,
    hasPrioritySupport: true,
    has24_7Support: true,
    hasEmailSupport: true,
    hasPhoneSupport: true,
    hasWhatsappSupport: true,
    hasBasicStats: true,
    hasAdvancedStats: true,
    hasCompleteStats: true,
    hasCustomReports: true,
    hasAdvancedReports: true,
    hasAdminPanel: true,
    hasApiAccess: true,
    hasDedicatedConsulting: false,
    storageLimitMb: 2000,
    apiCallsPerMonth: 5000
  },
  ilimitado: {
    id: 'ilimitado',
    name: 'Ilimitado',
    price: 1897.90,
    maxVehicles: 0, // 0 = ilimitado
    maxFeaturedVehicles: 100,
    maxPhotosPerVehicle: 20,
    hasBasicAds: true,
    hasFeaturedAds: true,
    hasPremiumAds: true,
    hasPrioritySupport: true,
    has24_7Support: true,
    hasEmailSupport: true,
    hasPhoneSupport: true,
    hasWhatsappSupport: true,
    hasBasicStats: true,
    hasAdvancedStats: true,
    hasCompleteStats: true,
    hasCustomReports: true,
    hasAdvancedReports: true,
    hasAdminPanel: true,
    hasApiAccess: true,
    hasDedicatedConsulting: true,
    storageLimitMb: 10000,
    apiCallsPerMonth: 10000
  }
} as const

export type PlanId = keyof typeof PLAN_CONFIGURATIONS
export type PlanConfiguration = typeof PLAN_CONFIGURATIONS[PlanId]

interface UserUsage {
  currentVehicles: number
  currentFeaturedVehicles: number
  currentStorageUsedMb: number
  currentApiCallsMonth: number
}

interface PlanControlResult {
  canAdd: boolean
  reason: string
  currentCount: number
  maxAllowed: number
}

export function usePlanControl() {
  const [userPlan, setUserPlan] = useState<PlanConfiguration | null>(null)
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Carregar dados do usuário e plano
  useEffect(() => {
    loadUserPlanData()
  }, [])

  const loadUserPlanData = async () => {
    try {
      setLoading(true)
      
      // Buscar dados do usuário
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('plano_atual')
        .eq('id', user.id)
        .single()

      const planId = (profile?.plano_atual || 'basico') as PlanId
      setUserPlan(PLAN_CONFIGURATIONS[planId])

      // Buscar contagem atual de veículos
      const { count: vehicleCount } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Buscar contagem de veículos em destaque
      const { count: featuredCount } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('destaque', true)

      setUserUsage({
        currentVehicles: vehicleCount || 0,
        currentFeaturedVehicles: featuredCount || 0,
        currentStorageUsedMb: 0, // TODO: Implementar cálculo de storage
        currentApiCallsMonth: 0 // TODO: Implementar contagem de API calls
      })

    } catch (error) {
      console.error('Erro ao carregar dados do plano:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar informações do plano."
      })
    } finally {
      setLoading(false)
    }
  }

  // Verificar se pode adicionar veículo
  const canAddVehicle = (): PlanControlResult => {
    if (!userPlan || !userUsage) {
      return {
        canAdd: false,
        reason: 'Dados do plano não carregados',
        currentCount: 0,
        maxAllowed: 0
      }
    }

    // Se é ilimitado (maxVehicles = 0)
    if (userPlan.maxVehicles === 0) {
      return {
        canAdd: true,
        reason: 'Plano permite veículos ilimitados',
        currentCount: userUsage.currentVehicles,
        maxAllowed: 0
      }
    }

    // Verificar limite
    if (userUsage.currentVehicles < userPlan.maxVehicles) {
      return {
        canAdd: true,
        reason: 'Pode adicionar veículo',
        currentCount: userUsage.currentVehicles,
        maxAllowed: userPlan.maxVehicles
      }
    }

    return {
      canAdd: false,
      reason: `Limite de ${userPlan.maxVehicles} veículos atingido para o plano ${userPlan.name}`,
      currentCount: userUsage.currentVehicles,
      maxAllowed: userPlan.maxVehicles
    }
  }

  // Verificar se pode destacar veículo
  const canFeatureVehicle = (): PlanControlResult => {
    if (!userPlan || !userUsage) {
      return {
        canAdd: false,
        reason: 'Dados do plano não carregados',
        currentCount: 0,
        maxAllowed: 0
      }
    }

    if (userUsage.currentFeaturedVehicles < userPlan.maxFeaturedVehicles) {
      return {
        canAdd: true,
        reason: 'Pode destacar veículo',
        currentCount: userUsage.currentFeaturedVehicles,
        maxAllowed: userPlan.maxFeaturedVehicles
      }
    }

    return {
      canAdd: false,
      reason: `Limite de ${userPlan.maxFeaturedVehicles} destaques atingido para o plano ${userPlan.name}`,
      currentCount: userUsage.currentFeaturedVehicles,
      maxAllowed: userPlan.maxFeaturedVehicles
    }
  }

  // Verificar se tem acesso a recurso específico
  const hasFeatureAccess = (feature: keyof PlanConfiguration): boolean => {
    if (!userPlan) return false
    return Boolean(userPlan[feature])
  }

  // Obter informações de uso
  const getUsageInfo = () => {
    if (!userPlan || !userUsage) return null

    return {
      vehicles: {
        current: userUsage.currentVehicles,
        max: userPlan.maxVehicles,
        percentage: userPlan.maxVehicles === 0 ? 0 : (userUsage.currentVehicles / userPlan.maxVehicles) * 100
      },
      featuredVehicles: {
        current: userUsage.currentFeaturedVehicles,
        max: userPlan.maxFeaturedVehicles,
        percentage: userPlan.maxFeaturedVehicles === 0 ? 0 : (userUsage.currentFeaturedVehicles / userPlan.maxFeaturedVehicles) * 100
      },
      storage: {
        current: userUsage.currentStorageUsedMb,
        max: userPlan.storageLimitMb,
        percentage: (userUsage.currentStorageUsedMb / userPlan.storageLimitMb) * 100
      },
      apiCalls: {
        current: userUsage.currentApiCallsMonth,
        max: userPlan.apiCallsPerMonth,
        percentage: userPlan.apiCallsPerMonth === 0 ? 0 : (userUsage.currentApiCallsMonth / userPlan.apiCallsPerMonth) * 100
      }
    }
  }

  // Função para sincronizar contagem de veículos com a realidade
  const syncVehicleCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'Usuário não encontrado' }
      
      // Buscar contagem real de veículos do usuário
      const { count: vehicleCount, error: vehicleError } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (vehicleError) throw vehicleError
      
      // Buscar contagem real de veículos em destaque
      const { count: featuredCount, error: featuredError } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('destaque', true)
      
      if (featuredError) throw featuredError
      
      // Atualizar estado local
      setUserUsage(prev => prev ? {
        ...prev,
        currentVehicles: vehicleCount || 0,
        currentFeaturedVehicles: featuredCount || 0
      } : null)
      
      return { success: true, vehicleCount, featuredCount }
    } catch (error) {
      console.error('Erro ao sincronizar contagem de veículos:', error)
      return { success: false, error }
    }
  }
  
  // Atualizar contadores após ação
  const updateUsage = async (type: 'vehicle' | 'featured' | 'storage' | 'api', change: number) => {
    if (!userUsage) return

    const newUsage = { ...userUsage }
    
    switch (type) {
      case 'vehicle':
        newUsage.currentVehicles += change
        break
      case 'featured':
        newUsage.currentFeaturedVehicles += change
        break
      case 'storage':
        newUsage.currentStorageUsedMb += change
        break
      case 'api':
        newUsage.currentApiCallsMonth += change
        break
    }

    setUserUsage(newUsage)
  }

  return {
    userPlan,
    userUsage,
    loading,
    canAddVehicle,
    canFeatureVehicle,
    hasFeatureAccess,
    getUsageInfo,
    updateUsage,
    syncVehicleCount,
    refreshData: loadUserPlanData
  }
}

// Hook para verificações específicas de recursos
export function usePlanFeatures() {
  const { userPlan, hasFeatureAccess } = usePlanControl()

  return {
    // Anúncios
    canCreateBasicAds: hasFeatureAccess('hasBasicAds'),
    canCreateFeaturedAds: hasFeatureAccess('hasFeaturedAds'),
    canCreatePremiumAds: hasFeatureAccess('hasPremiumAds'),
    
    // Suporte
    hasEmailSupport: hasFeatureAccess('hasEmailSupport'),
    hasPhoneSupport: hasFeatureAccess('hasPhoneSupport'),
    hasWhatsappSupport: hasFeatureAccess('hasWhatsappSupport'),
    hasPrioritySupport: hasFeatureAccess('hasPrioritySupport'),
    has24_7Support: hasFeatureAccess('has24_7Support'),
    
    // Estatísticas e Relatórios
    hasBasicStats: hasFeatureAccess('hasBasicStats'),
    hasAdvancedStats: hasFeatureAccess('hasAdvancedStats'),
    hasCompleteStats: hasFeatureAccess('hasCompleteStats'),
    hasCustomReports: hasFeatureAccess('hasCustomReports'),
    hasAdvancedReports: hasFeatureAccess('hasAdvancedReports'),
    
    // Recursos avançados
    hasAdminPanel: hasFeatureAccess('hasAdminPanel'),
    hasApiAccess: hasFeatureAccess('hasApiAccess'),
    hasDedicatedConsulting: hasFeatureAccess('hasDedicatedConsulting'),
    
    // Informações do plano
    planName: userPlan?.name || 'Básico',
    planPrice: userPlan?.price || 59.90
  }
}