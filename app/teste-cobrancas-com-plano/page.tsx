"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardCobrancas } from '@/components/dashboard-cobrancas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createSubscription, PLAN_CONFIGS } from '@/lib/supabase/subscriptions'
import { ArrowLeft, TestTube } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TesteCobrancasComPlano() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
    }
    setLoading(false)
  }

  const createTestSubscription = async (planType: string) => {
    if (!user) return
    
    setCreating(true)
    try {
      const subscription = await createSubscription(
        user.id, 
        planType as keyof typeof PLAN_CONFIGS,
        'cus_test_' + Date.now()
      )

      if (subscription) {
        alert(`Assinatura ${planType} criada com sucesso! Vencimento: ${new Date(subscription.end_date).toLocaleDateString('pt-BR')}`)
        // Recarregar a página para mostrar a nova assinatura
        window.location.reload()
      } else {
        alert('Erro ao criar assinatura')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar assinatura')
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div>Carregando...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Você precisa estar logado para testar.</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/login')}
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-6 lg:py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TestTube className="h-6 w-6" />
                Teste: Cobranças com Informações do Plano
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                Teste da nova funcionalidade que mostra o vencimento do plano
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
        
        {/* Instruções de Teste */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Como Testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>1.</strong> Se você não tiver uma assinatura, crie uma usando os botões abaixo</p>
              <p><strong>2.</strong> Verifique se aparece a seção "Informações do Plano" azul</p>
              <p><strong>3.</strong> Confirme se mostra: Plano Atual, Vencimento do Plano, Status da Assinatura</p>
              <p><strong>4.</strong> A data de vencimento deve ser 30 dias após a criação</p>
              <p><strong>5.</strong> Suas cobranças normais aparecerão abaixo</p>
            </div>
            
            {/* Botões para criar assinatura de teste */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Criar Assinatura de Teste:</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(PLAN_CONFIGS).map(([planType, config]) => (
                  <Button
                    key={planType}
                    onClick={() => createTestSubscription(planType)}
                    disabled={creating}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {creating ? 'Criando...' : `${config.name} - R$ ${config.value}`}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard de Cobranças com nova funcionalidade */}
        <DashboardCobrancas />

        {/* Informações do Usuário */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações do Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-600">Usuário:</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">ID:</label>
                <p className="font-mono text-xs">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 