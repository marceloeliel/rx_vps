"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/hooks/use-subscription"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, Building2, Users, X, Eye } from "lucide-react"
import Link from "next/link"

export default function TesteEsconderPromocaoPage() {
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const supabase = createClient()
  
  // Hook para verificar plano de assinatura
  const { subscriptionStatus, profile, loading: loadingSubscription } = useSubscription()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoadingUser(false)
    }
    getUser()
  }, [supabase.auth])

  // Verificar se deve ocultar a seção de agências
  const shouldHideAgencySection = () => {
    // Verifica se o usuário é uma agência com plano ativo
    return profile && 
           profile.tipo_usuario === 'agencia' && 
           subscriptionStatus?.hasAccess
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Teste - Ocultar Seção Promocional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Esta página testa se a seção promocional "🚀 Oportunidade Exclusiva" é ocultada
              corretamente quando o usuário tem plano ativo.
            </p>
          </CardContent>
        </Card>

        {/* Status do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingUser || loadingSubscription ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Dados do Usuário</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Logado:</strong> {user ? "✅ Sim" : "❌ Não"}</p>
                      <p><strong>Email:</strong> {user?.email || "N/A"}</p>
                      <p><strong>Tipo:</strong> {profile?.tipo_usuario || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Status da Assinatura</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Plano Atual:</strong> {profile?.plano_atual || "Nenhum"}</p>
                      <p><strong>Data Fim:</strong> {profile?.plano_data_fim || "N/A"}</p>
                      <p><strong>Tem Acesso:</strong> {subscriptionStatus?.hasAccess ? "✅ Sim" : "❌ Não"}</p>
                      <p><strong>Status:</strong> {subscriptionStatus?.status || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Lógica de Ocultação</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>É Agência:</strong> {profile?.tipo_usuario === 'agencia' ? "✅ Sim" : "❌ Não"}</p>
                    <p><strong>Tem Plano Ativo:</strong> {subscriptionStatus?.hasAccess ? "✅ Sim" : "❌ Não"}</p>
                    <p><strong>Deve Ocultar Seção:</strong> {shouldHideAgencySection() ? "✅ Sim" : "❌ Não"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção Promocional - Teste */}
        <Card>
          <CardHeader>
            <CardTitle>Preview da Seção Promocional</CardTitle>
          </CardHeader>
          <CardContent>
            {shouldHideAgencySection() ? (
              <div className="text-center py-8 text-green-600">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">✅ Seção Ocultada com Sucesso!</h3>
                <p className="text-sm">
                  A seção promocional está sendo ocultada porque você é uma agência com plano ativo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4 text-orange-600">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Seção promocional seria exibida aqui</p>
                </div>
                
                {/* Preview da seção promocional */}
                <div className="relative overflow-hidden shadow-lg border-0 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-lg">
                  <div className="relative p-6 text-white">
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <Badge className="bg-white/20 text-white border-white/30">
                        🚀 Oportunidade Exclusiva
                      </Badge>
                    </div>

                    <h2 className="text-xl font-bold mb-4 text-center">
                      Expanda seu negócio com a<span className="block text-yellow-300">RX Autos</span>
                    </h2>

                    <p className="text-center text-white/90 mb-4 text-sm">
                      Cadastre sua agência e destaque seus veículos para milhares de compradores potenciais.
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 justify-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-white/90">30 dias gratuitos com todos os benefícios</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-white/90">Alcance milhares de compradores qualificados</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button
                        size="sm"
                        className="bg-white text-orange-600 hover:bg-gray-50 font-bold"
                        disabled
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Começar Teste Gratuito
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Testar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Para usuários agência com plano ativo:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>A seção promocional deve estar OCULTA</li>
                <li>Mostra mensagem de sucesso verde</li>
                <li>Na página inicial, a seção não aparece</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Para outros usuários:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>A seção promocional deve estar VISÍVEL</li>
                <li>Mostra preview da seção</li>
                <li>Na página inicial, a seção aparece normalmente</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">
                  Ver Página Inicial
                </Button>
              </Link>
              
              <Link href="/planos">
                <Button variant="outline">
                  Ver Planos
                </Button>
              </Link>
              
              <Button 
                variant="destructive"
                onClick={() => window.location.reload()}
              >
                Recarregar Teste
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
} 