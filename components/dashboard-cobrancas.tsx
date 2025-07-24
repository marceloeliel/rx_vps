"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  QrCode,
  FileText,
  RefreshCw,
  ExternalLink,
  Eye,
  ChevronRight,
  Shield,
  AlertTriangle,
} from "lucide-react"

interface Payment {
  id: string
  status: string
  billingType: string
  value: number
  description: string
  dueDate: string
  dateCreated: string
  paymentDate?: string
  invoiceUrl?: string
  bankSlipUrl?: string
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

interface SubscriptionInfo {
  id: string
  plan_type: string
  plan_value: number
  status: string
  end_date: string
  grace_period_ends_at?: string
}

export function DashboardCobrancas() {
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
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadUserPayments()
  }, [])

  const loadSubscriptionInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.subscription) {
          setSubscription(result.subscription)
          console.log("✅ [DASHBOARD-COBRANCAS] Assinatura carregada:", result.subscription)
        }
      }
    } catch (error) {
      console.error("❌ [DASHBOARD-COBRANCAS] Erro ao carregar assinatura:", error)
    }
  }

  const loadUserPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🚀 [DASHBOARD-COBRANCAS] Iniciando carregamento...")

      // 1. Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log("❌ [DASHBOARD-COBRANCAS] Usuário não autenticado")
        setError("Usuário não autenticado")
        return
      }

      console.log("✅ [DASHBOARD-COBRANCAS] Usuário autenticado:", user.id)

      // 2. Buscar informações da assinatura
      await loadSubscriptionInfo(user.id)

      // 3. Buscar asaas_customer_id do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("asaas_customer_id")
        .eq("id", user.id)
        .single()

      if (profileError) {
        setError("Erro ao buscar perfil do usuário.")
        return
      }

      if (!profile?.asaas_customer_id) {
        console.log("ℹ️ [DASHBOARD-COBRANCAS] Usuário sem customer_id, sem cobranças")
        setPayments([])
        setError("Você ainda não possui cobranças geradas.")
        return
      }

      console.log("✅ [DASHBOARD-COBRANCAS] Customer_id encontrado:", profile.asaas_customer_id)

      // 3. Buscar pagamentos do cliente usando a nova API que aceita customer_id diretamente
      let response
      try {
        response = await fetch(`/api/asaas/payments/customer/${profile.asaas_customer_id}`)
      } catch (fetchError) {
        setError("Erro de conexão com o servidor de cobranças.")
        return
      }
      
      if (!response.ok) {
        let errorMsg = "Erro ao buscar cobranças."
        try {
          const errorData = await response.json()
          if (errorData.error?.includes('ASAAS_API_KEY não configurada')) {
            console.log("⚠️ [DASHBOARD-COBRANCAS] API Asaas não configurada")
            errorMsg = "ASAAS_API_KEY não configurada no ambiente do servidor. Reinicie o servidor e confira o .env."
          } else {
            errorMsg = errorData?.error || errorMsg
          }
        } catch {}
        setError(errorMsg)
        return
      }

      const paymentsData = await response.json()
      const paymentsList = paymentsData.data || paymentsData || []
      
      console.log("✅ [DASHBOARD-COBRANCAS] Pagamentos carregados:", paymentsList.length)
      
      setPayments(paymentsList)
      calculateStats(paymentsList)
      setError(null)

    } catch (error: any) {
      console.error("❌ [DASHBOARD-COBRANCAS] Erro:", error)
      setError("Erro inesperado ao carregar cobranças.")
      toast.error("Erro ao carregar cobranças")
    } finally {
      setLoading(false)
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
    console.log("📊 [DASHBOARD-COBRANCAS] Estatísticas calculadas:", stats)
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)

    switch (status) {
      case "RECEIVED":
      case "CONFIRMED":
      case "RECEIVED_IN_CASH":
        return <Badge className="bg-green-100 text-green-800 text-xs">✅ Pago</Badge>
      case "PENDING":
      case "AWAITING_PAYMENT":
        if (due < now) {
          return <Badge className="bg-red-100 text-red-800 text-xs">❌ Vencido</Badge>
        }
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">⏳ Pendente</Badge>
      case "OVERDUE":
        return <Badge className="bg-red-100 text-red-800 text-xs">❌ Vencido</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 text-xs">{status}</Badge>
    }
  }

  const getBillingTypeIcon = (billingType: string) => {
    switch (billingType) {
      case "CREDIT_CARD":
        return <CreditCard className="h-4 w-4" />
      case "PIX":
        return <QrCode className="h-4 w-4" />
      case "BOLETO":
        return <FileText className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
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

  const getDaysUntilExpiration = (endDateString: string) => {
    const now = new Date()
    const endDate = new Date(endDateString)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getSubscriptionStatusBadge = (status: string, endDate: string, gracePeriodEnd?: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const isExpired = end < now

    switch (status) {
      case 'active':
        if (isExpired) {
          return <Badge className="bg-orange-100 text-orange-800">Renovação Pendente</Badge>
        }
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      
      case 'pending_payment':
        if (gracePeriodEnd) {
          const grace = new Date(gracePeriodEnd)
          const inGracePeriod = now <= grace
          
          if (inGracePeriod) {
            return <Badge className="bg-orange-100 text-orange-800">Período de Tolerância</Badge>
          }
        }
        return <Badge className="bg-red-100 text-red-800">Pagamento Pendente</Badge>
      
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>
      
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>
      
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-0">
        {/* Loading para cards de estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-3 md:p-4">
                <div className="animate-pulse">
                  <div className="h-3 md:h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-5 md:h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Loading para lista */}
        <Card>
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <XCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-lg font-semibold text-red-700 mb-2">{error}</p>
        <Button onClick={loadUserPayments} className="mt-2">Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Resumo das Cobranças - Responsivo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Pendentes</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Pagos</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">{stats.pagos}</p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Vencidos</p>
                <p className="text-lg md:text-2xl font-bold text-red-600">{stats.vencidos}</p>
              </div>
              <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valores - Layout mobile otimizado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-base md:text-xl font-bold text-gray-900 truncate">{formatPrice(stats.valor_total)}</p>
              </div>
              <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">Em Aberto</p>
                <p className="text-base md:text-xl font-bold text-yellow-600 truncate">{formatPrice(stats.valor_pendente)}</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">Recebido</p>
                <p className="text-base md:text-xl font-bold text-green-600 truncate">{formatPrice(stats.valor_pago)}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações da Assinatura */}
      {subscription && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              <span>Informações do Plano</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Plano Atual</p>
                <p className="font-bold text-blue-900 capitalize">
                  {subscription.plan_type.replace('_', ' ')}
                </p>
                <p className="text-sm text-blue-700">
                  {formatPrice(subscription.plan_value)}/mês
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Vencimento do Plano</p>
                <p className="font-bold text-blue-900">
                  {formatDate(subscription.end_date)}
                </p>
                <p className="text-sm text-blue-700">
                  {getDaysUntilExpiration(subscription.end_date)} dias restantes
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Status da Assinatura</p>
                <div className="mt-1">
                  {getSubscriptionStatusBadge(subscription.status, subscription.end_date, subscription.grace_period_ends_at)}
                </div>
                {subscription.grace_period_ends_at && subscription.status === 'pending_payment' && (
                  <p className="text-xs text-orange-600 mt-1">
                    Tolerância até: {formatDate(subscription.grace_period_ends_at)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Cobranças - Layout mobile otimizado */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base md:text-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span>Minhas Cobranças</span>
            </div>
            <Badge variant="outline" className="self-start sm:ml-auto text-xs">
              {payments.length} cobrança(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-8 md:h-12 w-8 md:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">Nenhuma cobrança encontrada</h3>
              <p className="text-sm md:text-base text-gray-600">Você ainda não possui cobranças criadas.</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Layout Mobile-First */}
                  <div className="space-y-3">
                    {/* Header do pagamento */}
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getBillingTypeIcon(payment.billingType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">{payment.description}</h4>
                        <div className="mt-1">
                          {getStatusBadge(payment.status, payment.dueDate)}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Valor destacado */}
                    <div className="bg-green-50 rounded-lg p-2 md:p-3">
                      <p className="text-xs text-gray-600">Valor da cobrança</p>
                      <p className="text-lg md:text-xl font-bold text-green-600">{formatPrice(payment.value)}</p>
                    </div>

                    {/* Informações em grid responsivo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-xs text-gray-500 block">Vencimento</span>
                        <p className="font-medium text-gray-900">{formatDate(payment.dueDate)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-xs text-gray-500 block">Criado em</span>
                        <p className="font-medium text-gray-900">{formatDate(payment.dateCreated)}</p>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    {(payment.invoiceUrl || payment.bankSlipUrl) && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                        {payment.invoiceUrl && (
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Cobrança
                            </a>
                          </Button>
                        )}
                        {payment.bankSlipUrl && (
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <a href={payment.bankSlipUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Baixar Boleto
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 