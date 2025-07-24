"use client"

import SubscriptionGuard from "@/components/subscription-guard"
import { useSubscription } from "@/hooks/use-subscription"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard,
  Car,
  Users,
  Zap,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function TesteAssinaturaPage() {
  const { subscriptionStatus, loading, profile, renewSubscription, hasFeatureAccess, getPlanLimits } = useSubscription()

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
    return plans[planType as keyof typeof plans] || "Sem Plano"
  }

  const planLimits = getPlanLimits()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Carregando dados da assinatura...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Controle de Assinatura</h1>
          <p className="text-gray-600 mt-2">
            Teste o sistema de bloqueio e controle de funcionalidades baseado na assinatura
          </p>
        </div>

        {/* Status da Assinatura */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Status da Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Usuário:</span>
                  <span className="font-medium">{profile?.nome_completo || "Não identificado"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plano Atual:</span>
                  <Badge variant={subscriptionStatus.isActive ? "default" : "secondary"}>
                    {getPlanName(subscriptionStatus.planType)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center gap-2">
                    {subscriptionStatus.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={subscriptionStatus.isActive ? "text-green-600" : "text-red-600"}>
                      {subscriptionStatus.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                {subscriptionStatus.expirationDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Data de Vencimento:</span>
                    <span className="font-medium">
                      {formatDate(subscriptionStatus.expirationDate)}
                    </span>
                  </div>
                )}

                {subscriptionStatus.daysUntilExpiration !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {subscriptionStatus.daysUntilExpiration >= 0 ? "Dias restantes:" : "Vencida há:"}
                    </span>
                    <span className={`font-medium ${
                      subscriptionStatus.daysUntilExpiration >= 0 ? "text-blue-600" : "text-red-600"
                    }`}>
                      {Math.abs(subscriptionStatus.daysUntilExpiration)} dias
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Limites do Plano</h4>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Máximo de Veículos:</span>
                  <span className="font-medium">
                    {planLimits.maxVehicles === -1 ? "Ilimitado" : planLimits.maxVehicles}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fotos por Veículo:</span>
                  <span className="font-medium">{planLimits.maxPhotosPerVehicle}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Anúncios Destacados:</span>
                  <span className={`font-medium ${planLimits.featuredListings ? "text-green-600" : "text-red-600"}`}>
                    {planLimits.featuredListings ? "Sim" : "Não"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Acesso à API:</span>
                  <span className={`font-medium ${planLimits.apiAccess ? "text-green-600" : "text-red-600"}`}>
                    {planLimits.apiAccess ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
            </div>

            {subscriptionStatus.needsRenewal && (
              <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="flex items-center justify-between">
                    <span>
                      {subscriptionStatus.isExpired 
                        ? "Sua assinatura expirou! Renove para continuar usando as funcionalidades."
                        : `Sua assinatura vence em ${subscriptionStatus.daysUntilExpiration} dias. Renove agora!`
                      }
                    </span>
                    <Button 
                      size="sm" 
                      onClick={renewSubscription}
                      className="bg-yellow-600 hover:bg-yellow-700 ml-4"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Renovar
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Teste de Funcionalidades */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Funcionalidade: Criar Veículo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Criar Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Teste o acesso à funcionalidade de criar veículos.
              </p>
              
              <SubscriptionGuard 
                feature="create_vehicle"
                fallback={
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700 font-medium">Acesso Bloqueado</p>
                    <p className="text-red-600 text-sm">Assinatura necessária para criar veículos</p>
                  </div>
                }
              >
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Acesso Liberado</p>
                  <p className="text-green-600 text-sm">Você pode criar veículos</p>
                  <Button className="mt-2" size="sm">
                    <Car className="h-4 w-4 mr-2" />
                    Criar Veículo
                  </Button>
                </div>
              </SubscriptionGuard>
            </CardContent>
          </Card>

          {/* Funcionalidade: Anúncios Destacados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Anúncios Destacados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Teste o acesso à funcionalidade de anúncios destacados.
              </p>
              
              <SubscriptionGuard 
                feature="featured_listings"
                fallback={
                  <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <XCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-yellow-700 font-medium">Upgrade Necessário</p>
                    <p className="text-yellow-600 text-sm">Disponível no Plano Profissional ou superior</p>
                    <Button size="sm" className="mt-2" onClick={() => window.location.href = "/planos"}>
                      Fazer Upgrade
                    </Button>
                  </div>
                }
              >
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Acesso Liberado</p>
                  <p className="text-green-600 text-sm">Você pode criar anúncios destacados</p>
                  <Button className="mt-2" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Destacar Anúncio
                  </Button>
                </div>
              </SubscriptionGuard>
            </CardContent>
          </Card>

          {/* Funcionalidade: Painel Administrativo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Painel Administrativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Teste o acesso ao painel administrativo completo.
              </p>
              
              <SubscriptionGuard 
                feature="admin_panel"
                fallback={
                  <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <XCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-purple-700 font-medium">Plano Empresarial Necessário</p>
                    <p className="text-purple-600 text-sm">Funcionalidade exclusiva do plano empresarial</p>
                    <Button size="sm" className="mt-2" onClick={() => window.location.href = "/planos"}>
                      Upgrade para Empresarial
                    </Button>
                  </div>
                }
              >
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Acesso Liberado</p>
                  <p className="text-green-600 text-sm">Você pode acessar o painel administrativo</p>
                  <Button className="mt-2" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Abrir Painel
                  </Button>
                </div>
              </SubscriptionGuard>
            </CardContent>
          </Card>

          {/* Teste de Acesso Geral */}
          <Card>
            <CardHeader>
              <CardTitle>Teste de Acesso Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Este conteúdo só é exibido se a assinatura estiver ativa.
              </p>
              
              <SubscriptionGuard>
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-700 font-medium">Assinatura Ativa</p>
                  <p className="text-blue-600 text-sm">Você tem acesso completo ao sistema</p>
                </div>
              </SubscriptionGuard>
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Como Testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Sem assinatura:</strong> Todas as funcionalidades ficam bloqueadas</p>
              <p>• <strong>Assinatura vencida:</strong> Sistema mostra tela de renovação</p>
              <p>• <strong>Assinatura próxima do vencimento:</strong> Aviso de renovação</p>
              <p>• <strong>Plano Básico:</strong> Acesso limitado a funcionalidades básicas</p>
              <p>• <strong>Plano Profissional:</strong> Acesso a funcionalidades avançadas</p>
              <p>• <strong>Plano Empresarial:</strong> Acesso completo a todas as funcionalidades</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 