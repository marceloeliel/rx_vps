"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { usePlanControl } from "@/hooks/use-plan-control"
import { 
  Crown, 
  Star, 
  Car, 
  ArrowUpCircle, 
  CheckCircle,
  AlertTriangle,
  Zap
} from "lucide-react"
import Link from "next/link"

interface PlanInfoCardProps {
  variant?: 'default' | 'compact' | 'detailed'
  showUpgradeButton?: boolean
  className?: string
}

export function PlanInfoCard({ 
  variant = 'default', 
  showUpgradeButton = true,
  className = ""
}: PlanInfoCardProps) {
  const { 
    userPlan, 
    userUsage, 
    loading, 
    getUsageInfo 
  } = usePlanControl()
  
  const usageInfo = getUsageInfo()

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader className="pb-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </CardContent>
      </Card>
    )
  }

  if (!userPlan || !usageInfo) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">Erro ao carregar informações do plano</p>
            <Link href="/planos">
              <Button size="sm" className="mt-2">
                Escolher Plano
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basico':
        return {
          bg: 'from-blue-500 to-blue-600',
          accent: 'text-blue-300',
          badge: 'bg-blue-400 text-blue-900'
        }
      case 'profissional':
        return {
          bg: 'from-orange-500 to-orange-600',
          accent: 'text-orange-300',
          badge: 'bg-orange-400 text-orange-900'
        }
      case 'empresarial':
        return {
          bg: 'from-purple-500 to-purple-600',
          accent: 'text-purple-300',
          badge: 'bg-purple-400 text-purple-900'
        }
      case 'ilimitado':
        return {
          bg: 'from-yellow-500 to-yellow-600',
          accent: 'text-yellow-300',
          badge: 'bg-yellow-400 text-yellow-900'
        }
      default:
        return {
          bg: 'from-gray-500 to-gray-600',
          accent: 'text-gray-300',
          badge: 'bg-gray-400 text-gray-900'
        }
    }
  }

  const colors = getPlanColor(userPlan.id)

  if (variant === 'compact') {
    return (
      <Card className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} border-0 shadow-lg ${className}`}>
        <CardContent className="p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-300" />
              <div>
                <h3 className="font-bold">{userPlan.name}</h3>
                <p className="text-xs opacity-80">
                  R$ {userPlan.price.toFixed(2).replace('.', ',')} /mês
                </p>
              </div>
            </div>
            {showUpgradeButton && userPlan.id !== 'ilimitado' && (
              <Link href="/planos">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ArrowUpCircle className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} border-0 shadow-xl ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

        <CardContent className="relative p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Crown className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Plano {userPlan.name}</h3>
                <p className="text-white/80 text-sm opacity-90">
                  R$ {userPlan.price.toFixed(2).replace('.', ',')} /mês
                </p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full backdrop-blur-sm ${colors.badge}`}>
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>

          {/* Uso de Recursos */}
          <div className="space-y-3 mb-4">
            {/* Veículos */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <span className="text-sm">Veículos</span>
              </div>
              <div className="text-right">
                <span className="font-medium">
                  {usageInfo.vehicles.current}
                  {userPlan.maxVehicles > 0 && `/${userPlan.maxVehicles}`}
                  {userPlan.maxVehicles === 0 && ' (Ilimitado)'}
                </span>
                {userPlan.maxVehicles > 0 && (
                  <div className="w-16 mt-1">
                    <Progress 
                      value={usageInfo.vehicles.percentage} 
                      className="h-1 bg-white/20"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Destaques */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="text-sm">Destaques</span>
              </div>
              <div className="text-right">
                <span className="font-medium">
                  {usageInfo.featuredVehicles.current}/{userPlan.maxFeaturedVehicles}
                </span>
                <div className="w-16 mt-1">
                  <Progress 
                    value={usageInfo.featuredVehicles.percentage} 
                    className="h-1 bg-white/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3 w-3 fill-current" />
              <span>Anúncios básicos</span>
            </div>
            {['profissional', 'empresarial', 'ilimitado'].includes(userPlan.id) && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-3 w-3" />
                <span>Anúncios destacados</span>
              </div>
            )}
            {['empresarial', 'ilimitado'].includes(userPlan.id) && (
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-3 w-3" />
                <span>Anúncios premium</span>
              </div>
            )}
          </div>

          {showUpgradeButton && userPlan.id !== 'ilimitado' && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <CheckCircle className={`h-4 w-4 ${colors.accent}`} />
                <span className="text-sm text-white/90">Ativo</span>
              </div>
              <Link href="/planos">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20"
                >
                  Fazer Upgrade
                  <ArrowUpCircle className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Variant default
  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} border-0 shadow-lg ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
      
      <CardContent className="relative p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-300" />
            <div>
              <h3 className="font-bold">Plano {userPlan.name}</h3>
              <p className="text-xs opacity-80">
                R$ {userPlan.price.toFixed(2).replace('.', ',')} /mês
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
            ✅ ATIVO
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span>Veículos:</span>
            <span className="font-medium">
              {usageInfo.vehicles.current}
              {userPlan.maxVehicles > 0 && `/${userPlan.maxVehicles}`}
              {userPlan.maxVehicles === 0 && ' (Ilimitado)'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Destaques:</span>
            <span className="font-medium">
              {usageInfo.featuredVehicles.current}/{userPlan.maxFeaturedVehicles}
            </span>
          </div>
        </div>

        {showUpgradeButton && userPlan.id !== 'ilimitado' && (
          <Link href="/planos">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-white hover:bg-white/20"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}