import { NextRequest, NextResponse } from 'next/server'
import { asaasClient } from '@/lib/asaas/client'
import { AsaasCustomer } from '@/lib/asaas/types'

// POST - Criar cliente
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [ASAAS-V2] Criando customer...')
    
    const customerData: AsaasCustomer = await request.json()
    
    // Validações básicas
    if (!customerData.name || !customerData.email || !customerData.cpfCnpj) {
      return NextResponse.json(
        { error: 'Nome, email e CPF/CNPJ são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('📝 [ASAAS-V2] Dados do customer:', {
      name: customerData.name,
      email: customerData.email,
      cpfCnpj: customerData.cpfCnpj
    })

    // Verificar se cliente existe ou criar novo (evita duplicatas)
    const customer = await asaasClient.findOrCreateCustomer(customerData)
    
    console.log('✅ [ASAAS-V2] Customer processado:', customer.id)
    
    return NextResponse.json({
      success: true,
      data: customer
    })

  } catch (error: any) {
    console.error('❌ [ASAAS-V2] Erro ao criar customer:', error.message)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        success: false
      },
      { status: 500 }
    )
  }
}

// GET - Listar clientes
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ASAAS-V2] Listando customers...')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const name = searchParams.get('name') || undefined
    const email = searchParams.get('email') || undefined
    const cpfCnpj = searchParams.get('cpfCnpj') || undefined

    const response = await asaasClient.listCustomers({
      limit,
      offset,
      name,
      email,
      cpfCnpj
    })
    
    console.log('✅ [ASAAS-V2] Customers encontrados:', response.totalCount || 0)
    
    return NextResponse.json({
      success: true,
      data: response.data || [],
      totalCount: response.totalCount || 0,
      hasMore: response.hasMore || false
    })

  } catch (error: any) {
    console.error('❌ [ASAAS-V2] Erro ao listar customers:', error.message)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        success: false
      },
      { status: 500 }
    )
  }
} 