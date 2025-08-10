import { NextRequest, NextResponse } from 'next/server'

const FIPE_API_BASE_URL = 'https://fipe.parallelum.com.br/api/v2'
const FIPE_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWZmMzBjMS1lMjhlLTRjNjctYTkwYS0zNGVlNzUyNmJlYTAiLCJlbWFpbCI6InNlZ3RyYWtlckBnbWFpbC5jb20iLCJpYXQiOjE3Mzk1NDYwMTJ9.zDH9TepQA78CoVGAcl4hlbWZXdwAW2OIXEH2IkOPS_I'

// Mapeamento de tipos
const TIPOS_VEICULO = {
  carro: 'cars',
  moto: 'motorcycles',
  caminhao: 'trucks'
} as const

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    
    // Converter tipo para formato da API
    const tipoConvertido = TIPOS_VEICULO[type as keyof typeof TIPOS_VEICULO] || 'cars'
    
    console.log(`🔍 [API FIPE] Buscando marcas para tipo: ${type} (convertido: ${tipoConvertido})`)
    
    // Fazer requisição para API FIPE
    const response = await fetch(`${FIPE_API_BASE_URL}/${tipoConvertido}/brands`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Subscription-Token': FIPE_API_TOKEN,
        'Accept': 'application/json'
      }
    })
    
    console.log(`📊 [API FIPE] Status da resposta (marcas): ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API FIPE] Erro na API externa:`, errorText)
      throw new Error(`Erro na API FIPE: ${response.status}`)
    }
    
    const marcas = await response.json()
    console.log(`✅ [API FIPE] Marcas carregadas: ${marcas.length}`)
    
    return NextResponse.json(marcas)
  } catch (error) {
    console.error('❌ [API FIPE] Erro ao buscar marcas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar marcas' },
      { status: 500 }
    )
  }
}