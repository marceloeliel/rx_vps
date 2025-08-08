import { createClient } from "./client"

export interface VehicleFavorite {
  id?: string
  user_id: string
  vehicle_id: string
  created_at?: string
  updated_at?: string
}

export interface VehicleLead {
  id?: string
  user_id: string
  vehicle_id: string
  agency_id: string
  lead_type: 'favorite' | 'contact_whatsapp' | 'contact_email' | 'view_details' | 'simulation'
  contact_info?: any
  created_at?: string
  updated_at?: string
}

export interface LeadWithUserData {
  id: string
  user_id: string
  vehicle_id: string
  agency_id: string
  lead_type: string
  contact_info?: any
  created_at: string
  updated_at: string
  user_profile: {
    nome_completo: string
    email?: string
    whatsapp?: string
    cidade?: string
    estado?: string
  }
  vehicle: {
    titulo: string
    marca_nome: string
    modelo_nome: string
    ano_fabricacao: number
    preco: number
    foto_principal?: string
  }
}

// Adicionar veículo aos favoritos
export async function addToFavorites(userId: string, vehicleId: string): Promise<{ data: VehicleFavorite | null; error: any }> {
  const supabase = createClient()

  console.log('❤️ [FAVORITES] Adicionando aos favoritos:', { userId, vehicleId })

  try {
    const { data, error } = await supabase
      .from('vehicle_favorites')
      .insert({
        user_id: userId,
        vehicle_id: vehicleId
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [FAVORITES] Erro ao adicionar favorito:', error)
      return { data: null, error }
    }

    console.log('✅ [FAVORITES] Favorito adicionado com sucesso:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [FAVORITES] Erro inesperado:', error)
    return { data: null, error }
  }
}

// Remover veículo dos favoritos
export async function removeFromFavorites(userId: string, vehicleId: string): Promise<{ error: any }> {
  const supabase = createClient()

  console.log('💔 [FAVORITES] Removendo dos favoritos:', { userId, vehicleId })

  try {
    const { error } = await supabase
      .from('vehicle_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('vehicle_id', vehicleId)

    if (error) {
      console.error('❌ [FAVORITES] Erro ao remover favorito:', error)
      return { error }
    }

    console.log('✅ [FAVORITES] Favorito removido com sucesso')
    return { error: null }
  } catch (error) {
    console.error('❌ [FAVORITES] Erro inesperado:', error)
    return { error }
  }
}

// Verificar se veículo está nos favoritos
export async function isFavorite(userId: string, vehicleId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('vehicle_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('vehicle_id', vehicleId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [FAVORITES] Erro ao verificar favorito:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('❌ [FAVORITES] Erro inesperado:', error)
    return false
  }
}

// Obter favoritos do usuário
export async function getUserFavorites(userId: string): Promise<{ data: any[] | null; error: any }> {
  const supabase = createClient()

  console.log('📋 [FAVORITES] Buscando favoritos do usuário:', userId)

  try {
    const { data, error } = await supabase
      .from('vehicle_favorites')
      .select(`
        id,
        created_at,
        veiculos (
          id,
          titulo,
          marca_nome,
          modelo_nome,
          ano_fabricacao,
          preco,
          foto_principal,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [FAVORITES] Erro ao buscar favoritos:', error)
      return { data: null, error }
    }

    console.log('✅ [FAVORITES] Favoritos encontrados:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [FAVORITES] Erro inesperado:', error)
    return { data: null, error }
  }
}

// Registrar lead/interesse
export async function createLead(
  userId: string,
  vehicleId: string,
  agencyId: string,
  leadType: 'favorite' | 'contact_whatsapp' | 'contact_email' | 'view_details' | 'simulation',
  contactInfo?: any
): Promise<{ data: VehicleLead | null; error: any }> {
  const supabase = createClient()

  console.log('🎯 [LEADS] Criando lead:', { userId, vehicleId, agencyId, leadType })

  try {
    const { data, error } = await supabase
      .from('vehicle_leads')
      .insert({
        user_id: userId,
        vehicle_id: vehicleId,
        agency_id: agencyId,
        lead_type: leadType,
        contact_info: contactInfo
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [LEADS] Erro ao criar lead:', error)
      return { data: null, error }
    }

    console.log('✅ [LEADS] Lead criado com sucesso:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [LEADS] Erro inesperado:', error)
    return { data: null, error }
  }
}

// Obter leads da agência
export async function getAgencyLeads(agencyId: string): Promise<{ data: LeadWithUserData[] | null; error: any }> {
  const supabase = createClient()

  console.log('📊 [LEADS] Buscando leads da agência:', agencyId)

  try {
    // Primeiro, verificar se a tabela vehicle_leads existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('vehicle_leads')
      .select('id')
      .limit(1)

    if (tableError) {
      console.warn('⚠️ [LEADS] Tabela vehicle_leads não encontrada:', tableError.message)
      // Retornar dados vazios em vez de erro para não quebrar a aplicação
      return { data: [], error: null }
    }

    // Buscar leads básicos primeiro
    const { data: leadsData, error: leadsError } = await supabase
      .from('vehicle_leads')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })

    if (leadsError) {
      console.error('❌ [LEADS] Erro ao buscar leads básicos:', leadsError)
      return { data: [], error: null }
    }

    if (!leadsData || leadsData.length === 0) {
      console.log('ℹ️ [LEADS] Nenhum lead encontrado para a agência')
      return { data: [], error: null }
    }

    // Buscar dados dos usuários e veículos separadamente
    const formattedData: LeadWithUserData[] = []

    for (const lead of leadsData) {
      try {
        // Buscar dados do usuário
        const { data: userData } = await supabase
          .from('profiles')
          .select('nome_completo, email, whatsapp, cidade, estado')
          .eq('id', lead.user_id)
          .single()

        // Buscar dados do veículo
        const { data: vehicleData } = await supabase
          .from('veiculos')
          .select('titulo, marca_nome, modelo_nome, ano_fabricacao, preco, foto_principal')
          .eq('id', lead.vehicle_id)
          .single()

        formattedData.push({
          id: lead.id,
          user_id: lead.user_id,
          vehicle_id: lead.vehicle_id,
          agency_id: lead.agency_id,
          lead_type: lead.lead_type,
          contact_info: lead.contact_info,
          created_at: lead.created_at,
          updated_at: lead.updated_at || lead.created_at,
          user_profile: {
            nome_completo: userData?.nome_completo || 'Usuário',
            email: userData?.email,
            whatsapp: userData?.whatsapp,
            cidade: userData?.cidade,
            estado: userData?.estado
          },
          vehicle: {
            titulo: vehicleData?.titulo || 'Veículo não encontrado',
            marca_nome: vehicleData?.marca_nome || '',
            modelo_nome: vehicleData?.modelo_nome || '',
            ano_fabricacao: vehicleData?.ano_fabricacao || 0,
            preco: vehicleData?.preco || 0,
            foto_principal: vehicleData?.foto_principal
          }
        })
      } catch (itemError) {
        console.warn('⚠️ [LEADS] Erro ao processar lead individual:', itemError)
        // Continuar com o próximo lead em caso de erro
        continue
      }
    }

    console.log('✅ [LEADS] Leads processados:', formattedData.length)
    return { data: formattedData, error: null }
  } catch (error) {
    console.error('❌ [LEADS] Erro inesperado:', error)
    // Retornar dados vazios em vez de erro para não quebrar a aplicação
    return { data: [], error: null }
  }
}

// Obter estatísticas de leads da agência
export async function getAgencyLeadsStats(agencyId: string): Promise<{
  total: number;
  thisMonth: number;
  favorites: number;
  contacts: number;
}> {
  const supabase = createClient()

  console.log('📊 [LEADS] Buscando estatísticas da agência:', agencyId)

  try {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Buscar todas as estatísticas de uma vez
    const { data, error } = await supabase
      .from('vehicle_leads')
      .select('id, lead_type, created_at')
      .eq('agency_id', agencyId)

    if (error) {
      console.error('❌ [LEADS] Erro ao buscar estatísticas:', error)
      throw error
    }

    // Calcular estatísticas
    const stats = {
      total: data.length,
      thisMonth: data.filter(lead => new Date(lead.created_at) >= firstDayOfMonth).length,
      favorites: data.filter(lead => lead.lead_type === 'favorite').length,
      contacts: data.filter(lead => ['contact_whatsapp', 'contact_email'].includes(lead.lead_type)).length
    }

    console.log('✅ [LEADS] Estatísticas encontradas:', stats)
    return stats
  } catch (error) {
    console.error('❌ [LEADS] Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      thisMonth: 0,
      favorites: 0,
      contacts: 0
    }
  }
}