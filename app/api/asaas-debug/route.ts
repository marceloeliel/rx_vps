import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Iniciando debug da API Asaas...")
    
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY
    const ASAAS_API_URL = "https://api.asaas.com/v3"
    
    console.log("🔑 Token existe:", !!ASAAS_API_KEY)
    console.log("🔑 Tamanho do token:", ASAAS_API_KEY?.length || 0)
    
    if (!ASAAS_API_KEY) {
      return NextResponse.json({
        error: "ASAAS_API_KEY não configurada",
        debug: {
          hasKey: false,
          allEnvKeys: Object.keys(process.env).filter(key => key.includes('ASAAS'))
        }
      }, { status: 500 })
    }

    console.log("🚀 Fazendo requisição para Asaas...")
    
    const response = await fetch(`${ASAAS_API_URL}/customers?limit=1`, {
      method: "GET",
      headers: {
        "access_token": ASAAS_API_KEY,
      },
    })

    console.log("📊 Status da resposta:", response.status)
    console.log("📊 Response OK:", response.ok)
    
    const data = await response.json()
    console.log("📊 Dados recebidos:", data)

    if (!response.ok) {
      return NextResponse.json({
        error: "Erro na API Asaas",
        status: response.status,
        asaasError: data,
        debug: {
          hasKey: true,
          keyLength: ASAAS_API_KEY.length,
          keyStart: ASAAS_API_KEY.substring(0, 10)
        }
      }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      totalCustomers: data.totalCount || 0,
      debug: {
        hasKey: true,
        keyLength: ASAAS_API_KEY.length,
        keyStart: ASAAS_API_KEY.substring(0, 10),
        responseStatus: response.status
      }
    })

  } catch (error: any) {
    console.error("❌ Erro inesperado:", error)
    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error.message,
      debug: {
        hasKey: !!process.env.ASAAS_API_KEY,
        errorType: error.constructor.name
      }
    }, { status: 500 })
  }
} 