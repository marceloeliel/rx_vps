const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function addUnlimitedAccessColumn() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente SUPABASE não encontradas')
    console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🔄 Adicionando coluna unlimited_access na tabela profiles...')
    
    // Executar a migração SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Adicionar coluna unlimited_access na tabela profiles
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS unlimited_access BOOLEAN DEFAULT FALSE;
        
        -- Criar índice para melhor performance nas consultas
        CREATE INDEX IF NOT EXISTS idx_profiles_unlimited_access 
        ON profiles(unlimited_access);
      `
    })

    if (error) {
      console.error('❌ Erro ao executar migração:', error)
      
      // Tentar método alternativo usando SQL direto
      console.log('🔄 Tentando método alternativo...')
      
      const { error: altError } = await supabase
        .from('profiles')
        .select('unlimited_access')
        .limit(1)
      
      if (altError && altError.code === '42703') {
        console.log('✅ Confirmado: coluna unlimited_access não existe')
        console.log('📝 Execute manualmente no painel do Supabase:')
        console.log('ALTER TABLE profiles ADD COLUMN unlimited_access BOOLEAN DEFAULT FALSE;')
      } else {
        console.log('✅ Coluna unlimited_access já existe ou foi criada com sucesso')
      }
    } else {
      console.log('✅ Migração executada com sucesso!')
      console.log('Data:', data)
    }

    // Verificar se a coluna foi criada
    console.log('🔍 Verificando se a coluna foi criada...')
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, unlimited_access')
      .limit(1)

    if (testError) {
      if (testError.code === '42703') {
        console.log('❌ Coluna unlimited_access ainda não existe')
        console.log('📝 Execute manualmente no SQL Editor do Supabase:')
        console.log('ALTER TABLE profiles ADD COLUMN unlimited_access BOOLEAN DEFAULT FALSE;')
      } else {
        console.error('❌ Erro ao verificar coluna:', testError)
      }
    } else {
      console.log('✅ Coluna unlimited_access criada e funcionando!')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

addUnlimitedAccessColumn()