import { NextResponse } from "next/server"

const ASAAS_API_URL = "https://api.asaas.com/v3"

// Token hardcoded temporariamente - REMOVER EM PRODUÇÃO
const ASAAS_API_KEY_HARDCODED = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhlZjU3ZGQ3LTA2NjctNDNjYi1hNjYwLTIyOGE3MGM5MTcxNTo6JGFhY2hfMDgxODBjMjQtZWE1YS00MGNlLTg0MjEtMzI0OTY3MGM5MzBj"

const ASAAS_API_KEY = ASAAS_API_KEY_HARDCODED // Forçar uso do token hardcoded temporariamente

export async function GET() {
  console.log("🚀 [CUSTOMERS-LIST] Iniciando GET...")
  
  try {
    console.log("🔑 [CUSTOMERS-LIST] Verificando token...")
    if (!ASAAS_API_KEY) {
      console.log("❌ [CUSTOMERS-LIST] Token não encontrado")
      return NextResponse.json(
        { error: "ASAAS_API_KEY não configurada" },
        { status: 500 }
      )
    }
    console.log("✅ [CUSTOMERS-LIST] Token encontrado")

    console.log("👤 [CUSTOMERS-LIST] Buscando customers no Asaas...")
    const response = await fetch(`${ASAAS_API_URL}/customers?limit=100`, {
      headers: {
        "access_token": ASAAS_API_KEY,
      },
    })

    console.log("📊 [CUSTOMERS-LIST] Status da resposta:", response.status)
    const data = await response.json()

    if (!response.ok) {
      console.error("❌ [CUSTOMERS-LIST] Erro da API Asaas:", data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao buscar customers" },
        { status: response.status }
      )
    }

    console.log("✅ [CUSTOMERS-LIST] Customers encontrados:", data.totalCount)
    
    // Retornar apenas informações essenciais
    const customers = data.data?.map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      cpfCnpj: customer.cpfCnpj,
      dateCreated: customer.dateCreated
    })) || []

    return NextResponse.json({
      totalCount: data.totalCount,
      customers: customers
    })

  } catch (error: any) {
    console.error("❌ [CUSTOMERS-LIST] Erro inesperado:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error.message 
      },
      { status: 500 }
    )
  }
} 