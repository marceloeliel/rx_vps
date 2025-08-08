"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { usePlanControl, usePlanFeatures } from "@/hooks/use-plan-control"
import { 
  Car, 
  Star, 
  HardDrive, 
  Zap, 
  Crown, 
  Shield, 
  Phone, 
  MessageCircle, 
  Mail, 
  BarChart3, 
  FileText, 
  Settings, 
  Code, 
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowUpCircle,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

interface PlanUsageDashboardProps {
  showUpgradePrompt?: boolean
}

export function PlanUsageDashboard({ showUpgradePrompt = false }: PlanUsageDashboardProps) {
  const { 
    userPlan, 
    userUsage, 
    loading, 
    canAddVehicle, 
    canFeatureVehicle,
    getUsageInfo,
    syncVehicleCount
  } = usePlanControl()
  
  const planFeatures = usePlanFeatures()
  
  const [syncing, setSyncing] = useState(false)
  
  const handleSync = async () => {
     setSyncing(true)
     try {
       await syncVehicleCount()
     } finally {
       setSyncing(false)
     }
   }
   
   const usageInfo = getUsageInfo()
  const vehicleCheck = canAddVehicle()
  const featureCheck = canFeatureVehicle()

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!userPlan || !usageInfo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Erro ao carregar informações do plano</p>
        </CardContent>
      </Card>
    )
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusIcon = (canDo: boolean) => {
    return canDo ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header do Plano */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-yellow-500" />
              <div>
                <CardTitle className="text-xl">Plano {userPlan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  R$ {userPlan.price.toFixed(2).replace('.', ',')} /mês
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              {showUpgradePrompt && userPlan.id !== 'ilimitado' && (
                <Link href="/planos">
                  <Button variant="outline" size="sm">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Uso de Recursos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Veículos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">
                {usageInfo.vehicles.current}
                {userPlan.maxVehicles > 0 && (
                  <span className="text-sm text-muted-foreground">/{userPlan.maxVehicles}</span>
                )}
              </div>
              {getStatusIcon(vehicleCheck.canAdd)}
            </div>
            {userPlan.maxVehicles > 0 && (
              <div className="space-y-1">
                <Progress 
                  value={usageInfo.vehicles.percentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {usageInfo.vehicles.percentage.toFixed(0)}% utilizado
                </p>
              </div>
            )}
            {userPlan.maxVehicles === 0 && (
              <Badge variant="secondary" className="text-xs">
                Ilimitado
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Destaques */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destaques</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">
                {usageInfo.featuredVehicles.current}
                <span className="text-sm text-muted-foreground">/{userPlan.maxFeaturedVehicles}</span>
              </div>
              {getStatusIcon(featureCheck.canAdd)}
            </div>
            <div className="space-y-1">
              <Progress 
                value={usageInfo.featuredVehicles.percentage} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {usageInfo.featuredVehicles.percentage.toFixed(0)}% utilizado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Armazenamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {usageInfo.storage.current}MB
              <span className="text-sm text-muted-foreground">/{userPlan.storageLimitMb}MB</span>
            </div>
            <div className="space-y-1">
              <Progress 
                value={usageInfo.storage.percentage} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {usageInfo.storage.percentage.toFixed(0)}% utilizado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Calls */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {usageInfo.apiCalls.current}
              {userPlan.apiCallsPerMonth > 0 && (
                <span className="text-sm text-muted-foreground">/{userPlan.apiCallsPerMonth}</span>
              )}
            </div>
            {userPlan.apiCallsPerMonth > 0 ? (
              <div className="space-y-1">
                <Progress 
                  value={usageInfo.apiCalls.percentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {usageInfo.apiCalls.percentage.toFixed(0)}% utilizado
                </p>
              </div>
            ) : (
              <Badge variant="outline" className="text-xs">
                Não disponível
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recursos Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recursos do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Anúncios */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Car className="h-4 w-4" />
                Anúncios
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.canCreateBasicAds)}
                  <span>Anúncios básicos</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.canCreateFeaturedAds)}
                  <span>Anúncios destacados</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.canCreatePremiumAds)}
                  <span>Anúncios premium</span>
                </div>
              </div>
            </div>

            {/* Suporte */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Suporte
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasEmailSupport)}
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasPhoneSupport)}
                  <Phone className="h-3 w-3" />
                  <span>Telefone</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasWhatsappSupport)}
                  <MessageCircle className="h-3 w-3" />
                  <span>WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasPrioritySupport)}
                  <Crown className="h-3 w-3" />
                  <span>Prioritário</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.has24_7Support)}
                  <span>24/7</span>
                </div>
              </div>
            </div>

            {/* Relatórios */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasBasicStats)}
                  <span>Estatísticas básicas</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasAdvancedStats)}
                  <span>Estatísticas avançadas</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasCompleteStats)}
                  <span>Estatísticas completas</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasCustomReports)}
                  <FileText className="h-3 w-3" />
                  <span>Relatórios personalizados</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasAdvancedReports)}
                  <span>Relatórios avançados</span>
                </div>
              </div>
            </div>

            {/* Recursos Avançados */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Recursos Avançados
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasAdminPanel)}
                  <span>Painel administrativo</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasApiAccess)}
                  <Code className="h-3 w-3" />
                  <span>Acesso à API</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(planFeatures.hasDedicatedConsulting)}
                  <Users className="h-3 w-3" />
                  <span>Consultoria dedicada</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Limite */}
      {(usageInfo.vehicles.percentage >= 80 || usageInfo.featuredVehicles.percentage >= 80) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Atenção aos Limites
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <div className="space-y-2">
              {usageInfo.vehicles.percentage >= 80 && userPlan.maxVehicles > 0 && (
                <p>• Você está próximo do limite de veículos ({usageInfo.vehicles.current}/{userPlan.maxVehicles})</p>
              )}
              {usageInfo.featuredVehicles.percentage >= 80 && (
                <p>• Você está próximo do limite de destaques ({usageInfo.featuredVehicles.current}/{userPlan.maxFeaturedVehicles})</p>
              )}
              {showUpgradePrompt && (
                <div className="mt-3">
                  <Link href="/planos">
                    <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                      Fazer Upgrade do Plano
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}