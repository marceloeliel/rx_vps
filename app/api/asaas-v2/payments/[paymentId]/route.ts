import { NextRequest, NextResponse } from 'next/server'
import { asaasClient } from '@/lib/asaas/client'

// GET - Buscar status do pagamento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params
    
    console.log('🔍 [ASAAS-V2] Verificando status do pagamento:', paymentId)
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar configuração da API
    console.log('🔧 [ASAAS-V2] Configuração da API:', {
      baseUrl: process.env.ASAAS_BASE_URL || 'sandbox',
      hasApiKey: !!(process.env.ASAAS_API_KEY)
    })

    // Buscar pagamento no Asaas
    console.log('📡 [ASAAS-V2] Fazendo requisição para API externa...')
    const payment = await asaasClient.getPayment(paymentId)
    console.log('📋 [ASAAS-V2] Resposta recebida da API externa')
    
    console.log('✅ [ASAAS-V2] Status do pagamento:', {
      id: payment.id,
      status: payment.status,
      value: payment.value
    })
    
    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        value: payment.value,
        dueDate: payment.dueDate,
        description: payment.description,
        paymentDate: payment.paymentDate,
        pixTransaction: payment.pixTransaction,
        invoiceUrl: payment.invoiceUrl,
        paymentLink: payment.paymentLink,
        netValue: payment.netValue,
        creditDate: payment.creditDate
      }
    })

  } catch (error: any) {
    console.error('❌ [ASAAS-V2] Erro completo:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    
    // Verificar se é erro de rede, autenticação ou API
    let errorMessage = 'Erro interno do servidor'
    let statusCode = 500
    
    if (error.message?.includes('fetch')) {
      errorMessage = 'Erro de conexão com API externa'
      statusCode = 502
    } else if (error.message?.includes('401')) {
      errorMessage = 'Erro de autenticação na API'
      statusCode = 401
    } else if (error.message?.includes('404')) {
      errorMessage = 'Pagamento não encontrado'
      statusCode = 404
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        success: false
      },
      { status: statusCode }
    )
  }
} 