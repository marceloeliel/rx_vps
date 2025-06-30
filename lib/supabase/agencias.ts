import { createClient } from "./client"

export interface DadosAgencia {
  id: string
  user_id: string
  nome_fantasia?: string
  razao_social?: string
  cnpj?: string
  inscricao_estadual?: string
  ano_fundacao?: number
  especialidades?: string
  telefone_principal?: string
  whatsapp?: string
  email?: string
  website?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  total_vendedores?: number
  total_clientes?: number
  vendas_mes?: number
  vendas_ano?: number
  logo_url?: string
  descricao?: string
  horario_funcionamento?: string
  servicos_oferecidos?: string[]
  created_at: string
  updated_at: string
}

export interface DadosAgenciaInput {
  nome_fantasia?: string
  razao_social?: string
  cnpj?: string
  inscricao_estadual?: string
  ano_fundacao?: number
  especialidades?: string
  telefone_principal?: string
  whatsapp?: string
  email?: string
  website?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  total_vendedores?: number
  total_clientes?: number
  vendas_mes?: number
  vendas_ano?: number
  logo_url?: string
  descricao?: string
  horario_funcionamento?: string
  servicos_oferecidos?: string[]
}

// Buscar dados da agência por user_id
export async function getAgenciaData(userId: string): Promise<DadosAgencia | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("dados_agencia").select("*").eq("user_id", userId).single()

  if (error) {
    if (error.code === "PGRST116") {
      // Nenhum registro encontrado
      return null
    }
    console.error("Erro ao buscar dados da agência:", error)
    return null
  }

  return data
}

// Buscar agência por ID
export async function getAgenciaById(id: string): Promise<DadosAgencia | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("dados_agencia").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Erro ao buscar agência por ID:", error)
    return null
  }

  return data
}

// Criar nova agência
export async function createAgencia(userId: string, agenciaData: DadosAgenciaInput): Promise<DadosAgencia | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("dados_agencia")
    .insert({
      user_id: userId,
      ...agenciaData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar agência:", error)
    return null
  }

  return data
}

// Atualizar agência existente
export async function updateAgencia(userId: string, agenciaData: DadosAgenciaInput): Promise<DadosAgencia | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("dados_agencia")
    .update({
      ...agenciaData,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar agência:", error)
    return null
  }

  return data
}

// Criar ou atualizar agência (upsert)
export async function upsertAgencia(userId: string, agenciaData: DadosAgenciaInput): Promise<DadosAgencia | null> {
  const supabase = createClient()

  // Primeiro, verificar se já existe uma agência para este usuário
  const agenciaExistente = await getAgenciaData(userId)

  if (agenciaExistente) {
    // Se existe, atualizar
    return await updateAgencia(userId, agenciaData)
  } else {
    // Se não existe, criar
    return await createAgencia(userId, agenciaData)
  }
}

// Deletar agência
export async function deleteAgencia(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("dados_agencia").delete().eq("user_id", userId)

  if (error) {
    console.error("Erro ao deletar agência:", error)
    return false
  }

  return true
}

// Buscar agências por CNPJ (para validação de unicidade)
export async function getAgenciaByCnpj(cnpj: string): Promise<DadosAgencia | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("dados_agencia").select("*").eq("cnpj", cnpj).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Erro ao buscar agência por CNPJ:", error)
    return null
  }

  return data
}

// Buscar agências por localização (para listagens públicas)
export async function getAgenciasByLocation(
  cidade?: string,
  estado?: string,
  limit = 10,
  offset = 0,
): Promise<DadosAgencia[]> {
  const supabase = createClient()

  let query = supabase
    .from("dados_agencia")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (cidade) {
    query = query.ilike("cidade", `%${cidade}%`)
  }

  if (estado) {
    query = query.eq("estado", estado.toUpperCase())
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao buscar agências por localização:", error)
    return []
  }

  return data || []
}

// Buscar agências com filtros avançados
export async function searchAgencias(filters: {
  nome?: string
  cidade?: string
  estado?: string
  especialidades?: string
  limit?: number
  offset?: number
}): Promise<{ data: DadosAgencia[]; count: number }> {
  const supabase = createClient()

  let query = supabase.from("dados_agencia").select("*", { count: "exact" })

  if (filters.nome) {
    query = query.or(`nome_fantasia.ilike.%${filters.nome}%,razao_social.ilike.%${filters.nome}%`)
  }

  if (filters.cidade) {
    query = query.ilike("cidade", `%${filters.cidade}%`)
  }

  if (filters.estado) {
    query = query.eq("estado", filters.estado.toUpperCase())
  }

  if (filters.especialidades) {
    query = query.ilike("especialidades", `%${filters.especialidades}%`)
  }

  query = query
    .order("created_at", { ascending: false })
    .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 10) - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Erro ao buscar agências:", error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

// Obter estatísticas das agências
export async function getAgenciasStats(): Promise<{
  total: number
  porEstado: { estado: string; count: number }[]
  mediaVendedores: number
}> {
  const supabase = createClient()

  // Total de agências
  const { count: total } = await supabase.from("dados_agencia").select("*", { count: "exact", head: true })

  // Agências por estado
  const { data: porEstado } = await supabase.from("dados_agencia").select("estado").not("estado", "is", null)

  // Calcular estatísticas
  const estadoCount: { [key: string]: number } = {}
  let totalVendedores = 0
  let agenciasComVendedores = 0

  // Buscar dados para média de vendedores
  const { data: vendedoresData } = await supabase
    .from("dados_agencia")
    .select("total_vendedores")
    .not("total_vendedores", "is", null)

  if (vendedoresData) {
    vendedoresData.forEach((item) => {
      if (item.total_vendedores && item.total_vendedores > 0) {
        totalVendedores += item.total_vendedores
        agenciasComVendedores++
      }
    })
  }

  if (porEstado) {
    porEstado.forEach((item) => {
      if (item.estado) {
        estadoCount[item.estado] = (estadoCount[item.estado] || 0) + 1
      }
    })
  }

  const porEstadoArray = Object.entries(estadoCount).map(([estado, count]) => ({ estado, count }))

  return {
    total: total || 0,
    porEstado: porEstadoArray,
    mediaVendedores: agenciasComVendedores > 0 ? Math.round(totalVendedores / agenciasComVendedores) : 0,
  }
}

// Atualizar estatísticas de vendas da agência
export async function updateAgenciaStats(
  userId: string,
  stats: {
    total_vendedores?: number
    total_clientes?: number
    vendas_mes?: number
    vendas_ano?: number
  },
): Promise<DadosAgencia | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("dados_agencia")
    .update({
      ...stats,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar estatísticas da agência:", error)
    return null
  }

  return data
}

// Verificar se usuário tem agência cadastrada
export async function userHasAgencia(userId: string): Promise<boolean> {
  const agencia = await getAgenciaData(userId)
  return agencia !== null
}

// Buscar agências próximas (por CEP - implementação básica)
export async function getAgenciasProximas(cep: string, limit = 5): Promise<DadosAgencia[]> {
  const supabase = createClient()

  // Implementação básica - busca por CEPs similares
  const cepPrefix = cep.substring(0, 5)

  const { data, error } = await supabase.from("dados_agencia").select("*").ilike("cep", `${cepPrefix}%`).limit(limit)

  if (error) {
    console.error("Erro ao buscar agências próximas:", error)
    return []
  }

  return data || []
}
