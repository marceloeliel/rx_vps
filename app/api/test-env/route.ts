import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Sistema Asaas foi completamente desabilitado
    console.log('⚠️ [TEST-ENV] Sistema Asaas desabilitado')
    
    return NextResponse.json({
      message: 'Sistema de pagamentos Asaas foi desabilitado',
      hasKey: false,
      keyLength: 0,
      keyStart: 'DISABLED',
      allEnvKeys: [],
      tokenTest: 'SYSTEM_DISABLED'
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno", details: error },
      { status: 500 }
    )
  }
}