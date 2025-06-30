"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function DebugSimpleCustomerPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    if (user) {
      console.log("👤 Usuário logado:", user.id)
      await loadProfile(user.id)
    }
  }

  const loadProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
      
      setProfileData(profile)
      console.log("📋 Perfil:", profile)
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error)
    }
  }

  // Teste 1: Criar perfil se não existir
  const createProfile = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      console.log("🔧 Criando perfil para usuário:", currentUser.id)

      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          nome_completo: "Usuario Teste Debug",
          email: currentUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Erro ao criar perfil:", error)
        toast.error(`Erro ao criar perfil: ${error.message}`)
        return
      }

      console.log("✅ Perfil criado/atualizado:", data)
      toast.success("Perfil criado com sucesso!")
      
      await loadProfile(currentUser.id)

    } catch (error: any) {
      console.error("❌ Erro inesperado:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Teste 2: Criar customer sem telefone
  const createCustomerWithoutPhone = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      // Customer mínimo sem telefone
      const customerData = {
        userId: currentUser.id,
        name: "Usuario Teste Simples",
        email: currentUser.email,
        cpfCnpj: "11144477735", // CPF válido
        // Sem telefone para testar
      }

      console.log("🚀 Criando customer simples:", customerData)

      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar customer")
      }

      console.log("✅ Customer criado:", result)
      toast.success("Customer criado com sucesso!")
      
      // Aguardar e recarregar
      setTimeout(() => {
        loadProfile(currentUser.id)
      }, 2000)

    } catch (error: any) {
      console.error("❌ Erro ao criar customer:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Teste 3: Update manual do customer_id
  const updateCustomerIdManually = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const testCustomerId = `cus_manual_${Date.now()}`
      
      console.log("🔧 Atualizando customer_id manualmente:", testCustomerId)

      const { data, error } = await supabase
        .from("profiles")
        .update({
          asaas_customer_id: testCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id)
        .select()

      if (error) {
        console.error("❌ Erro no update manual:", error)
        toast.error(`Erro no update: ${error.message}`)
        return
      }

      console.log("✅ Customer_id atualizado manualmente:", data)
      toast.success("Customer ID atualizado!")
      
      await loadProfile(currentUser.id)

    } catch (error: any) {
      console.error("❌ Erro no update manual:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug Simples: Customer ID</h1>
        <p className="text-gray-600">Teste simplificado focado apenas no problema do customer_id</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Usuário Logado:</span>
              <Badge variant={currentUser ? "default" : "destructive"}>
                {currentUser ? "Sim" : "Não"}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span>Perfil Existe:</span>
              <Badge variant={profileData ? "default" : "destructive"}>
                {profileData ? "Sim" : "Não"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Customer ID:</span>
              <Badge variant={profileData?.asaas_customer_id ? "default" : "secondary"}>
                {profileData?.asaas_customer_id || "Não definido"}
              </Badge>
            </div>

            {currentUser && (
              <div className="text-xs bg-gray-100 p-3 rounded">
                <div><strong>User ID:</strong> {currentUser.id}</div>
                <div><strong>Email:</strong> {currentUser.email}</div>
              </div>
            )}

            {profileData && (
              <div className="text-xs bg-blue-50 p-3 rounded">
                <div><strong>Nome:</strong> {profileData.nome_completo || "Não informado"}</div>
                <div><strong>Customer ID:</strong> {profileData.asaas_customer_id || "Não definido"}</div>
                <div><strong>Criado:</strong> {new Date(profileData.created_at).toLocaleString()}</div>
                <div><strong>Atualizado:</strong> {new Date(profileData.updated_at).toLocaleString()}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Testes */}
        <Card>
          <CardHeader>
            <CardTitle>Testes Simplificados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={createProfile}
              disabled={loading || !currentUser}
              className="w-full"
              variant="outline"
            >
              1. Criar/Atualizar Perfil
            </Button>

            <Button 
              onClick={updateCustomerIdManually}
              disabled={loading || !currentUser}
              className="w-full"
              variant="outline"
            >
              2. Update Manual Customer ID
            </Button>

            <Button 
              onClick={createCustomerWithoutPhone}
              disabled={loading || !currentUser}
              className="w-full"
            >
              3. Criar Customer (sem telefone)
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
          <CardTitle>Logs de Debug</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>1. Criar Perfil:</strong> Garante que o usuário existe na tabela profiles</p>
          <p><strong>2. Update Manual:</strong> Testa se consegue salvar customer_id diretamente</p>
          <p><strong>3. Customer sem Telefone:</strong> Remove problema do formato de telefone</p>
          <p className="text-orange-600 font-medium">👀 Monitore o console do navegador para logs detalhados</p>
        </CardContent>
      </Card>
    </div>
  )
} 