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
  
    console.log('🔍 [PAYMENT-STATUS] Verificando status do pagamento:', paymentId)
  
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar pagamento no Asaas
    const response = await fetch(`${ASAAS_BASE_URL}/v3/payments/${paymentId}`, {
      headers: {
        access_token: ASAAS_API_KEY,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      let errorData: any = {}
      try {
        const responseText = await response.text()
        console.log("📄 [PAYMENT-STATUS] Resposta de erro:", responseText)
        errorData = JSON.parse(responseText)
      } catch (e) {
        console.error("❌ [PAYMENT-STATUS] Resposta não é JSON válido")
        errorData = { message: `Erro ${response.status}: ${response.statusText}` }
      }
      
      console.error("❌ [PAYMENT-STATUS] Erro da API Asaas:", errorData)
      
      return NextResponse.json(
        { 
          error: errorData.errors?.[0]?.description || errorData.message || "Erro ao buscar pagamento",
          status: response.status
        },
        { status: response.status }
      )
    }

    const payment = await response.json()
    
    console.log('✅ [PAYMENT-STATUS] Status do pagamento:', {
      id: payment.id,
      status: payment.status,
      value: payment.value,
      billingType: payment.billingType,
      hasPixTransaction: !!payment.pixTransaction
    })

    // Se for PIX, incluir dados do QR code
    let pixData = null
    if (payment.billingType === 'PIX' && payment.pixTransaction) {
      pixData = {
        qrCode: payment.pixTransaction.qrCode?.encodedImage || null,
        copyAndPaste: payment.pixTransaction.qrCode?.payload || null,
        expirationDate: payment.pixTransaction.expirationDate || null
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
        paymentDate: payment.paymentDate,
        confirmedDate: payment.confirmedDate,
        billingType: payment.billingType,
        invoiceUrl: payment.invoiceUrl,
        paymentLink: payment.paymentLink,
        netValue: payment.netValue,
        creditDate: payment.creditDate,
        pixData: pixData
      }
    })

  } catch (error: any) {
    console.error('❌ [PAYMENT-STATUS] Erro ao buscar pagamento:', error.message)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        success: false
      },
      { status: 500 }
    )
  }
} 