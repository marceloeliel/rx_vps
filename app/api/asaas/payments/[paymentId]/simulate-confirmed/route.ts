import { NextRequest, NextResponse } from "next/server"

const ASAAS_API_KEY = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj"
const ASAAS_API_URL = "https://api.asaas.com/v3"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  // Só permitir em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: "Esta funcionalidade só está disponível em desenvolvimento" },
      { status: 403 }
    )
  }

  const { paymentId } = await params
  
  console.log("🧪 [SIMULATE_CONFIRMED] Simulando confirmação do pagamento:", paymentId)
  
  try {
    if (!ASAAS_API_KEY) {
      return NextResponse.json(
        { error: "ASAAS_API_KEY não configurada" },
        { status: 500 }
      )
    }

    // No sandbox do ASAAS, podemos usar a API de confirmação manual
    console.log("🌐 [SIMULATE_CONFIRMED] Tentando confirmar pagamento via API ASAAS...")
    
    // Primeiro, vamos tentar buscar o pagamento para ver seu status atual
    const getResponse = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY,
      },
    })

    if (!getResponse.ok) {
      const error = await getResponse.json()
      console.error("❌ [SIMULATE_CONFIRMED] Erro ao buscar pagamento:", error)
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      )
    }

    const paymentData = await getResponse.json()
    console.log("📋 [SIMULATE_CONFIRMED] Status atual do pagamento:", paymentData.status)

    // Se já está confirmado, não precisa fazer nada
    if (paymentData.status === 'RECEIVED' || paymentData.status === 'CONFIRMED') {
      console.log("✅ [SIMULATE_CONFIRMED] Pagamento já está confirmado")
      return NextResponse.json({
        success: true,
        message: "Pagamento já está confirmado",
        status: paymentData.status
      })
    }

    // Para PIX no sandbox, podemos tentar usar a API de simulação
    if (paymentData.billingType === 'PIX') {
      console.log("💳 [SIMULATE_CONFIRMED] Tentando simular confirmação PIX...")
      
      // No sandbox do ASAAS, existe uma API para simular confirmação de PIX
      const confirmResponse = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/receiveInCash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": ASAAS_API_KEY,
        },
        body: JSON.stringify({
          paymentDate: new Date().toISOString().split('T')[0],
          value: paymentData.value,
          notifyCustomer: false
        })
      })

      if (confirmResponse.ok) {
        const confirmedData = await confirmResponse.json()
        console.log("✅ [SIMULATE_CONFIRMED] Pagamento confirmado com sucesso:", confirmedData.status)
        
        return NextResponse.json({
          success: true,
          message: "Pagamento confirmado com sucesso",
          status: confirmedData.status,
          data: confirmedData
        })
      } else {
        const error = await confirmResponse.json()
        console.error("❌ [SIMULATE_CONFIRMED] Erro ao confirmar pagamento:", error)
        
        // Se a API de confirmação não funcionar, vamos retornar um mock
        console.log("🔄 [SIMULATE_CONFIRMED] API de confirmação falhou, retornando mock...")
        return NextResponse.json({
          success: true,
          message: "Simulação de confirmação (mock)",
          status: "RECEIVED",
          mock: true,
          originalStatus: paymentData.status
        })
      }
    }

    // Para outros tipos de pagamento, retornar mock
    return NextResponse.json({
      success: true,
      message: "Simulação de confirmação (mock)",
      status: "CONFIRMED",
      mock: true,
      originalStatus: paymentData.status
    })

  } catch (error) {
    console.error("❌ [SIMULATE_CONFIRMED] Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 