'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Crown, 
  Car, 
  Star, 
  BarChart3, 
  Settings, 
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  AlertTriangle
} from 'lucide-react'
import { usePlanControl, usePlanFeatures } from '@/hooks/use-plan-control'
import Link from 'next/link'

interface UserPlanDetailsProps {
  showUpgradeButton?: boolean
  compact?: boolean
}

export function UserPlanDetails({ showUpgradeButton = true, compact = false }: UserPlanDetailsProps) {
  const { 
    userPlan, 
    loading, 
    canAddVehicle, 
    canFeatureVehicle,
    getUsageInfo,
  } = usePlanControl()
  
  const planFeatures = usePlanFeatures()
  
  const usageInfo = getUsageInfo()
  const vehicleCheck = canAddVehicle()
  const featureCheck = canFeatureVehicle()
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!userPlan || !usageInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Crown className="w-5 h-5" />
            Nenhum Plano Ativo
          </CardTitle>
          <CardDescription>
            Você não possui um plano ativo. Escolha um plano para começar a usar todos os recursos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/planos">
            <Button className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              Escolher Plano
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }
  
  const getPlanColors = (planId: string) => {
    const planColors: { [key: string]: { gradient: string, accent: string, icon: string } } = {
      'basico': {
        gradient: 'from-blue-500 via-blue-600 to-indigo-600',
        accent: 'text-blue-300',
        icon: 'text-blue-300'
      },
      'profissional': {
        gradient: 'from-purple-500 via-purple-600 to-violet-600', 
        accent: 'text-purple-300',
        icon: 'text-purple-300'
      },
      'empresarial': {
        gradient: 'from-gray-700 via-gray-800 to-black',
        accent: 'text-gray-300',
        icon: 'text-gray-300'
      },
      'ilimitado': {
        gradient: 'from-yellow-500 via-amber-600 to-orange-600',
        accent: 'text-yellow-300',
        icon: 'text-yellow-300'
      }
    }
    
    return planColors[planId || ''] || {
      gradient: 'from-green-500 via-green-600 to-emerald-600',
      accent: 'text-green-300',
      icon: 'text-green-300'
    }
  }
  
  
  if (compact) {
    const colors = getPlanColors(userPlan.id)
    return (
      <Card className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient} border-0 shadow-xl`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        <CardContent className="relative p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className={`w-5 h-5 ${colors.icon}`} />
              <div>
                <h3 className="font-semibold">{userPlan.name}</h3>
                <p className={`text-sm ${colors.accent} opacity-90`}>
                  {usageInfo.vehicles.current}/{usageInfo.vehicles.max === 0 ? '∞' : usageInfo.vehicles.max} veículos
                </p>
              </div>
            </div>
            {showUpgradeButton && userPlan.id !== 'ilimitado' && (
              <Link href="/planos">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <ArrowUpCircle className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const colors = getPlanColors(userPlan.id)
  
  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <Card className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient} border-0 shadow-xl`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        <CardHeader className="relative text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className={`w-6 h-6 ${colors.icon}`} />
              Plano {userPlan.name}
            </div>
            {showUpgradeButton && userPlan.id !== 'ilimitado' && (
              <Link href="/planos">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </Link>
            )}
          </CardTitle>
          <CardDescription className={`${colors.accent} opacity-90`}>
            Gerencie seus recursos e acompanhe o uso do seu plano atual.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicles Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="w-4 h-4" />
              Veículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Utilizados</span>
                <span className="font-medium">
                  {usageInfo.vehicles.current}/{usageInfo.vehicles.max === 0 ? '∞' : usageInfo.vehicles.max}
                </span>
              </div>
              {usageInfo.vehicles.max > 0 && (
                <Progress 
                  value={usageInfo.vehicles.percentage} 
                  className="h-2"
                />
              )}
              <div className="flex items-center gap-2">
                {vehicleCheck.canAdd ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Pode adicionar
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Limite atingido
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Featured Vehicles Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="w-4 h-4" />
              Destaques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Utilizados</span>
                <span className="font-medium">
                  {usageInfo.featuredVehicles.current}/{usageInfo.featuredVehicles.max}
                </span>
              </div>
              <Progress 
                value={usageInfo.featuredVehicles.percentage} 
                className="h-2"
              />
              <div className="flex items-center gap-2">
                {featureCheck.canAdd ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Pode destacar
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Limite atingido
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Recursos do Plano
          </CardTitle>
          <CardDescription>
            Recursos e funcionalidades disponíveis no seu plano atual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Ad Types */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Car className="w-4 h-4" />
                Tipos de Anúncios
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {planFeatures?.canCreateBasicAds ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">Anúncios básicos</span>
                </div>
                <div className="flex items-center gap-2">
                  {planFeatures?.canCreateFeaturedAds ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">Anúncios destacados</span>
                </div>
                <div className="flex items-center gap-2">
                  {planFeatures?.canCreatePremiumAds ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">Anúncios premium</span>
                </div>
              </div>
            </div>
            
            {/* Support */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Suporte
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {planFeatures?.hasEmailSupport ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  {planFeatures?.hasPhoneSupport ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">Telefone</span>
                </div>
                <div className="flex items-center gap-2">
                  {planFeatures?.hasWhatsappSupport ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  {planFeatures?.has24_7Support ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">24/7</span>
                </div>
              </div>
            </div>
            
            {/* Analytics & Reports */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Relatórios
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {planFeatures?.hasBasicStats ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">Estatísticas básicas</span>
                </div>
                <div className="flex items-center gap-2">
                  {planFeatures?.hasAdvancedStats ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">Estatísticas avançadas</span>
                </div>
                <div className="flex items-center gap-2">
                  {planFeatures?.hasCustomReports ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-sm">Relatórios personalizados</span>
                </div>

              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Limits Warning */}
      {(usageInfo.vehicles.percentage >= 80 || usageInfo.featuredVehicles.percentage >= 80) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> Você está próximo do limite do seu plano. 
            {showUpgradeButton && userPlan.id !== 'ilimitado' && (
              <>
                {' '}
                <Link href="/planos" className="underline font-medium">
                  Considere fazer um upgrade
                </Link>
                {' '}para ter mais recursos disponíveis.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}