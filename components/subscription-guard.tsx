"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, CreditCard, Clock, Gift, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { checkUserPromotionalAccess, type PromotionalAccess } from '@/lib/supabase/promotions'
import { checkTrialPeriod } from '@/lib/supabase/trial'

interface SubscriptionGuardProps {
  children: React.ReactNode
  redirectTo?: string
  showPaymentButton?: boolean
}

interface AccessStatus {
  hasAccess: boolean
  subscription: any | null
  reason?: string
  isPromotional?: boolean
  promotionalAccess?: PromotionalAccess | null
  isInTrial?: boolean
  trialDaysRemaining?: number | null
}

export default function SubscriptionGuard({ 
  children, 
  redirectTo = '/planos',
  showPaymentButton = true 
}: SubscriptionGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({ 
    hasAccess: false, 
    subscription: null,
    isPromotional: false,
    promotionalAccess: null,
    isInTrial: false,
    trialDaysRemaining: null
  })
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const supabase = createClient()
      
      // Verificar se há usuário logado
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || null)

      // Primeiro, verificar período de teste
      const trialStatus = await checkTrialPeriod(user.id)
      
      if (trialStatus.isInTrial) {
        setAccessStatus({
          hasAccess: true,
          subscription: {
            plan_type: trialStatus.trialPeriod?.plan_type || 'basico',
            status: 'trial',
            end_date: trialStatus.trialPeriod?.end_date
          },
          reason: `Período de teste: ${trialStatus.daysRemaining} dias restantes`,
          isPromotional: false,
          promotionalAccess: null,
          isInTrial: true,
          trialDaysRemaining: trialStatus.daysRemaining
        })
        setIsLoading(false)
        return
      }

      // Se não está em trial, verificar acesso promocional
      const promotionalAccess = await checkUserPromotionalAccess(user.id)
      
      if (promotionalAccess && promotionalAccess.has_access && promotionalAccess.is_promotional) {
        setAccessStatus({
          hasAccess: true,
          subscription: {
            plan_type: 'promocional',
            status: 'promotional_active',
            end_date: promotionalAccess.end_date
          },
          reason: `Período promocional: ${promotionalAccess.days_remaining} dias restantes`,
          isPromotional: true,
          promotionalAccess: promotionalAccess
        })
        setIsLoading(false)
        return
      }

      // Verificar se o usuário tem acesso ilimitado no perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('unlimited_access, plano_atual')
        .eq('id', user.id)
        .single()

      if (!profileError && profile) {
        // Se o usuário tem acesso ilimitado, permitir acesso imediatamente
        if (profile.unlimited_access === true || 
            profile.plano_atual === 'ilimitado' || 
            profile.plano_atual === 'premium_plus' || 
            profile.plano_atual === 'empresarial') {
          setAccessStatus({
            hasAccess: true,
            subscription: {
              plan_type: profile.plano_atual,
              status: 'unlimited',
              end_date: null
            },
            reason: 'Acesso ilimitado ativo',
            isPromotional: false,
            promotionalAccess: promotionalAccess
          })
          setIsLoading(false)
          return
        }
      }

      // Se não tem acesso ilimitado, verificar assinatura paga
      try {
        const response = await fetch(`/api/subscriptions?userId=${user.id}`)
        
        if (response.ok) {
          const result = await response.json()
          
          if (result.access) {
            setAccessStatus({
              ...result.access,
              isPromotional: false,
              promotionalAccess: promotionalAccess
            })
          } else {
            // Verificar se é usuário promocional expirado
            if (promotionalAccess && promotionalAccess.is_promotional && !promotionalAccess.has_access) {
              setAccessStatus({
                hasAccess: false,
                subscription: null,
                reason: 'Seu período promocional expirou. Escolha um plano para continuar.',
                isPromotional: false,
                promotionalAccess: promotionalAccess
              })
            } else {
              setAccessStatus({
                hasAccess: false,
                subscription: null,
                reason: 'Nenhuma assinatura ativa encontrada',
                isPromotional: false,
                promotionalAccess: promotionalAccess
              })
            }
          }
        } else {
          console.error('Erro ao verificar assinatura:', response.statusText)
          setAccessStatus({
            hasAccess: false,
            subscription: null,
            reason: 'Erro ao verificar status da assinatura',
            isPromotional: false,
            promotionalAccess: promotionalAccess
          })
        }
      } catch (error) {
        console.error('Erro na requisição de assinatura:', error)
        setAccessStatus({
          hasAccess: false,
          subscription: null,
          reason: 'Erro de conexão',
          isPromotional: false,
          promotionalAccess: promotionalAccess
        })
      }

    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-sm text-gray-600">Verificando assinatura...</p>
        </div>
      </div>
    )
  }

  // Se tem acesso, mostrar conteúdo
  if (accessStatus.hasAccess) {
    return (
      <>
        {/* Banner promocional */}
        {accessStatus.isPromotional && accessStatus.promotionalAccess && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <Gift className="h-4 w-4" />
            <AlertDescription className="text-green-800 flex items-center justify-between">
              <span>
                🎉 Período promocional ativo! {accessStatus.promotionalAccess.days_remaining} dias restantes
                {accessStatus.promotionalAccess.campaign_name && ` (${accessStatus.promotionalAccess.campaign_name})`}
              </span>
              <Badge variant="outline" className="border-green-300 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Gratuito
              </Badge>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Alert de renovação próxima */}
        {accessStatus.reason && !accessStatus.isPromotional && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              {accessStatus.reason}
            </AlertDescription>
          </Alert>
        )}
        
        {children}
      </>
    )
  }

  // Se não tem acesso, mostrar tela de bloqueio
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            {accessStatus.promotionalAccess?.is_promotional ? (
              <Gift className="h-6 w-6 text-orange-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {accessStatus.promotionalAccess?.is_promotional && !accessStatus.hasAccess 
              ? 'Período Promocional Expirado' 
              : 'Acesso Restrito'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {accessStatus.reason || 'Você precisa de uma assinatura ativa para acessar esta área.'}
          </p>
          
          {/* Mensagem especial para usuários promocionais expirados */}
          {accessStatus.promotionalAccess?.is_promotional && !accessStatus.hasAccess && (
            <Alert className="border-orange-200 bg-orange-50">
              <Gift className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                Obrigado por experimentar nossos serviços! Seu período de {accessStatus.promotionalAccess.campaign_name || 'teste gratuito'} chegou ao fim.
                Escolha um plano para continuar aproveitando todos os benefícios.
              </AlertDescription>
            </Alert>
          )}
          
          {accessStatus.subscription?.status === 'blocked' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                Sua assinatura foi suspensa por falta de pagamento. 
                Efetue o pagamento para reativar o acesso.
              </AlertDescription>
            </Alert>
          )}

          {accessStatus.subscription?.status === 'pending_payment' && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                Pagamento pendente. Você tem até{' '}
                {accessStatus.subscription.grace_period_ends_at 
                  ? new Date(accessStatus.subscription.grace_period_ends_at).toLocaleDateString('pt-BR')
                  : '5 dias'
                } para efetuar o pagamento.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {/* Botão específico para ex-usuários promocionais */}
            {accessStatus.promotionalAccess?.is_promotional && !accessStatus.hasAccess && (
              <Button
                onClick={() => router.push('/planos')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Gift className="mr-2 h-4 w-4" />
                Ver Planos Especiais
              </Button>
            )}
            
            {showPaymentButton && !accessStatus.promotionalAccess?.is_promotional && (
              <Button
                onClick={() => router.push('/minhas-cobrancas')}
                className="w-full"
                variant="default"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Ver Meus Pagamentos
              </Button>
            )}
            
            {!accessStatus.promotionalAccess?.is_promotional && (
              <Button
                onClick={() => router.push(redirectTo)}
                variant="outline"
                className="w-full"
              >
                Escolher Plano
              </Button>
            )}
          </div>

          {userEmail && (
            <p className="text-xs text-gray-500">
              Logado como: {userEmail}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 