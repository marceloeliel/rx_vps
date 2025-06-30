"use client"

import { ReactNode } from "react"
import { useSubscription } from "@/hooks/use-subscription"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  Lock, 
  Zap,
  Calendar,
  ArrowRight
} from "lucide-react"

interface SubscriptionGuardProps {
  children: ReactNode
  feature?: string
  fallback?: ReactNode
  showWarning?: boolean // Mostrar aviso mesmo se ainda tem acesso
}

export function SubscriptionGuard({ 
  children, 
  feature, 
  fallback,
  showWarning = true 
}: SubscriptionGuardProps) {
  const { subscriptionStatus, loading, renewSubscription, hasFeatureAccess } = useSubscription()

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Verificando assinatura...</span>
      </div>
    )
  }

  // Se tem acesso, mostrar conteúdo (com possível aviso)
  const hasAccess = feature ? hasFeatureAccess(feature) : subscriptionStatus.hasAccess

  if (hasAccess) {
    return (
      <>
        {/* Aviso de renovação próxima */}
        {showWarning && subscriptionStatus.needsRenewal && !subscriptionStatus.isExpired && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Sua assinatura vence em {subscriptionStatus.daysUntilExpiration} dias!</strong>
                  <br />
                  Renove agora para não perder o acesso às funcionalidades.
                </div>
                <Button 
                  size="sm" 
                  onClick={renewSubscription}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Renovar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        {children}
      </>
    )
  }

  // Se não tem acesso, mostrar bloqueio
  if (fallback) {
    return <>{fallback}</>
  }

  return <SubscriptionBlockedScreen />
}

// Tela de bloqueio padrão
function SubscriptionBlockedScreen() {
  const { subscriptionStatus, renewSubscription, profile } = useSubscription()

  const formatDate = (date: Date | null) => {
    if (!date) return "Não definido"
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    })
  }

  const getPlanName = (planType: string | null) => {
    const plans = {
      basico: "Plano Básico",
      profissional: "Plano Profissional", 
      empresarial: "Plano Empresarial"
    }
    return plans[planType as keyof typeof plans] || "Plano"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Assinatura Vencida
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status da Assinatura */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Acesso Bloqueado</span>
            </div>
            
            <div className="space-y-2 text-sm">
              {subscriptionStatus.planType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Plano:</span>
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    {getPlanName(subscriptionStatus.planType)}
                  </Badge>
                </div>
              )}
              
              {subscriptionStatus.expirationDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Venceu em:</span>
                  <span className="font-medium text-red-600">
                    {formatDate(subscriptionStatus.expirationDate)}
                  </span>
                </div>
              )}
              
              {subscriptionStatus.daysUntilExpiration !== null && subscriptionStatus.daysUntilExpiration < 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Há quantos dias:</span>
                  <span className="font-medium text-red-600">
                    {Math.abs(subscriptionStatus.daysUntilExpiration)} dias
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mensagem Principal */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Sua assinatura expirou e o acesso às funcionalidades foi bloqueado. 
              Renove agora para continuar usando todos os recursos.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Renovação Instantânea</span>
              </div>
              <p className="text-blue-700 text-xs mt-1">
                Após o pagamento, o acesso é liberado imediatamente
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            <Button 
              onClick={renewSubscription}
              className="w-full bg-orange-500 hover:bg-orange-600"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Renovar Assinatura
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/planos"}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ver Planos Disponíveis
            </Button>
          </div>

          {/* Informações de Contato */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Dúvidas? Entre em contato conosco
            </p>
            <p className="text-xs text-orange-600 font-medium">
              suporte@rxautos.com.br
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para mostrar aviso de limite atingido
export function FeatureLimitReached({ 
  feature, 
  currentPlan, 
  upgradeAction 
}: { 
  feature: string
  currentPlan: string
  upgradeAction: () => void 
}) {
  const getFeatureName = (feature: string) => {
    const features = {
      create_vehicle: "Criar Veículo",
      unlimited_vehicles: "Veículos Ilimitados",
      featured_listings: "Anúncios Destacados",
      api_integration: "Integração API",
      advanced_stats: "Estatísticas Avançadas"
    }
    return features[feature as keyof typeof features] || feature
  }

  const getPlanName = (planType: string) => {
    const plans = {
      basico: "Plano Básico",
      profissional: "Plano Profissional", 
      empresarial: "Plano Empresarial"
    }
    return plans[planType as keyof typeof plans] || planType
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Zap className="h-6 w-6 text-yellow-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Limite Atingido
        </h3>
        
        <p className="text-yellow-700 mb-4">
          A funcionalidade <strong>{getFeatureName(feature)}</strong> não está disponível no seu plano atual 
          (<strong>{getPlanName(currentPlan)}</strong>).
        </p>
        
        <Button 
          onClick={upgradeAction}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  )
} 