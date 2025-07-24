"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { saveAsaasCustomerId, getAsaasCustomerId } from "@/lib/supabase/profiles"
import { toast } from "sonner"

export default function DebugSaveCustomerPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [customerId, setCustomerId] = useState("")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    if (user) {
      // Buscar perfil atual
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      setProfileData(profile)
      setCustomerId(profile?.asaas_customer_id || "")
    }
  }

  // Teste 1: Update direto no Supabase
  const testDirectUpdate = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const testCustomerId = `cus_test_${Date.now()}`
      
      console.log("🧪 [TEST] Fazendo update direto no Supabase...")
      console.log("🧪 [TEST] User ID:", currentUser.id)
      console.log("🧪 [TEST] Customer ID:", testCustomerId)

      const { data, error } = await supabase
        .from("profiles")
        .update({
          asaas_customer_id: testCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id)
        .select("id, asaas_customer_id, updated_at")

      if (error) {
        console.error("❌ [TEST] Erro no update direto:", error)
        toast.error(`Erro: ${error.message}`)
        return
      }

      console.log("✅ [TEST] Update direto bem-sucedido:", data)
      toast.success("Update direto funcionou!")
      
      // Recarregar dados
      await loadUser()

    } catch (error: any) {
      console.error("❌ [TEST] Erro inesperado:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Teste 2: Usar função saveAsaasCustomerId
  const testSaveFunction = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const testCustomerId = `cus_func_${Date.now()}`
      
      console.log("🧪 [TEST] Testando função saveAsaasCustomerId...")
      console.log("🧪 [TEST] User ID:", currentUser.id)
      console.log("🧪 [TEST] Customer ID:", testCustomerId)

      const success = await saveAsaasCustomerId(currentUser.id, testCustomerId)
      
      if (success) {
        console.log("✅ [TEST] Função saveAsaasCustomerId funcionou!")
        toast.success("Função de salvamento funcionou!")
      } else {
        console.error("❌ [TEST] Função saveAsaasCustomerId falhou!")
        toast.error("Função de salvamento falhou!")
      }
      
      // Recarregar dados
      await loadUser()

    } catch (error: any) {
      console.error("❌ [TEST] Erro na função:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Teste 3: Simular API de customers
  const testCustomerAPI = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const customerData = {
        userId: currentUser.id, // IMPORTANTE: incluir userId
        name: "Teste Debug Save",
        email: currentUser.email,
        cpfCnpj: "11144477735",
        phone: "11999999999",
        mobilePhone: "11999999999",
      }

      console.log("🧪 [TEST] Testando API de customers...")
      console.log("🧪 [TEST] Dados enviados:", customerData)

      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro na API")
      }

      console.log("✅ [TEST] API de customers funcionou:", result)
      toast.success("API de customers funcionou!")
      
      // Recarregar dados após 3 segundos
      setTimeout(() => {
        loadUser()
      }, 3000)

    } catch (error: any) {
      console.error("❌ [TEST] Erro na API:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Teste 4: Buscar customer_id
  const testGetCustomerId = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      console.log("🧪 [TEST] Testando função getAsaasCustomerId...")
      
      const foundCustomerId = await getAsaasCustomerId(currentUser.id)
      
      if (foundCustomerId) {
        console.log("✅ [TEST] Customer ID encontrado:", foundCustomerId)
        toast.success(`Customer ID encontrado: ${foundCustomerId}`)
      } else {
        console.log("ℹ️ [TEST] Customer ID não encontrado")
        toast.error("Customer ID não encontrado")
      }

    } catch (error: any) {
      console.error("❌ [TEST] Erro na busca:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Teste 5: Testar API de pagamentos (NOVO)
  const testPaymentsAPI = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      console.log("🧪 [TEST] Testando API de pagamentos...")
      
      // Primeiro buscar customer_id
      const foundCustomerId = await getAsaasCustomerId(currentUser.id)
      
      if (!foundCustomerId) {
        toast.error("Customer ID não encontrado. Execute o teste de API customers primeiro.")
        return
      }

      console.log("🔍 [TEST] Buscando pagamentos para customer:", foundCustomerId)
      
      const response = await fetch(`/api/asaas/payments/customer/${foundCustomerId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na API")
      }
      
      const paymentsData = await response.json()
      console.log("✅ [TEST] Dados de pagamentos:", paymentsData)
      
      const totalPayments = paymentsData.totalCount || paymentsData.data?.length || 0
      toast.success(`API funcionando! ${totalPayments} pagamento(s) encontrado(s)`)
      
    } catch (error: any) {
      console.error("❌ [TEST] Erro na API de pagamentos:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug: Salvamento Customer ID</h1>
        <p className="text-gray-600">Testar especificamente por que o customer_id não está sendo salvo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle>Status Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Usuário ID:</Label>
              <Input value={currentUser?.id || ""} readOnly className="text-xs" />
            </div>
            
            <div>
              <Label>Customer ID Atual:</Label>
              <Input value={customerId} readOnly className="text-xs" />
            </div>

            <div>
              <Label>Email:</Label>
              <Input value={currentUser?.email || ""} readOnly />
            </div>

            {profileData && (
              <div className="text-xs bg-gray-100 p-3 rounded">
                <div><strong>Nome:</strong> {profileData.nome_completo || "Não informado"}</div>
                <div><strong>Criado:</strong> {new Date(profileData.created_at).toLocaleString()}</div>
                <div><strong>Atualizado:</strong> {new Date(profileData.updated_at).toLocaleString()}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Testes */}
        <Card>
          <CardHeader>
            <CardTitle>Testes de Salvamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={testDirectUpdate}
              disabled={loading || !currentUser}
              className="w-full"
              variant="outline"
            >
              1. Teste Update Direto
            </Button>

            <Button 
              onClick={testSaveFunction}
              disabled={loading || !currentUser}
              className="w-full"
              variant="outline"
            >
              2. Teste Função Save
            </Button>

            <Button 
              onClick={testCustomerAPI}
              disabled={loading || !currentUser}
              className="w-full"
            >
              3. Teste API Customers
            </Button>

            <Button 
              onClick={testGetCustomerId}
              disabled={loading || !currentUser}
              className="w-full"
              variant="outline"
            >
              4. Teste Buscar Customer ID
            </Button>

            <Button 
              onClick={testPaymentsAPI}
              disabled={loading || !currentUser}
              className="w-full"
              variant="outline"
            >
              5. Testar API de Pagamentos
            </Button>

            <Button 
              onClick={loadUser}
              disabled={loading}
              className="w-full"
              variant="secondary"
            >
              🔄 Recarregar Dados
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>1. Teste Update Direto:</strong> Testa se consegue fazer UPDATE diretamente na tabela</p>
          <p><strong>2. Teste Função Save:</strong> Testa a função saveAsaasCustomerId</p>
          <p><strong>3. Teste API Customers:</strong> Testa o fluxo completo da API</p>
          <p><strong>4. Teste Buscar Customer ID:</strong> Testa se consegue recuperar o customer_id salvo</p>
          <p className="text-orange-600 font-medium">👀 Monitore o console do navegador para logs detalhados</p>
        </CardContent>
      </Card>
    </div>
  )
} 