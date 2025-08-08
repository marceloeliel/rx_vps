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

async function testAndCreateTable() {
  try {
    console.log('🔍 Verificando se a tabela vehicle_sales existe...')
    
    // Tentar fazer uma consulta simples na tabela
    const { data, error } = await supabase
      .from('vehicle_sales')
      .select('count', { count: 'exact', head: true })
    
    if (!error) {
      console.log('✅ Tabela vehicle_sales já existe!')
      console.log('📊 Dados encontrados:', data)
      return
    }
    
    console.log('⚠️ Tabela não existe. Erro:', error.message)
    
    // Se chegou aqui, a tabela não existe
    console.log('🚀 Tentando criar a tabela vehicle_sales...')
    
    // Vamos tentar verificar se temos permissões para criar tabelas
    // Primeiro, vamos ver que tabelas existem
    console.log('📋 Verificando tabelas existentes...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('⚠️ Não foi possível listar tabelas:', tablesError.message)
    } else {
      console.log('📋 Tabelas encontradas:', tables?.map(t => t.table_name) || [])
    }
    
    // Tentar verificar se a tabela veiculos existe (referência)
    const { data: veiculosData, error: veiculosError } = await supabase
      .from('veiculos')
      .select('count', { count: 'exact', head: true })
    
    if (!veiculosError) {
      console.log('✅ Tabela veiculos existe - podemos criar vehicle_sales')
    } else {
      console.log('⚠️ Tabela veiculos não encontrada:', veiculosError.message)
    }
    
    // Tentar verificar se a tabela profiles existe (referência)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    if (!profilesError) {
      console.log('✅ Tabela profiles existe - podemos criar vehicle_sales')
    } else {
      console.log('⚠️ Tabela profiles não encontrada:', profilesError.message)
    }
    
    console.log('\n📝 RESUMO:')
    console.log('- A tabela vehicle_sales não existe no banco de dados')
    console.log('- Você precisa criar a tabela manualmente no painel do Supabase')
    console.log('- Ou obter a chave service_role para executar DDL commands')
    
    console.log('\n🔧 PRÓXIMOS PASSOS:')
    console.log('1. Acesse https://supabase.com/dashboard/project/ecdmpndeunbzhaihabvi')
    console.log('2. Vá em "SQL Editor"')
    console.log('3. Execute o conteúdo do arquivo: supabase/migrations/create_vehicle_sales.sql')
    console.log('4. Ou obtenha a service_role key em Settings > API')
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message)
  }
}

testAndCreateTable()
  .then(() => {
    console.log('\n🎉 Verificação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })