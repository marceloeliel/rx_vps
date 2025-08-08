const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env' });

// Usar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias')
  process.exit(1)
}

async function createVehicleSalesTable() {
  try {
    console.log('🚀 Iniciando criação da tabela vehicle_sales via API REST...')
    
    // Ler o arquivo SQL da migração
    const sqlContent = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', 'create_vehicle_sales.sql'), 'utf8')
    
    console.log('📝 Executando SQL via API REST...')
    
    // Fazer requisição para a API REST do Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        sql: sqlContent
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const result = await response.json()
    console.log('✅ SQL executado com sucesso!')
    console.log('📊 Resultado:', result)
    
    // Verificar se a tabela foi criada
    console.log('🔍 Verificando se a tabela foi criada...')
    
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/vehicle_sales?select=count&limit=0`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      }
    })
    
    if (checkResponse.ok) {
      console.log('🎉 Tabela vehicle_sales criada e acessível!')
    } else {
      console.log('⚠️ Tabela pode não ter sido criada ou não está acessível')
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message)
    
    // Tentar abordagem alternativa - criar tabela simples primeiro
    console.log('🔄 Tentando abordagem alternativa...')
    
    try {
      const simpleSQL = `
        CREATE TABLE IF NOT EXISTS vehicle_sales (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          vehicle_id UUID,
          agency_id UUID,
          buyer_name VARCHAR(255),
          sale_price DECIMAL(12,2),
          status VARCHAR(50) DEFAULT 'pendente',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
      
      const altResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          sql: simpleSQL
        })
      })
      
      if (altResponse.ok) {
        console.log('✅ Tabela simples criada com sucesso!')
      } else {
        console.log('❌ Falha na abordagem alternativa também')
      }
      
    } catch (altError) {
      console.error('❌ Erro na abordagem alternativa:', altError.message)
    }
  }
}

createVehicleSalesTable()
  .then(() => {
    console.log('🎉 Script concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })