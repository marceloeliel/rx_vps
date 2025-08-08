const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ecdmpndeunbzhaihabvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura da tabela vehicle_sales...');
  
  try {
    // Tentar inserir um registro de teste para descobrir quais colunas existem
    console.log('\n🧪 Testando inserção para descobrir colunas...');
    
    // Teste 1: Inserção vazia
    const { data: emptyInsert, error: emptyError } = await supabase
      .from('vehicle_sales')
      .insert({})
      .select();
    
    if (emptyError) {
      console.log('❌ Erro na inserção vazia:', emptyError.message);
    } else {
      console.log('✅ Inserção vazia bem-sucedida:');
      console.log('📋 Colunas disponíveis:', Object.keys(emptyInsert[0]));
      
      // Limpar o registro de teste
      await supabase
        .from('vehicle_sales')
        .delete()
        .eq('id', emptyInsert[0].id);
    }
    
    // Teste 2: Tentar inserir com agency_id
    console.log('\n🧪 Testando inserção com agency_id...');
    const { data: agencyTest, error: agencyError } = await supabase
      .from('vehicle_sales')
      .insert({ agency_id: '00000000-0000-0000-0000-000000000000' })
      .select();
    
    if (agencyError) {
      console.log('❌ Erro com agency_id:', agencyError.message);
    } else {
      console.log('✅ agency_id existe na tabela');
      // Limpar
      await supabase
        .from('vehicle_sales')
        .delete()
        .eq('id', agencyTest[0].id);
    }
    
    // Teste 3: Tentar inserir com vehicle_id
    console.log('\n🧪 Testando inserção com vehicle_id...');
    const { data: vehicleTest, error: vehicleError } = await supabase
      .from('vehicle_sales')
      .insert({ vehicle_id: '00000000-0000-0000-0000-000000000000' })
      .select();
    
    if (vehicleError) {
      console.log('❌ Erro com vehicle_id:', vehicleError.message);
    } else {
      console.log('✅ vehicle_id existe na tabela');
      // Limpar
      await supabase
        .from('vehicle_sales')
        .delete()
        .eq('id', vehicleTest[0].id);
    }
    
    // Teste 4: Tentar inserir com sale_price
    console.log('\n🧪 Testando inserção com sale_price...');
    const { data: priceTest, error: priceError } = await supabase
      .from('vehicle_sales')
      .insert({ sale_price: 50000.00 })
      .select();
    
    if (priceError) {
      console.log('❌ Erro com sale_price:', priceError.message);
    } else {
      console.log('✅ sale_price existe na tabela');
      // Limpar
      await supabase
        .from('vehicle_sales')
        .delete()
        .eq('id', priceTest[0].id);
    }
    
    // Teste 5: Tentar inserir com status
    console.log('\n🧪 Testando inserção com status...');
    const { data: statusTest, error: statusError } = await supabase
      .from('vehicle_sales')
      .insert({ status: 'pending' })
      .select();
    
    if (statusError) {
      console.log('❌ Erro com status:', statusError.message);
    } else {
      console.log('✅ status existe na tabela');
      // Limpar
      await supabase
        .from('vehicle_sales')
        .delete()
        .eq('id', statusTest[0].id);
    }
    
    console.log('\n📋 Resumo da estrutura da tabela:');
    console.log('- A tabela vehicle_sales existe');
    console.log('- Verificar logs acima para ver quais colunas existem');
    console.log('\n💡 Solução: Execute o script SQL fix-vehicle-sales-complete.sql no Supabase Dashboard');
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message);
  }
}

checkTableStructure();