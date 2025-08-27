// API da Tabela FIPE - Fipe Online
// Documentação: https://fipe.online/docs/api/fipe

const FIPE_API_BASE_URL = 'https://fipe.parallelum.com.br/api/v2'
const FIPE_API_TOKEN = process.env.NEXT_PUBLIC_FIPE_API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWZmMzBjMS1lMjhlLTRjNjctYTkwYS0zNGVlNzUyNmJlYTAiLCJlbWFpbCI6InNlZ3RyYWtlckBnbWFpbC5jb20iLCJpYXQiOjE3Mzk1NDYwMTJ9.zDH9TepQA78CoVGAcl4hlbWZXdwAW2OIXEH2IkOPS_I'

// Headers padrão para todas as requisições
const getHeaders = () => {
  console.log('🔑 [FIPE] Usando token:', FIPE_API_TOKEN ? 'Token presente' : 'Token ausente')
  return {
    'Content-Type': 'application/json',
    'X-Subscription-Token': FIPE_API_TOKEN,
    'Accept': 'application/json',
    'User-Agent': 'RX-Autos/1.0'
  }
}

// Tipos de veículo suportados pela API
export const TIPOS_VEICULO_FIPE = {
  carro: 'cars',
  moto: 'motorcycles', 
  caminhao: 'trucks'
} as const

// Interfaces para os dados da API
export interface FipeMarca {
  code: string
  name: string
}

export interface FipeModelo {
  code: string
  name: string
}

export interface FipeAno {
  code: string
  name: string
}

export interface FipePreco {
  brand: string
  codeFipe: string
  fuel: string
  fuelAcronym: string
  model: string
  modelYear: number
  price: string
  referenceMonth: string
  vehicleType: number
}

// Função para converter tipo de veículo para o formato da API
export function converterTipoVeiculo(tipo: string): string {
  return TIPOS_VEICULO_FIPE[tipo as keyof typeof TIPOS_VEICULO_FIPE] || 'cars'
}

// Buscar marcas por tipo de veículo
export async function buscarMarcas(tipoVeiculo: string): Promise<FipeMarca[]> {
  try {
    console.log('📡 [FIPE] Buscando marcas para tipo:', tipoVeiculo)
    
    const response = await fetch(`/api/fipe/brands/${tipoVeiculo}`)
    
    console.log('📊 [FIPE] Status da resposta:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      console.error('❌ [FIPE] Erro na resposta:', errorData)
      throw new Error(`Erro ao buscar marcas: ${response.status} - ${errorData.error}`)
    }
    
    const data = await response.json()
    console.log('✅ [FIPE] Marcas carregadas:', data.length, 'marcas')
    return data
  } catch (error) {
    console.error('❌ [FIPE] Erro ao buscar marcas:', error)
    throw error
  }
}

// Buscar modelos por marca
export async function buscarModelos(tipoVeiculo: string, codigoMarca: string): Promise<FipeModelo[]> {
  try {
    console.log('📡 [FIPE] Buscando modelos para:', tipoVeiculo, codigoMarca)
    
    const response = await fetch(`/api/fipe/models/${tipoVeiculo}/${codigoMarca}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(`Erro ao buscar modelos: ${response.status} - ${errorData.error}`)
    }
    
    const data = await response.json()
    console.log('✅ [FIPE] Modelos carregados:', data.length, 'modelos')
    return data
  } catch (error) {
    console.error('❌ [FIPE] Erro ao buscar modelos:', error)
    throw error
  }
}

// Buscar anos por modelo
export async function buscarAnos(tipoVeiculo: string, codigoMarca: string, codigoModelo: string): Promise<FipeAno[]> {
  try {
    console.log('📡 [FIPE] Buscando anos para:', tipoVeiculo, codigoMarca, codigoModelo)
    
    const url = `/api/fipe/years/${tipoVeiculo}/${codigoMarca}/${codigoModelo}`
    const response = await fetchWithRetry(url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(`Erro ao buscar anos: ${response.status} - ${errorData.error}`)
    }
    
    const data = await response.json()
    console.log('✅ [FIPE] Anos carregados:', data.length, 'anos')
    return data
  } catch (error) {
    console.error('❌ [FIPE] Erro ao buscar anos:', error)
    throw error
  }
}

// Buscar preço FIPE
// Função auxiliar para retry com backoff exponencial
async function fetchWithRetry(url: string, maxRetries: number = 3, baseDelay: number = 1000): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url)
      
      // Se a resposta for bem-sucedida ou for um erro que não deve ser retentado, retornar
      if (response.ok || (response.status !== 429 && response.status !== 500 && response.status !== 502 && response.status !== 503)) {
        return response
      }
      
      // Se for o último attempt, retornar a resposta mesmo com erro
      if (attempt === maxRetries) {
        return response
      }
      
      // Calcular delay com backoff exponencial
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`⏳ [FIPE] Tentativa ${attempt} falhou (${response.status}). Tentando novamente em ${delay}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`⏳ [FIPE] Tentativa ${attempt} falhou com erro de rede. Tentando novamente em ${delay}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error('Máximo de tentativas excedido')
}

export async function buscarPrecoFipe(tipoVeiculo: string, codigoMarca: string, codigoModelo: string, codigoAno: string): Promise<FipePreco> {
  try {
    console.log('📡 [FIPE] Buscando preço para:', tipoVeiculo, codigoMarca, codigoModelo, codigoAno)
    
    const response = await fetchWithRetry(`/api/fipe/price/${tipoVeiculo}/${codigoMarca}/${codigoModelo}/${codigoAno}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(`Erro ao buscar preço FIPE: ${response.status} - ${errorData.error}`)
    }
    
    const data = await response.json()
    console.log('✅ [FIPE] Preço carregado:', data.price)
    return data
  } catch (error) {
    console.error('❌ [FIPE] Erro ao buscar preço FIPE:', error)
    throw error
  }
}

// Função auxiliar para mapear combustível
export function mapearCombustivelFipe(combustivel: string): string {
  const mapeamento: Record<string, string> = {
    'Gasolina': 'Gasolina',
    'Etanol': 'Etanol',
    'Flex': 'Flex',
    'Diesel': 'Diesel',
    'Elétrico': 'Elétrico',
    'Híbrido': 'Híbrido',
    'GNV': 'GNV'
  }
  
  return mapeamento[combustivel] || combustivel
}

// Função para extrair ano do código do ano (formato: "2022-3")
export function extrairAnoDoCodigo(codigoAno: string): number {
  const ano = codigoAno.split('-')[0]
  return parseInt(ano, 10)
}

// Função para formatar preço
export function formatarPrecoFipe(preco: string): number {
  // Remove "R$ " e converte para número
  const precoLimpo = preco.replace('R$ ', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(precoLimpo) || 0
}