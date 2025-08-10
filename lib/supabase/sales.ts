import { createClient } from './client'

export interface VehicleSale {
  id: string
  vehicle_id: string
  agency_id: string
  buyer_id?: string
  seller_id: string
  vehicle_title: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_year: number
  sale_price: number
  commission_rate: number
  commission_amount: number
  buyer_name: string
  buyer_email?: string
  buyer_phone?: string
  buyer_document?: string
  status: 'pendente' | 'negociacao' | 'concluida' | 'cancelada'
  notes?: string
  contract_url?: string
  payment_method?: string
  created_at: string
  updated_at: string
  completed_at?: string
  metadata?: any
  seller_name?: string
}

export interface SalesStats {
  total_sales: number
  completed_sales: number
  pending_sales: number
  negotiation_sales: number
  total_revenue: number
  total_commission: number
  average_ticket: number
  sales_today: number
  sales_this_week: number
  sales_this_month: number
}

// Obter estatísticas de vendas da agência
export async function getAgencySalesStats(agencyId: string): Promise<{ data: SalesStats | null; error: any }> {
  const supabase = createClient()

  console.log('📊 [SALES] Buscando estatísticas de vendas da agência:', agencyId)

  try {
    // Tentar usar a função PostgreSQL primeiro
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_agency_sales_stats', {
      agency_uuid: agencyId
    })

    if (!rpcError && rpcData) {
      console.log('✅ [SALES] Estatísticas obtidas via RPC:', rpcData)
      return { data: rpcData?.[0] || null, error: null }
    }

    // Se a função RPC falhar, fazer consulta SQL direta
    console.log('⚠️ [SALES] RPC falhou, tentando consulta SQL direta')
    
    // Primeiro, verificar se a tabela vehicle_sales existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('vehicle_sales')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.log('⚠️ [SALES] Tabela vehicle_sales não existe, retornando estatísticas zeradas')
      // Retornar estatísticas zeradas se a tabela não existir
      const emptyStats: SalesStats = {
        total_sales: 0,
        completed_sales: 0,
        pending_sales: 0,
        negotiation_sales: 0,
        total_revenue: 0,
        total_commission: 0,
        average_ticket: 0,
        sales_today: 0,
        sales_this_week: 0,
        sales_this_month: 0
      }
      return { data: emptyStats, error: null }
    }
    
    const { data, error } = await supabase
      .from('vehicle_sales')
      .select('*')
      .eq('agency_id', agencyId)

    if (error) {
      console.error('❌ [SALES] Erro ao buscar estatísticas:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
      return { data: null, error }
    }

    // Calcular estatísticas manualmente
    const sales = data || []
    const completedSales = sales.filter(s => s.status === 'concluida')
    const pendingSales = sales.filter(s => s.status === 'pendente')
    const negotiationSales = sales.filter(s => s.status === 'negociacao')
    
    const totalRevenue = completedSales.reduce((sum, sale) => sum + (sale.sale_price || 0), 0)
    const totalCommission = completedSales.reduce((sum, sale) => sum + (sale.commission_amount || 0), 0)
    const averageTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0
    
    const today = new Date().toISOString().split('T')[0]
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    
    const salesToday = sales.filter(s => s.created_at?.startsWith(today)).length
    const salesThisWeek = sales.filter(s => new Date(s.created_at) >= thisWeekStart).length
    const salesThisMonth = sales.filter(s => new Date(s.created_at) >= thisMonthStart).length

    const stats: SalesStats = {
      total_sales: sales.length,
      completed_sales: completedSales.length,
      pending_sales: pendingSales.length,
      negotiation_sales: negotiationSales.length,
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      average_ticket: averageTicket,
      sales_today: salesToday,
      sales_this_week: salesThisWeek,
      sales_this_month: salesThisMonth
    }

    console.log('✅ [SALES] Estatísticas calculadas:', stats)
    return { data: stats, error: null }
  } catch (error) {
    console.error('❌ [SALES] Erro inesperado:', error)
    return { data: null, error }
  }
}

// Obter vendas da agência
export async function getAgencySales(
  agencyId: string,
  statusFilter?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: VehicleSale[] | null; error: any }> {
  const supabase = createClient()

  console.log('📋 [SALES] Buscando vendas da agência:', agencyId, { statusFilter, limit, offset })

  try {
    // Tentar usar a função PostgreSQL primeiro
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_agency_sales', {
      agency_uuid: agencyId,
      status_filter: statusFilter === 'todos' ? null : statusFilter,
      limit_count: limit,
      offset_count: offset
    })

    if (!rpcError && rpcData) {
      console.log('✅ [SALES] Vendas obtidas via RPC:', rpcData.length)
      return { data: rpcData || [], error: null }
    }

    // Se a função RPC falhar, fazer consulta SQL direta
    console.log('⚠️ [SALES] RPC falhou, tentando consulta SQL direta')
    
    // Primeiro, verificar se a tabela vehicle_sales existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('vehicle_sales')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.log('⚠️ [SALES] Tabela vehicle_sales não existe, retornando dados vazios')
      // Retornar dados vazios se a tabela não existir
      return { data: [], error: null }
    }
    
    let query = supabase
      .from('vehicle_sales')
      .select(`
        id,
        vehicle_id,
        agency_id,
        vehicle_title,
        sale_price,
        buyer_name,
        status,
        created_at
      `)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Aplicar filtro de status se especificado
    if (statusFilter && statusFilter !== 'todos') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ [SALES] Erro ao buscar vendas:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
      return { data: null, error }
    }

    // Mapear os dados para incluir seller_name (buscar separadamente se necessário)
    const salesWithSellerName = (data || []).map(sale => ({
      id: sale.id,
      vehicle_id: sale.vehicle_id,
      agency_id: sale.agency_id,
      vehicle_title: sale.vehicle_title || 'Veículo não informado',
      sale_price: sale.sale_price || 0,
      buyer_name: sale.buyer_name || 'Comprador não informado',
      status: sale.status || 'pending',
      created_at: sale.created_at,
      seller_name: 'Vendedor não encontrado',
      // Campos padrão para compatibilidade
      buyer_id: undefined,
      seller_id: '',
      vehicle_brand: '',
      vehicle_model: '',
      vehicle_year: 0,
      commission_rate: 0,
      commission_amount: 0,
      buyer_email: undefined,
      buyer_phone: undefined,
      buyer_document: undefined,
      notes: null,
      contract_url: null,
      payment_method: null,
      updated_at: null,
      completed_at: null,
      metadata: null
    }))

    console.log('✅ [SALES] Vendas obtidas via SQL:', salesWithSellerName.length)
    return { data: salesWithSellerName, error: null }
  } catch (error) {
    console.error('❌ [SALES] Erro inesperado:', error)
    return { data: null, error }
  }
}

