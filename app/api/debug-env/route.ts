import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Sistema Asaas foi completamente desabilitado
    console.log('⚠️ [DEBUG-ENV] Sistema Asaas desabilitado')
    console.log('🔍 [DEBUG-ENV] NODE_ENV:', process.env.NODE_ENV)
    
    return NextResponse.json({
      message: 'Sistema de pagamentos Asaas foi desabilitado',
      hasAsaasApiKey: false,
      asaasApiKeyLength: 0,
      asaasBaseUrl: 'DISABLED',
      nodeEnv: process.env.NODE_ENV,
      asaasApiKeyPreview: 'SYSTEM_DISABLED'
    })
  } catch (error: any) {
    console.error('❌ [DEBUG-ENV] Erro:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}