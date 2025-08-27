const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase (usando as credenciais diretamente)
const supabaseUrl = 'https://ecdmpndeunbzhaihabvi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTables() {
  console.log('🔍 Testando conexão com Supabase...')

  try {
    // Testar tabela dados_agencia com select *
    console.log('\n📋 Testando tabela dados_agencia...')
    const { data: agenciesData, error: agenciesError } = await supabase
      .from('dados_agencia')
      .select('*')
      .limit(3)

    if (agenciesError) {
      console.log('❌ Erro na tabela dados_agencia:', agenciesError.message)
    } else {
      console.log('✅ Tabela dados_agencia existe')
      console.log('📊 Registros encontrados:', agenciesData?.length || 0)
      if (agenciesData && agenciesData.length > 0) {
        console.log('📝 Estrutura da tabela (primeiro registro):')
        console.log('🔑 Colunas disponíveis:', Object.keys(agenciesData[0]))
        console.log('📄 Dados:', agenciesData[0])
      } else {
        console.log('📝 Tabela vazia - sem registros')
      }
    }

    // Testar tabela profiles com select *
    console.log('\n👤 Testando tabela profiles...')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3)

    if (profilesError) {
      console.log('❌ Erro na tabela profiles:', profilesError.message)
    } else {
      console.log('✅ Tabela profiles existe')
      console.log('📊 Registros encontrados:', profilesData?.length || 0)
      if (profilesData && profilesData.length > 0) {
        console.log('📝 Estrutura da tabela (primeiro registro):')
        console.log('🔑 Colunas disponíveis:', Object.keys(profilesData[0]))
        console.log('📄 Dados:', profilesData[0])
      } else {
        console.log('📝 Tabela vazia - sem registros')
      }
    }

    // Testar tabela admin_users
    console.log('\n🔐 Testando tabela admin_users...')
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(3)

    if (adminError) {
      console.log('❌ Erro na tabela admin_users:', adminError.message)
    } else {
      console.log('✅ Tabela admin_users existe')
      console.log('📊 Registros encontrados:', adminData?.length || 0)
      if (adminData && adminData.length > 0) {
        console.log('📝 Estrutura da tabela (primeiro registro):')
        console.log('🔑 Colunas disponíveis:', Object.keys(adminData[0]))
        console.log('📄 Dados:', adminData[0])
      } else {
        console.log('📝 Tabela vazia - sem registros')
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

testTables()