import { createClient } from "./client"

export interface DadosAgencia {
  id: number
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
  servicos_oferecidos?: string[] // Será convertido de/para JSON
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

// Verificar se uma tabela existe
async function checkTableExists(supabase: any, tableName: string): Promise<boolean> {
  console.log('🔍 [AGENCIA] Verificando existência da tabela:', tableName)
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ [AGENCIA] Erro ao verificar tabela:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }

    console.log('✅ [AGENCIA] Tabela verificada com sucesso:', { exists: true, tableName })
    return true
  } catch (error) {
    console.error('❌ [AGENCIA] Erro inesperado ao verificar tabela:', error)
    return false
  }
}

// Converter array de serviços para string JSON
function stringifyServicos(servicos?: string[]): string | undefined {
  if (!servicos || !Array.isArray(servicos) || servicos.length === 0) {
    return undefined
  }
  try {
    return JSON.stringify(servicos)
  } catch (error) {
    console.error('❌ [AGENCIA] Erro ao converter serviços para JSON:', error)
    return undefined
  }
}

// Converter string JSON para array de serviços
function parseServicos(servicos?: string | null): string[] | undefined {
  if (!servicos) {
    return undefined
  }
  try {
    const parsed = JSON.parse(servicos)
    return Array.isArray(parsed) ? parsed : undefined
  } catch (error) {
    console.error('❌ [AGENCIA] Erro ao converter JSON para array de serviços:', error)
    return undefined
  }
}

// Buscar dados da agência
export async function getAgenciaData(userId: string): Promise<DadosAgencia | null> {
  const supabase = createClient()
  console.log('🔍 [AGENCIA] Buscando dados da agência para userId:', userId)

  try {
    const { data, error } = await supabase
      .from('dados_agencia')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // not found
        console.log('ℹ️ [AGENCIA] Nenhuma agência encontrada para o usuário')
        return null
      }
      console.error('❌ [AGENCIA] Erro ao buscar agência:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return null
    }

    console.log('✅ [AGENCIA] Dados da agência encontrados:', data)
    return {
      ...data,
      servicos_oferecidos: data.servicos_oferecidos ? JSON.parse(data.servicos_oferecidos) : undefined
    }
  } catch (error) {
    console.error('❌ [AGENCIA] Erro inesperado ao buscar agência:', error)
    return null
  }
}

// Buscar agência por ID
export async function getAgenciaById(id: number): Promise<DadosAgencia | null> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists(supabase, "dados_agencia")

    if (!tableExists) {
      console.warn("Tabela dados_agencia não existe.")
      return null
    }

    const { data, error } = await supabase.from("dados_agencia").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Erro ao buscar agência por ID:", error)
      return null
    }

    return {
      ...data,
      servicos_oferecidos: parseServicos(data.servicos_oferecidos),
    }
  } catch (error) {
    console.error("Erro inesperado ao buscar agência por ID:", error)
    return null
  }
}

// Criar nova agência
export async function createAgencia(userId: string, agenciaData: DadosAgenciaInput): Promise<DadosAgencia | null> {
  const supabase = createClient()
  console.log('🔍 [AGENCIA] Iniciando criação de agência para userId:', userId)

  try {
    // Verificar se já existe uma agência para este usuário
    const { data: existingAgencia } = await supabase
      .from('dados_agencia')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingAgencia) {
      console.log('⚠️ [AGENCIA] Usuário já possui uma agência cadastrada')
      return existingAgencia
    }

    // Preparar dados para inserção
    const dataToInsert = {
      user_id: userId,
      nome_fantasia: agenciaData.nome_fantasia,
      razao_social: agenciaData.razao_social,
      cnpj: agenciaData.cnpj?.replace(/\D/g, ''),
      inscricao_estadual: agenciaData.inscricao_estadual,
      ano_fundacao: agenciaData.ano_fundacao ? Number(agenciaData.ano_fundacao) : null,
      especialidades: agenciaData.especialidades,
      telefone_principal: agenciaData.telefone_principal,
      whatsapp: agenciaData.whatsapp,
      email: agenciaData.email,
      website: agenciaData.website,
      endereco: agenciaData.endereco,
      numero: agenciaData.numero,
      complemento: agenciaData.complemento,
      bairro: agenciaData.bairro,
      cidade: agenciaData.cidade,
      estado: agenciaData.estado,
      cep: agenciaData.cep?.replace(/\D/g, ''),
      total_vendedores: agenciaData.total_vendedores ? Number(agenciaData.total_vendedores) : 0,
      total_clientes: agenciaData.total_clientes ? Number(agenciaData.total_clientes) : 0,
      vendas_mes: agenciaData.vendas_mes ? Number(agenciaData.vendas_mes) : 0,
      vendas_ano: agenciaData.vendas_ano ? Number(agenciaData.vendas_ano) : 0,
      logo_url: agenciaData.logo_url,
      descricao: agenciaData.descricao,
      horario_funcionamento: agenciaData.horario_funcionamento,
      servicos_oferecidos: agenciaData.servicos_oferecidos ? JSON.stringify(agenciaData.servicos_oferecidos) : null
    }

    console.log('📝 [AGENCIA] Dados preparados para inserção:', dataToInsert)

    // Inserir dados
    const { data, error } = await supabase
      .from('dados_agencia')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('❌ [AGENCIA] Erro ao criar agência:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return null
    }

    console.log('✅ [AGENCIA] Agência criada com sucesso:', data)
    return {
      ...data,
      servicos_oferecidos: data.servicos_oferecidos ? JSON.parse(data.servicos_oferecidos) : undefined
    }
  } catch (error) {
    console.error('❌ [AGENCIA] Erro inesperado ao criar agência:', error)
    return null
  }
}

// Atualizar agência existente
export async function updateAgencia(userId: string, agenciaData: DadosAgenciaInput): Promise<DadosAgencia | null> {
  const supabase = createClient()
  console.log('🔍 [AGENCIA] Iniciando atualização de agência para userId:', userId)

  try {
    // Verificar se a agência existe
    const { data: existingAgencia } = await supabase
      .from('dados_agencia')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!existingAgencia) {
      console.log('⚠️ [AGENCIA] Agência não encontrada para atualização')
      return null
    }

    // Preparar dados para atualização
    const dataToUpdate = {
      nome_fantasia: agenciaData.nome_fantasia,
      razao_social: agenciaData.razao_social,
      cnpj: agenciaData.cnpj?.replace(/\D/g, ''),
      inscricao_estadual: agenciaData.inscricao_estadual,
      ano_fundacao: agenciaData.ano_fundacao ? Number(agenciaData.ano_fundacao) : null,
      especialidades: agenciaData.especialidades,
      telefone_principal: agenciaData.telefone_principal,
      whatsapp: agenciaData.whatsapp,
      email: agenciaData.email,
      website: agenciaData.website,
      endereco: agenciaData.endereco,
      numero: agenciaData.numero,
      complemento: agenciaData.complemento,
      bairro: agenciaData.bairro,
      cidade: agenciaData.cidade,
      estado: agenciaData.estado,
      cep: agenciaData.cep?.replace(/\D/g, ''),
      total_vendedores: agenciaData.total_vendedores ? Number(agenciaData.total_vendedores) : 0,
      total_clientes: agenciaData.total_clientes ? Number(agenciaData.total_clientes) : 0,
      vendas_mes: agenciaData.vendas_mes ? Number(agenciaData.vendas_mes) : 0,
      vendas_ano: agenciaData.vendas_ano ? Number(agenciaData.vendas_ano) : 0,
      logo_url: agenciaData.logo_url,
      descricao: agenciaData.descricao,
      horario_funcionamento: agenciaData.horario_funcionamento,
      servicos_oferecidos: agenciaData.servicos_oferecidos ? JSON.stringify(agenciaData.servicos_oferecidos) : null
    }

    console.log('📝 [AGENCIA] Dados preparados para atualização:', dataToUpdate)

    // Atualizar dados
    const { data, error } = await supabase
      .from('dados_agencia')
      .update(dataToUpdate)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ [AGENCIA] Erro ao atualizar agência:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return null
    }

    console.log('✅ [AGENCIA] Agência atualizada com sucesso:', data)
    return {
      ...data,
      servicos_oferecidos: data.servicos_oferecidos ? JSON.parse(data.servicos_oferecidos) : undefined
    }
  } catch (error) {
    console.error('❌ [AGENCIA] Erro inesperado ao atualizar agência:', error)
    return null
  }
}

// Criar ou atualizar agência (upsert)
export async function upsertAgencia(userId: string, agenciaData: DadosAgenciaInput): Promise<DadosAgencia | null> {
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
  console.log('🔍 [AGENCIA] Iniciando exclusão de agência para userId:', userId)

  try {
    const { error } = await supabase
      .from('dados_agencia')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('❌ [AGENCIA] Erro ao deletar agência:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }

    console.log('✅ [AGENCIA] Agência deletada com sucesso')
    return true
  } catch (error) {
    console.error('❌ [AGENCIA] Erro inesperado ao deletar agência:', error)
    return false
  }
}

// Buscar agência por CNPJ
export async function getAgenciaByCnpj(cnpj: string): Promise<DadosAgencia | null> {
  const supabase = createClient()
  console.log('🔍 [AGENCIA] Buscando agência por CNPJ:', cnpj)

  try {
    const cleanCnpj = cnpj.replace(/\D/g, '')
    const { data, error } = await supabase
      .from('dados_agencia')
      .select('*')
      .eq('cnpj', cleanCnpj)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // not found
        console.log('ℹ️ [AGENCIA] Nenhuma agência encontrada para o CNPJ')
        return null
      }
      console.error('❌ [AGENCIA] Erro ao buscar agência por CNPJ:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return null
    }

    console.log('✅ [AGENCIA] Agência encontrada por CNPJ:', data)
    return {
      ...data,
      servicos_oferecidos: data.servicos_oferecidos ? JSON.parse(data.servicos_oferecidos) : undefined
    }
  } catch (error) {
    console.error('❌ [AGENCIA] Erro inesperado ao buscar agência por CNPJ:', error)
    return null
  }
}

// Buscar agências por localização (para listagens públicas)
export async function getAgenciasByLocation(
  cidade?: string,
  estado?: string,
  limit = 10,
  offset = 0,
): Promise<DadosAgencia[]> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists(supabase, "dados_agencia")

    if (!tableExists) {
      return []
    }

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

    return (data || []).map((item) => ({
      ...item,
      servicos_oferecidos: parseServicos(item.servicos_oferecidos),
    }))
  } catch (error) {
    console.error("Erro inesperado ao buscar agências por localização:", error)
    return []
  }
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

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists(supabase, "dados_agencia")

    if (!tableExists) {
      return { data: [], count: 0 }
    }

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

    const processedData = (data || []).map((item) => ({
      ...item,
      servicos_oferecidos: parseServicos(item.servicos_oferecidos),
    }))

    return { data: processedData, count: count || 0 }
  } catch (error) {
    console.error("Erro inesperado ao buscar agências:", error)
    return { data: [], count: 0 }
  }
}

// Obter estatísticas das agências
export async function getAgenciasStats(): Promise<{
  total: number
  porEstado: { estado: string; count: number }[]
  mediaVendedores: number
}> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists(supabase, "dados_agencia")

    if (!tableExists) {
      return { total: 0, porEstado: [], mediaVendedores: 0 }
    }

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
  } catch (error) {
    console.error("Erro inesperado ao obter estatísticas:", error)
    return { total: 0, porEstado: [], mediaVendedores: 0 }
  }
}

// Verificar se usuário tem agência cadastrada
export async function userHasAgencia(userId: string): Promise<boolean> {
  const agencia = await getAgenciaData(userId)
  return agencia !== null
}
