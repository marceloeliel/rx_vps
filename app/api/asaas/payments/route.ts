import { NextRequest, NextResponse } from "next/server"

const ASAAS_API_URL = "https://api.asaas.com/v3"

// Token hardcoded temporariamente - REMOVER EM PRODUÇÃO
const ASAAS_API_KEY_HARDCODED = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj"

const ASAAS_API_KEY = ASAAS_API_KEY_HARDCODED // Forçar uso do token hardcoded temporariamente

export async function POST(request: NextRequest) {
  console.log("🚀 [PAYMENTS] Iniciando POST...")
  
  try {
    console.log("🔑 [PAYMENTS] Verificando token...")
    if (!ASAAS_API_KEY) {
      console.log("❌ [PAYMENTS] Token não encontrado")
      return NextResponse.json(
        { error: "ASAAS_API_KEY não configurada" },
        { status: 500 }
      )
    }
    console.log("✅ [PAYMENTS] Token encontrado")

    console.log("📝 [PAYMENTS] Lendo dados do request...")
    const paymentData = await request.json()
    console.log("📝 [PAYMENTS] Dados recebidos:", paymentData)

    console.log("🌐 [PAYMENTS] Fazendo requisição para Asaas...")
    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY,
      },
      body: JSON.stringify(paymentData),
    })

    console.log("📊 [PAYMENTS] Status da resposta:", response.status)
    const data = await response.json()
    console.log("📊 [PAYMENTS] Dados da resposta:", data)

    if (!response.ok) {
      console.error("❌ [PAYMENTS] Erro da API Asaas:", data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao criar pagamento" },
        { status: response.status }
      )
    }

    // Se for pagamento PIX, buscar dados completos incluindo QR Code
    if (paymentData.billingType === 'PIX' && data.id) {
      console.log("🔍 [PAYMENTS] Buscando dados completos do PIX para:", data.id)
      
      try {
        const pixResponse = await fetch(`${ASAAS_API_URL}/payments/${data.id}/pixQrCode`, {
          headers: {
            "access_token": ASAAS_API_KEY,
          },
        })

        if (pixResponse.ok) {
          const pixData = await pixResponse.json()
          console.log("✅ [PAYMENTS] Dados PIX obtidos:", pixData)
          
          // Adicionar dados PIX ao response
          data.pixTransaction = {
            qrCode: {
              payload: pixData.payload,
              encodedImage: pixData.encodedImage
            }
          }
        } else {
          console.log("⚠️ [PAYMENTS] Não foi possível obter QR Code PIX")
        }
      } catch (pixError) {
        console.error("❌ [PAYMENTS] Erro ao buscar dados PIX:", pixError)
      }
    }

    console.log("✅ [PAYMENTS] Pagamento criado com sucesso:", data.id)
    return NextResponse.json(data)

  } catch (error: any) {
    console.error("❌ [PAYMENTS] Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log("🚀 [PAYMENTS] Iniciando GET...")
  
  try {
    console.log("🔑 [PAYMENTS] Verificando token...")
    if (!ASAAS_API_KEY) {
      console.log("❌ [PAYMENTS] Token não encontrado")
      return NextResponse.json(
        { error: "ASAAS_API_KEY não configurada" },
        { status: 500 }
      )
    }
    console.log("✅ [PAYMENTS] Token encontrado")

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "10"
    const offset = searchParams.get("offset") || "0"

    console.log("🌐 [PAYMENTS] Fazendo requisição GET para Asaas...")
    const response = await fetch(`${ASAAS_API_URL}/payments?limit=${limit}&offset=${offset}`, {
      headers: {
        "access_token": ASAAS_API_KEY,
      },
    })

    console.log("📊 [PAYMENTS] Status da resposta:", response.status)
    const data = await response.json()

    if (!response.ok) {
      console.error("❌ [PAYMENTS] Erro da API Asaas:", data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao buscar pagamentos" },
        { status: response.status }
      )
    }

    console.log("✅ [PAYMENTS] Pagamentos listados com sucesso")
    return NextResponse.json(data)

  } catch (error: any) {
    console.error("❌ [PAYMENTS] Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 