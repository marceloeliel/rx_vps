import { createClient } from './client'

export interface PaidAd {
  id: string
  title: string
  description: string
  image_url: string
  company_name: string
  location: string
  rating: number
  review_count: number
  vehicle_count: number
  satisfaction_rate: number
  response_time: string
  primary_color: string
  secondary_color: string
  contact_url?: string
  inventory_url?: string
  is_active: boolean
  is_featured: boolean
  position_order: number
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  agencia_id?: string
  agencia_user_id?: string
  agencia_whatsapp?: string
  agencia_telefone?: string
  agencia_email?: string
  agencia_slug?: string
}

export interface CreatePaidAdData {
  title: string
  description: string
  image_url: string
  company_name: string
  location: string
  rating: number
  review_count: number
  vehicle_count: number
  satisfaction_rate: number
  response_time: string
  primary_color: string
  secondary_color: string
  contact_url?: string
  inventory_url?: string
  is_featured?: boolean
  position_order: number
  start_date?: string
  end_date?: string
  agencia_id?: string
}

export interface UpdatePaidAdData extends Partial<CreatePaidAdData> {
  is_active?: boolean
  updated_at?: string
}

/**
 * Busca anúncios pagos ativos conectados a agências reais com planos ativos
 */
export async function getActivePaidAds(): Promise<PaidAd[]> {
  const supabase = createClient()
  
  try {
    console.log('🔍 Buscando anúncios pagos ativos...')
    
    // Primeiro verificar se a tabela tem dados
    const { data: countData, error: countError } = await supabase
      .from('paid_ads')
      .select('id', { count: 'exact' })
      .limit(1)
      
    if (countError) {
      console.error('❌ Erro ao verificar tabela paid_ads:', JSON.stringify({
        message: countError.message || 'Erro desconhecido',
        code: countError.code || 'N/A',
        hint: countError.hint || 'N/A'
      }))
      return []
    }
    
    console.log('📊 Tabela paid_ads verificada:', { count: countData?.length || 0 })
    
    // Buscar anúncios pagos que tenham agencia_id válido
    const { data: adsData, error: adsError } = await supabase
      .from('paid_ads')
      .select('*')
      .eq('is_active', true)
      .not('agencia_id', 'is', null)
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order('position_order', { ascending: true })
      .order('is_featured', { ascending: false })
      .limit(10)

    if (adsError) {
      console.error('❌ Erro ao buscar anúncios pagos:', JSON.stringify({
        message: adsError.message || 'Erro desconhecido',
        details: adsError.details || 'N/A',
        hint: adsError.hint || 'N/A',
        code: adsError.code || 'N/A'
      }))
      return []
    }

    if (!adsData || adsData.length === 0) {
      console.log('ℹ️ Nenhum anúncio encontrado ou dados são null')
      
      // Retornar dados mock para teste se não há dados reais
      return [{
        id: 'mock-1',
        title: 'Suas próximas vendas começam aqui',
        description: 'Explore nossa plataforma e descubra oportunidades exclusivas para expandir seus negócios.',
        image_url: 'https://ecdmpndeunbzhaihabvi.supabase.co/storage/v1/object/public/telas//ChatGPT%20Image%2017%20de%20jul.%20de%202025,%2018_21_25.png',
        company_name: 'RX NEGOCIO',
        location: 'Salvador, BA',
        rating: 4.8,
        review_count: 120,
        vehicle_count: 50,
        satisfaction_rate: 95,
        response_time: '< 1 hora',
        primary_color: '#FF6B35',
        secondary_color: '#F7931E',
        contact_url: 'https://wa.me/5573999377300',
        inventory_url: '/veiculos',
        is_active: true,
        is_featured: true,
        position_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        agencia_whatsapp: '5573999377300',
        agencia_telefone: '5573999377300',
        agencia_email: 'contato@rxnegocio.com.br'
      }]
    }
    
    console.log(`✅ Encontrados ${adsData.length} anúncios pagos ativos`)

    // Buscar dados das agências e verificar planos ativos
    const agenciaIds = adsData.map(ad => ad.agencia_id).filter(Boolean)
    
    console.log('🏢 Buscando dados das agências:', { agenciaIds })
    
    if (agenciaIds.length === 0) {
      console.log('⚠️ Nenhuma agencia_id encontrada nos anúncios')
      return adsData // Retornar anúncios sem dados de agência
    }
    
    const { data: agenciasData, error: agenciasError } = await supabase
      .from('dados_agencia')
      .select(`
        id,
        user_id,
        nome_fantasia,
        telefone_principal,
        whatsapp,
        email,
        cidade,
        estado
      `)
      .in('id', agenciaIds)

    if (agenciasError) {
      console.error('❌ Erro ao buscar dados das agências:', JSON.stringify({
        message: agenciasError.message || 'Erro desconhecido',
        code: agenciasError.code || 'N/A',
        hint: agenciasError.hint || 'N/A'
      }))
      return adsData // Retornar anúncios sem dados de agência
    }

    // Buscar perfis dos usuários para verificar planos ativos
    const userIds = agenciasData?.map(agencia => agencia.user_id).filter(Boolean) || []
    
    console.log('👤 Buscando perfis dos usuários:', { userIds })
    
    if (userIds.length === 0) {
      console.log('⚠️ Nenhum user_id encontrado nas agências')
      return adsData // Retornar anúncios sem verificação de plano
    }
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        plano_atual,
        plano_data_fim
      `)
      .in('id', userIds)

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis dos usuários:', JSON.stringify({
        message: profilesError.message || 'Erro desconhecido',
        code: profilesError.code || 'N/A',
        hint: profilesError.hint || 'N/A'
      }))
      return adsData // Retornar anúncios sem verificação de plano
    }

    // Filtrar apenas agências com planos ativos
    const now = new Date()
    const activeProfiles = profilesData?.filter(profile => {
      if (!profile.plano_atual || !profile.plano_data_fim) return false
      const endDate = new Date(profile.plano_data_fim)
      return endDate > now
    }) || []

    console.log('📊 Perfis com planos ativos:', { 
      total: profilesData?.length || 0, 
      active: activeProfiles.length 
    })

    const activeUserIds = activeProfiles.map(profile => profile.id)
    const activeAgencias = agenciasData?.filter(agencia => 
      activeUserIds.includes(agencia.user_id)
    ) || []

    console.log('🏢 Agências com planos ativos:', { 
      total: agenciasData?.length || 0, 
      active: activeAgencias.length 
    })

    // Combinar dados e retornar apenas anúncios de agências ativas
    const validAds = adsData.filter(ad => {
      const agencia = activeAgencias.find(ag => ag.id === ad.agencia_id)
      return agencia !== undefined
    }).map(ad => {
      const agencia = activeAgencias.find(ag => ag.id === ad.agencia_id)
      
      return {
        ...ad,
        agencia_id: agencia?.id,
        agencia_user_id: agencia?.user_id,
        agencia_whatsapp: agencia?.whatsapp,
        agencia_telefone: agencia?.telefone_principal,
        agencia_email: agencia?.email,
        agencia_slug: `${agencia?.nome_fantasia?.toLowerCase().replace(/\s+/g, '-')}-${agencia?.cidade?.toLowerCase()}`,
        // Atualizar informações com dados reais da agência
        company_name: agencia?.nome_fantasia || ad.company_name,
        location: agencia ? `${agencia.cidade}, ${agencia.estado}` : ad.location
      }
    })

    console.log('✅ Anúncios válidos finais:', validAds.length)
    
    return validAds

  } catch (error) {
    console.error('❌ Erro geral ao buscar anúncios pagos:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return []
  }
}

/**
 * Busca todos os anúncios pagos (para admin)
 */
export async function getAllPaidAds(): Promise<PaidAd[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('paid_ads')
      .select('*')
      .order('position_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar todos os anúncios:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar todos os anúncios:', error)
    return []
  }
}

/**
 * Busca anúncio por ID
 */
export async function getPaidAdById(id: string): Promise<PaidAd | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('paid_ads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar anúncio:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar anúncio:', error)
    return null
  }
}

/**
 * Cria novo anúncio pago
 */
export async function createPaidAd(adData: CreatePaidAdData): Promise<PaidAd | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('paid_ads')
      .insert([{
        ...adData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar anúncio:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao criar anúncio:', error)
    return null
  }
}

/**
 * Atualiza anúncio pago
 */
export async function updatePaidAd(id: string, adData: UpdatePaidAdData): Promise<PaidAd | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('paid_ads')
      .update({
        ...adData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar anúncio:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar anúncio:', error)
    return null
  }
}

/**
 * Ativa/Desativa anúncio pago
 */
export async function togglePaidAdStatus(id: string, isActive: boolean): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('paid_ads')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Erro ao alterar status do anúncio:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao alterar status do anúncio:', error)
    return false
  }
}

/**
 * Deleta anúncio pago
 */
export async function deletePaidAd(id: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('paid_ads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar anúncio:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar anúncio:', error)
    return false
  }
}

/**
 * Atualiza posições dos anúncios
 */
export async function updatePaidAdsOrder(updates: Array<{ id: string; position_order: number }>): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const promises = updates.map(({ id, position_order }) =>
      supabase
        .from('paid_ads')
        .update({ 
          position_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    )

    const results = await Promise.all(promises)
    
    const hasErrors = results.some(result => result.error)
    if (hasErrors) {
      console.error('Erro ao reordenar anúncios')
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao reordenar anúncios:', error)
    return false
  }
}

/**
 * Busca estatísticas dos anúncios
 */
export async function getPaidAdsStats() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('paid_ads')
      .select('is_active, is_featured')

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return {
        total: 0,
        active: 0,
        featured: 0,
        inactive: 0
      }
    }

    const total = data.length
    const active = data.filter(ad => ad.is_active).length
    const featured = data.filter(ad => ad.is_featured && ad.is_active).length
    const inactive = total - active

    return {
      total,
      active,
      featured,
      inactive
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      active: 0,
      featured: 0,
      inactive: 0
    }
  }
} 