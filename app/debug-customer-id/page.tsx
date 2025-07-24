"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
// import { getAsaasCustomerId } from "@/lib/supabase/profiles" // REMOVIDO - Sistema de pagamentos desabilitado
import { toast } from "sonner"
import {
  User,
  Database,
  CreditCard,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react"

export default function DebugCustomerIdPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [asaasCustomerId, setAsaasCustomerId] = useState<string | null>(null)
  const [paymentsData, setPaymentsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const supabase = createClient()

  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        console.log("🔍 [DEBUG] Usuário logado:", user.id)
        await loadUserProfile(user.id)
      }
    } catch (error) {
      console.error("❌ [DEBUG] Erro ao carregar usuário:", error)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("❌ [DEBUG] Erro ao buscar perfil:", error)
        setTestResults(prev => ({
          ...prev,
          profileError: error.message
        }))
        return
      }

      setProfileData(profile)
      setAsaasCustomerId(profile?.asaas_customer_id || null)

      console.log("✅ [DEBUG] Perfil carregado:", profile)
      setTestResults(prev => ({
        ...prev,
        profileFound: true,
        hasCustomerId: !!profile?.asaas_customer_id,
        customerId: profile?.asaas_customer_id
      }))

    } catch (error) {
      console.error("❌ [DEBUG] Erro inesperado:", error)
    }
  }

  const testAsaasPayments = async () => {
    if (!asaasCustomerId) {
      toast.error("Customer ID não encontrado no Supabase")
      return
    }

    setLoading(true)
    try {
      console.log("🔍 [DEBUG] Testando busca de pagamentos para customer:", asaasCustomerId)
      
      const response = await fetch(`/api/asaas/payments/user/${asaasCustomerId}`)
      
      console.log("📊 [DEBUG] Status da resposta:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na API")
      }

      const data = await response.json()
      setPaymentsData(data)
      
      console.log("✅ [DEBUG] Pagamentos encontrados:", data)
      
      setTestResults(prev => ({
        ...prev,
        paymentsFound: true,
        paymentsCount: data.totalCount || 0,
        payments: data.data || []
      }))

      toast.success(`${data.totalCount || 0} pagamentos encontrados!`)

    } catch (error: any) {
      console.error("❌ [DEBUG] Erro ao buscar pagamentos:", error)
      toast.error(`Erro: ${error.message}`)
      setTestResults(prev => ({
        ...prev,
        paymentsError: error.message
      }))
    } finally {
      setLoading(false)
    }
  }

  const createTestCustomer = async () => {
    if (!currentUser) {
      toast.error("Usuário não logado")
      return
    }

    setLoading(true)
    try {
      // 1. Primeiro, garantir que o usuário existe na tabela profiles
      console.log("🔍 [DEBUG] Verificando se usuário existe na tabela profiles...")
      
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        console.log("⚠️ [DEBUG] Usuário não encontrado, criando perfil...")
        
        // Criar perfil básico
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: currentUser.id,
            nome_completo: "Teste Debug",
            email: currentUser.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          console.error("❌ [DEBUG] Erro ao criar perfil:", createError)
          toast.error("Erro ao criar perfil na base de dados")
          return
        }
        
        console.log("✅ [DEBUG] Perfil criado:", newProfile)
        toast.success("Perfil criado na base de dados!")
        
        // Recarregar dados do perfil
        await loadUserProfile(currentUser.id)
      } else if (profileError) {
        console.error("❌ [DEBUG] Erro ao verificar perfil:", profileError)
        toast.error("Erro ao verificar perfil")
        return
      } else {
        console.log("✅ [DEBUG] Usuário já existe na tabela profiles:", existingProfile?.nome_completo)
      }

      // 2. Criar customer no Asaas com dados corretos
      const customerData = {
        userId: currentUser.id, // IMPORTANTE: incluir userId
        name: "Teste Customer ID",
        email: currentUser.email,
        cpfCnpj: "11144477735", // CPF válido
        phone: "1133334444", // Teste: telefone fixo 10 dígitos
        mobilePhone: "11987654321", // Teste: celular 11 dígitos com 9
        postalCode: "01310100", // CEP sem hífen
        address: "Av. Paulista",
        addressNumber: "1000",
        complement: "Sala 1",
        province: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      }

      console.log("🚀 [DEBUG] Criando customer de teste:", customerData)

      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar customer")
      }

      const customerResult = await response.json()
      console.log("✅ [DEBUG] Customer criado:", customerResult)

      // 3. Aguardar um pouco e recarregar dados
      toast.success("Customer criado com sucesso!")
      
      setTimeout(async () => {
        await loadUserProfile(currentUser.id)
        toast.success("Dados recarregados!")
      }, 2000)

    } catch (error: any) {
      console.error("❌ [DEBUG] Erro ao criar customer:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestPayment = async () => {
    if (!asaasCustomerId) {
      toast.error("Customer ID não encontrado")
      return
    }

    setLoading(true)
    try {
      const paymentData = {
        customer: asaasCustomerId,
        billingType: "PIX",
        value: 29.90,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Teste Debug Customer ID",
        externalReference: "debug-" + Date.now(),
      }

      console.log("🚀 [DEBUG] Criando pagamento de teste:", paymentData)

      const response = await fetch("/api/asaas/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar pagamento")
      }

      const paymentResult = await response.json()
      console.log("✅ [DEBUG] Pagamento criado:", paymentResult)

      toast.success("Pagamento de teste criado!")

    } catch (error: any) {
      console.error("❌ [DEBUG] Erro ao criar pagamento:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug Customer ID</h1>
        <p className="text-gray-600">Diagnóstico do sistema de customer_id e pagamentos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status do Sistema */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Status do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Usuário Logado:</span>
                <Badge variant={currentUser ? "default" : "destructive"}>
                  {currentUser ? "Sim" : "Não"}
                </Badge>
              </div>
              
              {currentUser && (
                <>
                  <div className="flex justify-between items-center">
                    <span>ID:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {currentUser.id}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email:</span>
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Perfil no Supabase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Perfil Encontrado:</span>
                <Badge variant={profileData ? "default" : "destructive"}>
                  {profileData ? "Sim" : "Não"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Customer ID Salvo:</span>
                <Badge variant={asaasCustomerId ? "default" : "secondary"}>
                  {asaasCustomerId ? "Sim" : "Não"}
                </Badge>
              </div>

              {asaasCustomerId && (
                <div className="flex justify-between items-center">
                  <span>Customer ID:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {asaasCustomerId}
                  </code>
                </div>
              )}

              {profileData && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                  <div><strong>Nome:</strong> {profileData.nome_completo || "Não informado"}</div>
                  <div><strong>Email:</strong> {profileData.email || "Não informado"}</div>
                  <div><strong>CPF:</strong> {profileData.cpf || "Não informado"}</div>
                  <div><strong>Criado em:</strong> {new Date(profileData.created_at).toLocaleString()}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamentos Asaas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={testAsaasPayments} 
                disabled={!asaasCustomerId || loading}
                className="w-full"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                Buscar Pagamentos
              </Button>

              {paymentsData && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Encontrado:</span>
                    <Badge>{paymentsData.totalCount || 0}</Badge>
                  </div>
                  
                  {paymentsData.data && paymentsData.data.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="font-semibold text-sm">Últimos Pagamentos:</h4>
                      {paymentsData.data.slice(0, 3).map((payment: any) => (
                        <div key={payment.id} className="p-2 bg-gray-50 rounded text-xs">
                          <div><strong>ID:</strong> {payment.id}</div>
                          <div><strong>Valor:</strong> R$ {payment.value?.toFixed(2)}</div>
                          <div><strong>Status:</strong> {payment.status}</div>
                          <div><strong>Tipo:</strong> {payment.billingType}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ações de Teste */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações de Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={createTestCustomer} 
                disabled={!currentUser || loading}
                className="w-full"
                variant="outline"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Customer de Teste
              </Button>

              <Button 
                onClick={createTestPayment} 
                disabled={!asaasCustomerId || loading}
                className="w-full"
                variant="outline"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Pagamento de Teste
              </Button>

              <Button 
                onClick={loadCurrentUser} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Dados
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultados dos Testes</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 