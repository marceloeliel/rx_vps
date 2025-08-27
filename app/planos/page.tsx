"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Check, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { userHasAgencia } from "@/lib/supabase/agencias"
import { useTrial } from "@/hooks/use-trial"
// Sistema de pagamentos Asaas foi completamente desabilitado

interface Plan {
  id: string
  name: string
  price: number
  originalPrice?: number
  popular?: boolean
  features: string[]
  buttonText: string
  buttonVariant: "default" | "destructive" | "outline"
}

// Interface PixPaymentData removida - sistema de pagamentos desabilitado

const plans: Plan[] = [
    {
      id: "individual",
      name: "Individual",
      price: 20.0,
      features: [
        "Apenas 1 veículo",
        "Sem anúncios inclusos",
        "Cadastro básico apenas",
        "Sem acesso ao painel",
        "Suporte básico por email"
      ],
      buttonText: "Contratar Agora",
      buttonVariant: "outline",
    },
  {
    id: "basico",
    name: "Básico",
    price: 59.9,
    features: ["Até 5 veículos", "Anúncios básicos", "Suporte por email", "Estatísticas básicas"],
    buttonText: "Assinar Agora",
    buttonVariant: "default",
  },
  {
    id: "profissional",
    name: "Profissional",
    price: 299.0,
    popular: true,
    features: [
      "Até 30 veículos",
      "Anúncios destacados",
      "Suporte prioritário",
      "Estatísticas avançadas",
      "Relatórios personalizados",
      "3 destaques de veículos",
      "Painel administrativo"
    ],
    buttonText: "Assinar Agora",
    buttonVariant: "destructive",
  },
  {
    id: "empresarial",
    name: "Empresarial",
    price: 897.9,
    features: [
      "Até 400 veículos",
      "Anúncios premium",
      "Suporte 24/7",
      "Estatísticas completas",
      "Relatórios avançados",
      "40 destaques de veículos",
      "Painel administrativo"
    ],
    buttonText: "Assinar Agora",
    buttonVariant: "outline",
  },
  {
    id: "ilimitado",
    name: "Ilimitado",
    price: 1897.9,
    features: [
      "Veículos ilimitados",
      "Anúncios premium",
      "Suporte 24/7 prioritário",
      "Estatísticas completas",
      "Relatórios avançados",
      "100 destaques de veículos",
      "Painel administrativo",
      "Acesso API exclusivo",
      "Consultoria dedicada"
    ],
    buttonText: "Assinar Agora",
    buttonVariant: "outline",
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const { toast } = useToast()
  // Sistema de pagamentos Asaas foi completamente desabilitado
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const { isInTrial, daysRemaining, loading: trialLoading } = useTrial()

  const supabase = createClient()



  // Função de formatação de preço mantida para exibição
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(price)
  }

  useEffect(() => {
    const loadUser = async () => {
      setLoadingUserData(true)
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Erro ao buscar usuário:", error)
          return
        }
        
        if (user) {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setLoadingUserData(false)
      }
    }
    
    loadUser()
  }, [supabase])

  const handleSelectPlan = async (planId: string) => {
    if (!currentUser) {
      router.push('/cadastro')
      return
    }

    // Verificar se o usuário está em período de teste
    if (isInTrial) {
      toast({
        variant: "destructive",
        title: "Mudança de plano não permitida",
        description: `Você está em período de teste (${daysRemaining} dias restantes). Mudanças de plano só podem ser feitas após o término do período de teste.`,
      })
      return
    }

    // Verificar se é uma agência tentando contratar o plano Individual
    if (planId === 'individual') {
      const isAgencia = await userHasAgencia(currentUser.id)
      if (isAgencia) {
        toast({
          variant: "destructive",
          title: "Plano não disponível para agências",
          description: "O plano Individual é exclusivo para vendedores individuais. Agências devem escolher outros planos.",
        })
        return
      }
    }

    try {
      // Salvar o plano escolhido na coluna plano_atual
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plano_atual: planId,
          plano_data_inicio: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)

      if (error) {
        console.error('Erro ao salvar plano:', error)
        toast({
          variant: "destructive",
          title: "Erro ao salvar plano",
          description: "Não foi possível salvar o plano escolhido. Tente novamente.",
        })
        return
      }

      // Sucesso ao salvar o plano
      const selectedPlan = plans.find(p => p.id === planId)
      toast({
        title: "Plano selecionado com sucesso!",
        description: `Você escolheu o ${selectedPlan?.name}. Sistema de pagamentos será implementado em breve.`,
      })

      // Redirecionar para o checkout (mesmo que temporariamente desabilitado)
      router.push(`/checkout?plan=${planId}`)
      
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      })
    }
  }

  // Todas as funções de pagamento foram removidas - sistema desabilitado

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="lg:bg-white lg:border-b fixed lg:relative top-0 left-0 right-0 z-50 lg:z-auto bg-white/80 backdrop-blur-md lg:bg-white lg:backdrop-blur-none border-b lg:border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 lg:justify-center">
            <Button variant="ghost" size="sm" onClick={() => {
              // Navegar de volta para a página anterior
              router.back()
            }} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold lg:text-2xl">Planos de Assinatura</h1>
          </div>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="h-16 lg:hidden" />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 mb-10 text-center text-white shadow-lg rounded-[15px]">
          <div className="flex items-center justify-center mb-2">
            <Badge className="bg-white text-orange-600 font-bold px-3 py-1 text-xs">
              🎉 PROMOÇÃO ESPECIAL
            </Badge>
          </div>
          <h3 className="text-lg lg:text-xl font-bold mb-1">
            30 Dias de Uso Ilimitado GRÁTIS!
          </h3>
          <p className="text-sm lg:text-base mb-2">
            Todos os planos com acesso ilimitado por 30 dias
          </p>
          <p className="text-sm opacity-90">
            É só fazer o cadastro e começar a usar imediatamente!
          </p>
        </div>

        {/* Header Content */}
        <div className="text-center mb-8 lg:mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Escolha o melhor plano para você</h2>
          <p className="text-gray-600 text-base lg:text-lg">Todos os planos incluem acesso completo à plataforma</p>
          {isInTrial && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-blue-800 font-medium">
                📅 Você está em período de teste ({daysRemaining} dias restantes)
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Mudanças de plano só podem ser feitas após o término do período de teste.
              </p>
            </div>
          )}
        </div>

        {/* Plans Carousel */}
        <div className="relative max-w-7xl mx-auto">
          {/* Desktop - Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4 lg:justify-center">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? "ring-2 ring-orange-500 shadow-lg" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1">
                    MAIS POPULAR
                  </Badge>
                )}

                <CardContent className="p-4 h-full flex flex-col min-h-[420px]">
                  <div className="text-center mb-4">
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        plan.popular ? "text-orange-600" : "text-blue-600"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        R$ {plan.price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-gray-600 text-sm">/mês</span>
                    </div>
                    {plan.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        R$ {plan.originalPrice.toFixed(2).replace(".", ",")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mb-5 flex-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isInTrial || trialLoading}
                    variant={plan.buttonVariant}
                    className={`w-full py-3 mt-auto ${
                      isInTrial
                        ? "bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed"
                        : plan.popular
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : plan.buttonVariant === "outline"
                          ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                          : ""
                    }`}
                  >
                    {isInTrial ? `Bloqueado (${daysRemaining}d restantes)` : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile - Horizontal Scroll */}
          <div className="lg:hidden overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-4" style={{width: 'max-content'}}>
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative flex-shrink-0 w-64 ${plan.popular ? "ring-2 ring-orange-500 shadow-lg" : ""}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1">
                      MAIS POPULAR
                    </Badge>
                  )}

                  <CardContent className="p-3 h-full flex flex-col min-h-[380px]">
                    <div className="text-center mb-3">
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          plan.popular ? "text-orange-600" : "text-blue-600"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xl font-bold text-gray-900">
                          R$ {plan.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-gray-600 text-sm">/mês</span>
                      </div>
                      {plan.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          R$ {plan.originalPrice.toFixed(2).replace(".", ",")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 flex-1">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isInTrial || trialLoading}
                    variant={plan.buttonVariant}
                    className={`w-full py-3 ${
                      isInTrial
                        ? "bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed"
                        : plan.popular
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : plan.buttonVariant === "outline"
                          ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                          : ""
                    }`}
                  >
                    {isInTrial ? `Bloqueado (${daysRemaining}d restantes)` : plan.buttonText}
                  </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Scroll indicator */}
            <div className="flex justify-center mt-4">
              <p className="text-sm text-gray-500">← Deslize para ver mais planos →</p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-12 lg:mt-16 w-full py-8">
          <div className="container mx-auto px-4">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
              ⚠️ Termos e Condições da Promoção
            </h3>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4 text-sm text-gray-700" style={{width: 'max-content'}}>
                <div className="flex-shrink-0 w-72 text-center">
                  <p className="font-semibold mb-2">📅 Período Promocional</p>
                  <p>Após os 30 dias gratuitos de uso ilimitado, o serviço será automaticamente suspenso até que você confirme qual plano deseja escolher e efetue o pagamento.</p>
                </div>
                <div className="flex-shrink-0 w-72 text-center">
                  <p className="font-semibold mb-2">⏰ Prazo para Pagamento</p>
                  <p>Você terá mais 4 dias após o término da promoção para escolher um plano e realizar o pagamento.</p>
                </div>
                <div className="flex-shrink-0 w-72 text-center">
                  <p className="font-semibold mb-2">🚫 Bloqueio Total</p>
                  <p>Após 34 dias (30 dias gratuitos + 4 dias de prazo), sua conta será bloqueada até a regularização do pagamento.</p>
                </div>
                <div className="flex-shrink-0 w-72 text-center">
                  <p className="font-semibold mb-2">💳 Formas de Pagamento</p>
                  <p>Aceitamos cartão de crédito, débito, PIX e boleto bancário para sua comodidade.</p>
                </div>
                <div className="flex-shrink-0 w-72 text-center">
                  <p className="font-semibold mb-2">📞 Suporte</p>
                  <p>Nossa equipe está disponível para esclarecer dúvidas sobre planos e pagamentos.</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-orange-600 font-semibold text-base">
                💡 Recomendamos que escolha seu plano antes do término dos 30 dias para evitar interrupções no serviço.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
