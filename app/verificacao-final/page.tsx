"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"

export default function VerificacaoFinalPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>({})
  const [currentUser, setCurrentUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    const statusCheck: any = {}

    try {
      // 1. Verificar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser()
      statusCheck.user = {
        ok: !!user,
        message: user ? `Logado como: ${user.email}` : "Não autenticado",
        data: user
      }
      setCurrentUser(user)

      if (user) {
        // 2. Verificar perfil no Supabase
        try {
          const profileResponse = await fetch(`/api/profiles/${user.id}`)
          const profileResult = await profileResponse.json()
          statusCheck.profile = {
            ok: profileResponse.ok && profileResult.data,
            message: profileResponse.ok ? 
              `Perfil: ${profileResult.data?.nome_completo} | Customer: ${profileResult.data?.asaas_customer_id || 'Não definido'}` : 
              "Perfil não encontrado"
          }
        } catch (error) {
          statusCheck.profile = { ok: false, message: "Erro ao verificar perfil" }
        }

        // 3. Verificar pagamentos
        try {
          const paymentsResponse = await fetch(`/api/asaas/payments/user/${user.id}`)
          const paymentsResult = await paymentsResponse.json()
          statusCheck.payments = {
            ok: paymentsResponse.ok,
            message: paymentsResponse.ok ? 
              `${paymentsResult.totalCount || 0} pagamentos encontrados` : 
              `Erro: ${paymentsResult.error || 'Desconhecido'}`
          }
        } catch (error) {
          statusCheck.payments = { ok: false, message: "Erro ao verificar pagamentos" }
        }

        // 4. Verificar customer no Asaas
        try {
          const customerResponse = await fetch(`/api/asaas/customers?userId=${user.id}`)
          const customerResult = await customerResponse.json()
          statusCheck.customer = {
            ok: customerResponse.ok && customerResult.data,
            message: customerResponse.ok ? 
              `Customer Asaas: ${customerResult.data?.id}` : 
              "Customer não encontrado"
          }
        } catch (error) {
          statusCheck.customer = { ok: false, message: "Erro ao verificar customer" }
        }
      }

      setStatus(statusCheck)
    } catch (error) {
      console.error("Erro na verificação:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (ok: boolean) => {
    return ok ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (ok: boolean) => {
    return <Badge variant={ok ? "default" : "destructive"}>{ok ? "OK" : "ERRO"}</Badge>
  }

  const allOk = Object.values(status).every((s: any) => s.ok)

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">✅ Verificação Final do Sistema</h1>
        <p className="text-gray-600">Status completo da integração Asaas</p>
      </div>

      {/* Status Geral */}
      <Card className={`mb-6 ${allOk ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {allOk ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {allOk ? "🎉 Sistema Funcionando Perfeitamente!" : "❌ Problemas Detectados"}
                </h2>
                <p className={allOk ? "text-green-700" : "text-red-700"}>
                  {allOk ? 
                    "Todas as verificações passaram. O sistema está pronto para uso!" : 
                    "Alguns componentes precisam de atenção."
                  }
                </p>
              </div>
            </div>
            <Button 
              onClick={checkStatus} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "🔄 Verificar Novamente"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes das Verificações */}
      <div className="space-y-4">
        {Object.entries(status).map(([key, value]: [string, any]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(value.ok)}
                  <div>
                    <h3 className="font-semibold capitalize">
                      {key === 'user' ? 'Usuário Autenticado' : 
                       key === 'profile' ? 'Perfil no Supabase' :
                       key === 'payments' ? 'Pagamentos' :
                       key === 'customer' ? 'Customer Asaas' : key}
                    </h3>
                    <p className="text-sm text-gray-600">{value.message}</p>
                  </div>
                </div>
                {getStatusBadge(value.ok)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Próximos Passos */}
      {allOk && (
        <Card className="mt-6 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">🚀 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span>Acesse <strong>/checkout</strong> para criar novas cobranças</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span>Vá para <strong>/minhas-cobrancas</strong> para ver o dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span>Use <strong>/test-final</strong> para testes completos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Debug */}
      {currentUser && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔧 Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>User ID:</strong> <code>{currentUser.id}</code></div>
              <div><strong>Email:</strong> {currentUser.email}</div>
              <div><strong>Timestamp:</strong> {new Date().toLocaleString('pt-BR')}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 