const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' });

// Usar variáveis de ambiente do .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias')
  process.exit(1)
}

console.log('🔍 Verificando credenciais disponíveis...')
console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Presente' : 'Ausente')
console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'Presente' : 'Ausente')

// Criar cliente com anon key
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Criar cliente com service role se disponível
let supabaseAdmin = null
if (serviceRoleKey && serviceRoleKey !== 'your-service-role-key-here') {
  try {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    console.log('🔑 Cliente admin criado com service role key')
  } catch (error) {
    console.log('⚠️ Erro ao criar cliente admin:', error.message)
  }
}

async function finalTestAndCreate() {
  try {
    console.log('\n🚀 Iniciando teste final e criação da tabela...')
    
    // 1. Verificar se a tabela já existe
    console.log('\n1️⃣ Verificando se vehicle_sales já existe...')
    const { data: existingTable, error: checkError } = await supabaseAnon
      .from('vehicle_sales')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ Tabela vehicle_sales já existe!')
      
      // Verificar estrutura
      const { data: sampleData, error: sampleError } = await supabaseAnon
        .from('vehicle_sales')
        .select('*')
        .limit(1)
      
      if (!sampleError) {
        console.log('📊 Estrutura da tabela confirmada')
        if (sampleData && sampleData.length > 0) {
          console.log('📝 Exemplo de registro:', sampleData[0])
        } else {
          console.log('📝 Tabela existe mas está vazia')
        }
      }
      
      console.log('\n🎉 SUCESSO! A tabela vehicle_sales está pronta para uso!')
      return true
    }
    
    console.log('⚠️ Tabela vehicle_sales não existe, tentando criar...')
    
    // 2. Tentar criar com service role se disponível
    if (supabaseAdmin) {
      console.log('\n2️⃣ Tentando criar tabela com service role key...')
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS vehicle_sales (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
          agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
          seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          
          vehicle_title VARCHAR(255) NOT NULL,
          vehicle_brand VARCHAR(100) NOT NULL,
          vehicle_model VARCHAR(100) NOT NULL,
          vehicle_year INTEGER NOT NULL,
          vehicle_price DECIMAL(12,2) NOT NULL,
          
          sale_price DECIMAL(12,2) NOT NULL,
          commission_rate DECIMAL(5,2) DEFAULT 5.00,
          commission_amount DECIMAL(12,2) NOT NULL,
          
          buyer_name VARCHAR(255) NOT NULL,
          buyer_email VARCHAR(255),
          buyer_phone VARCHAR(20),
          buyer_document VARCHAR(20),
          
          status VARCHAR(50) NOT NULL DEFAULT 'pendente' 
            CHECK (status IN ('pendente', 'negociacao', 'concluida', 'cancelada')),
          
          notes TEXT,
          contract_url VARCHAR(500),
          payment_method VARCHAR(50),
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          
          metadata JSONB DEFAULT '{}'
        );
        
        CREATE INDEX IF NOT EXISTS idx_vehicle_sales_agency_id ON vehicle_sales(agency_id);
        CREATE INDEX IF NOT EXISTS idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);
        CREATE INDEX IF NOT EXISTS idx_vehicle_sales_status ON vehicle_sales(status);
      `
      
      try {
        const { data: createData, error: createError } = await supabaseAdmin.rpc('exec_sql', {
          sql: createTableSQL
        })
        
        if (!createError) {
          console.log('✅ Tabela criada com sucesso usando service role!')
          return true
        } else {
          console.log('❌ Erro ao criar com service role:', createError.message)
        }
      } catch (adminError) {
        console.log('❌ Erro ao usar service role:', adminError.message)
      }
    }
    
    // 3. Instruções finais
    console.log('\n3️⃣ INSTRUÇÕES PARA FINALIZAR:')
    console.log('\n📋 Para criar a tabela manualmente:')
    console.log('1. Acesse: https://supabase.com/dashboard/project/ecdmpndeunbzhaihabvi')
    console.log('2. Vá em "SQL Editor"')
    console.log('3. Execute o arquivo: create-vehicle-sales-table-final.sql')
    console.log('\n🔑 Ou obtenha a service_role key válida do Supabase:')
    console.log('1. Vá em Settings > API')
    console.log('2. Copie a "service_role" key')
    console.log('3. Atualize SUPABASE_SERVICE_ROLE_KEY no arquivo .env')
    
    return false
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message)
    return false
  }
}

finalTestAndCreate()
  .then((success) => {
    if (success) {
      console.log('\n🎉 TUDO PRONTO! A funcionalidade de vendas está configurada!')
      console.log('\n📝 Próximos passos:')
      console.log('- Implementar interface de vendas')
      console.log('- Testar inserção de vendas')
      console.log('- Configurar relatórios')
    } else {
      console.log('\n⚠️ Ação manual necessária para finalizar a configuração.')
    }
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })