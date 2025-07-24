"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
// import { getAsaasCustomerId, saveAsaasCustomerId } from "@/lib/supabase/profiles" // REMOVIDO - Sistema de pagamentos desabilitado
import { useUserPayments } from "@/hooks/use-user-payments"
import {
  User,
  CreditCard,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"

export default function TesteCustomerSystemPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [asaasCustomerId, setAsaasCustomerId] = useState<string | null>(null)
  
  const supabase = createClient()

  // Hook para pagamentos do usuário
  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
    refreshPayments,
    hasPendingPayments,
    totalPayments,
    pendingCount
  } = useUserPayments(currentUser?.id, currentUser?.email)

  // Dados do formulário
  const [customerData, setCustomerData] = useState({
    name: "Teste Sistema Customer",
    email: "teste.customer@email.com",
    cpfCnpj: "24971563792",
    phone: "61999855068", // Formato válido para Asaas
    mobilePhone: "61999855068", // Formato válido para Asaas
    postalCode: "01310-100",
    address: "Av. Paulista",
    addressNumber: "1000",
    complement: "Sala 1",
    province: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  })

  // Carregar usuário atual
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      if (user) {
        // Buscar customer_id existente
        // const existingCustomerId = await getAsaasCustomerId(user.id) // REMOVIDO - Sistema de pagamentos desabilitado
    const existingCustomerId = null // Temporário
        setAsaasCustomerId(existingCustomerId)
      }
    }
    loadUser()
  }, [supabase])

  // Função para criar ou buscar customer
  const handleCreateOrFindCustomer = async () => {
    if (!currentUser) {
      toast.error("Usuário não logado")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...customerData,
          userId: currentUser.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar/buscar cliente")
      }

      const customerResult = await response.json()
      setCustomer(customerResult)
      
      // Atualizar customer_id local
      setAsaasCustomerId(customerResult.id)
      
      toast.success("Customer processado com sucesso!")
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Função para criar pagamento teste
  const handleCreateTestPayment = async () => {
    if (!customer) {
      toast.error("Crie um customer primeiro!")
      return
    }

    setLoading(true)
    try {
      const paymentData = {
        customer: customer.id,
        billingType: "PIX",
        value: 29.90,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Teste do novo sistema de customer",
        externalReference: `teste-customer-${Date.now()}`,
      }

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

      const payment = await response.json()
      toast.success("Pagamento criado com sucesso!")
      
      // Atualizar lista de pagamentos
      refreshPayments()
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste do Sistema Customer ID</h1>
        <p className="text-gray-600">Testando integração Supabase + Asaas com customer_id</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Testes */}
        <div className="space-y-6">
          {/* Status do Usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Status do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Usuário Logado:</span>
                <Badge variant={currentUser ? "default" : "destructive"}>
                  {currentUser ? "Sim" : "Não"}
                </Badge>
              </div>
              {currentUser && (
                <>
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <code className="text-xs">{currentUser.id}</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer ID Salvo:</span>
                    <Badge variant={asaasCustomerId ? "default" : "secondary"}>
                      {asaasCustomerId || "Não encontrado"}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Criar/Buscar Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                1. Criar/Buscar Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={customerData.cpfCnpj}
                  onChange={(e) => setCustomerData({ ...customerData, cpfCnpj: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleCreateOrFindCustomer} 
                disabled={loading || !currentUser} 
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {customer ? "Customer Encontrado" : "Criar/Buscar Customer"}
              </Button>
            </CardContent>
          </Card>

          {/* Criar Pagamento Teste */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                2. Criar Pagamento Teste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateTestPayment} 
                disabled={loading || !customer} 
                className="w-full"
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Pagamento PIX R$ 29,90
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-6">
          {/* Customer Criado */}
          {customer && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Customer Processado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {customer.id}</div>
                  <div><strong>Nome:</strong> {customer.name}</div>
                  <div><strong>Email:</strong> {customer.email}</div>
                  <div><strong>CPF:</strong> {customer.cpfCnpj}</div>
                  <div><strong>Status:</strong> <Badge variant="outline" className="text-green-600 border-green-600">Ativo</Badge></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas de Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamentos do Usuário
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshPayments}
                  disabled={paymentsLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${paymentsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : paymentsError ? (
                <div className="text-red-600 text-sm">{paymentsError}</div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalPayments}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                    <div className="text-xs text-gray-600">Pendentes</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${hasPendingPayments ? 'text-red-600' : 'text-green-600'}`}>
                      {hasPendingPayments ? '❌' : '✅'}
                    </div>
                    <div className="text-xs text-gray-600">Status</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Pagamentos */}
          {paymentsData && paymentsData.payments && paymentsData.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Últimos Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentsData.payments.slice(0, 5).map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">R$ {payment.value.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">{payment.description}</div>
                      </div>
                      <Badge 
                        variant={
                          payment.status === 'CONFIRMED' || payment.status === 'RECEIVED' || payment.status === 'RECEIVED_IN_CASH' ? 'default' :
                          payment.status === 'PENDING' || payment.status === 'AWAITING_PAYMENT' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>1. <strong>Sistema Inteligente:</strong> Verifica se já existe customer para o usuário</div>
              <div>2. <strong>Salva Automaticamente:</strong> Customer ID é salvo no perfil do Supabase</div>
              <div>3. <strong>Busca Eficiente:</strong> Pagamentos são buscados diretamente pelo customer_id</div>
              <div>4. <strong>Evita Duplicatas:</strong> Não cria customers desnecessários</div>
              <div>5. <strong>Performance:</strong> Busca mais rápida e precisa</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 