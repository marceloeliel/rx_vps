require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSalesFunction() {
  console.log('🧪 Testando função de vendas com UUID válido...');
  
  // Gerar UUIDs válidos
  const testAgencyId = randomUUID();
  const testVehicleId = randomUUID();
  
  console.log(`📋 Agency ID: ${testAgencyId}`);
  console.log(`📋 Vehicle ID: ${testVehicleId}`);
  
  try {
    // 1. Inserir dados de teste
    console.log('\n1. Inserindo dados de teste...');
    const { data: insertData, error: insertError } = await supabase
      .from('vehicle_sales')
      .insert({
        agency_id: testAgencyId,
        vehicle_id: testVehicleId,
        sale_price: 50000,
        status: 'completed',
        vehicle_title: 'Honda Civic 2020',
        buyer_name: 'João Silva'
      })
      .select();
    
    if (insertError) {
      console.log('❌ Erro na inserção:', insertError);
    } else {
      console.log('✅ Dados inseridos:', insertData);
    }
    
    // 2. Buscar estatísticas
    console.log('\n2. Buscando estatísticas...');
    const { data: statsData, error: statsError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .eq('agency_id', testAgencyId);
    
    if (statsError) {
      console.log('❌ Erro na busca:', statsError);
    } else {
      console.log('✅ Estatísticas encontradas:', statsData);
      
      // Calcular estatísticas básicas
      const totalSales = statsData.length;
      const totalRevenue = statsData.reduce((sum, sale) => sum + (sale.sale_price || 0), 0);
      const completedSales = statsData.filter(sale => sale.status === 'completed').length;
      
      console.log('\n📊 Resumo das estatísticas:');
      console.log(`- Total de vendas: ${totalSales}`);
      console.log(`- Receita total: R$ ${totalRevenue.toLocaleString('pt-BR')}`);
      console.log(`- Vendas concluídas: ${completedSales}`);
    }
    
    // 3. Limpar dados de teste
    console.log('\n3. Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('vehicle_sales')
      .delete()
      .eq('agency_id', testAgencyId);
    
    if (deleteError) {
      console.log('❌ Erro na limpeza:', deleteError);
    } else {
      console.log('✅ Dados de teste removidos');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
  
  console.log('\n🎉 Teste concluído!');
}

testSalesFunction();