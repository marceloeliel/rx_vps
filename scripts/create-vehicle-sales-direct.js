require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createVehicleSalesTable() {
  try {
    console.log('🚀 Criando tabela vehicle_sales...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS vehicle_sales (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vehicle_id UUID,
        agency_id UUID NOT NULL,
        seller_id UUID,
        
        -- Informações do veículo no momento da venda
        vehicle_title VARCHAR(255) NOT NULL,
        vehicle_brand VARCHAR(100) NOT NULL,
        vehicle_model VARCHAR(100) NOT NULL,
        vehicle_year INTEGER NOT NULL,
        
        -- Informações financeiras
        sale_price DECIMAL(12,2) NOT NULL,
        commission_rate DECIMAL(5,2) DEFAULT 5.00,
        commission_amount DECIMAL(12,2),
        
        -- Informações do cliente
        buyer_name VARCHAR(255) NOT NULL,
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(20),
        buyer_document VARCHAR(20),
        
        -- Status da venda
        status VARCHAR(50) NOT NULL DEFAULT 'pendente',
        
        -- Informações adicionais
        notes TEXT,
        contract_url VARCHAR(500),
        payment_method VARCHAR(50),
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        
        -- Metadados
        metadata JSONB DEFAULT '{}'
      );
    `
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    })
    
    if (error) {
      console.log('❌ Erro ao criar tabela:', error)
      
      // Tentar método alternativo
      console.log('🔄 Tentando método alternativo...')
      
      const { data: result, error: error2 } = await supabase
        .from('vehicle_sales')
        .select('*')
        .limit(0)
      
      if (error2) {
        console.log('❌ Tabela não existe:', error2.message)
        console.log('\n📝 Execute este SQL manualmente no Supabase:')
        console.log(createTableSQL)
      } else {
        console.log('✅ Tabela já existe!')
      }
    } else {
      console.log('✅ Tabela criada com sucesso!')
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

createVehicleSalesTable()