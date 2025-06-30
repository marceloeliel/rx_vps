import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const asaasKey = "$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzI4MzQ6OiRhYWNoX2Y0NzJkNzRhLTUxYjctNGM4Yy1iMzEyLTEzZGQ1Y2JkYjE3Ng==" // Teste com token hardcoded
    
    return NextResponse.json({
      hasKey: !!asaasKey,
      keyLength: asaasKey?.length || 0,
      keyStart: asaasKey?.substring(0, 10) || "N/A",
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('ASAAS')),
      tokenTest: "hardcoded"
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno", details: error },
      { status: 500 }
    )
  }
} 