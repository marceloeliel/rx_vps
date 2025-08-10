import { NextRequest, NextResponse } from 'next/server'

const FIPE_API_BASE_URL = 'https://fipe.parallelum.com.br/api/v2'
const FIPE_API_TOKEN = process.env.NEXT_PUBLIC_FIPE_API_TOKEN

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
    
    const tipoConvertido = TIPOS_VEICULO[type as keyof typeof TIPOS_VEICULO] || 'cars'
    
    console.log(`🔍 [API FIPE] Buscando preço para: ${type} ${brand} ${model} ${year}`)
    
    const response = await fetch(`${FIPE_API_BASE_URL}/${tipoConvertido}/brands/${brand}/models/${model}/years/${year}`, {
      headers: {
        'X-Subscription-Token': FIPE_API_TOKEN || '',
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📊 [API FIPE] Status da resposta (preço): ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API FIPE] Erro na API externa:`, errorText)
      throw new Error(`Erro na API FIPE: ${response.status}`)
    }
    
    const preco = await response.json()
    console.log(`✅ [API FIPE] Preço carregado: ${preco.price}`)
    
    return NextResponse.json(preco)
  } catch (error) {
    console.error('❌ [API FIPE] Erro ao buscar preço:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar preço' },
      { status: 500 }
    )
  }
}