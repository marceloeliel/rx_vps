"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, FileText, Smartphone, ArrowLeft, Loader2, CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/lib/contexts/user-context"
import { createClient } from "@/lib/supabase/client"
import { LoadingScreen } from "@/components/loading-screen"

interface Plan {
  id: string
  name: string
  price: number
  duration: string
}

const plans: Record<string, Plan> = {
  basico: { id: "basico", name: "Plano Básico", price: 49.9, duration: "1 mês" },
  profissional: { id: "profissional", name: "Plano Profissional", price: 99.9, duration: "1 mês" },
  empresarial: { id: "empresarial", name: "Plano Empresarial", price: 199.9, duration: "1 mês" },
}

type PaymentMethod = "pix" | "boleto" | "cartao"
type BillingCycle = "mensal" | "anual"

interface AsaasCustomer {
  id: string
  name: string
  email: string
  cpfCnpj: string
}

interface AsaasPayment {
  id: string
  value: number
  status: string
  billingType: string
  invoiceUrl?: string
  invoiceNumber?: string
  pixTransaction?: {
    qrCode: {
      payload: string
      encodedImage: string
    }
  }
  bankSlipUrl?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix")
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("mensal")
  const [isProcessing, setIsProcessing] = useState(false)
  const [customer, setCustomer] = useState<AsaasCustomer | null>(null)
  const [payment, setPayment] = useState<AsaasPayment | null>(null)
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success" | "error">("form")
  const [hasPendingPayments, setHasPendingPayments] = useState(false)
  const [checkingPendingPayments, setCheckingPendingPayments] = useState(false)
  const [isRenewal, setIsRenewal] = useState(false)

  // 🚀 OTIMIZAÇÃO: Usar contexto global ao invés de múltiplas chamadas
  const { user: currentUser, profile, loading: userLoading, refreshUserData } = useUser()
  const supabase = createClient()

