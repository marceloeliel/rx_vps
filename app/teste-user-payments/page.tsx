"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPayments } from "@/components/user-payments"
import { createClient } from "@/lib/supabase/client"
import { useUserPayments } from "@/hooks/use-user-payments"
import { Loader2, User, Mail } from "lucide-react"

export default function TesteUserPaymentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testUserId, setTestUserId] = useState("")
  const [testEmail, setTestEmail] = useState("")
  const [customers, setCustomers] = useState<any[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const supabase = createClient()

  // Hook para testar
  const { 
    data, 
    loading: paymentsLoading, 
    error, 
    refreshPayments,
    hasPendingPayments,
    totalPayments,
    pendingCount 
  } = useUserPayments(testUserId || user?.id, testEmail || user?.email)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          setTestUserId(user.id)
          setTestEmail(user.email || "")
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase])

  const handleTestApi = async () => {
    if (!testUserId || !testEmail) {
      alert("Preencha userId e email")
      return
    }

    try {
      const response = await fetch(`/api/asaas/payments/user/${testUserId}?email=${encodeURIComponent(testEmail)}`)
      const data = await response.json()
      
      console.log("📊 Resposta da API:", data)
      alert(`Resposta da API:\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error("❌ Erro:", error)
      alert(`Erro: ${error}`)
    }
  }

  const loadCustomers = async () => {
    setLoadingCustomers(true)
    try {
      const response = await fetch('/api/asaas/customers/list')
      const data = await response.json()
      
      if (response.ok) {
        setCustomers(data.customers || [])
        console.log("👥 Customers carregados:", data.customers)
      } else {
        console.error("❌ Erro ao carregar customers:", data.error)
      }
    } catch (error) {
      console.error("❌ Erro:", error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const selectCustomer = (customer: any) => {
    setTestEmail(customer.email)
    alert(`Email selecionado: ${customer.email}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste: Sistema de Pagamentos do Usuário</h1>
        <p className="text-gray-600">Teste da integração com Asaas para verificar pagamentos do usuário</p>
      </div>

      {/* Informações do Usuário */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Usuário Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Nome:</strong> {user.user_metadata?.full_name || "Não informado"}</div>
            </div>
          ) : (
            <p className="text-gray-600">Usuário não logado</p>
          )}
        </CardContent>
      </Card>

      {/* Teste Manual da API */}
      {/* Lista de Customers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Customers Disponíveis no Asaas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={loadCustomers} disabled={loadingCustomers} className="w-full">
            {loadingCustomers ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              "Carregar Customers"
            )}
          </Button>

          {customers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Clique em um customer para usar seu email:</p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.email}</div>
                    <div className="text-xs text-gray-500">ID: {customer.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Teste Manual da API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="ID do usuário"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <Button onClick={handleTestApi} className="w-full">
            Testar API Diretamente
          </Button>
        </CardContent>
      </Card>

      {/* Status do Hook */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status do Hook useUserPayments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalPayments}</div>
              <div className="text-sm text-blue-800">Total</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-sm text-yellow-800">Pendentes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalPayments - pendingCount}</div>
              <div className="text-sm text-green-800">Pagas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{hasPendingPayments ? "SIM" : "NÃO"}</div>
              <div className="text-sm text-red-800">Bloqueado</div>
            </div>
          </div>

          {paymentsLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Carregando pagamentos...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <p className="text-red-800 font-medium">Erro:</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {data && (
            <div className="bg-gray-50 border rounded-lg p-3 mt-4">
              <p className="font-medium mb-2">Dados do Hook:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Componente UserPayments */}
      {user && (
        <UserPayments userId={user.id} userEmail={user.email} />
      )}

      {/* Links de Teste */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Links de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <a href="/checkout?plano=basico" className="text-blue-600 hover:underline">
              → Testar Checkout (Plano Básico)
            </a>
          </div>
          <div>
            <a href="/perfil" className="text-blue-600 hover:underline">
              → Ver Perfil com Pagamentos
            </a>
          </div>
          <div>
            <a href="/teste-pagamentos" className="text-blue-600 hover:underline">
              → Página de Teste de Pagamentos
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 