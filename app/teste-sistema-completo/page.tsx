"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  CheckCircle,
  CreditCard,
  User,
  DollarSign,
  Loader2,
  ArrowRight,
  Star,
} from "lucide-react"

export default function TesteSistemaCompleto() {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [customerStatus, setCustomerStatus] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [newPayment, setNewPayment] = useState<any>(null)
  
  const supabase = createClient()

  // Carregar usuário atual
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    loadUser()
  }, [supabase])

  // Verificar status do customer
  const checkCustomer = async () => {
    if (!currentUser?.id) return

    try {
      const response = await fetch(`/api/asaas/customers?userId=${currentUser.id}`)
      const data = await response.json()
      setCustomerStatus(data)
    } catch (error) {
      console.error("Erro ao verificar customer:", error)
    }
  }

  // Criar customer de teste
  const createTestCustomer = async () => {
    if (!currentUser?.id) return

    setLoading(true)
    try {
      const customerData = {
        userId: currentUser.id,
        name: "João da Silva Teste",
        email: currentUser.email || "joao.teste@email.com",
        phone: "61999855068",
        mobilePhone: "61999855068",
        cpfCnpj: "24971563792",
        postalCode: "01310100",
        address: "Av. Paulista",
        addressNumber: "1000",
        complement: "",
        province: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      }

      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      const result = await response.json()

      if (response.ok) {
        setCustomerStatus(result)
        toast.success("Customer criado com sucesso!")
        await checkCustomer()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Criar pagamento de teste
  const createTestPayment = async () => {
    if (!customerStatus?.id) return

    setLoading(true)
    try {
      const paymentData = {
        customer: customerStatus.id,
        billingType: "PIX",
        value: 50.00,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Teste de pagamento - Sistema RX-Git",
        externalReference: "teste-sistema-completo-" + Date.now(),
      }

      const response = await fetch("/api/asaas/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (response.ok) {
        setNewPayment(result)
        toast.success("Pagamento criado com sucesso!")
        await loadPayments()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Carregar pagamentos
  const loadPayments = async () => {
    if (!currentUser?.id) return

    try {
      const response = await fetch(`/api/asaas/payments/user/${currentUser.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error)
    }
  }

  useEffect(() => {
    if (currentUser?.id) {
      checkCustomer()
      loadPayments()
    }
  }, [currentUser?.id])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎉 Sistema Completo Funcionando!</h1>
        <p className="text-gray-600">Demonstração do sistema Customer ID + Pagamentos integrado</p>
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
          <div className="space-y-2">
            <div><strong>ID:</strong> {currentUser?.id || "Não logado"}</div>
            <div><strong>Email:</strong> {currentUser?.email || "Não informado"}</div>
            <div>
              <strong>Status:</strong>{" "}
              {currentUser ? (
                <Badge className="bg-green-500 text-white">Logado</Badge>
              ) : (
                <Badge variant="destructive">Não logado</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status do Customer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Status do Customer (Asaas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-700">Customer Configurado</span>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Customer ID:</strong> {customerStatus.id}</div>
                <div><strong>Nome:</strong> {customerStatus.name}</div>
                <div><strong>Email:</strong> {customerStatus.email}</div>
                <div><strong>CPF:</strong> {customerStatus.cpfCnpj}</div>
              </div>
              <Button onClick={createTestPayment} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Pagamento de Teste
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-orange-600">Customer ainda não configurado</div>
              <Button onClick={createTestCustomer} disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Customer de Teste
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Último Pagamento Criado */}
      {newPayment && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Último Pagamento Criado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {newPayment.id}</div>
              <div><strong>Valor:</strong> {formatCurrency(newPayment.value)}</div>
              <div><strong>Status:</strong> <Badge variant="outline">{newPayment.status}</Badge></div>
              <div><strong>Tipo:</strong> {newPayment.billingType}</div>
              {newPayment.invoiceUrl && (
                <div>
                  <strong>Link:</strong>{" "}
                  <a href={newPayment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Ver Pagamento
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Meus Pagamentos ({payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum pagamento encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{payment.description}</h3>
                      <p className="text-sm text-gray-600">ID: {payment.id}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(payment.value)}</div>
                      <Badge variant="outline">{payment.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link para Perfil */}
      <div className="mt-6 text-center">
        <a href="/perfil" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          Ver na Página de Perfil <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
} 