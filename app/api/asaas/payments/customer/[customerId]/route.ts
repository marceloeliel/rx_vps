import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

// Configurações fixas para sandbox
const ASAAS_API_KEY = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmI2M2RmYjNlLTgzMjMtNDlhYy04ZWM5LWQyODFhNzUyMDYwZTo6JGFhY2hfY2MyOTEzZDItMjZlMy00ZDQ0LWIzZTctZjdhYjEyNzc2MWIz"
const ASAAS_BASE_URL = "https://api-sandbox.asaas.com"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params
    console.log("🚀 [PAYMENTS-CUSTOMER] Iniciando busca de pagamentos para customer:", customerId)

    if (!customerId || customerId === 'undefined' || customerId === 'null') {
      console.log("❌ [PAYMENTS-CUSTOMER] CustomerId inválido:", customerId)
      return NextResponse.json(
        { error: "CustomerId inválido" },
        { status: 400 }
      )
    }

    // Adicionar timeout para evitar travamento
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos

    try {
      // Log para debug
      console.log("🔍 [PAYMENTS-CUSTOMER] Tentando acessar API:", {
        url: `${ASAAS_BASE_URL}/v3/payments?customer=${customerId}&limit=50&offset=0`,
        customerId,
        hasToken: !!ASAAS_API_KEY,
        baseUrl: ASAAS_BASE_URL
      })

      const response = await fetch(`${ASAAS_BASE_URL}/v3/payments?customer=${customerId}&limit=50&offset=0`, {
        headers: {
          access_token: ASAAS_API_KEY,
          "Content-Type": "application/json"
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log("📊 [PAYMENTS-CUSTOMER] Status da resposta:", response.status)

      if (!response.ok) {
        let errorData: any = {}
        try {
          const responseText = await response.text()
          console.log("📄 [PAYMENTS-CUSTOMER] Resposta de erro:", responseText)
          errorData = JSON.parse(responseText)
        } catch (e) {
          console.error("❌ [PAYMENTS-CUSTOMER] Resposta não é JSON válido")
          errorData = { message: `Erro ${response.status}: ${response.statusText}` }
        }
        
        console.error("❌ [PAYMENTS-CUSTOMER] Erro da API Asaas:", errorData)
        
        if (response.status === 401) {
          return NextResponse.json(
            { error: "Token da API Asaas inválido ou expirado" },
            { status: 401 }
          )
        } else if (response.status === 404) {
          return NextResponse.json(
            { error: "Customer não encontrado no Asaas. Verifique se o customer_id está correto ou se existe alguma cobrança criada para este cliente." },
            { status: 404 }
          )
        } else {
          return NextResponse.json(
            { 
              error: errorData.errors?.[0]?.description || errorData.message || "Erro ao buscar pagamentos",
              status: response.status
            },
            { status: response.status }
          )
        }
      }

      const data = await response.json()
      console.log("✅ [PAYMENTS-CUSTOMER] Pagamentos encontrados:", data.totalCount || 0)
      
      if (data.data && data.data.length > 0) {
        console.log("📋 [PAYMENTS-CUSTOMER] Primeiros pagamentos:")
        data.data.slice(0, 3).forEach((payment: any, index: number) => {
          console.log(`   ${index + 1}. ${payment.id} - R$ ${payment.value} - ${payment.status} - ${payment.description}`)
        })
      }
      
      return NextResponse.json(data)

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.log("❌ [PAYMENTS-CUSTOMER] Timeout na requisição para API Asaas")
        return NextResponse.json(
          { error: "Timeout na requisição para API Asaas" },
          { status: 408 }
        )
      }
      
      throw fetchError
    }

  } catch (error: any) {
    console.error("❌ [PAYMENTS-CUSTOMER] Erro inesperado:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error.message || "Erro desconhecido"
      },
      { status: 500 }
    )
  }
} 