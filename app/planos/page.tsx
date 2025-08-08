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
      router.push(`/login?redirect=/planos`)
      return
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
      router.push(`/checkout?plano=${planId}`)
      
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
              // Navegar de volta
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/')
              }
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
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "ring-2 ring-orange-500 shadow-lg" : ""}`}>
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
      </div>
    </div>
  )
}
