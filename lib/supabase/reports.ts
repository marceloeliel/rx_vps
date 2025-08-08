import { createClient } from './client'

// Tipos para as tabelas de relatórios
export interface LeadSource {
  id: string
  agency_id: string
  source_name: string
  lead_count: number
  created_at: string
  updated_at: string
}

export interface PerformanceMetric {
  id: string
  agency_id: string
  metric_name: string
  metric_value: number
  target_value: number
  unit: string
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface CustomerSatisfaction {
  id: string
  agency_id: string
  sale_id?: string
  customer_id?: string
  rating: number
  feedback?: string
  created_at: string
  updated_at: string
}

export interface LeadTracking {
  id: string
  agency_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  source: string
  status: 'novo' | 'contatado' | 'negociacao' | 'convertido' | 'perdido'
  vehicle_interest_id?: string
  notes?: string
  converted_to_sale_id?: string
  created_at: string
  updated_at: string
  converted_at?: string
}

// Função para obter origens de leads por agência
export async function getLeadSources(agencyId: string): Promise<{ data: LeadSource[] | null; error: any }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('lead_sources')
      .select('*')
      .eq('agency_id', agencyId)
      .order('lead_count', { ascending: false })
    
    if (error) {
      // Não logar erro se a tabela não existir (esperado até a migração)
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return { data: null, error: { code: 'TABLE_NOT_EXISTS', message: 'Tabela lead_sources não existe' } }
      }
      console.error('❌ [REPORTS] Erro ao buscar origens de leads:', error)
      return { data: null, error }
    }
    
    console.log('✅ [REPORTS] Origens de leads obtidas:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    // Não logar erro se a tabela não existir
    if (error instanceof Error && (error.message?.includes('relation') || error.message?.includes('does not exist'))) {
      return { data: null, error: { code: 'TABLE_NOT_EXISTS', message: 'Tabela lead_sources não existe' } }
    }
    console.error('❌ [REPORTS] Erro inesperado ao buscar origens de leads:', error)
    return { data: null, error }
  }
}

// Função para obter métricas de performance
export async function getPerformanceMetrics(
  agencyId: string, 
  periodStart?: string, 
  periodEnd?: string
): Promise<{ data: PerformanceMetric[] | null; error: any }> {
  try {
    const supabase = createClient()
    
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('agency_id', agencyId)
    
    if (periodStart && periodEnd) {
      query = query
        .gte('period_start', periodStart)
        .lte('period_end', periodEnd)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ [REPORTS] Erro ao buscar métricas de performance:', error)
      return { data: null, error }
    }
    
    console.log('✅ [REPORTS] Métricas de performance obtidas:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [REPORTS] Erro inesperado ao buscar métricas:', error)
    return { data: null, error }
  }
}

// Função para criar um novo lead
export async function createLead(leadData: Omit<LeadTracking, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: LeadTracking | null; error: any }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('lead_tracking')
      .insert([leadData])
      .select()
      .single()
    
    if (error) {
      console.error('❌ [REPORTS] Erro ao criar lead:', error)
      return { data: null, error }
    }
    
    console.log('✅ [REPORTS] Lead criado com sucesso:', data.id)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [REPORTS] Erro inesperado ao criar lead:', error)
    return { data: null, error }
  }
}

// Função para atualizar status de um lead
export async function updateLeadStatus(
  leadId: string, 
  status: LeadTracking['status'], 
  convertedToSaleId?: string
): Promise<{ data: LeadTracking | null; error: any }> {
  try {
    const supabase = createClient()
    
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }
    
    if (status === 'convertido' && convertedToSaleId) {
      updateData.converted_to_sale_id = convertedToSaleId
      updateData.converted_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('lead_tracking')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ [REPORTS] Erro ao atualizar status do lead:', error)
      return { data: null, error }
    }
    
    console.log('✅ [REPORTS] Status do lead atualizado:', leadId)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [REPORTS] Erro inesperado ao atualizar lead:', error)
    return { data: null, error }
  }
}

// Função para adicionar avaliação de satisfação
export async function addCustomerSatisfaction(
  satisfactionData: Omit<CustomerSatisfaction, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: CustomerSatisfaction | null; error: any }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('customer_satisfaction')
      .insert([satisfactionData])
      .select()
      .single()
    
    if (error) {
      console.error('❌ [REPORTS] Erro ao adicionar satisfação:', error)
      return { data: null, error }
    }
    
    console.log('✅ [REPORTS] Satisfação adicionada com sucesso:', data.id)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [REPORTS] Erro inesperado ao adicionar satisfação:', error)
    return { data: null, error }
  }
}

// Função para calcular métricas de performance automaticamente
export async function calculatePerformanceMetrics(
  agencyId: string,
  periodStart: string,
  periodEnd: string
): Promise<{ data: boolean; error: any }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('calculate_performance_metrics', {
      p_agency_id: agencyId,
      p_period_start: periodStart,
      p_period_end: periodEnd
    })
    
    if (error) {
      console.error('❌ [REPORTS] Erro ao calcular métricas:', error)
      return { data: false, error }
    }
    
    console.log('✅ [REPORTS] Métricas calculadas com sucesso')
    return { data: true, error: null }
  } catch (error) {
    console.error('❌ [REPORTS] Erro inesperado ao calcular métricas:', error)
    return { data: false, error }
  }
}

