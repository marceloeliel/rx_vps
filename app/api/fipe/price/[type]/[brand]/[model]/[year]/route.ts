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
  context: { params: Promise<{ type: string; brand: string; model: string; year: string }> }
) {
  try {
    const { type, brand, model, year } = await context.params
    
    // Validar parâmetros
    if (!type || !brand || !model || !year) {
      console.error('❌ [API FIPE] Parâmetros inválidos:', { type, brand, model, year })
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: type, brand, model, year' },
        { status: 400 }
      )
    }
    
    const tipoConvertido = TIPOS_VEICULO[type as keyof typeof TIPOS_VEICULO] || 'cars'
    const url = `${FIPE_API_BASE_URL}/${tipoConvertido}/brands/${brand}/models/${model}/years/${year}`
    
    console.log(`🔍 [API FIPE] Buscando preço para: ${type} ${brand} ${model} ${year}`)
    console.log(`🔗 [API FIPE] URL: ${url}`)
    console.log(`🔑 [API FIPE] Token presente: ${FIPE_API_TOKEN ? 'Sim' : 'Não'}`)
    
    const response = await fetch(url, {
      headers: {
        'X-Subscription-Token': FIPE_API_TOKEN || '',
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📊 [API FIPE] Status da resposta (preço): ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API FIPE] Erro na API externa (${response.status}):`, errorText)
      
      // Retornar erro mais específico baseado no status
      let errorMessage = 'Erro ao buscar preço'
      if (response.status === 401) {
        errorMessage = 'Token de API inválido ou expirado'
      } else if (response.status === 404) {
        errorMessage = 'Veículo não encontrado na tabela FIPE'
      } else if (response.status === 429) {
        errorMessage = 'Limite de requisições excedido'
      } else if (errorText.includes('failed to locate the information')) {
        errorMessage = 'Dados do veículo não encontrados na tabela FIPE'
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status === 200 ? 404 : response.status }
      )
    }
    
    const preco = await response.json()
    console.log(`✅ [API FIPE] Preço carregado: ${preco.price}`)
    
    return NextResponse.json(preco)
  } catch (error: any) {
    console.error('❌ [API FIPE] Erro ao buscar preço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}