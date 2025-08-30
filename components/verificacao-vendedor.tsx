"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, User, CheckCircle, AlertTriangle, ArrowRight, Shield, Star, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getUserProfile, type UserProfile } from "@/lib/supabase/profiles"
import { userHasAgencia } from "@/lib/supabase/agencias"

interface VerificacaoVendedorProps {
  children: React.ReactNode
}

export default function VerificacaoVendedor({ children }: VerificacaoVendedorProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [hasAgencia, setHasAgencia] = useState(false)
  const [loading, setLoading] = useState(true)
  const [canSell, setCanSell] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        // Verificar se usuário está logado
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        setUser(user)

        // Buscar perfil do usuário
        const userProfile = await getUserProfile(user.id)
        setProfile(userProfile)

        // Verificar se tem agência
        const hasAgency = await userHasAgencia(user.id)
        setHasAgencia(hasAgency)

        // Determinar se pode vender
        const canUserSell =
          userProfile?.unlimited_access === true ||
          userProfile?.plano_atual === 'ilimitado' ||
          userProfile?.plano_atual === 'premium_plus' ||
          userProfile?.plano_atual === 'empresarial' ||
          userProfile?.tipo_usuario === "vendedor" || 
          userProfile?.tipo_usuario === "agencia" || 
          hasAgency

        setCanSell(canUserSell)
      } catch (error) {
        console.error("Erro ao verificar permissões:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUserPermissions()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não está logado
  if (!user) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Botão de Voltar */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Voltar
            </Button>
          </div>

          {/* Header amigável */}
          <div className="text-center mb-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Transforme seu carro em oportunidade! 🚗✨</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de vendedores que já descobriram a forma mais fácil e segura de vender veículos
              online.
            </p>
          </div>

          {/* Benefícios principais */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Venda Rápida</h3>
                <p className="text-sm text-gray-600">
                  Milhões de compradores ativos procurando seu veículo todos os dias
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">100% Seguro</h3>
                <p className="text-sm text-gray-600">
                  Plataforma verificada com proteção total para vendedores e compradores
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Melhor Preço</h3>
                <p className="text-sm text-gray-600">
                  Ferramentas inteligentes para precificar e vender pelo melhor valor
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action Principal */}
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 mb-8">
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Comece agora mesmo! É grátis 🎉</h2>
              <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                Crie sua conta em menos de 2 minutos e descubra por que somos a plataforma preferida dos brasileiros
                para vender carros.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link href="/cadastro" className="flex-1">
                  <Button size="lg" className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold">
                    <User className="h-5 w-5 mr-2" />
                    Criar Conta Grátis
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white/10 bg-transparent"
                  >
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Depoimentos/Social Proof */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">JM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">João Martins</p>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  "Vendi meu carro em apenas 3 dias! Processo super fácil e recebi várias propostas excelentes."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">AS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ana Silva</p>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  "Plataforma confiável e suporte incrível. Consegui o melhor preço do mercado para minha SUV!"
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas */}
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 text-center">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-orange-600">50K+</p>
                <p className="text-sm text-gray-600">Carros vendidos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">98%</p>
                <p className="text-sm text-gray-600">Satisfação</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">7 dias</p>
                <p className="text-sm text-gray-600">Tempo médio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se pode vender, mostrar o conteúdo
  if (canSell) {
    return <>{children}</>
  }

  // Se não pode vender, mostrar procedimentos
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Torne-se um Vendedor na RX Autos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Para vender veículos em nossa plataforma, você precisa ter um perfil de vendedor ou agência verificado.
          </p>
        </div>

        {/* Status Atual */}
        <Alert className="mb-8 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Status atual:</strong> Seu perfil não possui permissão para vender veículos. Siga os passos abaixo
            para se tornar um vendedor verificado.
          </AlertDescription>
        </Alert>

        {/* Opções de Cadastro */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Vendedor Individual */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-100 text-blue-800">Recomendado</Badge>
            </div>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Vendedor Individual</CardTitle>
              <p className="text-gray-600">Ideal para pessoas físicas que querem vender seus próprios veículos</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cadastro rápido e simples</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Até 3 veículos simultâneos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Taxa reduzida por venda</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Suporte básico incluído</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Documentos necessários:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CPF válido</li>
                  <li>• Comprovante de residência</li>
                  <li>• Documento do veículo (CRLV)</li>
                </ul>
              </div>

              <Link href="/perfil?tab=vendedor">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <User className="h-4 w-4 mr-2" />
                  Tornar-se Vendedor
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Agência */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-2 border-orange-200">
            <div className="absolute top-4 right-4">
              <Badge className="bg-orange-100 text-orange-800">Profissional</Badge>
            </div>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Agência/Loja</CardTitle>
              <p className="text-gray-600">Para concessionárias, lojas e vendedores profissionais</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Veículos ilimitados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Destaque nos resultados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Ferramentas avançadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Selo de verificação</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Documentos necessários:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CNPJ ativo</li>
                  <li>• Contrato social</li>
                  <li>• Comprovante de endereço comercial</li>
                  <li>• Licença de funcionamento</li>
                </ul>
              </div>

              <Link href="/cadastro-agencia">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Building2 className="h-4 w-4 mr-2" />
                  Cadastrar Agência
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Processo de Verificação */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Como funciona o processo de verificação?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Cadastro</h3>
                <p className="text-sm text-gray-600">Complete seu perfil com as informações e documentos necessários</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Análise</h3>
                <p className="text-sm text-gray-600">Nossa equipe analisa seus documentos em até 24 horas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Aprovação</h3>
                <p className="text-sm text-gray-600">Após aprovação, você pode começar a vender imediatamente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Quanto tempo leva para ser aprovado?</h4>
                <p className="text-sm text-gray-600">
                  O processo de verificação leva até 24 horas para vendedores individuais e até 48 horas para agências.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Posso vender sem ser verificado?</h4>
                <p className="text-sm text-gray-600">
                  Não. Por questões de segurança e confiabilidade, todos os vendedores devem ser verificados antes de
                  anunciar.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Há taxa para se tornar vendedor?</h4>
                <p className="text-sm text-gray-600">
                  O cadastro é gratuito. Cobramos apenas uma pequena taxa por venda realizada através da plataforma.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Voltar */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline">Voltar à Página Inicial</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
