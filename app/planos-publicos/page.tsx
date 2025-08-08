"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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

const plans: Plan[] = [
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

export default function PlanosPublicosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleSelectPlan = async (planId: string) => {
    if (user) {
      try {
        // Salvar o plano escolhido na coluna plano_atual
        const supabase = createClient()
        const { error } = await supabase
          .from('profiles')
          .update({ 
            plano_atual: planId,
            plano_data_inicio: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) {
          console.error('Erro ao salvar plano:', error)
        }

        // Redirecionar para checkout
        router.push(`/checkout?plan=${planId}`)
      } catch (error) {
        console.error('Erro inesperado:', error)
        // Mesmo com erro, redirecionar para checkout
        router.push(`/checkout?plan=${planId}`)
      }
    } else {
      // Se não está logado, redirecionar para cadastro
      router.push('/cadastro')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 lg:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">


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

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative transition-all duration-300 hover:scale-105 hover:shadow-lg ${plan.popular ? "ring-2 ring-orange-500 shadow-2xl transform scale-105" : "border border-gray-300 border-opacity-50"}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1">
                    MAIS POPULAR
                  </Badge>
                )}

                <CardContent className="p-4 lg:p-5 h-full flex flex-col">
                  <div className="text-center mb-4 lg:mb-5">
                    <h3
                      className={`text-lg lg:text-xl font-bold mb-2 ${
                        plan.popular ? "text-orange-600" : "text-blue-600"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl lg:text-3xl font-bold text-gray-900">
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

                  <div className="space-y-2 lg:space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm lg:text-base text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    variant={plan.buttonVariant}
                    className={`w-full py-2 lg:py-3 ${
                      plan.popular
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : plan.buttonVariant === "outline"
                          ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                          : ""
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Terms and Conditions */}
          <div className="mt-12 lg:mt-16 w-full py-8">
            <div className="container mx-auto px-4">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
                ⚠️ Termos e Condições da Promoção
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-700">
                <div className="text-center">
                  <p className="font-semibold mb-2">📅 Período Promocional</p>
                  <p>Após os 30 dias gratuitos de uso ilimitado, o serviço será automaticamente suspenso até que você confirme qual plano deseja escolher e efetue o pagamento.</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-2">⏰ Prazo para Pagamento</p>
                  <p>Você terá mais 4 dias após o término da promoção para escolher um plano e realizar o pagamento.</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-2">🚫 Bloqueio Total</p>
                  <p>Caso o pagamento não seja efetuado dentro do prazo de 4 dias, sua conta será totalmente bloqueada e seus veículos não serão mais exibidos na plataforma.</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-2">❌ Cancelamento de Conta</p>
                  <p>Durante o período de pendência de pagamento, a única opção disponível será o cancelamento da conta.</p>
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
    </div>
  )
}