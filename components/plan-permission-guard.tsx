"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePlanControl } from "@/hooks/use-plan-control"
import { 
  Lock, 
  Crown, 
  ArrowUpCircle, 
  AlertTriangle,
  Car,
  Star,
  HardDrive,
  Zap
} from "lucide-react"
import Link from "next/link"

interface PlanPermissionGuardProps {
  children: ReactNode
  requiredFeature: 'addVehicle' | 'featureVehicle' | 'basicAds' | 'featuredAds' | 'premiumAds' | 'advancedStats' | 'apiAccess' | 'adminPanel'
  fallbackComponent?: ReactNode
  showUpgradePrompt?: boolean
}

export function PlanPermissionGuard({ 
  children, 
  requiredFeature, 
  fallbackComponent,
  showUpgradePrompt = true 
}: PlanPermissionGuardProps) {
  const { 
    userPlan, 
    loading, 
    canAddVehicle, 
    canFeatureVehicle,
    hasUnlimitedAccess,
    getUsageInfo
  } = usePlanControl()
  
  const usageInfo = getUsageInfo()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!userPlan) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">Erro ao carregar informações do plano</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const checkPermission = (): { allowed: boolean; reason?: string; upgradeMessage?: string } => {
    // Se tem acesso ilimitado concedido pelo admin, libera todos os recursos
    if (hasUnlimitedAccess) {
      return {
        allowed: true,
        reason: "Acesso ilimitado concedido pelo administrador"
      }
    }

    switch (requiredFeature) {
      case 'addVehicle': {
        const check = canAddVehicle()
        return {
          allowed: check.canAdd,
          reason: check.reason,
          upgradeMessage: "Para adicionar mais veículos, faça upgrade do seu plano"
        }
      }
      
      case 'featureVehicle': {
        const check = canFeatureVehicle()
        return {
          allowed: check.canAdd,
          reason: check.reason,
          upgradeMessage: "Para destacar mais veículos, faça upgrade do seu plano"
        }
      }
      
      case 'basicAds':
        return {
          allowed: true, // Todos os planos têm anúncios básicos
          upgradeMessage: "Recurso disponível em todos os planos"
        }
      
      case 'featuredAds':
        return {
          allowed: ['profissional', 'empresarial', 'ilimitado'].includes(userPlan.id),
          reason: userPlan.id === 'basico' ? 'Anúncios destacados não disponíveis no plano Básico' : undefined,
          upgradeMessage: "Para criar anúncios destacados, faça upgrade para o plano Profissional ou superior"
        }
      
      case 'premiumAds':
        return {
          allowed: ['empresarial', 'ilimitado'].includes(userPlan.id),
          reason: !['empresarial', 'ilimitado'].includes(userPlan.id) ? 'Anúncios premium disponíveis apenas nos planos Empresarial e Ilimitado' : undefined,
          upgradeMessage: "Para criar anúncios premium, faça upgrade para o plano Empresarial ou Ilimitado"
        }
      
      case 'advancedStats':
        return {
          allowed: ['profissional', 'empresarial', 'ilimitado'].includes(userPlan.id),
          reason: userPlan.id === 'basico' ? 'Estatísticas avançadas não disponíveis no plano Básico' : undefined,
          upgradeMessage: "Para acessar estatísticas avançadas, faça upgrade para o plano Profissional ou superior"
        }
      
      case 'apiAccess':
        return {
          allowed: ['empresarial', 'ilimitado'].includes(userPlan.id),
          reason: !['empresarial', 'ilimitado'].includes(userPlan.id) ? 'Recurso disponível apenas nos planos Empresarial e Ilimitado' : undefined,
          upgradeMessage: "Para acessar este recurso, faça upgrade para o plano Empresarial ou Ilimitado"
        }
      
      case 'adminPanel':
        return {
          allowed: userPlan.id === 'ilimitado',
          reason: userPlan.id !== 'ilimitado' ? 'Painel administrativo disponível apenas no plano Ilimitado' : undefined,
          upgradeMessage: "Para acessar o painel administrativo, faça upgrade para o plano Ilimitado"
        }
      
      default:
        return { allowed: false, reason: 'Recurso não reconhecido' }
    }
  }

  const permission = checkPermission()

  if (permission.allowed) {
    return <>{children}</>
  }

  // Se não tem permissão, mostra o fallback ou o componente de upgrade
  if (fallbackComponent) {
    return <>{fallbackComponent}</>
  }

  const getFeatureIcon = () => {
    switch (requiredFeature) {
      case 'addVehicle':
      case 'basicAds':
      case 'featuredAds':
      case 'premiumAds':
        return <Car className="h-8 w-8 text-gray-400" />
      case 'featureVehicle':
        return <Star className="h-8 w-8 text-gray-400" />
      case 'advancedStats':
        return <HardDrive className="h-8 w-8 text-gray-400" />
      case 'apiAccess':
        return <Zap className="h-8 w-8 text-gray-400" />
      case 'adminPanel':
        return <Crown className="h-8 w-8 text-gray-400" />
      default:
        return <Lock className="h-8 w-8 text-gray-400" />
    }
  }

  const getRequiredPlan = () => {
    switch (requiredFeature) {
      case 'featuredAds':
      case 'advancedStats':
        return 'Profissional'
      case 'premiumAds':
      case 'apiAccess':
        return 'Empresarial'
      case 'adminPanel':
        return 'Ilimitado'
      default:
        return 'Superior'
    }
  }

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {getFeatureIcon()}
        </div>
        <CardTitle className="text-lg text-gray-700">
          Recurso Bloqueado
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div>
          <Badge variant="outline" className="mb-2">
            Plano Atual: {userPlan.name}
          </Badge>
          <p className="text-sm text-gray-600">
            {permission.reason}
          </p>
        </div>
        
        {/* Informações de uso se for limite de quantidade */}
        {(requiredFeature === 'addVehicle' || requiredFeature === 'featureVehicle') && usageInfo && (
          <div className="bg-white p-3 rounded border">
            <div className="text-sm space-y-1">
              {requiredFeature === 'addVehicle' && (
                <p>
                  <strong>Veículos:</strong> {usageInfo.vehicles.current}
                  {userPlan.maxVehicles > 0 && `/${userPlan.maxVehicles}`}
                  {userPlan.maxVehicles === 0 && ' (Ilimitado)'}
                </p>
              )}
              {requiredFeature === 'featureVehicle' && (
                <p>
                  <strong>Destaques:</strong> {usageInfo.featuredVehicles.current}/{userPlan.maxFeaturedVehicles}
                </p>
              )}
            </div>
          </div>
        )}
        
        {showUpgradePrompt && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {permission.upgradeMessage}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/planos">
                <Button className="w-full sm:w-auto">
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Upgrade para {getRequiredPlan()}
                </Button>
              </Link>
              <Link href="/planos">
                <Button variant="outline" className="w-full sm:w-auto">
                  Ver Todos os Planos
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook para verificar permissões sem renderizar componente
export function usePlanPermissions() {
  const { userPlan, canAddVehicle, canFeatureVehicle } = usePlanControl()
  
  return {
    canAddVehicle: () => canAddVehicle().canAdd,
    canFeatureVehicle: () => canFeatureVehicle().canAdd,
    canCreateBasicAds: () => true, // Todos os planos
    canCreateFeaturedAds: () => userPlan ? ['profissional', 'empresarial', 'ilimitado'].includes(userPlan.id) : false,
    canCreatePremiumAds: () => userPlan ? ['empresarial', 'ilimitado'].includes(userPlan.id) : false,
    canAccessAdvancedStats: () => userPlan ? ['profissional', 'empresarial', 'ilimitado'].includes(userPlan.id) : false,
    canAccessAPI: () => userPlan ? ['empresarial', 'ilimitado'].includes(userPlan.id) : false,
    canAccessAdminPanel: () => userPlan ? userPlan.id === 'ilimitado' : false,
    currentPlan: userPlan
  }
}