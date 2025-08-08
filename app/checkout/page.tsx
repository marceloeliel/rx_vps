"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useUser } from "@/lib/contexts/user-context"
import { LoadingScreen } from "@/components/loading-screen"
import { createClient } from "@/lib/supabase/client"

interface Plan {
  id: string
  name: string
  price: number
  duration: string
}

const plans: Record<string, Plan> = {
  basico: { id: "basico", name: "Plano Básico", price: 59.9, duration: "1 mês" },
  profissional: { id: "profissional", name: "Plano Profissional", price: 299.0, duration: "1 mês" },
  empresarial: { id: "empresarial", name: "Plano Empresarial", price: 897.9, duration: "1 mês" },
  ilimitado: { id: "ilimitado", name: "Plano Ilimitado", price: 1897.9, duration: "1 mês" },
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: currentUser, loading: userLoading } = useUser()
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [planProcessed, setPlanProcessed] = useState(false)

  useEffect(() => {
    // Não executar se ainda estiver carregando o usuário ou se já foi processado
    if (userLoading || planProcessed) return
    
    const planId = searchParams.get("plano") || searchParams.get("plan")
    
    if (planId && plans[planId]) {
      setSelectedPlan(plans[planId])
      setPlanProcessed(true)
      
      // Salvar o plano escolhido no perfil do usuário
      if (currentUser && currentUser.id) {
        const savePlan = async () => {
          try {
            const supabase = createClient()
            const { error } = await supabase
              .from('profiles')
              .update({ 
                plano_atual: planId,
                plano_data_inicio: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', currentUser.id)

            if (error) {
              console.error('Erro ao salvar plano no checkout:', error)
            }
          } catch (error) {
            console.error('Erro inesperado ao salvar plano:', error)
          }
        }
        
        savePlan()
      }
    } else if (planId && !plans[planId]) {
      // Plano inválido, redirecionar
      setPlanProcessed(true)
      router.push("/planos")
    } else if (!planId) {
      // Sem plano especificado, redirecionar
      setPlanProcessed(true)
      router.push("/planos")
    }
  }, [searchParams, router, currentUser?.id, userLoading, planProcessed])

  if (userLoading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/perfil")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Perfil
          </Button>
        </div>

        {/* Plano Selecionado */}
        {selectedPlan && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
                  <p className="text-gray-600">{selectedPlan.duration}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                  </div>
                  <Badge variant="secondary">por mês</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de Sistema Desabilitado */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-orange-800 mb-4">
              Sistema de Pagamentos Temporariamente Desabilitado
            </h3>
            <p className="text-orange-700 mb-6 max-w-2xl mx-auto">
              Estamos atualizando nosso sistema de pagamentos para oferecer uma experiência ainda melhor. 
              Em breve, você poderá assinar nossos planos com total segurança e praticidade.
            </p>
            <div className="space-y-2 text-sm text-orange-600">
              <p>• Novos métodos de pagamento</p>
              <p>• Interface mais intuitiva</p>
              <p>• Maior segurança nas transações</p>
            </div>
            <div className="mt-8">
              <Button
                onClick={() => router.push("/perfil")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Voltar ao Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Precisa de Ajuda?</h4>
            <p className="text-gray-600 mb-4">
              Entre em contato conosco para mais informações sobre nossos planos ou para ser notificado 
              quando o sistema de pagamentos estiver disponível novamente.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="sm">
                📧 Enviar Email
              </Button>
              <Button variant="outline" size="sm">
                💬 Chat Online
              </Button>
              <Button variant="outline" size="sm">
                📱 WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
