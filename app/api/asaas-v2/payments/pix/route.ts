import { NextRequest, NextResponse } from 'next/server'
import { asaasClient } from '@/lib/asaas/client'
import { CreatePixPaymentRequest } from '@/lib/asaas/types'

// POST - Criar cobrança PIX
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [ASAAS-V2] Criando cobrança PIX...')
    
    const paymentData: CreatePixPaymentRequest = await request.json()
    
    // Validações básicas
    if (!paymentData.customer || !paymentData.value || !paymentData.dueDate) {
      return NextResponse.json(
        { error: 'Customer, valor e data de vencimento são obrigatórios' },
        { status: 400 }
      )
    }

    // Garantir que é PIX
    paymentData.billingType = 'PIX'

    console.log('📝 [ASAAS-V2] Dados da cobrança PIX:', {
      customer: paymentData.customer,
      value: paymentData.value,
      dueDate: paymentData.dueDate,
      description: paymentData.description
    })

    // Criar cobrança PIX no Asaas
    const payment = await asaasClient.createPixPayment(paymentData)
    
    console.log('✅ [ASAAS-V2] Cobrança PIX criada:', payment.id)
    console.log('🔍 [ASAAS-V2] PIX Transaction:', payment.pixTransaction)
    
    // Verificar se o PIX foi gerado, se não, tentar buscar novamente
    if (!payment.pixTransaction?.qrCode) {
      console.log('⚠️ [ASAAS-V2] PIX não foi gerado na criação, tentando buscar...')
      
      try {
        // Aguardar um pouco e buscar a cobrança novamente
        await new Promise(resolve => setTimeout(resolve, 2000))
        const updatedPayment = await asaasClient.getPayment(payment.id!)
        
        if (updatedPayment.pixTransaction?.qrCode) {
          console.log('✅ [ASAAS-V2] PIX encontrado na segunda tentativa!')
          payment.pixTransaction = updatedPayment.pixTransaction
        } else {
          console.log('⚠️ [ASAAS-V2] PIX ainda não disponível, retornando link de pagamento')
          // Não retorna erro, mas sim o payment com link alternativo
        }
      } catch (retryError) {
        console.error('❌ [ASAAS-V2] Erro ao buscar PIX novamente:', retryError)
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        value: payment.value,
        dueDate: payment.dueDate,
        description: payment.description,
        pixTransaction: payment.pixTransaction,
        invoiceUrl: payment.invoiceUrl,
        paymentLink: payment.paymentLink
      }
    })

  } catch (error: any) {
    console.error('❌ [ASAAS-V2] Erro ao criar cobrança PIX:', error.message)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        success: false
      },
      { status: 500 }
    )
  }
} 