  // Form data
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    cpf: "",
    telefone: "",
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
  })

  useEffect(() => {
    const planId = searchParams.get("plano")
    const action = searchParams.get("action")
    
    if (planId && plans[planId]) {
      setSelectedPlan(plans[planId])
    } else {
      router.push("/planos")
    }

    // Se é uma renovação, mostrar mensagem específica
    if (action === "renewal") {
      console.log("🔄 [CHECKOUT] Processo de renovação iniciado")
      setIsRenewal(true)
      toast.info("Renovando sua assinatura...")
    }
  }, [searchParams, router])

  // 🚀 OTIMIZAÇÃO: Usar dados do contexto global e verificar pagamentos pendentes
  useEffect(() => {
    const checkUserData = async () => {
      if (userLoading) return
        
      if (!currentUser) {
          console.log("❌ [CHECKOUT] Usuário não logado, redirecionando...")
          router.push("/login")
          return
        }

      console.log("✅ [CHECKOUT] Usuário encontrado:", currentUser.email)
        
      // Pré-preencher formulário com dados do perfil (se existir)
      if (profile) {
        console.log("✅ [CHECKOUT] Perfil encontrado no contexto:", {
              nome_completo: profile.nome_completo,
              cpf: profile.cpf,
              whatsapp: profile.whatsapp,
              email: profile.email
            })
            
            const formDataPreenchido = {
              nomeCompleto: profile.nome_completo || "",
          email: currentUser.email || profile.email || "",
              cpf: profile.cpf ? formatCPF(profile.cpf) : "",
              telefone: profile.whatsapp ? formatPhone(profile.whatsapp) : "",
              numeroCartao: "",
              nomeCartao: profile.nome_completo || "",
              validade: "",
              cvv: "",
            }
            
        console.log("📝 [CHECKOUT] Preenchendo formulário com dados do contexto:", formDataPreenchido)
            setFormData(formDataPreenchido)
            
            toast.success("Dados carregados automaticamente do seu perfil!")
          } else {
        console.log("ℹ️ [CHECKOUT] Perfil não encontrado no contexto")
            setFormData(prev => ({
              ...prev,
          email: currentUser.email || "",
              nomeCartao: prev.nomeCompleto || "",
          }))
        }
        
        // Verificar pagamentos pendentes
      if (currentUser.email) {
          setCheckingPendingPayments(true)
          
        try {
          const response = await fetch(`/api/asaas/payments/user/${currentUser.id}?email=${encodeURIComponent(currentUser.email)}&status=PENDING`)
          
          if (response.ok) {
            const data = await response.json()
            setHasPendingPayments(data.hasPendingPayments)
            
            if (data.hasPendingPayments) {
              toast.error(`Você possui ${data.pendingPayments} cobrança(s) pendente(s). Quite suas pendências antes de criar uma nova.`)
          }
        }
      } catch (error) {
          console.log("⚠️ [CHECKOUT] Erro ao verificar pagamentos pendentes:", error)
      } finally {
        setCheckingPendingPayments(false)
        }
      }
    }

    checkUserData()
  }, [currentUser, profile, userLoading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4")
  }

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 4) // Limitar a 4 dígitos
    
    if (numbers.length <= 2) {
      return numbers
    }
    
    // Formatar como MM/YY
    const month = numbers.slice(0, 2)
    const year = numbers.slice(2, 4)
    
    // Validar mês enquanto digita
    if (parseInt(month) > 12) {
      return value.slice(0, -1) // Remove o último dígito se mês > 12
    }
    
    return `${month}/${year}`
  }

  const calculatePrice = () => {
    if (!selectedPlan) return 0
    if (paymentMethod === "boleto") {
      return selectedPlan.price // Sempre mensal para boleto
    }
    if (billingCycle === "anual") {
      return selectedPlan.price * 12 * 0.95 // 5% de desconto no anual
    }
    return selectedPlan.price
  }

  const calculateDiscount = () => {
    if (!selectedPlan || billingCycle === "mensal") return 0
    return selectedPlan.price * 12 * 0.05 // 5% de desconto
  }

  const validateForm = () => {
    if (!formData.nomeCompleto.trim()) {
      toast.error("Nome completo é obrigatório")
      return false
    }
    if (!formData.email.trim()) {
      toast.error("Email é obrigatório")
      return false
    }
    if (!formData.cpf.trim()) {
      toast.error("CPF é obrigatório")
      return false
    }
    if (!formData.telefone.trim()) {
      toast.error("Telefone é obrigatório")
      return false
    }

    // Validações específicas para cartão
    if (paymentMethod === "cartao") {
      if (!formData.numeroCartao.trim()) {
        toast.error("Número do cartão é obrigatório")
        return false
      }
      if (!formData.nomeCartao.trim()) {
        toast.error("Nome no cartão é obrigatório")
        return false
      }
      if (!formData.validade.trim()) {
        toast.error("Validade do cartão é obrigatória")
        return false
      }
      
      // Validar formato da data de validade (MM/YY)
      const validadeRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
      if (!validadeRegex.test(formData.validade)) {
        toast.error("Validade deve estar no formato MM/AA (ex: 12/26)")
        return false
      }
      
      // Validar se a data não está vencida
      const [month, year] = formData.validade.split("/")
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100 // Últimos 2 dígitos
      const currentMonth = currentDate.getMonth() + 1
      
      const cardYear = parseInt(year)
      const cardMonth = parseInt(month)
      
      if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
        toast.error("Cartão vencido. Verifique a data de validade")
        return false
      }
      if (!formData.cvv.trim()) {
        toast.error("CVV é obrigatório")
        return false
      }
    }

    return true
  }

  const createAsaasCustomer = async () => {
    const customerData = {
      name: formData.nomeCompleto,
      email: formData.email,
      cpfCnpj: formData.cpf.replace(/\D/g, ""),
      phone: formData.telefone.replace(/\D/g, ""),
      mobilePhone: formData.telefone.replace(/\D/g, ""),
      userId: currentUser?.id, // Incluir userId para salvar no Supabase
    }

    console.log("🚀 Enviando dados do cliente:", customerData)

    const response = await fetch("/api/asaas/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    })

    console.log("📊 Status da resposta:", response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Erro da API:", error)
      throw new Error(error.error || error.message || `Erro ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("✅ Cliente criado:", result)
    return result
  }

  const createAsaasPayment = async (customerId: string) => {
    const finalPrice = calculatePrice()
    
    // Mapear método de pagamento para o formato do ASAAS
    const getBillingType = (method: PaymentMethod) => {
      switch (method) {
        case "cartao": return "CREDIT_CARD"
        case "pix": return "PIX"
        case "boleto": return "BOLETO"
        default: return "CREDIT_CARD" // fallback
      }
    }
    
    const paymentData: any = {
      customer: customerId,
      billingType: getBillingType(paymentMethod),
      value: finalPrice,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
      description: `${selectedPlan?.name} - ${billingCycle === "anual" ? "Anual" : "Mensal"}`,
      externalReference: `checkout-${Date.now()}`,
    }

    // Adicionar dados do cartão se necessário
    if (paymentMethod === "cartao") {
      const [month, year] = formData.validade.split("/")
      paymentData.creditCard = {
        holderName: formData.nomeCartao,
        number: formData.numeroCartao.replace(/\s/g, ""),
        expiryMonth: month,
        expiryYear: `20${year}`,
        ccv: formData.cvv,
      }
      paymentData.creditCardHolderInfo = {
        name: formData.nomeCompleto,
        email: formData.email,
        cpfCnpj: formData.cpf.replace(/\D/g, ""),
        phone: formData.telefone.replace(/\D/g, ""),
        postalCode: "01310-100", // CEP padrão para testes (Av. Paulista, SP)
        address: "Av. Paulista",
        addressNumber: "1000",
        complement: "Conjunto 101",
        province: "Bela Vista", // Bairro
        city: "São Paulo",
        state: "SP"
      }
    }

    const response = await fetch("/api/asaas/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Erro da API ASAAS:", error)
      
      // Tratamento específico para erros do ASAAS
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0]
        
        // Mensagens mais amigáveis para erros comuns
        switch (firstError.code) {
          case 'invalid_creditCard':
            if (firstError.description.includes('mês de vencimento')) {
              throw new Error("Mês de vencimento inválido. Use formato MM/AA (ex: 12/26)")
            }
            if (firstError.description.includes('CEP')) {
              throw new Error("CEP do titular do cartão é obrigatório")
            }
            if (firstError.description.includes('endereço')) {
              throw new Error("Dados de endereço do titular do cartão são obrigatórios")
            }
            if (firstError.description.includes('número do endereço')) {
              throw new Error("Número do endereço do titular do cartão é obrigatório")
            }
            throw new Error(`Erro no cartão: ${firstError.description}`)
          case 'invalid_billingType':
            throw new Error("Tipo de pagamento inválido")
          default:
            throw new Error(firstError.description || "Erro no pagamento")
        }
      }
      
      throw new Error(error.message || "Erro ao criar pagamento")
    }

    return response.json()
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    // Verificar pagamentos pendentes antes de processar
    if (hasPendingPayments) {
      toast.error("Você possui cobranças pendentes. Quite suas pendências antes de criar uma nova cobrança.")
      return
    }

    setIsProcessing(true)
    setPaymentStep("processing")

    try {
      // 1. Criar cliente no Asaas
      toast.loading("Criando cliente...")
      const newCustomer = await createAsaasCustomer()
      setCustomer(newCustomer)
      
      // 2. Criar pagamento no Asaas
      toast.loading("Processando pagamento...")
      const newPayment = await createAsaasPayment(newCustomer.id)
      setPayment(newPayment)

      // 3. Verificar se houve erro
      if (newPayment.errors && newPayment.errors.length > 0) {
        throw new Error(newPayment.errors[0].description)
      }

      // 4. Atualizar perfil do usuário com dados do plano
      if (newPayment && currentUser) {
        try {
          const now = new Date()
          const updateData: any = {
            plano_atual: selectedPlan?.id,
            plano_data_inicio: now.toISOString(),
            plano_payment_id: newPayment.id,
            asaas_customer_id: newCustomer.id,
            updated_at: now.toISOString(),
          }

          // Calcular data de vencimento baseada no ciclo
          if (billingCycle === "anual") {
            // Pagamento anual: vence em 1 ano (365 dias)
            const dataFim = new Date(now)
            dataFim.setFullYear(dataFim.getFullYear() + 1)
            updateData.plano_data_fim = dataFim.toISOString()
          } else {
            // Pagamento mensal: vence em 30 dias
            const dataFim = new Date(now)
            dataFim.setDate(dataFim.getDate() + 30)
            updateData.plano_data_fim = dataFim.toISOString()
          }

          console.log("📅 [CHECKOUT] Definindo datas do plano:", {
            plano: selectedPlan?.id,
            inicio: updateData.plano_data_inicio,
            fim: updateData.plano_data_fim,
            ciclo: billingCycle,
            payment_id: newPayment.id
          })

          const { error: updateError } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", currentUser.id)

          if (updateError) {
            console.error("❌ Erro ao atualizar perfil:", updateError)
            toast.error("Pagamento criado, mas erro ao ativar plano. Entre em contato com o suporte.")
          } else {
            console.log("✅ Perfil atualizado com sucesso - Plano ativado!")
            toast.success("Plano ativado com sucesso!")
          }
        } catch (error) {
          console.error("❌ Erro ao salvar dados no perfil:", error)
          toast.error("Pagamento criado, mas erro ao ativar plano. Entre em contato com o suporte.")
        }
      }

      setPaymentStep("success")
      toast.success("Pagamento criado com sucesso!")

    } catch (error: any) {
      console.error("Erro no pagamento:", error)
      setPaymentStep("error")
      toast.error(error.message || "Erro ao processar pagamento")
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast.success(message)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-500 text-white">Confirmado</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500 text-white">Pendente</Badge>
      case "RECEIVED":
        return <Badge className="bg-blue-500 text-white">Recebido</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 🚀 OTIMIZAÇÃO: Loading screen melhorado
  if (!selectedPlan) {
    return <LoadingScreen message="Carregando plano..." submessage="Verificando informações do plano selecionado" />
  }

  if (userLoading) {
    return <LoadingScreen message="Carregando seus dados..." submessage="Buscando informações da sua conta" />
  }

  // Tela de sucesso
  if (paymentStep === "success" && payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Pagamento Criado!</h1>
              <p className="text-gray-600">
                Seu pagamento foi processado com sucesso. Veja os detalhes abaixo:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do Pagamento:</span>
                  <span className="font-mono text-sm">{payment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-bold">R$ {payment.value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(payment.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span>{payment.billingType}</span>
                </div>
                {payment.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número da Fatura:</span>
                    <span className="font-mono text-sm">{payment.invoiceNumber}</span>
                  </div>
                )}
              </div>

              {/* PIX específico */}
              {paymentMethod === "pix" && payment.pixTransaction && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Pagamento via PIX</h3>
                  
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border">
                      <img 
                        src={`data:image/png;base64,${payment.pixTransaction.qrCode.encodedImage}`}
                        alt="QR Code PIX" 
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  {/* Código PIX */}
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Label className="text-xs text-gray-600">Código PIX:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 text-xs break-all bg-white p-2 rounded border">
                        {payment.pixTransaction.qrCode.payload}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(payment.pixTransaction!.qrCode.payload, "Código PIX copiado!")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Boleto específico */}
              {paymentMethod === "boleto" && payment.bankSlipUrl && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Boleto Bancário</h3>
                  <Button
                    onClick={() => window.open(payment.bankSlipUrl, "_blank")}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visualizar Boleto
                  </Button>
                </div>
              )}

              {/* Link da fatura */}
              {payment.invoiceUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(payment.invoiceUrl, "_blank")}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Fatura Online
                </Button>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/planos")}
                  className="flex-1"
                >
                  Voltar aos Planos
                </Button>
                <Button
                  onClick={() => router.push("/perfil")}
                  className="flex-1"
                >
                  Ir para Perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de erro
  if (paymentStep === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Erro no Pagamento</h1>
              <p className="text-gray-600">
                Ocorreu um erro ao processar seu pagamento. Tente novamente.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPaymentStep("form")}
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
                <Button
                  onClick={() => router.push("/planos")}
                  className="flex-1"
                >
                  Voltar aos Planos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed on mobile, normal on desktop */}
      <div className="lg:bg-white lg:border-b lg:relative fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b lg:backdrop-blur-none">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {isRenewal ? "Renovação" : "Checkout"} - {selectedPlan.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Spacer for mobile fixed header */}
      <div className="h-16 lg:h-0"></div>

      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">
            {isRenewal ? "Renovar Assinatura" : "Finalizar Assinatura"}
          </h1>
          {isRenewal && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                🔄 Você está renovando sua assinatura. Escolha a forma de pagamento e continue aproveitando todos os recursos da plataforma.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-3">
          {/* Left Column - Summary (Desktop) / Top (Mobile) */}
          <div className="lg:order-1 order-2">
            <Card className="sticky top-24">
              <CardContent className="p-3">
                <h2 className="font-semibold text-lg mb-4 text-center lg:text-left">Resumo do Pedido</h2>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedPlan.name}</p>
                      <p className="text-sm text-gray-600">
                        {paymentMethod === "boleto"
                          ? "Assinatura recorrente mensal"
                          : billingCycle === "anual"
                            ? "Cobrança anual"
                            : "Cobrança mensal"}
                      </p>
                      {(paymentMethod === "boleto" || paymentMethod === "cartao") && (
                        <p className="text-xs text-blue-600 mt-1">⏳ Plano liberado após confirmação do pagamento</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    {billingCycle === "anual" && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Valor mensal:</span>
                          <span className="line-through text-gray-500">
                            R$ {(selectedPlan.price * 12).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-600">Desconto (5%):</span>
                          <span className="text-green-600">-R$ {calculateDiscount().toFixed(2).replace(".", ",")}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">R$ {calculatePrice().toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-orange-600">R$ {calculatePrice().toFixed(2).replace(".", ",")}</span>
                    </div>
                    {billingCycle === "anual" && (
                      <p className="text-xs text-green-600 text-center mt-2">
                        🎉 Você economiza R$ {calculateDiscount().toFixed(2).replace(".", ",")} por ano!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form Content */}
          <div className="lg:col-span-2 lg:order-2 order-1 space-y-3">
            {/* Payment Methods */}
            <Card>
              <CardContent className="p-3">
                <h2 className="font-semibold text-lg mb-4">Forma de Pagamento</h2>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      paymentMethod === "pix"
                        ? "border-orange-500 bg-orange-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <Smartphone className="h-4 w-4 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-medium">PIX</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("boleto")}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      paymentMethod === "boleto"
                        ? "border-orange-500 bg-orange-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <FileText className="h-4 w-4 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-medium">Boleto</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("cartao")}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      paymentMethod === "cartao"
                        ? "border-orange-500 bg-orange-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-medium">Cartão</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Billing Cycle (only show for PIX and Card) */}
            {(paymentMethod === "pix" || paymentMethod === "cartao") && (
              <Card>
                <CardContent className="p-3">
                  <h2 className="font-semibold text-lg mb-4">Ciclo de Cobrança</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBillingCycle("mensal")}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        billingCycle === "mensal"
                          ? "border-orange-500 bg-orange-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <p className="text-sm font-medium">Mensal</p>
                      <p className="text-xs text-gray-600">R$ {selectedPlan.price.toFixed(2).replace(".", ",")}/mês</p>
                    </button>

                    <button
                      onClick={() => setBillingCycle("anual")}
                      className={`p-3 rounded-lg border-2 transition-all relative ${
                        billingCycle === "anual"
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        -5%
                      </div>
                      <p className="text-sm font-medium">Anual</p>
                      <p className="text-xs text-gray-600">
                        R$ {(selectedPlan.price * 12 * 0.95).toFixed(2).replace(".", ",")}/ano
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Info */}
            <Card>
              <CardContent className="p-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        {paymentMethod === "pix" ? "Informações sobre o PIX" : 
                         paymentMethod === "boleto" ? "Informações sobre o Boleto" : 
                         "Informações sobre o Cartão"}
                      </p>
                      <p className="text-xs text-blue-700">
                        {paymentMethod === "pix"
                          ? "• Pagamento instantâneo via PIX - Plano liberado em até 5 minutos"
                          : paymentMethod === "boleto"
                          ? "• Seu plano será liberado em até 2 dias úteis após a confirmação do pagamento"
                          : "• Seu plano será liberado imediatamente após a aprovação do pagamento"}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {paymentMethod === "pix"
                          ? "• Você receberá o QR Code e código PIX para pagamento"
                          : paymentMethod === "boleto"
                          ? "• Você receberá um e-mail com o boleto para pagamento"
                          : "• Em caso de recusa, você será notificado por e-mail"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payer Information */}
            <Card>
              <CardContent className="p-3">
                <h2 className="font-semibold text-lg mb-4">Dados Pessoais</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="lg:col-span-2">
                    <Label htmlFor="nomeCompleto" className="text-xs">
                      Nome Completo *
                    </Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                      placeholder="Seu nome completo"
                      className="h-8"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      className="h-8"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-xs">
                      CPF *
                    </Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="h-8"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="telefone" className="text-xs">
                      Telefone *
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="h-8"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Information (only show if card payment is selected) */}
            {paymentMethod === "cartao" && (
              <Card>
                <CardContent className="p-3">
                  <h2 className="font-semibold text-lg mb-4">Dados do Cartão</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="lg:col-span-2">
                      <Label htmlFor="numeroCartao" className="text-xs">
                        Número do Cartão *
                      </Label>
                      <Input
                        id="numeroCartao"
                        value={formData.numeroCartao}
                        onChange={(e) => handleInputChange("numeroCartao", formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="h-8"
                        required
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="nomeCartao" className="text-xs">
                        Nome no Cartão *
                      </Label>
                      <Input
                        id="nomeCartao"
                        value={formData.nomeCartao}
                        onChange={(e) => handleInputChange("nomeCartao", e.target.value.toUpperCase())}
                        placeholder="COMO IMPRESSO NO CARTÃO"
                        className="h-8"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="validade" className="text-xs">
                        Validade *
                      </Label>
                      <Input
                        id="validade"
                        value={formData.validade}
                        onChange={(e) => handleInputChange("validade", formatExpiry(e.target.value))}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="h-8"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cvv" className="text-xs">
                        CVV *
                      </Label>
                      <Input
                        id="cvv"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                        placeholder="000"
                        maxLength={4}
                        className="h-8"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alert for pending payments */}
            {hasPendingPayments && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-medium">
                    Você possui cobranças pendentes
                  </p>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Quite suas pendências no seu perfil antes de criar uma nova cobrança.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/perfil")}
                  className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  Ver Minhas Cobranças
                </Button>
              </div>
            )}

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing || hasPendingPayments || checkingPendingPayments}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingPendingPayments ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando pendências...
                </div>
              ) : isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </div>
              ) : hasPendingPayments ? (
                "Quite suas pendências primeiro"
              ) : (
                `Finalizar Pagamento - R$ ${calculatePrice().toFixed(2).replace(".", ",")}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
