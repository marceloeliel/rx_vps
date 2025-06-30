import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"
import { getAsaasCustomerId, saveAsaasCustomerId } from "@/lib/supabase/profiles"

const ASAAS_API_URL = "https://api.asaas.com/v3"

// Token hardcoded temporariamente - REMOVER EM PRODUÇÃO
const ASAAS_API_KEY_HARDCODED = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj"

const ASAAS_API_KEY = ASAAS_API_KEY_HARDCODED // Forçar uso do token hardcoded temporariamente

export async function POST(request: NextRequest) {
  console.log("🚀 [CUSTOMERS] Iniciando POST...")
  
  try {
    console.log("🔑 [CUSTOMERS] Verificando token...")
    console.log("🔑 [CUSTOMERS] Token do env:", process.env.ASAAS_API_KEY ? "ENCONTRADO" : "NÃO ENCONTRADO")
    console.log("🔑 [CUSTOMERS] Token hardcoded:", ASAAS_API_KEY_HARDCODED ? "DISPONÍVEL" : "NÃO DISPONÍVEL")
    console.log("🔑 [CUSTOMERS] Token final:", ASAAS_API_KEY ? "USANDO" : "NENHUM")
    
    if (!ASAAS_API_KEY) {
      console.log("❌ [CUSTOMERS] Nenhum token disponível")
      return NextResponse.json(
        { error: "ASAAS_API_KEY não configurada" },
        { status: 500 }
      )
    }
    console.log("✅ [CUSTOMERS] Token encontrado, tamanho:", ASAAS_API_KEY.length)

    console.log("📝 [CUSTOMERS] Lendo dados do request...")
    const customerData = await request.json()
    console.log("📝 [CUSTOMERS] Dados recebidos:", customerData)

    // Verificar se foi passado o userId para verificar customer existente
    const { userId, ...asaasCustomerData } = customerData

    if (userId) {
      console.log("👤 [CUSTOMERS] Verificando customer existente para userId:", userId)
      
      // Buscar customer_id existente no Supabase
      const existingCustomerId = await getAsaasCustomerId(userId)
      
      if (existingCustomerId) {
        console.log("✅ [CUSTOMERS] Customer já existe:", existingCustomerId)
        
        // Buscar dados atuais do customer no Asaas
        const customerResponse = await fetch(`${ASAAS_API_URL}/customers/${existingCustomerId}`, {
          headers: {
            "access_token": ASAAS_API_KEY,
          },
        })

        if (customerResponse.ok) {
          const existingCustomer = await customerResponse.json()
          console.log("✅ [CUSTOMERS] Retornando customer existente")
          return NextResponse.json(existingCustomer)
        } else {
          console.log("⚠️ [CUSTOMERS] Customer não encontrado no Asaas, criando novo...")
        }
      }
    }

    console.log("🌐 [CUSTOMERS] Fazendo requisição para Asaas...")
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY,
      },
      body: JSON.stringify(asaasCustomerData),
    })

    console.log("📊 [CUSTOMERS] Status da resposta:", response.status)
    console.log("📊 [CUSTOMERS] Response OK:", response.ok)

    let data: any = {}
    try {
      data = await response.json()
      console.log("📊 [CUSTOMERS] Dados da resposta:", data)
    } catch (e) {
      console.error("❌ [CUSTOMERS] Resposta não é JSON válido")
      data = { message: `Erro ${response.status}: ${response.statusText}` }
    }

    if (!response.ok) {
      console.error("❌ [CUSTOMERS] Erro da API Asaas:", data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || data.message || "Erro ao criar cliente" },
        { status: response.status }
      )
    }

    console.log("✅ [CUSTOMERS] Cliente criado com sucesso:", data.id)
    
    // Salvar customer_id no Supabase se userId foi fornecido
    if (userId && data.id) {
      console.log("💾 [CUSTOMERS] Salvando customer_id no Supabase...")
      console.log("💾 [CUSTOMERS] UserId:", userId)
      console.log("💾 [CUSTOMERS] CustomerId:", data.id)
      
      const saved = await saveAsaasCustomerId(userId, data.id)
      if (saved) {
        console.log("✅ [CUSTOMERS] Customer_id salvo no Supabase com sucesso!")
        
        // Verificar se foi salvo corretamente
        const verificacao = await getAsaasCustomerId(userId)
        console.log("🔍 [CUSTOMERS] Verificação do customer_id salvo:", verificacao)
      } else {
        console.error("❌ [CUSTOMERS] ERRO CRÍTICO: Falha ao salvar customer_id no Supabase")
      }
    } else {
      console.log("⚠️ [CUSTOMERS] userId ou data.id não fornecidos, não salvando no Supabase")
      console.log("⚠️ [CUSTOMERS] userId:", userId)
      console.log("⚠️ [CUSTOMERS] data.id:", data.id)
    }
    
    return NextResponse.json(data)

  } catch (error: any) {
    console.error("❌ [CUSTOMERS] Erro inesperado:", error)
    console.error("❌ [CUSTOMERS] Stack trace:", error.stack)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log("🚀 [CUSTOMERS] Iniciando GET...")
  
  try {
    console.log("🔑 [CUSTOMERS] Verificando token...")
    if (!ASAAS_API_KEY) {
      console.log("❌ [CUSTOMERS] Token não encontrado")
      return NextResponse.json(
        { error: "ASAAS_API_KEY não configurada" },
        { status: 500 }
      )
    }
    console.log("✅ [CUSTOMERS] Token encontrado")

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "10"
    const offset = searchParams.get("offset") || "0"

    console.log("🌐 [CUSTOMERS] Fazendo requisição GET para Asaas...")
    const response = await fetch(`${ASAAS_API_URL}/customers?limit=${limit}&offset=${offset}`, {
      headers: {
        "access_token": ASAAS_API_KEY,
      },
    })

    console.log("📊 [CUSTOMERS] Status da resposta:", response.status)
    const data = await response.json()

    if (!response.ok) {
      console.error("❌ [CUSTOMERS] Erro da API Asaas:", data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao buscar clientes" },
        { status: response.status }
      )
    }

    console.log("✅ [CUSTOMERS] Clientes listados com sucesso")
    return NextResponse.json(data)

  } catch (error: any) {
    console.error("❌ [CUSTOMERS] Erro inesperado:", error)
    console.error("❌ [CUSTOMERS] Stack trace:", error.stack)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
} 