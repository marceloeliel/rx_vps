import { NextResponse } from 'next/server'
import { getAsaasApiUrl, getAsaasApiKey } from '@/lib/asaas/config'

export async function GET() {
  try {
    const apiUrl = getAsaasApiUrl()
    const apiKey = getAsaasApiKey()
    
    console.log('🧪 [SIMPLE-TEST] Teste simples de conexão')
    console.log('🧪 [SIMPLE-TEST] URL:', apiUrl)
    console.log('🧪 [SIMPLE-TEST] Tem chave:', !!apiKey)
    
    // Testar apenas se conseguimos fazer a requisição
    const response = await fetch(`${apiUrl}/customers?limit=1`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      }
    })
    
    console.log('🧪 [SIMPLE-TEST] Status:', response.status)
    console.log('🧪 [SIMPLE-TEST] Status Text:', response.statusText)
    console.log('🧪 [SIMPLE-TEST] Headers:', Object.fromEntries(response.headers.entries()))
    
    // Ler resposta como texto primeiro
    const responseText = await response.text()
    console.log('🧪 [SIMPLE-TEST] Resposta (primeiros 200 chars):', responseText.substring(0, 200))
    console.log('🧪 [SIMPLE-TEST] Tamanho da resposta:', responseText.length)
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseLength: responseText.length,
      hasContent: responseText.length > 0,
      firstChars: responseText.substring(0, 100),
      config: {
        url: apiUrl,
        hasKey: !!apiKey,
        keyLength: apiKey?.length || 0
      }
    })
    
  } catch (error: any) {
    console.error('❌ [SIMPLE-TEST] Erro:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    })
  }
} 