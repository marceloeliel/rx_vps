import { NextResponse } from "next/server"
import { getAsaasCustomerId } from "@/lib/supabase/profiles"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params para Next.js 15
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    
    console.log("🚀 [PAYMENTS-USER] Iniciando busca de pagamentos para usuário:", userId)
    
    // Verificar token da API
    const asaasApiKey = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj" // Token de produção antes
    
    if (!asaasApiKey) {
      console.error("❌ [PAYMENTS-USER] Token da API não encontrado")
      return NextResponse.json({ 
        error: "Token da API Asaas não configurado",
        data: [],
        totalCount: 0
      }, { status: 500 })
    }
    
    console.log("🔑 [PAYMENTS-USER] Token encontrado, tamanho:", asaasApiKey.length)
    
    // Buscar customer_id no Supabase
    console.log("🔍 [PAYMENTS-USER] Buscando customer_id para userId:", userId)
    const customerId = await getAsaasCustomerId(userId)
    
    if (!customerId) {
      console.log("❌ [PAYMENTS-USER] Customer ID não encontrado")
      console.log("💡 [PAYMENTS-USER] DICA: Usuário precisa criar uma cobrança primeiro")
      
      return NextResponse.json({ 
        data: [],
        totalCount: 0,
        hasMore: false,
        message: "Nenhuma cobrança encontrada. Crie sua primeira cobrança para começar!"
      })
    }

    console.log("✅ [PAYMENTS-USER] Customer ID encontrado:", customerId)
    
    // URL do Asaas - PRODUÇÃO
    const asaasApiUrl = "https://api.asaas.com/v3"
    
    // Buscar pagamentos no Asaas
    let url = `${asaasApiUrl}/payments?customer=${customerId}&limit=50`
    
    if (status) {
      url += `&status=${status}`
    }
    
    console.log("🌐 [PAYMENTS-USER] URL Asaas:", asaasApiUrl)
    console.log("🌐 [PAYMENTS-USER] Fazendo requisição para:", url)
    
    const response = await fetch(url, {
      headers: {
        "access_token": asaasApiKey,
        "Content-Type": "application/json",
      },
    })
    
    console.log("📊 [PAYMENTS-USER] Status da resposta:", response.status)
    console.log("📊 [PAYMENTS-USER] Content-Type:", response.headers.get('content-type'))
    
    if (!response.ok) {
      console.error("❌ [PAYMENTS-USER] Resposta não OK:", response.status, response.statusText)
      
      // Tratamento específico para erro 401
      if (response.status === 401) {
        console.error("❌ [PAYMENTS-USER] ERRO 401: Token inválido ou expirado")
        return NextResponse.json({ 
          error: "Token da API Asaas inválido ou expirado. Verifique suas credenciais.",
          data: [],
          totalCount: 0,
          code: "UNAUTHORIZED"
        }, { status: 401 })
      }
      
      // Tentar ler a resposta como texto primeiro
      const responseText = await response.text()
      console.error("❌ [PAYMENTS-USER] Resposta bruta:", responseText || "(vazia)")
      
      let errorData: any = { message: "Erro desconhecido" }
      
      if (responseText) {
        try {
          errorData = JSON.parse(responseText)
        } catch (parseError) {
          console.error("❌ [PAYMENTS-USER] Erro ao parsear JSON:", parseError)
          errorData = { message: responseText }
        }
      }
      
      return NextResponse.json({ 
        error: errorData.errors?.[0]?.description || errorData.message || `Erro da API Asaas (${response.status})`,
        data: [],
        totalCount: 0,
        code: response.status
      }, { status: response.status })
    }
    
    // Tentar parsear resposta de sucesso
    const responseText = await response.text()
    console.log("📄 [PAYMENTS-USER] Resposta bruta (primeiros 200 chars):", responseText.slice(0, 200))
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ [PAYMENTS-USER] Erro ao parsear JSON de sucesso:", parseError)
      console.error("❌ [PAYMENTS-USER] Resposta completa:", responseText)
      
      return NextResponse.json({ 
        error: "Resposta inválida da API Asaas",
        data: [],
        totalCount: 0
      }, { status: 500 })
    }
    
    console.log("✅ [PAYMENTS-USER] Pagamentos encontrados:", data.totalCount || 0)
    
    // Verificar se há pagamentos pendentes
    const payments = data.data || []
    const pendingPayments = payments.filter((payment: any) => 
      payment.status === 'PENDING' || payment.status === 'AWAITING_PAYMENT'
    )
    const hasPendingPayments = pendingPayments.length > 0
    
    if (data.data && data.data.length > 0) {
      console.log("📋 [PAYMENTS-USER] Primeiros pagamentos:")
      data.data.slice(0, 3).forEach((payment: any, index: number) => {
        console.log(`   ${index + 1}. ${payment.id} - R$ ${payment.value} - ${payment.status} - ${payment.description}`)
      })
    }
    
    console.log(`🔍 [PAYMENTS-USER] Pagamentos pendentes: ${pendingPayments.length}`)
    console.log(`⚠️ [PAYMENTS-USER] Tem pendências: ${hasPendingPayments}`)
    
    return NextResponse.json({
      data: data.data || [],
      totalCount: data.totalCount || 0,
      hasMore: data.hasMore || false,
      customerId,
      pendingPayments: pendingPayments.length,
      hasPendingPayments,
      pendingOnly: pendingPayments
    })

  } catch (error: any) {
    console.error("❌ [PAYMENTS-USER] Erro inesperado:", error)
    return NextResponse.json({ 
      error: error.message,
      data: [],
      totalCount: 0
    }, { status: 500 })
  }
} 