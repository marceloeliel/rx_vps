const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simular a função getAgencySalesStats
async function getAgencySalesStats(agencyId) {
  try {
    console.log(`🔍 Buscando estatísticas para agência: ${agencyId}`)
    
    // Primeiro, verificar se a função RPC existe
    console.log('\n1. Testando função RPC get_agency_sales_stats...')
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_agency_sales_stats', { agency_id: agencyId })
    
    if (rpcError) {
      console.log('⚠️ RPC não disponível:', rpcError.message)
      console.log('📝 Usando consulta SQL direta...')
      
      // Verificar se a tabela vehicle_sales existe
      console.log('\n2. Verificando existência da tabela vehicle_sales...')
      const { data: tableCheck, error: tableError } = await supabase
        .from('vehicle_sales')
        .select('id')
        .limit(1)
      
      if (tableError) {
        console.error('❌ Tabela vehicle_sales não existe:', tableError)
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
        }
        return { data: emptyStats, error: null }
      }
      
      console.log('✅ Tabela vehicle_sales existe')
      
      // Buscar dados da tabela
      console.log('\n3. Buscando dados da tabela...')
      const { data, error } = await supabase
        .from('vehicle_sales')
        .select('*')
        .eq('agency_id', agencyId)
      
      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        return { data: null, error }
      }
      
      console.log(`📊 Encontrados ${data?.length || 0} registros`)
      
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
      }
      
      console.log('✅ Estatísticas calculadas:', stats)
      return { data: stats, error: null }
    } else {
      console.log('✅ RPC funcionando:', rpcData)
      return { data: rpcData, error: null }
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { data: null, error }
  }
}

async function testSalesFunction() {
  console.log('🧪 Testando função de estatísticas de vendas...')
  
  try {
    // Primeiro, verificar estrutura da tabela
    console.log('\n📋 Verificando estrutura da tabela vehicle_sales...')
    const { data: structureTest, error: structureError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .limit(1)
    
    if (structureError) {
      console.error('❌ Erro na estrutura da tabela:', structureError)
      console.log('\n⚠️ A tabela vehicle_sales precisa ser corrigida!')
      console.log('📝 Execute o arquivo fix-vehicle-sales-manual.sql no Supabase Dashboard')
      return
    }
    
    console.log('✅ Tabela acessível')
    
    // Testar com uma agência fictícia
    const testAgencyId = 'test-agency-123'
    console.log(`\n🔍 Testando com agência: ${testAgencyId}`)
    
    const result = await getAgencySalesStats(testAgencyId)
    
    if (result.error) {
      console.error('❌ Erro na função:', result.error)
    } else {
      console.log('✅ Função funcionando corretamente!')
      console.log('📊 Resultado:', result.data)
    }
    
    // Testar inserção de dados de exemplo (se a estrutura estiver correta)
    console.log('\n🧪 Testando inserção de dados de exemplo...')
    const testSale = {
      vehicle_id: 'test-vehicle-id',
      agency_id: testAgencyId,
      seller_id: 'test-seller-id',
      vehicle_title: 'Teste Veículo',
      vehicle_brand: 'Teste',
      vehicle_model: 'Modelo',
      vehicle_year: 2023,
      vehicle_price: 50000,
      sale_price: 50000,
      commission_rate: 5,
      commission_amount: 2500,
      buyer_name: 'Comprador Teste',
      status: 'pendente'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('vehicle_sales')
      .insert(testSale)
      .select()
    
    if (insertError) {
      console.log('⚠️ Erro na inserção (pode ser esperado):', {
        message: insertError.message,
        code: insertError.code
      })
      
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('\n❌ A tabela ainda não tem a estrutura correta!')
        console.log('📝 Execute o arquivo fix-vehicle-sales-manual.sql no Supabase Dashboard')
      }
    } else {
      console.log('✅ Inserção bem-sucedida:', insertData)
      
      // Testar a função novamente com dados
      console.log('\n🔍 Testando função com dados inseridos...')
      const resultWithData = await getAgencySalesStats(testAgencyId)
      console.log('📊 Resultado com dados:', resultWithData.data)
      
      // Limpar dados de teste
      if (insertData && insertData[0]) {
        await supabase
          .from('vehicle_sales')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🧹 Dados de teste removidos')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

testSalesFunction()
  .then(() => {
    console.log('\n✅ Teste concluído')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro no teste:', error)
    process.exit(1)
  })