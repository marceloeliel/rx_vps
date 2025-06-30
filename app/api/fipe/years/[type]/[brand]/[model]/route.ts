import { NextRequest, NextResponse } from 'next/server'

const FIPE_API_BASE_URL = 'https://fipe.parallelum.com.br/api/v2'
const FIPE_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWZmMzBjMS1lMjhlLTRjNjctYTkwYS0zNGVlNzUyNmJlYTAiLCJlbWFpbCI6InNlZ3RyYWtlckBnbWFpbC5jb20iLCJpYXQiOjE3Mzk1NDYwMTJ9.zDH9TepQA78CoVGAcl4hlbWZXdwAW2OIXEH2IkOPS_I'

const TIPOS_VEICULO = {
  carro: 'cars',
  moto: 'motorcycles',
  caminhao: 'trucks'
} as const

export async function GET(
  request: Request,
  { params }: { params: { type: string; brand: string; model: string } }
) {
  try {
    const { type, brand, model } = await params
    
    const tipoConvertido = TIPOS_VEICULO[type as keyof typeof TIPOS_VEICULO] || 'cars'
    
    console.log(`🔍 [API FIPE] Buscando anos para: ${type} ${brand} ${model}`)
    
    const response = await fetch(`${FIPE_API_BASE_URL}/${tipoConvertido}/brands/${brand}/models/${model}/years`, {
      headers: {
        'X-Subscription-Token': FIPE_API_TOKEN,
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📊 [API FIPE] Status da resposta (anos): ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API FIPE] Erro na API externa:`, errorText)
      throw new Error(`Erro na API FIPE: ${response.status}`)
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