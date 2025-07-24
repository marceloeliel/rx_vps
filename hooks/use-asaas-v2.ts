import { useState } from 'react'
import { AsaasCustomer, PixPaymentResponse } from '@/lib/asaas/types'

interface CreateCustomerData {
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
}

interface CreatePixPaymentData {
  customer: string
  value: number
  dueDate: string
  description?: string
  externalReference?: string
}

interface PaymentStatus {
  id: string
  status: string
  value: number
  dueDate: string
  description?: string
  paymentDate?: string
  pixTransaction?: {
    qrCode?: {
      encodedImage?: string
      payload?: string
    }
    txid?: string
    expirationDate?: string
  }
}

export function useAsaasV2() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar ou criar customer (evita duplicatas por CPF/CNPJ)
  const createCustomer = async (customerData: CreateCustomerData): Promise<AsaasCustomer | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log('📞 [HOOK] Chamando API para buscar/criar customer com CPF/CNPJ:', customerData.cpfCnpj)
      
      const response = await fetch('/api/asaas-v2/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao processar customer')
      }

      console.log('✅ [HOOK] Customer processado:', result.data.id, '-', result.data.name)
      return result.data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Criar cobrança PIX
  const createPixPayment = async (paymentData: CreatePixPaymentData): Promise<PixPaymentResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/asaas-v2/payments/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar cobrança PIX')
      }

      return result.data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Verificar status do pagamento
  const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/asaas-v2/payments/${paymentId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao verificar status do pagamento')
      }

      return result.data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Função utilitária para criar customer e cobrança em uma operação
  const createCustomerAndPixPayment = async (
    customerData: CreateCustomerData,
    paymentData: Omit<CreatePixPaymentData, 'customer'>
  ): Promise<{
    customer: AsaasCustomer | null
    payment: PixPaymentResponse | null
  }> => {
    // 1. Criar customer
    const customer = await createCustomer(customerData)
    
    if (!customer) {
      return { customer: null, payment: null }
    }

    // 2. Criar cobrança PIX
    const payment = await createPixPayment({
      ...paymentData,
      customer: customer.id!
    })

    return { customer, payment }
  }

  // Função para copiar código PIX
  const copyPixCode = async (pixCode: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(pixCode)
      return true
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err)
      return false
    }
  }

  // Função para formatar valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return {
    loading,
    error,
    createCustomer,
    createPixPayment,
    getPaymentStatus,
    createCustomerAndPixPayment,
    copyPixCode,
    formatCurrency,
    formatDate,
  }
} 