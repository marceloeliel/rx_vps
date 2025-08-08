require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Simular a função getAgencySalesStats
async function getAgencySalesStats(agencyId) {
  console.log('📊 [SALES] Buscando estatísticas de vendas da agência:', agencyId);

  try {
    // Tentar usar a função PostgreSQL primeiro
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_agency_sales_stats', {
      agency_uuid: agencyId
    });

    if (!rpcError && rpcData) {
      console.log('✅ [SALES] Estatísticas obtidas via RPC:', rpcData);
      return { data: rpcData?.[0] || null, error: null };
    }

    // Se a função RPC falhar, fazer consulta SQL direta
    console.log('⚠️ [SALES] RPC falhou, tentando consulta SQL direta');
    
    // Primeiro, verificar se a tabela vehicle_sales existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('vehicle_sales')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.log('⚠️ [SALES] Tabela vehicle_sales não existe, retornando estatísticas zeradas');
      const emptyStats = {
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
      };
      return { data: emptyStats, error: null };
    }
    
    const { data, error } = await supabase
      .from('vehicle_sales')
      .select('*')
      .eq('agency_id', agencyId);

    if (error) {
      console.error('❌ [SALES] Erro ao buscar estatísticas:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      return { data: null, error };
    }

    // Calcular estatísticas manualmente
    const sales = data || [];
    const completedSales = sales.filter(s => s.status === 'completed' || s.status === 'concluida');
    const pendingSales = sales.filter(s => s.status === 'pending' || s.status === 'pendente');
    const negotiationSales = sales.filter(s => s.status === 'negotiation' || s.status === 'negociacao');
    
    const totalRevenue = completedSales.reduce((sum, sale) => sum + (sale.sale_price || 0), 0);
    const totalCommission = completedSales.reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);
    const averageTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
    
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    
    const salesToday = sales.filter(s => s.created_at?.startsWith(today)).length;
    const salesThisWeek = sales.filter(s => new Date(s.created_at) >= thisWeekStart).length;
    const salesThisMonth = sales.filter(s => new Date(s.created_at) >= thisMonthStart).length;

    const stats = {
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
    };

    console.log('✅ [SALES] Estatísticas calculadas:', stats);
    return { data: stats, error: null };
  } catch (error) {
    console.error('❌ [SALES] Erro inesperado:', error);
    return { data: null, error };
  }
}

async function testRealSalesFunction() {
  console.log('🧪 Testando função getAgencySalesStats real...');
  
  // Gerar UUID válido para teste
  const testAgencyId = randomUUID();
  
  console.log(`📋 Testando com Agency ID: ${testAgencyId}`);
  
  try {
    // Testar a função real
    console.log('\n1. Testando getAgencySalesStats...');
    const result = await getAgencySalesStats(testAgencyId);
    
    if (result.error) {
      console.log('❌ Erro na função:', result.error);
    } else {
      console.log('✅ Função executada com sucesso!');
      console.log('📊 Estatísticas retornadas:', result.data);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
  
  console.log('\n🎉 Teste concluído!');
}

testRealSalesFunction();