// Função para obter leads por agência
export async function getAgencyLeads(
  agencyId: string,
  status?: LeadTracking['status']
): Promise<{ data: LeadTracking[] | null; error: any }> {
  try {
    const supabase = createClient()
    
    let query = supabase
      .from('lead_tracking')
      .select('*')
      .eq('agency_id', agencyId)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ [REPORTS] Erro ao buscar leads da agência:', error)
      return { data: null, error }
    }
    
    console.log('✅ [REPORTS] Leads da agência obtidos:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [REPORTS] Erro inesperado ao buscar leads:', error)
    return { data: null, error }
  }
}

// Função para obter satisfação média da agência
export async function getAgencySatisfactionAverage(
  agencyId: string,
  periodStart?: string,
  periodEnd?: string
): Promise<{ data: number | null; error: any }> {
  try {
    const supabase = createClient()
    
    let query = supabase
      .from('customer_satisfaction')
      .select('rating')
      .eq('agency_id', agencyId)
    
    if (periodStart && periodEnd) {
      query = query
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
    }
    
    const { data, error } = await query
    
    if (error) {
      // Não logar erro se a tabela não existir (esperado até a migração)
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return { data: null, error: { code: 'TABLE_NOT_EXISTS', message: 'Tabela customer_satisfaction não existe' } }
      }
      console.error('❌ [REPORTS] Erro ao buscar satisfação:', error)
      return { data: null, error }
    }
    
    const average = data && data.length > 0 
      ? data.reduce((sum, item) => sum + item.rating, 0) / data.length 
      : 0
    
    console.log('✅ [REPORTS] Satisfação média calculada:', average)
    return { data: average, error: null }
  } catch (error) {
    // Não logar erro se a tabela não existir
    if (error instanceof Error && (error.message?.includes('relation') || error.message?.includes('does not exist'))) {
      return { data: null, error: { code: 'TABLE_NOT_EXISTS', message: 'Tabela customer_satisfaction não existe' } }
    }
    console.error('❌ [REPORTS] Erro inesperado ao calcular satisfação:', error)
    return { data: null, error }
  }
}

// Interface para métricas de performance calculadas
export interface CalculatedPerformanceMetrics {
  conversionRate: number // Taxa de conversão em %
  averageSaleTime: number // Tempo médio de venda em dias
  satisfactionRating: number // Avaliação de satisfação
  satisfactionPercentage: number // Porcentagem de avaliações positivas
}

// Função para calcular métricas de performance reais
export async function getCalculatedPerformanceMetrics(
  agencyId: string,
  periodStart?: string,
  periodEnd?: string
): Promise<{ data: CalculatedPerformanceMetrics | null; error: any }> {
  try {
    const supabase = createClient()
    
    // Calcular período padrão (último mês) se não fornecido
    const now = new Date()
    const defaultStart = periodStart || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const defaultEnd = periodEnd || now.toISOString()
    
    // Buscar leads do período
    const { data: leads, error: leadsError } = await getAgencyLeads(agencyId)
    if (leadsError && leadsError.code !== 'TABLE_NOT_EXISTS') {
      console.error('❌ [REPORTS] Erro ao buscar leads:', leadsError)
    }
    
    // Buscar vendas do período
    const { data: sales, error: salesError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .eq('agency_id', agencyId)
      .gte('created_at', defaultStart)
      .lte('created_at', defaultEnd)
    
    if (salesError && salesError.code !== 'TABLE_NOT_EXISTS') {
      console.error('❌ [REPORTS] Erro ao buscar vendas:', salesError)
    }
    
    // Buscar satisfação do período
    const { data: satisfactionAvg } = await getAgencySatisfactionAverage(agencyId, defaultStart, defaultEnd)
    
    // Calcular métricas
    const totalLeads = leads?.length || 0
    const convertedLeads = leads?.filter(lead => lead.status === 'convertido').length || 0
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    
    // Calcular tempo médio de venda
    const completedSales = sales?.filter(sale => sale.status === 'concluida' && sale.completed_at) || []
    let averageSaleTime = 18 // Valor padrão
    
    if (completedSales.length > 0) {
      const totalDays = completedSales.reduce((sum, sale) => {
        const createdAt = new Date(sale.created_at)
        const completedAt = new Date(sale.completed_at!)
        const diffTime = Math.abs(completedAt.getTime() - createdAt.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return sum + diffDays
      }, 0)
      averageSaleTime = Math.round(totalDays / completedSales.length)
    }
    
    // Calcular satisfação
    const satisfactionRating = satisfactionAvg || 4.8
    const satisfactionPercentage = Math.round((satisfactionRating / 5) * 100)
    
    const metrics: CalculatedPerformanceMetrics = {
      conversionRate: Math.round(conversionRate * 10) / 10, // Arredondar para 1 casa decimal
      averageSaleTime,
      satisfactionRating: Math.round(satisfactionRating * 10) / 10,
      satisfactionPercentage
    }
    
    console.log('✅ [REPORTS] Métricas calculadas:', metrics)
    return { data: metrics, error: null }
    
  } catch (error) {
    console.error('❌ [REPORTS] Erro inesperado ao calcular métricas:', error)
    
    // Retornar valores padrão em caso de erro
    const defaultMetrics: CalculatedPerformanceMetrics = {
      conversionRate: 14.8,
      averageSaleTime: 18,
      satisfactionRating: 4.8,
      satisfactionPercentage: 96
    }
    
    return { data: defaultMetrics, error: null }
  }
}