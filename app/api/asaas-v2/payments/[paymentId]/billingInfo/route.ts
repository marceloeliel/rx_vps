import { NextRequest, NextResponse } from 'next/server'
import { asaasClient } from '@/lib/asaas/client'

// GET - Buscar informações de cobrança
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params
    
    console.log('🔍 [ASAAS-V2-BILLING] Buscando informações de cobrança para pagamento:', paymentId)
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar informações de cobrança no Asaas usando o cliente configurado
    const billingData = await asaasClient.getPaymentBillingInfo(paymentId)
    
    console.log('✅ [ASAAS-V2-BILLING] Informações de cobrança carregadas:', {
      hasPix: !!billingData.pix,
      hasQrCode: !!(billingData.pix?.encodedImage),
      hasPayload: !!(billingData.pix?.payload),
      expirationDate: billingData.pix?.expirationDate
    })

    // Estruturar resposta padronizada
    let pixData = null
    if (billingData.pix) {
      pixData = {
        qrCode: billingData.pix.encodedImage || null,
        copyAndPaste: billingData.pix.payload || null,
        expirationDate: billingData.pix.expirationDate || null
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        pixData: pixData,
        creditCard: billingData.creditCard || null,
        bankSlip: billingData.bankSlip || null
      }
    })

  } catch (error: any) {
    console.error('❌ [ASAAS-V2-BILLING] Erro ao buscar informações de cobrança:', error.message)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        success: false
      },
      { status: 500 }
    )
  }
} 