import { NextRequest, NextResponse } from 'next/server'

// Usar a chave da API do .env
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjZmNTBmZTU4LWViYzMtNGMxYi05NzM2LTI2NjIxNzc4ZTU4MDo6JGFhY2hfNmQ3NmIyNTUtODhmYy00MzM4LWFiMzQtZDExYzdlZmNlM2Ux"
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || "https://api.asaas.com"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params
    
    console.log('🔍 [BILLING-INFO] Buscando informações de cobrança para pagamento:', paymentId)
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar informações de cobrança no Asaas
    const response = await fetch(`${ASAAS_BASE_URL}/v3/payments/${paymentId}/billingInfo`, {
      headers: {
        access_token: ASAAS_API_KEY,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      let errorData: any = {}
      try {
        const responseText = await response.text()
        console.log("📄 [BILLING-INFO] Resposta de erro:", responseText)
        errorData = JSON.parse(responseText)
      } catch (e) {
        console.error("❌ [BILLING-INFO] Resposta não é JSON válido")
        errorData = { message: `Erro ${response.status}: ${response.statusText}` }
      }
      
      console.error("❌ [BILLING-INFO] Erro da API Asaas:", errorData)
      
      return NextResponse.json(
        { 
          error: errorData.errors?.[0]?.description || errorData.message || "Erro ao buscar informações de cobrança",
          status: response.status
        },
        { status: response.status }
      )
    }

    const billingData = await response.json()
    
    console.log('✅ [BILLING-INFO] Informações de cobrança carregadas:', {
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
    console.error('❌ [BILLING-INFO] Erro ao buscar informações de cobrança:', error.message)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        success: false
      },
      { status: 500 }
    )
  }
} 