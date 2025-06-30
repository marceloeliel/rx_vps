"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, Loader2, CreditCard, User, Database } from "lucide-react"

export default function TestFinalPage() {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [testResults, setTestResults] = useState<any>({})

  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      if (user) {
        await loadProfile(user.id)
        await loadPayments(user.id)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const loadProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profiles/${userId}`)
      const result = await response.json()
      
      if (response.ok && result.data) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
    }
  }

  const loadPayments = async (userId: string) => {
    try {
      const response = await fetch(`/api/asaas/payments/user/${userId}`)
      const result = await response.json()
      
      if (response.ok) {
        setPayments(result.data || [])
      }
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error)
    }
  }

  const runTests = async () => {
    if (!currentUser) return

    setLoading(true)
    const results: any = {}

    try {
      // Teste 1: Verificar perfil
      console.log("🧪 Teste 1: Verificando perfil...")
      const profileResponse = await fetch(`/api/profiles/${currentUser.id}`)
      results.profile = {
        status: profileResponse.ok,
        message: profileResponse.ok ? "Perfil encontrado" : "Perfil não encontrado"
      }

      // Teste 2: Verificar customer no Asaas
      console.log("🧪 Teste 2: Verificando customer Asaas...")
      const customerResponse = await fetch(`/api/asaas/customers?userId=${currentUser.id}`)
      const customerResult = await customerResponse.json()
      results.customer = {
        status: customerResponse.ok && customerResult.data,
        message: customerResponse.ok ? `Customer encontrado: ${customerResult.data?.id}` : "Customer não encontrado"
      }

      // Teste 3: Verificar pagamentos
      console.log("🧪 Teste 3: Verificando pagamentos...")
      const paymentsResponse = await fetch(`/api/asaas/payments/user/${currentUser.id}`)
      const paymentsResult = await paymentsResponse.json()
      results.payments = {
        status: paymentsResponse.ok,
        message: paymentsResponse.ok ? `${paymentsResult.totalCount || 0} pagamentos encontrados` : "Erro ao buscar pagamentos"
      }

      // Teste 4: Criar nova cobrança (teste)
      console.log("🧪 Teste 4: Testando criação de cobrança...")
      const paymentResponse = await fetch(`/api/asaas/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerResult.data?.id,
          billingType: "PIX",
          value: 1.00, // R$ 1,00 para teste
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: "Teste Final - Sistema Funcionando",
          externalReference: `test-final-${Date.now()}`
        })
      })
      const paymentResult = await paymentResponse.json()
      results.createPayment = {
        status: paymentResponse.ok && paymentResult.data,
        message: paymentResponse.ok ? `Cobrança criada: ${paymentResult.data?.id}` : "Erro ao criar cobrança"
      }

      setTestResults(results)
      
      // Recarregar dados após os testes
      await loadUserData()

      // Mostrar resultado geral
      const allPassed = Object.values(results).every((test: any) => test.status)
      if (allPassed) {
        toast.success("🎉 Todos os testes passaram! Sistema funcionando perfeitamente!")
      } else {
        toast.error("❌ Alguns testes falharam. Verifique os detalhes.")
      }

    } catch (error: any) {
      toast.error(`Erro nos testes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Teste Final do Sistema</h1>
        <p className="text-gray-600">Verificação completa da integração Asaas</p>
      </div>

      {/* Status do Usuário */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Status do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Usuário autenticado: {currentUser.email}</span>
              </div>
              <div className="text-sm text-gray-600">ID: {currentUser.id}</div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Usuário não autenticado</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status do Perfil */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Perfil encontrado: {profile.nome_completo}</span>
              </div>
              <div className="text-sm text-gray-600">
                Customer ID: {profile.asaas_customer_id ? (
                  <Badge variant="default">{profile.asaas_customer_id}</Badge>
                ) : (
                  <Badge variant="destructive">Não definido</Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Perfil não encontrado</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status dos Pagamentos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamentos Encontrados ({payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-2">
              {payments.slice(0, 3).map((payment, index) => (
                <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-semibold">R$ {payment.value}</span>
                    <span className="text-sm text-gray-600 ml-2">{payment.description}</span>
                  </div>
                  <Badge variant={payment.status === 'RECEIVED' ? 'default' : payment.status === 'PENDING' ? 'secondary' : 'destructive'}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
              {payments.length > 3 && (
                <div className="text-sm text-gray-500">E mais {payments.length - 3} pagamentos...</div>
              )}
            </div>
          ) : (
            <div className="text-gray-600">Nenhum pagamento encontrado</div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Teste */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🚀 Executar Testes Completos</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTests} 
            disabled={loading || !currentUser}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Executando Testes...
              </>
            ) : (
              "🧪 Executar Todos os Testes"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                <div key={testName} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-semibold capitalize">{testName.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="text-sm text-gray-600">{result.message}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={result.status ? 'default' : 'destructive'}>
                      {result.status ? 'PASSOU' : 'FALHOU'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 