"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  QrCode,
  FileText,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface Payment {
  id: string
  status: string
  billingType: string
  value: number
  netValue?: number
  originalValue?: number
  description: string
  dueDate: string
  dateCreated: string
  paymentDate?: string
  invoiceUrl?: string
  bankSlipUrl?: string
  pixTransaction?: {
    qrCode: {
      payload: string
      encodedImage: string
    }
  }
}

interface PaymentStats {
  total: number
  pendentes: number
  pagos: number
  vencidos: number
  valor_total: number
  valor_pendente: number
  valor_pago: number
}

export function UserPaymentsDashboard() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    pendentes: 0,
    pagos: 0,
    vencidos: 0,
    valor_total: 0,
    valor_pendente: 0,
    valor_pago: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const supabase = createClient()

  // Carregar dados do usuário e pagamentos
  useEffect(() => {
    loadUserAndPayments()
  }, [])

  const loadUserAndPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Obter usuário atual
      console.log("🚀 [DASHBOARD] Carregando usuário...")
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("Usuário não autenticado")
        return
      }

      setCurrentUser(user)
      console.log("✅ [DASHBOARD] Usuário carregado:", user.id)

      // 2. Buscar asaas_customer_id do usuário
      console.log("🔍 [DASHBOARD] Buscando customer_id...")
      const { data: profile } = await supabase
        .from("profiles")
        .select("asaas_customer_id")
        .eq("id", user.id)
        .single()

      if (!profile?.asaas_customer_id) {
        console.log("ℹ️ [DASHBOARD] Customer_id não encontrado, usuário sem pagamentos")
        setPayments([])
        return
      }

      const asaasCustomerId = profile.asaas_customer_id
      setCustomerId(asaasCustomerId)
      console.log("✅ [DASHBOARD] Customer_id encontrado:", asaasCustomerId)

      // 3. Buscar pagamentos do cliente
      await loadPayments(asaasCustomerId)

    } catch (error: any) {
      console.error("❌ [DASHBOARD] Erro:", error)
      setError(error.message)
      toast.error("Erro ao carregar cobranças")
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async (customerId: string) => {
    try {
      console.log("💳 [DASHBOARD] Buscando pagamentos para customer:", customerId)
      
      const response = await fetch(`/api/asaas/payments/user/${customerId}`)
      
      if (!response.ok) {
        throw new Error("Erro ao buscar pagamentos")
      }

      const paymentsData = await response.json()
      console.log("✅ [DASHBOARD] Pagamentos recebidos:", paymentsData)

      // Se for uma resposta paginada do Asaas
      const paymentsList = paymentsData.data || paymentsData || []
      
      setPayments(paymentsList)
      calculateStats(paymentsList)
      
      toast.success(`${paymentsList.length} cobrança(s) encontrada(s)`)

    } catch (error: any) {
      console.error("❌ [DASHBOARD] Erro ao buscar pagamentos:", error)
      throw error
    }
  }

  const calculateStats = (paymentsList: Payment[]) => {
    const now = new Date()
    
    const stats = paymentsList.reduce((acc, payment) => {
      const dueDate = new Date(payment.dueDate)
      const value = payment.value || 0

      acc.total++
      acc.valor_total += value

      switch (payment.status) {
        case "RECEIVED":
        case "CONFIRMED":
          acc.pagos++
          acc.valor_pago += value
          break
        case "PENDING":
        case "AWAITING_PAYMENT":
          if (dueDate < now) {
            acc.vencidos++
          } else {
            acc.pendentes++
          }
          acc.valor_pendente += value
          break
        case "OVERDUE":
          acc.vencidos++
          acc.valor_pendente += value
          break
      }

      return acc
    }, {
      total: 0,
      pendentes: 0,
      pagos: 0,
      vencidos: 0,
      valor_total: 0,
      valor_pendente: 0,
      valor_pago: 0,
    })

    setStats(stats)
  }

  const getStatusInfo = (status: string, dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)

    switch (status) {
      case "RECEIVED":
      case "CONFIRMED":
        return {
          label: "Pago",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle
        }
      case "PENDING":
      case "AWAITING_PAYMENT":
        if (due < now) {
          return {
            label: "Vencido",
            color: "bg-red-100 text-red-800",
            icon: XCircle
          }
        }
        return {
          label: "Pendente",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock
        }
      case "OVERDUE":
        return {
          label: "Vencido",
          color: "bg-red-100 text-red-800",
          icon: XCircle
        }
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: AlertTriangle
        }
    }
  }

  const getBillingTypeInfo = (billingType: string) => {
    switch (billingType) {
      case "CREDIT_CARD":
        return { label: "Cartão", icon: CreditCard }
      case "PIX":
        return { label: "PIX", icon: QrCode }
      case "BOLETO":
        return { label: "Boleto", icon: FileText }
      default:
        return { label: billingType, icon: DollarSign }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const openPaymentUrl = (payment: Payment) => {
    if (payment.invoiceUrl) {
      window.open(payment.invoiceUrl, '_blank')
    } else if (payment.bankSlipUrl) {
      window.open(payment.bankSlipUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar cobranças</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadUserAndPayments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos</p>
                <p className="text-2xl font-bold text-green-600">{stats.pagos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-xl font-bold">{formatPrice(stats.valor_total)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Aberto</p>
                <p className="text-xl font-bold text-yellow-600">{formatPrice(stats.valor_pendente)}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recebido</p>
                <p className="text-xl font-bold text-green-600">{formatPrice(stats.valor_pago)}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cobranças */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Suas Cobranças</CardTitle>
            <Button variant="outline" size="sm" onClick={loadUserAndPayments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma cobrança encontrada</h3>
              <p className="text-gray-600">Você ainda não possui cobranças registradas.</p>
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((payment) => {
                const statusInfo = getStatusInfo(payment.status, payment.dueDate)
                const billingInfo = getBillingTypeInfo(payment.billingType)
                const StatusIcon = statusInfo.icon
                const BillingIcon = billingInfo.icon

                return (
                  <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <BillingIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {payment.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Vence: {formatDate(payment.dueDate)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {billingInfo.label}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {formatPrice(payment.value)}
                          </p>
                          {payment.paymentDate && (
                            <p className="text-xs text-green-600">
                              Pago em {formatDate(payment.paymentDate)}
                            </p>
                          )}
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        {(payment.invoiceUrl || payment.bankSlipUrl) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPaymentUrl(payment)}
                          >
                            Ver
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 