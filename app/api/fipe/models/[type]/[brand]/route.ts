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
  { params }: { params: Promise<{ type: string; brand: string }> }
) {
  try {
    const { type, brand } = await params
    
    const tipoConvertido = TIPOS_VEICULO[type as keyof typeof TIPOS_VEICULO] || 'cars'
    
    console.log(`🔍 [API FIPE] Buscando modelos para: ${type} ${brand}`)
    
    const response = await fetch(`${FIPE_API_BASE_URL}/${tipoConvertido}/brands/${brand}/models`, {
      headers: {
        'X-Subscription-Token': FIPE_API_TOKEN,
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📊 [API FIPE] Status da resposta (modelos): ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API FIPE] Erro na API externa:`, errorText)
      throw new Error(`Erro na API FIPE: ${response.status}`)
    }
    
    const modelos = await response.json()
    console.log(`✅ [API FIPE] Modelos carregados: ${modelos.length}`)
    
    return NextResponse.json(modelos)
  } catch (error) {
    console.error('❌ [API FIPE] Erro ao buscar modelos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar modelos' },
      { status: 500 }
    )
  }
}