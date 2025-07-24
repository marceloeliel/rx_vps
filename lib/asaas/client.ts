import { getAsaasApiUrl, getAsaasHeaders } from './config'
import { 
  AsaasCustomer, 
  AsaasPayment, 
  AsaasApiResponse, 
  AsaasErrorResponse,
  CreatePixPaymentRequest,
  PixPaymentResponse
} from './types'

// Cliente da API do Asaas
export class AsaasClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor() {
    this.baseUrl = getAsaasApiUrl()
    this.headers = getAsaasHeaders()
  }

  // Método genérico para fazer requisições
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      const errorData = data as AsaasErrorResponse
      throw new Error(
        errorData.errors?.[0]?.description || 
        `Erro na API Asaas: ${response.status}`
      )
    }

    return data
  }

  // Buscar cliente por CPF/CNPJ
  async searchCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
    try {
      const response = await this.request<AsaasApiResponse<AsaasCustomer>>(`/customers?cpfCnpj=${cpfCnpj}`)
      
      // Se encontrou clientes, retornar o primeiro (deveria ser único)
      if (response.data && response.data.length > 0) {
        return response.data[0]
      }
      
      return null
    } catch (error) {
      console.error('Erro ao buscar cliente por CPF/CNPJ:', error)
      return null
    }
  }

  // Criar cliente
  async createCustomer(customerData: AsaasCustomer): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    })
  }

  // Buscar ou criar cliente (evita duplicatas)
  async findOrCreateCustomer(customerData: AsaasCustomer): Promise<AsaasCustomer> {
    try {
      console.log('🔍 [CUSTOMER] Verificando se cliente já existe com CPF/CNPJ:', customerData.cpfCnpj)
      
      // Primeiro, verificar se cliente já existe
      const existingCustomer = await this.searchCustomerByCpfCnpj(customerData.cpfCnpj)
      
      if (existingCustomer) {
        console.log('✅ [CUSTOMER] Cliente já existe:', existingCustomer.id, '-', existingCustomer.name)
        return existingCustomer
      }
      
      // Cliente não existe, criar novo
      console.log('➕ [CUSTOMER] Cliente não existe, criando novo...')
      const newCustomer = await this.createCustomer(customerData)
      console.log('✅ [CUSTOMER] Novo cliente criado:', newCustomer.id, '-', newCustomer.name)
      
      return newCustomer
    } catch (error: any) {
      console.error('❌ [CUSTOMER] Erro ao buscar/criar cliente:', error.message)
      throw error
    }
  }

  // Buscar cliente por ID
  async getCustomer(customerId: string): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>(`/customers/${customerId}`)
  }

  // Listar clientes
  async listCustomers(params?: {
    limit?: number
    offset?: number
    name?: string
    email?: string
    cpfCnpj?: string
  }): Promise<AsaasApiResponse<AsaasCustomer>> {
    const searchParams = new URLSearchParams()
    
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    if (params?.name) searchParams.append('name', params.name)
    if (params?.email) searchParams.append('email', params.email)
    if (params?.cpfCnpj) searchParams.append('cpfCnpj', params.cpfCnpj)

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/customers?${queryString}` : '/customers'

    return this.request<AsaasApiResponse<AsaasCustomer>>(endpoint)
  }

  // Criar cobrança PIX
  async createPixPayment(paymentData: CreatePixPaymentRequest): Promise<PixPaymentResponse> {
    return this.request<PixPaymentResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  // Buscar cobrança por ID
  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${paymentId}`)
  }

  // Buscar informações de cobrança (billing info)
  async getPaymentBillingInfo(paymentId: string): Promise<{
    pix?: {
      encodedImage?: string
      payload?: string
      expirationDate?: string
    }
    creditCard?: any
    bankSlip?: any
  }> {
    return this.request<{
      pix?: {
        encodedImage?: string
        payload?: string
        expirationDate?: string
      }
      creditCard?: any
      bankSlip?: any
    }>(`/payments/${paymentId}/billingInfo`)
  }

  // Listar cobranças
  async listPayments(params?: {
    limit?: number
    offset?: number
    customer?: string
    status?: string
    billingType?: string
  }): Promise<AsaasApiResponse<AsaasPayment>> {
    const searchParams = new URLSearchParams()
    
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    if (params?.customer) searchParams.append('customer', params.customer)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.billingType) searchParams.append('billingType', params.billingType)

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/payments?${queryString}` : '/payments'

    return this.request<AsaasApiResponse<AsaasPayment>>(endpoint)
  }

  // Verificar status de cobrança PIX
  async getPixPaymentStatus(paymentId: string): Promise<{
    status: string
    pixTransaction?: {
      qrCode?: {
        encodedImage?: string
        payload?: string
      }
      txid?: string
      expirationDate?: string
    }
  }> {
    const payment = await this.getPayment(paymentId)
    return {
      status: payment.status || 'PENDING',
      pixTransaction: payment.pixTransaction
    }
  }
}

// Instância única do cliente
export const asaasClient = new AsaasClient() 