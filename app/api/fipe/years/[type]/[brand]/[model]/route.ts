import { NextRequest, NextResponse } from 'next/server'

const FIPE_API_BASE_URL = 'https://fipe.parallelum.com.br/api/v2'
const FIPE_API_TOKEN = process.env.NEXT_PUBLIC_FIPE_API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWZmMzBjMS1lMjhlLTRjNjctYTkwYS0zNGVlNzUyNmJlYTAiLCJlbWFpbCI6InNlZ3RyYWtlckBnbWFpbC5jb20iLCJpYXQiOjE3Mzk1NDYwMTJ9.zDH9TepQA78CoVGAcl4hlbWZXdwAW2OIXEH2IkOPS_I'

const TIPOS_VEICULO = {
  carro: 'cars',
  moto: 'motorcycles',
  caminhao: 'trucks'
} as const

export async function GET(
  request: Request,
  context: { params: Promise<{ type: string; brand: string; model: string }> }
) {
  try {
    const { type, brand, model } = await context.params
    
    // Validação de parâmetros
    if (!type || !brand || !model) {
      console.error('❌ [API FIPE] Parâmetros inválidos:', { type, brand, model })
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: type, brand, model' },
        { status: 400 }
      )
    }
    
    const tipoConvertido = TIPOS_VEICULO[type as keyof typeof TIPOS_VEICULO] || 'cars'
    
    console.log(`🔍 [API FIPE] Buscando anos para: ${type} ${brand} ${model}`)
    console.log(`🔑 [API FIPE] Token status: ${FIPE_API_TOKEN ? 'Presente' : 'Ausente'}`)
    
    const url = `${FIPE_API_BASE_URL}/${tipoConvertido}/brands/${brand}/models/${model}/years`
    console.log(`🌐 [API FIPE] URL: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Subscription-Token': FIPE_API_TOKEN,
        'Accept': 'application/json'
      }
    })
    
    console.log(`📊 [API FIPE] Status da resposta (anos): ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API FIPE] Erro na API externa:`, errorText)
      
      // Tratamento específico de erros
      switch (response.status) {
        case 401:
          return NextResponse.json(
            { error: 'Token de acesso inválido ou expirado' },
            { status: 401 }
          )
        case 404:
          return NextResponse.json(
            { error: 'Modelo não encontrado ou não possui anos disponíveis' },
            { status: 404 }
          )
        case 429:
          return NextResponse.json(
            { error: 'Muitas consultas. Tente novamente em alguns segundos' },
            { status: 429 }
          )
        case 500:
          return NextResponse.json(
            { error: 'Erro no servidor FIPE. Tente novamente mais tarde' },
            { status: 500 }
          )
        default:
          return NextResponse.json(
            { error: `Erro na API FIPE: ${response.status}` },
            { status: response.status }
          )
      }
    }
    
    const anos = await response.json()
    console.log(`✅ [API FIPE] Anos carregados: ${anos.length}`)
    
    return NextResponse.json(anos)
  } catch (error) {
    console.error('❌ [API FIPE] Erro ao buscar anos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar anos' },
      { status: 500 }
    )
  }
}