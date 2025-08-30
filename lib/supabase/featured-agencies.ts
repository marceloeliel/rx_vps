import { createClient } from './client'

export interface FeaturedAgency {
  id: string
  agencia_id: string
  title: string
  description?: string
  highlight_text?: string
  image_url?: string
  banner_url?: string
  display_order: number
  is_active: boolean
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
  created_by?: string
  // Dados da agência (join)
  agencia_nome?: string
  agencia_email?: string
  agencia_whatsapp?: string
  agencia_cidade?: string
  agencia_estado?: string
}

export interface CreateFeaturedAgencyData {
  agencia_id: string
  title: string
  description?: string
  highlight_text?: string
  image_url?: string
  banner_url?: string
  display_order?: number
  is_active?: boolean
  start_date?: string
  end_date?: string
}

export interface UpdateFeaturedAgencyData {
  title?: string
  description?: string
  highlight_text?: string
  image_url?: string
  banner_url?: string
  display_order?: number
  is_active?: boolean
  start_date?: string
  end_date?: string
}

// Buscar todas as agências em destaque (para admin)
export async function getAllFeaturedAgencies(): Promise<FeaturedAgency[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('featured_agencies')
      .select(`
        *,
        profiles!featured_agencies_agencia_id_fkey (
          nome_completo,
          email,
          whatsapp,
          cidade,
          estado
        )
      `)
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('Erro ao buscar agências em destaque:', error)
      throw error
    }
    
    return (data || []).map(item => ({
      ...item,
      agencia_nome: item.profiles?.nome_completo,
      agencia_email: item.profiles?.email,
      agencia_whatsapp: item.profiles?.whatsapp,
      agencia_cidade: item.profiles?.cidade,
      agencia_estado: item.profiles?.estado
    }))
  } catch (error) {
    console.error('Erro ao buscar agências em destaque:', error)
    return []
  }
}

// Buscar agências em destaque ativas (para exibição pública)
export async function getActiveFeaturedAgencies(): Promise<FeaturedAgency[]> {
  try {
    const supabase = createClient()
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('featured_agencies')
      .select(`
        *,
        profiles:agencia_id (
          nome_completo,
          email,
          whatsapp,
          cidade,
          estado
        )
      `)
      .eq('is_active', true)
      .lte('start_date', now)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('Erro ao buscar agências em destaque ativas:', error)
      throw error
    }
    
    return (data || []).map(item => ({
      ...item,
      agencia_nome: item.profiles?.nome_completo,
      agencia_email: item.profiles?.email,
      agencia_whatsapp: item.profiles?.whatsapp,
      agencia_cidade: item.profiles?.cidade,
      agencia_estado: item.profiles?.estado
    }))
  } catch (error) {
    console.error('Erro ao buscar agências em destaque ativas:', error)
    return []
  }
}

// Criar nova agência em destaque
export async function createFeaturedAgency(data: CreateFeaturedAgencyData): Promise<FeaturedAgency | null> {
  try {
    const supabase = createClient()
    
    // Buscar o próximo display_order se não fornecido
    if (data.display_order === undefined) {
      const { data: maxOrder } = await supabase
        .from('featured_agencies')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()
      
      data.display_order = (maxOrder?.display_order || 0) + 1
    }
    
    const { data: result, error } = await supabase
      .from('featured_agencies')
      .insert(data)
      .select(`
        *,
        profiles!featured_agencies_agencia_id_fkey (
          nome_completo,
          email,
          whatsapp,
          cidade,
          estado
        )
      `)
      .single()
    
    if (error) {
      console.error('Erro ao criar agência em destaque:', error)
      throw error
    }
    
    return {
      ...result,
      agencia_nome: result.profiles?.nome_completo,
      agencia_email: result.profiles?.email,
      agencia_whatsapp: result.profiles?.whatsapp,
      agencia_cidade: result.profiles?.cidade,
      agencia_estado: result.profiles?.estado
    }
  } catch (error) {
    console.error('Erro ao criar agência em destaque:', error)
    return null
  }
}

// Atualizar agência em destaque
export async function updateFeaturedAgency(id: string, data: UpdateFeaturedAgencyData): Promise<FeaturedAgency | null> {
  try {
    const supabase = createClient()
    
    const { data: result, error } = await supabase
      .from('featured_agencies')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        profiles!featured_agencies_agencia_id_fkey (
          nome_completo,
          email,
          whatsapp,
          cidade,
          estado
        )
      `)
      .single()
    
    if (error) {
      console.error('Erro ao atualizar agência em destaque:', error)
      throw error
    }
    
    return {
      ...result,
      agencia_nome: result.profiles?.nome_completo,
      agencia_email: result.profiles?.email,
      agencia_whatsapp: result.profiles?.whatsapp,
      agencia_cidade: result.profiles?.cidade,
      agencia_estado: result.profiles?.estado
    }
  } catch (error) {
    console.error('Erro ao atualizar agência em destaque:', error)
    return null
  }
}

// Deletar agência em destaque
export async function deleteFeaturedAgency(id: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('featured_agencies')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao deletar agência em destaque:', error)
      throw error
    }
    
    return true
  } catch (error) {
    console.error('Erro ao deletar agência em destaque:', error)
    return false
  }
}

// Ativar/desativar agência em destaque
export async function toggleFeaturedAgencyStatus(id: string, isActive: boolean): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('featured_agencies')
      .update({ is_active: isActive })
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao alterar status da agência em destaque:', error)
      throw error
    }
    
    return true
  } catch (error) {
    console.error('Erro ao alterar status da agência em destaque:', error)
    return false
  }
}

// Reordenar agências em destaque
export async function reorderFeaturedAgencies(agencies: { id: string; display_order: number }[]): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Atualizar cada agência com sua nova ordem
    const updates = agencies.map(agency => 
      supabase
        .from('featured_agencies')
        .update({ display_order: agency.display_order })
        .eq('id', agency.id)
    )
    
    const results = await Promise.all(updates)
    
    // Verificar se alguma atualização falhou
    const hasError = results.some(result => result.error)
    
    if (hasError) {
      console.error('Erro ao reordenar agências em destaque')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao reordenar agências em destaque:', error)
    return false
  }
}

// Buscar agências disponíveis para destaque (que não estão já em destaque)
export async function getAvailableAgencies(): Promise<{ id: string; nome_completo: string; email: string; cidade?: string; estado?: string }[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome_completo, email, cidade, estado')
      .not('id', 'in', `(
        SELECT agencia_id FROM featured_agencies WHERE is_active = true
      )`)
      .not('nome_completo', 'is', null)
      .order('nome_completo')
    
    if (error) {
      console.error('Erro ao buscar agências disponíveis:', error)
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Erro ao buscar agências disponíveis:', error)
    return []
  }
}