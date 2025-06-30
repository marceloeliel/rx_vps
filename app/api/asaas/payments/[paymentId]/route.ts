import { NextRequest, NextResponse } from "next/server"

const ASAAS_API_KEY = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj" // Token de produção antes
const ASAAS_API_URL = "https://api.asaas.com/v3"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  // Aguardar params (requerido no Next.js 15)
  const { paymentId } = await params
  
  console.log("🔍 [PAYMENT_STATUS] Verificando status do pagamento:", paymentId)
  
  try {
    if (!ASAAS_API_KEY) {
      console.log("❌ [PAYMENT_STATUS] Token não encontrado")
      return NextResponse.json(
        { error: "ASAAS_API_KEY não configurada" },
        { status: 500 }
      )
    }

    console.log("🌐 [PAYMENT_STATUS] Fazendo requisição para Asaas...")
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY,
      },
    })

    const data = await response.json()
    console.log("📋 [PAYMENT_STATUS] Response da API:", {
      status: response.status,
      paymentStatus: data.status,
      id: data.id
    })

    if (!response.ok) {
      console.error("❌ [PAYMENT_STATUS] Erro na API:", data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao consultar pagamento" },
        { status: response.status }
      )
    }

    console.log("✅ [PAYMENT_STATUS] Status consultado com sucesso:", data.status)
    return NextResponse.json(data)

  } catch (error) {
    console.error("❌ [PAYMENT_STATUS] Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 