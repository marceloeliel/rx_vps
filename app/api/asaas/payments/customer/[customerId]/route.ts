import { NextRequest, NextResponse } from "next/server"

const ASAAS_API_URL = "https://api.asaas.com/v3"
const ASAAS_API_KEY = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj" // Token de produção antes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params
  console.log("🚀 [PAYMENTS-CUSTOMER] Iniciando busca de pagamentos para customer:", customerId)
  
  try {
    if (!ASAAS_API_KEY) {
      console.log("❌ [PAYMENTS-CUSTOMER] Token não encontrado")
      return NextResponse.json(
        { error: "ASAAS_API_KEY não configurada" },
        { status: 500 }
      )
    }

    console.log("🔍 [PAYMENTS-CUSTOMER] Buscando pagamentos para customer:", customerId)

    // Buscar pagamentos do cliente no Asaas
    const response = await fetch(`${ASAAS_API_URL}/payments?customer=${customerId}&limit=50&offset=0`, {
      headers: {
        "access_token": ASAAS_API_KEY,
      },
    })

    console.log("📊 [PAYMENTS-CUSTOMER] Status da resposta:", response.status)

    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch (e) {
        console.error("❌ [PAYMENTS-CUSTOMER] Resposta não é JSON válido")
        errorData = { message: `Erro ${response.status}: ${response.statusText}` }
      }
      console.error("❌ [PAYMENTS-CUSTOMER] Erro da API Asaas:", errorData)
      return NextResponse.json(
        { error: errorData.errors?.[0]?.description || errorData.message || "Erro ao buscar pagamentos" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ [PAYMENTS-CUSTOMER] Pagamentos encontrados:", data.totalCount || 0)
    
    // Adicionar informações de debug nos logs
    if (data.data && data.data.length > 0) {
      console.log("📋 [PAYMENTS-CUSTOMER] Primeiros pagamentos:")
      data.data.slice(0, 3).forEach((payment: any, index: number) => {
        console.log(`   ${index + 1}. ${payment.id} - R$ ${payment.value} - ${payment.status} - ${payment.description}`)
      })
    }
    
    return NextResponse.json(data)

  } catch (error: any) {
    console.error("❌ [PAYMENTS-CUSTOMER] Erro inesperado:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error.message
      },
      { status: 500 }
    )
  }
} 