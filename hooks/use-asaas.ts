import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

interface AsaasCustomer {
  name: string
  email: string
  cpfCnpj: string
  phone?: string
  mobilePhone?: string
  postalCode?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  city?: string
  state?: string
  userId?: string // Para salvar no Supabase
}

interface AsaasPayment {
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  dueDate: string
  description?: string
  installmentCount?: number
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode: string
    addressNumber: string
    phone: string
  }
}

interface AsaasSubscription {
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  nextDueDate: string
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  description?: string
  endDate?: string
  maxPayments?: number
  planId?: string
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode: string
    addressNumber: string
    phone: string
  }
}

export function useAsaas() {
  const [loading, setLoading] = useState(false)

  // Função para criar ou buscar customer existente
  const getOrCreateCustomer = async (customerData: AsaasCustomer) => {
    setLoading(true)
    try {
      const response = await fetch('/api/asaas/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar/buscar cliente')
      }

      const customer = await response.json()
      return { data: customer, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Função para criar cliente
  const createCustomer = async (customerData: AsaasCustomer) => {
    setLoading(true)
    try {
      console.log('🚀 [HOOK] Criando customer com dados:', customerData)
      
      // Validar CPF/CNPJ antes de enviar
      if (customerData.cpfCnpj && !validateCpfCnpj(customerData.cpfCnpj)) {
        console.error('❌ [HOOK] CPF/CNPJ inválido:', customerData.cpfCnpj)
        throw new Error('CPF/CNPJ informado é inválido')
      }
      
      console.log('✅ [HOOK] CPF/CNPJ válido, enviando para API...')
      
      const response = await fetch('/api/asaas/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ [HOOK] Erro da API:', errorData)
        throw new Error(errorData.error || 'Erro ao criar cliente')
      }

      const customer = await response.json()
      console.log('✅ [HOOK] Customer criado:', customer)
      
      toast({
        title: 'Sucesso!',
        description: 'Cliente criado com sucesso',
      })

      return { data: customer, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('❌ [HOOK] Erro:', errorMessage)
      
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: errorMessage,
      })

      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Função para criar pagamento
  const createPayment = async (paymentData: AsaasPayment & { saveToDatabase?: boolean }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/asaas/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pagamento')
      }

      const payment = await response.json()
      
      toast({
        title: 'Sucesso!',
        description: 'Pagamento criado com sucesso',
      })

      return { data: payment, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: errorMessage,
      })

      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Função para criar assinatura
  const createSubscription = async (subscriptionData: AsaasSubscription & { saveToDatabase?: boolean }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/asaas/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar assinatura')
      }

      const subscription = await response.json()
      
      toast({
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso',
      })

      return { data: subscription, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: errorMessage,
      })

      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Função para criar pagamento PIX
  const createPixPayment = async (
    customerId: string,
    value: number,
    description: string,
    dueDate?: string
  ) => {
    const pixData = {
      customer: customerId,
      billingType: 'PIX' as const,
      value,
      description,
      dueDate: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24 horas
      saveToDatabase: true,
    }

    return createPayment(pixData)
  }

  // Função para criar pagamento com cartão
  const createCreditCardPayment = async (
    customerId: string,
    value: number,
    description: string,
    creditCardData: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    },
    holderInfo: {
      name: string
      email: string
      cpfCnpj: string
      postalCode: string
      addressNumber: string
      phone: string
    },
    installments: number = 1
  ) => {
    const paymentData = {
      customer: customerId,
      billingType: 'CREDIT_CARD' as const,
      value,
      description,
      dueDate: new Date().toISOString().split('T')[0],
      installmentCount: installments > 1 ? installments : undefined,
      installmentValue: installments > 1 ? value / installments : undefined,
      creditCard: creditCardData,
      creditCardHolderInfo: holderInfo,
      saveToDatabase: true,
    }

    return createPayment(paymentData)
  }

  // Função para criar pagamento com boleto
  const createBoletoPayment = async (
    customerId: string,
    value: number,
    description: string,
    dueDate: string
  ) => {
    const boletoData = {
      customer: customerId,
      billingType: 'BOLETO' as const,
      value,
      description,
      dueDate,
      saveToDatabase: true,
    }

    return createPayment(boletoData)
  }

  // Função para criar assinatura mensal
  const createMonthlySubscription = async (
    customerId: string,
    value: number,
    description: string,
    planId: string,
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' = 'CREDIT_CARD',
    creditCardData?: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    },
    holderInfo?: {
      name: string
      email: string
      cpfCnpj: string
      postalCode: string
      addressNumber: string
      phone: string
    }
  ) => {
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 1) // Primeiro vencimento amanhã

    const subscriptionData = {
      customer: customerId,
      billingType,
      value,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY' as const,
      description,
      planId,
      creditCard: creditCardData,
      creditCardHolderInfo: holderInfo,
      saveToDatabase: true,
    }

    return createSubscription(subscriptionData)
  }

  // Função para criar assinatura anual
  const createYearlySubscription = async (
    customerId: string,
    value: number,
    description: string,
    planId: string,
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' = 'CREDIT_CARD',
    creditCardData?: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    },
    holderInfo?: {
      name: string
      email: string
      cpfCnpj: string
      postalCode: string
      addressNumber: string
      phone: string
    }
  ) => {
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 1) // Primeiro vencimento amanhã

    const subscriptionData = {
      customer: customerId,
      billingType,
      value,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'YEARLY' as const,
      description,
      planId,
      creditCard: creditCardData,
      creditCardHolderInfo: holderInfo,
      saveToDatabase: true,
    }

    return createSubscription(subscriptionData)
  }

  // Função para listar pagamentos
  const listPayments = async (filters?: {
    customer?: string
    status?: string
    billingType?: string
  }) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
      }

      const response = await fetch(`/api/asaas/payments?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao listar pagamentos')
      }

      const payments = await response.json()
      return { data: payments, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Funções utilitárias
  const formatCpfCnpj = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      // CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const validateCpfCnpj = (value: string): boolean => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length === 11) {
      return validateCpf(numbers)
    } else if (numbers.length === 14) {
      return validateCnpj(numbers)
    }
    
    return false
  }

  const validateCpf = (cpf: string): boolean => {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(10))) return false

    return true
  }

  const validateCnpj = (cnpj: string): boolean => {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false

    let sum = 0
    let weight = 2
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    let remainder = sum % 11
    if (remainder < 2) remainder = 0
    else remainder = 11 - remainder
    if (remainder !== parseInt(cnpj.charAt(12))) return false

    sum = 0
    weight = 2
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    remainder = sum % 11
    if (remainder < 2) remainder = 0
    else remainder = 11 - remainder
    if (remainder !== parseInt(cnpj.charAt(13))) return false

    return true
  }

  return {
    loading,
    getOrCreateCustomer,
    createCustomer,
    createPayment,
    createSubscription,
    createPixPayment,
    createCreditCardPayment,
    createBoletoPayment,
    createMonthlySubscription,
    createYearlySubscription,
    listPayments,
    formatCpfCnpj,
    validateCpfCnpj,
  }
} 