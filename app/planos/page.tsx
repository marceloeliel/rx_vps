"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Check, QrCode, Copy, Loader2, CreditCard, FileText, X, AlertCircle, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAsaasV2 } from "@/hooks/use-asaas-v2"
import Image from "next/image"

interface Plan {
  id: string
  name: string
  price: number
  originalPrice?: number
  popular?: boolean
  features: string[]
  buttonText: string
  buttonVariant: "default" | "destructive" | "outline"
}

interface PixPaymentData {
  id: string
  value: number
  status: string
  dueDate: string
  qrCode?: string
  copyAndPaste?: string
  expirationDate?: string
  pixTransaction?: {
    qrCode?: {
      payload?: string
      encodedImage?: string
    }
  }
}

const plans: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    price: 59.9,
    features: ["Até 5 veículos", "Anúncios básicos", "Suporte por email", "Estatísticas básicas"],
    buttonText: "Assinar Agora",
    buttonVariant: "default",
  },
  {
    id: "profissional",
    name: "Profissional",
    price: 299.0,
    popular: true,
    features: [
      "Até 30 veículos",
      "Anúncios destacados",
      "Suporte prioritário",
      "Estatísticas avançadas",
      "Relatórios personalizados",
      "3 destaques de veículos",
      "Painel administrativo"
    ],
    buttonText: "Assinar Agora",
    buttonVariant: "destructive",
  },
  {
    id: "empresarial",
    name: "Empresarial",
    price: 897.9,
    features: [
      "Até 400 veículos",
      "Anúncios premium",
      "Suporte 24/7",
      "Estatísticas completas",
      "Relatórios avançados",
      "40 destaques de veículos",
      "Painel administrativo"
    ],
    buttonText: "Assinar Agora",
    buttonVariant: "outline",
  },
  {
    id: "ilimitado",
    name: "Ilimitado",
    price: 1897.9,
    features: [
      "Veículos ilimitados",
      "Anúncios premium",
      "Suporte 24/7 prioritário",
      "Estatísticas completas",
      "Relatórios avançados",
      "100 destaques de veículos",
      "Painel administrativo",
      "Acesso API exclusivo",
      "Consultoria dedicada"
    ],
    buttonText: "Assinar Agora",
    buttonVariant: "outline",
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { 
    createCustomerAndPixPayment, 
    getPaymentStatus,
    copyPixCode, 
    formatCurrency, 
    formatDate,
    loading,
    error 
  } = useAsaasV2()
  
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [pixPaymentData, setPixPaymentData] = useState<PixPaymentData | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [hasPendingPayments, setHasPendingPayments] = useState(false)
  const [checkingPendingPayments, setCheckingPendingPayments] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos em segundos
  const [timerActive, setTimerActive] = useState(false)
  const [errorCount, setErrorCount] = useState(0) // Contador de erros consecutivos
  
  // Dados do formulário para PIX
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    cpf: "",
    telefone: "",
  })

  const supabase = createClient()

  // Funções de formatação (movidas para cima para uso no useEffect)
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const loadUser = async () => {
      setLoadingUserData(true)
      
      try {
        console.log("🔍 [PLANOS] Iniciando carregamento do usuário...")
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("❌ [PLANOS] Erro ao buscar usuário:", error)
          return
        }
        
        if (user) {
          console.log("✅ [PLANOS] Usuário encontrado:", user.email)
          setCurrentUser(user)
          
          // Buscar dados do perfil do usuário
          try {
            console.log("🔍 [PLANOS] Buscando perfil para userId:", user.id)
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            console.log("📋 [PLANOS] Resultado da busca do perfil:", { profile, profileError })

            if (profile && !profileError) {
              console.log("✅ [PLANOS] Perfil encontrado:", {
                nome_completo: profile.nome_completo,
                cpf: profile.cpf,
                whatsapp: profile.whatsapp,
                email: profile.email
              })
              
              // Pré-preencher formulário com dados do perfil (formatados)
              const formDataPreenchido = {
                nomeCompleto: profile.nome_completo || "",
                email: user.email || profile.email || "",
                cpf: profile.cpf ? formatCPF(profile.cpf) : "",
                telefone: profile.whatsapp ? formatPhone(profile.whatsapp) : "",
              }
              
              console.log("📝 [PLANOS] Preenchendo formulário com:", formDataPreenchido)
              setFormData(formDataPreenchido)
              
              toast({
                title: "Dados carregados!",
                description: "Seus dados foram preenchidos automaticamente",
              })
            } else {
              console.log("ℹ️ [PLANOS] Perfil não encontrado ou erro:", profileError)
              // Se não tem perfil, apenas pré-preencher o email
              setFormData(prev => ({
                ...prev,
                email: user.email || "",
              }))
              console.log("📝 [PLANOS] Preenchendo apenas email:", user.email)
            }
          } catch (error) {
            console.error("❌ [PLANOS] Erro ao buscar perfil:", error)
            // Em caso de erro, pelo menos preencher o email
            setFormData(prev => ({
              ...prev,
              email: user.email || "",
            }))
          }
          
          // Verificar pagamentos pendentes
          if (user.email) {
            setCheckingPendingPayments(true)
            try {
              console.log("🔍 [PLANOS] Verificando pagamentos pendentes...")
              const response = await fetch(`/api/asaas/payments/user/${user.id}?email=${encodeURIComponent(user.email)}&status=PENDING`)
              
              if (response.ok) {
                const data = await response.json()
                console.log("📊 [PLANOS] Resultado da verificação de pendências:", data)
                setHasPendingPayments(data.hasPendingPayments || false)
                
                if (data.hasPendingPayments) {
                  console.log(`⚠️ [PLANOS] Usuário possui ${data.pendingPayments} cobrança(s) pendente(s)`)
                  toast({
                    variant: "destructive",
                    title: "Cobranças pendentes encontradas",
                    description: `Você possui ${data.pendingPayments} cobrança(s) pendente(s). Quite suas pendências antes de criar uma nova.`,
                  })
                }
              }
            } catch (error) {
              console.error("❌ [PLANOS] Erro ao verificar pagamentos pendentes:", error)
            } finally {
              setCheckingPendingPayments(false)
            }
          }
        } else {
          console.log("ℹ️ [PLANOS] Usuário não está logado")
        }
      } catch (error) {
        console.error("❌ [PLANOS] Erro ao carregar usuário:", error)
      } finally {
        setLoadingUserData(false)
        console.log("✅ [PLANOS] Carregamento do usuário finalizado")
      }
    }
    
    loadUser()
  }, [supabase, toast])

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId)
    
    if (!currentUser) {
      router.push(`/login?redirect=/planos`)
      return
    }

    // Verificar se há pagamentos pendentes antes de permitir nova cobrança
    if (hasPendingPayments) {
      toast({
        variant: "destructive",
        title: "Cobranças pendentes",
        description: "Você possui cobranças pendentes. Quite suas pendências antes de criar uma nova cobrança.",
      })
      return
    }

    // Mostrar modal de seleção de método de pagamento
    setShowPaymentMethodModal(true)
  }

  const handlePixPayment = async () => {
    if (!selectedPlan || !currentUser) return

    // Verificar se há pagamentos pendentes
    if (hasPendingPayments) {
      toast({
        variant: "destructive",
        title: "Cobranças pendentes",
        description: "Você possui cobranças pendentes. Quite suas pendências antes de criar uma nova cobrança.",
      })
      return
    }

    // Validar formulário
    if (!formData.nomeCompleto.trim() || !formData.email.trim() || !formData.cpf.trim() || !formData.telefone.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
      })
      return
    }

    setIsLoading(true)
    setShowPaymentMethodModal(false)

    try {
      const plan = plans.find(p => p.id === selectedPlan)
      if (!plan) throw new Error("Plano não encontrado")

      // 1. Criar cliente
      const customerData = {
        name: formData.nomeCompleto,
        email: formData.email,
        cpfCnpj: formData.cpf.replace(/\D/g, ""),
        phone: formData.telefone.replace(/\D/g, ""),
        mobilePhone: formData.telefone.replace(/\D/g, ""),
        userId: currentUser.id,
      }

      // Preparar dados do customer
      const asaasCustomerData = {
        name: formData.nomeCompleto,
        email: formData.email,
        cpfCnpj: formData.cpf.replace(/\D/g, ""),
        mobilePhone: formData.telefone.replace(/\D/g, ""),
      }

      // Preparar dados do pagamento
      const paymentData = {
        value: plan.price,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
        description: `${plan.name} - Pagamento mensal`,
        externalReference: `plan_${plan.id}_${Date.now()}`,
      }

      console.log("🚀 [PIX] Iniciando criação do customer e pagamento...")

      // Criar customer e pagamento PIX
      const { customer, payment } = await createCustomerAndPixPayment(asaasCustomerData, paymentData)
      
      if (!customer || !payment) {
        throw new Error(error || "Sistema de pagamentos em manutenção. Tente novamente em breve.")
      }

      console.log("✅ [PIX] Customer criado:", customer.id)
      console.log("✅ [PIX] Pagamento PIX criado:", payment.id)
      console.log("🔍 [PIX] PIX Transaction:", payment.pixTransaction)

      if (payment.pixTransaction?.qrCode?.payload && payment.pixTransaction?.qrCode?.encodedImage) {
        // Converter para o tipo esperado pelo modal
        const pixData: PixPaymentData = {
          id: payment.id!,
          value: payment.value!,
          status: payment.status!,
          dueDate: payment.dueDate!,
          pixTransaction: {
            qrCode: {
              payload: payment.pixTransaction.qrCode.payload,
              encodedImage: payment.pixTransaction.qrCode.encodedImage
            }
          }
        }
        
        setPixPaymentData(pixData)
        setShowPixModal(true)
        toast({
          title: "PIX gerado com sucesso!",
          description: "Escaneie o QR Code ou copie o código para pagar",
        })
      } else {
                      console.log("⚠️ [PIX] QR Code não disponível imediatamente, criando experiência integrada...")
              
              // Criar dados do PIX mesmo sem QR Code inicial
              const pixData: PixPaymentData = {
                id: payment.id!,
                value: payment.value!,
                status: payment.status!,
                dueDate: payment.dueDate!,
                pixTransaction: payment.pixTransaction || undefined
              }
              
              setPixPaymentData(pixData)
              setShowPixModal(true)
              
              toast({
                title: "Processando PIX...",
                description: "Gerando seu código PIX, aguarde um momento...",
              })
              
              // Tentar buscar o PIX novamente em background
              setTimeout(async () => {
                try {
                  const pixCheck = await getPaymentStatus(payment.id!)
                  
                  if (pixCheck?.pixTransaction?.qrCode?.payload && pixCheck?.pixTransaction?.qrCode?.encodedImage) {
                    const updatedPixData: PixPaymentData = {
                      id: pixCheck.id!,
                      value: pixCheck.value!,
                      status: pixCheck.status!,
                      dueDate: pixCheck.dueDate!,
                      pixTransaction: {
                        qrCode: {
                          payload: pixCheck.pixTransaction.qrCode.payload,
                          encodedImage: pixCheck.pixTransaction.qrCode.encodedImage
                        }
                      }
                    }
                    
                    setPixPaymentData(updatedPixData)
                    toast({
                      title: "🎉 PIX gerado!",
                      description: "Seu código PIX está pronto para pagamento",
                    })
                    
                    // Pequena vibração/feedback para mobile (se disponível)
                    if (navigator.vibrate) {
                      navigator.vibrate(200)
                    }
                  }
                } catch (retryError) {
                  console.error("Erro ao verificar PIX novamente:", retryError)
                }
              }, 3000)
      }

    } catch (error: any) {
      console.error("Erro no pagamento PIX:", error)
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: error.message || "Erro ao gerar PIX. Tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtherPaymentMethods = (planId: string) => {
    // Verificar se há pagamentos pendentes antes de redirecionar para checkout
    if (hasPendingPayments) {
      toast({
        variant: "destructive",
        title: "Cobranças pendentes",
        description: "Você possui cobranças pendentes. Quite suas pendências antes de criar uma nova cobrança.",
      })
      return
    }
    
    setShowPaymentMethodModal(false)
    router.push(`/checkout?plano=${planId}`)
  }

  const handleCopyPixCode = async () => {
    const pixCode = pixPaymentData?.copyAndPaste || pixPaymentData?.pixTransaction?.qrCode?.payload
    if (pixCode) {
      const success = await copyPixCode(pixCode)
      if (success) {
        toast({
          title: "Código copiado!",
          description: "Cole no seu app do banco para pagar",
        })
      } else {
        toast({
          title: "Erro ao copiar",
          description: "Tente novamente",
          variant: "destructive"
        })
      }
    }
  }

  // Função para buscar informações de cobrança
  const fetchBillingInfo = async (paymentId: string) => {
    try {
      console.log("🔍 [BILLING_INFO] Buscando informações de cobrança:", paymentId)
      const response = await fetch(`/api/asaas-v2/payments/${paymentId}/billingInfo`)
      
      if (response.ok) {
        const result = await response.json()
        const billingData = result.data
        
        console.log("📱 [BILLING_INFO] Dados de cobrança recebidos:", {
          hasPixData: !!billingData?.pixData,
          hasQrCode: !!billingData?.pixData?.qrCode,
          hasPayload: !!billingData?.pixData?.copyAndPaste
        })

        // Se temos dados do PIX, atualizar estado
        if (billingData?.pixData) {
          setPixPaymentData(prev => ({
            ...prev!,
            qrCode: billingData.pixData.qrCode || prev?.qrCode || '',
            copyAndPaste: billingData.pixData.copyAndPaste || prev?.copyAndPaste || '',
            expirationDate: billingData.pixData.expirationDate || prev?.expirationDate
          }))
          return true
        }
      } else {
        console.log("⚠️ [BILLING_INFO] Erro ao buscar billing info, tentando método alternativo")
      }
      
      return false
    } catch (error) {
      console.error("❌ [BILLING_INFO] Erro ao buscar billing info:", error)
      return false
    }
  }

  // Função para verificar status do pagamento
  const checkPaymentStatus = async (paymentId: string) => {
    try {
      setCheckingPayment(true)
      
      console.log("🔍 [CHECK_PAYMENT] Consultando pagamento:", paymentId)
      const response = await fetch(`/api/asaas-v2/payments/${paymentId}`)
      
      console.log("📡 [CHECK_PAYMENT] Response status:", response.status)
      
      if (response.ok) {
        const result = await response.json()
        const paymentData = result.data || result // Suportar ambos os formatos
        
        console.log("📋 [CHECK_PAYMENT] Dados completos do pagamento:", {
          id: paymentData.id,
          status: paymentData.status,
          value: paymentData.value,
          billingType: paymentData.billingType,
          hasPixData: !!paymentData.pixData
        })

        // Se ainda não temos QR code, tentar buscar via billingInfo
        if (!pixPaymentData?.qrCode || !pixPaymentData?.copyAndPaste) {
          try {
            await fetchBillingInfo(paymentId)
          } catch (billingError) {
            console.log("⚠️ [CHECK_PAYMENT] Erro ao buscar billing info, continuando sem QR code")
          }
        }
        
        // Verificar se o pagamento foi confirmado
        // ASAAS pode usar diferentes status dependendo do ambiente
        const confirmedStatuses = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']
        const isConfirmed = confirmedStatuses.includes(paymentData.status)
        
        console.log("🎯 [CHECK_PAYMENT] Status está confirmado?", isConfirmed, "Status:", paymentData.status)
        
        if (isConfirmed) {
          console.log("🎉 [CHECK_PAYMENT] Pagamento confirmado! Atualizando UI...")
          setPaymentConfirmed(true)
          toast({
            title: "🎉 Pagamento Confirmado!",
            description: "Seu pagamento PIX foi processado com sucesso!",
          })
          
          // Fechar modal após 3 segundos
          setTimeout(() => {
            setShowPixModal(false)
            setPaymentConfirmed(false)
            setPixPaymentData(null)
            // Redirecionar para painel da agência
            router.push("/painel-agencia")
          }, 3000)
          
          return true
        } else {
          console.log("⏳ [CHECK_PAYMENT] Pagamento ainda pendente. Status:", paymentData.status)
        }
      } else {
        try {
          const errorData = await response.json()
          console.error("❌ [CHECK_PAYMENT] Erro na API:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error,
            details: errorData.details
          })
        } catch (jsonError) {
          console.error("❌ [CHECK_PAYMENT] Erro na API (resposta não-JSON):", {
            status: response.status,
            statusText: response.statusText
          })
        }
      }
      
      return false
    } catch (error: any) {
      console.error("❌ [CHECK_PAYMENT] Erro inesperado ao verificar status:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      return false
    } finally {
      setCheckingPayment(false)
    }
  }

  // Polling para verificar status do pagamento
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    if (showPixModal && pixPaymentData && !paymentConfirmed) {
      console.log("🔄 [POLLING] Iniciando verificação de status para:", pixPaymentData.id)
      
      // Buscar informações de cobrança imediatamente
      fetchBillingInfo(pixPaymentData.id)
      
      // Verificar a cada 5 segundos (mas parar se muitos erros)
      intervalId = setInterval(async () => {
        // Se muitos erros consecutivos, pausar polling
        if (errorCount >= 3) {
          console.log("⚠️ [POLLING] Muitos erros consecutivos, pausando verificação automática")
          return
        }
        
        try {
          const confirmed = await checkPaymentStatus(pixPaymentData.id)
          setErrorCount(0) // Reset contador se sucesso
          if (confirmed && intervalId) {
            clearInterval(intervalId)
          }
        } catch (error) {
          setErrorCount(prev => prev + 1)
          console.log(`⚠️ [POLLING] Erro ${errorCount + 1}/3 na verificação`)
        }
      }, 5000)
      
      // Verificar imediatamente também
      checkPaymentStatus(pixPaymentData.id)
    }
    
    return () => {
      if (intervalId) {
        console.log("🛑 [POLLING] Parando verificação de status")
        clearInterval(intervalId)
      }
    }
  }, [showPixModal, pixPaymentData, paymentConfirmed])

  // Timer de 5 minutos para o PIX
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null
    
    if (timerActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false)
            toast({
              variant: "destructive",
              title: "Tempo esgotado",
              description: "O tempo para pagamento PIX expirou. Gere uma nova cobrança.",
            })
            setShowPixModal(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [timerActive, timeLeft])

  // Iniciar timer quando modal PIX abrir
  useEffect(() => {
    if (showPixModal && pixPaymentData && !paymentConfirmed) {
      setTimeLeft(300) // Reset para 5 minutos
      setTimerActive(true)
    } else {
      setTimerActive(false)
    }
  }, [showPixModal, pixPaymentData, paymentConfirmed])

  // Função para simular pagamento confirmado (apenas para testes)
  const simulatePaymentConfirmed = async () => {
    if (!pixPaymentData) return
    
    console.log("🧪 [SIMULATE] Simulando pagamento confirmado...")
    setCheckingPayment(true)
    
    try {
      // Tentar usar a API de simulação primeiro
      const response = await fetch(`/api/asaas/payments/${pixPaymentData.id}/simulate-confirmed`, {
        method: "POST",
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("✅ [SIMULATE] Resultado da simulação:", result)
        
        if (result.success) {
          // Verificar o status novamente após a simulação
          setTimeout(() => {
            checkPaymentStatus(pixPaymentData.id)
          }, 1000)
          
          toast({
            title: "🧪 Simulação Executada!",
            description: result.message,
          })
        } else {
          throw new Error(result.error || "Erro na simulação")
        }
      } else {
        throw new Error("Erro na API de simulação")
      }
    } catch (error) {
      console.error("❌ [SIMULATE] Erro na simulação via API:", error)
      
      // Fallback: simulação local
      console.log("🔄 [SIMULATE] Usando simulação local como fallback...")
      setPaymentConfirmed(true)
      toast({
        title: "🧪 Simulação Local: Pagamento Confirmado!",
        description: "Simulando confirmação de pagamento para teste",
      })
      
      setTimeout(() => {
        setShowPixModal(false)
        setPaymentConfirmed(false)
        setPixPaymentData(null)
        router.push("/painel-agencia")
      }, 3000)
    } finally {
      setCheckingPayment(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "cpf") {
      setFormData(prev => ({ ...prev, [field]: formatCPF(value) }))
    } else if (field === "telefone") {
      setFormData(prev => ({ ...prev, [field]: formatPhone(value) }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="lg:bg-white lg:border-b fixed lg:relative top-0 left-0 right-0 z-50 lg:z-auto bg-white/80 backdrop-blur-md lg:bg-white lg:backdrop-blur-none border-b lg:border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4 lg:justify-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold lg:text-2xl">Planos de Assinatura</h1>
            </div>
          </div>
        </div>

        {/* Mobile spacer */}
        <div className="h-16 lg:hidden" />

        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
          {/* Alert for pending payments */}
          {hasPendingPayments && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-medium text-red-800">Cobranças pendentes encontradas</h3>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Você possui cobranças pendentes. Quite suas pendências antes de criar uma nova cobrança.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/perfil")}
                className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
              >
                Ver Minhas Cobranças
              </Button>
            </div>
          )}

          {/* Header Content */}
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Escolha o melhor plano para você</h2>
            <p className="text-gray-600 text-base lg:text-lg">Todos os planos incluem acesso completo à plataforma</p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? "ring-2 ring-orange-500 shadow-lg" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1">
                    MAIS POPULAR
                  </Badge>
                )}

                <CardContent className="p-4 lg:p-5 h-full flex flex-col">
                  <div className="text-center mb-4 lg:mb-5">
                    <h3
                      className={`text-lg lg:text-xl font-bold mb-2 ${
                        plan.popular ? "text-orange-600" : "text-blue-600"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                        R$ {plan.price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-gray-600 text-sm">/mês</span>
                    </div>
                    {plan.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        R$ {plan.originalPrice.toFixed(2).replace(".", ",")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm lg:text-base text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading && selectedPlan === plan.id || hasPendingPayments || checkingPendingPayments}
                    variant={hasPendingPayments ? "destructive" : plan.buttonVariant}
                    className={`w-full py-2 lg:py-3 ${
                      hasPendingPayments
                        ? "bg-red-500 hover:bg-red-600 text-white cursor-not-allowed"
                        : plan.popular
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : plan.buttonVariant === "outline"
                          ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                          : ""
                    }`}
                  >
                    {checkingPendingPayments ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : hasPendingPayments ? (
                      "Quite suas pendências primeiro"
                    ) : isLoading && selectedPlan === plan.id ? (
                      "Carregando..."
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Método de Pagamento */}
      <Dialog open={showPaymentMethodModal} onOpenChange={setShowPaymentMethodModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Escolha a forma de pagamento
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Como você gostaria de pagar pelo plano {plans.find(p => p.id === selectedPlan)?.name}?
            </p>

                         {/* Formulário para PIX */}
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <h4 className="font-medium text-sm">Dados para pagamento:</h4>
                 {loadingUserData && (
                   <div className="flex items-center gap-1 text-xs text-gray-500">
                     <Loader2 className="h-3 w-3 animate-spin" />
                     Carregando dados...
                   </div>
                 )}
               </div>
               
               <div>
                 <Label htmlFor="nomeCompleto">Nome Completo</Label>
                 <Input
                   id="nomeCompleto"
                   type="text"
                   placeholder={loadingUserData ? "Carregando..." : "Seu nome completo"}
                   value={formData.nomeCompleto}
                   onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                   disabled={loadingUserData}
                 />
               </div>

               <div>
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   placeholder={loadingUserData ? "Carregando..." : "seu@email.com"}
                   value={formData.email}
                   onChange={(e) => handleInputChange("email", e.target.value)}
                   disabled={loadingUserData}
                 />
               </div>

               <div>
                 <Label htmlFor="cpf">CPF</Label>
                 <Input
                   id="cpf"
                   type="text"
                   placeholder={loadingUserData ? "Carregando..." : "000.000.000-00"}
                   value={formData.cpf}
                   onChange={(e) => handleInputChange("cpf", e.target.value)}
                   maxLength={14}
                   disabled={loadingUserData}
                 />
               </div>

               <div>
                 <Label htmlFor="telefone">Telefone</Label>
                 <Input
                   id="telefone"
                   type="text"
                                           placeholder={loadingUserData ? "Carregando..." : "(73) 99999-9999"}
                   value={formData.telefone}
                   onChange={(e) => handleInputChange("telefone", e.target.value)}
                   maxLength={15}
                   disabled={loadingUserData}
                 />
               </div>

               {!loadingUserData && formData.nomeCompleto && (
                 <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                   <p className="text-xs text-green-700 flex items-center gap-1">
                     <Check className="h-3 w-3" />
                     Dados carregados automaticamente do seu perfil
                   </p>
                 </div>
               )}
             </div>

                         <div className="flex flex-col gap-2">
               <Button 
                 onClick={handlePixPayment}
                 disabled={loading || isLoading || loadingUserData || hasPendingPayments}
                 className={`w-full ${hasPendingPayments ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
               >
                 {loadingUserData ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Carregando dados...
                   </>
                 ) : hasPendingPayments ? (
                   <>
                     <AlertCircle className="h-4 w-4 mr-2" />
                     Quite suas pendências primeiro
                   </>
                 ) : loading || isLoading ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Gerando PIX...
                   </>
                 ) : (
                   <>
                     <QrCode className="h-4 w-4 mr-2" />
                     Pagar com PIX
                   </>
                 )}
               </Button>
              
              <Button 
                onClick={() => handleOtherPaymentMethods(selectedPlan!)}
                variant="outline"
                disabled={hasPendingPayments}
                className={`w-full ${hasPendingPayments ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FileText className="h-4 w-4 mr-2" />
                {hasPendingPayments ? 'Indisponível - Pendências' : 'Outras formas de pagamento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal do PIX */}
      <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {paymentConfirmed ? (
                <>
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  Pagamento Confirmado!
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5" />
                  Pagamento PIX
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {paymentConfirmed ? (
            <div className="text-center py-6">
              <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                Pagamento Processado com Sucesso!
              </h3>
              <p className="text-gray-600 mb-4">
                Seu plano foi ativado. Redirecionando para o painel da agência...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecionando...
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header com logo/identidade */}
              <div className="text-center border-b pb-4">
                <div className="text-blue-600 font-bold text-lg mb-2">RX Veículos</div>
                <p className="text-gray-600 text-sm">
                  Finalize seu pagamento de forma segura
                </p>
              </div>

              {/* Valor destacado */}
              {pixPaymentData && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Valor a pagar</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrice(pixPaymentData.value || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Pagamento PIX</p>
                </div>
              )}

              {/* QR Code ou Loading */}
              <div className="text-center">
                {pixPaymentData?.qrCode || pixPaymentData?.pixTransaction?.qrCode?.encodedImage ? (
                  <div className="space-y-3 animate-in fade-in-50 duration-500">
                    <div className="bg-white p-6 rounded-xl border-2 border-blue-100 inline-block shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <Image
                        src={`data:image/png;base64,${pixPaymentData.qrCode || pixPaymentData.pixTransaction?.qrCode?.encodedImage}`}
                        alt="QR Code PIX"
                        width={220}
                        height={220}
                        className="mx-auto transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      📱 Escaneie o QR Code com seu banco
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-xl border-2 border-dashed border-gray-300">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Gerando QR Code PIX...</p>
                    <p className="text-xs text-gray-500 mt-1">Aguarde alguns segundos</p>
                  </div>
                )}
              </div>

              {/* Código PIX */}
              {(pixPaymentData?.copyAndPaste || pixPaymentData?.pixTransaction?.qrCode?.payload) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Ou copie o código PIX:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={pixPaymentData.copyAndPaste || pixPaymentData.pixTransaction?.qrCode?.payload || ''}
                      readOnly
                      className="text-xs font-mono bg-gray-50 border-gray-300"
                    />
                    <Button
                      size="sm"
                      onClick={handleCopyPixCode}
                      className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Cole este código no seu aplicativo do banco
                  </p>
                </div>
              )}

              {/* Timer do PIX */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-lg font-bold text-orange-700">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-center text-sm text-orange-600">
                  {timeLeft <= 60 ? "⚠️ PIX expira em breve!" : "Tempo restante para pagamento"}
                </p>
              </div>

              {/* Status de verificação */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 justify-center mb-2">
                  {checkingPayment ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">Verificando pagamento...</span>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-700">Aguardando pagamento</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-blue-600 text-center">
                  Assim que você pagar, será redirecionado automaticamente
                </p>
              </div>

              {/* Instruções */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <h4 className="font-medium text-gray-800 mb-2">Como pagar:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Abra o app do seu banco</li>
                  <li>• Escolha a opção PIX</li>
                  <li>• Escaneie o QR Code ou cole o código</li>
                  <li>• Confirme o pagamento</li>
                </ul>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowPixModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                
                {/* Botão de teste para desenvolvimento */}
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={simulatePaymentConfirmed}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    🧪 Simular Pagamento
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
