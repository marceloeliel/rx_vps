const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' });

// Usar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createVehicleSalesTable() {
  try {
    console.log('🚀 Criando tabela vehicle_sales baseada na estrutura real...')
    
    // SQL adaptado para a estrutura real das tabelas
    const createTableSQL = `
      -- Criar tabela para vendas de veículos
      CREATE TABLE IF NOT EXISTS vehicle_sales (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
        agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        
        -- Informações do veículo no momento da venda (baseado na estrutura real)
        vehicle_title VARCHAR(255) NOT NULL,
        vehicle_brand VARCHAR(100) NOT NULL,
        vehicle_model VARCHAR(100) NOT NULL,
        vehicle_year INTEGER NOT NULL,
        vehicle_price DECIMAL(12,2) NOT NULL,
        
        -- Informações financeiras
        sale_price DECIMAL(12,2) NOT NULL,
        commission_rate DECIMAL(5,2) DEFAULT 5.00,
        commission_amount DECIMAL(12,2) NOT NULL,
        
        -- Informações do cliente (baseado na estrutura de profiles)
        buyer_name VARCHAR(255) NOT NULL,
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(20),
        buyer_document VARCHAR(20),
        
        -- Status da venda
        status VARCHAR(50) NOT NULL DEFAULT 'pendente' 
          CHECK (status IN ('pendente', 'negociacao', 'concluida', 'cancelada')),
        
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
      
      -- Criar índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_agency_id ON vehicle_sales(agency_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_seller_id ON vehicle_sales(seller_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_buyer_id ON vehicle_sales(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_status ON vehicle_sales(status);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_created_at ON vehicle_sales(created_at);
      
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
    `;
    
    console.log('📝 Executando SQL para criar tabela...')
    
    // Tentar usar diferentes métodos para executar o SQL
    try {
      // Método 1: Tentar usar rpc se existir
      const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });
      
      if (!rpcError) {
        console.log('✅ Tabela criada via RPC!')
        return;
      }
      
      console.log('⚠️ RPC não disponível, tentando método alternativo...');
      
    } catch (rpcErr) {
      console.log('⚠️ RPC falhou, tentando método alternativo...');
    }
    
    // Método 2: Criar usando inserção em uma tabela de comandos (se existir)
    console.log('🔄 Tentando criar tabela usando método alternativo...');
    
    // Vamos tentar verificar se podemos usar alguma função administrativa
    const { data: functionsData, error: functionsError } = await supabase
      .rpc('get_schema')
      .select('*');
    
    if (functionsError) {
      console.log('⚠️ Não foi possível acessar funções administrativas');
    }
    
    // Método 3: Informar ao usuário como criar manualmente
    console.log('\n📋 INSTRUÇÕES PARA CRIAR A TABELA MANUALMENTE:');
    console.log('\n1. Acesse o painel do Supabase:');
    console.log('   https://supabase.com/dashboard/project/ecdmpndeunbzhaihabvi');
    console.log('\n2. Vá em "SQL Editor"');
    console.log('\n3. Cole e execute o seguinte SQL:');
    console.log('\n' + '='.repeat(50));
    console.log(createTableSQL);
    console.log('='.repeat(50));
    
    // Salvar o SQL em um arquivo para facilitar
    const fs = require('fs');
    fs.writeFileSync('create-vehicle-sales-table-final.sql', createTableSQL);
    console.log('\n💾 SQL salvo em: create-vehicle-sales-table-final.sql');
    
  } catch (error) {
    console.error('❌ Erro durante criação:', error.message);
  }
}

createVehicleSalesTable()
  .then(() => {
    console.log('\n🎉 Processo concluído!');
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('1. Execute o SQL no painel do Supabase');
    console.log('2. Ou obtenha a service_role key para execução automática');
    console.log('3. Teste as funcionalidades de vendas');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });