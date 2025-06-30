// Configuração da API do Asaas - PRODUÇÃO
const ASAAS_API_URL = 'https://api.asaas.com/v3'

const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj'

// Tipos para a API do Asaas
export interface AsaasCustomer {
  id?: string
  name: string
  email: string
  phone?: string
  mobilePhone?: string
  cpfCnpj: string
  postalCode?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  city?: string
  state?: string
  country?: string
  externalReference?: string
  notificationDisabled?: boolean
  additionalEmails?: string
  municipalInscription?: string
  stateInscription?: string
  observations?: string
}

export interface AsaasPayment {
  id?: string
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'TRANSFER' | 'DEBIT_CARD'
  value: number
  dueDate: string
  description?: string
  externalReference?: string
  installmentCount?: number
  installmentValue?: number
  discount?: {
    value: number
    dueDateLimitDays: number
    type: 'FIXED' | 'PERCENTAGE'
  }
  interest?: {
    value: number
    type: 'PERCENTAGE'
  }
  fine?: {
    value: number
    type: 'PERCENTAGE'
  }
  postalService?: boolean
  split?: Array<{
    walletId: string
    fixedValue?: number
    percentualValue?: number
    totalValue?: number
  }>
  callback?: {
    successUrl?: string
    autoRedirect?: boolean
  }
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
    addressComplement?: string
    phone: string
    mobilePhone?: string
  }
  creditCardToken?: string
  remoteIp?: string
}

export interface AsaasSubscription {
  id?: string
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  nextDueDate: string
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  description?: string
  endDate?: string
  maxPayments?: number
  externalReference?: string
  split?: Array<{
    walletId: string
    fixedValue?: number
    percentualValue?: number
    totalValue?: number
  }>
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
    addressComplement?: string
    phone: string
    mobilePhone?: string
  }
  creditCardToken?: string
  discount?: {
    value: number
    dueDateLimitDays: number
    type: 'FIXED' | 'PERCENTAGE'
  }
  interest?: {
    value: number
    type: 'PERCENTAGE'
  }
  fine?: {
    value: number
    type: 'PERCENTAGE'
  }
}

export interface AsaasPixQrCode {
  id?: string
  customer: string
  value: number
  dueDate: string
  description?: string
  externalReference?: string
  allowsMultiplePayments?: boolean
  expirationDate?: string
}

// Função para fazer chamadas à API do Asaas
async function asaasRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${ASAAS_API_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Asaas API Error: ${response.status} - ${errorData.message || response.statusText}`)
  }

  return response.json()
}

// Funções para Clientes
export async function createAsaasCustomer(customer: AsaasCustomer): Promise<AsaasCustomer> {
  return asaasRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  })
}

export async function getAsaasCustomer(customerId: string): Promise<AsaasCustomer> {
  return asaasRequest(`/customers/${customerId}`)
}

export async function updateAsaasCustomer(customerId: string, customer: Partial<AsaasCustomer>): Promise<AsaasCustomer> {
  return asaasRequest(`/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(customer),
  })
}

export async function listAsaasCustomers(params?: {
  name?: string
  email?: string
  cpfCnpj?: string
  externalReference?: string
  offset?: number
  limit?: number
}): Promise<{ data: AsaasCustomer[]; hasMore: boolean; totalCount: number; limit: number; offset: number }> {
  const searchParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
  }

  const query = searchParams.toString()
  return asaasRequest(`/customers${query ? `?${query}` : ''}`)
}

// Funções para Pagamentos
export async function createAsaasPayment(payment: AsaasPayment): Promise<AsaasPayment> {
  return asaasRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(payment),
  })
}

export async function getAsaasPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasRequest(`/payments/${paymentId}`)
}

export async function updateAsaasPayment(paymentId: string, payment: Partial<AsaasPayment>): Promise<AsaasPayment> {
  return asaasRequest(`/payments/${paymentId}`, {
    method: 'PUT',
    body: JSON.stringify(payment),
  })
}

export async function deleteAsaasPayment(paymentId: string): Promise<void> {
  return asaasRequest(`/payments/${paymentId}`, {
    method: 'DELETE',
  })
}

export async function listAsaasPayments(params?: {
  customer?: string
  billingType?: string
  status?: string
  subscription?: string
  installment?: string
  externalReference?: string
  paymentDate?: string
  estimatedCreditDate?: string
  pixQrCodeId?: string
  anticipated?: boolean
  dateCreated?: string
  offset?: number
  limit?: number
}): Promise<{ data: AsaasPayment[]; hasMore: boolean; totalCount: number; limit: number; offset: number }> {
  const searchParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
  }

  const query = searchParams.toString()
  return asaasRequest(`/payments${query ? `?${query}` : ''}`)
}

// Funções para Assinaturas
export async function createAsaasSubscription(subscription: AsaasSubscription): Promise<AsaasSubscription> {
  return asaasRequest('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscription),
  })
}

export async function getAsaasSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return asaasRequest(`/subscriptions/${subscriptionId}`)
}

export async function updateAsaasSubscription(subscriptionId: string, subscription: Partial<AsaasSubscription>): Promise<AsaasSubscription> {
  return asaasRequest(`/subscriptions/${subscriptionId}`, {
    method: 'PUT',
    body: JSON.stringify(subscription),
  })
}

export async function deleteAsaasSubscription(subscriptionId: string): Promise<void> {
  return asaasRequest(`/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
  })
}

export async function listAsaasSubscriptions(params?: {
  customer?: string
  billingType?: string
  status?: string
  externalReference?: string
  order?: string
  sort?: string
  offset?: number
  limit?: number
}): Promise<{ data: AsaasSubscription[]; hasMore: boolean; totalCount: number; limit: number; offset: number }> {
  const searchParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
  }

  const query = searchParams.toString()
  return asaasRequest(`/subscriptions${query ? `?${query}` : ''}`)
}

// Funções para PIX
export async function createAsaasPixQrCode(pixData: AsaasPixQrCode): Promise<any> {
  return asaasRequest('/pix/qrCodes/static', {
    method: 'POST',
    body: JSON.stringify(pixData),
  })
}

export async function getAsaasPixQrCode(qrCodeId: string): Promise<any> {
  return asaasRequest(`/pix/qrCodes/${qrCodeId}`)
}

export async function deleteAsaasPixQrCode(qrCodeId: string): Promise<void> {
  return asaasRequest(`/pix/qrCodes/${qrCodeId}`, {
    method: 'DELETE',
  })
}

// Funções para Webhooks
export async function createAsaasWebhook(webhook: {
  name: string
  url: string
  email: string
  apiVersion?: number
  enabled?: boolean
  interrupted?: boolean
  authToken?: string
  events: string[]
}): Promise<any> {
  return asaasRequest('/webhooks', {
    method: 'POST',
    body: JSON.stringify(webhook),
  })
}

export async function listAsaasWebhooks(): Promise<{ data: any[]; hasMore: boolean; totalCount: number; limit: number; offset: number }> {
  return asaasRequest('/webhooks')
}

export async function getAsaasWebhook(webhookId: string): Promise<any> {
  return asaasRequest(`/webhooks/${webhookId}`)
}

export async function updateAsaasWebhook(webhookId: string, webhook: Partial<{
  name: string
  url: string
  email: string
  apiVersion?: number
  enabled?: boolean
  interrupted?: boolean
  authToken?: string
  events: string[]
}>): Promise<any> {
  return asaasRequest(`/webhooks/${webhookId}`, {
    method: 'PUT',
    body: JSON.stringify(webhook),
  })
}

export async function deleteAsaasWebhook(webhookId: string): Promise<void> {
  return asaasRequest(`/webhooks/${webhookId}`, {
    method: 'DELETE',
  })
}

// Funções utilitárias
export function formatCpfCnpj(value: string): string {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length <= 11) {
    // CPF
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else {
    // CNPJ
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
}

export function validateCpfCnpj(value: string): boolean {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length === 11) {
    // Validar CPF
    return validateCpf(numbers)
  } else if (numbers.length === 14) {
    // Validar CNPJ
    return validateCnpj(numbers)
  }
  
  return false
}

function validateCpf(cpf: string): boolean {
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

function validateCnpj(cnpj: string): boolean {
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