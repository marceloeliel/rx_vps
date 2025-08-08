const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações do Supabase
const supabaseUrl = 'https://ecdmpndeunbzhaihabvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeVehicleSalesFix() {
  try {
    console.log('🔧 Iniciando verificação da tabela vehicle_sales...');
    
    // Verificar se a tabela existe e quais colunas estão presentes
    console.log('🔍 Verificando estrutura atual...');
    
    const { data: testData, error: testError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro ao acessar tabela:', testError.message);
      
      if (testError.message.includes('does not exist')) {
        console.log('\n📋 SOLUÇÃO MANUAL NECESSÁRIA:');
        console.log('A tabela vehicle_sales não existe. Você precisa:');
        console.log('\n1. Acessar o Supabase Dashboard em: https://supabase.com/dashboard');
        console.log('2. Ir para o projeto: ecdmpndeunbzhaihabvi');
        console.log('3. Navegar para SQL Editor');
        console.log('4. Executar o seguinte script SQL:');
        console.log('\n```sql');
        console.log('CREATE TABLE vehicle_sales (');
        console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
        console.log('  vehicle_id UUID,');
        console.log('  agency_id UUID,');
        console.log('  buyer_id UUID,');
        console.log('  seller_id UUID,');
        console.log('  vehicle_title VARCHAR(255),');
        console.log('  vehicle_brand VARCHAR(100),');
        console.log('  vehicle_model VARCHAR(100),');
        console.log('  vehicle_year INTEGER,');
        console.log('  vehicle_price DECIMAL(12,2),');
        console.log('  sale_price DECIMAL(12,2) NOT NULL DEFAULT 0,');
        console.log('  commission_rate DECIMAL(5,2) DEFAULT 5.00,');
        console.log('  commission_amount DECIMAL(12,2) DEFAULT 0,');
        console.log('  buyer_name VARCHAR(255),');
        console.log('  buyer_email VARCHAR(255),');
        console.log('  buyer_phone VARCHAR(20),');
        console.log('  buyer_cpf VARCHAR(14),');
        console.log('  status VARCHAR(20) DEFAULT \'pending\' CHECK (status IN (\'pending\', \'negotiation\', \'completed\', \'cancelled\')),');
        console.log('  notes TEXT,');
        console.log('  contract_url VARCHAR(500),');
        console.log('  payment_method VARCHAR(50),');
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  completed_at TIMESTAMP WITH TIME ZONE,');
        console.log('  metadata JSONB DEFAULT \'{}\'');
        console.log(');');
        console.log('```');
        return;
      }
    } else {
      console.log('✅ Tabela vehicle_sales existe!');
      console.log('📊 Registros na tabela:', testData.length);
    }
    
    // Testar inserção das colunas essenciais
    console.log('\n🧪 Testando colunas essenciais...');
    
    const testRecord = {
      agency_id: '11111111-1111-1111-1111-111111111111',
      vehicle_id: '22222222-2222-2222-2222-222222222222',
      sale_price: 50000,
      status: 'pending',
      vehicle_title: 'Teste',
      buyer_name: 'Teste'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('vehicle_sales')
      .insert(testRecord)
      .select();
    
    if (insertError) {
      console.log('❌ Erro ao inserir registro de teste:', insertError.message);
      
      // Verificar quais colunas estão faltando
      const missingColumns = [];
      if (insertError.message.includes('vehicle_id')) missingColumns.push('vehicle_id');
      if (insertError.message.includes('agency_id')) missingColumns.push('agency_id');
      if (insertError.message.includes('sale_price')) missingColumns.push('sale_price');
      if (insertError.message.includes('status')) missingColumns.push('status');
      if (insertError.message.includes('vehicle_title')) missingColumns.push('vehicle_title');
      if (insertError.message.includes('buyer_name')) missingColumns.push('buyer_name');
      
      if (missingColumns.length > 0) {
        console.log('❌ Colunas faltando:', missingColumns.join(', '));
        console.log('\n📋 SOLUÇÃO MANUAL NECESSÁRIA:');
        console.log('Você precisa adicionar as colunas faltantes. Execute no Supabase SQL Editor:');
        console.log('\n```sql');
        
        if (missingColumns.includes('vehicle_id')) {
          console.log('ALTER TABLE vehicle_sales ADD COLUMN vehicle_id UUID;');
        }
        if (missingColumns.includes('agency_id')) {
          console.log('ALTER TABLE vehicle_sales ADD COLUMN agency_id UUID;');
        }
        if (missingColumns.includes('sale_price')) {
          console.log('ALTER TABLE vehicle_sales ADD COLUMN sale_price DECIMAL(12,2) NOT NULL DEFAULT 0;');
        }
        if (missingColumns.includes('status')) {
          console.log('ALTER TABLE vehicle_sales ADD COLUMN status VARCHAR(20) DEFAULT \'pending\' CHECK (status IN (\'pending\', \'negotiation\', \'completed\', \'cancelled\'));');
        }
        if (missingColumns.includes('vehicle_title')) {
          console.log('ALTER TABLE vehicle_sales ADD COLUMN vehicle_title VARCHAR(255);');
        }
        if (missingColumns.includes('buyer_name')) {
          console.log('ALTER TABLE vehicle_sales ADD COLUMN buyer_name VARCHAR(255);');
        }
        
        console.log('```');
        console.log('\n🔗 Link direto para SQL Editor:');
        console.log('https://supabase.com/dashboard/project/ecdmpndeunbzhaihabvi/sql');
      }
    } else {
      console.log('✅ Todas as colunas essenciais estão funcionando!');
      console.log('📝 Registro de teste criado:', insertData[0].id);
      
      // Limpar registro de teste
      await supabase
        .from('vehicle_sales')
        .delete()
        .eq('id', insertData[0].id);
      
      console.log('🧹 Registro de teste removido');
      console.log('\n🎉 A tabela vehicle_sales está funcionando corretamente!');
      console.log('✅ O erro "column vehicle_id does not exist" deve estar resolvido.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar a verificação
executeVehicleSalesFix();