const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixVehicleSalesTable() {
  console.log('🔧 Corrigindo estrutura da tabela vehicle_sales...')
  
  try {
    // SQL para adicionar todas as colunas faltantes
    const alterTableSQL = `
      -- Adicionar colunas de referência
      ALTER TABLE vehicle_sales 
      ADD COLUMN IF NOT EXISTS vehicle_id UUID,
      ADD COLUMN IF NOT EXISTS agency_id UUID,
      ADD COLUMN IF NOT EXISTS buyer_id UUID,
      ADD COLUMN IF NOT EXISTS seller_id UUID;
      
      -- Adicionar informações do veículo
      ALTER TABLE vehicle_sales 
      ADD COLUMN IF NOT EXISTS vehicle_title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS vehicle_brand VARCHAR(100),
      ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(100),
      ADD COLUMN IF NOT EXISTS vehicle_year INTEGER,
      ADD COLUMN IF NOT EXISTS vehicle_price DECIMAL(12,2);
      
      -- Adicionar informações financeiras
      ALTER TABLE vehicle_sales 
      ADD COLUMN IF NOT EXISTS sale_price DECIMAL(12,2),
      ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 5.00,
      ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(12,2);
      
      -- Adicionar informações do comprador
      ALTER TABLE vehicle_sales 
      ADD COLUMN IF NOT EXISTS buyer_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS buyer_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS buyer_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS buyer_document VARCHAR(20);
      
      -- Adicionar status e outras informações
      ALTER TABLE vehicle_sales 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente',
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS contract_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
      
      -- Adicionar timestamps
      ALTER TABLE vehicle_sales 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
    `
    
    console.log('📝 Executando ALTER TABLE...')
    const { data: alterData, error: alterError } = await supabase.rpc('exec_sql', {
      sql: alterTableSQL
    })
    
    if (alterError) {
      console.error('❌ Erro ao alterar tabela:', alterError)
      return
    }
    
    console.log('✅ Colunas adicionadas com sucesso')
    
    // Adicionar constraints e índices
    const constraintsSQL = `
      -- Adicionar constraints de check para status
      ALTER TABLE vehicle_sales 
      DROP CONSTRAINT IF EXISTS vehicle_sales_status_check;
      
      ALTER TABLE vehicle_sales 
      ADD CONSTRAINT vehicle_sales_status_check 
      CHECK (status IN ('pendente', 'negociacao', 'concluida', 'cancelada'));
      
      -- Criar índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_agency_id ON vehicle_sales(agency_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_seller_id ON vehicle_sales(seller_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_buyer_id ON vehicle_sales(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_status ON vehicle_sales(status);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_created_at ON vehicle_sales(created_at);
    `
    
    console.log('📝 Adicionando constraints e índices...')
    const { data: constraintsData, error: constraintsError } = await supabase.rpc('exec_sql', {
      sql: constraintsSQL
    })
    
    if (constraintsError) {
      console.error('❌ Erro ao adicionar constraints:', constraintsError)
    } else {
      console.log('✅ Constraints e índices adicionados')
    }
    
    // Criar função e trigger para updated_at
    const triggerSQL = `
      -- Criar função para atualizar updated_at automaticamente
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Criar trigger para atualizar updated_at
      DROP TRIGGER IF EXISTS update_vehicle_sales_updated_at ON vehicle_sales;
      CREATE TRIGGER update_vehicle_sales_updated_at
          BEFORE UPDATE ON vehicle_sales
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `
    
    console.log('📝 Criando trigger para updated_at...')
    const { data: triggerData, error: triggerError } = await supabase.rpc('exec_sql', {
      sql: triggerSQL
    })
    
    if (triggerError) {
      console.error('❌ Erro ao criar trigger:', triggerError)
    } else {
      console.log('✅ Trigger criado com sucesso')
    }
    
    // Verificar estrutura final
    console.log('\n🔍 Verificando estrutura final...')
    const { data: testData, error: testError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro ao testar tabela:', testError)
    } else {
      console.log('✅ Tabela vehicle_sales está funcionando')
      console.log('📊 Dados de teste:', testData)
    }
    
    // Testar inserção com dados completos
    console.log('\n🧪 Testando inserção com dados completos...')
    const testSale = {
      vehicle_id: '00000000-0000-0000-0000-000000000001',
      agency_id: '00000000-0000-0000-0000-000000000001',
      seller_id: '00000000-0000-0000-0000-000000000001',
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
      console.log('⚠️ Erro na inserção de teste (pode ser esperado se as FKs não existirem):', {
        message: insertError.message,
        code: insertError.code
      })
    } else {
      console.log('✅ Inserção de teste bem-sucedida:', insertData)
      
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

fixVehicleSalesTable()
  .then(() => {
    console.log('\n✅ Correção da tabela concluída')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro na correção:', error)
    process.exit(1)
  })