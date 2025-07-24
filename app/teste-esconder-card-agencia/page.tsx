"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createSubscription, PLAN_CONFIGS } from '@/lib/supabase/subscriptions'
import { useSubscription } from '@/hooks/use-subscription'
import { ArrowLeft, TestTube, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TesteEsconderCardAgencia() {
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const { user, profile, subscriptionStatus, loading, reload } = useSubscription()

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
        alert(`Assinatura ${planType} criada! Aguarde alguns segundos e clique em "Recarregar Dados"`)
        // Recarregar dados após 2 segundos
        setTimeout(() => {
          reload()
        }, 2000)
      } else {
        alert('Erro ao criar assinatura')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar assinatura')
    }
    setCreating(false)
  }

  const updateUserToAgency = async () => {
    if (!user) return

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ tipo_usuario: 'agencia' })
      .eq('id', user.id)

    if (error) {
      alert('Erro ao atualizar usuário para agência')
    } else {
      alert('Usuário atualizado para agência! Clique em "Recarregar Dados"')
      setTimeout(() => {
        reload()
      }, 1000)
    }
  }

  const updateUserToRegular = async () => {
    if (!user) return

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ tipo_usuario: 'particular' })
      .eq('id', user.id)

    if (error) {
      alert('Erro ao atualizar usuário para particular')
    } else {
      alert('Usuário atualizado para particular! Clique em "Recarregar Dados"')
      setTimeout(() => {
        reload()
      }, 1000)
    }
  }

  // Lógica copiada da página inicial
  const shouldHideAgencySection = () => {
    return profile && 
           profile.tipo_usuario === 'agencia' && 
           subscriptionStatus?.hasAccess
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

  const hideCard = shouldHideAgencySection()

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
                Teste: Card de Agência (Esconder quando tem plano)
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                Testar se o card "Expanda seu negócio" é escondido para agências com plano ativo
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
        
        {/* Status Atual */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              {hideCard ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              Status do Card de Agência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Resultado do Teste:</h3>
                <Badge className={hideCard ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {hideCard ? '✅ CARD ESCONDIDO' : '❌ CARD VISÍVEL'}
                </Badge>
                <p className="text-sm text-blue-700 mt-2">
                  {hideCard 
                    ? 'O card de agência será escondido na página inicial'
                    : 'O card de agência aparecerá na página inicial'
                  }
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Condições para Esconder:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={profile?.tipo_usuario === 'agencia' ? 'text-green-600' : 'text-red-600'}>
                      {profile?.tipo_usuario === 'agencia' ? '✅' : '❌'}
                    </span>
                    <span>Usuário é agência: {profile?.tipo_usuario || 'não definido'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={subscriptionStatus?.hasAccess ? 'text-green-600' : 'text-red-600'}>
                      {subscriptionStatus?.hasAccess ? '✅' : '❌'}
                    </span>
                    <span>Tem acesso ao plano: {subscriptionStatus?.hasAccess ? 'sim' : 'não'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Usuário */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Atuais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Usuário</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Tipo:</strong> {profile?.tipo_usuario || 'não definido'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Assinatura</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Plano:</strong> {subscriptionStatus?.planType || 'nenhum'}</div>
                  <div><strong>Status:</strong> {subscriptionStatus?.status || 'sem assinatura'}</div>
                  <div><strong>Tem Acesso:</strong> {subscriptionStatus?.hasAccess ? 'Sim' : 'Não'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Lógica do Card</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Deve Esconder:</strong> {hideCard ? 'Sim' : 'Não'}</div>
                  <div><strong>Condição:</strong> profile.tipo_usuario === 'agencia' && subscriptionStatus.hasAccess</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações de Teste */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ações de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Alterar tipo de usuário */}
            <div>
              <h4 className="font-medium mb-2">1. Alterar Tipo de Usuário</h4>
              <div className="flex gap-2">
                <Button 
                  onClick={updateUserToAgency}
                  variant={profile?.tipo_usuario === 'agencia' ? 'default' : 'outline'}
                  size="sm"
                >
                  Tornar Agência
                </Button>
                <Button 
                  onClick={updateUserToRegular}
                  variant={profile?.tipo_usuario === 'particular' ? 'default' : 'outline'}
                  size="sm"
                >
                  Tornar Particular
                </Button>
              </div>
            </div>

            {/* Criar assinatura */}
            <div>
              <h4 className="font-medium mb-2">2. Criar Assinatura (para ter acesso)</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(PLAN_CONFIGS).map(([planType, config]) => (
                  <Button
                    key={planType}
                    onClick={() => createTestSubscription(planType)}
                    disabled={creating}
                    variant="outline"
                    size="sm"
                  >
                    {creating ? 'Criando...' : `${config.name} - R$ ${config.value}`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recarregar dados */}
            <div>
              <h4 className="font-medium mb-2">3. Recarregar Dados</h4>
              <Button onClick={reload} variant="outline" size="sm">
                🔄 Recarregar Dados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulação do Card */}
        <Card className={hideCard ? 'opacity-50 border-dashed' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hideCard ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              Simulação do Card "Expanda seu negócio com a RX Autos"
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hideCard ? (
              <div className="text-center py-8">
                <EyeOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Card Escondido!</h3>
                <p className="text-gray-500">
                  Este card não aparecerá na página inicial porque você é uma agência com plano ativo.
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">
                  Expanda seu negócio com a <span className="block text-yellow-300">RX Autos</span>
                </h3>
                <p className="mb-4">
                  Cadastre sua agência e destaque seus veículos para milhares de compradores potenciais.
                </p>
                <Button className="bg-white text-orange-600 hover:bg-gray-50">
                  Começar Teste Gratuito
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instruções de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>Cenário 1 - Card deve aparecer:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Usuário tipo "particular" (qualquer assinatura)</li>
                <li>Usuário tipo "agência" SEM assinatura ativa</li>
              </ul>
              
              <p><strong>Cenário 2 - Card deve ser escondido:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Usuário tipo "agência" COM assinatura ativa</li>
              </ul>
              
              <p className="mt-4"><strong>Como testar:</strong></p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Mude o tipo de usuário usando os botões acima</li>
                <li>Crie/remova assinaturas conforme necessário</li>
                <li>Clique em "Recarregar Dados" após cada mudança</li>
                <li>Observe se o status do card muda corretamente</li>
                <li>Vá para a página inicial para confirmar o comportamento real</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 