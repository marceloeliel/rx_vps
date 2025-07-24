"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar, DollarSign, Clock, Shield } from 'lucide-react'
import { PLAN_CONFIGS } from '@/lib/supabase/subscriptions'

export default function TesteAssinaturaSistema() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [accessStatus, setAccessStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      await loadSubscription(user.id)
    }
    setLoading(false)
  }

  const loadSubscription = async (userId: string) => {
    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`)
      
      if (response.ok) {
        const result = await response.json()
        setSubscription(result.subscription)
        setAccessStatus(result.access)
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error)
    }
  }

  const createTestSubscription = async (planType: string) => {
    if (!user) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planType,
          asaasCustomerId: 'cus_test_123'
        })
      })

      if (response.ok) {
        await loadSubscription(user.id)
        alert('Assinatura criada com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      alert('Erro ao criar assinatura')
    }
    setActionLoading(false)
  }

  const updateSubscriptionStatus = async (status: string) => {
    if (!subscription) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          status
        })
      })

      if (response.ok) {
        await loadSubscription(user.id)
        alert(`Status atualizado para: ${status}`)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      alert('Erro ao atualizar status')
    }
    setActionLoading(false)
  }

  const testAutoBilling = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/subscriptions/auto-billing', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-key'}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Processamento concluído!\nExpiradas: ${result.results.processedExpired}\nBloqueadas: ${result.results.processedBlocked}`)
        await loadSubscription(user.id)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      alert('Erro no processamento automático')
    }
    setActionLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      pending_payment: 'bg-orange-100 text-orange-800',
      blocked: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      active: 'Ativo',
      pending_payment: 'Pagamento Pendente',
      blocked: 'Bloqueado',
      cancelled: 'Cancelado'
    }

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Você precisa estar logado para testar o sistema de assinaturas.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sistema de Assinaturas - Teste</h1>
        <Button 
          onClick={() => loadSubscription(user.id)}
          disabled={actionLoading}
        >
          Atualizar
        </Button>
      </div>

      {/* Status de Acesso */}
      {accessStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Tem Acesso:</span>
                <Badge className={accessStatus.hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {accessStatus.hasAccess ? 'SIM' : 'NÃO'}
                </Badge>
              </div>
              {accessStatus.reason && (
                <div className="text-sm text-gray-600">
                  <strong>Motivo:</strong> {accessStatus.reason}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assinatura Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assinatura Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Plano</label>
                  <p className="font-semibold">{subscription.plan_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor</label>
                  <p className="font-semibold">R$ {subscription.plan_value}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>{getStatusBadge(subscription.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vencimento</label>
                  <p className="font-semibold">
                    {new Date(subscription.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {subscription.grace_period_ends_at && (
                <div className="bg-orange-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Período de Tolerância até:</span>
                    <span>{new Date(subscription.grace_period_ends_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => updateSubscriptionStatus('active')}
                  disabled={actionLoading}
                  variant="outline"
                  size="sm"
                >
                  Ativar
                </Button>
                <Button 
                  onClick={() => updateSubscriptionStatus('pending_payment')}
                  disabled={actionLoading}
                  variant="outline"
                  size="sm"
                >
                  Pendente
                </Button>
                <Button 
                  onClick={() => updateSubscriptionStatus('blocked')}
                  disabled={actionLoading}
                  variant="outline"
                  size="sm"
                >
                  Bloquear
                </Button>
                <Button 
                  onClick={() => updateSubscriptionStatus('cancelled')}
                  disabled={actionLoading}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Nenhuma assinatura encontrada</p>
              
              <div className="space-y-2">
                <h3 className="font-medium">Criar Assinatura de Teste:</h3>
                <div className="flex gap-2 flex-wrap justify-center">
                  {Object.entries(PLAN_CONFIGS).map(([planType, config]) => (
                    <Button
                      key={planType}
                      onClick={() => createTestSubscription(planType)}
                      disabled={actionLoading}
                      variant="outline"
                    >
                      {config.name} - R$ {config.value}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testes do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Testes do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Cobrança Automática</h3>
            <p className="text-sm text-gray-600 mb-3">
              Simula o processamento diário de assinaturas vencidas e bloqueios.
            </p>
            <Button 
              onClick={testAutoBilling}
              disabled={actionLoading}
              className="w-full"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Executar Processamento Automático
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Instruções de Teste:</strong>
              <br />1. Crie uma assinatura com qualquer plano
              <br />2. Teste mudanças de status (ativo → pendente → bloqueado)
              <br />3. Execute o processamento automático
              <br />4. Verifique o comportamento do SubscriptionGuard em outras páginas
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Info do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.email}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 