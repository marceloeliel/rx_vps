import { NextRequest, NextResponse } from "next/server"

// Configurações fixas para sandbox
const ASAAS_API_KEY = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmI2M2RmYjNlLTgzMjMtNDlhYy04ZWM5LWQyODFhNzUyMDYwZTo6JGFhY2hfY2MyOTEzZDItMjZlMy00ZDQ0LWIzZTctZjdhYjEyNzc2MWIz"
const ASAAS_BASE_URL = "https://api-sandbox.asaas.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("🚀 [PAYMENTS-CREATE] Criando pagamento:", {
      customer: body.customer,
      value: body.value,
      billingType: body.billingType
    })

    if (!ASAAS_API_KEY) {
      console.error("❌ [PAYMENTS-CREATE] API Key não configurada")
      return NextResponse.json(
        { error: "API Key não configurada" },
        { status: 500 }
      )
    }

    // Fazer requisição para o Asaas
    const response = await fetch(`${ASAAS_BASE_URL}/v3/payments`, {
      method: "POST",
      headers: {
        "access_token": ASAAS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("📊 [PAYMENTS-CREATE] Status da resposta:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ [PAYMENTS-CREATE] Erro do Asaas:", errorData)
      return NextResponse.json(
        { error: "Erro ao criar pagamento no Asaas", details: errorData },
        { status: response.status }
      )
    }

    const paymentData = await response.json()
    console.log("✅ [PAYMENTS-CREATE] Pagamento criado:", paymentData.id)

    return NextResponse.json(paymentData)

  } catch (error: any) {
    console.error("❌ [PAYMENTS-CREATE] Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "10"
    const offset = searchParams.get("offset") || "0"
    const customer = searchParams.get("customer")

    console.log("🔍 [PAYMENTS-LIST] Listando pagamentos:", { limit, offset, customer })

    if (!ASAAS_API_KEY) {
      console.error("❌ [PAYMENTS-LIST] API Key não configurada")
      return NextResponse.json(
        { error: "API Key não configurada" },
        { status: 500 }
      )
    }

    // Montar URL com parâmetros
    let url = `${ASAAS_BASE_URL}/v3/payments?limit=${limit}&offset=${offset}`
    if (customer) {
      url += `&customer=${customer}`
    }

    console.log("🌐 [PAYMENTS-LIST] Fazendo requisição:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "access_token": ASAAS_API_KEY,
        "Content-Type": "application/json",
      },
    })

    console.log("📊 [PAYMENTS-LIST] Status da resposta:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ [PAYMENTS-LIST] Erro do Asaas:", errorData)
      return NextResponse.json(
        { error: "Erro ao listar pagamentos no Asaas", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ [PAYMENTS-LIST] Pagamentos encontrados:", data.totalCount || data.data?.length || 0)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error("❌ [PAYMENTS-LIST] Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    )
  }
} 