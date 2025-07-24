"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Loader2, User, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function TesteCustomerPagamentosPage() {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      await loadProfile(user.id)
    }
  }

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    
    setProfile(data)
    if (data?.asaas_customer_id) {
      await loadPayments(data.asaas_customer_id)
    }
  }

  const loadPayments = async (customerId: string) => {
    try {
      const response = await fetch(`/api/asaas/payments/customer/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.data || [])
      }
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error)
    }
  }

  const testarCriarCustomer = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || "Cliente Teste",
          email: currentUser.email,
          cpfCnpj: "11144477735", // CPF válido para sandbox
          phone: "61999999999",
          mobilePhone: "61999999999",
        }),
      })

      if (response.ok) {
        const customerData = await response.json()
        setCustomer(customerData)
        toast.success("Customer criado com sucesso!")
        
        // Recarregar perfil para ver o customer_id salvo
        await loadProfile(currentUser.id)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar customer")
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testarCriarPagamento = async () => {
    const customerId = profile?.asaas_customer_id
    if (!customerId) {
      toast.error("Crie um customer primeiro!")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/asaas/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerId,
          billingType: "PIX",
          value: 49.90,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: "Teste - Pagamento PIX",
          externalReference: `teste-customer-pagamentos-${Date.now()}`,
        }),
      })

      if (response.ok) {
        const paymentData = await response.json()
        toast.success("Pagamento criado com sucesso!")
        
        // Recarregar pagamentos
        await loadPayments(customerId)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar pagamento")
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
      case "CONFIRMED":
      case "RECEIVED_IN_CASH":
        return <Badge className="bg-green-100 text-green-800">✅ Pago</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendente</Badge>
      case "OVERDUE":
        return <Badge className="bg-red-100 text-red-800">🔴 Vencido</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teste Customer + Pagamentos</h1>
      </div>

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentUser ? (
            <>
              <p><strong>ID:</strong> {currentUser.id}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Customer ID:</strong> {profile?.asaas_customer_id || "Não definido"}</p>
            </>
          ) : (
            <p>Usuário não autenticado</p>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        <Button 
          onClick={testarCriarCustomer} 
          disabled={loading || !currentUser}
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
          {profile?.asaas_customer_id ? "Customer já existe" : "Criar Customer"}
        </Button>

        <Button 
          onClick={testarCriarPagamento} 
          disabled={loading || !profile?.asaas_customer_id}
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Criar Pagamento PIX R$ 49,90
        </Button>
      </div>

      {/* Lista de Pagamentos */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pagamentos ({payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{payment.description}</h3>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div>
                      <strong>Valor:</strong> {formatCurrency(payment.value)}
                    </div>
                    <div>
                      <strong>Tipo:</strong> {payment.billingType}
                    </div>
                    <div>
                      <strong>Vencimento:</strong> {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                    </div>
                    <div>
                      <strong>ID:</strong> {payment.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify({
              user: currentUser?.id,
              profile: profile,
              customer: customer,
              paymentsCount: payments.length
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 