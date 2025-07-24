import { NextResponse } from 'next/server'
import { getAsaasApiUrl, getAsaasApiKey } from '@/lib/asaas/config'

export async function GET() {
  try {
    const apiUrl = getAsaasApiUrl()
    const apiKey = getAsaasApiKey()
    
    console.log('🔧 [TEST] Configuração Asaas:', {
      url: apiUrl,
      hasKey: !!apiKey,
      keyPrefix: apiKey?.substring(0, 15) + '...',
      environment: process.env.NODE_ENV
    })
    
    // Testar conexão básica com a API
    console.log('🔍 [TEST] Fazendo requisição para:', `${apiUrl}/customers?limit=1`)
    console.log('🔍 [TEST] Headers:', {
      'Content-Type': 'application/json',
      'access_token': apiKey?.substring(0, 20) + '...'
    })
    
    const response = await fetch(`${apiUrl}/customers?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey,
      }
    })
    
    console.log('📡 [TEST] Status da API Asaas:', response.status)
    
    const responseText = await response.text()
    console.log('📄 [TEST] Resposta da API:', responseText.substring(0, 200))
    
    let parsedResponse = null
    if (response.ok && responseText.trim()) {
      try {
        parsedResponse = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ [TEST] Erro ao fazer parse do JSON:', parseError)
        parsedResponse = { error: 'Resposta não é um JSON válido', rawResponse: responseText }
      }
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      config: {
        url: apiUrl,
        hasKey: !!apiKey,
        keyPrefix: apiKey?.substring(0, 15) + '...'
      },
      response: parsedResponse || responseText || 'Resposta vazia',
      rawResponse: responseText.substring(0, 500) // Incluir resposta bruta para debug
    })
    
  } catch (error: any) {
    console.error('❌ [TEST] Erro ao testar API:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      config: {
        url: getAsaasApiUrl(),
        hasKey: !!getAsaasApiKey()
      }
    })
  }
} 