// Criar nova venda
export async function createVehicleSale(saleData: Partial<VehicleSale>): Promise<{ data: VehicleSale | null; error: any }> {
  const supabase = createClient()

  console.log('➕ [SALES] Criando nova venda:', saleData)

  try {
    const { data, error } = await supabase
      .from('vehicle_sales')
      .insert(saleData)
      .select()
      .single()

    if (error) {
      console.error('❌ [SALES] Erro ao criar venda:', error)
      return { data: null, error }
    }

    console.log('✅ [SALES] Venda criada:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [SALES] Erro inesperado:', error)
    return { data: null, error }
  }
}

// Atualizar venda
export async function updateVehicleSale(
  saleId: string,
  updates: Partial<VehicleSale>
): Promise<{ data: VehicleSale | null; error: any }> {
  const supabase = createClient()

  console.log('🔄 [SALES] Atualizando venda:', saleId, updates)

  try {
    const { data, error } = await supabase
      .from('vehicle_sales')
      .update(updates)
      .eq('id', saleId)
      .select()
      .single()

    if (error) {
      console.error('❌ [SALES] Erro ao atualizar venda:', error)
      return { data: null, error }
    }

    console.log('✅ [SALES] Venda atualizada:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [SALES] Erro inesperado:', error)
    return { data: null, error }
  }
}

// Deletar venda
export async function deleteVehicleSale(saleId: string): Promise<{ error: any }> {
  const supabase = createClient()

  console.log('🗑️ [SALES] Deletando venda:', saleId)

  try {
    const { error } = await supabase
      .from('vehicle_sales')
      .delete()
      .eq('id', saleId)

    if (error) {
      console.error('❌ [SALES] Erro ao deletar venda:', error)
      return { error }
    }

    console.log('✅ [SALES] Venda deletada')
    return { error: null }
  } catch (error) {
    console.error('❌ [SALES] Erro inesperado:', error)
    return { error }
  }
}

// Obter detalhes de uma venda específica
export async function getSaleDetails(saleId: string): Promise<{ data: VehicleSale | null; error: any }> {
  const supabase = createClient()

  console.log('🔍 [SALES] Buscando detalhes da venda:', saleId)

  try {
    const { data, error } = await supabase
      .from('vehicle_sales')
      .select(`
        *,
        seller:profiles!seller_id(nome),
        vehicle:veiculos(titulo, marca_nome, modelo_nome, ano_fabricacao, preco)
      `)
      .eq('id', saleId)
      .single()

    if (error) {
      console.error('❌ [SALES] Erro ao buscar detalhes:', error)
      return { data: null, error }
    }

    console.log('✅ [SALES] Detalhes obtidos:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ [SALES] Erro inesperado:', error)
    return { data: null, error }
  }
}

// Marcar venda como concluída
export async function completeSale(saleId: string): Promise<{ data: VehicleSale | null; error: any }> {
  return updateVehicleSale(saleId, {
    status: 'concluida',
    completed_at: new Date().toISOString()
  })
}

// Cancelar venda
export async function cancelSale(saleId: string, reason?: string): Promise<{ data: VehicleSale | null; error: any }> {
  return updateVehicleSale(saleId, {
    status: 'cancelada',
    notes: reason ? `Cancelada: ${reason}` : 'Venda cancelada'
  })
}

// Obter vendas por período
export async function getSalesByPeriod(
  agencyId: string,
  startDate: string,
  endDate: string
): Promise<{ data: VehicleSale[] | null; error: any }> {
  const supabase = createClient()

  console.log('📅 [SALES] Buscando vendas por período:', { agencyId, startDate, endDate })

  try {
    const { data, error } = await supabase
      .from('vehicle_sales')
      .select('*')
      .eq('agency_id', agencyId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [SALES] Erro ao buscar vendas por período:', error)
      return { data: null, error }
    }

    console.log('✅ [SALES] Vendas por período obtidas:', data?.length || 0)
    return { data: data || [], error: null }
  } catch (error) {
    console.error('❌ [SALES] Erro inesperado:', error)
    return { data: null, error }
  }
}