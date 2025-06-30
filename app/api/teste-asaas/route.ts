import { NextRequest, NextResponse } from 'next/server'

const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj'
const ASAAS_BASE_URL = 'https://api.asaas.com/v3'

export async function GET() {
  try {
    console.log('🔍 Testando conexão com Asaas...')
    
    const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'GET',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    console.log('📊 Resposta Asaas:', {
      status: response.status,
      ok: response.ok,
      data: data
    })

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: data,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Erro ao testar Asaas:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('🚀 Criando pagamento PIX no Asaas...')
    
    // 1. Criar cliente
    const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "Cliente Teste PIX",
        email: "teste.pix@email.com",
        cpfCnpj: "24971563792"
      })
    })

    const customer = await customerResponse.json()
    console.log('👤 Cliente criado:', customer)

    if (!customerResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar cliente: ' + JSON.stringify(customer),
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // 2. Criar pagamento PIX
    const paymentData = {
      customer: customer.id,
      billingType: "PIX",
      value: 25.00,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: "TESTE PIX - Pagamento via API Route"
    }

    console.log('💳 Dados do pagamento:', paymentData)

    const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    const payment = await paymentResponse.json()
    console.log('💰 Pagamento criado:', payment)
    
    return NextResponse.json({
      success: paymentResponse.ok,
      status: paymentResponse.status,
      data: { customer, payment },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar pagamento:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 